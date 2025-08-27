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

-- Create system_modules table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.system_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  is_core BOOLEAN DEFAULT false, -- Core modules cannot be disabled
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on system_modules
ALTER TABLE public.system_modules ENABLE ROW LEVEL SECURITY;

-- Create policies for system_modules
CREATE POLICY "Everyone can view active system modules"
ON public.system_modules
FOR SELECT
USING (is_active = true);

CREATE POLICY "State admins can manage system modules"
ON public.system_modules
FOR ALL
USING (has_enhanced_role('state_admin'));

-- Insert default system modules
INSERT INTO public.system_modules (module_name, display_name, description, category, is_core, sort_order) VALUES
('facilities', 'Facilities Management', 'Manage community facilities and bookings', 'community', false, 10),
('bookings', 'Facility Bookings', 'Book and manage facility reservations', 'community', false, 11),
('marketplace', 'Marketplace', 'Community marketplace for buying/selling', 'community', false, 20),
('announcements', 'Announcements', 'Community announcements and notices', 'communication', true, 1),
('discussions', 'Community Discussions', 'Community forum and discussions', 'communication', false, 30),
('complaints', 'Complaints Management', 'Submit and track complaints', 'services', true, 2),
('service_requests', 'Service Requests', 'Request community services', 'services', false, 40),
('events', 'Events', 'Community events and activities', 'community', false, 50),
('cctv', 'CCTV Monitoring', 'Security camera monitoring', 'security', false, 60),
('visitor_management', 'Visitor Management', 'Manage visitor access and tracking', 'security', false, 61),
('directory', 'Community Directory', 'Directory of contacts and services', 'information', true, 3)
ON CONFLICT (module_name) DO NOTHING;

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
    -- If no record exists, check if it's a core module (always enabled)
    (
      SELECT sm.is_core
      FROM system_modules sm
      WHERE sm.module_name = is_module_enabled_for_district.module_name
        AND sm.is_active = true
    ),
    false -- Default to disabled if module doesn't exist
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
    sm.module_name,
    sm.display_name,
    sm.category
  FROM system_modules sm
  WHERE sm.is_active = true
    AND (
      sm.is_core = true OR -- Core modules are always enabled
      is_module_enabled_for_district(sm.module_name)
    )
  ORDER BY sm.sort_order, sm.display_name;
$$;

-- Trigger to update updated_at
CREATE TRIGGER update_district_features_updated_at
  BEFORE UPDATE ON public.district_features
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_modules_updated_at
  BEFORE UPDATE ON public.system_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();