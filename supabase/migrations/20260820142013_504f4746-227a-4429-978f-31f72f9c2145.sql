-- Insert missing Categories
INSERT INTO public.categories (name, slug) VALUES ('GNT - Good News Translation', 'gnt-good-news-translation') ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.categories (name, slug) VALUES ('KJV - King James Version', 'kjv-king-james-version') ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.categories (name, slug) VALUES ('NIV - New International Version', 'niv-new-international-version') ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.categories (name, slug) VALUES ('NKJV - New King James Version', 'nkjv-new-king-james-version') ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.categories (name, slug) VALUES ('NLT - New Living Translation', 'nlt-new-living-translation') ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.categories (name, slug) VALUES ('Setswana', 'setswana') ON CONFLICT (slug) DO NOTHING;

-- Restore PDF Catalog Products (6 items) - Individual inserts to handle ON CONFLICT properly
INSERT INTO public.products (name, slug, price, description, category_id, stock_quantity, is_active) 
VALUES ('NLT Large Print Thinline Bible', 'nlt-large-print-thinline-bible', 350.0, '<p>Elegant NLT Large Print Thinline Bible with a beautiful floral cover.</p>', (SELECT id FROM public.categories WHERE slug = 'nlt-new-living-translation'), 10, true) 
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, price, description, category_id, stock_quantity, is_active) 
VALUES ('KJV Gift and Award Bible', 'kjv-gift-and-award-bible', 180.0, '<p>King James Version Gift and Award Bible, perfect for special occasions.</p>', (SELECT id FROM public.categories WHERE slug = 'kjv-king-james-version'), 10, true) 
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, price, description, category_id, stock_quantity, is_active) 
VALUES ('NIV Study Bible', 'niv-study-bible', 450.0, '<p>New International Version Study Bible with comprehensive notes and maps.</p>', (SELECT id FROM public.categories WHERE slug = 'niv-new-international-version'), 10, true) 
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, price, description, category_id, stock_quantity, is_active) 
VALUES ('Setswana Holy Bible', 'setswana-holy-bible', 250.0, '<p>Bibele e e Boitshepo - Setswana language Holy Bible.</p>', (SELECT id FROM public.categories WHERE slug = 'setswana'), 10, true) 
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, price, description, category_id, stock_quantity, is_active) 
VALUES ('NLT Filament Collection Bible', 'nlt-filament-collection-bible', 380.0, '<p>Beautiful NLT Bible with Filament app integration for deeper study.</p>', (SELECT id FROM public.categories WHERE slug = 'nlt-new-living-translation'), 10, true) 
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, price, description, category_id, stock_quantity, is_active) 
VALUES ('KJV Standard Size Bible', 'kjv-standard-size-bible', 200.0, '<p>Classic King James Version Bible in a portable standard size.</p>', (SELECT id FROM public.categories WHERE slug = 'kjv-king-james-version'), 10, true) 
ON CONFLICT (slug) DO NOTHING;

-- Insert New Text File Products (11 items)
INSERT INTO public.products (name, slug, price, description, category_id, stock_quantity, is_active) 
VALUES ('NLT BROWN FAUX LEATHER FLEXCOVER COMPACT BIBLE WITH ZIP', 'nlt-brown-faux-leather-flexcover-compact-bible-with-zip', 180.0, '<p>Language : English<br/>Size : 181 mm x 122 mm x 28 mm<br/>Page Count : 1104<br/>Format : Flexcover<br/>6.75-point type size<br/>Publisher : Christian Art Publishers</p><p><strong>SKU:</strong> 9781776370337</p>', (SELECT id FROM public.categories WHERE name = 'NLT - New Living Translation'), 10, true) 
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, price, description, category_id, stock_quantity, is_active) 
VALUES ('NLT PURPLE FAUX LEATHER FLEXCOVER COMPACT BIBLE', 'nlt-purple-faux-leather-flexcover-compact-bible', 200.0, '<p>Language : English<br/>Size : 168 mm x 113 mm x 29 mm<br/>Page Count : 1104<br/>Format : Flexcover<br/>* 6.75-point type size<br/>Publisher : Christian Art Publishers</p><p><strong>SKU:</strong> 9781776370368</p>', (SELECT id FROM public.categories WHERE name = 'NLT - New Living Translation'), 10, true) 
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, price, description, category_id, stock_quantity, is_active) 
VALUES ('NIV PINK PAPERBACK GIFT & AWARD BIBLE RED LETTER EDITION COMFORT PRINT', 'niv-pink-paperback-gift-award-bible-red-letter-edition-comfort-print', 200.0, '<p>Language : English<br/>Size : 220 mm x 143 mm x 25 mm<br/>Page Count : 704<br/>Format : Paperback<br/>7.7-point print size<br/>Publisher : Zondervan Publishing House</p><p><strong>SKU:</strong> 9780310450429</p>', (SELECT id FROM public.categories WHERE name = 'NIV - New International Version'), 10, true) 
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, price, description, category_id, stock_quantity, is_active) 
VALUES ('NLT PURPLE HARDCOVER STANDARD BIBLE', 'nlt-purple-hardcover-standard-bible', 240.0, '<p>Language : English<br/>Size : 217 mm x 143 mm x 31 mm<br/>Page Count : 1032<br/>Format : Hardcover<br/>9-point type size<br/>Publisher : Christian Art Publishers</p><p><strong>SKU:</strong> 9780638004335</p>', (SELECT id FROM public.categories WHERE name = 'NLT - New Living Translation'), 10, true) 
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, price, description, category_id, stock_quantity, is_active) 
VALUES ('KJV GREY CROSS FAUX LEATHER COMPACT LARGE PRINT BIBLE WITH ZIP', 'kjv-grey-cross-faux-leather-compact-large-print-bible-with-zip', 200.0, '<p>Language : English<br/>Size : 182 mm x 124 mm x 33 mm<br/>Page Count : 1532<br/>Format : Flexcover<br/>Large Print 10-point font size<br/>Publisher : Christian Art Publishers</p><p><strong>SKU:</strong> 9798896780298</p>', (SELECT id FROM public.categories WHERE name = 'KJV - King James Version'), 10, true) 
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, price, description, category_id, stock_quantity, is_active) 
VALUES ('KJV CHARCOAL FAUX LEATHER COMPACT BIBLE LARGE PRINT', 'kjv-charcoal-faux-leather-compact-bible-large-print', 200.0, '<p>Language : English<br/>Size : 169 mm x 119 mm x 32 mm<br/>Page Count : 1540<br/>Large Print 10-point font size<br/>Publisher : Christian Art Publishers</p><p><strong>SKU:</strong> 9781642729276</p>', (SELECT id FROM public.categories WHERE name = 'KJV - King James Version'), 10, true) 
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, price, description, category_id, stock_quantity, is_active) 
VALUES ('GNT FULL COLOR HARDCOVER INTERACTIVE YOUTH EDITION BIBLE', 'gnt-full-color-hardcover-interactive-youth-edition-bible', 200.0, '<p>Language : English<br/>Size : 180 mm x 120 mm x 30 mm<br/>Page Count : 1307<br/>Format : Hardcover<br/>8.5-point type size<br/>Publisher : Bible Society Kempton Park</p><p><strong>SKU:</strong> 9780564080571</p>', (SELECT id FROM public.categories WHERE name = 'GNT - Good News Translation'), 10, true) 
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, price, description, category_id, stock_quantity, is_active) 
VALUES ('NLT PINK HARDCOVER STANDARD BIBLE', 'nlt-pink-hardcover-standard-bible', 240.0, '<p>Language : English<br/>Size : 218 mm x 147 mm x 24 mm<br/>Page Count : 1032<br/>Format : Hardcover<br/>Publisher : Christian Art Publishers</p><p><strong>SKU:</strong> 9780638002324</p>', (SELECT id FROM public.categories WHERE name = 'NLT - New Living Translation'), 10, true) 
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, price, description, category_id, stock_quantity, is_active) 
VALUES ('NKJV HOLY BIBLE SOFT TOUCH EDITION PINK (COMFORT PRINT)(IMITATION LEATHER', 'nkjv-holy-bible-soft-touch-edition-pink-comfort-print-imitation-leather', 0.0, '<p>Language : English<br/>Size : 216 mm x 137 mm x 33 mm<br/>Page Count : 768<br/>Easy-to-read 7.5-point print size<br/>Publisher : Thomas Nelson</p><p><strong>SKU:</strong> 9780785219521</p>', (SELECT id FROM public.categories WHERE name = 'NKJV - New King James Version'), 10, true) 
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, price, description, category_id, stock_quantity, is_active) 
VALUES ('KJV GREY LION FAUX LEATHER COMPACT BIBLE', 'kjv-grey-lion-faux-leather-compact-bible', 180.0, '<p>Language : English<br/>Size : 170 mm x 116 mm x 28 mm<br/>Page Count : 1008<br/>Format : Flexcover<br/>7-point type size<br/>Publisher : Christian Art Publishers</p><p><strong>SKU:</strong> 9781639529810</p>', (SELECT id FROM public.categories WHERE name = 'KJV - King James Version'), 10, true) 
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, price, description, category_id, stock_quantity, is_active) 
VALUES ('KJV PURPLE HARDCOVER FAUX LEATHER COMPACT BIBLE', 'kjv-purple-hardcover-faux-leather-compact-bible', 0.0, '<p>Language : English<br/>Size : 168 mm x 116 mm x 29 mm<br/>Page Count : 1008<br/>Format : Hardcover<br/>7-point type size<br/>Publisher : Christian Art Publishers</p><p><strong>SKU:</strong> 9798896780267</p>', (SELECT id FROM public.categories WHERE name = 'KJV - King James Version'), 10, true) 
ON CONFLICT (slug) DO NOTHING;
