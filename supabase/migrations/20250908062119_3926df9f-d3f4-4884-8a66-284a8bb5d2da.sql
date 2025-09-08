-- Create RLS policies for floor_plan_migrations table

-- Allow management to view all floor plan migrations
CREATE POLICY "Management can view all floor plan migrations"
ON floor_plan_migrations
FOR SELECT
USING (
  has_enhanced_role('facility_manager'::enhanced_user_role) OR
  has_enhanced_role('community_admin'::enhanced_user_role) OR
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR
  has_enhanced_role('state_admin'::enhanced_user_role)
);

-- Allow management to create floor plan migrations
CREATE POLICY "Management can create floor plan migrations"
ON floor_plan_migrations
FOR INSERT
WITH CHECK (
  has_enhanced_role('facility_manager'::enhanced_user_role) OR
  has_enhanced_role('community_admin'::enhanced_user_role) OR
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR
  has_enhanced_role('state_admin'::enhanced_user_role)
);

-- Allow management to update floor plan migrations
CREATE POLICY "Management can update floor plan migrations"
ON floor_plan_migrations
FOR UPDATE
USING (
  has_enhanced_role('facility_manager'::enhanced_user_role) OR
  has_enhanced_role('community_admin'::enhanced_user_role) OR
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR
  has_enhanced_role('state_admin'::enhanced_user_role)
);