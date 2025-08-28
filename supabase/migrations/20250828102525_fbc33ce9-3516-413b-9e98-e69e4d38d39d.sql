-- Get all existing policies on units table and drop them
DO $$
DECLARE
    policy_name text;
BEGIN
    -- Drop all existing policies on units table
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'units'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.units', policy_name);
    END LOOP;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for units table

-- 1. Allow community admins to create units
CREATE POLICY "Community admins can create units" 
ON public.units 
FOR INSERT 
WITH CHECK (
  has_enhanced_role('community_admin'::enhanced_user_role) 
  AND created_by = auth.uid()
);

-- 2. Allow community admins to view all units in their district
CREATE POLICY "Community admins can view units in their district" 
ON public.units 
FOR SELECT 
USING (
  has_enhanced_role('community_admin'::enhanced_user_role) 
  AND district_id = get_user_district()
);

-- 3. Allow community admins to update units in their district
CREATE POLICY "Community admins can update units in their district" 
ON public.units 
FOR UPDATE 
USING (
  has_enhanced_role('community_admin'::enhanced_user_role) 
  AND district_id = get_user_district()
);

-- 4. Allow community admins to delete units in their district
CREATE POLICY "Community admins can delete units in their district" 
ON public.units 
FOR DELETE 
USING (
  has_enhanced_role('community_admin'::enhanced_user_role) 
  AND district_id = get_user_district()
);

-- 5. Allow higher level admins to manage all units
CREATE POLICY "Higher level admins can manage all units" 
ON public.units 
FOR ALL 
USING (
  has_enhanced_role('district_coordinator'::enhanced_user_role) 
  OR has_enhanced_role('state_admin'::enhanced_user_role)
);

-- 6. Allow residents to view units in their district (for location map viewing)
CREATE POLICY "Residents can view units in their district" 
ON public.units 
FOR SELECT 
USING (district_id = get_user_district());