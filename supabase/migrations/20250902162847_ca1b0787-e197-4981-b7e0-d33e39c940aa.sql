-- Enable facilities and bookings modules for the community
INSERT INTO community_features (community_id, module_name, is_enabled, enabled_by, enabled_at, notes)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'facilities', true, 'c47b0340-7082-4024-8f97-c06260a9e048', now(), 'Enabled for facility manager role'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bookings', true, 'c47b0340-7082-4024-8f97-c06260a9e048', now(), 'Enabled for facility bookings')
ON CONFLICT (community_id, module_name) 
DO UPDATE SET 
  is_enabled = true, 
  enabled_at = now(),
  enabled_by = 'c47b0340-7082-4024-8f97-c06260a9e048',
  notes = EXCLUDED.notes;