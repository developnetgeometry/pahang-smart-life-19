-- Update RLS policies for districts table to use enhanced user roles
DROP POLICY IF EXISTS "Admins can manage districts" ON public.districts;
DROP POLICY IF EXISTS "Everyone can view districts" ON public.districts;

-- Create new policies using enhanced user roles
CREATE POLICY "State admins can manage all districts" 
ON public.districts 
FOR ALL 
USING (has_enhanced_role('state_admin'::enhanced_user_role));

CREATE POLICY "District coordinators can manage their district" 
ON public.districts 
FOR ALL 
USING (
  has_enhanced_role('district_coordinator'::enhanced_user_role) 
  AND id = get_user_district()
);

CREATE POLICY "Everyone can view districts" 
ON public.districts 
FOR SELECT 
USING (true);