-- Ratings and reviews from Meesho, shown on the product page clearly labelled "on Meesho" /
-- "From Meesho buyers" (the user chose to show them). The shop's own customer reviews stay in
-- product_reviews and the products.rating columns.

alter table public.products
  add column meesho_rating numeric(2, 1) check (meesho_rating between 0 and 5),
  add column meesho_rating_count integer check (meesho_rating_count >= 0),
  add column meesho_url text,
  -- Up to 20 reviews, without names: [{"rating": 5, "comment": "…", "date": "2026-08-19"}].
  add column meesho_reviews jsonb not null default '[]'::jsonb
    check (jsonb_typeof(meesho_reviews) = 'array' and jsonb_array_length(meesho_reviews) <= 20);
