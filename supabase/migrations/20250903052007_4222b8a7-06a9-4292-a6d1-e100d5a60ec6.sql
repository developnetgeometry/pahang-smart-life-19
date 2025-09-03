-- Update the community admin policy to only show noise and general complaints
DROP POLICY "Community admins can view assigned complaints" ON public.complaints;

CREATE POLICY "Community admins can view assigned complaints" 
ON public.complaints 
FOR SELECT 
TO authenticated 
USING (
  has_enhanced_role('community_admin'::enhanced_user_role) 
  AND district_id = get_user_district()
  AND (category = 'noise' OR category = 'general')
);