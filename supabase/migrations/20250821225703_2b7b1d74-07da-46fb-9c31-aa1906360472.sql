-- Update the correct enhanced_user_roles table
UPDATE enhanced_user_roles 
SET role = 'security_officer', 
    assigned_at = now(),
    notes = 'Updated to security officer role for CCTV access'
WHERE user_id = '634ff100-41f2-4880-b79d-a62a97b9de74'
AND is_active = true;