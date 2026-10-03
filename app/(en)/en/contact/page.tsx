import type { Metadata } from 'next'
import ContactForm from '../../../components/ContactForm'
import SiteHeader from '../../../components/SiteHeader'
import SiteFooter from '../../../components/SiteFooter'
import { alternates, SITE } from '../../../components/i18n'

export const metadata: Metadata = {
  title: 'Contact | email-checken.de',
  description: 'Questions about email security or your check result? Get in touch with the email-checken.de team.',
  alternates: alternates('en', '/kontakt', '/en/contact'),
  openGraph: {
    title: 'Contact | email-checken.de',
    description: 'Questions about email security or your check result? Get in touch.',
    url: `${SITE}/en/contact`,
    siteName: 'email-checken.de',
    type: 'website',
    locale: 'en_US',
  },
}

export default function ContactPageEn() {
  return (
    <>
      <SiteHeader lang="en" de="/kontakt" en="/en/contact" />
      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Contact</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>Questions about email security or your check result? Send us a message – we’re happy to help.</p>
        <ContactForm lang="en" />
      </main>
      <SiteFooter lang="en" />
    </>
  )
}
