export const runtime = 'edge'

const SUPABASE_URL = 'https://frbvsdumltlzisddrlbi.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || ''

export async function GET(req: Request) {
  const domain = new URL(req.url).searchParams.get('domain')?.toLowerCase().replace(/^www\./, '') || ''
  if (!domain) return Response.json({ error: 'Domain fehlt' }, { status: 400 })
  if (!SUPABASE_KEY) return Response.json({ error: 'Keine Supabase-Verbindung' }, { status: 500 })

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/email_checks?domain=eq.${encodeURIComponent(domain)}&select=score,badge_color,check_results,last_checked_at`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  )
  const rows = await res.json() as { score: number; badge_color: string; check_results: unknown; last_checked_at: string }[]
  if (!rows?.[0]) return Response.json({ error: 'Keine Ergebnisse gefunden' }, { status: 404 })

  return Response.json({
    domain,
    score: rows[0].score,
    badge_color: rows[0].badge_color,
    results: rows[0].check_results,
    last_checked_at: rows[0].last_checked_at,
  })
}
