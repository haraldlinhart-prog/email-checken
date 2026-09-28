'use client'
import { useState } from 'react'

interface CheckResult {
  id: string
  label: string
  status: 'pass' | 'fail' | 'warn'
  detail: string
}

interface ApiResponse {
  domain: string
  score: number
  results: CheckResult[]
  error?: string
}

export default function CheckForm() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ApiResponse | null>(null)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const d = domain.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase()
    if (!d) return
    setLoading(true)
    setData(null)
    setError('')
    try {
      const res = await fetch(`/api/check?domain=${encodeURIComponent(d)}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Fehler beim Check')
      setData(json)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setLoading(false)
    }
  }

  const iconFor = (s: 'pass' | 'fail' | 'warn') =>
    s === 'pass' ? '✅' : s === 'fail' ? '❌' : '⚠️'

  return (
    <div className="check-form">
      <form onSubmit={handleSubmit}>
        <div className="input-row">
          <input
            type="text"
            placeholder="ihre-domain.de"
            value={domain}
            onChange={e => setDomain(e.target.value)}
            required
          />
          <button className="btn" type="submit" disabled={loading}>
            {loading ? <span className="loading-dots">Prüfe</span> : 'Prüfen'}
          </button>
        </div>
        <p className="hint">Domain oder E-Mail-Adresse eingeben – wir prüfen die zugehörige Domain.</p>
      </form>

      {error && <p style={{ color: '#dc2626', marginTop: '1rem', fontSize: '0.9rem' }}>{error}</p>}

      {data && (
        <>
          <div className="score-bar">
            <div className="score-num">{data.score}<span style={{ fontSize: '1.2rem', fontWeight: 400 }}>/100</span></div>
            <div className="score-label">E-Mail-Sicherheits-Score für <strong>{data.domain}</strong></div>
          </div>

          <div className="results">
            {data.results.map(r => (
              <div key={r.id} className={`result-item ${r.status}`}>
                <span className="icon">{iconFor(r.status)}</span>
                <div>
                  <div className="label">{r.label}</div>
                  <div className="detail">{r.detail}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="badge-section">
            <h3>📧 E-Mail-Siegel einbinden</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Zeigen Sie Ihren Kunden, dass Ihre E-Mails sicher sind:</p>
            <code>{`<img src="https://email-checken.de/badge/${data.domain}" alt="E-Mail geprüft" />`}</code>
          </div>
        </>
      )}
    </div>
  )
}
