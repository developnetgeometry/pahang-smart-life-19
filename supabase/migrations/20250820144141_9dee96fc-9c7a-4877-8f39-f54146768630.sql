-- Allow security officers and management to view user profiles for emergency purposes
CREATE POLICY "Security can view profiles for emergency response" 
ON public.profiles 
FOR SELECT 
USING (
  has_role('security_officer'::app_role) OR 
  has_role('state_admin'::app_role) OR 
  has_role('district_coordinator'::app_role) OR 
  has_role('community_admin'::app_role) OR 
  has_role('facility_manager'::app_role)
);