-- Fix Service Provider RLS Issues

-- Ensure the has_enhanced_role function exists and works correctly
CREATE OR REPLACE FUNCTION public.has_enhanced_role(check_role enhanced_user_role, check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM enhanced_user_roles 
    WHERE user_id = COALESCE(check_user_id, auth.uid())
    AND role = check_role 
    AND is_active = true
  );
$$;

-- Drop and recreate RLS policies for service_provider_applications to ensure they work correctly
DROP POLICY IF EXISTS "Community admins can manage all applications" ON service_provider_applications;
DROP POLICY IF EXISTS "Users can create their own applications" ON service_provider_applications;
DROP POLICY IF EXISTS "Users can view their own applications" ON service_provider_applications;
DROP POLICY IF EXISTS "Users can update their own pending applications" ON service_provider_applications;

-- Recreate policies with better debugging
CREATE POLICY "Community admins can manage all applications"
  ON service_provider_applications FOR ALL
  USING (
    has_enhanced_role('community_admin'::enhanced_user_role) OR 
    has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
    has_enhanced_role('state_admin'::enhanced_user_role)
  );

CREATE POLICY "Users can create their own applications"
  ON service_provider_applications FOR INSERT
  WITH CHECK (applicant_id = auth.uid());

CREATE POLICY "Users can view their own applications"
  ON service_provider_applications FOR SELECT
  USING (applicant_id = auth.uid());

CREATE POLICY "Users can update their own pending applications"
  ON service_provider_applications FOR UPDATE
  USING (applicant_id = auth.uid() AND status IN ('pending', 'additional_info_required'));

-- Drop and recreate RLS policies for service_provider_profiles
DROP POLICY IF EXISTS "Admins can manage all service provider profiles" ON service_provider_profiles;
DROP POLICY IF EXISTS "Authenticated users can view all service provider profiles (tem" ON service_provider_profiles;
DROP POLICY IF EXISTS "Everyone can view active service providers" ON service_provider_profiles;
DROP POLICY IF EXISTS "Providers can update their own profiles" ON service_provider_profiles;
DROP POLICY IF EXISTS "Everyone can view active provider profiles" ON service_provider_profiles;
DROP POLICY IF EXISTS "Community admins can manage provider profiles" ON service_provider_profiles;

-- Recreate service_provider_profiles policies with enhanced role system
CREATE POLICY "Admins can manage all service provider profiles"
  ON service_provider_profiles FOR ALL
  USING (
    has_enhanced_role('admin'::enhanced_user_role) OR 
    has_enhanced_role('state_admin'::enhanced_user_role) OR 
    has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
    has_enhanced_role('community_admin'::enhanced_user_role)
  );

CREATE POLICY "Authenticated users can view all service provider profiles"
  ON service_provider_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Everyone can view active service providers"
  ON service_provider_profiles FOR SELECT
  USING (is_active = true AND is_verified = true);

CREATE POLICY "Providers can update their own profiles"
  ON service_provider_profiles FOR UPDATE
  USING (user_id = auth.uid());

-- Add a debug function to help troubleshoot role issues
CREATE OR REPLACE FUNCTION public.debug_user_roles(check_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  user_id UUID,
  role enhanced_user_role,
  is_active BOOLEAN,
  district_id UUID,
  has_community_admin BOOLEAN,
  has_district_coordinator BOOLEAN,
  has_state_admin BOOLEAN
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    eur.user_id,
    eur.role,
    eur.is_active,
    eur.district_id,
    has_enhanced_role('community_admin'::enhanced_user_role, eur.user_id) as has_community_admin,
    has_enhanced_role('district_coordinator'::enhanced_user_role, eur.user_id) as has_district_coordinator,
    has_enhanced_role('state_admin'::enhanced_user_role, eur.user_id) as has_state_admin
  FROM enhanced_user_roles eur
  WHERE eur.user_id = COALESCE(check_user_id, auth.uid())
  AND eur.is_active = true;
$$;
