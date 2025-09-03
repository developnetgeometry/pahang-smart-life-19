-- Update the maintenance staff user to have the correct role
UPDATE enhanced_user_roles 
SET role = 'maintenance_staff' 
WHERE user_id = '2e9e595e-c6f2-4ee6-8436-953dc6274eb6' 
AND role = 'resident';

-- If no resident role exists, insert the maintenance_staff role
INSERT INTO enhanced_user_roles (user_id, role, is_active, assigned_by)
SELECT '2e9e595e-c6f2-4ee6-8436-953dc6274eb6', 'maintenance_staff', true, '2e9e595e-c6f2-4ee6-8436-953dc6274eb6'
WHERE NOT EXISTS (
  SELECT 1 FROM enhanced_user_roles 
  WHERE user_id = '2e9e595e-c6f2-4ee6-8436-953dc6274eb6' 
  AND role = 'maintenance_staff'
);