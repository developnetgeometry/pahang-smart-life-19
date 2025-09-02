-- Add community_admin role to the current user
INSERT INTO enhanced_user_roles (user_id, role, district_id, assigned_by, assigned_at, is_active)
SELECT 
  auth.uid(),
  'community_admin'::enhanced_user_role,
  p.district_id,
  auth.uid(),
  now(),
  true
FROM profiles p
WHERE p.id = auth.uid()
ON CONFLICT (user_id, role) DO UPDATE SET
  is_active = true,
  assigned_at = now();