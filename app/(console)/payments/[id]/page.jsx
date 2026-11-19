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
  const {data,error}=await client.rpc('platform_admin_report',{p_section:'payments',p_search:id,p_page:1,p_workspace:null});
  if(error) throw new Error(t.failed);
  const order=data.rows.find(row=>row.id===id);
  if(!order) notFound();
  const {result}=await searchParams;
  return <><header><Link href={reportUrl('payments',{workspace:order.workspace_id})} className="backlink">{t.payments}</Link><h1>{t.orderReview}</h1></header>
    <dl className="order-detail">{reports.payments.columns.map(([field,label])=><div key={field}>
      <dt>{t[label||field]}</dt><dd><ReportValue field={field} row={order} lang={lang}/></dd></div>)}</dl>
    {result==='paidResult'&&order.status==='paid'&&<p role="status">{t.paidResult}</p>}
    {['confirmRequired','settlementFailed'].includes(result)&&<p role="alert" className="error">{t[result]}</p>}
    {order.status==='pending'&&<section className="settlement"><h2>{t.manual}</h2><p>{t.settlementHint}</p>
      <form action={settleOrder}><input type="hidden" name="order" value={id}/>
        <label><input type="checkbox" name="received" value="confirmed" required/>{t.confirmReceipt}</label>
        <button type="submit">{t.markPaid}</button>
      </form></section>}
  </>;
}
