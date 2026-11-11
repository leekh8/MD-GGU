# 🛑 **2026-11-11 까지 Render 의 MDGGU-back 이 Failed deploy 였다** (2년).
#    정적으로 짚은 원인 셋을 아래에 적어 둔다.

# ----------------------------------------------------------------- 1. 빌드
FROM gradle:7.5.1-jdk17 AS builder
WORKDIR /app

# 🛑 `settings.gradle` 을 **같이 넣는다.** 빠뜨리면 Gradle 이 폴더 이름(`app`)을
#    프로젝트 이름으로 써서 jar 이름이 로컬과 달라진다.
COPY settings.gradle build.gradle ./
COPY src ./src

# 🛑 **`build` 가 아니라 `bootJar` 다.**
#    `gradle build` 는 테스트를 돈다. 이 프로젝트에는 테스트가 셋 있고
#    (AuthControllerTest, DocumentControllerTest, UserServiceTest) 스프링
#    컨텍스트와 DB 설정을 요구한다. 배포 빌드에 DB 가 없으니 거기서 죽는다.
#    테스트는 CI 가 돌 일이고, 이미지 빌드가 할 일은 실행 가능한 jar 하나다.
RUN gradle bootJar --no-daemon

# 🛑 **jar 가 하나인지 센다.** `jar { enabled = false }` 를 빼면 plain jar 가
#    같이 생기고, 그러면 아래 `COPY ... *.jar` 가 둘을 잡아
#      "When using COPY with more than one source file,
#       the destination must be a directory and end with a /"
#    로 죽는다. 그 실패는 빌드 로그 끝에서야 보이므로 여기서 먼저 센다.
RUN set -eu; \
    n=$(ls -1 build/libs/*.jar | wc -l); \
    echo "build/libs 의 jar $n개:"; ls -1 build/libs/; \
    if [ "$n" -ne 1 ]; then \
      echo "jar 가 하나가 아니다. build.gradle 의 jar { enabled = false } 를 본다."; \
      exit 1; \
    fi

# --------------------------------------------------------------- 2. 실행
# 🛑 `openjdk:17-jdk-slim` 에서 바꿨다. Docker Hub 의 `openjdk` 이미지는
#    2023 에 **더 이상 관리하지 않는다**고 공지됐고 태그가 정리됐다. 2년 전에
#    되던 빌드가 지금 안 되는 이유로 충분히 가능한 자리다.
#    `eclipse-temurin` 이 그 자리를 이어받은 공식 배포본이고, 실행만 하니
#    `jre` 로 충분하다 (이미지가 작아진다).
FROM eclipse-temurin:17-jre
WORKDIR /app

# 🛑 루트로 돌리지 않는다. 터지는 길이 있을 때 피해 범위가 달라진다.
RUN useradd --system --create-home --shell /usr/sbin/nologin spring
USER spring

COPY --from=builder /app/build/libs/*.jar app.jar

# Render 는 PORT 를 넣어 준다. 없으면 8080 (compose, 로컬 기준)
ENV PORT=8080
EXPOSE 8080

# 🛑 `$PORT` 를 쓰려면 셸이 필요하다. exec 꼴로 두면 글자 그대로 넘어간다.
#    `exec` 를 붙여 java 가 PID 1 이 되게 한다 - 안 그러면 SIGTERM 이
#    java 에 닿지 않아 배포할 때마다 강제 종료를 기다린다.
ENTRYPOINT ["sh", "-c", "exec java -Dserver.port=${PORT} -jar app.jar"]
