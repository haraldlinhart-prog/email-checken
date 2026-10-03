'use client'
import { useState, useRef } from 'react'

type Lang = 'de' | 'en'

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
  results?: CheckResult[]
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

const T = {
  de: {
    placeholder: 'ihre-domain.de',
    checking: 'Prüfe',
    check: 'Prüfen',
    hint: 'Domain oder E-Mail-Adresse eingeben – wir prüfen die zugehörige Domain.',
    checkError: 'Fehler beim Check',
    unknownError: 'Unbekannter Fehler',
    step1: '🔖 Schritt 1: Siegel auf Ihrer Website einbinden',
    badgeIntro: 'Binden Sie dieses Siegel jetzt ein – es zeigt Ihren Besuchern den aktuellen Sicherheitsstatus Ihrer E-Mail-Domain und aktualisiert sich automatisch etwa alle 14 Tage.',
    badgeAlt: 'E-Mail-Sicherheitssiegel',
    codeLabel: 'Einbettungscode (kopieren und auf Ihrer Website einfügen):',
    embedAlt: 'E-Mail-Sicherheit geprüft',
    copied: '✓ Kopiert',
    copy: 'Kopieren',
    loadingResults: 'Lade Ergebnisse…',
    installed: '✓ Siegel ist eingebaut – Testergebnisse anzeigen',
    scoreFor: 'E-Mail-Sicherheits-Score für',
    badgeQuery: '',
  },
  en: {
    placeholder: 'your-domain.com',
    checking: 'Checking',
    check: 'Check',
    hint: 'Enter a domain or an email address – we’ll check the domain behind it.',
    checkError: 'The check failed',
    unknownError: 'Unknown error',
    step1: '🔖 Step 1: Add the badge to your website',
    badgeIntro: 'Add this badge to your website now – it shows your visitors the current security status of your email domain and updates automatically about every 14 days.',
    badgeAlt: 'Email security badge',
    codeLabel: 'Embed code (copy it and paste it into your website):',
    embedAlt: 'Email security verified',
    copied: '✓ Copied',
    copy: 'Copy',
    loadingResults: 'Loading results…',
    installed: '✓ Badge is installed – show my results',
    scoreFor: 'Email security score for',
    badgeQuery: 'lang=en',
  },
}

export default function CheckForm({ lang = 'de' }: { lang?: Lang }) {
  const t = T[lang]
  const [domain, setDomain] = useState('')
  const [, setCheckedDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<CheckResponse | null>(null)
  const [results, setResults] = useState<ResultsResponse | null>(null)
  const [loadingResults, setLoadingResults] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [badgeBust, setBadgeBust] = useState('')
  const codeRef = useRef<HTMLElement>(null)

  // German keeps the original API calls; English asks the API for English texts.
  const langParam = lang === 'en' ? '&lang=en' : ''

  function badgeUrl(d: string, extra: string) {
    const q = [t.badgeQuery, extra].filter(Boolean).join('&')
    return `https://www.email-checken.de/badge/${d}${q ? `?${q}` : ''}`
  }

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
      // Re-run check so Supabase has fresh badge_color, then fetch results
      const checkRes = await fetch(`/api/check?domain=${encodeURIComponent(data.domain)}${langParam}`)
      // Bust badge image cache
      setBadgeBust(`t=${Date.now()}`)
      if (lang === 'en') {
        // Stored results are German; the check API returns English results directly.
        const json = await checkRes.json()
        setResults(json.results ? json : null)
      } else {
        const res = await fetch(`/api/results?domain=${encodeURIComponent(data.domain)}`)
        const json = await res.json()
        setResults(json)
      }
    } catch {
      setResults(null)
    } finally {
      setLoadingResults(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    let d = domain.trim().replace(/^https?:\/\//i, '').replace(/[/?#].*$/, '').replace(/^.*@/, '').replace(/\.$/, '').toLowerCase()
    if (!d) return
    // Internationalized domains (e.g. müller.de) are checked in their punycode form.
    try { d = new URL(`http://${d}`).hostname } catch { /* the API reports invalid input */ }
    setLoading(true)
    setData(null)
    setError('')
    try {
      const res = await fetch(`/api/check?domain=${encodeURIComponent(d)}${langParam}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || t.checkError)
      setData(json)
      setResults(null)
      setCheckedDomain(json.domain)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.unknownError)
    } finally {
      setLoading(false)
    }
  }

  const iconFor = (s: 'pass' | 'fail' | 'warn') =>
    s === 'pass' ? '✅' : s === 'fail' ? '❌' : '⚠️'

  const embedCode = data
    ? `<img src="${badgeUrl(data.domain, `v=${Math.floor(Date.now() / 86400000)}`)}" alt="${t.embedAlt}">`
    : ''

  return (
    <div className="check-form">
      <form onSubmit={handleSubmit}>
        <div className="input-row">
          <input
            type="text"
            placeholder={t.placeholder}
            aria-label={t.placeholder}
            value={domain}
            onChange={e => setDomain(e.target.value)}
            required
          />
          <button className="btn" type="submit" disabled={loading}>
            {loading ? <span className="loading-dots">{t.checking}</span> : t.check}
          </button>
        </div>
        <p className="hint">{t.hint}</p>
      </form>

      {error && <p style={{ color: '#dc2626', marginTop: '1rem', fontSize: '0.9rem' }}>{error}</p>}

      {data && (
        <>
          <div className="badge-section">
            <h3>{t.step1}</h3>
            <p className="badge-intro">{t.badgeIntro}</p>
            <div className="badge-preview">
              <img src={badgeUrl(data.domain, badgeBust)} alt={t.badgeAlt} style={{ display: 'block', maxWidth: '100%', height: 'auto' }} />
            </div>
            <p className="badge-code-label">{t.codeLabel}</p>
            <div className="badge-code-row">
              <code ref={codeRef} className="badge-code">{embedCode}</code>
              <button
                className="btn btn-copy"
                onClick={() => copyEmbedCode(embedCode)}
              >
                {copied ? t.copied : t.copy}
              </button>
            </div>

            {!results && (
              <button
                className="btn btn-installed"
                onClick={handleBadgeInstalled}
                disabled={loadingResults}
              >
                {loadingResults ? t.loadingResults : t.installed}
              </button>
            )}
          </div>

          {results && results.results && (
            <>
              <div className="score-bar">
                <div className="score-num">{results.score}<span style={{ fontSize: '1.2rem', fontWeight: 400 }}>/100</span></div>
                <div className="score-label">{t.scoreFor} <strong>{results.domain}</strong></div>
              </div>

              <div className="results">
                {results.results.map((r: CheckResult) => (
                  <div key={r.id} className={`result-item ${r.status}`}>
                    <span className="icon">{iconFor(r.status)}</span>
                    <div className="result-text">
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
