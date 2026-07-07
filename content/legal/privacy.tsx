import type { Locale } from '@/content/types'
import type { LegalSection } from '@/components/LegalPage'
import { company } from '@/content/company'
import { createLegalLink } from '@/content/legal/links'

type LegalDoc = {
  title: string
  subtitle?: string
  updated: string
  sections: LegalSection[]
}

export function getPrivacyDoc(locale: Locale): LegalDoc {
  const link = createLegalLink(locale)
  if (locale === 'ru') {
    return {
      title: 'Политика конфиденциальности',
      subtitle: 'Политика обработки персональных данных',
      updated: 'Редакция от: 7 июля 2026 г.',
      sections: [
        {
          body: (
            <p>
              Настоящая политика разработана в соответствии с законодательством Российской Федерации, включая
              Федеральный закон №152-ФЗ «О персональных данных».
            </p>
          ),
        },
        {
          heading: '1. Оператор персональных данных',
          body: (
            <>
              <p>
                <strong>{company.legalName}</strong>
              </p>
              <p>ОГРН: {company.ogrn}</p>
              <p>ИНН: {company.inn}</p>
              <p>КПП: {company.kpp}</p>
              <p>Юридический адрес: {company.address}</p>
              <p>
                Email: {link(`mailto:${company.email}`, company.email)}
              </p>
              <p>
                Сайт: {link(company.siteUrl, company.siteUrl)}
              </p>
            </>
          ),
        },
        {
          heading: '2. Какие данные мы собираем',
          body: (
            <>
              <p>При использовании сайта и оформлении заказа могут обрабатываться:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>имя и контактные данные (email, Telegram);</li>
                <li>название компании / бюро;</li>
                <li>сведения о заказе (плагин, количество лицензий, machine ID);</li>
                <li>технические данные: IP-адрес, cookies, данные браузера, дата и время доступа.</li>
              </ul>
            </>
          ),
        },
        {
          heading: '3. Цели обработки',
          body: (
            <ul className="list-disc space-y-1 pl-5">
              <li>обработка заявок на покупку и активацию лицензий;</li>
              <li>приём оплаты и выдача цифровых продуктов;</li>
              <li>техническая поддержка пользователей;</li>
              <li>соблюдение требований законодательства и бухгалтерского учёта.</li>
            </ul>
          ),
        },
        {
          heading: '4. Передача данных третьим лицам',
          body: (
            <>
              <p>
                Данные могут передаваться платёжному сервису <strong>{company.paymentProvider}</strong> в объёме,
                необходимом для проведения оплаты, а также провайдерам инфраструктуры (хостинг, почта, защита от
                спама), если это требуется для работы сервиса.
              </p>
              <p>Передача осуществляется только в объёме, необходимом для исполнения обязательств перед пользователем.</p>
            </>
          ),
        },
        {
          heading: '5. Доставка цифровых продуктов',
          body: (
            <p>
              После подтверждения оплаты пользователю направляется лицензионный ключ, ссылка на скачивание плагина
              или иные инструкции по email или через указанный при заказе канал связи.
            </p>
          ),
        },
        {
          heading: '6. Права пользователя',
          body: (
            <>
              <p>Пользователь вправе запросить доступ, исправление или удаление персональных данных, а также отозвать согласие на обработку.</p>
              <p>
                Запрос направляется на {link(`mailto:${company.email}`, company.email)}.
              </p>
            </>
          ),
        },
        {
          heading: '7. Cookies',
          body: (
            <p>
              Сайт может использовать cookies для работы форм, аналитики и улучшения пользовательского опыта. Cookies
              можно отключить в настройках браузера.
            </p>
          ),
        },
        {
          heading: '8. Изменение политики',
          body: (
            <p>
              Актуальная версия политики размещается на странице{' '}
              {link(`${company.siteUrl}/privacy`, `${company.siteUrl}/privacy`)}.
            </p>
          ),
        },
      ],
    }
  }

  return {
    title: 'Privacy Policy',
    updated: 'Last updated: July 7, 2026',
    sections: [
      {
        body: (
          <p>
            This policy describes how {company.legalName} processes personal data when you use{' '}
            {link(company.siteUrl, 'nordlab.net')} and purchase Nordlab Archicad add-ons.
          </p>
        ),
      },
      {
        heading: '1. Data controller',
        body: (
          <>
            <p>
              <strong>{company.legalName}</strong>
            </p>
            <p>OGRN: {company.ogrn} · INN: {company.inn} · KPP: {company.kpp}</p>
            <p>Registered address: {company.address}</p>
            <p>Email: {link(`mailto:${company.email}`, company.email)}</p>
          </>
        ),
      },
      {
        heading: '2. Data we collect',
        body: (
          <ul className="list-disc space-y-1 pl-5">
            <li>name and contact details (email, Telegram);</li>
            <li>company / bureau name;</li>
            <li>order details (plugin, seats, machine ID);</li>
            <li>technical data: IP address, cookies, browser data, access timestamps.</li>
          </ul>
        ),
      },
      {
        heading: '3. Purposes',
        body: (
          <ul className="list-disc space-y-1 pl-5">
            <li>processing purchase and activation requests;</li>
            <li>payment processing and digital product delivery;</li>
            <li>customer support;</li>
            <li>legal and accounting compliance.</li>
          </ul>
        ),
      },
      {
        heading: '4. Third parties',
        body: (
          <p>
            We may share limited data with {company.paymentProvider} for payment processing and with infrastructure
            providers (hosting, email, anti-spam) as required to operate the service.
          </p>
        ),
      },
      {
        heading: '5. Your rights',
        body: (
          <p>
            You may request access, correction or deletion of your personal data by contacting{' '}
            {link(`mailto:${company.email}`, company.email)}.
          </p>
        ),
      },
      {
        heading: '6. Updates',
        body: (
          <p>
            The current version is always available at {link(`${company.siteUrl}/privacy`, `${company.siteUrl}/privacy`)}.
          </p>
        ),
      },
    ],
  }
}
