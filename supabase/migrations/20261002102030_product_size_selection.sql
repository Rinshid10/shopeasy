-- The size a shopper picks for products that come in sizes ("Sizes: S, M, L" in the details).
-- Buy Now saves it with the selection; place_order requires a valid one and copies it onto
-- the order line.

alter table public.cart_items
  add column size text check (char_length(size) between 1 and 40);
alter table public.order_items
  add column size text check (char_length(size) between 1 and 40);

-- The sizes a product comes in, from its "Size" / "Sizes" details row, e.g. {S,M,L}.
create function private.product_sizes(p_specs jsonb)
returns text[]
language sql
immutable
set search_path = ''
as $$
  select coalesce(array_agg(trim(size)) filter (where trim(size) <> ''), '{}')
  from jsonb_array_elements(coalesce(p_specs, '[]'::jsonb)) as spec,
    regexp_split_to_table(spec ->> 'value', ',') as size
  where trim(spec ->> 'label') ~* '^sizes?$'
$$;

create or replace function private.place_order_impl(p_address_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid := auth.uid();
  v_is_guest boolean := coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false);
  v_name text;
  v_email text;
  v_address public.addresses;
  v_settings public.store_settings;
  v_order_id text;
  v_subtotal integer;
  v_delivery integer;
  v_line_count integer;
  v_short_title text;
  v_unsized_title text;
begin
  if v_user_id is null then
    raise exception 'Please log in to place an order' using errcode = '42501';
  end if;

  select nullif(full_name, ''), coalesce(email, contact_email)
  into v_name, v_email
  from public.profiles where id = v_user_id;
  if v_is_guest and (v_name is null or v_email is null) then
    raise exception 'Please log in, or enter your name and email, to place an order'
      using errcode = '42501';
  end if;

  select * into v_address from public.addresses
  where id = p_address_id and user_id = v_user_id;
  if not found then
    raise exception 'Address not found' using errcode = 'P0002';
  end if;

  select * into v_settings from public.store_settings where id;
  if not v_settings.is_cod_enabled then
    raise exception 'Cash on delivery is not available right now' using errcode = 'P0001';
  end if;

  perform 1 from public.products p
  join public.cart_items c on c.product_id = p.id
  where c.user_id = v_user_id
  order by p.id
  for update of p;

  select count(*), coalesce(sum(p.price * c.quantity), 0)
  into v_line_count, v_subtotal
  from public.cart_items c
  join public.products p on p.id = c.product_id and p.status = 'active'
  where c.user_id = v_user_id;

  if v_line_count = 0 then
    raise exception 'Your cart is empty' using errcode = 'P0001';
  end if;

  -- Products that come in sizes need one of their sizes picked.
  select p.title into v_unsized_title
  from public.cart_items c
  join public.products p on p.id = c.product_id and p.status = 'active'
  where c.user_id = v_user_id
    and cardinality(private.product_sizes(p.specs)) > 0
    and (c.size is null or not c.size = any (private.product_sizes(p.specs)))
  limit 1;
  if v_unsized_title is not null then
    raise exception 'Please select a size for %', v_unsized_title using errcode = 'P0001';
  end if;

  select p.title into v_short_title
  from public.cart_items c
  join public.products p on p.id = c.product_id and p.status = 'active'
  where c.user_id = v_user_id and p.stock < c.quantity
  limit 1;
  if v_short_title is not null then
    raise exception 'Not enough stock for %', v_short_title using errcode = 'P0001';
  end if;

  v_delivery := case
    when v_settings.free_delivery_above > 0 and v_subtotal >= v_settings.free_delivery_above then 0
    else v_settings.delivery_charge
  end;

  if v_settings.cod_limit > 0 and v_subtotal + v_delivery > v_settings.cod_limit then
    raise exception 'Cash on delivery is available for orders up to ₹%', v_settings.cod_limit
      using errcode = 'P0001';
  end if;

  v_order_id := 'SE' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));

  insert into public.orders (
    id, user_id, customer_name, customer_email, address, subtotal, delivery_charge, total
  )
  values (
    v_order_id,
    v_user_id,
    coalesce(v_name, v_address.full_name),
    v_email,
    jsonb_build_object(
      'fullName', v_address.full_name,
      'phone', v_address.phone,
      'houseNumber', v_address.house_number,
      'area', v_address.area,
      'landmark', v_address.landmark,
      'pincode', v_address.pincode,
      'city', v_address.city,
      'state', v_address.state
    ),
    v_subtotal,
    v_delivery,
    v_subtotal + v_delivery
  );

  insert into public.order_items (
    order_id, product_id, product_slug, title, image_path, price, quantity, size
  )
  select v_order_id, p.id, p.slug, p.title, p.image_path, p.price, c.quantity,
    case when cardinality(private.product_sizes(p.specs)) > 0 then c.size end
  from public.cart_items c
  join public.products p on p.id = c.product_id and p.status = 'active'
  where c.user_id = v_user_id
  order by c.added_at;

  update public.products p
  set stock = p.stock - c.quantity
  from public.cart_items c
  where c.user_id = v_user_id and c.product_id = p.id and p.status = 'active';

  insert into public.order_events (order_id, status) values (v_order_id, 'new');

  delete from public.cart_items where user_id = v_user_id;

  return v_order_id;
end;
$function$;
