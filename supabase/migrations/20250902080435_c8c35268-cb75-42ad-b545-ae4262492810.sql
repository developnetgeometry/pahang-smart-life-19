-- Fix module access: Residents see only what their Community Admin enables
CREATE OR REPLACE FUNCTION public.get_enabled_modules_for_user_by_role()
RETURNS TABLE(module_name text, display_name text, category text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH user_roles AS (
    SELECT role FROM enhanced_user_roles 
    WHERE user_id = auth.uid() AND is_active = true
  ),
  user_community AS (
    SELECT community_id FROM profiles WHERE id = auth.uid()
  ),
  role_modules AS (
    SELECT 
      module_name,
      display_name,
      category,
      required_roles,
      community_controlled
    FROM (
      VALUES 
        -- CORE MODULES (Always available to everyone)
        ('announcements', 'Announcements', 'communication', ARRAY['resident', 'community_admin', 'district_coordinator', 'state_admin', 'security_officer', 'facility_manager', 'maintenance_staff', 'service_provider']::text[], false),
        ('directory', 'Community Directory', 'information', ARRAY['resident', 'community_admin', 'district_coordinator', 'state_admin', 'security_officer', 'facility_manager', 'maintenance_staff', 'service_provider']::text[], false),
        ('complaints', 'Complaints Management', 'services', ARRAY['resident', 'community_admin', 'district_coordinator', 'state_admin', 'security_officer', 'facility_manager', 'maintenance_staff', 'service_provider']::text[], false),
        
        -- COMMUNITY-CONTROLLED MODULES (Residents see only if Community Admin enables them)
        ('discussions', 'Community Discussions', 'communication', ARRAY['resident', 'community_admin', 'district_coordinator', 'state_admin']::text[], true),
        ('events', 'Events & Activities', 'community', ARRAY['resident', 'community_admin', 'district_coordinator', 'state_admin']::text[], true),
        ('bookings', 'Facility Bookings', 'community', ARRAY['resident', 'community_admin', 'district_coordinator', 'state_admin', 'facility_manager']::text[], true),
        ('marketplace', 'Marketplace', 'community', ARRAY['resident', 'service_provider', 'community_admin', 'district_coordinator', 'state_admin']::text[], true),
        ('facilities', 'Facilities Management', 'community', ARRAY['facility_manager', 'community_admin', 'district_coordinator', 'state_admin']::text[], true),
        ('service_requests', 'Service Requests', 'services', ARRAY['resident', 'community_admin', 'district_coordinator', 'state_admin']::text[], true),
        
        -- ROLE-BASED MODULES (Available based on user role, not community settings)
        ('visitor_management', 'Visitor Management', 'security', ARRAY['security_officer', 'community_admin', 'district_coordinator', 'state_admin']::text[], false),
        ('cctv', 'CCTV Monitoring', 'security', ARRAY['security_officer', 'community_admin', 'district_coordinator', 'state_admin']::text[], false),
        ('my_tasks', 'My Maintenance Tasks', 'services', ARRAY['maintenance_staff']::text[], false),
        ('maintenance', 'Maintenance Management', 'services', ARRAY['facility_manager', 'community_admin', 'district_coordinator', 'state_admin']::text[], false)
    ) AS modules(module_name, display_name, category, required_roles, community_controlled)
  )
  SELECT 
    rm.module_name,
    rm.display_name,
    rm.category
  FROM role_modules rm
  CROSS JOIN user_community uc
  WHERE 
    -- User has required role
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.role::text = ANY(rm.required_roles)
    )
    AND (
      -- Core modules are always available
      rm.community_controlled = false
      OR
      -- Community-controlled modules: check if enabled by community admin
      (rm.community_controlled = true AND EXISTS (
        SELECT 1 FROM community_features cf 
        WHERE cf.community_id = uc.community_id 
        AND cf.module_name = rm.module_name 
        AND cf.is_enabled = true
      ))
    )
  ORDER BY rm.display_name;
$function$;