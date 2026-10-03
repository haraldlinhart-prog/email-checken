import type { Metadata } from 'next'
import ContactForm from '../../../components/ContactForm'
import LangSwitch from '../../../components/LangSwitch'
import { alternates } from '../../../components/i18n'

export const metadata: Metadata = {
  title: 'Contact | email-checken.de',
  description: 'Questions about email security or your check result? Get in touch with the email-checken.de team.',
  alternates: alternates('en', '/kontakt', '/en/contact'),
  openGraph: {
    title: 'Contact | email-checken.de',
    description: 'Questions about email security or your check result? Get in touch.',
    url: 'https://email-checken.de/en/contact',
    type: 'website',
    locale: 'en_US',
  },
}

export default function ContactPageEn() {
  return (
    <>
      <header>
        <div className="inner">
          <a href="/en" className="logo">📧 email-checken.de</a>
          <nav>
            <a href="/datenschutz" hrefLang="de">Privacy</a>
            <LangSwitch current="en" de="/kontakt" en="/en/contact" />
          </nav>
        </div>
      </header>
      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Contact</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>Questions about email security or your check result? Send us a message – we’re happy to help.</p>
        <ContactForm lang="en" />
      </main>
      <footer>
        <div className="container">
          <p>© {new Date().getFullYear()} email-checken.de · <a href="/en">Home</a> · <a href="/datenschutz" hrefLang="de">Privacy policy (German)</a></p>
        </div>
      </footer>
    </>
  )
}
