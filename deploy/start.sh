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

BACKEND_URL=http://127.0.0.1:8080 node /app/server/prodServer.js &

# Wait until either process exits, then stop with its exit code.
wait -n
exit $?
