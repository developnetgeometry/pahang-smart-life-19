-- Fix Kumar Selvam's role from resident to facility_manager
UPDATE enhanced_user_roles 
SET role = 'facility_manager'::enhanced_user_role 
WHERE user_id = 'c47b0340-7082-4024-8f97-c06260a9e048' 
AND role = 'resident'::enhanced_user_role;