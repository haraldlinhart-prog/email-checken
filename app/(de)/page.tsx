import type { Metadata } from 'next'
import CheckForm from '../components/CheckForm'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import { alternates } from '../components/i18n'

export const metadata: Metadata = {
  alternates: alternates('de', '/', '/en'),
}

export default function Home() {
  return (
    <>
      <SiteHeader lang="de" de="/" en="/en" />

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
            <p>DomainKeys Identified Mail – die digitale Signatur Ihrer ausgehenden E-Mails.</p>
          </div>
          <div className="feature-card">
            <div className="icon">📋</div>
            <h3>DMARC-Analyse</h3>
            <p>Domain-based Message Authentication, Reporting and Conformance – Schutz vor Phishing in Ihrem Namen.</p>
          </div>
          <div className="feature-card">
            <div className="icon">🚫</div>
            <h3>Blacklist-Check</h3>
            <p>Steht Ihr Mail-Server auf Spam-Blocklisten? Wir prüfen fünf bekannte DNSBLs.</p>
          </div>
          <div className="feature-card">
            <div className="icon">📮</div>
            <h3>MX-Records</h3>
            <p>Sind Ihre Mail-Server korrekt im DNS eingetragen und auflösbar?</p>
          </div>
          <div className="feature-card">
            <div className="icon">🔄</div>
            <h3>Reverse DNS</h3>
            <p>PTR-Record Ihres primären Mail-Servers – wichtig für die Zustellbarkeit.</p>
          </div>
        </div>
      </main>

      <SiteFooter lang="de" />
    </>
  )
}
