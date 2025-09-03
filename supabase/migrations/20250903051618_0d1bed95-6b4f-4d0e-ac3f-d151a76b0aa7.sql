-- Drop the existing overly permissive policy for management
DROP POLICY "Management can view all complaints in their district" ON public.complaints;

-- Create more specific policies based on role and complaint routing logic
CREATE POLICY "Community admins can view assigned complaints" 
ON public.complaints 
FOR SELECT 
TO authenticated 
USING (
  has_enhanced_role('community_admin'::enhanced_user_role) 
  AND district_id = get_user_district()
  AND (
    -- Community admins should see complaints based on get_complaint_recipients logic
    (category = 'noise') OR  -- All noise complaints
    (category = 'general') OR  -- All general complaints
    (category = 'security') OR  -- All security complaints  
    (category = 'facilities') OR  -- All facilities complaints
    (category = 'maintenance' AND escalation_level >= 1)  -- Maintenance only if escalated
  )
);

-- District coordinators can see all complaints in their district
CREATE POLICY "District coordinators can view all district complaints" 
ON public.complaints 
FOR SELECT 
TO authenticated 
USING (
  has_enhanced_role('district_coordinator'::enhanced_user_role) 
  AND district_id = get_user_district()
);

-- State admins can see all complaints
CREATE POLICY "State admins can view all complaints" 
ON public.complaints 
FOR SELECT 
TO authenticated 
USING (has_enhanced_role('state_admin'::enhanced_user_role));

-- Facility managers can see maintenance and facilities complaints
CREATE POLICY "Facility managers can view relevant complaints" 
ON public.complaints 
FOR SELECT 
TO authenticated 
USING (
  has_enhanced_role('facility_manager'::enhanced_user_role)
  AND district_id = get_user_district()
  AND (category = 'maintenance' OR category = 'facilities')
);

-- Maintenance staff can see maintenance complaints
CREATE POLICY "Maintenance staff can view maintenance complaints" 
ON public.complaints 
FOR SELECT 
TO authenticated 
USING (
  has_enhanced_role('maintenance_staff'::enhanced_user_role)
  AND district_id = get_user_district()
  AND category = 'maintenance'
);

-- Security officers can see security complaints
CREATE POLICY "Security officers can view security complaints" 
ON public.complaints 
FOR SELECT 
TO authenticated 
USING (
  has_enhanced_role('security_officer'::enhanced_user_role)
  AND district_id = get_user_district()
  AND category = 'security'
);

-- Update the management update policy to be more specific
DROP POLICY "Management can update complaints" ON public.complaints;

CREATE POLICY "Authorized roles can update complaints" 
ON public.complaints 
FOR UPDATE 
TO authenticated 
USING (
  has_enhanced_role('community_admin'::enhanced_user_role) OR
  has_enhanced_role('district_coordinator'::enhanced_user_role) OR
  has_enhanced_role('state_admin'::enhanced_user_role) OR
  has_enhanced_role('facility_manager'::enhanced_user_role) OR
  has_enhanced_role('maintenance_staff'::enhanced_user_role) OR
  has_enhanced_role('security_officer'::enhanced_user_role)
);