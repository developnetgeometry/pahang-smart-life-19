-- Add new roles to the user_role enum
ALTER TYPE user_role ADD VALUE 'state_admin';
ALTER TYPE user_role ADD VALUE 'district_coordinator'; 
ALTER TYPE user_role ADD VALUE 'community_admin';
ALTER TYPE user_role ADD VALUE 'facility_manager';
ALTER TYPE user_role ADD VALUE 'maintenance_staff';
ALTER TYPE user_role ADD VALUE 'service_provider';
ALTER TYPE user_role ADD VALUE 'community_leader';
ALTER TYPE user_role ADD VALUE 'state_service_manager';

-- Update the has_role function to handle the new roles
CREATE OR REPLACE FUNCTION public.has_role(check_role user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = check_role
  );
$function$;

-- Update get_user_role function for new hierarchy
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid, district_id uuid DEFAULT NULL::uuid)
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role FROM public.user_roles 
  WHERE user_roles.user_id = get_user_role.user_id 
  AND (district_id IS NULL OR user_roles.district_id = get_user_role.district_id)
  ORDER BY 
    CASE role 
      WHEN 'state_admin' THEN 1
      WHEN 'district_coordinator' THEN 2
      WHEN 'community_admin' THEN 3
      WHEN 'admin' THEN 4
      WHEN 'manager' THEN 5
      WHEN 'facility_manager' THEN 6
      WHEN 'security' THEN 7
      WHEN 'maintenance_staff' THEN 8
      WHEN 'community_leader' THEN 9
      WHEN 'service_provider' THEN 10
      WHEN 'resident' THEN 11
      WHEN 'state_service_manager' THEN 12
    END
  LIMIT 1;
$function$;