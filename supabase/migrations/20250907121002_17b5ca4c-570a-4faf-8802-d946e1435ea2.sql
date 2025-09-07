-- Drop existing RLS policies on facilities table
DROP POLICY IF EXISTS "Management can manage facilities" ON public.facilities;
DROP POLICY IF EXISTS "Users can view facilities in their district" ON public.facilities;

-- Create new RLS policies using enhanced role system
CREATE POLICY "Enhanced management can manage facilities"
ON public.facilities
FOR ALL
TO public
USING (
  has_enhanced_role('facility_manager'::enhanced_user_role) OR 
  has_enhanced_role('community_admin'::enhanced_user_role) OR 
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
  has_enhanced_role('state_admin'::enhanced_user_role)
)
WITH CHECK (
  has_enhanced_role('facility_manager'::enhanced_user_role) OR 
  has_enhanced_role('community_admin'::enhanced_user_role) OR 
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
  has_enhanced_role('state_admin'::enhanced_user_role)
);

CREATE POLICY "Users can view facilities in their district"
ON public.facilities
FOR SELECT
TO public
USING (district_id = get_user_district());