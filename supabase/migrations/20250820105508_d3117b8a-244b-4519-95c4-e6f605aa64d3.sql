-- Clean up and properly categorize all modules
-- First, delete old duplicate entries
DELETE FROM system_modules WHERE icon_name IS NULL OR route_path IS NULL;

-- Update existing modules with proper categories and routes
UPDATE system_modules SET 
  category = 'core',
  icon_name = COALESCE(icon_name, 'Home'),
  route_path = COALESCE(route_path, '/')
WHERE module_name = 'dashboard';

UPDATE system_modules SET 
  category = 'resident',
  icon_name = COALESCE(icon_name, 'Calendar'), 
  route_path = COALESCE(route_path, '/my-bookings')
WHERE module_name IN ('my_bookings', 'bookings');

UPDATE system_modules SET 
  category = 'resident',
  icon_name = COALESCE(icon_name, 'User'),
  route_path = COALESCE(route_path, '/my-profile') 
WHERE module_name = 'profile';

UPDATE system_modules SET 
  category = 'core',
  icon_name = COALESCE(icon_name, 'MessageSquare'),
  route_path = COALESCE(route_path, '/communication')
WHERE module_name = 'communication';

UPDATE system_modules SET 
  category = 'core',
  icon_name = COALESCE(icon_name, 'ShoppingBag'),
  route_path = COALESCE(route_path, '/marketplace')
WHERE module_name = 'marketplace';

UPDATE system_modules SET 
  category = 'core',
  icon_name = COALESCE(icon_name, 'Megaphone'),
  route_path = COALESCE(route_path, '/announcements')
WHERE module_name = 'announcements';

UPDATE system_modules SET 
  category = 'resident',
  icon_name = COALESCE(icon_name, 'AlertTriangle'),
  route_path = COALESCE(route_path, '/my-complaints')
WHERE module_name = 'complaints';

-- Properly categorize admin modules
UPDATE system_modules SET 
  category = 'admin'
WHERE module_name IN ('system_settings', 'audit_logs') OR display_name ILIKE '%admin%' OR display_name ILIKE '%management%';

-- Categorize analytics modules  
UPDATE system_modules SET 
  category = 'analytics'
WHERE module_name IN ('analytics_dashboard') OR display_name ILIKE '%analytics%' OR display_name ILIKE '%metrics%';

-- Categorize security modules
UPDATE system_modules SET 
  category = 'security' 
WHERE display_name ILIKE '%security%' OR display_name ILIKE '%cctv%' OR display_name ILIKE '%visitor%';

-- Categorize maintenance modules
UPDATE system_modules SET 
  category = 'maintenance'
WHERE display_name ILIKE '%maintenance%' OR display_name ILIKE '%work order%' OR display_name ILIKE '%asset%';

-- Categorize service modules  
UPDATE system_modules SET 
  category = 'service'
WHERE display_name ILIKE '%service%' AND display_name NOT ILIKE '%resident%';

-- Insert missing core modules that should exist
INSERT INTO system_modules (module_name, display_name, description, category, icon_name, route_path, sort_order, is_active) VALUES
  ('discussions', 'Discussions', 'Community discussions and forums', 'core', 'MessageSquare', '/discussions', 10, true),
  ('facilities', 'Facilities', 'Community facilities and amenities', 'core', 'Building', '/facilities', 11, true),
  ('events', 'Events', 'Community events and activities', 'core', 'Calendar', '/events', 12, true)
ON CONFLICT (module_name) DO UPDATE SET
  category = EXCLUDED.category,
  icon_name = EXCLUDED.icon_name,
  route_path = EXCLUDED.route_path,
  sort_order = EXCLUDED.sort_order;