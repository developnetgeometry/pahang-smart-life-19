-- Add missing columns to system_modules table
ALTER TABLE system_modules 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Update existing modules with proper icon names and sort order
UPDATE system_modules SET 
  icon_name = 'Home',
  sort_order = 1
WHERE module_name = 'dashboard';

UPDATE system_modules SET 
  icon_name = 'Calendar',
  sort_order = 2
WHERE module_name = 'my_bookings';

UPDATE system_modules SET 
  icon_name = 'User',
  sort_order = 3
WHERE module_name = 'profile';

UPDATE system_modules SET 
  icon_name = 'MessageSquare',
  sort_order = 4
WHERE module_name = 'communication';

UPDATE system_modules SET 
  icon_name = 'ShoppingBag',
  sort_order = 5
WHERE module_name = 'marketplace';

-- Insert new modules that were created
INSERT INTO system_modules (module_name, display_name, description, category, icon_name, sort_order, is_active, route_path) VALUES
  ('my_payments', 'My Payments', 'View and manage payment history', 'resident', 'CreditCard', 6, true, '/my-payments'),
  ('documents', 'Documents', 'Access community documents and files', 'resident', 'FileText', 7, true, '/documents'),
  ('notifications', 'Notifications', 'View system notifications and alerts', 'core', 'Bell', 8, true, '/notifications'),
  ('security_dashboard', 'Security Dashboard', 'Security operations and monitoring', 'security', 'Shield', 20, true, '/security/dashboard'),
  ('service_dashboard', 'Service Dashboard', 'Service provider operations', 'service', 'Briefcase', 25, true, '/service/dashboard'),
  ('work_orders', 'Work Orders', 'Maintenance work order management', 'maintenance', 'Wrench', 30, true, '/maintenance/work-orders'),
  ('analytics_dashboard', 'Analytics Dashboard', 'System analytics and reports', 'analytics', 'BarChart3', 35, true, '/admin/analytics'),
  ('system_settings', 'System Settings', 'Configure system settings', 'admin', 'Settings', 40, true, '/admin/settings'),
  ('audit_logs', 'Audit Logs', 'View system audit logs', 'admin', 'Activity', 45, true, '/admin/audit')
ON CONFLICT (module_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon_name = EXCLUDED.icon_name,
  sort_order = EXCLUDED.sort_order,
  route_path = EXCLUDED.route_path;