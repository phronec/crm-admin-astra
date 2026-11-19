import Link from 'next/link';
import { notFound } from 'next/navigation';
import { reports,reportUrl } from '../../../../lib/reports';
import { requirePlatformAdmin } from '../../../../lib/server';
import { language } from '../../../../lib/locale';
import { dictionary } from '../../../../lib/languages';
import ReportValue from '../../../../components/ReportValue';
import { settleOrder } from './actions';

export default async function Order({params,searchParams}) {
  const {id}=await params;
  if(!/^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(id)) notFound();
  const {client}=await requirePlatformAdmin(),lang=await language(),t=dictionary(lang);
  const {data:order,error}=await client.rpc('platform_admin_order',{p_order:id});
  if(error) throw new Error(t.failed);
  if(!order) notFound();
  const {result}=await searchParams;
  return <><header><Link href={reportUrl('payments',{workspace:order.workspace_id})} className="backlink">{t.payments}</Link><h1>{t.orderReview}</h1></header>
    <dl className="order-detail">{reports.payments.columns.map(([field,label])=><div key={field}>
      <dt>{t[label||field]}</dt><dd><ReportValue field={field} row={order} lang={lang}/></dd></div>)}</dl>
    {order.grant&&<section><h2>{t.linkedGrant}</h2><dl className="order-detail">
      {[['units','granted'],['remaining','remaining'],['starts_at','starts_at'],['expires_at','expires_at']].map(([field,label])=><div key={field}>
        <dt>{t[label]}</dt><dd><ReportValue field={field} row={order.grant} lang={lang}/></dd></div>)}
    </dl></section>}
    {order.status==='paid'&&<p><Link href={reportUrl('activity',{workspace:order.workspace_id,q:order.id})}>{t.orderActivity}</Link></p>}
    {result==='paidResult'&&order.status==='paid'&&<p role="status">{t.paidResult}</p>}
    {['confirmRequired','settlementFailed'].includes(result)&&<p role="alert" className="error">{t[result]}</p>}
    {order.status==='pending'&&<section className="settlement"><h2>{t.manual}</h2><p>{t.settlementHint}</p>
      <form action={settleOrder}><input type="hidden" name="order" value={id}/>
        <label><input type="checkbox" name="received" value="confirmed" required/>{t.confirmReceipt}</label>
        <button type="submit">{t.markPaid}</button>
      </form></section>}
  </>;
}
