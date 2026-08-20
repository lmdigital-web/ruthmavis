-- Ensure all products have their primary image in the product_images table for consistent gallery display
INSERT INTO public.product_images (product_id, url, display_order)
SELECT id, image_url, 0
FROM public.products
WHERE image_url IS NOT NULL
ON CONFLICT DO NOTHING;

-- Force update all existing image URLs to use the public endpoint instead of signed ones
UPDATE public.products
SET image_url = REPLACE(image_url, '/object/sign/', '/object/public/')
WHERE image_url LIKE '%/object/sign/%';

UPDATE public.product_images
SET url = REPLACE(url, '/object/sign/', '/object/public/')
WHERE url LIKE '%/object/sign/%';

-- Remove any URL parameters (like tokens) from existing stored URLs to keep them clean
UPDATE public.products
SET image_url = SPLIT_PART(image_url, '?', 1)
WHERE image_url LIKE '%?%';

UPDATE public.product_images
SET url = SPLIT_PART(url, '?', 1)
WHERE url LIKE '%?%';
