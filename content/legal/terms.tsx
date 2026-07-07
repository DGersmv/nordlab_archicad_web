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

export function getTermsDoc(locale: Locale): LegalDoc {
  const link = createLegalLink(locale)
  if (locale === 'ru') {
    return {
      title: 'Пользовательское соглашение',
      updated: 'Редакция от: 7 июля 2026 г.',
      sections: [
        {
          body: (
            <p>
              Используя сайт {link(company.siteUrl, company.siteUrl)}, вы соглашаетесь с настоящими условиями.
            </p>
          ),
        },
        {
          heading: '1. Сервис',
          body: (
            <p>
              Сайт предоставляет информацию о плагинах Nordlab для Archicad, возможность оформить заявку на покупку,
              скачать trial-версии, активировать лицензию и связаться с разработчиком.
            </p>
          ),
        },
        {
          heading: '2. Интеллектуальная собственность',
          body: (
            <p>
              Тексты, дизайн, программный код плагинов и сопутствующие материалы защищены законодательством об
              интеллектуальной собственности. Archicad и GDL являются товарными знаками Graphisoft SE.
            </p>
          ),
        },
        {
          heading: '3. Ограничение ответственности',
          body: (
            <p>
              Плагины предоставляются для профессионального использования в Archicad. Продавец не несёт ответственности
              за косвенные убытки, возникшие при использовании программного обеспечения, за исключением случаев,
              прямо предусмотренных законом.
            </p>
          ),
        },
        {
          heading: '4. Связанные документы',
          body: (
            <ul className="list-disc space-y-1 pl-5">
              <li>{link('/privacy', 'Политика конфиденциальности')}</li>
              <li>{link('/offer', 'Публичная оферта')}</li>
              <li>{link('/refund', 'Возврат денежных средств')}</li>
            </ul>
          ),
        },
        {
          heading: '5. Контакты',
          body: (
            <p>
              По вопросам использования сайта и продуктов: {link(`mailto:${company.email}`, company.email)}.
            </p>
          ),
        },
      ],
    }
  }

  return {
    title: 'Terms of Use',
    updated: 'Last updated: July 7, 2026',
    sections: [
      {
        body: <p>By using {link(company.siteUrl, 'nordlab.net')}, you agree to these terms.</p>,
      },
      {
        heading: '1. Service',
        body: (
          <p>
            The website provides information about Nordlab Archicad add-ons, purchase requests, trial downloads,
            license activation, and contact with the developer.
          </p>
        ),
      },
      {
        heading: '2. Intellectual property',
        body: (
          <p>
            Website content and add-on software are protected by applicable intellectual property laws. Archicad and GDL
            are trademarks of Graphisoft SE.
          </p>
        ),
      },
      {
        heading: '3. Liability',
        body: (
          <p>
            Add-ons are provided for professional use in Archicad. The seller is not liable for indirect damages except
            where required by law.
          </p>
        ),
      },
      {
        heading: '4. Related documents',
        body: (
          <ul className="list-disc space-y-1 pl-5">
            <li>{link('/privacy', 'Privacy Policy')}</li>
            <li>{link('/offer', 'Public Offer')}</li>
            <li>{link('/refund', 'Refund Policy')}</li>
          </ul>
        ),
      },
      {
        heading: '5. Contact',
        body: <p>Questions: {link(`mailto:${company.email}`, company.email)}.</p>,
      },
    ],
  }
}
