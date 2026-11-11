FROM ubuntu:24.04 AS base

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install mise
RUN curl -fsSL https://mise.run | sh -s -- --yes
ENV PATH="/root/.local/share/mise/shims:/root/.local/bin:${PATH}"

# Install Java via mise
RUN mise use -g java@temurin-21

FROM base AS build
WORKDIR /app

# Install Maven via mise
RUN mise use -g maven@3.9

COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
