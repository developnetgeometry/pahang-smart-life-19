-- Insert sample data to populate the database with real facilities and marketplace items
-- Only insert if data doesn't already exist

-- Insert additional sample facilities
INSERT INTO facilities (name, description, location, capacity, hourly_rate, is_available, amenities, operating_hours, district_id, images)
SELECT 
  'Tennis Court',
  'Professional tennis court with lighting',
  'Sports Complex, Court 2',
  4,
  35.00,
  true,
  ARRAY['Professional Net', 'Court Lighting', 'Equipment Storage'],
  jsonb_build_object('monday', '6:00-22:00', 'tuesday', '6:00-22:00', 'wednesday', '6:00-22:00', 'thursday', '6:00-22:00', 'friday', '6:00-22:00', 'saturday', '6:00-22:00', 'sunday', '6:00-22:00'),
  (SELECT id FROM districts LIMIT 1),
  ARRAY['/placeholder.svg']
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Tennis Court');

INSERT INTO facilities (name, description, location, capacity, hourly_rate, is_available, amenities, operating_hours, district_id, images)
SELECT 
  'Playground',
  'Children''s playground with safe equipment',
  'Recreational Area, Zone A',
  25,
  0.00,
  true,
  ARRAY['Slides', 'Swings', 'Climbing Frame', 'Safety Flooring'],
  jsonb_build_object('monday', '6:00-20:00', 'tuesday', '6:00-20:00', 'wednesday', '6:00-20:00', 'thursday', '6:00-20:00', 'friday', '6:00-20:00', 'saturday', '6:00-20:00', 'sunday', '6:00-20:00'),
  (SELECT id FROM districts LIMIT 1),
  ARRAY['/src/assets/playground-facility.jpg']
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Playground');

INSERT INTO facilities (name, description, location, capacity, hourly_rate, is_available, amenities, operating_hours, district_id, images)
SELECT 
  'Prayer Hall',
  'Community prayer hall for religious activities',
  'Block C, Ground Floor',
  80,
  0.00,
  true,
  ARRAY['Prayer Mats', 'Air Conditioning', 'Wudu Facilities', 'Audio System'],
  jsonb_build_object('monday', '5:00-23:00', 'tuesday', '5:00-23:00', 'wednesday', '5:00-23:00', 'thursday', '5:00-23:00', 'friday', '5:00-23:00', 'saturday', '5:00-23:00', 'sunday', '5:00-23:00'),
  (SELECT id FROM districts LIMIT 1),
  ARRAY['/src/assets/prayer-hall-facility.jpg']
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Prayer Hall');

INSERT INTO facilities (name, description, location, capacity, hourly_rate, is_available, amenities, operating_hours, district_id, images)
SELECT 
  'Garden Area',
  'Community garden space for relaxation and events',
  'Garden Block, Outdoor',
  100,
  25.00,
  true,
  ARRAY['Benches', 'Gazebo', 'Garden Lights', 'Water Feature'],
  jsonb_build_object('monday', '6:00-22:00', 'tuesday', '6:00-22:00', 'wednesday', '6:00-22:00', 'thursday', '6:00-22:00', 'friday', '6:00-22:00', 'saturday', '6:00-22:00', 'sunday', '6:00-22:00'),
  (SELECT id FROM districts LIMIT 1),
  ARRAY['/src/assets/garden-facility.jpg']
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Garden Area');

-- Insert additional sample marketplace items
INSERT INTO marketplace_items (seller_id, title, description, price, category, item_condition, location, images, is_available, district_id)
SELECT 
  (SELECT id FROM profiles WHERE email LIKE '%admin%' LIMIT 1),
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

INSERT INTO marketplace_items (seller_id, title, description, price, category, item_condition, location, images, is_available, district_id)
SELECT 
  (SELECT id FROM profiles WHERE email LIKE '%admin%' LIMIT 1),
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

INSERT INTO marketplace_items (seller_id, title, description, price, category, item_condition, location, images, is_available, district_id)
SELECT 
  (SELECT id FROM profiles WHERE email LIKE '%admin%' LIMIT 1),
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

INSERT INTO marketplace_items (seller_id, title, description, price, category, item_condition, location, images, is_available, district_id)
SELECT 
  (SELECT id FROM profiles WHERE email LIKE '%admin%' LIMIT 1),
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