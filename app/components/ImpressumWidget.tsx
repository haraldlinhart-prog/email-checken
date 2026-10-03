'use client'
import { useEffect } from 'react'

// Impressum kommt aus dem impressum-free.de-Profil für email-checken.de (Kopie von pan21.com).
// Auf englischen Seiten werden nur Linktexte, Modal-Titel und Alt-Texte übersetzt,
// der Impressumstext selbst bleibt deutsch.
const EN_LABELS: Record<string, string> = {
  Impressum: 'Legal notice (German)',
  Datenschutz: 'Privacy policy (German)',
  Datenschutzerklärung: 'Privacy policy (German)',
}

export default function ImpressumWidget({ lang = 'de' }: { lang?: 'de' | 'en' }) {
  useEffect(() => {
    let observer: MutationObserver | undefined
    if (lang === 'en') {
      const relabel = () => {
        document
          .querySelectorAll<HTMLElement>('#impressum-free-widget a.if-link, #if-modal h2')
          .forEach((n) => {
            const en = EN_LABELS[n.textContent ?? '']
            if (en) n.textContent = en
          })
        document.getElementById('if-modal-close')?.setAttribute('aria-label', 'Close')
        document.getElementById('if-modal-overlay')?.setAttribute('aria-label', 'Legal notice')
        document
          .querySelectorAll<HTMLImageElement>('#impressum-free-widget img.if-siegel')
          .forEach((img) => {
            if (img.alt === 'Impressum geprüft') img.alt = 'Legal notice checked'
            if (img.alt === 'DSGVO geprüft') img.alt = 'GDPR-checked'
          })
      }
      observer = new MutationObserver(relabel)
      observer.observe(document.body, { childList: true, subtree: true })
      relabel()
    }

    // Widget-Skript nur einmal laden
    if (!document.getElementById('if-widget-styles') && !document.getElementById('if-widget-script')) {
      const s = document.createElement('script')
      s.id = 'if-widget-script'
      s.src = 'https://impressum-free.de/widget.js'
      s.setAttribute('data-domain', 'email-checken.de')
      document.head.appendChild(s)
    }

    return () => observer?.disconnect()
  }, [lang])

  return <span id="impressum-free-widget" />
}
