-- Generalises the size choice to the options a shopper picks before buying: Size, Color,
-- Shoe Size, Storage and so on. They come from the product's details: a details row of one
-- of these types listing several values ("Color: Black, White") becomes a choice; the size
-- types are a choice even with one value ("Size: Free Size"). Must match lib/product-options.ts.

alter table public.cart_items
  add column options jsonb not null default '{}'::jsonb
    check (jsonb_typeof(options) = 'object' and pg_column_size(options) < 2000);
alter table public.order_items
  add column options jsonb not null default '{}'::jsonb
    check (jsonb_typeof(options) = 'object');

-- Carry over the sizes picked since the last migration.
update public.cart_items set options = jsonb_build_object('Size', size) where size is not null;
update public.order_items set options = jsonb_build_object('Size', size) where size is not null;

-- The options a product offers, e.g. {"Size": ["S", "M"], "Color": ["Black", "White"]}.
-- (Rewritten more simply in 20261002103045_simplify_product_options.sql.)
create function private.product_options(p_specs jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  with types (name, pattern, min_values, position) as (
    values
      ('Size', '^(sizes?|clothing sizes?)$', 1, 1),
      ('Shoe Size', '^(shoe|footwear) sizes?$', 1, 2),
      ('Waist Size', '^waist( sizes?)?$', 1, 3),
      ('Age Group', '^(age|age groups?|age range)$', 2, 4),
      ('Color', '^colou?rs?$', 2, 5),
      ('Pack Size', '^(pack size|pack of)$', 2, 6),
      ('Weight', '^(net )?weight$', 2, 7),
      ('Volume', '^(net )?volume$', 2, 8),
      ('Storage', '^(internal )?storage$', 2, 9),
      ('Model', '^(models?|compatible models?)$', 2, 10),
      ('Shade', '^shades?$', 2, 11),
      ('Flavour', '^flavou?rs?$', 2, 12),
      ('Fragrance', '^fragrances?$', 2, 13)
  ),
  rows as (
    select t.name, t.min_values, t.position, spec.ordinality as row_number,
      array_agg(trim(value) order by value_number) filter (where trim(value) <> '') as row_values
    from jsonb_array_elements(coalesce(p_specs, '[]'::jsonb)) with ordinality as spec (item, ordinality)
    join types t on lower(trim(spec.item ->> 'label')) ~ t.pattern
    cross join lateral regexp_split_to_table(spec.item ->> 'value', ',') with ordinality as v (value, value_number)
    group by t.name, t.min_values, t.position, spec.ordinality
  ),
  chosen as (
    select name, position, row_values
    from rows
    where cardinality(row_values) >= min_values
  ),
  merged as (
    select name, min(position) as position,
      (select jsonb_agg(distinct_value order by first_seen)
       from (
         select value as distinct_value, min(row_number * 1000 + value_number) as first_seen
         from chosen c2
         join rows r2 on r2.name = c2.name and r2.row_values = c2.row_values
         cross join lateral unnest(c2.row_values) with ordinality as u (value, value_number)
         where c2.name = chosen.name
         group by value
       ) d) as option_values
    from chosen
    group by name
  )
  select coalesce(jsonb_object_agg(name, option_values order by position), '{}'::jsonb)
  from merged
$$;

drop function private.product_sizes(jsonb);

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
  v_missing record;
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

  -- Every option the product offers needs one of its values picked.
  select p.title, o.key as option_name into v_missing
  from public.cart_items c
  join public.products p on p.id = c.product_id and p.status = 'active'
  cross join lateral jsonb_each(private.product_options(p.specs)) as o
  where c.user_id = v_user_id
    and not coalesce(o.value ? (c.options ->> o.key), false)
  limit 1;
  if found then
    raise exception 'Please select a % for %', lower(v_missing.option_name), v_missing.title
      using errcode = 'P0001';
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

  -- Keep only the options the product offers, in its order.
  insert into public.order_items (
    order_id, product_id, product_slug, title, image_path, price, quantity, options
  )
  select v_order_id, p.id, p.slug, p.title, p.image_path, p.price, c.quantity,
    coalesce(
      (select jsonb_object_agg(o.key, c.options ->> o.key)
       from jsonb_each(private.product_options(p.specs)) as o),
      '{}'::jsonb
    )
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

alter table public.cart_items drop column size;
alter table public.order_items drop column size;
