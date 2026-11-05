FROM ubuntu:24.04 AS base

# Install mise
RUN curl -fsSL https://mise.run | sh -s -- --yes
ENV PATH="/root/.local/bin:${PATH}"

# Install Java via mise
RUN mise install java@temurin@21

FROM base AS build
WORKDIR /app

# Install Maven via mise
RUN mise install maven@3.9

COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
