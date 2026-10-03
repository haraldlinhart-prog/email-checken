// DE | EN language switch shown in the header of every page.
// `de` and `en` are the paths of the equivalent page in each language.
export default function LangSwitch({ current, de, en }: { current: 'de' | 'en'; de: string; en: string }) {
  return (
    <span className="lang-switch" aria-label={current === 'de' ? 'Sprache wählen' : 'Choose language'}>
      {current === 'de'
        ? <strong aria-current="true">DE</strong>
        : <a href={de} hrefLang="de" lang="de" title="Deutsche Version">DE</a>}
      <span aria-hidden="true">|</span>
      {current === 'en'
        ? <strong aria-current="true">EN</strong>
        : <a href={en} hrefLang="en" lang="en" title="English version">EN</a>}
    </span>
  )
}
