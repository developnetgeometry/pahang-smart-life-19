-- Create district_features table to manage enabled modules per district
CREATE TABLE IF NOT EXISTS public.district_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  enabled_by UUID REFERENCES auth.users(id),
  enabled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(district_id, module_name)
);

-- Enable RLS
ALTER TABLE public.district_features ENABLE ROW LEVEL SECURITY;

-- Create policies for district_features
CREATE POLICY "State admins can manage all district features"
ON public.district_features
FOR ALL
USING (has_enhanced_role('state_admin'));

CREATE POLICY "District coordinators can manage their district features"
ON public.district_features
FOR ALL
USING (
  has_enhanced_role('district_coordinator') AND 
  district_id = get_user_district()
);

-- Function to check if a module is enabled for a district
CREATE OR REPLACE FUNCTION public.is_module_enabled_for_district(
  module_name TEXT,
  district_id UUID DEFAULT get_user_district()
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (
      SELECT df.is_enabled
      FROM district_features df
      WHERE df.district_id = is_module_enabled_for_district.district_id
        AND df.module_name = is_module_enabled_for_district.module_name
    ),
    -- Default behavior for core modules (always enabled)
    CASE 
      WHEN is_module_enabled_for_district.module_name IN ('announcements', 'complaints', 'directory') THEN true
      ELSE false
    END
  );
$$;

-- Function to get enabled modules for current user's district
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
    -- Check if module is enabled for district
    is_module_enabled_for_district(modules.module_name)
  ORDER BY modules.display_name;
$$;

-- Trigger to update updated_at
CREATE TRIGGER update_district_features_updated_at
  BEFORE UPDATE ON public.district_features
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();