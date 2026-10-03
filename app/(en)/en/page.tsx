import type { Metadata } from 'next'
import CheckForm from '../../components/CheckForm'
import ImpressumWidget from '../../components/ImpressumWidget'
import LangSwitch from '../../components/LangSwitch'
import { alternates } from '../../components/i18n'

export const metadata: Metadata = {
  alternates: alternates('en', '/', '/en'),
}

export default function HomeEn() {
  return (
    <>
      <header>
        <div className="inner">
          <a href="/en" className="logo">📧 email-checken.de</a>
          <nav>
            <a href="/en/contact">Contact</a>
            <a href="/datenschutz" hrefLang="de">Privacy</a>
            <LangSwitch current="en" de="/" en="/en" />
          </nav>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <h1>Is your email domain secure?</h1>
          <p>Free check for SPF, DKIM, DMARC, blacklists, MX and more – instant results, no sign-up required.</p>
          <CheckForm lang="en" />
        </section>

        <div className="features">
          <div className="feature-card">
            <div className="icon">🛡️</div>
            <h3>SPF check</h3>
            <p>Sender Policy Framework – who is allowed to send email on behalf of your domain?</p>
          </div>
          <div className="feature-card">
            <div className="icon">🔑</div>
            <h3>DKIM check</h3>
            <p>DomainKeys Identified Mail – a digital signature for your outgoing email.</p>
          </div>
          <div className="feature-card">
            <div className="icon">📋</div>
            <h3>DMARC analysis</h3>
            <p>Domain-based Message Authentication – protects against phishing in your name.</p>
          </div>
          <div className="feature-card">
            <div className="icon">🚫</div>
            <h3>Blacklist check</h3>
            <p>Is your mail server on a spam blocklist? We check the most important DNSBLs.</p>
          </div>
          <div className="feature-card">
            <div className="icon">📮</div>
            <h3>MX records</h3>
            <p>Are your mail servers configured correctly and reachable?</p>
          </div>
          <div className="feature-card">
            <div className="icon">🔄</div>
            <h3>Reverse DNS</h3>
            <p>PTR records of your MX servers – essential for reliable email delivery.</p>
          </div>
        </div>
      </main>

      <footer>
        <div className="container">
          <p>© {new Date().getFullYear()} email-checken.de · A service of PAN21.com International LLC</p>
          <p style={{ marginTop: '0.25rem' }}>
            <a href="/en/contact">Contact</a> ·{' '}
            <a href="/datenschutz" hrefLang="de">Privacy policy (German)</a>
          </p>
        </div>
      </footer>
      <ImpressumWidget />
    </>
  )
}
