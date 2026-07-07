#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
git pull origin main
docker compose build
docker compose up -d
docker image prune -f
echo "Nordlab updated. Check: curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/"
