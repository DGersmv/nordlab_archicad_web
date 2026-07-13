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
  const envPath = path.join(process.cwd(), '.env')
  const env = loadEnv(envPath)
  const host = env.SMTP_HOST || 'smtp.zoho.com'
  const port = Number(env.SMTP_PORT || '465')
  const user = env.SMTP_USER
  const pass = env.SMTP_PASS
  const from = env.SMTP_FROM?.trim() || user

  if (!user || !pass || !from) {
    console.log('SMTP_STATUS=missing_credentials')
    process.exit(1)
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: { user, pass },
    tls: { minVersion: 'TLSv1.2' },
  })

  try {
    await transporter.verify()
    console.log('SMTP_STATUS=ok')
    console.log(`SMTP_HOST=${host}`)
    console.log(`SMTP_PORT=${port}`)
    console.log(`SMTP_USER=${user}`)
    console.log(`SMTP_FROM=${from}`)
  } catch (error) {
    console.log('SMTP_STATUS=failed')
    console.log(String(error))
    process.exit(1)
  }
}

main()
