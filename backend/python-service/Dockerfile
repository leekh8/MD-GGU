# 빌드 단계
FROM python:3.9-slim-buster AS build

WORKDIR /app

# 패키지 설치
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# 딥러닝 모델 복사
COPY nickname_generator.keras /app/nickname_generator.keras

# 실행 단계
FROM python:3.9-slim-buster

WORKDIR /app

# # 실행 단계에서만 필요한 폰트 설치
# RUN apt-get update && apt-get install -y --no-install-recommends fonts-nanum && rm -rf /var/lib/apt/lists/*

# 빌드 단계의 모델 복사
COPY --from=build /app/nickname_generator.keras /app/nickname_generator.keras

# 소스 코드 복사
COPY . .

EXPOSE 5000

# gunicorn 실행
CMD ["gunicorn", "--workers", "3", "--bind", "0.0.0.0:5000", "app:app"]
