import Link from 'next/link';
import { notFound,redirect } from 'next/navigation';
import { reports,navigationReports,reportUrl,parseReportFilters,reportArguments } from '../../../lib/reports';
import { requirePlatformAdmin } from '../../../lib/server';
import { language } from '../../../lib/locale';
import { dictionary,locale } from '../../../lib/languages';
import ReportValue from '../../../components/ReportValue';
import ReportFilters from '../../../components/ReportFilters';

export async function generateMetadata({params}) {
  const {section}=await params,t=dictionary(await language());
  return {title:Object.hasOwn(reports,section)?t[reports[section].title]:t.missing};
}

export default async function Report({ params,searchParams }) {
  const {section} = await params;
  if (!Object.hasOwn(reports,section)) notFound();
  const {client} = await requirePlatformAdmin();
  const filters = parseReportFilters(section, await searchParams);
  if (!filters) notFound();
  const lang=await language(), t=dictionary(lang), report=reports[section], title=t[report.title];
  const {page,workspace}=filters;
  const payment=section==='payments'||section==='pending';
  const invalidRange=filters.from && filters.to && filters.from>filters.to;
  let data;
  if (!invalidRange) {
    const result=await client.rpc('platform_admin_search_report',reportArguments(section,filters));
    if (result.error) throw new Error(t.failed);
    data=result.data;
  }
  const pages=Math.max(1,Math.ceil((data?.total || 0)/25));
  if (data && page>pages) redirect(reportUrl(section,{...filters,page:pages}));
  const tenantName=section==='tenants'&&workspace&&data?.rows[0]?.workspace;
  return <><header>
    {workspace&&<Link href={reportUrl(section,{...filters,workspace:'',page:1})} className="backlink">{t.allWorkspaces}</Link>}
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
    <ReportFilters section={section} filters={filters} t={t}/>
    {invalidRange ? <p role="alert" className="error">{t.dateRangeError}</p> : <>
      <dl className="report-summary">
        <div><dt>{t.totalMatches}</dt><dd>{new Intl.NumberFormat(locale(lang)).format(data.total)}</dd></div>
        {section==='payments'&&<div><dt>{t.paidTotal}</dt><dd>{new Intl.NumberFormat(locale(lang),{style:'currency',currency:'CZK'}).format(data.paid_czk)}</dd></div>}
      </dl>
      <div className="table-frame"><table><caption className="sr-only">{title}</caption>
        <thead><tr>{payment&&<th>{t.action}</th>}{report.columns.map(([key,label])=><th scope="col" key={key}>{t[label||key]}</th>)}</tr></thead>
        <tbody>{data.rows.map((row,i)=><tr key={row.id||i}>
          {payment&&<td><Link href={'/payments/'+row.id}>{t.orderReview}</Link></td>}
          {report.columns.map(([field])=><td key={field}><ReportValue field={field} row={row} lang={lang} section={section}/></td>)}
        </tr>)}</tbody></table>{!data.rows.length&&<p className="empty">{t.empty}</p>}
      </div>
      <nav className="pagination" aria-label={t.page}><span>{t.page} {page} / {pages} · {t.utc}</span><div>
        {page>2&&<Link href={reportUrl(section,{...filters,page:1})}>{t.firstPage}</Link>}
        {page>1&&<Link href={reportUrl(section,{...filters,page:page-1})}>{t.previous}</Link>}
        {page<pages&&<Link href={reportUrl(section,{...filters,page:page+1})}>{t.next}</Link>}
        {page+1<pages&&<Link href={reportUrl(section,{...filters,page:pages})}>{t.lastPage}</Link>}
      </div></nav>
    </>}
  </>;
}
