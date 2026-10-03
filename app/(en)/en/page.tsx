import type { Metadata } from 'next'
import CheckForm from '../../components/CheckForm'
import SiteHeader from '../../components/SiteHeader'
import SiteFooter from '../../components/SiteFooter'
import { alternates } from '../../components/i18n'

export const metadata: Metadata = {
  alternates: alternates('en', '/', '/en'),
}

export default function HomeEn() {
  return (
    <>
      <SiteHeader lang="en" de="/" en="/en" />

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
            <p>DomainKeys Identified Mail – the digital signature on your outgoing email.</p>
          </div>
          <div className="feature-card">
            <div className="icon">📋</div>
            <h3>DMARC analysis</h3>
            <p>Domain-based Message Authentication, Reporting and Conformance – protection against phishing in your name.</p>
          </div>
          <div className="feature-card">
            <div className="icon">🚫</div>
            <h3>Blacklist check</h3>
            <p>Is your mail server on a spam blocklist? We check five well-known DNSBLs.</p>
          </div>
          <div className="feature-card">
            <div className="icon">📮</div>
            <h3>MX records</h3>
            <p>Are your mail servers listed correctly in DNS and do they resolve?</p>
          </div>
          <div className="feature-card">
            <div className="icon">🔄</div>
            <h3>Reverse DNS</h3>
            <p>The PTR record of your primary mail server – essential for reliable email delivery.</p>
          </div>
        </div>
      </main>

      <SiteFooter lang="en" />
    </>
  )
}
