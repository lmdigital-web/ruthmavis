
-- Drop existing policies if they exist to avoid conflict (only if needed, but since we got conflict on name let's use OR REPLACE logic if possible or just fresh names)
-- Actually, the error says "Public Access" already exists. Let's name them uniquely.

-- Allow public access to read images (if bucket is public or via these policies)
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Public Access for product-images') then
    create policy "Public Access for product-images"
    on storage.objects for select
    to public
    using ( bucket_id = 'product-images' );
  end if;
  
  if not exists (select 1 from pg_policies where policyname = 'Admin Upload for product-images') then
    create policy "Admin Upload for product-images"
    on storage.objects for insert
    to authenticated
    with check ( bucket_id = 'product-images' );
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Admin Update for product-images') then
    create policy "Admin Update for product-images"
    on storage.objects for update
    to authenticated
    using ( bucket_id = 'product-images' );
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Admin Delete for product-images') then
    create policy "Admin Delete for product-images"
    on storage.objects for delete
    to authenticated
    using ( bucket_id = 'product-images' );
  end if;
end
$$;
