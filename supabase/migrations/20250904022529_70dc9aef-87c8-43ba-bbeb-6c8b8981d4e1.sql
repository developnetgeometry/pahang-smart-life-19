-- Assign facility_manager role to the current user for testing
INSERT INTO enhanced_user_roles (user_id, role, assigned_by, is_active, district_id)
VALUES (
  auth.uid(), 
  'facility_manager', 
  auth.uid(), 
  true,
  'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc' -- Pahang Prima North district
) 
ON CONFLICT (user_id, role) 
DO UPDATE SET is_active = true;