export const runtime = 'edge'

const SUPABASE_URL = 'https://frbvsdumltlzisddrlbi.supabase.co'
// Serverseitig mit dem Service-Key; Anon-Key nur Übergang bis RLS aktiv ist.
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || ''

// DNSBLs to check (queried via DNS lookup pattern).
// Only lists that actually answer queries from Cloudflare's public resolver:
// Spamhaus blocks public resolvers (always returns 127.255.255.254 without a
// DQS key) and SORBS was shut down in 2024, so both would only fake a "clean" result.
const DNSBLS = [
  { zone: 'bl.spamcop.net', name: 'SpamCop' },
  { zone: 'b.barracudacentral.org', name: 'Barracuda' },
  { zone: 'dnsbl-1.uceprotect.net', name: 'UCEPROTECT' },
  { zone: 'psbl.surriel.com', name: 'PSBL' },
  { zone: 'bl.mailspike.net', name: 'Mailspike' },
]

// Common DKIM selectors to try
const DKIM_SELECTORS = ['default', 'google', 'mail', 'k1', 'selector1', 'selector2', 'dkim', 's1', 's2']

type Lang = 'de' | 'en'

interface CheckResult {
  id: string
  label: string
  status: 'pass' | 'fail' | 'warn'
  detail: string
}

// Every check produces its texts in both languages. German is what gets stored
// in Supabase (unchanged behaviour); English is only returned to the /en UI.
interface BiResult {
  id: string
  status: 'pass' | 'fail' | 'warn'
  label: Record<Lang, string>
  detail: Record<Lang, string>
}

function res(id: string, status: BiResult['status'], label: Record<Lang, string>, de: string, en: string): BiResult {
  return { id, status, label, detail: { de, en } }
}

function pick(results: BiResult[], lang: Lang): CheckResult[] {
  return results.map(r => ({ id: r.id, label: r.label[lang], status: r.status, detail: r.detail[lang] }))
}

// Shortens long DNS records for display, with an ellipsis when cut.
function short(s: string, max = 80) {
  return s.length > max ? `${s.substring(0, max)}…` : s
}

const L = {
  spf: { de: 'SPF-Record', en: 'SPF record' },
  dmarc: { de: 'DMARC-Record', en: 'DMARC record' },
  dkim: { de: 'DKIM-Signatur', en: 'DKIM signature' },
  mx: { de: 'MX-Records', en: 'MX records' },
  blacklist: { de: 'Blacklist-Check', en: 'Blacklist check' },
  ptr: { de: 'Reverse DNS (PTR)', en: 'Reverse DNS (PTR)' },
  mtasts: { de: 'MTA-STS', en: 'MTA-STS' },
  tlsrpt: { de: 'TLS-Reporting (TLSRPT)', en: 'TLS reporting (TLSRPT)' },
}

const RR_TYPE: Record<string, number> = { A: 1, PTR: 12, MX: 15, TXT: 16 }

async function dnsQuery(name: string, type: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
      { headers: { Accept: 'application/dns-json' } }
    )
    if (!res.ok) return []
    const data = await res.json() as { Answer?: { type: number; data: string }[] }
    return (data.Answer || [])
      // Ignore CNAME answers that precede the requested record type
      .filter(r => r.type === RR_TYPE[type])
      // Long TXT records are split into several quoted strings: join them without gaps
      .map(r => r.data.replace(/"\s*"/g, '').replace(/"/g, '').trim())
  } catch {
    return []
  }
}

async function checkSPF(domain: string): Promise<BiResult> {
  const records = await dnsQuery(domain, 'TXT')
  const spfs = records.filter(r => /^v=spf1(\s|$)/i.test(r))
  if (!spfs.length) {
    return res('spf', 'fail', L.spf,
      'Kein SPF-Record gefunden. E-Mails können in Ihrem Namen gefälscht werden.',
      'No SPF record found. Anyone can send forged email in your name.')
  }
  if (spfs.length > 1) {
    return res('spf', 'fail', L.spf,
      `${spfs.length} SPF-Records gefunden – erlaubt ist genau einer (RFC 7208). Empfänger werten SPF deshalb als Fehler. Bitte zu einem Record zusammenführen.`,
      `${spfs.length} SPF records found – only one is allowed (RFC 7208), so receivers treat SPF as an error. Please merge them into a single record.`)
  }
  const spf = spfs[0]
  const rec = short(spf)
  const all = spf.toLowerCase().match(/(?:^|\s)([+?~-]?)all(?:\s|$)/)
  if (all && (all[1] === '+' || all[1] === '')) {
    return res('spf', 'fail', L.spf,
      `SPF-Record endet mit "+all" – damit darf jeder in Ihrem Namen E-Mails versenden! Bitte auf "-all" oder "~all" ändern. Record: ${rec}`,
      `SPF record ends with "+all" – this allows anyone to send email for your domain! Change it to "-all" or "~all". Record: ${rec}`)
  }
  if (all && all[1] === '~') {
    return res('spf', 'warn', L.spf,
      `SPF vorhanden, aber mit "~all" (SoftFail). Empfehlung: "-all", damit nicht autorisierte E-Mails abgelehnt werden. Record: ${rec}`,
      `SPF is in place, but uses "~all" (soft fail). We recommend "-all" so unauthorized email is rejected. Record: ${rec}`)
  }
  if (all && all[1] === '?') {
    return res('spf', 'warn', L.spf,
      `SPF vorhanden, aber mit "?all" (Neutral) – das schützt nicht vor gefälschten Absendern. Empfehlung: "-all". Record: ${rec}`,
      `SPF is in place, but uses "?all" (neutral), which doesn't protect against forged senders. We recommend "-all". Record: ${rec}`)
  }
  if (all) {
    return res('spf', 'pass', L.spf,
      `SPF korrekt konfiguriert mit "-all". Record: ${rec}`,
      `SPF is configured correctly with "-all". Record: ${rec}`)
  }
  if (/(?:^|\s)redirect=/i.test(spf)) {
    return res('spf', 'pass', L.spf,
      `SPF vorhanden; die Richtlinie wird per "redirect=" von einer anderen Domain übernommen. Record: ${rec}`,
      `SPF is in place; the policy is taken over from another domain via "redirect=". Record: ${rec}`)
  }
  return res('spf', 'warn', L.spf,
    `SPF vorhanden, aber ohne abschließendes "all" – nicht autorisierte Absender werden nicht abgelehnt. Empfehlung: mit "-all" abschließen. Record: ${rec}`,
    `SPF is in place, but has no closing "all" mechanism, so unauthorized senders aren't rejected. We recommend ending it with "-all". Record: ${rec}`)
}

async function checkDMARC(domain: string): Promise<BiResult> {
  const records = await dnsQuery(`_dmarc.${domain}`, 'TXT')
  const dmarc = records.find(r => /^v=DMARC1/i.test(r))
  if (!dmarc) {
    return res('dmarc', 'fail', L.dmarc,
      'Kein DMARC-Record gefunden. Ohne DMARC kein Schutz vor E-Mail-Spoofing.',
      'No DMARC record found. Without DMARC, your domain has no protection against email spoofing.')
  }
  const rec = short(dmarc)
  // Read the p= tag exactly (sp= is the subdomain policy and must not be confused with it)
  const tags = new Map(dmarc.split(';').map(t => {
    const [k, ...v] = t.split('=')
    return [k.trim().toLowerCase(), v.join('=').trim().toLowerCase()] as [string, string]
  }))
  const policy = tags.get('p')
  if (policy === 'quarantine' || policy === 'reject') {
    return res('dmarc', 'pass', L.dmarc,
      `DMARC aktiv mit Policy "${policy}". Record: ${rec}`,
      `DMARC is active with policy "${policy}". Record: ${rec}`)
  }
  if (policy === 'none') {
    return res('dmarc', 'warn', L.dmarc,
      `DMARC vorhanden, aber Policy "none" schützt nicht aktiv. Empfehlung: p=quarantine oder p=reject. Record: ${rec}`,
      `DMARC is in place, but the policy "none" doesn't actively protect you. We recommend p=quarantine or p=reject. Record: ${rec}`)
  }
  return res('dmarc', 'warn', L.dmarc,
    `DMARC-Record ohne gültige Policy (p=none, quarantine oder reject). Record: ${rec}`,
    `DMARC record without a valid policy (p=none, quarantine or reject). Record: ${rec}`)
}

async function checkDKIM(domain: string): Promise<BiResult> {
  for (const selector of DKIM_SELECTORS) {
    const records = await dnsQuery(`${selector}._domainkey.${domain}`, 'TXT')
    const dkim = records.find(r => r.includes('v=DKIM1') || r.includes('k=rsa') || r.includes('p='))
    if (dkim) {
      return res('dkim', 'pass', L.dkim,
        `DKIM-Record gefunden (Selektor: ${selector}). Die digitale Signatur ist eingerichtet.`,
        `DKIM record found (selector: ${selector}). Your digital signature is set up.`)
    }
  }
  const sel = `${DKIM_SELECTORS.slice(0, 4).join(', ')} …`
  return res('dkim', 'warn', L.dkim,
    `Kein DKIM-Record bei gängigen Selektoren gefunden (${sel}). Prüfen Sie die DKIM-Einstellungen bei Ihrem Mail-Provider.`,
    `No DKIM record found for common selectors (${sel}). Check the DKIM settings with your email provider.`)
}

async function checkMX(domain: string): Promise<{ result: BiResult; mxIPs: string[] }> {
  const raw = await dnsQuery(domain, 'MX')
  const mxIPs: string[] = []
  if (!raw.length) {
    return {
      result: res('mx', 'fail', L.mx,
        'Keine MX-Records gefunden. Die Domain kann keine E-Mails empfangen.',
        'No MX records found. This domain cannot receive email.'),
      mxIPs,
    }
  }
  // Sort by priority (lowest value = primary mail server), strip trailing dots
  const records = raw
    .map(r => {
      const m = r.match(/^(\d+)\s+(.+)$/)
      return { prio: m ? Number(m[1]) : 0, host: (m ? m[2] : r).replace(/\.$/, '') }
    })
    .sort((a, b) => a.prio - b.prio)
  if (records.every(r => r.host === '')) {
    return {
      result: res('mx', 'fail', L.mx,
        'Die Domain hat einen Null-MX-Record (RFC 7505) und nimmt ausdrücklich keine E-Mails an.',
        'This domain has a null MX record (RFC 7505) and explicitly accepts no email.'),
      mxIPs,
    }
  }
  // Resolve the primary MX to IP addresses
  const aRecords = await dnsQuery(records[0].host, 'A')
  if (aRecords.length) mxIPs.push(...aRecords.slice(0, 2))
  const list = records.slice(0, 2).map(r => r.host).join(', ')
  const more = records.length - 2
  if (!aRecords.length) {
    return {
      result: res('mx', 'warn', L.mx,
        `MX-Record vorhanden, aber der primäre Mail-Server ${records[0].host} lässt sich nicht auflösen.`,
        `MX record found, but the primary mail server ${records[0].host} doesn't resolve.`),
      mxIPs,
    }
  }
  return {
    result: res('mx', 'pass', L.mx,
      `${records.length} MX-Record${records.length === 1 ? '' : 's'} gefunden: ${list}${more > 0 ? ` (+${more} weitere)` : ''}`,
      `${records.length} MX record${records.length === 1 ? '' : 's'} found: ${list}${more > 0 ? ` (+${more} more)` : ''}`),
    mxIPs,
  }
}

async function checkBlacklists(mxIPs: string[]): Promise<BiResult> {
  const toCheck = mxIPs.slice(0, 2) // only check the first 2 IPs of the primary MX

  if (!toCheck.length) {
    return res('blacklist', 'warn', L.blacklist,
      'Für den Blacklist-Check konnten keine IP-Adressen der Mail-Server ermittelt werden.',
      'Could not resolve any mail server IP addresses for the blacklist check.')
  }

  const lookups = toCheck.flatMap(ip => DNSBLS.map(bl => ({ ip, bl })))
  const answers = await Promise.all(lookups.map(({ ip, bl }) =>
    dnsQuery(`${ip.split('.').reverse().join('.')}.${bl.zone}`, 'A')))
  // Valid DNSBL hits return 127.0.0.x; 127.255.255.x are query errors, not listings
  const listed = lookups.filter((_, i) =>
    answers[i].some(x => x.startsWith('127.') && !x.startsWith('127.255.255.')))

  const names = DNSBLS.map(b => b.name).join(', ')
  if (listed.length) {
    const de = listed.map(l => `${l.ip} auf ${l.bl.name}`).join('; ')
    const en = listed.map(l => `${l.ip} on ${l.bl.name}`).join('; ')
    return res('blacklist', 'fail', L.blacklist,
      `Mail-Server-IP auf ${listed.length} Blockliste${listed.length === 1 ? '' : 'n'} gefunden: ${de}`,
      `Mail server IP found on ${listed.length} blocklist${listed.length === 1 ? '' : 's'}: ${en}`)
  }

  return res('blacklist', 'pass', L.blacklist,
    `Keine Einträge auf den ${DNSBLS.length} geprüften Blocklisten (${names}).`,
    `Not listed on any of the ${DNSBLS.length} blocklists checked (${names}).`)
}

async function checkPTR(mxIPs: string[]): Promise<BiResult> {
  if (!mxIPs.length) {
    return res('ptr', 'warn', L.ptr,
      'Für die PTR-Prüfung ist keine IP-Adresse eines Mail-Servers verfügbar.',
      'No mail server IP address available for the PTR check.')
  }
  const ip = mxIPs[0]
  const reverse = ip.split('.').reverse().join('.') + '.in-addr.arpa'
  const ptr = await dnsQuery(reverse, 'PTR')
  if (!ptr.length) {
    return res('ptr', 'warn', L.ptr,
      `Kein PTR-Record für ${ip}. Viele Mail-Server lehnen E-Mails von Servern ohne Reverse DNS ab.`,
      `No PTR record for ${ip}. Many mail servers reject email from servers without reverse DNS.`)
  }
  const host = ptr[0].replace(/\.$/, '')
  return res('ptr', 'pass', L.ptr,
    `PTR-Record für ${ip}: ${host}`,
    `PTR record for ${ip}: ${host}`)
}

async function checkMTASTS(domain: string): Promise<BiResult> {
  const records = await dnsQuery(`_mta-sts.${domain}`, 'TXT')
  const mtasts = records.find(r => r.startsWith('v=STSv1'))
  if (!mtasts) {
    return res('mtasts', 'warn', L.mtasts,
      'Kein MTA-STS-Record gefunden. MTA-STS erzwingt die verschlüsselte Zustellung von E-Mails an Ihre Domain.',
      'No MTA-STS record found. MTA-STS enforces encrypted email delivery to your domain.')
  }
  return res('mtasts', 'pass', L.mtasts,
    `MTA-STS ist eingerichtet: ${short(mtasts)}`,
    `MTA-STS is configured: ${short(mtasts)}`)
}

async function checkTLSRPT(domain: string): Promise<BiResult> {
  const records = await dnsQuery(`_smtp._tls.${domain}`, 'TXT')
  const tlsrpt = records.find(r => r.startsWith('v=TLSRPTv1'))
  if (!tlsrpt) {
    return res('tlsrpt', 'warn', L.tlsrpt,
      'Kein TLSRPT-Record gefunden. TLS-Reporting informiert Sie über Probleme bei der verschlüsselten Zustellung.',
      'No TLSRPT record found. TLS reporting notifies you about problems with encrypted delivery.')
  }
  return res('tlsrpt', 'pass', L.tlsrpt,
    `TLSRPT ist aktiv: ${short(tlsrpt)}`,
    `TLSRPT is active: ${short(tlsrpt)}`)
}

function calculateScore(results: CheckResult[]): number {
  const weights: Record<string, number> = {
    spf: 25, dmarc: 25, dkim: 20, mx: 10, blacklist: 10, ptr: 5, mtasts: 3, tlsrpt: 2
  }
  let score = 0
  for (const r of results) {
    const w = weights[r.id] || 5
    if (r.status === 'pass') score += w
    else if (r.status === 'warn') score += Math.floor(w * 0.4)
  }
  return Math.min(100, score)
}

// Ampel-Logik: grün / gelb / rot
// Rot: Blacklist-Eintrag ODER SPF+DMARC beide fail ODER score < 40
// Gelb: score 40-69
// Grün: score >= 70 UND kein Blacklist-fail
function badgeColor(results: CheckResult[], score: number): 'green' | 'yellow' | 'red' {
  const get = (id: string) => results.find(r => r.id === id)
  const blacklistFail = get('blacklist')?.status === 'fail'
  const spfFail = get('spf')?.status === 'fail'
  const dmarcFail = get('dmarc')?.status === 'fail'
  if (blacklistFail || (spfFail && dmarcFail) || score < 40) return 'red'
  if (score < 70) return 'yellow'
  return 'green'
}

async function saveToSupabase(domain: string, score: number, results: CheckResult[]) {
  if (!SUPABASE_KEY) return
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/email_checks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        domain,
        score,
        last_checked_at: new Date().toISOString(),
        check_results: results,
        badge_verified: score >= 70,
        badge_color: badgeColor(results, score),
      }),
    })
  } catch { /* non-fatal */ }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const lang: Lang = url.searchParams.get('lang') === 'en' ? 'en' : 'de'
  const domain = url.searchParams.get('domain')?.toLowerCase().replace(/^www\./, '') || ''

  // Last label: letters, or a punycode TLD (xn--…) for internationalized domains
  if (!domain || !/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]\.(?:[a-z]{2,}|xn--[a-z0-9-]+)$/.test(domain)) {
    return Response.json({
      error: lang === 'en'
        ? 'Please enter a valid domain (e.g. example.com).'
        : 'Bitte geben Sie eine gültige Domain ein (z. B. beispiel.de).',
    }, { status: 400 })
  }

  const [spf, dmarc, dkim, { result: mx, mxIPs }] = await Promise.all([
    checkSPF(domain),
    checkDMARC(domain),
    checkDKIM(domain),
    checkMX(domain),
  ])

  const [blacklist, ptr, mtasts, tlsrpt] = await Promise.all([
    checkBlacklists(mxIPs),
    checkPTR(mxIPs),
    checkMTASTS(domain),
    checkTLSRPT(domain),
  ])

  const bi = [spf, dmarc, dkim, mx, blacklist, ptr, mtasts, tlsrpt]
  // Stored results stay German, exactly as before.
  const results = pick(bi, 'de')
  const score = calculateScore(results)

  const color = badgeColor(results, score)
  await saveToSupabase(domain, score, results)

  // German response is unchanged; English additionally carries the translated results.
  const body = lang === 'en'
    ? { domain, score, badge_color: color, results: pick(bi, 'en') }
    : { domain, score, badge_color: color }

  return Response.json(body, {
    headers: { 'Cache-Control': 'public, max-age=300' }
  })
}
