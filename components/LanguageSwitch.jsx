import { setLanguage } from '../app/language';
export default function LanguageSwitch({ lang }) {
  return <form className="language-switch" action={setLanguage} aria-label="Jazyk">
    {['cs','sk'].map(value => <button key={value} name="lang" value={value} type="submit" lang={value} aria-pressed={lang===value}>
      {value === 'cs' ? 'Čeština' : 'Slovenčina'}
    </button>)}
  </form>;
}
