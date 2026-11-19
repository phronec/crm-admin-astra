import Link from 'next/link';
import { requirePlatformAdmin } from '../../lib/server';
import { language } from '../../lib/locale';
import { dictionary,locale } from '../../lib/languages';

export default async function Overview() {
  const {client}=await requirePlatformAdmin(),lang=await language(),t=dictionary(lang);
  const {data,error}=await client.rpc('platform_admin_summary');
  if(error) throw new Error(t.failed);
  const cards=[['tenants','tenants'],['users','registered'],['subscriptions','subscriptions'],['credits','available']];
  return <><header><h1>{t.overview}</h1></header>
    <div className="cards">{cards.map(([key,label])=>
      <Link className="card" key={key} href={'/'+key}><span>{t[label]}</span><strong>{new Intl.NumberFormat(locale(lang)).format(data[key])}</strong></Link>
    )}</div>
    <section><h2>{t.operations}</h2><div className="operation-links">
      {[['pending','pendingOrders'],['payments','payments'],['usage','usage'],['activity','activity']].map(([key,label])=>
        <Link href={'/'+key} key={key}>{t[label]}<span aria-hidden="true">→</span></Link>
      )}
    </div></section></>;
}
