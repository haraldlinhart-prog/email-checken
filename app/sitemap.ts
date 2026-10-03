import type { MetadataRoute } from 'next'
import { SITE } from './components/i18n'

// German and English pages with hreflang alternates (x-default = German).
export default function sitemap(): MetadataRoute.Sitemap {
  const pair = (de: string, en: string, priority: number) => {
    const languages = { de: `${SITE}${de}`, en: `${SITE}${en}`, 'x-default': `${SITE}${de}` }
    return [
      { url: `${SITE}${de}`, changeFrequency: 'monthly' as const, priority, alternates: { languages } },
      { url: `${SITE}${en}`, changeFrequency: 'monthly' as const, priority, alternates: { languages } },
    ]
  }
  return [
    ...pair('', '/en', 1),
    ...pair('/kontakt', '/en/contact', 0.5),
    { url: `${SITE}/datenschutz`, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
