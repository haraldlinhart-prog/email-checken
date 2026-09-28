'use client'
import { useState, useRef } from 'react'

interface CheckResult {
  id: string
  label: string
  status: 'pass' | 'fail' | 'warn'
  detail: string
}

interface CheckResponse {
  domain: string
  score: number
  badge_color?: string
  error?: string
}

interface ResultsResponse {
  domain: string
  score: number
  badge_color?: string
  results: CheckResult[]
  last_checked_at?: string
  error?: string
}

export default function CheckForm() {
  const [domain, setDomain] = useState('')
  const [checkedDomain, setCheckedDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<CheckResponse | null>(null)
  const [results, setResults] = useState<ResultsResponse | null>(null)
  const [loadingResults, setLoadingResults] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const codeRef = useRef<HTMLElement>(null)

  function copyEmbedCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function handleBadgeInstalled() {
    if (!data) return
    setLoadingResults(true)
    try {
      const res = await fetch(`/api/results?domain=${encodeURIComponent(data.domain)}`)
      const json = await res.json()
      setResults(json)
    } catch {
      setResults(null)
    } finally {
      setLoadingResults(false)
    }
  }

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
      setResults(null)
      setCheckedDomain(json.domain)
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
          <div className="badge-section">
            <h3>🔖 Schritt 1: Siegel auf Ihrer Website einbinden</h3>
            <p className="badge-intro">Binden Sie dieses Siegel jetzt ein – es zeigt Ihren Besuchern, dass Ihre E-Mails sicher konfiguriert sind. Es aktualisiert sich automatisch alle 14 Tage.</p>
            <div className="badge-preview">
              <img src={`https://email-checken.de/badge/${data.domain}`} alt="E-Mail Sicherheits-Siegel" style={{ display: 'block' }} />
            </div>
            <p className="badge-code-label">Einbettungs-Code (kopieren &amp; auf Ihrer Website einfügen):</p>
            <div className="badge-code-row">
              <code ref={codeRef} className="badge-code">{`<img src="https://email-checken.de/badge/${data.domain}" alt="E-Mail Sicherheit geprüft">`}</code>
              <button
                className="btn btn-copy"
                onClick={() => copyEmbedCode(`<img src="https://email-checken.de/badge/${data.domain}" alt="E-Mail Sicherheit geprüft">`)}
              >
                {copied ? '✓ Kopiert' : 'Kopieren'}
              </button>
            </div>

            {!results && (
              <button
                className="btn btn-installed"
                onClick={handleBadgeInstalled}
                disabled={loadingResults}
              >
                {loadingResults ? 'Lade Ergebnisse…' : '✓ Siegel ist eingebaut – Testergebnisse anzeigen'}
              </button>
            )}
          </div>

          {results && results.results && (
            <>
              <div className="score-bar">
                <div className="score-num">{results.score}<span style={{ fontSize: '1.2rem', fontWeight: 400 }}>/100</span></div>
                <div className="score-label">E-Mail-Sicherheits-Score für <strong>{results.domain}</strong></div>
              </div>

              <div className="results">
                {results.results.map((r: CheckResult) => (
                  <div key={r.id} className={`result-item ${r.status}`}>
                    <span className="icon">{iconFor(r.status)}</span>
                    <div>
                      <div className="label">{r.label}</div>
                      <div className="detail">{r.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
