-- Fix the role-based module access - maintenance staff should not see all maintenance requests
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
  role_modules AS (
    SELECT 
      module_name,
      display_name,
      category,
      required_roles
    FROM (
      VALUES 
        -- CORE MODULES (Everyone gets these)
        ('announcements', 'Announcements', 'communication', ARRAY['resident', 'community_admin', 'district_coordinator', 'state_admin', 'security_officer', 'facility_manager', 'maintenance_staff', 'service_provider']::text[]),
        ('directory', 'Community Directory', 'information', ARRAY['resident', 'community_admin', 'district_coordinator', 'state_admin', 'security_officer', 'facility_manager', 'maintenance_staff', 'service_provider']::text[]),
        ('complaints', 'Complaints Management', 'services', ARRAY['resident', 'community_admin', 'district_coordinator', 'state_admin', 'security_officer', 'facility_manager', 'maintenance_staff', 'service_provider']::text[]),
        
        -- RESIDENT MODULES
        ('discussions', 'Community Discussions', 'communication', ARRAY['resident', 'community_admin', 'district_coordinator', 'state_admin']::text[]),
        ('events', 'Events & Activities', 'community', ARRAY['resident', 'community_admin', 'district_coordinator', 'state_admin']::text[]),
        ('bookings', 'Facility Bookings', 'community', ARRAY['resident', 'community_admin', 'district_coordinator', 'state_admin', 'facility_manager']::text[]),
        
        -- MARKETPLACE (Residents and Service Providers)
        ('marketplace', 'Marketplace', 'community', ARRAY['resident', 'service_provider', 'community_admin', 'district_coordinator', 'state_admin']::text[]),
        
        -- MANAGEMENT MODULES (Facility Manager and above - they manage maintenance requests)
        ('facilities', 'Facilities Management', 'community', ARRAY['facility_manager', 'community_admin', 'district_coordinator', 'state_admin']::text[]),
        ('maintenance', 'Maintenance Management', 'services', ARRAY['facility_manager', 'community_admin', 'district_coordinator', 'state_admin']::text[]),
        
        -- MAINTENANCE STAFF MODULES (Only their assigned tasks)
        ('my_tasks', 'My Maintenance Tasks', 'services', ARRAY['maintenance_staff']::text[]),
        
        -- SECURITY MODULES (Security Officer and above)  
        ('visitor_management', 'Visitor Management', 'security', ARRAY['security_officer', 'community_admin', 'district_coordinator', 'state_admin']::text[]),
        ('cctv', 'CCTV Monitoring', 'security', ARRAY['security_officer', 'community_admin', 'district_coordinator', 'state_admin']::text[]),
        
        -- ADMIN MODULES (Community Admin and above)
        ('service_requests', 'Service Requests', 'services', ARRAY['community_admin', 'district_coordinator', 'state_admin']::text[])
    ) AS modules(module_name, display_name, category, required_roles)
  )
  SELECT 
    rm.module_name,
    rm.display_name,
    rm.category
  FROM role_modules rm
  WHERE EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.role::text = ANY(rm.required_roles)
  )
  AND (
    -- Core modules are always enabled
    rm.module_name IN ('announcements', 'complaints', 'directory')
    OR 
    -- Check if module is enabled for user's community
    is_module_enabled_for_community(rm.module_name)
  )
  ORDER BY rm.display_name;
$function$;