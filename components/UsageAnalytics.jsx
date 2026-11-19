import Link from 'next/link';
import {analyticsText} from '../lib/analytics-language';
import {locale} from '../lib/languages';
import {reportUrl} from '../lib/reports';
import './analytics.css';
import ModuleActivity from './ModuleActivity';

export default function UsageAnalytics({data,moduleData,lang,labels}) {
 const t=key=>analyticsText(lang,key),number=value=>new Intl.NumberFormat(locale(lang)).format(value);
 const date=value=>new Intl.DateTimeFormat(locale(lang),{day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z'));
 const range={from:data.from,to:data.to},totals=data.totals,max=Math.max(1,...data.daily.map(row=>row.operations));
 const values=[['screenshots','usage',{q:'capture',state:'charged'}],['credits','usage',{state:'charged'}],['activeUsers','usage',{}],['activeWorkspaces','usage',{}],['newUsers','users',{}],['newWorkspaces','tenants',{}]];
 return <div className="analytics">
  <section className="analytics-period"><h2>{t('period')}</h2><nav aria-label={t('period')}><Link href="/?days=7" aria-current={data.days===7?'page':undefined}>{t('last7')}</Link><Link href="/?days=30" aria-current={data.days===30?'page':undefined}>{t('last30')}</Link></nav><p>{date(data.from)} - {date(data.to)} · UTC</p></section>
  <ModuleActivity data={moduleData} lang={lang} labels={labels}/>
  <section><h2>{t('usage')}</h2><p className="muted">{t('usageHint')}</p><div className="analytics-metrics">{values.map(([key,section,filter])=><Link className="analytics-metric" href={reportUrl(section,{...range,...filter})} key={key}><span>{t(key)}</span><strong>{number(totals[key==='newUsers'?'registrations':key==='newWorkspaces'?'workspaces':key])}</strong></Link>)}</div></section>
  <section className="analytics-panel"><div className="analytics-section-heading"><h2 id="analytics-daily">{t('daily')}</h2><span>{number(totals.operations)} {t('operations').toLowerCase()}</span></div>
   <div className="analytics-legend">{['completed','failed','pending'].map(key=><span key={key}><i className={'analytics-'+key}/>{t(key)}: {number(totals[key])}</span>)}</div>
   {totals.operations===0&&<p className="muted">{t('noOperations')}</p>}
   <ul className="analytics-chart" aria-labelledby="analytics-daily">{data.daily.map((row,index)=><li key={row.date}>
    <Link href={reportUrl('usage',{from:row.date,to:row.date})} title={date(row.date)+': '+number(row.operations)+' '+t('operations').toLowerCase()} aria-label={date(row.date)+': '+number(row.operations)+' '+t('operations').toLowerCase()}>
     <span className="analytics-stack" style={{height:(row.operations/max*100)+'%'}}>{row.completed>0&&<i className="analytics-completed" style={{flexGrow:row.completed}}/>}{row.failed>0&&<i className="analytics-failed" style={{flexGrow:row.failed}}/>}{row.operations-row.completed-row.failed>0&&<i className="analytics-pending" style={{flexGrow:row.operations-row.completed-row.failed}}/>}</span>
    </Link><small>{data.days===7||index%5===0||index===data.daily.length-1?new Date(row.date+'T12:00:00Z').getUTCDate():''}</small>
   </li>)}</ul>
   <details className="analytics-details"><summary>{t('dailyTable')}</summary><div className="table-frame"><table><thead><tr>{['date','operations','completed','failed','credits','newUsers','newWorkspaces'].map(key=><th key={key}>{t(key)}</th>)}</tr></thead><tbody>{data.daily.map(row=><tr key={row.date}><td>{date(row.date)}</td><td>{number(row.operations)}</td><td>{number(row.completed)}</td><td>{number(row.failed)}</td><td>{number(row.credits)}</td><td>{number(row.registrations)}</td><td>{number(row.workspaces)}</td></tr>)}</tbody></table></div></details>
  </section>
  <section className="analytics-panel"><h2>{t('actions')}</h2>{data.actions.length?<div className="table-frame"><table><thead><tr>{['action','operations','completed','failed','pending','credits'].map(key=><th key={key}>{t(key)}</th>)}</tr></thead><tbody>{data.actions.map(row=><tr key={row.action}><td><Link href={reportUrl('usage',{...range,q:row.action})}>{labels[row.action]||row.action}</Link></td><td>{number(row.operations)}</td><td>{number(row.completed)}</td><td>{number(row.failed)}</td><td>{number(row.pending)}</td><td>{number(row.credits)}</td></tr>)}</tbody></table></div>:<p className="muted">{t('noOperations')}</p>}</section>
  <section className="analytics-panel"><h2>{t('provider')}</h2><p className="muted">{t('providerHint')}</p><dl className="analytics-provider">{[['providerInput',totals.providerInput],['providerOutput',totals.providerOutput],['measured',totals.measuredOperations]].map(([key,value])=><div key={key}><dt>{t(key)}</dt><dd>{value===null?t('unmeasured'):number(value)}</dd></div>)}</dl></section>
  <section className="analytics-metrics analytics-payments"><Link className="analytics-metric" href={reportUrl('payments',{...range,state:'paid',date:'settled'})}><span>{t('payments')}</span><strong>{new Intl.NumberFormat(locale(lang),{style:'currency',currency:'CZK',maximumFractionDigits:0}).format(totals.paidCzk)}</strong><small>{t('paymentsHint')}</small></Link><Link className="analytics-metric" href="/pending"><span>{t('pendingOrders')}</span><strong>{number(totals.pendingOrders)}</strong></Link></section>
 </div>;
}
