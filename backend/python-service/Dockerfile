FROM python:3.9-slim-buster
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends fonts-nanum && \ rm -rf /var/lib/apt/lists/*
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "--workers", "3", "--bind", "0.0.0.0:5000", "app:app"]
