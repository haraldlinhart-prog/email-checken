import type { Metadata } from 'next'
import Script from 'next/script'
import '../globals.css'
import { SITE } from '../components/i18n'

// Defaults for English pages. Every page sets its own canonical/hreflang.
export const metadata: Metadata = {
  title: 'Email Security Check: Test SPF, DKIM & DMARC | email-checken.de',
  description: 'Free email security check: SPF, DKIM, DMARC, blacklists, MX and more – instant results, no sign-up required.',
  metadataBase: new URL(SITE),
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'Email Security Check | email-checken.de',
    description: 'SPF, DKIM, DMARC, blacklists – check your domain in seconds, free of charge.',
    url: `${SITE}/en`,
    siteName: 'email-checken.de',
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['de_DE'],
  },
}

export default function EnglishRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
