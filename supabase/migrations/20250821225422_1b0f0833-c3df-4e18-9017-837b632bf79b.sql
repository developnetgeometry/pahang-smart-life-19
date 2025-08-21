-- Update current user role to security_officer
-- First, get the current authenticated user and update their role

UPDATE enhanced_user_roles 
SET role = 'security_officer', 
    assigned_at = now(),
    notes = 'Updated to security officer role for CCTV access'
WHERE user_id = (
    SELECT id FROM auth.users 
    WHERE email = (
        SELECT email FROM auth.users 
        ORDER BY created_at DESC 
        LIMIT 1
    )
) 
AND is_active = true;