-- Security hardening before public launch
-- Run in Supabase SQL editor (or via CLI)

-- Idempotent Stripe webhook processing
create table if not exists stripe_webhook_events (
  id text primary key,
  type text not null,
  processed_at timestamptz default now()
);

create index if not exists stripe_webhook_events_processed_at_idx
  on stripe_webhook_events (processed_at);

-- Enable RLS: deny all direct client access.
-- App uses SUPABASE_SERVICE_ROLE_KEY server-side (bypasses RLS).
alter table woos enable row level security;
alter table users_billing enable row level security;
alter table stripe_webhook_events enable row level security;

-- Drop permissive policies if any were added during MVP
do $$
declare r record;
begin
  for r in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('woos', 'users_billing', 'stripe_webhook_events')
  loop
    execute format('drop policy if exists %I on %I', r.policyname, r.tablename);
  end loop;
end $$;

-- Explicit deny for anon/authenticated (service_role bypasses RLS)
-- No SELECT/INSERT/UPDATE/DELETE policies for anon/authenticated = no access.

-- Optional: allow reading a single Woo by primary key for authenticated users later.
-- For now all reads go through Next.js API / server components with service role.

revoke all on table woos from anon, authenticated;
revoke all on table users_billing from anon, authenticated;
revoke all on table stripe_webhook_events from anon, authenticated;

grant all on table woos to service_role;
grant all on table users_billing to service_role;
grant all on table stripe_webhook_events to service_role;
