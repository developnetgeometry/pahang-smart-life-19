-- Enhanced 10-Role Hierarchical Access Control System

-- Create enhanced user role enum with 10 roles
DROP TYPE IF EXISTS enhanced_user_role CASCADE;
CREATE TYPE enhanced_user_role AS ENUM (
  'state_admin',           -- Level 10: Full system control
  'district_coordinator',  -- Level 9: District-level operations
  'community_admin',       -- Level 8: Community-level control
  'facility_manager',      -- Level 7: Facility management
  'security_officer',      -- Level 6: Security operations
  'maintenance_staff',     -- Level 5: Maintenance tasks
  'service_provider',      -- Level 4: Service provision
  'community_leader',      -- Level 3: Community leadership
  'state_service_manager', -- Level 2: State service coordination
  'resident'               -- Level 1: Basic resident access
);

-- Create permission levels enum
CREATE TYPE permission_level AS ENUM ('full_access', 'standard_access', 'limited_access');

-- Create role hierarchy table
CREATE TABLE public.role_hierarchy (
  role enhanced_user_role PRIMARY KEY,
  level INTEGER NOT NULL UNIQUE,
  permission_level permission_level NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  color_code TEXT DEFAULT '#6B7280',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert role hierarchy data
INSERT INTO public.role_hierarchy (role, level, permission_level, display_name, description, color_code) VALUES
('state_admin', 10, 'full_access', 'State Admin', 'Full system control, user role assignments, policy enforcement', '#3B82F6'),
('district_coordinator', 9, 'full_access', 'District Coordinator', 'Manages communities under a district, validates escalations', '#3B82F6'),
('community_admin', 8, 'full_access', 'Community Admin', 'Handles residents, facility setup, community events, forums', '#3B82F6'),
('facility_manager', 7, 'standard_access', 'Facility Manager', 'Controls facility booking slots, maintenance logging', '#10B981'),
('security_officer', 6, 'standard_access', 'Security Officer', 'Views/responds to alerts, manages CCTV, logs incidents', '#10B981'),
('maintenance_staff', 5, 'standard_access', 'Maintenance Staff', 'Receives and resolves assigned tickets only', '#10B981'),
('service_provider', 4, 'standard_access', 'Service Provider', 'Posts services, responds to booking requests', '#10B981'),
('community_leader', 3, 'standard_access', 'Community Leader', 'Moderates community polls/discussions', '#10B981'),
('state_service_manager', 2, 'standard_access', 'State Service Manager', 'Reviews service quality, state-level service analytics', '#10B981'),
('resident', 1, 'limited_access', 'Resident', 'Books facilities, submits complaints, views announcements', '#F59E0B');

-- Create modules table for granular permissions
CREATE TABLE public.system_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  route_path TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert system modules
INSERT INTO public.system_modules (module_name, display_name, description, route_path) VALUES
('dashboard', 'Dashboard', 'Main dashboard overview', '/'),
('announcements', 'Announcements', 'Community announcements', '/announcements'),
('facilities', 'Facilities', 'Facility booking and management', '/facilities'),
('my_bookings', 'My Bookings', 'Personal booking management', '/my-bookings'),
('complaints', 'Complaints', 'Complaint submission and tracking', '/my-complaints'),
('discussions', 'Discussions', 'Community discussions', '/discussions'),
('marketplace', 'Marketplace', 'Community marketplace', '/marketplace'),
('cctv', 'CCTV Live Feed', 'Security camera feeds', '/cctv-live-feed'),
('visitors', 'Visitor Management', 'Visitor registration and tracking', '/my-visitors'),
('profile', 'My Profile', 'User profile management', '/my-profile'),
('role_management', 'Role Management', 'Role requests and approvals', '/role-management'),
('admin_panel', 'Admin Panel', 'Administrative functions', '/admin'),
('communication', 'Communication Hub', 'Community communication tools', '/communication-hub'),
('visitor_analytics', 'Visitor Analytics', 'Visitor data and analytics', '/visitor-analytics'),
('visitor_security', 'Visitor Security', 'Security visitor management', '/visitor-security');

-- Create role permissions table
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role enhanced_user_role NOT NULL,
  module_id UUID NOT NULL REFERENCES public.system_modules(id),
  can_read BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_update BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_approve BOOLEAN DEFAULT false,
  restrictions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, module_id)
);

-- Create enhanced user roles table (replacing old user_roles)
CREATE TABLE public.enhanced_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role enhanced_user_role NOT NULL,
  district_id UUID REFERENCES public.districts(id),
  assigned_by UUID,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  UNIQUE(user_id, role, district_id)
);

-- Create role change history table for audit trail
CREATE TABLE public.role_change_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  old_role enhanced_user_role,
  new_role enhanced_user_role NOT NULL,
  changed_by UUID,
  change_reason TEXT,
  district_id UUID REFERENCES public.districts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create comprehensive audit log table
CREATE TABLE public.enhanced_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_role enhanced_user_role,
  action TEXT NOT NULL,
  module_name TEXT,
  resource_type TEXT,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  district_id UUID REFERENCES public.districts(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  session_id TEXT
);

-- Enable RLS on new tables
ALTER TABLE public.role_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enhanced_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_change_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enhanced_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create security definer functions for role checking
CREATE OR REPLACE FUNCTION public.get_user_role_level(check_user_id UUID DEFAULT auth.uid())
RETURNS INTEGER
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(MAX(rh.level), 0)
  FROM enhanced_user_roles eur
  JOIN role_hierarchy rh ON eur.role = rh.role
  WHERE eur.user_id = check_user_id AND eur.is_active = true;
$$;

CREATE OR REPLACE FUNCTION public.has_enhanced_role(check_role enhanced_user_role, check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM enhanced_user_roles 
    WHERE user_id = check_user_id 
    AND role = check_role 
    AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.has_role_level_or_higher(min_level INTEGER, check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT get_user_role_level(check_user_id) >= min_level;
$$;

CREATE OR REPLACE FUNCTION public.get_user_highest_role(check_user_id UUID DEFAULT auth.uid())
RETURNS enhanced_user_role
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT eur.role
  FROM enhanced_user_roles eur
  JOIN role_hierarchy rh ON eur.role = rh.role
  WHERE eur.user_id = check_user_id AND eur.is_active = true
  ORDER BY rh.level DESC
  LIMIT 1;
$$;

-- Create RLS policies for enhanced tables

-- Role hierarchy policies
CREATE POLICY "Everyone can view role hierarchy" ON public.role_hierarchy
FOR SELECT USING (true);

-- System modules policies
CREATE POLICY "Everyone can view system modules" ON public.system_modules
FOR SELECT USING (true);

CREATE POLICY "Admins can manage system modules" ON public.system_modules
FOR ALL USING (has_role_level_or_higher(8));

-- Role permissions policies
CREATE POLICY "Everyone can view role permissions" ON public.role_permissions
FOR SELECT USING (true);

CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
FOR ALL USING (has_role_level_or_higher(8));

-- Enhanced user roles policies
CREATE POLICY "Users can view their own roles" ON public.enhanced_user_roles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles" ON public.enhanced_user_roles
FOR SELECT USING (has_role_level_or_higher(8));

CREATE POLICY "High-level admins can manage roles" ON public.enhanced_user_roles
FOR ALL USING (has_role_level_or_higher(9));

-- Role change history policies
CREATE POLICY "Users can view their own role history" ON public.role_change_history
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all role history" ON public.role_change_history
FOR SELECT USING (has_role_level_or_higher(8));

CREATE POLICY "System can log role changes" ON public.role_change_history
FOR INSERT WITH CHECK (true);

-- Enhanced audit logs policies
CREATE POLICY "System can insert audit logs" ON public.enhanced_audit_logs
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view audit logs" ON public.enhanced_audit_logs
FOR SELECT USING (has_role_level_or_higher(8));

CREATE POLICY "Users can view their own audit logs" ON public.enhanced_audit_logs
FOR SELECT USING (user_id = auth.uid());

-- Create function to automatically log role changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO role_change_history (user_id, new_role, changed_by, change_reason, district_id)
    VALUES (NEW.user_id, NEW.role, NEW.assigned_by, 'Role assigned', NEW.district_id);
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.role != NEW.role OR OLD.is_active != NEW.is_active THEN
      INSERT INTO role_change_history (user_id, old_role, new_role, changed_by, change_reason, district_id)
      VALUES (NEW.user_id, OLD.role, NEW.role, NEW.assigned_by, 
              CASE WHEN NEW.is_active = false THEN 'Role deactivated' ELSE 'Role changed' END, 
              NEW.district_id);
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for role change logging
CREATE TRIGGER trigger_log_role_change
  AFTER INSERT OR UPDATE ON public.enhanced_user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_role_change();

-- Update timestamps trigger
CREATE TRIGGER update_enhanced_user_roles_updated_at
  BEFORE UPDATE ON public.enhanced_user_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();