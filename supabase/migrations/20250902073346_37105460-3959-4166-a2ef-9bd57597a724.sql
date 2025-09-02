-- Update existing visitor data to have current/future dates and proper statuses
UPDATE visitors 
SET 
  visit_date = CASE 
    WHEN status = 'pending' THEN (CURRENT_DATE + INTERVAL '1 day')::date
    WHEN status = 'approved' THEN CURRENT_DATE
    WHEN status = 'checked_in' THEN CURRENT_DATE 
    WHEN status = 'checked_out' THEN (CURRENT_DATE - INTERVAL '1 day')::date
    ELSE CURRENT_DATE
  END,
  updated_at = NOW()
WHERE visit_date < CURRENT_DATE - INTERVAL '1 day';

-- Add some more recent visitor entries with varied statuses for today and coming days
INSERT INTO visitors (
  visitor_name, visitor_phone, visitor_ic, vehicle_number, visit_date, visit_time, 
  purpose, status, host_id, notes, created_at, updated_at
) VALUES 
-- Today's visitors
('Lisa Wong', '+60123456789', '901215076543', 'WKL7890A', CURRENT_DATE, '09:00:00', 
 'Delivery service', 'pending', 
 (SELECT id FROM profiles LIMIT 1), 'Package delivery from Shopee', NOW(), NOW()),

('James Lee', '+60187654321', '851203125678', 'SGR2468B', CURRENT_DATE, '14:30:00', 
 'Home maintenance', 'approved', 
 (SELECT id FROM profiles LIMIT 1), 'Aircon servicing appointment', NOW(), NOW()),

('Fatimah Aziz', '+60134567890', '930528087890', 'JHR1357C', CURRENT_DATE, '10:15:00', 
 'Family visit', 'checked_in', 
 (SELECT id FROM profiles LIMIT 1), 'Visiting aunt for lunch', NOW(), NOW()),

-- Tomorrow's visitors  
('David Kumar', '+60145678901', '880910103456', 'MLK3579D', CURRENT_DATE + 1, '16:00:00', 
 'Business meeting', 'pending', 
 (SELECT id FROM profiles OFFSET 1 LIMIT 1), 'Insurance consultation', NOW(), NOW()),

('Sarah Abdullah', '+60156789012', '920305067890', 'PHA4681E', CURRENT_DATE + 1, '11:30:00', 
 'Medical consultation', 'pending', 
 (SELECT id FROM profiles OFFSET 2 LIMIT 1), 'Home physiotherapy session', NOW(), NOW()),

-- Future visitors
('Michael Tan', '+60167890123', '870822114567', 'KLU5792F', CURRENT_DATE + 2, '13:45:00', 
 'Social visit', 'pending', 
 (SELECT id FROM profiles OFFSET 3 LIMIT 1), 'College friend visiting', NOW(), NOW()),

('Aminah Hassan', '+60178901234', '940717093456', 'TRG6803G', CURRENT_DATE + 3, '15:20:00', 
 'Tutoring session', 'pending', 
 (SELECT id FROM profiles OFFSET 4 LIMIT 1), 'Math tuition for children', NOW(), NOW())

ON CONFLICT DO NOTHING;

-- Update some existing visitors to have proper approved_by and timestamps
UPDATE visitors 
SET 
  approved_by = (SELECT id FROM profiles WHERE id IN (
    SELECT user_id FROM enhanced_user_roles WHERE role = 'security_officer' LIMIT 1
  )),
  check_in_time = CASE 
    WHEN status = 'checked_in' THEN NOW() - INTERVAL '2 hours'
    WHEN status = 'checked_out' THEN NOW() - INTERVAL '4 hours'
    ELSE check_in_time
  END,
  check_out_time = CASE 
    WHEN status = 'checked_out' THEN NOW() - INTERVAL '1 hour'
    ELSE check_out_time
  END
WHERE status IN ('approved', 'checked_in', 'checked_out') AND approved_by IS NULL;

-- Generate QR codes for approved visitors
UPDATE visitors 
SET qr_code_data = 'QR_' || UPPER(LEFT(visitor_name, 3)) || '_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || LEFT(id::text, 8)
WHERE status IN ('approved', 'checked_in') AND qr_code_data IS NULL;