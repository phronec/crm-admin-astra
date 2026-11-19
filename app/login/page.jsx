import { signIn } from './actions';
import { language } from '../../lib/locale';
import { dictionary } from '../../lib/languages';
import LanguageSwitch from '../../components/LanguageSwitch';

export default async function Login({ searchParams }) {
  const lang=await language(),t=dictionary(lang),{error}=await searchParams;
  return <main className="login">
    <div className="wordmark"><i aria-hidden="true"/>Clevia</div><LanguageSwitch lang={lang}/>
    <h1>{t.loginTitle}</h1><form action={signIn} className="login-form">
      <label>{t.email}<input name="email" type="email" required maxLength={320} autoComplete="username"/></label>
      <label>{t.password}<input name="password" type="password" required autoComplete="current-password"/></label>
      {['setup','access','credentials','unavailable'].includes(error)&&<p role="alert" className="error">{t[error]}</p>}
      <button type="submit">{t.signIn}</button>
    </form>
    <p className="muted" style={{marginTop:24}}><a href="https://clevia.sk/reset-password/">{lang==='sk'?'Nastaviť heslo účtu Clevia':'Nastavit heslo účtu Clevia'}</a><br/><a href="https://clevia.sk/login/?mode=reset">{lang==='sk'?'Zabudnuté heslo':'Zapomenuté heslo'}</a></p>
  </main>;
}
