import ContactForm from './ContactForm'

export default function KontaktPage() {
  return (
    <>
      <header>
        <div className="inner">
          <a href="/" className="logo">📧 email-checken.de</a>
          <nav><a href="/datenschutz">Datenschutz</a></nav>
        </div>
      </header>
      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Kontakt</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>Fragen zur E-Mail-Sicherheit oder zum Check? Schreiben Sie uns.</p>
        <ContactForm />
      </main>
      <footer>
        <div className="container">
          <p>© {new Date().getFullYear()} email-checken.de · <a href="/datenschutz">Datenschutz</a></p>
        </div>
      </footer>
    </>
  )
}
