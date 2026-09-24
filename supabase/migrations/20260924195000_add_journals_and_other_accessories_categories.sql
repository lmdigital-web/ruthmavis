insert into public.categories (name, slug)
select 'Journals', 'journals'
where not exists (
  select 1 from public.categories where slug = 'journals'
);

insert into public.categories (name, slug)
select 'Other Accessories', 'other-accessories'
where not exists (
  select 1 from public.categories where slug = 'other-accessories'
);
