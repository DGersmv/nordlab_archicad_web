#!/bin/bash
set -euo pipefail
cd /var/www/nordlab
tar -xf /tmp/nordlab-obj.tar
rm -f /tmp/nordlab-obj.tar

if ! grep -q '^CABINET_OBJECT_PRICE_RUB=' .env; then
  cat >> .env <<EOF

CABINET_OBJECT_PRICE_RUB=2500
CABINET_OBJECT_RENEW_PRICE_RUB=500
CABINET_OBJECT_STORAGE_MONTHS=12
CABINET_OBJECT_READONLY_MONTHS=6
CABINET_OBJECT_DELETE_WARN_DAYS=30
CABINET_OBJECT_STORAGE_GB=10
EOF
fi

npx prisma migrate deploy
npx prisma generate
npm run build
pm2 restart nordlab --update-env
curl -s -o /dev/null -w "register:%{http_code}\n" http://127.0.0.1:3001/ru/register
curl -s -o /dev/null -w "cabinet:%{http_code}\n" http://127.0.0.1:3001/ru/cabinet
echo DEPLOY_OK
