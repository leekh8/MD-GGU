# 🛑 **2026-11-11 까지 Render 의 MDGGU-python-service 가 Failed deploy 였다**
#    (11개월). 원인은 다단계가 거꾸로 되어 있던 것이다.
#
#    전 판은 1단계(`AS build`)에서 `pip install` 을 하고, 2단계에서는
#    `nickname_generator.keras` **하나만** 가져왔다. pip 가 깐 꾸러미는
#    1단계의 `site-packages` 에 있고 2단계로 넘어오지 않는다. 그래서 실행
#    이미지에 `gunicorn` 도 `flask` 도 없었고 `CMD` 가 바로 죽었다.
#
#    더구나 그 `.keras` 는 2단계의 `COPY . .` 로도 어차피 들어온다. 다단계가
#    하는 일이 없는데 의존성만 버리고 있었다.
#
#    꾸러미를 나르려면 `--prefix` 로 한 곳에 모아 그 폴더를 옮겨야 한다.
#    여기서는 그렇게 한다.

# ----------------------------------------------------------------- 1. 빌드
# 🛑 `python:3.9-slim-buster` 에서 바꿨다. Debian **buster** 는 지원이 끝나
#    보안 갱신이 안 오고 `apt-get update` 도 깨진다.
#    3.11 인 까닭은 requirements.txt 의 tensorflow-cpu 2.15 가 받는 범위다.
FROM python:3.11-slim AS build
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# --------------------------------------------------------------- 2. 실행
FROM python:3.11-slim
WORKDIR /app

# 🛑 1단계에서 모아 둔 꾸러미를 가져온다. 이 줄이 빠져 있던 것이 실패 원인이다
COPY --from=build /install /usr/local

COPY . .

# 🛑 **빌드에서 「돌 수 있나」를 확인한다.**
#
#    처음에는 여기서 모델 로드를 확인했다. 그런데 그것은 **지금 통과할 수 없는
#    검사**였다. 토크나이저 pkl 이 저장소에 없고, 모델은 Keras 3 으로 저장돼
#    있어 TF 2.15(Keras 2)로는 읽히지도 않는다(까닭은 requirements.txt).
#    통과할 수 없는 것을 막아 두면 배포가 영원히 안 된다 - 그건 지키는 것이
#    아니라 멈춰 세우는 것이다.
#
#    그래서 **지금 돌아야 하는 것**을 센다.
#      ① app.py 가 import 되나        (여기서 죽으면 서비스가 안 뜬다)
#      ② 마르코프 방식이 글자를 내나   (지금 쓸 수 있는 유일한 방식)
#      ③ /health 가 상태를 말하나      (밖에서 볼 길)
#
#    ①은 2년 동안 깨져 있던 자리다(존재하지 않는 이름을 import 했다).
#    그걸 다시 깨뜨리면 여기서 걸린다.
RUN python -c "import app, nickname_generator as ng; \
n = ng.generate_nickname('markov_chain'); \
assert isinstance(n, str) and n, f'마르코프가 글자를 안 냈다: {n!r}'; \
print('markov OK:', n); \
c = app.app.test_client(); \
r = c.get('/health'); \
assert r.status_code == 200, f'/health 가 {r.status_code}'; \
print('health OK:', r.get_json())"

# 루트로 돌리지 않는다
RUN useradd --system --create-home --shell /usr/sbin/nologin flaskapp
USER flaskapp

ENV PORT=5000
EXPOSE 5000

# 🛑 `$PORT` 를 쓰려면 셸이 필요하다. Render 는 PORT 를 넣어 준다.
#    `exec` 로 gunicorn 이 PID 1 이 되게 한다 (SIGTERM 이 닿는다).
CMD ["sh", "-c", "exec gunicorn --workers 2 --threads 4 --timeout 120 --bind 0.0.0.0:${PORT} app:app"]
