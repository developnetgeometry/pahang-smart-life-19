-- Insert visitor data with basic columns that likely exist
INSERT INTO visitors (host_id, visitor_name, visitor_phone, purpose, visit_date, start_time, end_time, status, district_id, notes) VALUES
-- Registered visitors (upcoming)
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Ahmad Rizal', '+60123456789', 'Family visit', '2025-01-22', '14:00', '18:00', 'registered', '00000000-0000-0000-0000-000000000001', 'Brother visiting for weekend'),
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Siti Nurhaliza', '+60198765432', 'Business meeting', '2025-01-23', '10:00', '12:00', 'registered', '00000000-0000-0000-0000-000000000001', 'Insurance agent appointment'),
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Lim Wei Ming', '+60176543210', 'Delivery service', '2025-01-24', '09:00', '10:00', 'registered', '00000000-0000-0000-0000-000000000001', 'Furniture delivery'),

-- Checked in visitors (currently visiting)
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Raj Kumar', '+60134567890', 'Social visit', '2025-01-20', '15:00', '19:00', 'checked_in', '00000000-0000-0000-0000-000000000001', 'College friend visiting'),
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Mary Tan', '+60145678901', 'Babysitting', '2025-01-20', '12:00', '20:00', 'checked_in', '00000000-0000-0000-0000-000000000001', 'Babysitter for the day'),

-- Completed visits (past visits)
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Dr. Hassan', '+60187654321', 'Medical consultation', '2025-01-18', '16:00', '17:30', 'completed', '00000000-0000-0000-0000-000000000001', 'Home visit consultation'),
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Faridah Binti Ali', '+60156789012', 'Tupperware party', '2025-01-17', '19:00', '22:00', 'completed', '00000000-0000-0000-0000-000000000001', 'Tupperware sales presentation'),
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Johnson Lee', '+60112345678', 'Maintenance work', '2025-01-16', '08:00', '17:00', 'completed', '00000000-0000-0000-0000-000000000001', 'Air conditioning service'),

-- Expired visitors (didn't show up)
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Sarah Abdullah', '+60167890123', 'Product demonstration', '2025-01-15', '14:00', '16:00', 'expired', '00000000-0000-0000-0000-000000000001', 'Vacuum cleaner demo - no show'),
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Chong Ah Kow', '+60189012345', 'Property viewing', '2025-01-14', '10:00', '11:00', 'expired', '00000000-0000-0000-0000-000000000001', 'Real estate agent - cancelled');