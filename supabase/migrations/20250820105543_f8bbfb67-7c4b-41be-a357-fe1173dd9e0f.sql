-- Update module categories without deleting anything

-- Set default icon and route for modules missing them
UPDATE system_modules 
SET icon_name = 'FileText' 
WHERE icon_name IS NULL;

UPDATE system_modules 
SET route_path = '/' || REPLACE(module_name, '_', '-')
WHERE route_path IS NULL;

-- Core modules (accessible to all users)
UPDATE system_modules SET category = 'core' 
WHERE module_name IN ('dashboard', 'communication', 'announcements', 'discussions', 'facilities', 'events', 'marketplace') 
   OR display_name IN ('Dashboard', 'Communication', 'Announcements', 'Discussions', 'Facilities', 'Events', 'Marketplace');

-- Resident services (accessible to all users) 
UPDATE system_modules SET category = 'resident'
WHERE module_name IN ('my_bookings', 'bookings', 'my_payments', 'documents', 'notifications', 'profile', 'complaints', 'my-complaints')
   OR display_name ILIKE 'My %' OR display_name IN ('Bookings', 'Complaints', 'Profile', 'Documents', 'Notifications');

-- Admin modules (only for admins)
UPDATE system_modules SET category = 'admin'
WHERE module_name IN ('system_settings', 'audit_logs', 'user-management', 'admin-panel') 
   OR display_name ILIKE '%Admin%' OR display_name ILIKE '%Management' OR display_name ILIKE '%Settings'
   OR display_name = 'User Management' OR display_name = 'System Settings' OR display_name = 'Audit Logs';

-- Analytics modules (for managers and admins)
UPDATE system_modules SET category = 'analytics'
WHERE module_name IN ('analytics_dashboard', 'performance-metrics', 'analytics-reports')
   OR display_name ILIKE '%Analytics%' OR display_name ILIKE '%Metrics%' OR display_name ILIKE '%Reports%';

-- Security modules (for security staff, managers, and admins)
UPDATE system_modules SET category = 'security'
WHERE module_name ILIKE '%security%' OR module_name ILIKE '%cctv%' OR module_name ILIKE '%visitor%' OR module_name ILIKE '%access%'
   OR display_name ILIKE '%Security%' OR display_name ILIKE '%CCTV%' OR display_name ILIKE '%Visitor%' OR display_name ILIKE '%Access%';

-- Maintenance modules (for maintenance staff, facility managers, and admins)
UPDATE system_modules SET category = 'maintenance'
WHERE module_name ILIKE '%maintenance%' OR module_name ILIKE '%work%' OR module_name ILIKE '%asset%' OR module_name ILIKE '%inventory%'
   OR display_name ILIKE '%Maintenance%' OR display_name ILIKE '%Work%' OR display_name ILIKE '%Asset%' OR display_name ILIKE '%Inventory%';

-- Service modules (for service providers and admins)
UPDATE system_modules SET category = 'service'
WHERE module_name IN ('service_dashboard') OR (display_name ILIKE '%Service%' AND display_name NOT ILIKE '%My%');

-- Management modules (for managers, coordinators, and admins)
UPDATE system_modules SET category = 'management'
WHERE display_name ILIKE '%Community%' OR display_name ILIKE '%District%' OR display_name ILIKE '%Role%';