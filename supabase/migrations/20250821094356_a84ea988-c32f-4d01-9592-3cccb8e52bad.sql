-- Insert sample bookings for better facility usage data
INSERT INTO bookings (facility_id, user_id, booking_date, start_time, end_time, duration_hours, purpose, status, total_amount)
SELECT 
  f.id,
  (SELECT id FROM profiles ORDER BY RANDOM() LIMIT 1),
  CURRENT_DATE + (RANDOM() * 30)::INTEGER,
  ('09:00:00'::TIME + (RANDOM() * 8)::INTEGER * INTERVAL '1 hour')::TIME,
  ('11:00:00'::TIME + (RANDOM() * 8)::INTEGER * INTERVAL '1 hour')::TIME,
  2 + (RANDOM() * 4)::INTEGER,
  (ARRAY['Community Meeting', 'Birthday Party', 'Workshop', 'Sports Training', 'Cultural Event'])[FLOOR(RANDOM() * 5 + 1)],
  (ARRAY['confirmed', 'pending', 'completed'])[FLOOR(RANDOM() * 3 + 1)]::booking_status,
  50 + (RANDOM() * 200)::NUMERIC
FROM facilities f
CROSS JOIN generate_series(1, 3);

-- Insert more upcoming events
INSERT INTO events (title, description, event_type, start_date, end_date, start_time, end_time, location, organizer_id, district_id, max_participants, registration_fee, is_registration_required)
VALUES 
  ('Community Clean-Up Drive', 'Monthly community cleaning activity', 'community', CURRENT_DATE + 5, CURRENT_DATE + 5, '08:00:00', '12:00:00', 'Community Park', (SELECT id FROM profiles LIMIT 1), (SELECT id FROM districts LIMIT 1), 50, 0, true),
  ('Residents Safety Briefing', 'Important safety briefing for all residents', 'safety', CURRENT_DATE + 8, CURRENT_DATE + 8, '19:00:00', '21:00:00', 'Community Hall', (SELECT id FROM profiles LIMIT 1), (SELECT id FROM districts LIMIT 1), 100, 0, true),
  ('Hari Raya Celebration', 'Community Hari Raya celebration', 'cultural', CURRENT_DATE + 12, CURRENT_DATE + 12, '18:00:00', '22:00:00', 'Main Hall', (SELECT id FROM profiles LIMIT 1), (SELECT id FROM districts LIMIT 1), 200, 25, true),
  ('Monthly Committee Meeting', 'Monthly residents committee meeting', 'meeting', CURRENT_DATE + 15, CURRENT_DATE + 15, '20:00:00', '22:00:00', 'Meeting Room A', (SELECT id FROM profiles LIMIT 1), (SELECT id FROM districts LIMIT 1), 20, 0, false),
  ('Swimming Pool Maintenance Notice', 'Pool will be closed for maintenance', 'maintenance', CURRENT_DATE + 20, CURRENT_DATE + 20, '06:00:00', '18:00:00', 'Swimming Pool Area', (SELECT id FROM profiles LIMIT 1), (SELECT id FROM districts LIMIT 1), 0, 0, false);

-- Insert more recent announcements
INSERT INTO announcements (title, content, type, author_id, district_id, is_urgent, is_published)
VALUES
  ('Parking Guidelines Update', 'New parking guidelines are now in effect. Please ensure vehicles are parked in designated areas only.', 'general', (SELECT id FROM profiles LIMIT 1), (SELECT id FROM districts LIMIT 1), false, true),
  ('Water Supply Maintenance', 'Water supply will be temporarily disrupted tomorrow from 9 AM to 3 PM for maintenance work.', 'maintenance', (SELECT id FROM profiles LIMIT 1), (SELECT id FROM districts LIMIT 1), true, true),
  ('Security Patrol Schedule', 'Updated security patrol schedule is now available at the management office.', 'security', (SELECT id FROM profiles LIMIT 1), (SELECT id FROM districts LIMIT 1), false, true),
  ('Community Garden Project', 'We are starting a community garden project. Interested residents can register at the office.', 'general', (SELECT id FROM profiles LIMIT 1), (SELECT id FROM districts LIMIT 1), false, true);

-- Insert sample complaint records with correct enum values
INSERT INTO complaints (title, description, category, complainant_id, district_id, priority, status, location)
VALUES
  ('Broken Street Light', 'The street light near Block A is not working for 3 days', 'infrastructure', (SELECT id FROM profiles ORDER BY RANDOM() LIMIT 1), (SELECT id FROM districts LIMIT 1), 'medium', 'pending', 'Block A Parking Area'),
  ('Noise Complaint', 'Loud music from unit 12-A during late hours', 'noise', (SELECT id FROM profiles ORDER BY RANDOM() LIMIT 1), (SELECT id FROM districts LIMIT 1), 'high', 'in_progress', 'Block B Unit 12-A'),
  ('Elevator Malfunction', 'Elevator in Block C is frequently breaking down', 'maintenance', (SELECT id FROM profiles ORDER BY RANDOM() LIMIT 1), (SELECT id FROM districts LIMIT 1), 'high', 'in_progress', 'Block C'),
  ('Pest Control Request', 'Cockroach infestation in common areas', 'pest_control', (SELECT id FROM profiles ORDER BY RANDOM() LIMIT 1), (SELECT id FROM districts LIMIT 1), 'medium', 'pending', 'Block D Common Area');