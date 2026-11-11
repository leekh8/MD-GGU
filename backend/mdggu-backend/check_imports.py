# 쓰는데 import 가 없는 타입을 찾는다.
#
# 🛑 MDGGU-back 이 2년간 Failed deploy 였던 원인이 이것 하나였다.
#    AuthController 가 `HttpServletResponse` 는 import 하고
#    `HttpServletRequest` 는 안 했다. 바로 옆 줄이라 눈으로는 멀쩡해 보인다.
#    컴파일해야 보이는데, 컴파일이 배포에서만 돌고 있었다.
#
#    그래서 같은 종류가 더 있는지 **전수로** 센다. 컴파일러 없이,
#    같은 꼴의 누락만 본다.
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent / "src"

# 이 타입들은 반드시 import 가 있어야 한다 (java.lang 이 아니다).
# 패키지는 Spring Boot 3 기준 jakarta.* 다 (javax.* 가 아니다).
WANT = {
    "HttpServletRequest": "jakarta.servlet.http.HttpServletRequest",
    "HttpServletResponse": "jakarta.servlet.http.HttpServletResponse",
    "HttpSession": "jakarta.servlet.http.HttpSession",
    "Cookie": "jakarta.servlet.http.Cookie",
    "FilterChain": "jakarta.servlet.FilterChain",
    "ServletException": "jakarta.servlet.ServletException",
    "IOException": "java.io.IOException",
    "List": "java.util.List",
    "Map": "java.util.Map",
    "Optional": "java.util.Optional",
    "Arrays": "java.util.Arrays",
    "Collectors": "java.util.stream.Collectors",
}

bad = []
files = sorted(ROOT.rglob("*.java"))
for f in files:
    src = f.read_text(encoding="utf-8")
    # 주석과 글자 리터럴을 떼어 낸다 (주석에 적힌 타입 이름에 걸리지 않게)
    body = re.sub(r"/\*.*?\*/", " ", src, flags=re.S)
    body = re.sub(r"//[^\n]*", " ", body)
    body = re.sub(r'"(?:\\.|[^"\\])*"', '""', body)

    imports = set(re.findall(r"^\s*import\s+(?:static\s+)?([\w.*]+)\s*;", body, re.M))
    star = {i[:-2] for i in imports if i.endswith(".*")}
    named = {i.rsplit(".", 1)[-1] for i in imports if not i.endswith(".*")}

    for typ, full in WANT.items():
        # 🛑 **완전 수식한 것은 import 가 필요 없다.** `java.util.List<String>`
        #    의 꼬리에 `\bList\b` 가 걸려 오탐이 났다(OptimizeController).
        #    앞에 점이 붙은 것은 세지 않는다.
        if not re.search(rf"(?<![.\w]){typ}\b", body):
            continue
        if typ in named:
            continue
        pkg = full.rsplit(".", 1)[0]
        if pkg in star:
            continue
        # 같은 패키지에 그 이름의 파일이 있으면 import 가 필요 없다
        if (f.parent / f"{typ}.java").exists():
            continue
        bad.append((f.relative_to(ROOT).as_posix(), typ, full))

print(f"java 파일 {len(files)}개 검사")
if bad:
    print(f"\n🛑 쓰는데 import 가 없다: {len(bad)}건")
    for path, typ, full in bad:
        print(f"  {path}")
        print(f"    {typ}  ->  import {full};")
else:
    print("\nimport 누락 0건")

# javax.* 가 남아 있으면 Spring Boot 3 에서 안 돈다
javax = []
for f in files:
    for m in re.finditer(r"^\s*import\s+(javax\.(?:servlet|persistence|validation)[\w.*]*)\s*;",
                         f.read_text(encoding="utf-8"), re.M):
        javax.append((f.relative_to(ROOT).as_posix(), m.group(1)))
if javax:
    print(f"\n🛑 javax.* 가 남아 있다 (Spring Boot 3 은 jakarta.* 다): {len(javax)}건")
    for path, imp in javax:
        print(f"  {path}: {imp}")
else:
    print("javax.* 잔재 0건")

sys.exit(1 if (bad or javax) else 0)
