-- Woo MVP schema
-- Run this in the Supabase SQL editor

create table if not exists woos (
  id uuid primary key default gen_random_uuid(),
  sender_name text not null,
  sender_email text not null,
  recipient_name text not null,
  recipient_email text not null,
  date date not null,
  time time not null,
  activity_mode text default 'fixed', -- fixed | recipient_choice
  plan text,                          -- set if activity_mode = 'fixed'
  proposed_activities jsonb,          -- set if activity_mode = 'recipient_choice'
  chosen_activity text,
  custom_message text,
  theme text default 'default',
  status text default 'pending', -- pending | accepted | proposed_alt | declined
  proposed_alt_date date,
  proposed_alt_time time,
  created_at timestamptz default now()
);

create table if not exists users_billing (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  plan text default 'free', -- free | woo_plus | woo_pro
  stripe_customer_id text,
  stripe_subscription_id text,
  woos_sent_this_month int default 0,
  month_key text, -- YYYY-MM for quota reset
  created_at timestamptz default now()
);

-- Migrate existing projects that still have is_pro
alter table users_billing add column if not exists plan text default 'free';

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'users_billing' and column_name = 'is_pro'
  ) then
    update users_billing
      set plan = case when is_pro then 'woo_pro' else coalesce(plan, 'free') end
      where plan is null or plan = 'free';
    -- Keep is_pro for a soft transition; drop when ready:
    -- alter table users_billing drop column if exists is_pro;
  end if;
end $$;

-- MVP: RLS disabled (email-based identification, no auth yet)
alter table woos disable row level security;
alter table users_billing disable row level security;

create index if not exists woos_sender_email_idx on woos (sender_email);
create index if not exists woos_status_idx on woos (status);
create index if not exists users_billing_email_idx on users_billing (email);
create index if not exists users_billing_stripe_customer_idx on users_billing (stripe_customer_id);
