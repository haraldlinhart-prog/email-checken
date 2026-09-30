import type { Metadata } from 'next'
import Script from 'next/script'
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
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-CM1N75FRDN"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-CM1N75FRDN');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  )
}
