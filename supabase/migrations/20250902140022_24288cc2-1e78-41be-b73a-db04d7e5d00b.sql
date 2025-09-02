-- First, ensure system_modules exist (using INSERT ... ON CONFLICT)
INSERT INTO system_modules (module_name, display_name, description, category, is_active) VALUES
('announcements', 'Announcements', 'Community announcements and notices', 'communication', true),
('complaints', 'Complaints Management', 'Handle resident complaints', 'services', true),
('discussions', 'Community Discussions', 'Community forum and discussions', 'communication', true),
('marketplace', 'Marketplace', 'Buy and sell items within community', 'community', true),
('events', 'Events & Activities', 'Community events and activities', 'community', true),
('facilities', 'Facilities Management', 'Manage community facilities', 'community', true),
('bookings', 'Facility Bookings', 'Book community facilities', 'community', true),
('visitors', 'Visitor Management', 'Manage visitor registrations', 'security', true),
('cctv', 'CCTV Monitoring', 'Monitor security cameras', 'security', true),
('directory', 'Community Directory', 'Community member directory', 'information', true),
('service_requests', 'Service Requests', 'Request maintenance and services', 'services', true),
('notifications', 'Notifications', 'System notifications management', 'communication', true)
ON CONFLICT (module_name) DO UPDATE SET
display_name = EXCLUDED.display_name,
description = EXCLUDED.description,
category = EXCLUDED.category,
is_active = EXCLUDED.is_active;

-- Update role_hierarchy data safely by deleting and reinserting
DELETE FROM role_hierarchy;

INSERT INTO role_hierarchy (role, level, permission_level, display_name, description, color_code) VALUES
('resident', 1, 'limited_access', 'Resident', 'Basic community member', '#10b981'),
('spouse', 2, 'limited_access', 'Spouse', 'Spouse of primary resident', '#06b6d4'),
('tenant', 3, 'limited_access', 'Tenant', 'Tenant in community', '#8b5cf6'),
('community_leader', 4, 'standard_access', 'Community Leader', 'Elected community representative', '#f59e0b'),
('service_provider', 5, 'standard_access', 'Service Provider', 'Approved service provider', '#ef4444'),
('maintenance_staff', 6, 'standard_access', 'Maintenance Staff', 'Maintenance team member', '#f97316'),
('security_officer', 7, 'standard_access', 'Security Officer', 'Security personnel', '#3b82f6'),
('community_admin', 8, 'full_access', 'Community Admin', 'Community administrator', '#8b5cf6'),
('district_coordinator', 9, 'full_access', 'District Coordinator', 'District-level coordinator', '#ec4899'),
('state_service_manager', 10, 'full_access', 'State Service Manager', 'State service manager', '#6366f1'),
('state_admin', 11, 'full_access', 'State Admin', 'State-level administrator', '#dc2626');