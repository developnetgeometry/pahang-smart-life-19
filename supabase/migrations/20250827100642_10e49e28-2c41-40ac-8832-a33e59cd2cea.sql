-- Set up single community system - assign all users to Prima Pahang community
-- This prepares the database for multiple communities while ensuring current system works with one community

-- First, let's set a default community for all existing users who don't have one
UPDATE profiles 
SET community_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
WHERE community_id IS NULL;

-- Update the get_user_community function to ensure it returns the community properly
CREATE OR REPLACE FUNCTION public.get_user_community()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT community_id FROM profiles WHERE id = auth.uid();
$$;

-- Create function to check if user belongs to specific community
CREATE OR REPLACE FUNCTION public.user_belongs_to_community(check_community_id uuid DEFAULT get_user_community())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT get_user_community() = check_community_id;
$$;

-- Ensure community features work properly by creating default enabled features for the main community
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

-- Update enhanced_user_roles to include community context where needed
-- This ensures role-based access works within community boundaries
ALTER TABLE enhanced_user_roles 
ADD COLUMN IF NOT EXISTS community_id uuid;

-- Set community_id for existing roles based on user's community
UPDATE enhanced_user_roles 
SET community_id = (
  SELECT community_id 
  FROM profiles 
  WHERE profiles.id = enhanced_user_roles.user_id
)
WHERE community_id IS NULL;

-- Add index for better performance on community-based queries
CREATE INDEX IF NOT EXISTS idx_enhanced_user_roles_community 
ON enhanced_user_roles(community_id, role, is_active);

CREATE INDEX IF NOT EXISTS idx_profiles_community 
ON profiles(community_id);

CREATE INDEX IF NOT EXISTS idx_community_features_community 
ON community_features(community_id, module_name, is_enabled);