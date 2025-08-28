-- Check and fix RLS policies for units table

-- First, ensure RLS is enabled on the units table
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for units table

-- Allow community admins to create units in their district
CREATE POLICY "Community admins can create units" 
ON public.units 
FOR INSERT 
WITH CHECK (
  has_enhanced_role('community_admin'::enhanced_user_role) 
  AND district_id = get_user_district()
  AND created_by = auth.uid()
);

-- Allow community admins to view all units in their district
CREATE POLICY "Community admins can view units in their district" 
ON public.units 
FOR SELECT 
USING (
  has_enhanced_role('community_admin'::enhanced_user_role) 
  AND district_id = get_user_district()
);

-- Allow community admins to update units in their district
CREATE POLICY "Community admins can update units in their district" 
ON public.units 
FOR UPDATE 
USING (
  has_enhanced_role('community_admin'::enhanced_user_role) 
  AND district_id = get_user_district()
);

-- Allow community admins to delete units in their district
CREATE POLICY "Community admins can delete units in their district" 
ON public.units 
FOR DELETE 
USING (
  has_enhanced_role('community_admin'::enhanced_user_role) 
  AND district_id = get_user_district()
);

-- Allow district coordinators and state admins to manage all units
CREATE POLICY "District coordinators and state admins can manage all units" 
ON public.units 
FOR ALL 
USING (
  has_enhanced_role('district_coordinator'::enhanced_user_role) 
  OR has_enhanced_role('state_admin'::enhanced_user_role)
);

-- Allow residents to view units (for resident dashboard)
CREATE POLICY "Residents can view units in their district" 
ON public.units 
FOR SELECT 
USING (district_id = get_user_district());