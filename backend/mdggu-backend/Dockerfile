# Build 단계
FROM maven:3.8.1-openjdk-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run 단계
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=builder /app/target/mdggu-backend-1.0-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
