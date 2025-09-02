-- Insert additional sample marketplace items with correct column names
INSERT INTO marketplace_items (seller_id, title, description, price, category, condition_status, location, images, is_available, district_id)
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

INSERT INTO marketplace_items (seller_id, title, description, price, category, condition_status, location, images, is_available, district_id)
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

INSERT INTO marketplace_items (seller_id, title, description, price, category, condition_status, location, images, is_available, district_id)
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

INSERT INTO marketplace_items (seller_id, title, description, price, category, condition_status, location, images, is_available, district_id)
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

-- Ensure we have some sample bookings data
INSERT INTO bookings (user_id, facility_id, booking_date, start_time, end_time, duration_hours, purpose, status, total_amount)
SELECT 
  (SELECT id FROM profiles LIMIT 1),
  (SELECT id FROM facilities WHERE name = 'Community Hall' LIMIT 1),
  CURRENT_DATE + INTERVAL '2 days',
  '14:00:00',
  '16:00:00',
  2,
  'Birthday Party',
  'confirmed',
  100.00
WHERE NOT EXISTS (
  SELECT 1 FROM bookings 
  WHERE facility_id = (SELECT id FROM facilities WHERE name = 'Community Hall' LIMIT 1)
  AND booking_date = CURRENT_DATE + INTERVAL '2 days'
);

INSERT INTO bookings (user_id, facility_id, booking_date, start_time, end_time, duration_hours, purpose, status, total_amount)
SELECT 
  (SELECT id FROM profiles LIMIT 1),
  (SELECT id FROM facilities WHERE name = 'Swimming Pool' LIMIT 1),
  CURRENT_DATE + INTERVAL '1 day',
  '10:00:00',
  '12:00:00',
  2,
  'Swimming Lessons',
  'pending',
  40.00
WHERE NOT EXISTS (
  SELECT 1 FROM bookings 
  WHERE facility_id = (SELECT id FROM facilities WHERE name = 'Swimming Pool' LIMIT 1)
  AND booking_date = CURRENT_DATE + INTERVAL '1 day'
);