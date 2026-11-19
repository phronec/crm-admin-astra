import Link from 'next/link';
import { language } from '../lib/locale';
import { dictionary } from '../lib/languages';
export default async function NotFound() {
  const t=dictionary(await language());
  return <main className="login"><h1>{t.missing}</h1><Link href="/">{t.overview}</Link></main>;
}
