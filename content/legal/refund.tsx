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

export function getRefundDoc(locale: Locale): LegalDoc {
  const link = createLegalLink(locale)
  if (locale === 'ru') {
    return {
      title: 'Возврат денежных средств',
      updated: 'Редакция от: 7 июля 2026 г.',
      sections: [
        {
          body: (
            <p>
              Настоящие условия описывают порядок возврата при покупке цифровых продуктов на сайте{' '}
              {link(company.siteUrl, company.siteUrl)}.
            </p>
          ),
        },
        {
          heading: '1. Характер продукта',
          body: (
            <p>
              Все продукты Nordlab являются цифровыми товарами: лицензии на программные add-on для Archicad и файлы
              для установки (.apx). После оплаты доступ предоставляется в электронном виде.
            </p>
          ),
        },
        {
          heading: '2. Когда возможен возврат',
          body: (
            <ul className="list-disc space-y-1 pl-5">
              <li>ошибочный или повторный платёж;</li>
              <li>оплаченный продукт не был предоставлен по вине продавца;</li>
              <li>существенное несоответствие продукта описанию на сайте;</li>
              <li>техническая неработоспособность, которую продавец не устранил в разумный срок.</li>
            </ul>
          ),
        },
        {
          heading: '3. Когда возврат, как правило, не производится',
          body: (
            <p>
              Если покупателю уже предоставлен лицензионный ключ, ссылка на скачивание или иной цифровой доступ,
              возврат обычно не производится, за исключением случаев, предусмотренных законом или когда продукт
              фактически не был предоставлен или неработоспособен.
            </p>
          ),
        },
        {
          heading: '4. Как подать заявку',
          body: (
            <>
              <p>
                Направьте обращение на {link(`mailto:${company.email}`, company.email)} с указанием:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>ФИО или наименование покупателя;</li>
                <li>даты и суммы платежа;</li>
                <li>email, использованного при заказе;</li>
                <li>причины возврата и подтверждения оплаты.</li>
              </ul>
            </>
          ),
        },
        {
          heading: '5. Сроки возврата',
          body: (
            <p>
              При наличии оснований возврат производится тем же способом, которым была осуществлена оплата. Фактический
              срок зачисления зависит от банка покупателя и правил платёжной системы {company.paymentProvider}.
            </p>
          ),
        },
      ],
    }
  }

  return {
    title: 'Refund Policy',
    updated: 'Last updated: July 7, 2026',
    sections: [
      {
        body: (
          <p>
            This policy applies to digital Nordlab Archicad add-on purchases made on {link(company.siteUrl, 'nordlab.net')}.
          </p>
        ),
      },
      {
        heading: '1. Digital products',
        body: (
          <p>
            Products are delivered electronically as license keys and downloadable .apx files after payment confirmation.
          </p>
        ),
      },
      {
        heading: '2. Refund eligibility',
        body: (
          <ul className="list-disc space-y-1 pl-5">
            <li>duplicate or accidental payment;</li>
            <li>product not delivered due to seller fault;</li>
            <li>material mismatch with the website description;</li>
            <li>technical failure not resolved within a reasonable time.</li>
          </ul>
        ),
      },
      {
        heading: '3. Non-refundable cases',
        body: (
          <p>
            Once a license key or download access has been delivered, refunds are generally not available except where
            required by law or when the product was not provided or is non-functional.
          </p>
        ),
      },
      {
        heading: '4. How to request a refund',
        body: (
          <p>
            Contact {link(`mailto:${company.email}`, company.email)} with your purchase email, payment confirmation,
            and a description of the issue.
          </p>
        ),
      },
      {
        heading: '5. Processing time',
        body: (
          <p>
            Approved refunds are issued to the original payment method. Settlement time depends on your bank and{' '}
            {company.paymentProvider}.
          </p>
        ),
      },
    ],
  }
}
