-- Create RLS policies for districts and communities
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Everyone can view districts" ON districts;
DROP POLICY IF EXISTS "State admins can manage districts" ON districts;
DROP POLICY IF EXISTS "Everyone can view communities" ON communities;
DROP POLICY IF EXISTS "State admins can manage all communities" ON communities;
DROP POLICY IF EXISTS "District coordinators can manage communities in their district" ON communities;
DROP POLICY IF EXISTS "Community admins can manage their community" ON communities;

-- Create policies for districts
CREATE POLICY "Everyone can view districts"
ON districts FOR SELECT
USING (true);

CREATE POLICY "State admins can manage districts"
ON districts FOR ALL
USING (has_enhanced_role('state_admin'::enhanced_user_role));

-- Create policies for communities
CREATE POLICY "Everyone can view communities"
ON communities FOR SELECT
USING (true);

CREATE POLICY "State admins can manage all communities"
ON communities FOR ALL
USING (has_enhanced_role('state_admin'::enhanced_user_role));

CREATE POLICY "District coordinators can manage communities in their district"
ON communities FOR ALL
USING (
  has_enhanced_role('district_coordinator'::enhanced_user_role) 
  AND district_id = get_user_district()
);

CREATE POLICY "Community admins can manage their community"
ON communities FOR ALL  
USING (
  has_enhanced_role('community_admin'::enhanced_user_role)
  AND id = get_user_community()
);