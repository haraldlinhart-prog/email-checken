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

async function checkSPF(domain: string): Promise<BiResult> {
  const records = await dnsQuery(domain, 'TXT')
  const spf = records.find(r => r.startsWith('v=spf1'))
  if (!spf) {
    return res('spf', 'fail', L.spf,
      'Kein SPF-Record gefunden. E-Mails können in Ihrem Namen gefälscht werden.',
      'No SPF record found. Anyone can send forged email in your name.')
  }
  if (spf.includes('+all')) {
    return res('spf', 'fail', L.spf,
      'SPF mit "+all" gefunden – dies erlaubt jedem das Versenden! Bitte auf "-all" oder "~all" ändern.',
      'SPF record uses "+all" – this allows anyone to send email for your domain! Change it to "-all" or "~all".')
  }
  if (spf.includes('~all')) {
    return res('spf', 'warn', L.spf,
      `SPF vorhanden, aber "~all" (SoftFail). Empfehlung: "-all" für harte Ablehnung. Record: ${spf.substring(0, 80)}`,
      `SPF is in place, but uses "~all" (soft fail). We recommend "-all" so unauthorized mail is rejected. Record: ${spf.substring(0, 80)}`)
  }
  const tail = `${spf.substring(0, 80)}${spf.length > 80 ? '…' : ''}`
  return res('spf', 'pass', L.spf,
    `SPF korrekt konfiguriert mit "-all". ${tail}`,
    `SPF is configured correctly with "-all". ${tail}`)
}

async function checkDMARC(domain: string): Promise<BiResult> {
  const records = await dnsQuery(`_dmarc.${domain}`, 'TXT')
  const dmarc = records.find(r => r.startsWith('v=DMARC1'))
  if (!dmarc) {
    return res('dmarc', 'fail', L.dmarc,
      'Kein DMARC-Record gefunden. Ohne DMARC kein Schutz vor E-Mail-Spoofing.',
      'No DMARC record found. Without DMARC, your domain has no protection against email spoofing.')
  }
  if (dmarc.includes('p=none')) {
    return res('dmarc', 'warn', L.dmarc,
      `DMARC vorhanden, aber Policy "none" schützt nicht aktiv. Empfehlung: p=quarantine oder p=reject. Record: ${dmarc.substring(0, 80)}`,
      `DMARC is in place, but the policy "none" doesn't actively protect you. We recommend p=quarantine or p=reject. Record: ${dmarc.substring(0, 80)}`)
  }
  const policy = dmarc.match(/p=(quarantine|reject)/)?.[1] || 'unknown'
  const tail = `${dmarc.substring(0, 80)}${dmarc.length > 80 ? '…' : ''}`
  return res('dmarc', 'pass', L.dmarc,
    `DMARC aktiv mit Policy "${policy}". ${tail}`,
    `DMARC is active with policy "${policy}". ${tail}`)
}

async function checkDKIM(domain: string): Promise<BiResult> {
  for (const selector of DKIM_SELECTORS) {
    const records = await dnsQuery(`${selector}._domainkey.${domain}`, 'TXT')
    const dkim = records.find(r => r.includes('v=DKIM1') || r.includes('k=rsa') || r.includes('p='))
    if (dkim) {
      return res('dkim', 'pass', L.dkim,
        `DKIM-Record gefunden (Selektor: ${selector}). Digitale Signatur ist konfiguriert.`,
        `DKIM record found (selector: ${selector}). Your digital signature is set up.`)
    }
  }
  const sel = `${DKIM_SELECTORS.slice(0, 4).join(', ')}, …`
  return res('dkim', 'warn', L.dkim,
    `Kein DKIM-Record bei gängigen Selektoren gefunden (${sel}). Prüfen Sie Ihren Mail-Provider.`,
    `No DKIM record found for common selectors (${sel}). Check the DKIM settings with your email provider.`)
}

async function checkMX(domain: string): Promise<{ result: BiResult; mxIPs: string[] }> {
  const records = await dnsQuery(domain, 'MX')
  const mxIPs: string[] = []
  if (!records.length) {
    return {
      result: res('mx', 'fail', L.mx,
        'Keine MX-Records gefunden. Die Domain kann keine E-Mails empfangen.',
        'No MX records found. This domain cannot receive email.'),
      mxIPs,
    }
  }
  // Resolve first MX to IP
  const firstMX = records[0].replace(/^\d+\s+/, '').replace(/\.$/, '')
  const aRecords = await dnsQuery(firstMX, 'A')
  if (aRecords.length) mxIPs.push(...aRecords.slice(0, 2))
  const list = records.slice(0, 2).map(r => r.replace(/^\d+\s+/, '')).join(', ')
  const more = records.length - 2
  return {
    result: res('mx', 'pass', L.mx,
      `${records.length} MX-Record(s) gefunden: ${list}${more > 0 ? ` (+${more} weitere)` : ''}`,
      `${records.length} MX record${records.length === 1 ? '' : 's'} found: ${list}${more > 0 ? ` (+${more} more)` : ''}`),
    mxIPs,
  }
}

async function checkBlacklists(domain: string, mxIPs: string[]): Promise<BiResult> {
  const toCheck = mxIPs.slice(0, 2) // only check first 2 MX IPs

  if (!toCheck.length) {
    return res('blacklist', 'warn', L.blacklist,
      'Konnte keine MX-IP-Adressen auflösen für den Blacklist-Check.',
      'Could not resolve any MX IP addresses for the blacklist check.')
  }

  const listed: { ip: string; bl: string }[] = []

  for (const ip of toCheck) {
    const parts = ip.split('.').reverse().join('.')
    for (const bl of DNSBL_LIST) {
      const lookup = `${parts}.${bl}`
      const r = await dnsQuery(lookup, 'A')
      // Valid DNSBL hits return 127.0.0.x (x=2-11); 127.255.255.254 = query error, not a listing
      const realHit = r.some(x => x.startsWith('127.') && x !== '127.255.255.254' && x !== '127.255.255.255')
      if (realHit) {
        listed.push({ ip, bl })
      }
    }
  }

  if (listed.length) {
    return res('blacklist', 'fail', L.blacklist,
      `⛔ Domain-IP auf ${listed.length} Blockliste(n) gefunden: ${listed.map(l => `${l.ip} auf ${l.bl}`).join('; ')}`,
      `⛔ Mail server IP found on ${listed.length} blocklist${listed.length === 1 ? '' : 's'}: ${listed.map(l => `${l.ip} on ${l.bl}`).join('; ')}`)
  }

  return res('blacklist', 'pass', L.blacklist,
    `Keine Einträge auf ${DNSBL_LIST.length} geprüften Blocklisten (Spamhaus, SpamCop, SORBS, Barracuda, UCEPROTECT).`,
    `Not listed on any of the ${DNSBL_LIST.length} blocklists checked (Spamhaus, SpamCop, SORBS, Barracuda, UCEPROTECT).`)
}

async function checkPTR(mxIPs: string[]): Promise<BiResult> {
  if (!mxIPs.length) {
    return res('ptr', 'warn', L.ptr,
      'Keine MX-IP verfügbar für PTR-Prüfung.',
      'No MX IP address available for the PTR check.')
  }
  const ip = mxIPs[0]
  const reverse = ip.split('.').reverse().join('.') + '.in-addr.arpa'
  const ptr = await dnsQuery(reverse, 'PTR')
  if (!ptr.length) {
    return res('ptr', 'warn', L.ptr,
      `Kein PTR-Record für ${ip}. Viele Mailserver lehnen E-Mails ohne Reverse DNS ab.`,
      `No PTR record for ${ip}. Many mail servers reject email from servers without reverse DNS.`)
  }
  return res('ptr', 'pass', L.ptr,
    `PTR-Record für ${ip}: ${ptr[0]}`,
    `PTR record for ${ip}: ${ptr[0]}`)
}

async function checkMTASTS(domain: string): Promise<BiResult> {
  const records = await dnsQuery(`_mta-sts.${domain}`, 'TXT')
  const mtasts = records.find(r => r.startsWith('v=STSv1'))
  if (!mtasts) {
    return res('mtasts', 'warn', L.mtasts,
      'Kein MTA-STS-Record gefunden. MTA-STS erzwingt verschlüsselte E-Mail-Übertragung.',
      'No MTA-STS record found. MTA-STS enforces encrypted email delivery to your domain.')
  }
  return res('mtasts', 'pass', L.mtasts,
    `MTA-STS konfiguriert: ${mtasts}`,
    `MTA-STS is configured: ${mtasts}`)
}

async function checkTLSRPT(domain: string): Promise<BiResult> {
  const records = await dnsQuery(`_smtp._tls.${domain}`, 'TXT')
  const tlsrpt = records.find(r => r.startsWith('v=TLSRPTv1'))
  if (!tlsrpt) {
    return res('tlsrpt', 'warn', L.tlsrpt,
      'Kein TLSRPT-Record. TLS-Reporting informiert Sie über Zustellungsfehler.',
      'No TLSRPT record. TLS reporting notifies you about encrypted delivery failures.')
  }
  return res('tlsrpt', 'pass', L.tlsrpt,
    `TLSRPT aktiv: ${tlsrpt}`,
    `TLSRPT is active: ${tlsrpt}`)
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
  const lang: Lang = url.searchParams.get('lang') === 'en' ? 'en' : 'de'
  const domain = url.searchParams.get('domain')?.toLowerCase().replace(/^www\./, '') || ''

  if (!domain || !/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]\.[a-z]{2,}$/.test(domain)) {
    return Response.json({ error: lang === 'en' ? 'Please enter a valid domain (e.g. example.com).' : 'Ungültige Domain' }, { status: 400 })
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
