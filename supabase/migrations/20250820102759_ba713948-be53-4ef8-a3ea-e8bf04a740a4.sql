-- Add all missing columns to system_modules table
ALTER TABLE public.system_modules 
  ADD COLUMN IF NOT EXISTS icon_name TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'core';

-- Update existing records to have category
UPDATE public.system_modules SET category = 'core' WHERE category IS NULL;

-- Insert system modules data with simple structure
INSERT INTO public.system_modules (module_name, display_name, description, category) VALUES
-- Core modules
('dashboard', 'Dashboard', 'Personal dashboard with role-specific widgets', 'core'),
('profile', 'My Profile', 'Manage personal information and settings', 'core'),
('notifications', 'Notifications', 'View and manage notifications', 'core'),
('communication', 'Communication Hub', 'Community chat, announcements, and messaging', 'core'),

-- Resident modules
('my-bookings', 'My Bookings', 'Manage facility reservations', 'resident'),
('my-complaints', 'My Complaints', 'Submit and track complaints', 'resident'),
('my-visitors', 'My Visitors', 'Manage visitor registrations', 'resident'),
('community-events', 'Community Events', 'View and register for events', 'resident'),
('marketplace', 'Marketplace', 'Community buy/sell/trade platform', 'resident'),
('my-payments', 'My Payments', 'View bills and payment history', 'resident'),
('documents', 'Document Library', 'Access community documents', 'resident'),

-- Management modules  
('user-management', 'User Management', 'Manage system users and roles', 'management'),
('district-management', 'District Management', 'Manage districts and communities', 'management'),
('community-management', 'Community Management', 'Manage community operations', 'management'),
('facility-management', 'Facility Management', 'Manage community facilities', 'management'),
('event-management', 'Event Management', 'Organize and manage events', 'management'),

-- Security modules
('security-dashboard', 'Security Dashboard', 'Security operations overview', 'security'),
('cctv-management', 'CCTV Management', 'Monitor security cameras', 'security'),
('access-control', 'Access Control', 'Manage entry and exit controls', 'security'),
('incident-reports', 'Incident Reports', 'Security incident management', 'security'),
('visitor-security', 'Visitor Management', 'Security visitor tracking', 'security'),

-- Maintenance modules
('work-orders', 'Work Orders', 'Maintenance request management', 'maintenance'),
('asset-management', 'Asset Management', 'Track equipment and infrastructure', 'maintenance'),
('inventory-management', 'Inventory Management', 'Manage maintenance supplies', 'maintenance'),
('quality-inspections', 'Quality Inspections', 'Schedule and conduct inspections', 'maintenance'),

-- Service Provider modules
('service-dashboard', 'Service Dashboard', 'Service provider operations', 'service'),
('appointments', 'Appointments', 'Manage service appointments', 'service'),
('customer-management', 'Customer Management', 'Manage client relationships', 'service'),
('billing-invoicing', 'Billing & Invoicing', 'Financial management', 'service'),

-- Analytics modules
('analytics-reports', 'Analytics & Reports', 'Generate insights and reports', 'analytics'),
('performance-metrics', 'Performance Metrics', 'Track KPIs and metrics', 'analytics'),

-- System Administration
('system-settings', 'System Settings', 'Configure system parameters', 'admin'),
('audit-logs', 'Audit Logs', 'System activity tracking', 'admin')

ON CONFLICT (module_name) DO NOTHING;