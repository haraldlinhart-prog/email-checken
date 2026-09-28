export const runtime = 'edge'

const SUPABASE_URL = 'https://frbvsdumltlzisddrlbi.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || ''

const COLORS = {
  green:  { bg: '#16a34a', label: 'GEPRÜFT ✓',       sub: 'E-Mail-Sicherheit bestätigt' },
  yellow: { bg: '#d97706', label: 'TEILWEISE OK',     sub: 'Verbesserungen empfohlen' },
  red:    { bg: '#dc2626', label: 'SICHERHEITSPROBLEM', sub: 'Blacklist oder kritischer Fehler' },
  gray:   { bg: '#6b7280', label: 'NICHT GEPRÜFT',   sub: 'Noch kein Check durchgeführt' },
}

export async function GET(_req: Request, { params }: { params: { domain: string } }) {
  const domain = params.domain.toLowerCase().replace(/^www\./, '')
  let score = 0
  let lastChecked = ''
  let colorKey: keyof typeof COLORS = 'gray'

  if (SUPABASE_KEY) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/email_checks?domain=eq.${encodeURIComponent(domain)}&select=score,badge_color,last_checked_at`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      )
      const rows = await res.json() as { score: number; badge_color: string; last_checked_at: string }[]
      if (rows?.[0]) {
        score = rows[0].score
        colorKey = (rows[0].badge_color as keyof typeof COLORS) || 'gray'
        lastChecked = rows[0].last_checked_at?.split('T')[0] || ''
      }
    } catch { /* non-fatal */ }
  }

  const { bg, label, sub } = COLORS[colorKey]
  const scoreText = score > 0 ? `Score: ${score}/100` : 'noch kein Check'
  const dateText = lastChecked ? ` · geprüft: ${lastChecked}` : ''

  // Ampel-Kreis links
  const circleColor = colorKey === 'gray' ? '#9ca3af' : bg

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60" viewBox="0 0 220 60">
  <rect width="220" height="60" rx="9" fill="${bg}"/>
  <rect x="3" y="3" width="214" height="54" rx="7" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
  <!-- icon -->
  <circle cx="30" cy="30" r="16" fill="rgba(255,255,255,0.2)"/>
  <text x="30" y="35" font-family="-apple-system,sans-serif" font-size="14" text-anchor="middle" fill="#fff">📧</text>
  <!-- divider -->
  <line x1="54" y1="10" x2="54" y2="50" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
  <!-- texts -->
  <text x="138" y="20" font-family="-apple-system,sans-serif" font-size="9" font-weight="600" fill="rgba(255,255,255,0.75)" text-anchor="middle" letter-spacing="1">E-MAIL SICHERHEIT</text>
  <text x="138" y="37" font-family="-apple-system,sans-serif" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">${label}</text>
  <text x="138" y="52" font-family="-apple-system,sans-serif" font-size="8" fill="rgba(255,255,255,0.65)" text-anchor="middle">${scoreText}${dateText}</text>
</svg>`

  const etag = `"${colorKey}-${score}-${lastChecked || 'gray'}"`
  const lastModified = lastChecked ? new Date(lastChecked).toUTCString() : new Date(0).toUTCString()

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache',
      'ETag': etag,
      'Last-Modified': lastModified,
      'Vary': 'Accept-Encoding',
    },
  })
}
