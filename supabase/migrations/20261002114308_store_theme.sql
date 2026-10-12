-- The colour theme the admin picked for the whole site (shop and admin). Keys match lib/themes.ts.
alter table public.store_settings
  add column theme text not null default 'plum'
    check (theme in (
      'plum', 'rose', 'crimson', 'coral', 'amber', 'forest', 'emerald', 'teal',
      'ocean', 'sky', 'indigo', 'violet', 'slate', 'chocolate', 'midnight'
    ));
