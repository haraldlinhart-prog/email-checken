import type { Metadata } from 'next'
import CheckForm from '../components/CheckForm'
import ImpressumWidget from '../components/ImpressumWidget'
import LangSwitch from '../components/LangSwitch'
import { alternates } from '../components/i18n'

export const metadata: Metadata = {
  alternates: alternates('de', '/', '/en'),
}

export default function Home() {
  return (
    <>
      <header>
        <div className="inner">
          <a href="/" className="logo">📧 email-checken.de</a>
          <nav>
            <a href="/blog">Blog</a>
            <a href="/datenschutz">Datenschutz</a>
            <a href="/kontakt">Kontakt</a>
            <LangSwitch current="de" de="/" en="/en" />
          </nav>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <h1>Ist Ihre E-Mail-Domain sicher?</h1>
          <p>Kostenloser Check auf SPF, DKIM, DMARC, Blacklists, MX und mehr – sofort, ohne Anmeldung.</p>
          <CheckForm />
        </section>

        <div className="features">
          <div className="feature-card">
            <div className="icon">🛡️</div>
            <h3>SPF-Prüfung</h3>
            <p>Sender Policy Framework – wer darf E-Mails in Ihrem Namen versenden?</p>
          </div>
          <div className="feature-card">
            <div className="icon">🔑</div>
            <h3>DKIM-Check</h3>
            <p>DomainKeys Identified Mail – digitale Signatur für Ihre ausgehenden Mails.</p>
          </div>
          <div className="feature-card">
            <div className="icon">📋</div>
            <h3>DMARC-Analyse</h3>
            <p>Domain-based Message Authentication – Schutz vor Phishing in Ihrem Namen.</p>
          </div>
          <div className="feature-card">
            <div className="icon">🚫</div>
            <h3>Blacklist-Check</h3>
            <p>Steht Ihre Domain auf Spam-Blocklisten? Wir prüfen die wichtigsten DNSBLs.</p>
          </div>
          <div className="feature-card">
            <div className="icon">📮</div>
            <h3>MX-Records</h3>
            <p>Sind Ihre Mail-Server korrekt konfiguriert und erreichbar?</p>
          </div>
          <div className="feature-card">
            <div className="icon">🔄</div>
            <h3>Reverse DNS</h3>
            <p>PTR-Records Ihrer MX-Server – wichtig für die Zustellbarkeit.</p>
          </div>
        </div>
      </main>

      <footer>
        <div className="container">
          <p>© {new Date().getFullYear()} email-checken.de · Ein Service von PAN21.com International LLC</p>
          <p style={{ marginTop: '0.25rem' }}>
            <a href="/datenschutz">Datenschutz</a> ·{' '}
            <a href="/kontakt">Kontakt</a> ·{' '}
            <a href="/blog">Blog</a>
          </p>
        </div>
      </footer>
      <ImpressumWidget />
    </>
  )
}
