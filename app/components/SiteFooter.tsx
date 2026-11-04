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
      {/* Verzeichnis-Banner: Swiss Quality, German Quality, FFA-Links */}
      <div style={{ display:"flex", justifyContent:"center", gap:"12px", flexWrap:"wrap", margin:"1rem 0 0" }}>
        <a href="https://www.swiss-quality.de/ref/794ddb5bd383c7c7f9" target="_blank" rel="noopener"><img src="https://www.swiss-quality.de/banner.svg" width="120" height="60" alt="Swiss Quality" /></a>
        <a href="https://www.german-quality.net/ref/3df83659d61ed26478" target="_blank" rel="noopener"><img src="https://www.german-quality.net/banner.svg" width="120" height="60" alt="German Quality" /></a>
        <a href="https://www.ffa-links.de/ref/43b1a66c480272221b" target="_blank" rel="noopener"><img src="https://www.ffa-links.de/banner.svg" width="120" height="60" alt="FFA-Links" /></a>
      </div>
      {/* Tool-Badges: site-ok.de, kaputte-links.de, pagespeed-plus.de */}
      <div style={{ display:"flex", justifyContent:"center", gap:"12px", flexWrap:"wrap", margin:"1rem 0 0" }}>
        <a href="https://www.site-ok.de/status.html?key=jre9epmg8t" target="_blank" rel="noopener"><img src="https://www.site-ok.de/api/badge?key=jre9epmg8t" alt="Site-Status" width="320" height="80" /></a>
        <a href="https://www.kaputte-links.de/status.html?key=adb5rs0dj4" target="_blank" rel="noopener"><img src="https://www.kaputte-links.de/api/badge?key=adb5rs0dj4" alt="Link-Status" width="320" height="80" /></a>
        <a href="https://www.pagespeed-plus.de/status.html?key=dh27twsa8e" target="_blank" rel="noopener"><img src="https://www.pagespeed-plus.de/api/badge?key=dh27twsa8e" alt="PageSpeed Score" /></a>
      </div>
    </footer>
  )
}
