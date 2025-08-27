-- Now complete the restructuring of district_features to community_features
-- First, drop existing policies that depend on district_id
DROP POLICY IF EXISTS "District coordinators can manage their district features" ON public.district_features;

-- Now we can safely drop the district_id column
ALTER TABLE public.district_features DROP COLUMN IF EXISTS district_id;

-- Add community_id column
ALTER TABLE public.district_features ADD COLUMN community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE;

-- Rename the table
ALTER TABLE public.district_features RENAME TO community_features;

-- Update the unique constraint
ALTER TABLE public.community_features DROP CONSTRAINT IF EXISTS district_features_district_id_module_name_key;
ALTER TABLE public.community_features ADD CONSTRAINT community_features_community_id_module_name_key UNIQUE(community_id, module_name);

-- Update the remaining policy name and create new policies
DROP POLICY IF EXISTS "State admins can manage all district features" ON public.community_features;

CREATE POLICY "State admins can manage all community features"
ON public.community_features
FOR ALL
USING (has_enhanced_role('state_admin'));

CREATE POLICY "District coordinators can manage communities in their district"
ON public.community_features
FOR ALL
USING (
  has_enhanced_role('district_coordinator') AND 
  EXISTS (
    SELECT 1 FROM communities c 
    WHERE c.id = community_features.community_id 
    AND c.district_id = get_user_district()
  )
);

CREATE POLICY "Community admins can manage their community features"
ON public.community_features
FOR ALL
USING (
  has_enhanced_role('community_admin') AND 
  community_id = get_user_community()
);

-- Update functions to work with communities
CREATE OR REPLACE FUNCTION public.is_module_enabled_for_community(
  module_name TEXT,
  community_id UUID DEFAULT get_user_community()
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (
      SELECT cf.is_enabled
      FROM community_features cf
      WHERE cf.community_id = is_module_enabled_for_community.community_id
        AND cf.module_name = is_module_enabled_for_community.module_name
    ),
    -- Default behavior for core modules (always enabled)
    CASE 
      WHEN is_module_enabled_for_community.module_name IN ('announcements', 'complaints', 'directory') THEN true
      ELSE false
    END
  );
$$;

-- Update function to get enabled modules for current user's community
CREATE OR REPLACE FUNCTION public.get_enabled_modules_for_user()
RETURNS TABLE(module_name TEXT, display_name TEXT, category TEXT)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    modules.module_name,
    modules.display_name,
    modules.category
  FROM (
    VALUES 
      ('facilities', 'Facilities Management', 'community'),
      ('bookings', 'Facility Bookings', 'community'),
      ('marketplace', 'Marketplace', 'community'),
      ('announcements', 'Announcements', 'communication'),
      ('discussions', 'Community Discussions', 'communication'),
      ('complaints', 'Complaints Management', 'services'),
      ('service_requests', 'Service Requests', 'services'),
      ('events', 'Events', 'community'),
      ('cctv', 'CCTV Monitoring', 'security'),
      ('visitor_management', 'Visitor Management', 'security'),
      ('directory', 'Community Directory', 'information')
  ) AS modules(module_name, display_name, category)
  WHERE 
    -- Core modules are always enabled
    modules.module_name IN ('announcements', 'complaints', 'directory')
    OR 
    -- Check if module is enabled for user's community
    is_module_enabled_for_community(modules.module_name)
  ORDER BY modules.display_name;
$$;