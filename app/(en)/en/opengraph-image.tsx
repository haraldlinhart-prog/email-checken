import { ogImage, OG_SIZE } from '../../components/ogImage'

// Open Graph image for the English pages (rendered once at build time).
export const alt = 'email-checken.de – free email security check for SPF, DKIM, DMARC and blacklists'
export const size = OG_SIZE
export const contentType = 'image/png'

export default function Image() {
  return ogImage(
    'Free email security check for your domain',
    'SPF · DKIM · DMARC · Blacklists · MX · Reverse DNS'
  )
}
