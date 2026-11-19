import Link from 'next/link';
import { requirePlatformAdmin } from '../../lib/server';
import { language } from '../../lib/locale';
import { dictionary,locale } from '../../lib/languages';
import UsageAnalytics from '../../components/UsageAnalytics';

export default async function Overview({searchParams}) {
  const {client}=await requirePlatformAdmin(),lang=await language(),t=dictionary(lang);
  const query=await searchParams,days=query.days==='30'?30:7;
  const [summary,usage]=await Promise.all([client.rpc('platform_admin_summary'),client.rpc('platform_admin_usage_overview',{p_days:days})]);
  if(summary.error||usage.error) throw new Error(t.failed);
  const data=summary.data;
  const cards=[['tenants','tenants'],['users','registered'],['subscriptions','subscriptions'],['credits','available']];
  return <><header><h1>{t.overview}</h1></header>
    <div className="cards">{cards.map(([key,label])=>
      <Link className="card" key={key} href={'/'+key}><span>{t[label]}</span><strong>{new Intl.NumberFormat(locale(lang)).format(data[key])}</strong></Link>
    )}</div>
    <UsageAnalytics data={usage.data} lang={lang} labels={t}/>
    <section><h2>{t.operations}</h2><div className="operation-links">
      {[['pending','pendingOrders'],['payments','payments'],['usage','usage'],['activity','activity']].map(([key,label])=>
        <Link href={'/'+key} key={key}>{t[label]}<span aria-hidden="true">→</span></Link>
      )}
    </div></section></>;
}
