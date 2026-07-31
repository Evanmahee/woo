-- 3-tier pricing migration (run if you already applied the initial schema)

alter table users_billing
  add column if not exists plan text default 'free'; -- free | woo_plus | woo_pro

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'users_billing' and column_name = 'is_pro'
  ) then
    update users_billing
      set plan = case when is_pro then 'woo_pro' else 'free' end
      where plan is null or plan = 'free';
  end if;
end $$;
