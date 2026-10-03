import type { MetadataRoute } from 'next'
import { SITE } from './components/i18n'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  }
}
