-- Add scope and community_id columns to announcements table
ALTER TABLE announcements 
ADD COLUMN scope text DEFAULT 'district' CHECK (scope IN ('community', 'district', 'state')),
ADD COLUMN community_id uuid;

-- Add community_id to profiles table for community-level filtering
ALTER TABLE profiles 
ADD COLUMN community_id uuid;

-- Update announcements to set scope based on type
UPDATE announcements 
SET scope = CASE 
  WHEN type IN ('general', 'event') THEN 'community'
  WHEN type IN ('maintenance', 'security') THEN 'district' 
  ELSE 'state'
END;

-- Create function to get user's community
CREATE OR REPLACE FUNCTION get_user_community() 
RETURNS uuid 
LANGUAGE sql 
STABLE SECURITY DEFINER 
SET search_path TO 'public'
AS $$
  SELECT community_id FROM profiles WHERE id = auth.uid();
$$;

-- Update RLS policy for announcements to handle different scopes
DROP POLICY IF EXISTS "Users can view announcements in their district" ON announcements;

CREATE POLICY "Users can view announcements by scope" ON announcements
FOR SELECT USING (
  is_published = true AND 
  publish_at <= now() AND 
  (expire_at IS NULL OR expire_at > now()) AND
  (
    (scope = 'state') OR
    (scope = 'district' AND district_id = get_user_district()) OR
    (scope = 'community' AND community_id = get_user_community())
  )
);