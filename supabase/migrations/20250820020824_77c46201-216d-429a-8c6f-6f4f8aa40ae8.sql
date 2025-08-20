-- Insert sample visitor data with correct enum values
DELETE FROM visitors WHERE host_id = '634ff100-41f2-4880-b79d-a62a97b9de74';

INSERT INTO visitors (host_id, visitor_name, visitor_phone, visitor_ic, vehicle_plate, visit_date, visit_time, purpose, status, notes) VALUES
-- Approved visitors (upcoming)
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Ahmad Rizal', '+60123456789', '880515051234', 'WA1234B', '2025-01-22', '14:00', 'Family visit', 'approved', 'Brother visiting for weekend'),
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Siti Nurhaliza', '+60198765432', '900312105678', 'PHA5678C', '2025-01-23', '10:00', 'Business meeting', 'approved', 'Insurance agent appointment'),
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Lim Wei Ming', '+60176543210', '850720089012', 'KL9876D', '2025-01-24', '09:00', 'Delivery service', 'approved', 'Furniture delivery'),

-- Pending visitors (awaiting approval)
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Nurul Aina', '+60171234567', '950608075432', 'TRG3456K', '2025-01-25', '16:00', 'Social visit', 'pending', 'Cousin visiting from KL'),

-- Checked in visitors (currently visiting)
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Raj Kumar', '+60134567890', '780905073456', 'JHR2468E', '2025-01-20', '15:00', 'Social visit', 'checked_in', 'College friend visiting'),
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Mary Tan', '+60145678901', '920418067890', 'SGR1357F', '2025-01-20', '12:00', 'Babysitting', 'checked_in', 'Babysitter for the day'),

-- Checked out visitors (completed visits)
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Dr. Hassan', '+60187654321', '750630142468', 'MLK4680G', '2025-01-18', '16:00', 'Medical consultation', 'checked_out', 'Home visit consultation'),
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Faridah Binti Ali', '+60156789012', '830222031357', 'PRK7531H', '2025-01-17', '19:00', 'Tupperware party', 'checked_out', 'Tupperware sales presentation'),
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Johnson Lee', '+60112345678', '870815119024', 'KUL8642I', '2025-01-16', '08:00', 'Maintenance work', 'checked_out', 'Air conditioning service'),

-- Denied visitors
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Sarah Abdullah', '+60167890123', '910504124680', 'TRG9753J', '2025-01-15', '14:00', 'Product demonstration', 'denied', 'Vacuum cleaner demo - denied by security'),
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Chong Ah Kow', '+60189012345', '680912015792', 'IPH8520K', '2025-01-14', '10:00', 'Property viewing', 'denied', 'Real estate agent - no prior arrangement');

-- Update check-in times for checked-in visitors
UPDATE visitors SET check_in_time = now() - interval '2 hours' 
WHERE status = 'checked_in' AND host_id = '634ff100-41f2-4880-b79d-a62a97b9de74';

-- Update check-in and check-out times for checked-out visitors  
UPDATE visitors SET 
  check_in_time = created_at + interval '1 hour',
  check_out_time = created_at + interval '3 hours'
WHERE status = 'checked_out' AND host_id = '634ff100-41f2-4880-b79d-a62a97b9de74';