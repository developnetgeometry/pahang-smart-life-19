-- Fix Kumar Selvam's role from resident to facility_manager
-- First check if we need to handle the trigger function
DROP TRIGGER IF EXISTS update_enhanced_user_roles_updated_at ON enhanced_user_roles;

-- Update Kumar Selvam's role
UPDATE enhanced_user_roles 
SET role = 'facility_manager'::enhanced_user_role 
WHERE user_id = 'c47b0340-7082-4024-8f97-c06260a9e048' 
AND role = 'resident'::enhanced_user_role;