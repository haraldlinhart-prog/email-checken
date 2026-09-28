import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'E-Mail-Check | email-checken.de',
  description: 'Kostenloser E-Mail-Sicherheitscheck: SPF, DKIM, DMARC, Blacklist-Prüfung und mehr – sofort und ohne Anmeldung.',
  metadataBase: new URL('https://email-checken.de'),
  alternates: { canonical: 'https://email-checken.de' },
  openGraph: {
    title: 'E-Mail-Check | email-checken.de',
    description: 'SPF, DKIM, DMARC, Blacklists – Ihre Domain sofort prüfen.',
    url: 'https://email-checken.de',
    type: 'website',
    locale: 'de_DE',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
