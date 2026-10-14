# The whole app in one container: Spring Boot (Java) + the Node server that
# serves the React app and the AI visualizations. Used by Render (render.yaml).
#
# Build:  docker build -t dsa-universe .
# Run:    docker run -p 10000:10000 -e DB_URL=... -e DB_USERNAME=... -e DB_PASSWORD=... dsa-universe

# ---- 1. Build the React app ------------------------------------------------
FROM node:24-bookworm-slim AS frontend
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY index.html vite.config.js ./
COPY public ./public
COPY server ./server
COPY src ./src
RUN npm run build

# ---- 2. Build the Spring Boot jar ------------------------------------------
FROM eclipse-temurin:17-jdk AS backend
WORKDIR /build
COPY learning-platform-backend-java/.mvn ./.mvn
COPY learning-platform-backend-java/mvnw learning-platform-backend-java/pom.xml ./
# Download dependencies first, so code changes don't download them again.
RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline
COPY learning-platform-backend-java/src ./src
# Tests need a PostgreSQL database, so they run on your computer, not here.
RUN ./mvnw -B -q package -DskipTests && cp target/learning-platform-backend-*.jar /build/backend.jar

# ---- 3. The image that runs ------------------------------------------------
FROM node:24-bookworm-slim
COPY --from=eclipse-temurin:17-jre /opt/java/openjdk /opt/java/openjdk
ENV JAVA_HOME=/opt/java/openjdk \
    PATH="/opt/java/openjdk/bin:${PATH}" \
    NODE_ENV=production \
    PORT=10000

WORKDIR /app
COPY --from=backend /build/backend.jar ./backend.jar
COPY --from=frontend /build/dist ./dist
# The Node server and the analyzer it imports (no npm packages needed).
COPY server ./server
COPY src/pages/service ./src/pages/service
COPY deploy/start.sh ./start.sh
RUN chmod +x start.sh

# Run as a normal user, not root.
USER node
EXPOSE 10000
CMD ["./start.sh"]
