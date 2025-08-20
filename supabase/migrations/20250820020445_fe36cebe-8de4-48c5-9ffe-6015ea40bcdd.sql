-- Create visitors table and related data

-- Create visitor status enum
CREATE TYPE visitor_status AS ENUM ('registered', 'checked_in', 'completed', 'expired', 'cancelled');

-- Create visitors table
CREATE TABLE visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  visitor_name TEXT NOT NULL,
  visitor_phone TEXT NOT NULL,
  visitor_email TEXT,
  visitor_ic TEXT,
  vehicle_number TEXT,
  purpose TEXT NOT NULL,
  visit_date DATE NOT NULL,
  visit_time_start TIME NOT NULL,
  visit_time_end TIME NOT NULL,
  status visitor_status NOT NULL DEFAULT 'registered',
  district_id UUID,
  notes TEXT,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  checked_out_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for visitors
CREATE POLICY "Users can view their own visitors" ON visitors
  FOR SELECT USING (host_id = auth.uid());

CREATE POLICY "Users can create visitors" ON visitors
  FOR INSERT WITH CHECK (host_id = auth.uid());

CREATE POLICY "Users can update their own visitors" ON visitors
  FOR UPDATE USING (host_id = auth.uid());

CREATE POLICY "Security can view all visitors" ON visitors
  FOR ALL USING (has_role('security'::user_role) OR has_role('admin'::user_role));

-- Create trigger for updated_at
CREATE TRIGGER update_visitors_updated_at
  BEFORE UPDATE ON visitors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample visitor data
INSERT INTO visitors (host_id, visitor_name, visitor_phone, visitor_email, visitor_ic, vehicle_number, purpose, visit_date, visit_time_start, visit_time_end, status, district_id, notes) VALUES
-- Registered visitors (upcoming)
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Ahmad Rizal', '+60123456789', 'ahmad.rizal@email.com', '880515-05-1234', 'WA1234B', 'Family visit', '2025-01-22', '14:00', '18:00', 'registered', '00000000-0000-0000-0000-000000000001', 'Brother visiting for weekend'),
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Siti Nurhaliza', '+60198765432', 'siti.nur@email.com', '900312-10-5678', 'PHA5678C', 'Business meeting', '2025-01-23', '10:00', '12:00', 'registered', '00000000-0000-0000-0000-000000000001', 'Insurance agent appointment'),
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Lim Wei Ming', '+60176543210', 'lim.weiming@email.com', '850720-08-9012', 'KL9876D', 'Delivery service', '2025-01-24', '09:00', '10:00', 'registered', '00000000-0000-0000-0000-000000000001', 'Furniture delivery'),

-- Checked in visitors (currently visiting)
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Raj Kumar', '+60134567890', 'raj.kumar@email.com', '780905-07-3456', 'JHR2468E', 'Social visit', '2025-01-20', '15:00', '19:00', 'checked_in', '00000000-0000-0000-0000-000000000001', 'College friend visiting'),
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Mary Tan', '+60145678901', 'mary.tan@email.com', '920418-06-7890', 'SGR1357F', 'Babysitting', '2025-01-20', '12:00', '20:00', 'checked_in', '00000000-0000-0000-0000-000000000001', 'Babysitter for the day'),

-- Completed visits (past visits)
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Dr. Hassan', '+60187654321', 'dr.hassan@clinic.com', '750630-14-2468', 'MLK4680G', 'Medical consultation', '2025-01-18', '16:00', '17:30', 'completed', '00000000-0000-0000-0000-000000000001', 'Home visit consultation'),
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Faridah Binti Ali', '+60156789012', 'faridah.ali@email.com', '830222-03-1357', 'PRK7531H', 'Tupperware party', '2025-01-17', '19:00', '22:00', 'completed', '00000000-0000-0000-0000-000000000001', 'Tupperware sales presentation'),
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Johnson Lee', '+60112345678', 'johnson.lee@email.com', '870815-11-9024', 'KUL8642I', 'Maintenance work', '2025-01-16', '08:00', '17:00', 'completed', '00000000-0000-0000-0000-000000000001', 'Air conditioning service'),

-- Expired visitors (didn't show up)
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Sarah Abdullah', '+60167890123', 'sarah.abdullah@email.com', '910504-12-4680', 'TRG9753J', 'Product demonstration', '2025-01-15', '14:00', '16:00', 'expired', '00000000-0000-0000-0000-000000000001', 'Vacuum cleaner demo - no show'),
('634ff100-41f2-4880-b79d-a62a97b9de74', 'Chong Ah Kow', '+60189012345', 'chong.ahkow@email.com', '680912-01-5792', 'IPH8520K', 'Property viewing', '2025-01-14', '10:00', '11:00', 'expired', '00000000-0000-0000-0000-000000000001', 'Real estate agent - cancelled');

-- Update checked_in_at for checked_in visitors
UPDATE visitors SET checked_in_at = now() - interval '2 hours' 
WHERE status = 'checked_in';

-- Update checked_out_at for completed visitors  
UPDATE visitors SET 
  checked_in_at = created_at + interval '1 hour',
  checked_out_at = created_at + interval '3 hours'
WHERE status = 'completed';