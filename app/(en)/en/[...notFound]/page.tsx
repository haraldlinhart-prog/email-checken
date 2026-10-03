import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

// Catch-all for unknown URLs below /en, rendering the English 404 page.
export const metadata: Metadata = {
  title: 'Page not found | email-checken.de',
  robots: { index: false },
}

export default function CatchAllEn() {
  notFound()
}
