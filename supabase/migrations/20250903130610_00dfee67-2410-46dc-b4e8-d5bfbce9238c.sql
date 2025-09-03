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