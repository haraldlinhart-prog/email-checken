export const runtime = 'edge'

const SUPABASE_URL = 'https://frbvsdumltlzisddrlbi.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || ''

// DNSBLs to check (queried via DNS lookup pattern)
const DNSBL_LIST = [
  'zen.spamhaus.org',
  'bl.spamcop.net',
  'dnsbl.sorbs.net',
  'b.barracudacentral.org',
  'dnsbl-1.uceprotect.net',
]

// Common DKIM selectors to try
const DKIM_SELECTORS = ['default', 'google', 'mail', 'k1', 'selector1', 'selector2', 'dkim', 's1', 's2']

interface CheckResult {
  id: string
  label: string
  status: 'pass' | 'fail' | 'warn'
  detail: string
}

async function dnsQuery(name: string, type: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
      { headers: { Accept: 'application/dns-json' } }
    )
    if (!res.ok) return []
    const data = await res.json() as { Answer?: { data: string }[] }
    return (data.Answer || []).map((r) => r.data.replace(/"/g, '').trim())
  } catch {
    return []
  }
}

async function checkSPF(domain: string): Promise<CheckResult> {
  const records = await dnsQuery(domain, 'TXT')
  const spf = records.find(r => r.startsWith('v=spf1'))
  if (!spf) {
    return { id: 'spf', label: 'SPF-Record', status: 'fail', detail: 'Kein SPF-Record gefunden. E-Mails können in Ihrem Namen gefälscht werden.' }
  }
  if (spf.includes('+all')) {
    return { id: 'spf', label: 'SPF-Record', status: 'fail', detail: 'SPF mit "+all" gefunden – dies erlaubt jedem das Versenden! Bitte auf "-all" oder "~all" ändern.' }
  }
  if (spf.includes('~all')) {
    return { id: 'spf', label: 'SPF-Record', status: 'warn', detail: `SPF vorhanden, aber "~all" (SoftFail). Empfehlung: "-all" für harte Ablehnung. Record: ${spf.substring(0, 80)}` }
  }
  return { id: 'spf', label: 'SPF-Record', status: 'pass', detail: `SPF korrekt konfiguriert mit "-all". ${spf.substring(0, 80)}${spf.length > 80 ? '…' : ''}` }
}

async function checkDMARC(domain: string): Promise<CheckResult> {
  const records = await dnsQuery(`_dmarc.${domain}`, 'TXT')
  const dmarc = records.find(r => r.startsWith('v=DMARC1'))
  if (!dmarc) {
    return { id: 'dmarc', label: 'DMARC-Record', status: 'fail', detail: 'Kein DMARC-Record gefunden. Ohne DMARC kein Schutz vor E-Mail-Spoofing.' }
  }
  if (dmarc.includes('p=none')) {
    return { id: 'dmarc', label: 'DMARC-Record', status: 'warn', detail: `DMARC vorhanden, aber Policy "none" schützt nicht aktiv. Empfehlung: p=quarantine oder p=reject. Record: ${dmarc.substring(0, 80)}` }
  }
  const policy = dmarc.match(/p=(quarantine|reject)/)?.[1] || 'unknown'
  return { id: 'dmarc', label: 'DMARC-Record', status: 'pass', detail: `DMARC aktiv mit Policy "${policy}". ${dmarc.substring(0, 80)}${dmarc.length > 80 ? '…' : ''}` }
}

async function checkDKIM(domain: string): Promise<CheckResult> {
  for (const selector of DKIM_SELECTORS) {
    const records = await dnsQuery(`${selector}._domainkey.${domain}`, 'TXT')
    const dkim = records.find(r => r.includes('v=DKIM1') || r.includes('k=rsa') || r.includes('p='))
    if (dkim) {
      return { id: 'dkim', label: 'DKIM-Signatur', status: 'pass', detail: `DKIM-Record gefunden (Selektor: ${selector}). Digitale Signatur ist konfiguriert.` }
    }
  }
  return { id: 'dkim', label: 'DKIM-Signatur', status: 'warn', detail: `Kein DKIM-Record bei gängigen Selektoren gefunden (${DKIM_SELECTORS.slice(0, 4).join(', ')}, …). Prüfen Sie Ihren Mail-Provider.` }
}

async function checkMX(domain: string): Promise<{ result: CheckResult; mxIPs: string[] }> {
  const records = await dnsQuery(domain, 'MX')
  const mxIPs: string[] = []
  if (!records.length) {
    return { result: { id: 'mx', label: 'MX-Records', status: 'fail', detail: 'Keine MX-Records gefunden. Die Domain kann keine E-Mails empfangen.' }, mxIPs }
  }
  // Resolve first MX to IP
  const firstMX = records[0].replace(/^\d+\s+/, '').replace(/\.$/, '')
  const aRecords = await dnsQuery(firstMX, 'A')
  if (aRecords.length) mxIPs.push(...aRecords.slice(0, 2))
  return {
    result: { id: 'mx', label: 'MX-Records', status: 'pass', detail: `${records.length} MX-Record(s) gefunden: ${records.slice(0, 2).map(r => r.replace(/^\d+\s+/, '')).join(', ')}${records.length > 2 ? ` (+${records.length - 2} weitere)` : ''}` },
    mxIPs
  }
}

async function checkBlacklists(domain: string, mxIPs: string[]): Promise<CheckResult> {
  const toCheck = mxIPs.slice(0, 2) // only check first 2 MX IPs

  if (!toCheck.length) {
    return { id: 'blacklist', label: 'Blacklist-Check', status: 'warn', detail: 'Konnte keine MX-IP-Adressen auflösen für den Blacklist-Check.' }
  }

  const listed: string[] = []

  for (const ip of toCheck) {
    const parts = ip.split('.').reverse().join('.')
    for (const bl of DNSBL_LIST) {
      const lookup = `${parts}.${bl}`
      const res = await dnsQuery(lookup, 'A')
      // Valid DNSBL hits return 127.0.0.x (x=2-11); 127.255.255.254 = query error, not a listing
      const realHit = res.some(r => r.startsWith('127.') && r !== '127.255.255.254' && r !== '127.255.255.255')
      if (realHit) {
        listed.push(`${ip} auf ${bl}`)
      }
    }
  }

  if (listed.length) {
    return {
      id: 'blacklist',
      label: 'Blacklist-Check',
      status: 'fail',
      detail: `⛔ Domain-IP auf ${listed.length} Blockliste(n) gefunden: ${listed.join('; ')}`
    }
  }

  return {
    id: 'blacklist',
    label: 'Blacklist-Check',
    status: 'pass',
    detail: `Keine Einträge auf ${DNSBL_LIST.length} geprüften Blocklisten (Spamhaus, SpamCop, SORBS, Barracuda, UCEPROTECT).`
  }
}

async function checkPTR(mxIPs: string[]): Promise<CheckResult> {
  if (!mxIPs.length) {
    return { id: 'ptr', label: 'Reverse DNS (PTR)', status: 'warn', detail: 'Keine MX-IP verfügbar für PTR-Prüfung.' }
  }
  const ip = mxIPs[0]
  const reverse = ip.split('.').reverse().join('.') + '.in-addr.arpa'
  const ptr = await dnsQuery(reverse, 'PTR')
  if (!ptr.length) {
    return { id: 'ptr', label: 'Reverse DNS (PTR)', status: 'warn', detail: `Kein PTR-Record für ${ip}. Viele Mailserver lehnen E-Mails ohne Reverse DNS ab.` }
  }
  return { id: 'ptr', label: 'Reverse DNS (PTR)', status: 'pass', detail: `PTR-Record für ${ip}: ${ptr[0]}` }
}

async function checkMTASTS(domain: string): Promise<CheckResult> {
  const records = await dnsQuery(`_mta-sts.${domain}`, 'TXT')
  const mtasts = records.find(r => r.startsWith('v=STSv1'))
  if (!mtasts) {
    return { id: 'mtasts', label: 'MTA-STS', status: 'warn', detail: 'Kein MTA-STS-Record gefunden. MTA-STS erzwingt verschlüsselte E-Mail-Übertragung.' }
  }
  return { id: 'mtasts', label: 'MTA-STS', status: 'pass', detail: `MTA-STS konfiguriert: ${mtasts}` }
}

async function checkTLSRPT(domain: string): Promise<CheckResult> {
  const records = await dnsQuery(`_smtp._tls.${domain}`, 'TXT')
  const tlsrpt = records.find(r => r.startsWith('v=TLSRPTv1'))
  if (!tlsrpt) {
    return { id: 'tlsrpt', label: 'TLS-Reporting (TLSRPT)', status: 'warn', detail: 'Kein TLSRPT-Record. TLS-Reporting informiert Sie über Zustellungsfehler.' }
  }
  return { id: 'tlsrpt', label: 'TLS-Reporting (TLSRPT)', status: 'pass', detail: `TLSRPT aktiv: ${tlsrpt}` }
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
// Rot: Blacklist-Eintrag ODER SPF+DMARC beide fail (score < 40)
// Gelb: score 40-69 ODER unwichtige Checks (dkim/mtasts/tlsrpt) schlagen fehl
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
  const domain = url.searchParams.get('domain')?.toLowerCase().replace(/^www\./, '') || ''

  if (!domain || !/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]\.[a-z]{2,}$/.test(domain)) {
    return Response.json({ error: 'Ungültige Domain' }, { status: 400 })
  }

  const [spf, dmarc, dkim, { result: mx, mxIPs }] = await Promise.all([
    checkSPF(domain),
    checkDMARC(domain),
    checkDKIM(domain),
    checkMX(domain),
  ])

  const [blacklist, ptr, mtasts, tlsrpt] = await Promise.all([
    checkBlacklists(domain, mxIPs),
    checkPTR(mxIPs),
    checkMTASTS(domain),
    checkTLSRPT(domain),
  ])

  const results = [spf, dmarc, dkim, mx, blacklist, ptr, mtasts, tlsrpt]
  const score = calculateScore(results)

  const color = badgeColor(results, score)
  await saveToSupabase(domain, score, results)

  return Response.json({ domain, score, badge_color: color }, {
    headers: { 'Cache-Control': 'public, max-age=300' }
  })
}
