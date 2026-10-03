'use client'
import { useState } from 'react'

const T = {
  de: {
    subjects: [
      'E-Mail-Sicherheit verbessern',
      'Ergebnis meines Checks',
      'Blacklist-Eintrag entfernen',
      'SPF/DKIM/DMARC Hilfe',
      'Sonstiges',
    ],
    sent: '✅ Nachricht gesendet – wir melden uns bald!',
    name: 'Ihr Name',
    email: 'Ihre E-Mail',
    subject: 'Betreff',
    message: 'Ihre Nachricht',
    consentBefore: 'Mit dem Absenden stimmen Sie der Verarbeitung gemäß unserer ',
    consentLink: 'Datenschutzerklärung',
    consentAfter: ' zu.',
    sending: 'Sende…',
    send: 'Nachricht senden',
    error: 'Fehler beim Senden. Bitte versuchen Sie es erneut.',
  },
  en: {
    subjects: [
      'Improving my email security',
      'Question about my check result',
      'Getting off a blacklist',
      'Help with SPF/DKIM/DMARC',
      'Something else',
    ],
    sent: '✅ Message sent – we’ll get back to you soon!',
    name: 'Your name',
    email: 'Your email address',
    subject: 'Subject',
    message: 'Your message',
    consentBefore: 'By sending this form, you agree to your data being processed as described in our ',
    consentLink: 'privacy policy (German)',
    consentAfter: '.',
    sending: 'Sending…',
    send: 'Send message',
    error: 'Your message could not be sent. Please try again.',
  },
}

const fieldStyle = { padding: '0.6rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)', fontSize: '1rem', width: '100%' }

export default function ContactForm({ lang = 'de' }: { lang?: 'de' | 'en' }) {
  const t = T[lang]
  const SUBJECTS = t.subjects
  const [form, setForm] = useState({ name: '', email: '', subject: SUBJECTS[0], message: '', hp: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle')

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (form.hp) return
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setStatus(res.ok ? 'ok' : 'err')
    } catch { setStatus('err') }
  }

  if (status === 'ok') return <p style={{ color: '#16a34a', fontWeight: 600 }}>{t.sent}</p>

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '520px' }}>
      <input style={fieldStyle} aria-label={t.name}
        placeholder={t.name} value={form.name} onChange={e => set('name', e.target.value)} required />
      <input type="email" style={fieldStyle} aria-label={t.email}
        placeholder={t.email} value={form.email} onChange={e => set('email', e.target.value)} required />
      <select style={fieldStyle} aria-label={t.subject}
        value={form.subject} onChange={e => set('subject', e.target.value)}>
        {SUBJECTS.map(s => <option key={s}>{s}</option>)}
      </select>
      <textarea style={{ ...fieldStyle, minHeight: '120px', resize: 'vertical' }} aria-label={t.message}
        placeholder={t.message} value={form.message} onChange={e => set('message', e.target.value)} required />
      <input type="text" name="hp" value={form.hp} onChange={e => set('hp', e.target.value)} style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
      <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{t.consentBefore}<a href="/datenschutz" hrefLang="de" style={{ color: 'var(--accent)' }}>{t.consentLink}</a>{t.consentAfter}</p>
      <button className="btn" type="submit" disabled={status === 'sending'} style={{ alignSelf: 'flex-start' }}>
        {status === 'sending' ? t.sending : t.send}
      </button>
      {status === 'err' && <p style={{ color: '#dc2626', fontSize: '0.9rem' }}>{t.error}</p>}
    </form>
  )
}
