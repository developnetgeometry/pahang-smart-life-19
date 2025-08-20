-- Create comprehensive test data for all system components

-- Insert sample announcements
INSERT INTO announcements (title, content, type, author_id, district_id, is_published, is_urgent, publish_at, expire_at) VALUES
('Swimming Pool Maintenance Notice', 'The swimming pool will be closed for maintenance on January 25, 2025 from 8:00 AM to 5:00 PM. We apologize for any inconvenience caused.', 'maintenance', '634ff100-41f2-4880-b79d-a62a97b9de74', '00000000-0000-0000-0000-000000000001', true, true, now(), now() + interval '30 days'),
('New Facility Booking System', 'We are pleased to announce the launch of our new online facility booking system. You can now book facilities directly through the resident portal.', 'general', '634ff100-41f2-4880-b79d-a62a97b9de74', '00000000-0000-0000-0000-000000000001', true, false, now(), now() + interval '60 days'),
('Community BBQ Event', 'Join us for a community BBQ event on February 15, 2025 at the common area. Food and drinks will be provided. Registration required.', 'event', '634ff100-41f2-4880-b79d-a62a97b9de74', '00000000-0000-0000-0000-000000000001', true, false, now(), now() + interval '45 days'),
('Security System Upgrade', 'Our CCTV and access control systems will be upgraded next week. Temporary access arrangements will be communicated separately.', 'security', '634ff100-41f2-4880-b79d-a62a97b9de74', '00000000-0000-0000-0000-000000000001', true, false, now(), now() + interval '14 days');

-- Insert sample discussions
INSERT INTO discussions (title, content, category, author_id, district_id, is_pinned) VALUES
('Parking Issues in Block A', 'Has anyone else noticed the parking situation getting worse in Block A? Cars are parking in visitor spots overnight. What can we do about this?', 'community', '634ff100-41f2-4880-b79d-a62a97b9de74', '00000000-0000-0000-0000-000000000001', false),
('Community Garden Proposal', 'I would like to propose starting a community garden in the empty lot near the playground. Who would be interested in participating?', 'community', '634ff100-41f2-4880-b79d-a62a97b9de74', '00000000-0000-0000-0000-000000000001', true),
('Gym Equipment Suggestion', 'The gymnasium could use some new cardio equipment. Has anyone submitted a request for new treadmills?', 'facilities', '634ff100-41f2-4880-b79d-a62a97b9de74', '00000000-0000-0000-0000-000000000001', false),
('Noise Complaint - Late Night Construction', 'There has been construction noise late at night near Block C. Is this authorized work?', 'complaints', '634ff100-41f2-4880-b79d-a62a97b9de74', '00000000-0000-0000-0000-000000000001', false);

-- Insert sample complaints
INSERT INTO complaints (title, description, category, location, priority, status, complainant_id, district_id) VALUES
('Broken Elevator in Block B', 'The main elevator in Block B has been out of order for 3 days. Residents on higher floors are having difficulty accessing their units.', 'maintenance', 'Block B - Main Elevator', 'high', 'in_progress', '634ff100-41f2-4880-b79d-a62a97b9de74', '00000000-0000-0000-0000-000000000001'),
('Faulty Streetlight', 'The streetlight near the main entrance is flickering and needs replacement. It creates a safety concern during nighttime.', 'maintenance', 'Main Entrance', 'medium', 'pending', '634ff100-41f2-4880-b79d-a62a97b9de74', '00000000-0000-0000-0000-000000000001'),
('Pest Control Issue', 'There are ants in the common corridor of Block A, Level 3. Professional pest control service is needed.', 'pest_control', 'Block A - Level 3 Corridor', 'medium', 'pending', '634ff100-41f2-4880-b79d-a62a97b9de74', '00000000-0000-0000-0000-000000000001');

-- Insert sample bookings
INSERT INTO bookings (facility_id, user_id, booking_date, start_time, end_time, duration_hours, purpose, status, total_amount) VALUES
((SELECT id FROM facilities WHERE name = 'Kolam Renang Pahang Prima'), '634ff100-41f2-4880-b79d-a62a97b9de74', '2025-01-25', '10:00', '12:00', 2, 'Swimming training session', 'confirmed', 30.00),
((SELECT id FROM facilities WHERE name = 'Gymnasium Pahang Prima'), '634ff100-41f2-4880-b79d-a62a97b9de74', '2025-01-26', '16:00', '18:00', 2, 'Basketball practice', 'pending', 40.00);

-- Insert sample events
INSERT INTO events (title, description, event_type, start_date, end_date, start_time, end_time, location, organizer_id, district_id, max_participants, registration_fee) VALUES
('Community BBQ Night', 'Join us for a fun evening of barbecue, music, and community bonding. Food and drinks will be provided.', 'social', '2025-02-15', '2025-02-15', '18:00', '22:00', 'Community Common Area', '634ff100-41f2-4880-b79d-a62a97b9de74', '00000000-0000-0000-0000-000000000001', 100, 0),
('Fitness Workshop', 'Learn proper exercise techniques and healthy lifestyle tips from certified trainers.', 'health', '2025-02-10', '2025-02-10', '09:00', '11:00', 'Gymnasium Pahang Prima', '634ff100-41f2-4880-b79d-a62a97b9de74', '00000000-0000-0000-0000-000000000001', 30, 10.00),
('Safety Briefing', 'Monthly safety briefing covering emergency procedures and security protocols.', 'safety', '2025-01-30', '2025-01-30', '19:00', '20:30', 'Community Hall', '634ff100-41f2-4880-b79d-a62a97b9de74', '00000000-0000-0000-0000-000000000001', 200, 0);

-- Insert sample marketplace listings
INSERT INTO marketplace_listings (title, description, category, price, condition, seller_id, district_id, is_available) VALUES
('Dining Table Set', 'Beautiful wooden dining table with 6 chairs. Excellent condition, barely used. Perfect for family meals.', 'furniture', 450.00, 'excellent', '634ff100-41f2-4880-b79d-a62a97b9de74', '00000000-0000-0000-0000-000000000001', true),
('Exercise Bike', 'Stationary exercise bike in good working condition. Great for home workouts.', 'fitness', 180.00, 'good', '634ff100-41f2-4880-b79d-a62a97b9de74', '00000000-0000-0000-0000-000000000001', true),
('Baby Stroller', 'Lightweight baby stroller, suitable for newborn to 3 years. Well maintained.', 'baby_kids', 95.00, 'good', '634ff100-41f2-4880-b79d-a62a97b9de74', '00000000-0000-0000-0000-000000000001', true),
('Air Conditioner', 'Samsung 1.5HP air conditioner, 2 years old. Still under warranty. Moving house sale.', 'appliances', 650.00, 'excellent', '634ff100-41f2-4880-b79d-a62a97b9de74', '00000000-0000-0000-0000-000000000001', true);

-- Insert sample CCTV cameras
INSERT INTO cctv_cameras (name, location, camera_type, resolution, is_active, night_vision, pan_tilt_zoom, district_id) VALUES
('Main Entrance Camera 1', 'Main Entrance Gate', 'fixed', '1080p', true, true, false, '00000000-0000-0000-0000-000000000001'),
('Parking Area Camera A', 'Parking Area Block A', 'fixed', '1080p', true, true, false, '00000000-0000-0000-0000-000000000001'),
('Swimming Pool Camera', 'Swimming Pool Area', 'ptz', '4K', true, true, true, '00000000-0000-0000-0000-000000000001'),
('Playground Camera', 'Children Playground', 'fixed', '1080p', true, true, false, '00000000-0000-0000-0000-000000000001'),
('Common Area Camera', 'Community Common Area', 'ptz', '1080p', true, true, true, '00000000-0000-0000-0000-000000000001');

-- Insert sample maintenance requests
INSERT INTO maintenance_requests (title, description, category, location, priority, status, requested_by, district_id, estimated_cost) VALUES
('AC Unit Not Cooling', 'The air conditioning unit in the community hall is not cooling properly. Needs inspection and repair.', 'hvac', 'Community Hall', 'high', 'pending', '634ff100-41f2-4880-b79d-a62a97b9de74', '00000000-0000-0000-0000-000000000001', 250.00),
('Garden Sprinkler System', 'Several sprinkler heads in the garden area are clogged and not working properly.', 'landscaping', 'Garden Area', 'medium', 'pending', '634ff100-41f2-4880-b79d-a62a97b9de74', '00000000-0000-0000-0000-000000000001', 150.00);

-- Insert sample emergency contacts
INSERT INTO emergency_contacts (name, contact_type, phone_number, address, services, priority_level, district_id) VALUES
('Pahang Prima Security', 'security', '+60123456789', 'Security Office, Pahang Prima', ARRAY['24/7 security', 'emergency response'], 1, '00000000-0000-0000-0000-000000000001'),
('Kuantan General Hospital', 'medical', '+60954567890', 'Jalan Hospital, Kuantan', ARRAY['emergency medical care', 'ambulance'], 1, '00000000-0000-0000-0000-000000000001'),
('Fire & Rescue Department', 'fire', '994', 'Jalan Dato Wong, Kuantan', ARRAY['fire emergency', 'rescue operations'], 1, '00000000-0000-0000-0000-000000000001'),
('Police Station', 'police', '999', 'Jalan Polisi, Kuantan', ARRAY['crime reporting', 'emergency response'], 1, '00000000-0000-0000-0000-000000000001');

-- Insert sample chat rooms
INSERT INTO chat_rooms (name, description, room_type, district_id, created_by, is_private) VALUES
('General Discussion', 'Main community chat for all residents', 'group', '00000000-0000-0000-0000-000000000001', '634ff100-41f2-4880-b79d-a62a97b9de74', false),
('Block A Residents', 'Chat room for Block A residents only', 'group', '00000000-0000-0000-0000-000000000001', '634ff100-41f2-4880-b79d-a62a97b9de74', false),
('Community Events', 'Discuss and organize community events', 'group', '00000000-0000-0000-0000-000000000001', '634ff100-41f2-4880-b79d-a62a97b9de74', false);

-- Insert some sample chat messages
INSERT INTO chat_messages (room_id, sender_id, message_text, message_type, created_at) VALUES
((SELECT id FROM chat_rooms WHERE name = 'General Discussion'), '634ff100-41f2-4880-b79d-a62a97b9de74', 'Welcome to the Pahang Prima community chat! Feel free to introduce yourselves.', 'text', now() - interval '2 days'),
((SELECT id FROM chat_rooms WHERE name = 'General Discussion'), '634ff100-41f2-4880-b79d-a62a97b9de74', 'Reminder: The swimming pool will be closed tomorrow for maintenance.', 'text', now() - interval '1 day'),
((SELECT id FROM chat_rooms WHERE name = 'Community Events'), '634ff100-41f2-4880-b79d-a62a97b9de74', 'Planning for the community BBQ is underway. Please register if you plan to attend!', 'text', now() - interval '3 hours');

-- Insert sample deliveries
INSERT INTO deliveries (recipient_id, sender_name, courier_company, package_type, status, delivery_date, district_id, tracking_number) VALUES
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Shopee Mall', 'J&T Express', 'package', 'delivered', '2025-01-20', '00000000-0000-0000-0000-000000000001', 'JT123456789MY'),
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Lazada', 'GDex', 'package', 'pending', '2025-01-21', '00000000-0000-0000-0000-000000000001', 'GD987654321MY');

-- Insert sample community groups
INSERT INTO community_groups (name, description, group_type, leader_id, district_id, meeting_schedule, contact_info) VALUES
('Pahang Prima Gardening Club', 'For residents interested in gardening and maintaining beautiful green spaces', 'interest', '634ff100-41f2-4880-b79d-a62a97b9de74', '00000000-0000-0000-0000-000000000001', 'Every Saturday 8:00 AM', 'gardening@pahangprima.com'),
('Community Watch Group', 'Neighborhood watch group focused on community safety and security', 'safety', '634ff100-41f2-4880-b79d-a62a97b9de74', '00000000-0000-0000-0000-000000000001', 'Monthly meetings on first Sunday', 'safety@pahangprima.com'),
('Fitness Enthusiasts', 'Group for residents who enjoy fitness activities and group workouts', 'fitness', '634ff100-41f2-4880-b79d-a62a97b9de74', '00000000-0000-0000-0000-000000000001', 'Weekdays 6:00 PM', 'fitness@pahangprima.com');