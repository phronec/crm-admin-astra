import Link from 'next/link';
import { notFound } from 'next/navigation';
import { reports,navigationReports,reportUrl } from '../../../lib/reports';
import { requirePlatformAdmin } from '../../../lib/server';
import { language } from '../../../lib/locale';
import { dictionary } from '../../../lib/languages';
import ReportValue from '../../../components/ReportValue';

const uuid=/^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i;
export async function generateMetadata({params}) {
  const {section}=await params,t=dictionary(await language());
  return {title:Object.hasOwn(reports,section)?t[reports[section].title]:t.missing};
}
export default async function Report({params,searchParams}) {
  const {section}=await params;
  if(!Object.hasOwn(reports,section)) notFound();
  const filters=await searchParams,lang=await language(),t=dictionary(lang);
  const q=typeof filters.q==='string'?filters.q.slice(0,120):'';
  const page=Number(filters.page||1),workspace=filters.workspace;
  if(!Number.isSafeInteger(page)||page<1||page>2147483647||(workspace!==undefined&&(typeof workspace!=='string'||!uuid.test(workspace)))) notFound();
  const {client}=await requirePlatformAdmin();
  const {data,error}=await client.rpc('platform_admin_report',{p_section:section,p_search:q,p_page:page,p_workspace:workspace||null});
  if(error) throw new Error(t.failed);
  const report=reports[section],title=t[report.title];
  const tenantName=section==='tenants'&&workspace&&data.rows[0]?.workspace;
  const payment=section==='payments'||section==='pending';
  return <><header>
    {workspace&&<Link href={reportUrl(section)} className="backlink">{t.allWorkspaces}</Link>}
    <h1>{tenantName||title}</h1>
    {workspace&&!tenantName&&<p className="muted">{t.workspace} <Link href={reportUrl('tenants',{workspace})}>{workspace}</Link></p>}
  </header>
    {workspace&&<nav className="workspace-nav" aria-label={t.workspace}>
      {navigationReports.map(([key,info])=><Link aria-current={key===section?'page':undefined} href={reportUrl(key,{workspace})} key={key}>{t[info.title]}</Link>)}
    </nav>}
    {payment&&<nav className="workspace-nav" aria-label={t.payments}>
      <Link href={reportUrl('payments',{workspace})} aria-current={section==='payments'?'page':undefined}>{t.allOrders}</Link>
      <Link href={reportUrl('pending',{workspace})} aria-current={section==='pending'?'page':undefined}>{t.pendingOrders}</Link>
    </nav>}
    <form className="toolbar" action={'/'+section} method="get">
      {workspace&&<input type="hidden" name="workspace" value={workspace}/>}
      <label htmlFor="search" className="sr-only">{t.find}</label>
      <input id="search" type="search" name="q" maxLength={120} defaultValue={q} placeholder={t.find}/>
      <button type="submit">{t.search}</button>{q&&<Link href={reportUrl(section,{workspace})}>{t.clear}</Link>}
    </form>
    <div className="table-frame"><table><caption className="sr-only">{title}</caption>
      <thead><tr>{payment&&<th>{t.action}</th>}{report.columns.map(([key,label])=><th scope="col" key={key}>{t[label||key]}</th>)}</tr></thead>
      <tbody>{data.rows.map((row,i)=><tr key={row.id||i}>
        {payment&&<td><Link href={'/payments/'+row.id}>{t.orderReview}</Link></td>}
        {report.columns.map(([field])=><td key={field}><ReportValue field={field} row={row} lang={lang} section={section}/></td>)}
      </tr>)}</tbody></table>
      {!data.rows.length&&<p className="empty">{q?t.noMatch:t.empty}</p>}
    </div>
    <div className="pagination"><span>{t.page} {page} · {t.utc}</span><div>
      {page>1&&<Link href={reportUrl(section,{workspace,q,page:page-1})}>{t.previous}</Link>}
      {data.has_more&&<Link href={reportUrl(section,{workspace,q,page:page+1})}>{t.next}</Link>}
    </div></div></>;
}
