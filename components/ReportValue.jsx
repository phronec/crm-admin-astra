import Link from 'next/link';
import { dictionary, locale } from '../lib/languages';
import { reportUrl } from '../lib/reports';

const dates = new Set(['created_at','period_start','period_end','last_sign_in_at','settled_at','starts_at','finished_at','expires_at']);
const translateFields = new Set(['kind','plan','product','status','event','action']);

export default function ReportValue({ field, row, lang, section }) {
  const value=row[field], t=dictionary(lang);
  if (field==='memberships') return value?.length ? <ul className="memberships">{value.map(m=><li key={m.workspace_id}>
    <Link href={reportUrl('tenants',{workspace:m.workspace_id})}>{m.workspace}</Link> ({t[m.role==='admin'?'roleAdmin':m.role]||m.role})
  </li>)}</ul> : t.none;
  if (value==null || value==='') return field==='expires_at' ? t.noExpiry : '-';
  if (dates.has(field)) return <time dateTime={value}>{new Intl.DateTimeFormat(locale(lang),{dateStyle:'medium',timeStyle:'short',timeZone:'UTC'}).format(new Date(value))}</time>;
  if (field==='workspace') return <Link href={reportUrl('tenants',{workspace:row.workspace_id||row.id})}>{value}</Link>;
  if (field==='modules') return value.map(key=>t[key]||key).join(', ');
  if (field==='owners') return value.length ? value.join(', ') : t.none;
  if (field==='verified') return value ? t.yes : t.no;
  if (field==='amount_czk') return new Intl.NumberFormat(locale(lang),{style:'currency',currency:'CZK'}).format(value);
  if (['units','remaining','credits','members'].includes(field)) return new Intl.NumberFormat(locale(lang)).format(value);
  if (field==='order_id' || (field==='id' && (section==='pending'||section==='payments'))) return <Link href={'/payments/'+value} aria-label={t.review+' '+value}>{value}</Link>;
  if (translateFields.has(field)) {
    const label=Object.hasOwn(t,value) ? t[value] : String(value);
    return field==='status' ? <span className="badge">{label}</span> : label;
  }
  return String(value);
}
