-- Final policy updates for remaining tables

-- Districts: State admin should have full control
DROP POLICY IF EXISTS "Admins can manage districts" ON districts;

CREATE POLICY "State management can manage districts" 
ON districts FOR ALL 
USING (has_role('admin'::user_role) OR has_role('state_admin'::user_role));

-- Meeting Minutes: Update management access
DROP POLICY IF EXISTS "Managers can manage meeting minutes" ON meeting_minutes;

CREATE POLICY "Management can manage meeting minutes" 
ON meeting_minutes FOR ALL 
USING (has_role('manager'::user_role) OR has_role('admin'::user_role) OR has_role('state_admin'::user_role) OR has_role('district_coordinator'::user_role) OR has_role('community_admin'::user_role) OR has_role('community_leader'::user_role));

-- Events: Add community leader access
DROP POLICY IF EXISTS "Managers can manage events" ON events;

CREATE POLICY "Management can manage events" 
ON events FOR ALL 
USING (has_role('manager'::user_role) OR has_role('admin'::user_role) OR has_role('state_admin'::user_role) OR has_role('district_coordinator'::user_role) OR has_role('community_admin'::user_role) OR has_role('community_leader'::user_role));

-- Polls: Add community leader access
DROP POLICY IF EXISTS "Managers can manage polls" ON polls;

CREATE POLICY "Management can manage polls" 
ON polls FOR ALL 
USING (has_role('manager'::user_role) OR has_role('admin'::user_role) OR has_role('state_admin'::user_role) OR has_role('district_coordinator'::user_role) OR has_role('community_admin'::user_role) OR has_role('community_leader'::user_role));

-- Notifications: Update management access
DROP POLICY IF EXISTS "Managers can manage notifications" ON notifications;

CREATE POLICY "Management can manage notifications" 
ON notifications FOR ALL 
using (has_role('manager'::user_role) OR has_role('admin'::user_role) OR has_role('state_admin'::user_role) OR has_role('district_coordinator'::user_role) OR has_role('community_admin'::user_role));

-- Profiles: State admin should see all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "State management can view all profiles" 
ON profiles FOR SELECT 
USING (has_role('admin'::user_role) OR has_role('state_admin'::user_role) OR has_role('district_coordinator'::user_role));

-- Payments: Add state service manager access
DROP POLICY IF EXISTS "Managers can manage payments" ON payments;
DROP POLICY IF EXISTS "Managers can view all payments" ON payments;

CREATE POLICY "Management can manage payments" 
ON payments FOR ALL 
USING (has_role('manager'::user_role) OR has_role('admin'::user_role) OR has_role('state_admin'::user_role) OR has_role('district_coordinator'::user_role) OR has_role('community_admin'::user_role) OR has_role('state_service_manager'::user_role));

CREATE POLICY "Management can view all payments" 
ON payments FOR SELECT 
USING (has_role('manager'::user_role) OR has_role('admin'::user_role) OR has_role('state_admin'::user_role) OR has_role('district_coordinator'::user_role) OR has_role('community_admin'::user_role) OR has_role('state_service_manager'::user_role));