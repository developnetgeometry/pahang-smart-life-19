-- Create test announcements for the facility manager's district and community
INSERT INTO announcements (
  title, 
  content, 
  author_id, 
  district_id, 
  community_id, 
  scope, 
  type, 
  is_published, 
  publish_at
) VALUES 
(
  'Facility Manager Test - District Announcement',
  'This is a test announcement for Pahang Prima South district to verify RLS policy works correctly.',
  'c47b0340-7082-4024-8f97-c06260a9e048',
  '2384b1ce-dbb1-4449-8e78-136d11dbc28e',
  NULL,
  'district',
  'general',
  true,
  now()
),
(
  'Facility Manager Test - Community Announcement', 
  'This is a test announcement for Prima Pahang community to verify RLS policy works correctly.',
  'c47b0340-7082-4024-8f97-c06260a9e048',
  '2384b1ce-dbb1-4449-8e78-136d11dbc28e',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'community',
  'general',
  true,
  now()
);