-- Create default community features for the single community system
INSERT INTO community_features (community_id, module_name, is_enabled, enabled_by, notes)
SELECT 
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  module_name,
  CASE 
    WHEN module_name IN ('announcements', 'complaints', 'directory') THEN true
    ELSE false
  END,
  (SELECT id FROM profiles WHERE community_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' LIMIT 1),
  CASE 
    WHEN module_name IN ('announcements', 'complaints', 'directory') THEN 'Core module - always enabled'
    ELSE 'Optional module - can be enabled by community admin'
  END
FROM (
  VALUES 
    ('facilities'),
    ('bookings'),
    ('marketplace'),
    ('announcements'),
    ('discussions'),
    ('complaints'),
    ('service_requests'),
    ('events'),
    ('cctv'),
    ('visitor_management'),
    ('directory')
) AS modules(module_name)
ON CONFLICT (community_id, module_name) DO NOTHING;