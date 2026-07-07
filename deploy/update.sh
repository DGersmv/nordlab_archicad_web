#!/usr/bin/env bash
set -euo pipefail
cd /var/www/nordlab
git pull origin main
npm ci
npm run build
pm2 restart nordlab
echo "Nordlab updated. Check: curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3001/"
