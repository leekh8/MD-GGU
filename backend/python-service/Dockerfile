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

# 🛑 **모델이 실제로 읽히는지 빌드에서 확인한다.** TensorFlow 판과 모델 저장
#    판이 어긋나면 로드만 실패하는데, 그러면 컨테이너는 뜨고 요청할 때마다
#    500 이 난다. 「배포 성공인데 안 되는」 꼴이라 여기서 먼저 막는다.
RUN python -c "import tensorflow as tf, os; \
m = 'nickname_generator.keras'; \
print('tensorflow', tf.__version__); \
print('모델', m, os.path.getsize(m), 'bytes'); \
tf.keras.models.load_model(m); \
print('모델 로드 OK')"

# 루트로 돌리지 않는다
RUN useradd --system --create-home --shell /usr/sbin/nologin flaskapp
USER flaskapp

ENV PORT=5000
EXPOSE 5000

# 🛑 `$PORT` 를 쓰려면 셸이 필요하다. Render 는 PORT 를 넣어 준다.
#    `exec` 로 gunicorn 이 PID 1 이 되게 한다 (SIGTERM 이 닿는다).
CMD ["sh", "-c", "exec gunicorn --workers 2 --threads 4 --timeout 120 --bind 0.0.0.0:${PORT} app:app"]
