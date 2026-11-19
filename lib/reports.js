export const reports = {
  tenants: { title:'tenants', columns:[['workspace'],['slug'],['members'],['owners'],['modules'],['created_at']] },
  users: { title:'users', columns:[['email'],['verified'],['memberships'],['last_sign_in_at'],['id','userId']] },
  subscriptions: { title:'subscriptions', columns:[['workspace'],['plan'],['status'],['period_start'],['period_end']] },
  payments: { title:'payments', columns:[['workspace'],['kind'],['product'],['status'],['amount_czk'],['credits'],['created_at','requestedAt'],['requested_by'],['settled_at'],['settled_by'],['id','orderId']] },
  usage: { title:'usage', columns:[['workspace'],['action'],['actor'],['units'],['status'],['created_at','started'],['finished_at']] },
  credits: { title:'creditGrants', columns:[['workspace'],['kind','source'],['units','granted'],['remaining'],['created_at','grantedOn'],['expires_at']] },
  activity: { title:'activity', columns:[['created_at','eventDate'],['workspace'],['event'],['actor','performed'],['subject']] }
};
export const navigationReports = Object.entries(reports);
reports.pending = { title:'pendingOrders', columns:reports.payments.columns };

export function reportUrl(section, { workspace, q, page } = {}) {
  const params = new URLSearchParams();
  if (workspace) params.set('workspace',workspace);
  if (q) params.set('q',q);
  if (page && page>1) params.set('page',String(page));
  return '/'+section+(params.size?'?'+params:'');
}
