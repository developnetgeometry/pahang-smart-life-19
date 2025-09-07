-- Add policy to allow admins to assign roles to other users
CREATE POLICY "Admins can assign roles to users" ON public.enhanced_user_roles
FOR INSERT 
WITH CHECK (
  has_enhanced_role('community_admin'::enhanced_user_role) OR
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
  has_enhanced_role('state_admin'::enhanced_user_role)
);

-- Add policy to allow admins to update/deactivate roles for other users  
CREATE POLICY "Admins can manage user roles" ON public.enhanced_user_roles
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