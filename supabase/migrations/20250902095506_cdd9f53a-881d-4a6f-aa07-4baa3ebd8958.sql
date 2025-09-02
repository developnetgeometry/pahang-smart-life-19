-- Insert additional sample marketplace items with correct column names
INSERT INTO marketplace_items (seller_id, title, description, price, category, condition, location, images, is_available, district_id)
SELECT 
  (SELECT id FROM profiles WHERE email IS NOT NULL LIMIT 1),
  'Samsung Galaxy S23',
  'Brand new Samsung Galaxy S23 with warranty',
  2800.00,
  'Electronics',
  'new',
  'Block C, Unit 5-8',
  ARRAY['/placeholder.svg'],
  true,
  (SELECT id FROM districts LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM marketplace_items WHERE title = 'Samsung Galaxy S23');

INSERT INTO marketplace_items (seller_id, title, description, price, category, condition, location, images, is_available, district_id)
SELECT 
  (SELECT id FROM profiles WHERE email IS NOT NULL LIMIT 1),
  'Office Chair',
  'Ergonomic office chair, barely used',
  280.00,
  'Furniture',
  'like-new',
  'Block A, Unit 12-3',
  ARRAY['/placeholder.svg'],
  true,
  (SELECT id FROM districts LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM marketplace_items WHERE title = 'Office Chair');

INSERT INTO marketplace_items (seller_id, title, description, price, category, condition, location, images, is_available, district_id)
SELECT 
  (SELECT id FROM profiles WHERE email IS NOT NULL LIMIT 1),
  'Bicycle',
  'Mountain bike in good condition',
  450.00,
  'Sports & Recreation',
  'good',
  'Block B, Unit 7-2',
  ARRAY['/placeholder.svg'],
  true,
  (SELECT id FROM districts LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM marketplace_items WHERE title = 'Bicycle');

INSERT INTO marketplace_items (seller_id, title, description, price, category, condition, location, images, is_available, district_id)
SELECT 
  (SELECT id FROM profiles WHERE email IS NOT NULL LIMIT 1),
  'Designer Jacket',
  'Branded winter jacket, size M',
  180.00,
  'Clothing',
  'good',
  'Block D, Unit 3-1',
  ARRAY['/placeholder.svg'],
  true,
  (SELECT id FROM districts LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM marketplace_items WHERE title = 'Designer Jacket');