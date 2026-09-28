export default function DatenschutzPage() {
  return (
    <>
      <header>
        <div className="inner">
          <a href="/" className="logo">📧 email-checken.de</a>
          <nav><a href="/kontakt">Kontakt</a></nav>
        </div>
      </header>
      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem', maxWidth: '680px' }}>
        <h1 style={{ marginBottom: '1.5rem' }}>Datenschutzerklärung</h1>

        <h2 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>1. Verantwortlicher</h2>
        <p>PAN21.com International LLC, ein Service von PAN21.COM Corporate Consultants Ltd, Kington, Herefordshire, UK. Kontakt: <a href="/kontakt" style={{ color: 'var(--accent)' }}>Kontaktformular</a></p>

        <h2 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>2. Welche Daten wir verarbeiten</h2>
        <p>Wenn Sie eine Domain prüfen, wird die eingegebene Domain-Bezeichnung für den Check verwendet und das Ergebnis in unserer Datenbank gespeichert. Es werden keine personenbezogenen Daten ohne Ihre Eingabe erfasst.</p>
        <p style={{ marginTop: '0.5rem' }}>Beim Kontaktformular: Name, E-Mail-Adresse und Nachrichtentext zur Bearbeitung Ihrer Anfrage.</p>

        <h2 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>3. Zweck der Verarbeitung</h2>
        <p>Bereitstellung des E-Mail-Sicherheitschecks, Speicherung von Check-Ergebnissen für Badge-Funktion, Bearbeitung von Kontaktanfragen.</p>

        <h2 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>4. Rechtsgrundlage</h2>
        <p>Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung/vorvertragliche Maßnahmen) und Art. 6 Abs. 1 lit. f DSGVO (berechtigte Interessen).</p>

        <h2 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>5. Dienstleister</h2>
        <ul style={{ paddingLeft: '1.5rem', marginTop: '0.25rem' }}>
          <li><strong>Vercel Inc.</strong> – Hosting (USA, Standardvertragsklauseln)</li>
          <li><strong>Supabase Inc.</strong> – Datenbank (USA, Standardvertragsklauseln)</li>
          <li><strong>Resend Inc.</strong> – E-Mail-Versand (USA, Standardvertragsklauseln)</li>
          <li><strong>Cloudflare Inc.</strong> – DNS-Abfragen für den Check (keine personenbezogenen Daten)</li>
        </ul>

        <h2 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>6. Ihre Rechte</h2>
        <p>Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch – richten Sie sich an unser <a href="/kontakt" style={{ color: 'var(--accent)' }}>Kontaktformular</a>. Beschwerderecht bei der zuständigen Datenschutzbehörde.</p>

        <h2 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>7. Cookies</h2>
        <p>Diese Website verwendet keine Cookies und kein Tracking.</p>

        <p style={{ marginTop: '2rem', color: 'var(--muted)', fontSize: '0.85rem' }}>Stand: {new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long' })}</p>
      </main>
      <footer>
        <div className="container">
          <p>© {new Date().getFullYear()} email-checken.de · <a href="/">Startseite</a></p>
        </div>
      </footer>
    </>
  )
}
