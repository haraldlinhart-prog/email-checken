import type { Metadata } from 'next'
import ContactForm from '../../components/ContactForm'
import SiteHeader from '../../components/SiteHeader'
import SiteFooter from '../../components/SiteFooter'
import { alternates, SITE } from '../../components/i18n'

export const metadata: Metadata = {
  title: 'Kontakt | email-checken.de',
  description: 'Fragen zur E-Mail-Sicherheit oder zu Ihrem Check-Ergebnis? Schreiben Sie dem Team von email-checken.de.',
  alternates: alternates('de', '/kontakt', '/en/contact'),
  openGraph: {
    title: 'Kontakt | email-checken.de',
    description: 'Fragen zur E-Mail-Sicherheit oder zu Ihrem Check-Ergebnis? Schreiben Sie uns.',
    url: `${SITE}/kontakt`,
    siteName: 'email-checken.de',
    type: 'website',
    locale: 'de_DE',
  },
}

export default function KontaktPage() {
  return (
    <>
      <SiteHeader lang="de" de="/kontakt" en="/en/contact" />
      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Kontakt</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>Fragen zur E-Mail-Sicherheit oder zu Ihrem Check-Ergebnis? Schreiben Sie uns – wir helfen gern.</p>
        <ContactForm />
      </main>
      <SiteFooter lang="de" />
    </>
  )
}
