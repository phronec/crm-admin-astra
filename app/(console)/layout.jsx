import Link from 'next/link';
import { requirePlatformAdmin } from '../../lib/server';
import { signOut } from '../login/actions';
import { navigationReports } from '../../lib/reports';
import { language } from '../../lib/locale';
import { dictionary } from '../../lib/languages';
import LanguageSwitch from '../../components/LanguageSwitch';

export const dynamic='force-dynamic';
export default async function ConsoleLayout({ children }) {
  const {user}=await requirePlatformAdmin(),lang=await language(),t=dictionary(lang);
  return <div className="shell"><aside className="sidebar">
    <Link href="/" className="wordmark"><i aria-hidden="true"/>Clevia</Link><p className="sidebar-label">{t.admin}</p>
    <nav aria-label={t.admin}><Link href="/">{t.overview}</Link>
      {navigationReports.map(([key,report])=><Link href={'/'+key} key={key}>{t[report.title]}</Link>)}
    </nav>
    <div className="account"><LanguageSwitch lang={lang}/><span>{user.email}</span><form action={signOut}><button className="subtle">{t.signOut}</button></form></div>
  </aside><main className="content">{children}</main></div>;
}
