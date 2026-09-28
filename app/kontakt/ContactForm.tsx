'use client'
import { useState } from 'react'

const SUBJECTS = [
  'E-Mail-Sicherheit verbessern',
  'Ergebnis meines Checks',
  'Blacklist-Eintrag entfernen',
  'SPF/DKIM/DMARC Hilfe',
  'Sonstiges',
]

export default function ContactForm() {
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

  if (status === 'ok') return <p style={{ color: '#16a34a', fontWeight: 600 }}>✅ Nachricht gesendet – wir melden uns bald!</p>

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '520px' }}>
      <input style={{ padding: '0.6rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)', fontSize: '1rem' }}
        placeholder="Ihr Name" value={form.name} onChange={e => set('name', e.target.value)} required />
      <input type="email" style={{ padding: '0.6rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)', fontSize: '1rem' }}
        placeholder="Ihre E-Mail" value={form.email} onChange={e => set('email', e.target.value)} required />
      <select style={{ padding: '0.6rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)', fontSize: '1rem' }}
        value={form.subject} onChange={e => set('subject', e.target.value)}>
        {SUBJECTS.map(s => <option key={s}>{s}</option>)}
      </select>
      <textarea style={{ padding: '0.6rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)', fontSize: '1rem', minHeight: '120px', resize: 'vertical' }}
        placeholder="Ihre Nachricht" value={form.message} onChange={e => set('message', e.target.value)} required />
      <input type="text" name="hp" value={form.hp} onChange={e => set('hp', e.target.value)} style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
      <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Mit dem Absenden stimmen Sie der Verarbeitung gemäß unserer <a href="/datenschutz" style={{ color: 'var(--accent)' }}>Datenschutzerklärung</a> zu.</p>
      <button className="btn" type="submit" disabled={status === 'sending'} style={{ alignSelf: 'flex-start' }}>
        {status === 'sending' ? 'Sende…' : 'Nachricht senden'}
      </button>
      {status === 'err' && <p style={{ color: '#dc2626', fontSize: '0.9rem' }}>Fehler beim Senden. Bitte versuchen Sie es erneut.</p>}
    </form>
  )
}
