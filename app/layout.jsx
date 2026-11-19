import './styles.css';
import { language } from '../lib/locale';
import { dictionary } from '../lib/languages';

export async function generateMetadata() {
  const t=dictionary(await language());
  return { title:{default:'Clevia | '+t.admin,template:'%s | Clevia'}, robots:{index:false,follow:false} };
}
export default async function Layout({ children }) {
  return <html lang={await language()}><body>{children}</body></html>;
}
