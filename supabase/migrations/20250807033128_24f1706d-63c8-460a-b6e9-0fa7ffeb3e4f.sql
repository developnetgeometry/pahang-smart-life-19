-- Insert sample user profiles (these will be referenced by discussions and comments)
-- Note: In a real app, these would be created when users sign up
-- For demo purposes, we'll create sample profiles with generated UUIDs

-- Insert sample announcements
INSERT INTO public.announcements (title, content, type, priority, author_id, district_id) VALUES
('Swimming Pool Maintenance Notice', 'The swimming pool will be closed for routine maintenance on Saturday, March 15th from 8:00 AM to 2:00 PM. We apologize for any inconvenience.', 'maintenance', 2, '11111111-1111-1111-1111-111111111111', (SELECT id FROM public.districts WHERE name = 'Taman Prima')),
('Community BBQ Event - March 25th', 'Join us for our annual community BBQ event! Food, games, and fun for the whole family. Location: Community Hall. Time: 6:00 PM onwards.', 'event', 1, '22222222-2222-2222-2222-222222222222', (SELECT id FROM public.districts WHERE name = 'Taman Suria')),
('New Security Protocols Implementation', 'Starting next week, we will be implementing enhanced security measures including visitor registration and CCTV monitoring upgrades.', 'general', 3, '33333333-3333-3333-3333-333333333333', (SELECT id FROM public.districts WHERE name = 'Taman Indah'));

-- Insert sample discussions
INSERT INTO public.discussions (id, title, content, author_id, category_id, district_id, is_pinned, views_count, likes_count, replies_count) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Community BBQ Event Planning', 'Hello everyone! I would like to organize our annual community BBQ event. We are looking at having it on March 25th at the Community Hall. What do you think? We could have grilling stations, games for kids, and maybe some live music. Please let me know your thoughts and if you would like to volunteer to help with the organization!', '11111111-1111-1111-1111-111111111111', (SELECT id FROM public.discussion_categories WHERE name = 'Events'), (SELECT id FROM public.districts WHERE name = 'Taman Prima'), true, 45, 8, 12),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Elevator Maintenance Schedule', 'The elevator maintenance will be conducted next Monday from 9 AM to 12 PM. Please use the stairs during this time. The maintenance team will be upgrading the control system and performing safety checks. We apologize for any inconvenience this may cause.', '22222222-2222-2222-2222-222222222222', (SELECT id FROM public.discussion_categories WHERE name = 'General'), (SELECT id FROM public.districts WHERE name = 'Taman Suria'), false, 23, 3, 5),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'New Security Measures', 'Discussion about implementing new security protocols including visitor registration system, upgraded CCTV cameras, and enhanced access control. These measures will help ensure the safety and security of our community. Your feedback and suggestions are welcome.', '33333333-3333-3333-3333-333333333333', (SELECT id FROM public.discussion_categories WHERE name = 'Safety'), (SELECT id FROM public.districts WHERE name = 'Taman Indah'), false, 67, 12, 8);

-- Insert sample discussion replies/comments
INSERT INTO public.discussion_replies (discussion_id, author_id, content, likes_count, created_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'Great idea! I can help with the grilling setup. I have experience with BBQ events and can bring some equipment.', 5, NOW() - INTERVAL '1 hour'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', 'Count me in! Should we create a sign-up sheet for volunteers and food contributions?', 3, NOW() - INTERVAL '30 minutes'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '66666666-6666-6666-6666-666666666666', 'Thanks for the update. What time will this happen exactly? I need to plan my day accordingly.', 1, NOW() - INTERVAL '2 hours'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '77777777-7777-7777-7777-777777777777', 'These measures are much needed. Good work on prioritizing our community safety!', 7, NOW() - INTERVAL '8 hours');

-- Insert sample marketplace items
INSERT INTO public.marketplace_items (seller_id, category_id, title, description, price, condition, location, status, image_urls) VALUES
('11111111-1111-1111-1111-111111111111', (SELECT id FROM public.marketplace_categories WHERE name = 'Electronics'), 'Samsung 55" Smart TV', 'Excellent condition Samsung Smart TV, barely used. Includes original remote and wall mount. Perfect for living room or bedroom.', 1200.00, 'Like New', 'Taman Prima Block A', 'active', ARRAY['https://example.com/tv1.jpg']),
('22222222-2222-2222-2222-222222222222', (SELECT id FROM public.marketplace_categories WHERE name = 'Furniture'), 'Dining Table Set', 'Beautiful wooden dining table with 6 chairs. Great for family meals. Some minor scratches but very sturdy.', 800.00, 'Good', 'Taman Suria Block B', 'active', ARRAY['https://example.com/table1.jpg']),
('33333333-3333-3333-3333-333333333333', (SELECT id FROM public.marketplace_categories WHERE name = 'Sports'), 'Exercise Bike', 'Home exercise bike in excellent condition. Perfect for home workouts. Adjustable seat and resistance levels.', 450.00, 'Excellent', 'Taman Indah Block C', 'active', ARRAY['https://example.com/bike1.jpg']);

-- Insert sample complaints
INSERT INTO public.complaints (user_id, category_id, title, description, location, status, priority, image_urls) VALUES
('11111111-1111-1111-1111-111111111111', (SELECT id FROM public.complaint_categories WHERE name = 'Maintenance'), 'Broken Light in Parking Area', 'The light fixture in parking lot section B has been broken for 3 days. It creates a safety hazard during nighttime.', 'Parking Lot Section B', 'pending', 'medium', ARRAY['https://example.com/light1.jpg']),
('22222222-2222-2222-2222-222222222222', (SELECT id FROM public.complaint_categories WHERE name = 'Noise'), 'Loud Music Complaint', 'Neighbor in unit 12-A has been playing loud music past midnight for the past week. This is disturbing our sleep.', 'Block 12, Unit A', 'in_progress', 'high', NULL),
('33333333-3333-3333-3333-333333333333', (SELECT id FROM public.complaint_categories WHERE name = 'Cleanliness'), 'Garbage Collection Issue', 'Garbage bins near Block C have not been emptied for 4 days. Starting to smell and attracting pests.', 'Block C Garbage Area', 'pending', 'high', ARRAY['https://example.com/garbage1.jpg']);

-- Insert sample bookings
INSERT INTO public.bookings (user_id, facility_id, booking_date, start_time, end_time, duration_hours, total_amount, status, notes) VALUES
('11111111-1111-1111-1111-111111111111', (SELECT id FROM public.facilities WHERE name = 'Community Hall'), '2024-03-20', '18:00', '22:00', 4, 200.00, 'confirmed', 'Birthday party setup'),
('22222222-2222-2222-2222-222222222222', (SELECT id FROM public.facilities WHERE name = 'Tennis Court'), '2024-03-18', '09:00', '11:00', 2, 40.00, 'confirmed', 'Weekend tennis session'),
('33333333-3333-3333-3333-333333333333', (SELECT id FROM public.facilities WHERE name = 'Swimming Pool'), '2024-03-22', '14:00', '16:00', 2, 30.00, 'pending', 'Swimming lessons for kids');

-- Insert sample visitors
INSERT INTO public.visitors (user_id, visitor_name, visitor_phone, visitor_ic, visit_date, visit_time, purpose, status) VALUES
('11111111-1111-1111-1111-111111111111', 'John Anderson', '+60123456789', '850123-10-5678', '2024-03-15', '14:30', 'Family visit', 'approved'),
('22222222-2222-2222-2222-222222222222', 'Lisa Chen', '+60987654321', '920456-05-1234', '2024-03-16', '10:00', 'Delivery service', 'checked_in'),
('33333333-3333-3333-3333-333333333333', 'David Kumar', '+60111222333', '880789-08-9876', '2024-03-17', '16:00', 'Contractor work', 'pending');

-- Insert some sensor readings for demo
INSERT INTO public.sensor_readings (sensor_id, value, unit, metadata) 
SELECT 
  id,
  CASE type
    WHEN 'temperature' THEN 25.5 + (RANDOM() * 10)
    WHEN 'humidity' THEN 60.0 + (RANDOM() * 30)
    WHEN 'air_quality' THEN 50.0 + (RANDOM() * 200)
    WHEN 'noise' THEN 40.0 + (RANDOM() * 40)
    WHEN 'motion' THEN CASE WHEN RANDOM() > 0.7 THEN 1 ELSE 0 END
    ELSE 0
  END,
  CASE type
    WHEN 'temperature' THEN '°C'
    WHEN 'humidity' THEN '%'
    WHEN 'air_quality' THEN 'AQI'
    WHEN 'noise' THEN 'dB'
    WHEN 'motion' THEN 'detected'
    ELSE 'unit'
  END,
  '{"source": "demo_data"}'::jsonb
FROM public.sensors 
WHERE is_active = true;