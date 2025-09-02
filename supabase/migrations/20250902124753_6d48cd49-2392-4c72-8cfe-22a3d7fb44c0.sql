-- Add community_admin role to the current user
INSERT INTO enhanced_user_roles (user_id, role, is_active, created_at, updated_at)
VALUES (auth.uid(), 'community_admin', true, now(), now())
ON CONFLICT (user_id, role) DO UPDATE SET
  is_active = true,
  updated_at = now();