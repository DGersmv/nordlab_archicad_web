import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  transpilePackages: ['next-intl'],
  async redirects() {
    return [
      {
        source: '/plugins/contours',
        destination: '/plugins/parametric-dimensioning',
        permanent: true,
      },
      {
        source: '/ru/plugins/contours',
        destination: '/ru/plugins/parametric-dimensioning',
        permanent: true,
      },
    ]
  },
}

export default withNextIntl(nextConfig)
