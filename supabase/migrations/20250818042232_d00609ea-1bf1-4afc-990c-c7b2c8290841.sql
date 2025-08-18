-- Continue updating RLS policies for new roles

-- Facilities: Add facility manager access
DROP POLICY IF EXISTS "Managers can manage facilities" ON facilities;

CREATE POLICY "Management can manage facilities" 
ON facilities FOR ALL 
USING (has_role('manager'::user_role) OR has_role('admin'::user_role) OR has_role('state_admin'::user_role) OR has_role('district_coordinator'::user_role) OR has_role('community_admin'::user_role) OR has_role('facility_manager'::user_role));

-- Maintenance Requests: Add maintenance staff and facility manager access
DROP POLICY IF EXISTS "Managers can update maintenance requests" ON maintenance_requests;
DROP POLICY IF EXISTS "Managers can view all maintenance requests" ON maintenance_requests;

CREATE POLICY "Management and maintenance can update maintenance requests" 
ON maintenance_requests FOR UPDATE 
USING (has_role('manager'::user_role) OR has_role('admin'::user_role) OR has_role('state_admin'::user_role) OR has_role('district_coordinator'::user_role) OR has_role('community_admin'::user_role) OR has_role('facility_manager'::user_role) OR has_role('maintenance_staff'::user_role));

CREATE POLICY "Management and maintenance can view all maintenance requests" 
ON maintenance_requests FOR SELECT 
USING (has_role('manager'::user_role) OR has_role('admin'::user_role) OR has_role('state_admin'::user_role) OR has_role('district_coordinator'::user_role) OR has_role('community_admin'::user_role) OR has_role('facility_manager'::user_role) OR has_role('maintenance_staff'::user_role));

-- Documents: Update management access
DROP POLICY IF EXISTS "Managers can manage documents" ON documents;

CREATE POLICY "Management can manage documents" 
ON documents FOR ALL 
USING (has_role('manager'::user_role) OR has_role('admin'::user_role) OR has_role('state_admin'::user_role) OR has_role('district_coordinator'::user_role) OR has_role('community_admin'::user_role));

-- Financial Records: Update management access
DROP POLICY IF EXISTS "Managers can manage financial records" ON financial_records;

CREATE POLICY "Management can manage financial records" 
ON financial_records FOR ALL 
USING (has_role('manager'::user_role) OR has_role('admin'::user_role) OR has_role('state_admin'::user_role) OR has_role('district_coordinator'::user_role) OR has_role('community_admin'::user_role));

-- Inventory: Add maintenance staff access
DROP POLICY IF EXISTS "Managers can manage inventory" ON inventory;
DROP POLICY IF EXISTS "Staff can view inventory" ON inventory;

CREATE POLICY "Management can manage inventory" 
ON inventory FOR ALL 
USING (has_role('manager'::user_role) OR has_role('admin'::user_role) OR has_role('state_admin'::user_role) OR has_role('district_coordinator'::user_role) OR has_role('community_admin'::user_role) OR has_role('facility_manager'::user_role));

CREATE POLICY "Staff can view inventory" 
ON inventory FOR SELECT 
USING (has_role('manager'::user_role) OR has_role('admin'::user_role) OR has_role('state_admin'::user_role) OR has_role('district_coordinator'::user_role) OR has_role('community_admin'::user_role) OR has_role('security'::user_role) OR has_role('facility_manager'::user_role) OR has_role('maintenance_staff'::user_role));