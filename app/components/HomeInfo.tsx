import { SITE } from './i18n'

// Server-rendered explanation + FAQ below the check form on both homepages,
// plus the matching JSON-LD (WebApplication + FAQPage). The FAQ texts are used
// for both the visible section and the structured data, so they always match.

type Lang = 'de' | 'en'

export const HOME_DESCRIPTION: Record<Lang, string> = {
  de: 'Kostenloser E-Mail-Sicherheitscheck: Prüfen Sie SPF, DKIM, DMARC, MX-Records, Reverse DNS und Blacklists Ihrer Domain – sofort und ohne Anmeldung.',
  en: 'Free email security check: test your domain’s SPF, DKIM, DMARC, MX records, reverse DNS and blacklist status – instant results, no sign-up required.',
}

type Pair = [string, string]

interface Content {
  h2: string
  intro: string
  checks: Pair[]
  h3Terms: string
  terms: Pair[]
  h3Who: string
  who: string
  h3Faq: string
  faq: Pair[]
  appName: string
  url: string
}

const C: Record<Lang, Content> = {
  de: {
    h2: 'Was prüft der E-Mail-Sicherheitscheck?',
    intro: 'email-checken.de liest die öffentlichen DNS-Einträge Ihrer Domain und bewertet acht Punkte. Sie erhalten einen Score von 0 bis 100 und zu jedem Punkt einen Status mit einem konkreten Hinweis.',
    checks: [
      ['SPF-Record', 'ob genau ein SPF-Eintrag existiert und wie er endet („-all“, „~all“, „?all“ oder „+all“).'],
      ['DMARC-Record', 'ob unter _dmarc ein Eintrag besteht und welche Policy gilt (none, quarantine oder reject).'],
      ['DKIM', 'ob unter gängigen Selektoren wie default, google oder selector1 ein Schlüssel veröffentlicht ist.'],
      ['MX-Records', 'ob Mail-Server eingetragen sind und sich der primäre Mail-Server auflösen lässt.'],
      ['Blacklists', 'ob die IP-Adressen des primären Mail-Servers auf SpamCop, Barracuda, UCEPROTECT, PSBL oder Mailspike gelistet sind.'],
      ['Reverse DNS (PTR)', 'ob die IP-Adresse des primären Mail-Servers einen PTR-Eintrag hat.'],
      ['MTA-STS und TLS-Reporting', 'ob die DNS-Einträge für verschlüsselte Zustellung und TLS-Fehlerberichte vorhanden sind.'],
    ],
    h3Terms: 'SPF, DKIM und DMARC kurz erklärt',
    terms: [
      ['SPF', 'legt im DNS fest, welche Server E-Mails für Ihre Domain versenden dürfen. Empfänger erkennen so Absender, die sich nur als Ihre Domain ausgeben.'],
      ['DKIM', 'versieht ausgehende E-Mails mit einer digitalen Signatur. Mit dem öffentlichen Schlüssel im DNS prüfen Empfänger, ob die Nachricht unterwegs verändert wurde.'],
      ['DMARC', 'baut auf SPF und DKIM auf und teilt Empfängern mit, was mit E-Mails geschehen soll, die keine der beiden Prüfungen bestehen: zustellen, in den Spam-Ordner verschieben oder ablehnen.'],
    ],
    h3Who: 'Für wen ist der Check gedacht?',
    who: 'Für Unternehmen, Selbstständige, Vereine und Agenturen, die E-Mails über eine eigene Domain versenden – und für Webmaster, die nach einem Wechsel des Mail-Providers kontrollieren möchten, ob alles richtig eingetragen ist. Technisches Vorwissen brauchen Sie nicht.',
    h3Faq: 'Häufige Fragen',
    faq: [
      ['Ist der E-Mail-Sicherheitscheck kostenlos?',
        'Ja. Der Check ist kostenlos und ohne Anmeldung nutzbar. Sie geben nur eine Domain oder eine E-Mail-Adresse ein.'],
      ['Werden beim Check E-Mails verschickt oder mein Postfach geöffnet?',
        'Nein. Der Check liest ausschließlich öffentliche DNS-Einträge Ihrer Domain. Es werden keine E-Mails gesendet und kein Postfach abgerufen. Geben Sie eine E-Mail-Adresse ein, wird nur die Domain hinter dem „@“ geprüft.'],
      ['Wie entsteht der Score von 0 bis 100?',
        'Jeder Prüfpunkt ist gewichtet: SPF und DMARC zählen je 25 Punkte, DKIM 20, MX-Records und Blacklist-Check je 10, Reverse DNS 5, MTA-STS 3 und TLS-Reporting 2. Ein bestandener Punkt bringt die volle Punktzahl, eine Warnung einen Teil davon.'],
      ['Warum findet der Check meinen DKIM-Schlüssel nicht?',
        'DKIM-Schlüssel liegen unter einem Selektor, den Ihr Mail-Provider festlegt. Der Check probiert gängige Selektoren wie default, google, selector1 oder k1. Nutzt Ihr Provider einen anderen Namen, erscheint eine Warnung, obwohl DKIM eingerichtet sein kann.'],
      ['Was ist das Siegel und wie aktuell ist es?',
        'Nach dem Check können Sie ein Siegel auf Ihrer Website einbinden, das den Sicherheitsstatus Ihrer E-Mail-Domain zeigt. Dafür speichern wir Domain, Ergebnis und Prüfzeitpunkt; die Domain wird etwa alle 14 Tage automatisch erneut geprüft.'],
      ['Sorgt ein guter Score dafür, dass meine E-Mails immer ankommen?',
        'Nein. Ein hoher Score zeigt, dass die wichtigsten DNS-Einstellungen stimmen. Ob eine E-Mail zugestellt wird, hängt aber auch von Inhalt, Versandverhalten und den Filtern des Empfängers ab.'],
    ],
    appName: 'E-Mail-Sicherheitscheck von email-checken.de',
    url: `${SITE}/`,
  },
  en: {
    h2: 'What does the email security check examine?',
    intro: 'email-checken.de reads your domain’s public DNS records and assesses eight items. You get a score from 0 to 100 and, for each item, a status with a specific recommendation.',
    checks: [
      ['SPF record', 'whether exactly one SPF record exists and how it ends ("-all", "~all", "?all" or "+all").'],
      ['DMARC record', 'whether a record exists under _dmarc and which policy applies (none, quarantine or reject).'],
      ['DKIM', 'whether a key is published under common selectors such as default, google or selector1.'],
      ['MX records', 'whether mail servers are listed and the primary mail server resolves.'],
      ['Blacklists', 'whether the IP addresses of your primary mail server are listed on SpamCop, Barracuda, UCEPROTECT, PSBL or Mailspike.'],
      ['Reverse DNS (PTR)', 'whether the IP address of your primary mail server has a PTR record.'],
      ['MTA-STS and TLS reporting', 'whether the DNS records for encrypted delivery and TLS failure reports are in place.'],
    ],
    h3Terms: 'SPF, DKIM and DMARC in a nutshell',
    terms: [
      ['SPF', 'specifies in DNS which servers may send email for your domain. This lets receivers spot senders who merely pretend to be your domain.'],
      ['DKIM', 'adds a digital signature to outgoing email. Using the public key in DNS, receivers can verify that a message wasn’t altered in transit.'],
      ['DMARC', 'builds on SPF and DKIM and tells receivers what to do with email that passes neither check: deliver it, move it to spam or reject it.'],
    ],
    h3Who: 'Who is the check for?',
    who: 'For businesses, freelancers, associations and agencies that send email from their own domain – and for webmasters who want to make sure everything is set up correctly after switching email providers. No technical background is needed.',
    h3Faq: 'Frequently asked questions',
    faq: [
      ['Is the email security check free?',
        'Yes. The check is free of charge and requires no sign-up. All you enter is a domain or an email address.'],
      ['Does the check send emails or access my mailbox?',
        'No. The check only reads your domain’s public DNS records. No emails are sent and no mailbox is accessed. If you enter an email address, only the domain after the “@” is checked.'],
      ['How is the score from 0 to 100 calculated?',
        'Each item is weighted: SPF and DMARC count 25 points each, DKIM 20, MX records and the blacklist check 10 each, reverse DNS 5, MTA-STS 3 and TLS reporting 2. A passed item earns the full points, a warning earns part of them.'],
      ['Why doesn’t the check find my DKIM key?',
        'DKIM keys are published under a selector chosen by your email provider. The check tries common selectors such as default, google, selector1 or k1. If your provider uses a different name, you’ll see a warning even though DKIM may be set up.'],
      ['What is the badge and how up to date is it?',
        'After the check, you can add a badge to your website that shows the security status of your email domain. To make this work, we store the domain, the result and the time of the check; the domain is re-checked automatically about every 14 days.'],
      ['Does a good score mean my emails will always be delivered?',
        'No. A high score shows that the key DNS settings are correct. Whether an email is delivered also depends on its content, your sending behaviour and the recipient’s filters.'],
    ],
    appName: 'Email security check by email-checken.de',
    url: `${SITE}/en`,
  },
}

function jsonLd(lang: Lang) {
  const c = C[lang]
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: c.appName,
        url: c.url,
        description: HOME_DESCRIPTION[lang],
        applicationCategory: 'SecurityApplication',
        operatingSystem: 'Web',
        inLanguage: lang,
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        publisher: { '@type': 'Organization', name: 'PAN21.com International LLC', url: 'https://www.pan21.com' },
      },
      {
        '@type': 'FAQPage',
        inLanguage: lang,
        mainEntity: c.faq.map(([q, a]) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  }
}

export default function HomeInfo({ lang }: { lang: Lang }) {
  const c = C[lang]
  return (
    <section className="info" aria-labelledby="info-title">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(lang)).replace(/</g, '\\u003c') }}
      />
      <h2 id="info-title">{c.h2}</h2>
      <p>{c.intro}</p>
      <ul>
        {c.checks.map(([label, text]) => (
          <li key={label}><strong>{label}:</strong> {text}</li>
        ))}
      </ul>

      <h3>{c.h3Terms}</h3>
      {c.terms.map(([term, text]) => (
        <p key={term}><strong>{term}</strong> {text}</p>
      ))}

      <h3>{c.h3Who}</h3>
      <p>{c.who}</p>

      <h3>{c.h3Faq}</h3>
      <div className="faq">
        {c.faq.map(([q, a]) => (
          <div className="faq-item" key={q}>
            <h4>{q}</h4>
            <p>{a}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
