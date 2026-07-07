# DNS: Cloudflare → OpenSRS

Панель регистратора: [manage.opensrs.net](https://manage.opensrs.net/index.cgi)

## 1. Сохранить записи из Cloudflare

В Cloudflare → **DNS** → экспортируйте или скопируйте все записи (особенно **MX**, **TXT/SPF**, **DKIM** для почты `admin@nordlab.net`).

## 2. Вернуть DNS на OpenSRS

Если домен сейчас на NS Cloudflare (`*.ns.cloudflare.com`):

1. OpenSRS → **Manage Your Domain** → `nordlab.net`
2. **Nameservers** → вернуть DNS OpenSRS (обычно `ns1.systemdns.com` / `ns2.systemdns.com` или те, что указаны в панели OpenSRS для вашего аккаунта)
3. Дождаться делегирования (до 24–48 ч, часто 1–2 ч)

Если NS уже OpenSRS, а записи правились только в Cloudflare — просто добавьте записи ниже в **DNS Settings** OpenSRS.

## 3. Записи для сайта на VPS (замените `YOUR_SERVER_IP`)

| Тип | Host / Name | Value | TTL |
|-----|-------------|-------|-----|
| **A** | `@` (nordlab.net) | `213.171.29.225` | 3600 |
| **A** | `www` | `213.171.29.225` | 3600 |
| **A** | `pay` | `213.171.29.225` | 3600 |

`pay.nordlab.net` обслуживается тем же приложением (middleware перенаправляет на `/activate`).

## 4. Почта Zoho (если используете admin@nordlab.net)

Типичные записи Zoho Mail (проверьте актуальные в панели Zoho):

| Тип | Host | Value |
|-----|------|-------|
| **MX** | `@` | `mx.zoho.com` (priority 10) |
| **MX** | `@` | `mx2.zoho.com` (priority 20) |
| **MX** | `@` | `mx3.zoho.com` (priority 50) |
| **TXT** | `@` | `v=spf1 include:zoho.com ~all` |
| **TXT** | `zmail._domainkey` | *(DKIM из Zoho)* |

## 5. Отключить Cloudflare proxy

После переноса DNS **не** используйте оранжевое облако Cloudflare — записи должны указывать напрямую на IP VPS (серое «DNS only» в CF или полный уход с NS Cloudflare).

## 6. Проверка

```bash
dig +short nordlab.net A
dig +short www.nordlab.net A
dig +short pay.nordlab.net A
dig +short nordlab.net MX
```

Все A-записи должны показывать IP вашего российского сервера.

## 7. SSL на сервере

После того как A-записи указывают на VPS:

```bash
sudo certbot --nginx -d nordlab.net -d www.nordlab.net -d pay.nordlab.net
```
