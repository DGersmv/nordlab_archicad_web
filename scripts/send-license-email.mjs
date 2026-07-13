import fs from 'node:fs'
import path from 'node:path'
import nodemailer from 'nodemailer'

function loadEnv(filePath) {
  const env = {}
  const raw = fs.readFileSync(filePath, 'utf8')
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const index = trimmed.indexOf('=')
    if (index === -1) continue
    env[trimmed.slice(0, index)] = trimmed.slice(index + 1)
  }
  return env
}

async function main() {
  const env = loadEnv(path.join(process.cwd(), '.env'))
  const host = env.SMTP_HOST || 'smtp.zoho.com'
  const port = Number(env.SMTP_PORT || '465')
  const user = env.SMTP_USER
  const pass = env.SMTP_PASS
  const from = env.SMTP_FROM?.trim() || user
  const to = '2277277@bk.ru'
  const licenseKey = 'TS27-FC7ED4F1-FC7ECFD8'
  const machineId = 'TS1-2505-CAB3-CC66'

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: { user, pass },
    tls: { minVersion: 'TLSv1.2' },
  })

  await transporter.sendMail({
    from,
    to,
    subject: 'Nordlab — лицензия TableSet',
    text: [
      'Спасибо за оплату!',
      '',
      'Плагин: TableSet',
      `Machine ID: ${machineId}`,
      `Ключ лицензии: ${licenseKey}`,
      '',
      'Откройте палитру плагина в Archicad и вставьте ключ в поле активации.',
      '',
      'Если нужна помощь: admin@nordlab.net',
    ].join('\n'),
  })

  console.log('EMAIL_SENT=' + to)
}

main().catch((error) => {
  console.error(String(error))
  process.exit(1)
})
