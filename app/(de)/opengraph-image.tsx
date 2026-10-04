import { ogImage, OG_SIZE } from '../components/ogImage'

// Open Graph image for the German pages (rendered once at build time).
export const alt = 'email-checken.de – kostenloser E-Mail-Sicherheitscheck für SPF, DKIM, DMARC und Blacklists'
export const size = OG_SIZE
export const contentType = 'image/png'

export default function Image() {
  return ogImage(
    'Kostenloser E-Mail-Sicherheitscheck für Ihre Domain',
    'SPF · DKIM · DMARC · Blacklists · MX · Reverse DNS'
  )
}
