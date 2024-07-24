FROM docker/compose:1.29.2

COPY . .

CMD ["docker-compose", "up"]
