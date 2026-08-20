DELETE FROM public.products;
DELETE FROM public.categories;

INSERT INTO public.categories (id, name, slug) VALUES
(gen_random_uuid(), 'NLT - New Living Translation', 'nlt-new-living-translation'),
(gen_random_uuid(), 'KJV - King James Version', 'kjv-king-james-version'),
(gen_random_uuid(), 'Tswana 1970 Translation', 'tswana-1970-translation'),
(gen_random_uuid(), 'NIV - New International Version', 'niv-new-international-version');

INSERT INTO public.products (id, name, slug, description, price, stock_quantity, category_id, is_active) VALUES
(gen_random_uuid(), 'NLT HARDCOVER AFRICA EDITION BIBLE', 'nlt-hardcover-africa-edition-bible', 'SKU: 9781594527319
Language: English
Size: 216 mm x 145 mm x 24 mm
Page Count: 1040
Format: Hardcover
Publisher: Oasis International', 200, 100, (SELECT id FROM public.categories WHERE name = 'NLT - New Living Translation' LIMIT 1), true),
(gen_random_uuid(), 'KJV TEAL FAUX LEATHER MINI POCKET BIBLE WITH ZIP', 'kjv-teal-faux-leather-mini-pocket-bible-with-zip', 'SKU: 9781639526840
Language: English
Size: 152 mm x 103 mm x 28 mm
Page Count: 1008
Format: Flexcover
Publisher: Christian Art Publishers', 220, 100, (SELECT id FROM public.categories WHERE name = 'KJV - King James Version' LIMIT 1), true),
(gen_random_uuid(), 'NLT COMPACT BIBLE BURGUNDY HARDCOVER', 'nlt-compact-bible-burgundy-hardcover', 'SKU: 9781432128302
Language: English
Size: 165 mm x 112 mm x 31 mm
Page Count: 1104
Format: Hardcover
Publisher: Christian Art Publishers', 180, 100, (SELECT id FROM public.categories WHERE name = 'NLT - New Living Translation' LIMIT 1), true),
(gen_random_uuid(), 'KJV BROWN LION FAUX LEATHER COMPACT BIBLE WITH ZIP', 'kjv-brown-lion-faux-leather-compact-bible-with-zip', 'SKU: 9798896780236
Language: English
Size: 178 mm x 122 mm x 26 mm
Page Count: 1008
Format: Flexcover
Publisher: Christian Art Publishers', 180, 100, (SELECT id FROM public.categories WHERE name = 'KJV - King James Version' LIMIT 1), true),
(gen_random_uuid(), 'SETSWANA 1970 BLACK HARDCOVER BIBLE MEDIUM', 'setswana-1970-black-hardcover-bible-medium', 'SKU: 9780798222945
Language: Tswana
Size: 125 mm x 185 mm
Page Count: 1574
Format: Hardcover
Publisher: Bible Society Kempton Park', 260, 100, (SELECT id FROM public.categories WHERE name = 'Tswana 1970 Translation' LIMIT 1), true),
(gen_random_uuid(), 'NIV HOLY BIBLE GREEN FOREST DESIGN FLEXCOVER', 'niv-holy-bible-green-forest-design-flexcover', 'SKU: 9781928437123
Language: English
Size: 216 mm x 140 mm x 22 mm
Page Count: 961
Format: Flexcover
7.5 point font size
Publisher: Christian Media Publishing', 260, 100, (SELECT id FROM public.categories WHERE name = 'NIV - New International Version' LIMIT 1), true);