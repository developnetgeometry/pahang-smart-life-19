-- Update announcements RLS policies to work with enhanced roles
DROP POLICY IF EXISTS "Management can create announcements" ON announcements;

CREATE POLICY "Enhanced management can create announcements" 
ON announcements 
FOR INSERT 
TO authenticated
WITH CHECK (
  has_enhanced_role('community_admin'::enhanced_user_role) OR 
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
  has_enhanced_role('state_admin'::enhanced_user_role) OR
  has_enhanced_role('community_leader'::enhanced_user_role)
);

-- Also update the authors can update policy
DROP POLICY IF EXISTS "Authors can update their announcements" ON announcements;

CREATE POLICY "Enhanced authors can update their announcements" 
ON announcements 
FOR UPDATE 
TO authenticated
USING (
  (author_id = auth.uid()) OR 
  has_enhanced_role('community_admin'::enhanced_user_role) OR 
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
  has_enhanced_role('state_admin'::enhanced_user_role)
);