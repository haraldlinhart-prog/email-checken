'use client'
import { useEffect } from 'react'

export default function ImpressumWidget() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://pan21counter.de/widget.js'
    script.setAttribute('data-domain', 'email-checken.de')
    script.async = true
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])
  return null
}
