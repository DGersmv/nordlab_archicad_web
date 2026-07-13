#!/usr/bin/env bash
# Daily trial download report. Install on VPS:
#   crontab -e
#   0 8 * * * cd /var/www/nordlab && /usr/bin/node scripts/send-download-report.mjs >> /var/log/nordlab-download-report.log 2>&1

set -euo pipefail
cd "$(dirname "$0")/.."
node scripts/send-download-report.mjs
