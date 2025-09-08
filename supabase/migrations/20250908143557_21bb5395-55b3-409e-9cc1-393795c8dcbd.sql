-- Check existing roles in both tables and migrate appropriately
-- First, let's see what roles actually exist in user_roles and map them properly

-- For users that have roles in user_roles but not in enhanced_user_roles, create enhanced role entries
-- This handles any users created by the old system

-- Add any missing resident roles (default role for users without specific roles)
INSERT INTO enhanced_user_roles (user_id, role, assigned_by, assigned_at, district_id, is_active)
SELECT 
  p.id as user_id,
  'resident'::enhanced_user_role,
  p.id as assigned_by,
  p.created_at,
  p.district_id,
  true
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM enhanced_user_roles eur WHERE eur.user_id = p.id
)
AND p.account_status = 'approved';