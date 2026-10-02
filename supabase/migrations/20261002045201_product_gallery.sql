-- Products can have up to 4 pictures: image_path is the main one (shown on cards), and up to
-- 3 more go in extra_image_paths, shown as thumbnails on the product page.

alter table public.products
  add column extra_image_paths text[] not null default '{}'
    check (cardinality(extra_image_paths) <= 3);
