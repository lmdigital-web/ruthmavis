-- Delete existing products (cascades to product_variants and order_items)
DELETE FROM public.products;
DELETE FROM public.categories;

-- Insert new categories
INSERT INTO public.categories (id, name, slug) VALUES
(gen_random_uuid(), 'NLT - New Living Translation', 'nlt-new-living-translation'),
(gen_random_uuid(), 'KJV - King James Version', 'kjv-king-james-version'),
(gen_random_uuid(), 'Tswana 1970 Translation', 'tswana-1970-translation'),
(gen_random_uuid(), 'NIV - New International Version', 'niv-new-international-version');

-- Function to get category_id by name
CREATE OR REPLACE FUNCTION get_cat_id(cat_name TEXT) RETURNS UUID AS $$
  SELECT id FROM public.categories WHERE name = cat_name LIMIT 1;
$$ LANGUAGE sql;

-- Insert products
INSERT INTO public.products (id, name, slug, description, price, stock_quantity, category_id, is_active) VALUES
(gen_random_uuid(), 'NLT HARDCOVER AFRICA EDITION BIBLE', 'nlt-hardcover-africa-edition-bible', 'SKU: 9781594527319\nLanguage: English\nSize: 216 mm x 145 mm x 24 mm\nPage Count: 1040\nFormat: Hardcover\nPublisher: Oasis International', 200, 100, get_cat_id('NLT - New Living Translation'), true),
(gen_random_uuid(), 'KJV TEAL FAUX LEATHER MINI POCKET BIBLE WITH ZIP', 'kjv-teal-faux-leather-mini-pocket-bible-with-zip', 'SKU: 9781639526840\nLanguage: English\nSize: 152 mm x 103 mm x 28 mm\nPage Count: 1008\nFormat: Flexcover\nPublisher: Christian Art Publishers', 220, 100, get_cat_id('KJV - King James Version'), true),
(gen_random_uuid(), 'NLT COMPACT BIBLE BURGUNDY HARDCOVER', 'nlt-compact-bible-burgundy-hardcover', 'SKU: 9781432128302\nLanguage: English\nSize: 165 mm x 112 mm x 31 mm\nPage Count: 1104\nFormat: Hardcover\nPublisher: Christian Art Publishers', 180, 100, get_cat_id('NLT - New Living Translation'), true),
(gen_random_uuid(), 'KJV BROWN LION FAUX LEATHER COMPACT BIBLE WITH ZIP', 'kjv-brown-lion-faux-leather-compact-bible-with-zip', 'SKU: 9798896780236\nLanguage: English\nSize: 178 mm x 122 mm x 26 mm\nPage Count: 1008\nFormat: Flexcover\nPublisher: Christian Art Publishers', 180, 100, get_cat_id('KJV - King James Version'), true),
(gen_random_uuid(), 'SETSWANA 1970 BLACK HARDCOVER BIBLE MEDIUM', 'setswana-1970-black-hardcover-bible-medium', 'SKU: 9780798222945\nLanguage: Tswana\nSize: 125 mm x 185 mm\nPage Count: 1574\nFormat: Hardcover\nPublisher: Bible Society Kempton Park', 260, 100, get_cat_id('Tswana 1970 Translation'), true),
(gen_random_uuid(), 'NIV HOLY BIBLE GREEN FOREST DESIGN FLEXCOVER', 'niv-holy-bible-green-forest-design-flexcover', 'SKU: 9781928437123\nLanguage: English\nSize: 216 mm x 140 mm x 22 mm\nPage Count: 961\nFormat: Flexcover\n7.5 point font size\nPublisher: Christian Media Publishing', 260, 100, get_cat_id('NIV - New International Version'), true);

DROP FUNCTION get_cat_id(TEXT);
