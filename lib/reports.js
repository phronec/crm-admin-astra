export const reports = {
  tenants: { title:'tenants', columns:[['workspace'],['slug'],['members'],['owners'],['modules'],['created_at']] },
  users: { title:'users', columns:[['email'],['verified'],['memberships'],['last_sign_in_at'],['id','userId']] },
  subscriptions: { title:'subscriptions', columns:[['workspace'],['plan'],['status'],['period_start'],['period_end']] },
  payments: { title:'payments', columns:[['workspace'],['kind'],['product'],['status'],['amount_czk'],['credits'],['created_at','requestedAt'],['requested_by'],['settled_at'],['settled_by'],['id','orderId']] },
  usage: { title:'usage', columns:[['workspace'],['action'],['actor'],['units'],['status'],['created_at','started'],['finished_at']] },
  credits: { title:'creditGrants', columns:[['workspace'],['kind','source'],['units','granted'],['remaining'],['created_at','grantedOn'],['expires_at'],['order_id','orderId']] },
  activity: { title:'activity', columns:[['created_at','eventDate'],['workspace'],['module'],['event'],['entity_type'],['entity_id'],['actor','performed'],['subject'],['order_id','orderId']] }
};
export const navigationReports = Object.entries(reports);
reports.pending = { title:'pendingOrders', columns:reports.payments.columns };


export const stateOptions = {
  payments: ['pending','paid','cancelled'],
  subscriptions: ['pending','active','legacy','expired'],
  usage: ['reserved','charged','refunded','expired']
};

const orderTypes = ['subscription','topup'];
export const kindOptions = {
  payments: orderTypes,
  pending: orderTypes,
  credits: ['allowance','topup','trial'],
  activity: ['Workspace created','Workspace updated','Workspace removed','Member added','Member removed','Membership changed','Account registered','Latest account sign-in','Payment manually confirmed']
};

export function reportUrl(section, filters = {}) {
  const params = new URLSearchParams();
  for (const key of ['workspace','q','state','kind','from','to','date','page']) {
    const value = filters[key];
    if (value && !(key === 'page' && Number(value) === 1) && !(key === 'date' && value === 'created')) {
      params.set(key, String(value));
    }
  }
  return '/' + section + (params.size ? '?' + params.toString() : '');
}

function validDate(value) {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return false;
  const date = new Date(value + 'T00:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function parseReportFilters(section, query) {
  for (const key of ['workspace','q','state','kind','from','to','date','page']) {
    if (query[key] !== undefined && typeof query[key] !== 'string') return null;
  }
  const page = Number(query.page || 1);
  if (!Number.isInteger(page) || page < 1 || page > 2147483647) return null;
  if (query.workspace && !/^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(query.workspace)) return null;
  const { state = '', kind = '', from = '', to = '', date = 'created' } = query;
  if (state && !stateOptions[section]?.includes(state)) return null;
  if (kind && !kindOptions[section]?.includes(kind)) return null;
  if (date !== 'created' && !(date === 'settled' && section === 'payments')) return null;
  if (!validDate(from) || !validDate(to)) return null;
  return { page, workspace:query.workspace || '', q:(query.q || '').trim().slice(0,120), state, kind, from, to, date };
}

export function reportArguments(section, filters) {
  return {
    p_section:section, p_page:filters.page, p_search:filters.q, p_workspace:filters.workspace || null,
    p_state:filters.state || null, p_kind:filters.kind || null, p_from:filters.from || null,
    p_to:filters.to || null, p_date_basis:filters.date
  };
}
