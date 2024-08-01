# Build 단계
FROM gradle:7.5.1-jdk17 AS builder
WORKDIR /app
COPY build.gradle ./
COPY src ./src
RUN gradle build --no-daemon

# Run 단계
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=builder /app/build/libs/mdggu-backend-1.0-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
