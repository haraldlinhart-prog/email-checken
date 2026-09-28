export const runtime = 'edge'

const SUPABASE_URL = 'https://frbvsdumltlzisddrlbi.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || ''

export async function GET(_req: Request, { params }: { params: { domain: string } }) {
  const domain = params.domain.toLowerCase().replace(/^www\./, '')
  let score = 0
  let lastChecked = ''
  let verified = false

  if (SUPABASE_KEY) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/email_checks?domain=eq.${encodeURIComponent(domain)}&select=score,badge_verified,last_checked_at`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      )
      const rows = await res.json() as { score: number; badge_verified: boolean; last_checked_at: string }[]
      if (rows?.[0]) {
        score = rows[0].score
        verified = rows[0].badge_verified
        lastChecked = rows[0].last_checked_at?.split('T')[0] || ''
      }
    } catch { /* non-fatal */ }
  }

  const color = verified ? '#16a34a' : '#6b7280'
  const scoreText = score > 0 ? `${score}/100` : 'nicht geprüft'

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="56" viewBox="0 0 200 56">
  <rect width="200" height="56" rx="8" fill="${color}"/>
  <text x="100" y="18" font-family="-apple-system,sans-serif" font-size="10" font-weight="600" fill="rgba(255,255,255,0.8)" text-anchor="middle">📧 E-MAIL SICHERHEIT</text>
  <text x="100" y="36" font-family="-apple-system,sans-serif" font-size="15" font-weight="800" fill="#ffffff" text-anchor="middle">${verified ? 'GEPRÜFT' : 'NICHT GEPRÜFT'}</text>
  <text x="100" y="50" font-family="-apple-system,sans-serif" font-size="9" fill="rgba(255,255,255,0.7)" text-anchor="middle">Score: ${scoreText}${lastChecked ? ` · ${lastChecked}` : ''}</text>
</svg>`

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
