-- Same rules as before, written more simply. Must match lib/product-options.ts.
create or replace function private.product_options(p_specs jsonb)
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
  -- Each value of each matching details row, with how many values that row has.
  row_values as (
    select t.name, t.position, t.min_values, trim(v.value) as value,
      spec.row_number * 1000 + v.value_number as seen_at,
      count(*) filter (where trim(v.value) <> '') over (partition by spec.row_number) as row_size
    from jsonb_array_elements(coalesce(p_specs, '[]'::jsonb)) with ordinality as spec (item, row_number)
    join types t on lower(trim(spec.item ->> 'label')) ~ t.pattern
    cross join lateral regexp_split_to_table(spec.item ->> 'value', ',')
      with ordinality as v (value, value_number)
  ),
  -- Rows with enough values to be a choice; a value listed twice counts once.
  option_values as (
    select name, position, value, min(seen_at) as seen_at
    from row_values
    where value <> '' and row_size >= min_values
    group by name, position, value
  )
  select coalesce(jsonb_object_agg(name, option_list order by position), '{}'::jsonb)
  from (
    select name, position, jsonb_agg(value order by seen_at) as option_list
    from option_values
    group by name, position
  ) options
$$;
