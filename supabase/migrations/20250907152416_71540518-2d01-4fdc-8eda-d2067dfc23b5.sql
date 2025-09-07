-- Add policy to allow community admins to update user account status
CREATE POLICY "Community admins can update account status" ON public.profiles
FOR UPDATE 
USING (
  has_enhanced_role('community_admin'::enhanced_user_role) OR
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
  has_enhanced_role('state_admin'::enhanced_user_role)
)
WITH CHECK (
  has_enhanced_role('community_admin'::enhanced_user_role) OR
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
  has_enhanced_role('state_admin'::enhanced_user_role)
);