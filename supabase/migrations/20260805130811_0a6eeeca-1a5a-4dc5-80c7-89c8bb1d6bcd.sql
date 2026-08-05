-- Seed Categories
INSERT INTO public.categories (name, slug) VALUES 
('Decorative Bibles', 'decorative-bibles'),
('Devotionals', 'devotionals'),
('Handmade Crochet', 'handmade-crochet'),
('Gift Combos', 'gift-combos')
ON CONFLICT DO NOTHING;

-- Seed Products
INSERT INTO public.products (name, slug, description, price, category_id, image_url, stock_quantity, is_active)
SELECT 
  'Elegant White Leather Bible', 
  'elegant-white-leather-bible', 
  'A beautiful decorative Bible with gold-edged pages and a soft white leather cover.', 
  850.00, 
  id, 
  'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=800', 
  10, 
  true
FROM public.categories WHERE slug = 'decorative-bibles'
LIMIT 1;

INSERT INTO public.products (name, slug, description, price, category_id, image_url, stock_quantity, is_active)
SELECT 
  'Floral Devotional Journal', 
  'floral-devotional-journal', 
  'Start your morning with grace using this beautifully illustrated devotional journal.', 
  350.00, 
  id, 
  'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800', 
  25, 
  true
FROM public.categories WHERE slug = 'devotionals'
LIMIT 1;

INSERT INTO public.products (name, slug, description, price, category_id, image_url, stock_quantity, is_active)
SELECT 
  'Blush Crochet Handbag', 
  'blush-crochet-handbag', 
  'Handmade with love, this blush pink crochet bag is the perfect accessory for any occasion.', 
  450.00, 
  id, 
  'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&q=80&w=800', 
  5, 
  true
FROM public.categories WHERE slug = 'handmade-crochet'
LIMIT 1;

INSERT INTO public.products (name, slug, description, price, category_id, image_url, stock_quantity, is_active)
SELECT 
  'Grace & Peace Gift Bundle', 
  'grace-peace-gift-bundle', 
  'A curated combo including a decorative Bible, a matching bookmark, and a floral candle.', 
  1200.00, 
  id, 
  'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=800', 
  8, 
  true
FROM public.categories WHERE slug = 'gift-combos'
LIMIT 1;
