export const SITE = 'https://email-checken.de'

// hreflang alternates for a page that exists in both languages.
// x-default always points to the German version.
export function alternates(lang: 'de' | 'en', dePath: string, enPath: string) {
  const de = `${SITE}${dePath === '/' ? '' : dePath}`
  const en = `${SITE}${enPath}`
  return {
    canonical: lang === 'de' ? de : en,
    languages: { de, en, 'x-default': de },
  }
}
