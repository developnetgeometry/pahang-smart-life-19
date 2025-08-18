-- Update RLS policies to include new roles with proper hierarchy access

-- Announcements: Add state and district level access
DROP POLICY IF EXISTS "Authors can update their announcements" ON announcements;
DROP POLICY IF EXISTS "Managers can create announcements" ON announcements;

CREATE POLICY "Authors can update their announcements" 
ON announcements FOR UPDATE 
USING ((author_id = auth.uid()) OR has_role('admin'::user_role) OR has_role('state_admin'::user_role) OR has_role('district_coordinator'::user_role) OR has_role('community_admin'::user_role));

CREATE POLICY "Management can create announcements" 
ON announcements FOR INSERT 
WITH CHECK (has_role('manager'::user_role) OR has_role('admin'::user_role) OR has_role('state_admin'::user_role) OR has_role('district_coordinator'::user_role) OR has_role('community_admin'::user_role));

-- Assets: Add facility manager access
DROP POLICY IF EXISTS "Managers can manage assets" ON assets;

CREATE POLICY "Management can manage assets" 
ON assets FOR ALL 
USING (has_role('manager'::user_role) OR has_role('admin'::user_role) OR has_role('state_admin'::user_role) OR has_role('district_coordinator'::user_role) OR has_role('community_admin'::user_role) OR has_role('facility_manager'::user_role));

-- Bookings: Add facility manager access
DROP POLICY IF EXISTS "Managers can view all bookings in their district" ON bookings;

CREATE POLICY "Management can view all bookings in their district" 
ON bookings FOR SELECT 
USING (has_role('manager'::user_role) OR has_role('admin'::user_role) OR has_role('state_admin'::user_role) OR has_role('district_coordinator'::user_role) OR has_role('community_admin'::user_role) OR has_role('facility_manager'::user_role));

-- CCTV Cameras: Add state/district level security access
DROP POLICY IF EXISTS "Security can manage cameras" ON cctv_cameras;

CREATE POLICY "Security management can manage cameras" 
ON cctv_cameras FOR ALL 
USING (has_role('security'::user_role) OR has_role('admin'::user_role) OR has_role('state_admin'::user_role) OR has_role('district_coordinator'::user_role) OR has_role('community_admin'::user_role));

-- Complaints: Update management access
DROP POLICY IF EXISTS "Managers can update complaints" ON complaints;
DROP POLICY IF EXISTS "Managers can view all complaints in their district" ON complaints;

CREATE POLICY "Management can update complaints" 
ON complaints FOR UPDATE 
USING (has_role('manager'::user_role) OR has_role('admin'::user_role) OR has_role('state_admin'::user_role) OR has_role('district_coordinator'::user_role) OR has_role('community_admin'::user_role));

CREATE POLICY "Management can view all complaints in their district" 
ON complaints FOR SELECT 
USING (has_role('manager'::user_role) OR has_role('admin'::user_role) OR has_role('state_admin'::user_role) OR has_role('district_coordinator'::user_role) OR has_role('community_admin'::user_role));