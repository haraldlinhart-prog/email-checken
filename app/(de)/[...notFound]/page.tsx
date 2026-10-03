import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

// Catch-all for unknown German URLs, so they render the styled 404 page
// (with two route-group root layouts there is no global app/not-found).
export const metadata: Metadata = {
  title: 'Seite nicht gefunden | email-checken.de',
  robots: { index: false },
}

export default function CatchAll() {
  notFound()
}
