import Link from 'next/link';
import { reportUrl, stateOptions, kindOptions } from '../lib/reports';

function Options({ name, label, selected, options, all, t }) {
  return <label>{label}<select name={name} defaultValue={selected}>
    <option value="">{all}</option>
    {options.map(value => <option key={value} value={value}>{t[value]}</option>)}
  </select></label>;
}

export default function ReportFilters({ section, filters, t }) {
  const active = filters.q || filters.state || filters.kind || filters.from || filters.to || filters.date === 'settled';
  return <form className="report-filters" action={'/' + section} method="get" aria-label={t.filters}>
    {filters.workspace && <input type="hidden" name="workspace" value={filters.workspace}/>}
    <label className="filter-search">{t.find}<input type="search" name="q" maxLength={120} defaultValue={filters.q}/></label>
    {stateOptions[section] && <Options name="state" label={t.status} selected={filters.state} options={stateOptions[section]} all={t.allStates} t={t}/>}
    {kindOptions[section] && <Options name="kind" label={section === 'activity' ? t.event : t.typeFilter} selected={filters.kind} options={kindOptions[section]} all={t.allTypes} t={t}/>}
    {section === 'payments' && <label>{t.dateBasis}<select name="date" defaultValue={filters.date}>
      <option value="created">{t.requestedAt}</option><option value="settled">{t.settled_at}</option>
    </select></label>}
    <label>{t.fromUtc}<input type="date" name="from" defaultValue={filters.from}/></label>
    <label>{t.toUtc}<input type="date" name="to" defaultValue={filters.to}/></label>
    <div className="filter-actions"><button type="submit">{t.search}</button>
      {active && <Link href={reportUrl(section,{workspace:filters.workspace})}>{t.clearFilters}</Link>}
    </div>
  </form>;
}
