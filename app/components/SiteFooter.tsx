import ImpressumWidget from './ImpressumWidget'

// Shared footer for all pages, including the impressum-free.de widget
// (legal notice link + seal).
export default function SiteFooter({ lang }: { lang: 'de' | 'en' }) {
  const year = new Date().getFullYear()
  return (
    <footer>
      <div className="container">
        {lang === 'de' ? (
          <>
            <p>© {year} email-checken.de · Ein Service von PAN21.com International LLC</p>
            <p className="footer-links">
              <a href="/">Startseite</a> · <a href="/kontakt">Kontakt</a> · <a href="/datenschutz">Datenschutz</a>
            </p>
          </>
        ) : (
          <>
            <p>© {year} email-checken.de · A service of PAN21.com International LLC</p>
            <p className="footer-links">
              <a href="/en">Home</a> · <a href="/en/contact">Contact</a> ·{' '}
              <a href="/datenschutz" hrefLang="de">Privacy policy (German)</a>
            </p>
          </>
        )}
        <div className="footer-legal">
          <ImpressumWidget lang={lang} />
        </div>
      </div>
    </footer>
  )
}
