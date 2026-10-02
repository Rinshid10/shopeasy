-- Product details such as Color, Material and Size, shown as a table on the product page.
-- Stored in order as [{"label": "Color", "value": "Blue"}, ...].

alter table public.products
  add column specs jsonb not null default '[]'::jsonb
    check (jsonb_typeof(specs) = 'array' and jsonb_array_length(specs) <= 40);
