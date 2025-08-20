-- Insert system modules data
INSERT INTO public.system_modules (module_name, display_name, description, icon_name, category, sort_order) VALUES
-- Core modules
('dashboard', 'Dashboard', 'Personal dashboard with role-specific widgets', 'Home', 'core', 1),
('profile', 'My Profile', 'Manage personal information and settings', 'User', 'core', 2),
('notifications', 'Notifications', 'View and manage notifications', 'Bell', 'core', 3),
('communication', 'Communication Hub', 'Community chat, announcements, and messaging', 'MessageSquare', 'core', 4),

-- Resident modules
('my-bookings', 'My Bookings', 'Manage facility reservations', 'Calendar', 'resident', 10),
('my-complaints', 'My Complaints', 'Submit and track complaints', 'AlertTriangle', 'resident', 11),
('my-visitors', 'My Visitors', 'Manage visitor registrations', 'Users', 'resident', 12),
('community-events', 'Community Events', 'View and register for events', 'Calendar', 'resident', 13),
('marketplace', 'Marketplace', 'Community buy/sell/trade platform', 'ShoppingBag', 'resident', 14),
('my-payments', 'My Payments', 'View bills and payment history', 'CreditCard', 'resident', 15),
('documents', 'Document Library', 'Access community documents', 'FileText', 'resident', 16),

-- Management modules  
('user-management', 'User Management', 'Manage system users and roles', 'Users', 'management', 20),
('district-management', 'District Management', 'Manage districts and communities', 'MapPin', 'management', 21),
('community-management', 'Community Management', 'Manage community operations', 'Building2', 'management', 22),
('facility-management', 'Facility Management', 'Manage community facilities', 'Building', 'management', 23),
('event-management', 'Event Management', 'Organize and manage events', 'Calendar', 'management', 24),
('vendor-management', 'Vendor Management', 'Manage service providers', 'Briefcase', 'management', 25),

-- Security modules
('security-dashboard', 'Security Dashboard', 'Security operations overview', 'Shield', 'security', 30),
('cctv-management', 'CCTV Management', 'Monitor security cameras', 'Video', 'security', 31),
('access-control', 'Access Control', 'Manage entry and exit controls', 'Key', 'security', 32),
('incident-reports', 'Incident Reports', 'Security incident management', 'AlertTriangle', 'security', 33),
('visitor-security', 'Visitor Management', 'Security visitor tracking', 'UserCheck', 'security', 34),
('patrol-management', 'Patrol Management', 'Schedule and track security patrols', 'Route', 'security', 35),

-- Maintenance modules
('work-orders', 'Work Orders', 'Maintenance request management', 'Wrench', 'maintenance', 40),
('asset-management', 'Asset Management', 'Track equipment and infrastructure', 'Package', 'maintenance', 41),
('inventory-management', 'Inventory Management', 'Manage maintenance supplies', 'Archive', 'maintenance', 42),
('quality-inspections', 'Quality Inspections', 'Schedule and conduct inspections', 'CheckCircle', 'maintenance', 43),
('maintenance-schedule', 'Maintenance Schedule', 'Plan maintenance activities', 'Calendar', 'maintenance', 44),

-- Service Provider modules
('service-dashboard', 'Service Dashboard', 'Service provider operations', 'Briefcase', 'service', 50),
('appointments', 'Appointments', 'Manage service appointments', 'Clock', 'service', 51),
('customer-management', 'Customer Management', 'Manage client relationships', 'Users', 'service', 52),
('service-history', 'Service History', 'Track service delivery history', 'History', 'service', 53),
('billing-invoicing', 'Billing & Invoicing', 'Financial management', 'Receipt', 'service', 54),

-- Analytics modules
('analytics-reports', 'Analytics & Reports', 'Generate insights and reports', 'BarChart3', 'analytics', 60),
('performance-metrics', 'Performance Metrics', 'Track KPIs and metrics', 'TrendingUp', 'analytics', 61),
('financial-reports', 'Financial Reports', 'Financial analytics and reporting', 'DollarSign', 'analytics', 62),

-- System Administration
('system-settings', 'System Settings', 'Configure system parameters', 'Settings', 'admin', 70),
('audit-logs', 'Audit Logs', 'System activity tracking', 'FileText', 'admin', 71),
('backup-security', 'Backup & Security', 'Data protection and security', 'Shield', 'admin', 72)

ON CONFLICT (module_name) DO NOTHING;

-- Insert role permissions for modules
INSERT INTO public.role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve) 
SELECT 
  'resident'::app_role, 
  sm.id, 
  true, 
  CASE WHEN sm.category IN ('resident', 'core') THEN true ELSE false END,
  CASE WHEN sm.category IN ('resident', 'core') THEN true ELSE false END,
  CASE WHEN sm.category IN ('resident') THEN true ELSE false END,
  false
FROM public.system_modules sm
WHERE sm.category IN ('core', 'resident')
ON CONFLICT (role, module_id) DO NOTHING;

INSERT INTO public.role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve) 
SELECT 
  'community_leader'::app_role, 
  sm.id, 
  true, 
  CASE WHEN sm.category IN ('resident', 'core', 'management') THEN true ELSE false END,
  CASE WHEN sm.category IN ('resident', 'core', 'management') THEN true ELSE false END,
  CASE WHEN sm.category IN ('resident', 'management') THEN true ELSE false END,
  CASE WHEN sm.category IN ('management') THEN true ELSE false END
FROM public.system_modules sm
WHERE sm.category IN ('core', 'resident', 'management')
ON CONFLICT (role, module_id) DO NOTHING;

INSERT INTO public.role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve) 
SELECT 
  'facility_manager'::app_role, 
  sm.id, 
  true, 
  CASE WHEN sm.category IN ('core', 'management', 'maintenance') THEN true ELSE false END,
  CASE WHEN sm.category IN ('core', 'management', 'maintenance') THEN true ELSE false END,
  CASE WHEN sm.category IN ('management', 'maintenance') THEN true ELSE false END,
  CASE WHEN sm.category IN ('management', 'maintenance') THEN true ELSE false END
FROM public.system_modules sm
WHERE sm.category IN ('core', 'management', 'maintenance')
ON CONFLICT (role, module_id) DO NOTHING;

INSERT INTO public.role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve) 
SELECT 
  'security_officer'::app_role, 
  sm.id, 
  true, 
  CASE WHEN sm.category IN ('core', 'security') THEN true ELSE false END,
  CASE WHEN sm.category IN ('core', 'security') THEN true ELSE false END,
  CASE WHEN sm.category IN ('security') THEN true ELSE false END,
  CASE WHEN sm.category IN ('security') THEN true ELSE false END
FROM public.system_modules sm
WHERE sm.category IN ('core', 'security')
ON CONFLICT (role, module_id) DO NOTHING;

INSERT INTO public.role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve) 
SELECT 
  'service_provider'::app_role, 
  sm.id, 
  true, 
  CASE WHEN sm.category IN ('core', 'service') THEN true ELSE false END,
  CASE WHEN sm.category IN ('core', 'service') THEN true ELSE false END,
  CASE WHEN sm.category IN ('service') THEN true ELSE false END,
  false
FROM public.system_modules sm
WHERE sm.category IN ('core', 'service')
ON CONFLICT (role, module_id) DO NOTHING;

INSERT INTO public.role_permissions (role, module_id, can_read, can_create, can_update, can_delete, can_approve) 
SELECT 
  'state_admin'::app_role, 
  sm.id, 
  true, 
  true,
  true,
  true,
  true
FROM public.system_modules sm
ON CONFLICT (role, module_id) DO NOTHING;