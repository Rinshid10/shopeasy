-- Meesho's rating bars: how many buyers gave 5, 4, 3, 2 and 1 stars, and how many wrote a review.
alter table public.products
  add column meesho_review_count integer check (meesho_review_count >= 0),
  add column meesho_star_counts integer[]
    check (cardinality(meesho_star_counts) = 5 and 0 <= all (meesho_star_counts));

comment on column public.products.meesho_star_counts is
  'Meesho ratings per star level, best first: [5 stars, 4, 3, 2, 1].';
