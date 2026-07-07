# Деплой Nordlab на VPS (Россия)

Next.js с API-роутами (`/api/contact`, `/api/plugin-order`) — нужен **Node.js-сервер**, не статический хостинг.

Рекомендуемый минимум: **1 vCPU, 1 GB RAM, Ubuntu 22.04/24.04** (Timeweb, Selectel, REG.RU, Beget VPS и т.д.).

## Быстрый старт

### На сервере (один раз)

```bash
sudo apt update && sudo apt install -y git docker.io docker-compose-plugin nginx certbot python3-certbot-nginx
sudo usermod -aG docker $USER
# перелогиниться

sudo mkdir -p /var/www/nordlab
sudo chown $USER:$USER /var/www/nordlab
cd /var/www/nordlab

git clone https://github.com/DGersmv/nordlab_archicad_web.git .
cp .env.example .env
nano .env   # SMTP_PASS, TELEGRAM_*, LICENSE_ADMIN_SECRET, Turnstile (опционально)
```

### Запуск приложения

```bash
cd /var/www/nordlab
docker compose build
docker compose up -d
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/
# ожидается 200 или 307
```

### Nginx

```bash
sudo cp deploy/nginx/nordlab.conf /etc/nginx/sites-available/nordlab
sudo ln -sf /etc/nginx/sites-available/nordlab /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Временно закомментируйте блок `listen 443` и редирект с 80, если сертификата ещё нет — или сразу:

```bash
sudo certbot --nginx -d nordlab.net -d www.nordlab.net -d pay.nordlab.net
```

### Обновление после push в GitHub

```bash
cd /var/www/nordlab
git pull
docker compose build --no-cache
docker compose up -d
```

## Переменные окружения (.env)

| Переменная | Назначение |
|------------|------------|
| `SMTP_*` | Письма с форм (Zoho) |
| `TELEGRAM_*` | Уведомления в Telegram |
| `LICENSE_ADMIN_SECRET` | API генерации ключей |
| `TURNSTILE_*` | Капча (опционально; без ключей работает honeypot) |

## DNS

См. [DNS-OPENSRS.md](./DNS-OPENSRS.md) — перенос с Cloudflare на [OpenSRS](https://manage.opensrs.net/index.cgi).

## Отключить Vercel

1. Vercel → Project → Settings → Domains → удалить `nordlab.net`, `www`, `pay`
2. Иначе возможен конфликт, пока NS ещё указывают на Vercel

## Turnstile без Cloudflare CDN

Виджет Turnstile (`challenges.cloudflare.com`) может работать и с российского VPS — это отдельный сервис. Если капча не грузится в РФ, оставьте `TURNSTILE_*` пустыми — формы работают с honeypot.
