# 빌드 단계
FROM python:3.9-slim-buster AS build

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends fonts-nanum && rm -rf /var/lib/apt/lists/*

COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# 딥러닝 모델 복사
COPY nickname_generator.keras nickname_generator.keras

# 실행 단계
FROM python:3.9-slim-buster

WORKDIR /app

COPY --from=build /app/nickname_generator.keras /app/

COPY . .

EXPOSE 5000

CMD ["gunicorn", "--workers", "3", "--bind", "0.0.0.0:5000", "app:app"]
