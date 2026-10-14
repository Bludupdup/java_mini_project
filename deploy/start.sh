#!/bin/bash
# Starts the Spring Boot backend and the Node server side by side.
# If either one stops, the container stops too, and Render restarts it.

# The free plan has 512 MB of memory for both, so Java gets a small, fixed budget.
JAVA_OPTS="${JAVA_OPTS:--Xmx200m -Xss512k -XX:MaxMetaspaceSize=128m -XX:ReservedCodeCacheSize=48m -XX:+UseSerialGC -XX:TieredStopAtLevel=1}"

# The backend listens only inside the container; the Node server is the front door.
java $JAVA_OPTS -jar /app/backend.jar \
  --server.address=127.0.0.1 \
  --server.port=8080 \
  --server.tomcat.threads.max=20 &
JAVA_PID=$!

# Open the front door only once Spring Boot answers (it takes about a minute
# on the free plan). Until then Render keeps the visitor on its own "waking
# up" screen, instead of showing the app with "still starting up" errors.
until (exec 3<>/dev/tcp/127.0.0.1/8080) 2>/dev/null; do
  if ! kill -0 "$JAVA_PID" 2>/dev/null; then
    echo "[start] the backend stopped before it was ready"
    exit 1
  fi
  sleep 1
done
echo "[start] backend is up, starting the web server"

BACKEND_URL=http://127.0.0.1:8080 node /app/server/prodServer.js &

# Wait until either process exits, then stop with its exit code.
wait -n
exit $?
