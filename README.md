# Clevia platform administration

Private Next.js application for Clevia operators. It displays paginated workspace and user directories, membership activity, subscriptions, payment orders, Clevia AI operations and credit grants from the shared Clevia Supabase project. Open a workspace name to filter each report to that customer. The interface supports Czech and Slovak. Payment history shows each CZK order, its status and the operator who confirmed receipt. Open a pending order, verify receipt of its full amount, and confirm the payment to activate its subscription or grant purchased AI credits. The database applies each order once. This flow records an external payment without initiating a Stripe charge.

## Run

Use Node.js 24. Copy `.env.example` to `.env.local` and set the Supabase URL and publishable key for the same project as the customer application. Run `npm ci` and `npm run dev`. For a production build run `npm run build` followed by `npm start`. A separate Vercel project can deploy this repository with the same two public environment settings.

## Administrator access

Shared database migrations live in `phronec/crm-astra`. Apply the workspace, billing, platform administrator and order settlement migrations there before using this app. Sign in with a verified Supabase account. Every report checks a private grant keyed to the account UUID. Workspace Owner and Admin roles only govern access inside their workspace.

The current overview also requires migrations `202611190010_admin_operations.sql`, `202611190013_platform_analytics.sql` and `202611190019_module_activity.sql` from that repository. Apply shared migrations before deploying the matching console update.

The console uses email/password sign-in. Accounts initially created with Google can set a password in the main Clevia application's password settings before signing in here. The login page links to those settings and to password recovery.

A database operator can look up the intended verified account in Supabase Authentication, verify its UUID and grant access from a privileged SQL session:

```sql
insert into private.platform_administrators(user_id)
select id from auth.users
where id = '<verified-auth-user-uuid>'::uuid and email_confirmed_at is not null;
```

To revoke access, delete the matching row from `private.platform_administrators`. The next database report request checks the grant again. The operator console only needs the publishable key. Its host-scoped HTTP-only session cookie has a separate name from the tenant application's cookie. The read API exposes selected operational fields and records daily access counts per administrator and report in `private.platform_report_access`.

## Activity and billing reports

The overview supports 7-day and 30-day UTC periods. Business module activity counts committed record creates, updates and removals, including document permission changes. It retains workspace, actor, entity UUID, module and timestamp metadata without copying customer messages, campaign content or document names. One workflow can change several records. Collection starts when migration 019 is installed; earlier changes and passive page views are not reconstructed. Failed transactions and unchanged updates do not create activity records. The activity directory can be searched by module or entity UUID and filtered by workspace and UTC dates.

With the main application's migrations through 043, counters also cover weekly timesheet reviews, time projects and activities, marketing preferences and audience snapshots, HR leave policies and allowances, customer invoice receipts, and Knowledge drafts and templates. These workflow records have Czech and Slovak labels. Private draft bodies, recipient addresses, leave reasons and customer invoice payment amounts are excluded from activity metadata. Customer invoice receipts remain separate from the Clevia subscription payment reports.

AI activity counts tool operations separately, including successful website screenshots. Internal Clevia AI credits represent the customer allowance. Provider input/output tokens appear only when recorded by the provider; unavailable measurements do not imply zero usage. Payment totals use the manually confirmed settlement date, while pending orders show their current state. These reports do not initiate payment collection.
