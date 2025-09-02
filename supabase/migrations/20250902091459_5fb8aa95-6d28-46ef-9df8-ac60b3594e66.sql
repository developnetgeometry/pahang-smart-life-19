-- Fix RLS policy for community_features so residents can read enabled features
DROP POLICY IF EXISTS "Users can view enabled community features" ON community_features;

CREATE POLICY "Users can view enabled community features"
ON community_features
FOR SELECT
TO authenticated
USING (is_enabled = true AND community_id = get_user_community());