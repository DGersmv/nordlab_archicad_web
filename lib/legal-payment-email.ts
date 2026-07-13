import type { Locale } from '@/content/types'

type LegalPaymentEmailInput = {
  locale: Locale
  pluginName: string
  machineId: string
  company: string
  inn?: string
  contactName: string
  email: string
  phone?: string
  notes?: string
}

export function formatLegalPaymentAdminEmail(input: LegalPaymentEmailInput): string {
  return [
    'New legal entity payment request',
    '',
    `Plugin: ${input.pluginName}`,
    `Machine ID: ${input.machineId}`,
    `Company: ${input.company}`,
    input.inn ? `INN: ${input.inn}` : '',
    `Contact: ${input.contactName}`,
    `Email: ${input.email}`,
    input.phone ? `Phone: ${input.phone}` : '',
    input.notes ? '' : '',
    input.notes ? 'Notes:' : '',
    input.notes || '',
  ]
    .filter(Boolean)
    .join('\n')
}

export function formatLegalPaymentCustomerEmail(input: LegalPaymentEmailInput): { subject: string; text: string } {
  const isRu = input.locale === 'ru'

  if (isRu) {
    return {
      subject: `Nordlab — заявка на оплату для юр. лица (${input.pluginName})`,
      text: [
        `Здравствуйте, ${input.contactName}!`,
        '',
        'Мы получили вашу заявку на оплату лицензии Nordlab для юридического лица.',
        '',
        'Данные заявки:',
        `• Плагин: ${input.pluginName}`,
        `• Machine ID: ${input.machineId}`,
        `• Организация: ${input.company}`,
        input.inn ? `• ИНН: ${input.inn}` : '',
        '',
        'Что будет дальше:',
        '1. В течение 1–2 рабочих дней подготовим счёт от ООО «227.ИНФО» и отправим на этот email.',
        '2. После поступления оплаты вышлем лицензионный ключ для указанного Machine ID.',
        '3. Ключ нужно будет вставить в палитру плагина в Archicad.',
        '',
        'Если реквизиты не были указаны полностью, ответьте на это письмо с карточкой организации.',
        '',
        'Обратная связь: admin@nordlab.net или Telegram @api_archicad.',
        '',
        'Спасибо,',
        'Nordlab',
      ]
        .filter(Boolean)
        .join('\n'),
    }
  }

  return {
    subject: `Nordlab — legal entity payment request (${input.pluginName})`,
    text: [
      `Hello ${input.contactName},`,
      '',
      'We received your Nordlab license request for a legal entity.',
      '',
      'Request details:',
      `• Plugin: ${input.pluginName}`,
      `• Machine ID: ${input.machineId}`,
      `• Company: ${input.company}`,
      input.inn ? `• INN: ${input.inn}` : '',
      '',
      'What happens next:',
      '1. Within 1–2 business days we will prepare an invoice from ООО «227.ИНФО» and send it to this email.',
      '2. After payment is received, we will send the license key for the Machine ID above.',
      '3. Paste the key into the plugin palette in Archicad.',
      '',
      'If company details were incomplete, reply to this email with your billing information.',
      '',
      'Contact: admin@nordlab.net or Telegram @api_archicad.',
      '',
      'Thank you,',
      'Nordlab',
    ]
      .filter(Boolean)
      .join('\n'),
  }
}
