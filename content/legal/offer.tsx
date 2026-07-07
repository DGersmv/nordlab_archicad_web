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

export function getOfferDoc(locale: Locale): LegalDoc {
  const link = createLegalLink(locale)
  if (locale === 'ru') {
    return {
      title: 'Публичная оферта',
      subtitle: 'о заключении договора на предоставление доступа к цифровым продуктам',
      updated: 'Редакция от: 7 июля 2026 г.',
      sections: [
        {
          body: (
            <p>
              Настоящий документ является официальным предложением {company.legalName} заключить договор на условиях,
              изложенных ниже.
            </p>
          ),
        },
        {
          heading: '1. Общие положения',
          body: (
            <>
              <p>
                Оплата цифрового продукта на сайте {link(company.siteUrl, company.siteUrl)} является полным и
                безоговорочным акцептом настоящей оферты.
              </p>
              <p>
                Акцепт означает согласие с условиями оферты,{' '}
                {link('/privacy', 'политикой конфиденциальности')}, {link('/refund', 'условиями возврата')} и
                описанием выбранного продукта.
              </p>
            </>
          ),
        },
        {
          heading: '2. Сведения о продавце',
          body: (
            <>
              <p>{company.legalName}</p>
              <p>ОГРН: {company.ogrn}</p>
              <p>ИНН: {company.inn}</p>
              <p>КПП: {company.kpp}</p>
              <p>Юридический адрес: {company.address}</p>
              <p>Email: {link(`mailto:${company.email}`, company.email)}</p>
            </>
          ),
        },
        {
          heading: '3. Предмет договора',
          body: (
            <>
              <p>
                Продавец предоставляет покупателю неисключительную лицензию на использование выбранного программного
                add-on для Archicad (плагина Nordlab) и/или оказывает сопутствующие услуги по активации.
              </p>
              <p>
                Состав, стоимость и описание каждого продукта размещены на страницах сайта и в разделе{' '}
                {link('/shop', 'покупки')}.
              </p>
            </>
          ),
        },
        {
          heading: '4. Порядок оформления заказа',
          body: (
            <ul className="list-disc space-y-1 pl-5">
              <li>покупатель выбирает продукт и оформляет заявку или оплату;</li>
              <li>до оплаты доступны описание, цена в рублях РФ, оферта, политика конфиденциальности и условия возврата;</li>
              <li>договор считается заключённым с момента подтверждения успешной оплаты.</li>
            </ul>
          ),
        },
        {
          heading: '5. Стоимость и оплата',
          body: (
            <>
              <p>Цены указаны на сайте в российских рублях и/или евро для справки.</p>
              <p>
                Оплата осуществляется через платёжный сервис {company.paymentProvider} ({link(company.payUrl, company.payUrl)}
                ) с использованием способов оплаты, доступных на момент заказа.
              </p>
              <p>Обязанность покупателя по оплате считается исполненной после подтверждения успешного платежа.</p>
            </>
          ),
        },
        {
          heading: '6. Предоставление продукта',
          body: (
            <ul className="list-disc space-y-1 pl-5">
              <li>файл плагина (.apx) доступен в разделе {link('/download', 'скачивания')};</li>
              <li>лицензионный ключ направляется после оплаты на email или через согласованный канал связи;</li>
              <li>активация выполняется в интерфейсе плагина с использованием machine ID.</li>
            </ul>
          ),
        },
        {
          heading: '7. Ограничения использования',
          body: (
            <p>
              Покупатель не вправе передавать лицензионный ключ третьим лицам сверх приобретённого количества мест,
              декомпилировать или распространять продукт без согласия правообладателя, за исключением случаев,
              прямо предусмотренных законом.
            </p>
          ),
        },
      ],
    }
  }

  return {
    title: 'Public Offer',
    subtitle: 'Terms for providing access to digital products',
    updated: 'Last updated: July 7, 2026',
    sections: [
      {
        body: (
          <p>
            This document is a public offer by {company.legalName} to enter into an agreement on the terms below.
            Payment on {link(company.siteUrl, 'nordlab.net')} constitutes acceptance of this offer.
          </p>
        ),
      },
      {
        heading: '1. Seller',
        body: (
          <>
            <p>{company.legalName}</p>
            <p>OGRN: {company.ogrn} · INN: {company.inn} · KPP: {company.kpp}</p>
            <p>Address: {company.address}</p>
            <p>Email: {link(`mailto:${company.email}`, company.email)}</p>
          </>
        ),
      },
      {
        heading: '2. Subject',
        body: (
          <p>
            The seller grants a non-exclusive license to use the selected Nordlab Archicad add-on and provides
            activation support as described on the product pages and in the {link('/shop', 'shop')}.
          </p>
        ),
      },
      {
        heading: '3. Payment',
        body: (
          <p>
            Prices are listed on the website. Payments are processed via {company.paymentProvider} at{' '}
            {link(company.payUrl, company.payUrl)}. The agreement is concluded once payment is confirmed.
          </p>
        ),
      },
      {
        heading: '4. Delivery',
        body: (
          <ul className="list-disc space-y-1 pl-5">
            <li>plugin files (.apx) are available in the {link('/download', 'download')} section;</li>
            <li>license keys are sent after payment by email or an agreed channel;</li>
            <li>activation is performed inside the add-on using the machine ID.</li>
          </ul>
        ),
      },
    ],
  }
}
