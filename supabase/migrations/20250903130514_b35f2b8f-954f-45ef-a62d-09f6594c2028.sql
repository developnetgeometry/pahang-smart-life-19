-- Create maintenance technicians table
CREATE TABLE IF NOT EXISTS maintenance_technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialization TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'busy', 'off_duty')),
  current_tasks INTEGER DEFAULT 0,
  district_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE maintenance_technicians ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Maintenance staff can view technicians" ON maintenance_technicians
FOR SELECT USING (
  has_enhanced_role('maintenance_staff') OR 
  has_enhanced_role('facility_manager') OR 
  has_enhanced_role('community_admin') OR 
  has_enhanced_role('district_coordinator') OR 
  has_enhanced_role('state_admin')
);

CREATE POLICY "Management can manage technicians" ON maintenance_technicians
FOR ALL USING (
  has_enhanced_role('facility_manager') OR 
  has_enhanced_role('community_admin') OR 
  has_enhanced_role('district_coordinator') OR 
  has_enhanced_role('state_admin')
);

-- Insert sample technicians
INSERT INTO maintenance_technicians (name, specialization, status, current_tasks, district_id) VALUES
('Mike Wilson', ARRAY['elevator', 'electrical'], 'busy', 2, '0a1c51a3-55dd-46b2-b894-c39c6d75557c'),
('Lisa Rodriguez', ARRAY['hvac', 'general'], 'available', 0, '0a1c51a3-55dd-46b2-b894-c39c6d75557c'),
('Ahmad Hassan', ARRAY['plumbing', 'general'], 'available', 1, '0a1c51a3-55dd-46b2-b894-c39c6d75557c'),
('Sarah Chen', ARRAY['electrical', 'security'], 'available', 1, '0a1c51a3-55dd-46b2-b894-c39c6d75557c');

-- Add some sample maintenance schedules
INSERT INTO maintenance_schedules (
  maintenance_type, title, description, scheduled_date, 
  estimated_duration_hours, priority, status, created_at
) VALUES
('inspection', 'Elevator inspection - Block A', 'Regular safety inspection', CURRENT_DATE + INTERVAL '2 days', 2, 'high', 'scheduled', CURRENT_DATE - INTERVAL '5 days'),
('cleaning', 'HVAC filter replacement', 'Replace all HVAC filters', CURRENT_DATE + INTERVAL '5 days', 3, 'medium', 'scheduled', CURRENT_DATE - INTERVAL '3 days'),
('repair', 'Water pump maintenance', 'Quarterly pump servicing', CURRENT_DATE + INTERVAL '7 days', 4, 'low', 'scheduled', CURRENT_DATE - INTERVAL '1 day'),
('testing', 'Generator testing', 'Monthly generator load test', CURRENT_DATE + INTERVAL '10 days', 1, 'medium', 'scheduled', CURRENT_DATE);