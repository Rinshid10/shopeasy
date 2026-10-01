-- Admin-only records: coupons, return requests and courier payouts.

create table public.coupons (
  code text primary key check (code = upper(code) and length(code) between 3 and 20),
  description text not null default '',
  type text not null check (type in ('percent', 'flat')),
  value integer not null check (value > 0),
  min_order_value integer not null default 0 check (min_order_value >= 0),
  usage_count integer not null default 0 check (usage_count >= 0),
  usage_limit integer check (usage_limit > 0),
  expires_at date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (type <> 'percent' or value <= 100)
);

create table public.return_requests (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders (id) on delete cascade,
  order_item_id bigint references public.order_items (id) on delete set null,
  user_id uuid not null references auth.users (id) on delete cascade,
  product_slug text not null,
  product_title text not null,
  reason text not null,
  amount integer not null check (amount >= 0),
  status text not null default 'requested'
    check (status in ('requested', 'approved', 'rejected', 'refunded')),
  requested_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index return_requests_order_id_idx on public.return_requests (order_id);
create index return_requests_order_item_id_idx on public.return_requests (order_item_id);
create index return_requests_user_id_idx on public.return_requests (user_id);

create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  period_start date not null,
  period_end date not null check (period_end >= period_start),
  order_count integer not null default 0 check (order_count >= 0),
  amount integer not null default 0 check (amount >= 0),
  status text not null default 'processing' check (status in ('processing', 'paid')),
  paid_at date,
  created_at timestamptz not null default now()
);

create trigger coupons_set_updated_at before update on public.coupons
  for each row execute function private.set_updated_at();
create trigger return_requests_set_updated_at before update on public.return_requests
  for each row execute function private.set_updated_at();

alter table public.coupons enable row level security;
alter table public.return_requests enable row level security;
alter table public.payouts enable row level security;

grant select, insert, update, delete on public.coupons, public.payouts to authenticated;
grant select, update on public.return_requests to authenticated;

create policy "Admins read coupons" on public.coupons
  for select to authenticated using ((select private.is_admin()));
create policy "Admins add coupons" on public.coupons
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins change coupons" on public.coupons
  for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins remove coupons" on public.coupons
  for delete to authenticated using ((select private.is_admin()));

create policy "Shoppers read their returns, admins read all" on public.return_requests
  for select to authenticated
  using ((select auth.uid()) = user_id or (select private.is_admin()));
create policy "Admins change returns" on public.return_requests
  for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create policy "Admins read payouts" on public.payouts
  for select to authenticated using ((select private.is_admin()));
create policy "Admins add payouts" on public.payouts
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins change payouts" on public.payouts
  for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins remove payouts" on public.payouts
  for delete to authenticated using ((select private.is_admin()));
