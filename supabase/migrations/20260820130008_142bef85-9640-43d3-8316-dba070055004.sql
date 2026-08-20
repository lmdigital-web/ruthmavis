-- Double check and ensure policies are wide open for reading
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-images');

-- Ensure all existing images in the products and product_images tables are clean
UPDATE public.products
SET image_url = REPLACE(REPLACE(image_url, '/object/sign/', '/object/public/'), '?token=', '?')
WHERE image_url LIKE '%/object/sign/%';

UPDATE public.product_images
SET url = REPLACE(REPLACE(url, '/object/sign/', '/object/public/'), '?token=', '?')
WHERE url LIKE '%/object/sign/%';

-- Remove everything after the first '?' if it exists
UPDATE public.products
SET image_url = SPLIT_PART(image_url, '?', 1)
WHERE image_url LIKE '%?%';

UPDATE public.product_images
SET url = SPLIT_PART(url, '?', 1)
WHERE url LIKE '%?%';
