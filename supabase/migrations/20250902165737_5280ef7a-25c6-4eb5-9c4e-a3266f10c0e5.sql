-- Add the missing facility-related modules to community features for the test community
-- These should be enabled by default for facilities management
INSERT INTO community_features (community_id, module_name, is_enabled, enabled_by, notes)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'facilities', true, 'c47b0340-7082-4024-8f97-c06260a9e048', 'Facility management module for facility managers'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bookings', true, 'c47b0340-7082-4024-8f97-c06260a9e048', 'Booking management for facilities'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'maintenance', true, 'c47b0340-7082-4024-8f97-c06260a9e048', 'Maintenance management for facilities'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'assets', true, 'c47b0340-7082-4024-8f97-c06260a9e048', 'Asset management for facilities')
ON CONFLICT (community_id, module_name) DO UPDATE SET 
  is_enabled = true,
  enabled_by = EXCLUDED.enabled_by,
  notes = EXCLUDED.notes;