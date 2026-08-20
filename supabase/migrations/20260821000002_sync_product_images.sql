-- Ensure all products have their primary image in the product_images table for consistent gallery display
INSERT INTO public.product_images (product_id, url, display_order)
SELECT id, image_url, 0
FROM public.products
WHERE image_url IS NOT NULL
ON CONFLICT DO NOTHING;

-- Also ensure the image_urls are public and point to the correct bucket path if they were signed
UPDATE public.products
SET image_url = REPLACE(image_url, '/object/sign/', '/object/public/')
WHERE image_url LIKE '%/object/sign/%';

UPDATE public.product_images
SET url = REPLACE(url, '/object/sign/', '/object/public/')
WHERE url LIKE '%/object/sign/%';
