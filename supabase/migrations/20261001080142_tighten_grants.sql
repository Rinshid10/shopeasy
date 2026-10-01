-- The project's default privileges give anon and authenticated every privilege on new public
-- tables. RLS still guards rows, but grant only what each role actually uses, as a second
-- layer (TRUNCATE in particular ignores RLS).

revoke all on all tables in schema public from anon, authenticated;

grant select on public.categories, public.products, public.store_settings to anon, authenticated;
grant insert, update, delete on public.categories, public.products to authenticated;
grant update on public.store_settings to authenticated;

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.addresses, public.cart_items to authenticated;

grant select, update on public.orders to authenticated;
grant select on public.order_items to authenticated;
grant select, insert on public.order_events to authenticated;

grant select, insert, update, delete on public.coupons, public.payouts to authenticated;
grant select, update on public.return_requests to authenticated;

-- Stop new public tables from getting broad grants automatically; grant them explicitly.
alter default privileges in schema public revoke all on tables from anon, authenticated;
