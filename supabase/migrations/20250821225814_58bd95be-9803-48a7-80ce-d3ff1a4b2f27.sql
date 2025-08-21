-- Remove current role and add security officer role for the user
DELETE FROM enhanced_user_roles 
WHERE user_id = '634ff100-41f2-4880-b79d-a62a97b9de74' 
AND is_active = true;

-- Insert security officer role
INSERT INTO enhanced_user_roles (user_id, role, is_active, assigned_by, notes, assigned_at)
VALUES (
    '634ff100-41f2-4880-b79d-a62a97b9de74',
    'security_officer',
    true,
    '634ff100-41f2-4880-b79d-a62a97b9de74',
    'Updated to security officer role for CCTV access',
    now()
);