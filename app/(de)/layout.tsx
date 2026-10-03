import type { Metadata } from 'next'
import Script from 'next/script'
import '../globals.css'
import { SITE } from '../components/i18n'

// Defaults for German pages. Every page sets its own canonical/hreflang;
// the layout deliberately has none, so no page inherits the home canonical.
export const metadata: Metadata = {
  title: 'E-Mail-Sicherheitscheck: SPF, DKIM, DMARC prüfen | email-checken.de',
  description: 'Kostenloser E-Mail-Sicherheitscheck: SPF, DKIM, DMARC, Blacklists, MX und mehr – sofort und ohne Anmeldung.',
  metadataBase: new URL(SITE),
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'E-Mail-Sicherheitscheck | email-checken.de',
    description: 'SPF, DKIM, DMARC, Blacklists – prüfen Sie Ihre Domain sofort und kostenlos.',
    url: `${SITE}/`,
    siteName: 'email-checken.de',
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
