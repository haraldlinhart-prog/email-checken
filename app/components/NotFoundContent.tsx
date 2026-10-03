import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'

// Styled 404 page in the site design (used by both route groups).
export default function NotFoundContent({ lang }: { lang: 'de' | 'en' }) {
  const de = lang === 'de'
  return (
    <>
      <SiteHeader lang={lang} de="/" en="/en" />
      <main className="container not-found">
        <p className="not-found-code">404</p>
        <h1>{de ? 'Seite nicht gefunden' : 'Page not found'}</h1>
        <p>
          {de
            ? 'Die aufgerufene Adresse gibt es auf email-checken.de nicht (mehr). Prüfen Sie die Schreibweise oder starten Sie direkt einen kostenlosen E-Mail-Sicherheitscheck.'
            : 'This address doesn’t exist (or no longer exists) on email-checken.de. Check the spelling or start a free email security check right away.'}
        </p>
        <a className="btn" href={de ? '/' : '/en'}>
          {de ? 'Zum E-Mail-Check' : 'Go to the email check'}
        </a>
      </main>
      <SiteFooter lang={lang} />
    </>
  )
}
