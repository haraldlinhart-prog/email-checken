// Cron-Route: re-checks all domains older than 13 days
// Called by Vercel Cron every 14 days (see vercel.json)
// Protected by CRON_SECRET env var

export const runtime = 'nodejs'
export const maxDuration = 60

const SUPABASE_URL = 'https://frbvsdumltlzisddrlbi.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || ''
const CHECK_BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://email-checken.de'

export async function GET(req: Request) {
  // Verify cron secret
  const secret = new URL(req.url).searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!SUPABASE_KEY) return Response.json({ error: 'No Supabase key' }, { status: 500 })

  // Get all domains last checked > 13 days ago (or never)
  const cutoff = new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString()
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/email_checks?select=domain&or=(last_checked_at.lt.${cutoff},last_checked_at.is.null)&order=last_checked_at.asc.nullsfirst&limit=50`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  )
  const rows = await res.json() as { domain: string }[]
  if (!rows?.length) return Response.json({ rechecked: 0 })

  // Re-check each domain sequentially (rate limit friendly)
  let done = 0
  for (const { domain } of rows) {
    try {
      await fetch(`${CHECK_BASE}/api/check?domain=${encodeURIComponent(domain)}`)
      done++
      // small delay to avoid hammering DNS
      await new Promise(r => setTimeout(r, 500))
    } catch { /* non-fatal, continue */ }
  }

  return Response.json({ rechecked: done, total: rows.length })
}
