import LangSwitch from './LangSwitch'

// Shared header for all pages. `de` / `en` are the paths of the equivalent
// page in each language (used by the language switch).
export default function SiteHeader({ lang, de, en }: { lang: 'de' | 'en'; de: string; en: string }) {
  return (
    <header>
      <div className="inner">
        <a href={lang === 'de' ? '/' : '/en'} className="logo">📧 email-checken.de</a>
        <nav>
          {lang === 'de' ? (
            <>
              <a href="/kontakt">Kontakt</a>
              <a href="/datenschutz">Datenschutz</a>
            </>
          ) : (
            <>
              <a href="/en/contact">Contact</a>
              <a href="/datenschutz" hrefLang="de">Privacy</a>
            </>
          )}
          <LangSwitch current={lang} de={de} en={en} />
        </nav>
      </div>
    </header>
  )
}
