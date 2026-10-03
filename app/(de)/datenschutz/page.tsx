import type { Metadata } from 'next'
import SiteHeader from '../../components/SiteHeader'
import SiteFooter from '../../components/SiteFooter'
import { SITE } from '../../components/i18n'

export const metadata: Metadata = {
  title: 'Datenschutzerklärung | email-checken.de',
  description: 'Datenschutzerklärung von email-checken.de: welche Daten beim E-Mail-Sicherheitscheck, beim Kontaktformular und bei der Webanalyse verarbeitet werden.',
  alternates: { canonical: `${SITE}/datenschutz` },
  openGraph: {
    title: 'Datenschutzerklärung | email-checken.de',
    description: 'Welche Daten email-checken.de verarbeitet und welche Rechte Sie haben.',
    url: `${SITE}/datenschutz`,
    siteName: 'email-checken.de',
    type: 'website',
    locale: 'de_DE',
  },
}

export default function DatenschutzPage() {
  return (
    <>
      <SiteHeader lang="de" de="/datenschutz" en="/en" />
      <main className="container legal">
        <h1>Datenschutzerklärung</h1>

        <h2>1. Verantwortlicher</h2>
        <p>
          PAN21.com International LLC, vertreten durch Harald Linhart<br />
          7533 South Center View CT, STE R, West Jordan, UT 84084, USA<br />
          E-Mail: <a href="mailto:dsgvo@pan21.com">dsgvo@pan21.com</a> · <a href="/kontakt">Kontaktformular</a>
        </p>

        <h2>2. Hosting und Server-Logs</h2>
        <p>
          Diese Website wird bei Vercel Inc. (USA) gehostet. Beim Aufruf jeder Seite – und jedes eingebundenen Siegels – verarbeitet
          Vercel technisch notwendige Daten wie IP-Adresse, Zeitpunkt, aufgerufene Adresse und Browser-Kennung, um die Inhalte
          auszuliefern und die Sicherheit des Betriebs zu gewährleisten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO
          (berechtigtes Interesse an einem sicheren und stabilen Betrieb).
        </p>

        <h2>3. E-Mail-Sicherheitscheck und Siegel</h2>
        <p>
          Wenn Sie eine Domain prüfen, verwenden wir nur den Domainnamen. Geben Sie eine E-Mail-Adresse ein, wird bereits in Ihrem
          Browser alles vor dem „@“ entfernt; an unseren Server wird nur die Domain übertragen. Für den Check fragt unser Server
          öffentliche DNS-Einträge der Domain über den DNS-Dienst von Cloudflare, Inc. ab; dabei werden keine Daten über Sie übermittelt.
        </p>
        <p>
          Domain, Prüfergebnis und Prüfzeitpunkt speichern wir in unserer Datenbank bei Supabase, Inc. (Serverstandort Frankfurt am Main),
          damit das Siegel den aktuellen Stand anzeigen kann. Die gespeicherten Domains werden etwa alle 14 Tage automatisch erneut geprüft.
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Bereitstellung des von Ihnen angeforderten Checks und Siegels). Auf Wunsch löschen
          wir den Eintrag Ihrer Domain.
        </p>

        <h2>4. Kontaktformular</h2>
        <p>
          Wenn Sie uns über das Kontaktformular schreiben, verarbeiten wir Name, E-Mail-Adresse, Betreff und Nachricht, um Ihre Anfrage
          zu beantworten. Die Nachricht wird über den E-Mail-Dienst Resend (USA) an unser Postfach zugestellt und nicht in der Datenbank
          dieser Website gespeichert. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO bzw. Art. 6 Abs. 1 lit. f DSGVO (Beantwortung
          Ihrer Anfrage).
        </p>

        <h2>5. Webanalyse mit Google Analytics</h2>
        <p>
          Diese Website nutzt Google Analytics 4, einen Webanalysedienst der Google Ireland Limited, Gordon House, Barrow Street,
          Dublin 4, Irland. Google Analytics setzt Cookies (z. B. „_ga“) und erfasst pseudonyme Nutzungsdaten wie aufgerufene Seiten,
          Verweildauer, ungefähren Standort sowie Geräte- und Browserinformationen. IP-Adressen werden von Google Analytics 4 nach
          Angaben von Google nicht gespeichert. Eine Übermittlung an Google LLC in den USA ist möglich; Google ist unter dem
          EU-US Data Privacy Framework zertifiziert. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der
          Reichweitenmessung). Sie können der Erfassung widersprechen, indem Sie Cookies in Ihrem Browser blockieren oder das
          Browser-Add-on von Google zur Deaktivierung von Google Analytics verwenden.
        </p>

        <h2>6. Impressum-Widget</h2>
        <p>
          Das Impressum im Seitenfuß wird über ein Widget von impressum-free.de geladen. Dabei ruft Ihr Browser Skript, Text und
          Siegelgrafik von den Servern von impressum-free.de ab; technisch bedingt wird dabei Ihre IP-Adresse übertragen. Es werden
          keine Cookies gesetzt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer einheitlichen
          Anbieterkennzeichnung).
        </p>

        <h2>7. Dienstleister im Überblick</h2>
        <ul>
          <li><strong>Vercel Inc.</strong> – Hosting (USA)</li>
          <li><strong>Supabase, Inc.</strong> – Datenbank (Serverstandort Frankfurt am Main)</li>
          <li><strong>Resend</strong> – Zustellung der Kontaktanfragen (USA)</li>
          <li><strong>Cloudflare, Inc.</strong> – DNS-Abfragen für den Check (keine personenbezogenen Daten)</li>
          <li><strong>Google Ireland Limited</strong> – Webanalyse (Google Analytics 4)</li>
          <li><strong>impressum-free.de</strong> – Impressum-Widget</li>
        </ul>
        <p>
          Soweit Daten in die USA übermittelt werden, erfolgt dies auf Grundlage des EU-US Data Privacy Framework bzw. der
          EU-Standardvertragsklauseln.
        </p>

        <h2>8. Ihre Rechte</h2>
        <p>
          Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit sowie
          Widerspruch gegen Verarbeitungen auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Wenden Sie sich dazu an
          {' '}<a href="mailto:dsgvo@pan21.com">dsgvo@pan21.com</a> oder an unser <a href="/kontakt">Kontaktformular</a>. Außerdem
          haben Sie das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
        </p>

        <p className="legal-date">Stand: Oktober 2026</p>
      </main>
      <SiteFooter lang="de" />
    </>
  )
}
