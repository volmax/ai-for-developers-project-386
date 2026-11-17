# Stage 1: Build backend
FROM ubuntu:24.04 AS build-backend

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# hadolint ignore=DL3008
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && curl -fsSL https://mise.run | sh -s -- --yes

ENV PATH="/root/.local/share/mise/shims:/root/.local/bin:${PATH}"

RUN mise use -g java@temurin-21 && mise use -g maven@3.9

WORKDIR /app/backend
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B
COPY backend/src ./src
RUN mvn package -DskipTests -B

# Stage 2: Generate typespec client types
FROM node:22-alpine AS build-typespec

WORKDIR /app/typespec
COPY typespec/package.json typespec/package-lock.json ./
RUN npm ci --no-audit
COPY typespec .
RUN npm run compile && npm run generate-client

# Stage 3: Build frontend
FROM node:22-alpine AS build-frontend

WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit
COPY frontend .
COPY --from=build-typespec /app/typespec/generated ./typespec/generated
RUN npm run build

# Stage 4: Final image
FROM nginx:alpine

# Install Java JRE
# hadolint ignore=DL3018
RUN apk add --no-cache openjdk21

WORKDIR /app

# Copy frontend build output
COPY --from=build-frontend /app/frontend/dist /usr/share/nginx/html

# Copy backend jar
COPY --from=build-backend /app/backend/target/*.jar /app.jar

# Copy nginx config as template
COPY nginx-docker.conf /etc/nginx/conf.d/default.conf.template

# Install envsubst for PORT substitution
RUN apk add --no-cache gettext

ENV PORT=80

EXPOSE $PORT 8081

# Wait for backend to become healthy before starting nginx
# hadolint ignore=DL3025
CMD sh -c 'envsubst < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && java -jar /app.jar --server.port=8081 & for i in $(seq 1 60); do wget -q -O /dev/null http://localhost:8081/actuator/health && break; sleep 1; done; nginx -g "daemon off;"'

# hadolint ignore=DL3025
HEALTHCHECK --interval=5s --timeout=3s --start-period=10s --retries=3 CMD curl -sf http://localhost:${PORT}/ || exit 1
