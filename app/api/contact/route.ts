import { Resend } from 'resend'

export const runtime = 'nodejs'

const resend = new Resend(process.env.RESEND_API_KEY)
const ratemap = new Map<string, number[]>()

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const now = Date.now()
  const hits = (ratemap.get(ip) || []).filter(t => now - t < 3600000)
  if (hits.length >= 3) return Response.json({ error: 'Rate limit' }, { status: 429 })
  ratemap.set(ip, [...hits, now])

  const { name, email, subject, message, hp } = await req.json()
  if (hp) return Response.json({ ok: true })
  if (!name || !email || !message) return Response.json({ error: 'Pflichtfelder fehlen' }, { status: 400 })
  if (message.length > 4000) return Response.json({ error: 'Nachricht zu lang' }, { status: 400 })

  await resend.emails.send({
    from: 'email-checken.de <noreply@email-checken.de>',
    to: 'email@pan21.com',
    replyTo: email,
    subject: `[email-checken.de] ${subject}`,
    text: `Von: ${name} <${email}>\nBetreff: ${subject}\n\n${message}`,
  })

  return Response.json({ ok: true })
}
