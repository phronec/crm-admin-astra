import Link from 'next/link';
import {analyticsText} from '../lib/analytics-language';
import {locale} from '../lib/languages';
import {reportUrl} from '../lib/reports';

const moduleKeys=['crm','marketing','hr','invoicing','timesheets','knowledge','documents'];
export default function ModuleActivity({data,lang,labels}){
 const t=key=>analyticsText(lang,key),number=value=>new Intl.NumberFormat(locale(lang)).format(value);
 const range={from:data.from,to:data.to},counts=new Map(data.modules.map(row=>[row.module,row]));
 const date=value=>new Intl.DateTimeFormat(locale(lang),{dateStyle:'medium',timeStyle:'short',timeZone:'UTC'}).format(new Date(value));
 return <section className="analytics-panel module-activity">
  <h2>{t('moduleActivity')}</h2><p className="muted">{t('moduleActivityHint')}</p>
  <div className="module-activity-totals"><span><strong>{number(data.changes)}</strong> {t('recordChanges')}</span><span><strong>{number(data.users)}</strong> {t('employees')}</span><span><strong>{number(data.workspaces)}</strong> {t('companies')}</span></div>
  <div className="table-frame"><table><thead><tr>{['module','created','updated','removed'].map(key=><th key={key}>{t(key)}</th>)}</tr></thead><tbody>{moduleKeys.map(key=>{const row=counts.get(key);return <tr key={key}><td><Link href={reportUrl('activity',{...range,q:key})}>{labels[key]||key}</Link></td><td>{number(row?.created||0)}</td><td>{number(row?.updated||0)}</td><td>{number(row?.removed||0)}</td></tr>;})}</tbody></table></div>
  <h3>{t('recentChanges')}</h3>{data.recent.length?<div className="table-frame"><table><thead><tr>{['date','module','event','record','company','employee'].map(key=><th key={key}>{t(key)}</th>)}</tr></thead><tbody>{data.recent.map(row=><tr key={row.id}><td><time dateTime={row.created_at}>{date(row.created_at)}</time></td><td>{labels[row.module]||row.module}</td><td>{t(row.event)}</td><td><Link href={reportUrl('activity',{...range,q:row.entity_id})} title={row.entity_id}>{t('entity_'+row.entity_type)}</Link></td><td><Link href={reportUrl('activity',{...range,workspace:row.workspace_id})}>{row.workspace}</Link></td><td>{row.actor||(row.actor_id?t('formerUser'):t('system'))}</td></tr>)}</tbody></table></div>:<p className="muted">{t('noModuleChanges')}</p>}
  <p className="muted"><Link href={reportUrl('activity',range)}>{t('allActivity')}</Link></p>
 </section>;
}
