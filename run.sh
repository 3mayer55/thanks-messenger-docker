#!/usr/bin/env bash
set -e
docker compose up -d --build
echo "Local:  http://localhost:3000"
echo "Waiting for public tunnel link..."
for i in $(seq 1 30); do
  URL=$(docker compose logs tunnel 2>&1 | grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' | tail -1)
  [ -n "$URL" ] && { echo "Share this link with friends: $URL"; exit 0; }
  sleep 2
done
echo "Tunnel not ready yet. Run: docker compose logs tunnel"
