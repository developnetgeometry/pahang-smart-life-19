-- Fix enum type mismatches in RLS policies and functions
-- First, let's check and fix any policies using the wrong enum types

-- Drop and recreate functions that might be using wrong enum types
DROP FUNCTION IF EXISTS public.has_role(user_role);
DROP FUNCTION IF EXISTS public.get_user_role(uuid, uuid);

-- Recreate has_role function with correct app_role enum
CREATE OR REPLACE FUNCTION public.has_role(check_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = check_role
  );
$$;

-- Recreate get_user_role function with correct app_role enum
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid, district_id uuid DEFAULT NULL::uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role FROM public.user_roles 
  WHERE user_roles.user_id = get_user_role.user_id 
  AND (district_id IS NULL OR user_roles.district_id = get_user_role.district_id)
  ORDER BY 
    CASE role 
      WHEN 'state_admin' THEN 1
      WHEN 'district_coordinator' THEN 2
      WHEN 'community_admin' THEN 3
      WHEN 'facility_manager' THEN 4
      WHEN 'security_officer' THEN 5
      WHEN 'maintenance_staff' THEN 6
      WHEN 'service_provider' THEN 7
      WHEN 'community_leader' THEN 8
      WHEN 'state_service_manager' THEN 9
      WHEN 'resident' THEN 10
    END
  LIMIT 1;
$$;