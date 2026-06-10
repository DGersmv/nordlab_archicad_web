import type { MetadataRoute } from 'next'
import { getAllPluginSlugs } from '@/content/plugins'
import { siteLinks } from '@/content/site'

const baseUrl = siteLinks.siteUrl

const staticPaths = [
  '',
  '/for-manufacturers',
  '/custom',
  '/about',
  '/changelog',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const pluginPaths = getAllPluginSlugs().map((slug) => `/plugins/${slug}`)
  const allPaths = [...staticPaths, ...pluginPaths]

  const entries: MetadataRoute.Sitemap = []

  for (const path of allPaths) {
    entries.push({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      alternates: {
        languages: {
          en: `${baseUrl}${path}`,
          ru: `${baseUrl}/ru${path}`,
        },
      },
    })
  }

  return entries
}
