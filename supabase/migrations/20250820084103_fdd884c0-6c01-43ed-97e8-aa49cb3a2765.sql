-- Assign proper roles to test users based on their email addresses
INSERT INTO user_roles (user_id, role, district_id)
SELECT 
  p.id, 
  CASE 
    WHEN p.email = 'stateadmin@test.com' THEN 'state_admin'::user_role
    WHEN p.email = 'districtcoord@test.com' THEN 'district_coordinator'::user_role
    WHEN p.email = 'communityadmin@test.com' THEN 'community_admin'::user_role
    WHEN p.email = 'facilitymanager@test.com' THEN 'facility_manager'::user_role
    WHEN p.email = 'securitynorth@test.com' THEN 'security'::user_role
    WHEN p.email = 'maintenancestaff@test.com' THEN 'maintenance_staff'::user_role
    WHEN p.email = 'serviceprovider@test.com' THEN 'service_provider'::user_role
    WHEN p.email = 'communityleader@test.com' THEN 'community_leader'::user_role
    WHEN p.email = 'stateservicemgr@test.com' THEN 'state_service_manager'::user_role
  END as role,
  p.district_id
FROM profiles p
WHERE p.email IN (
  'stateadmin@test.com',
  'districtcoord@test.com', 
  'communityadmin@test.com',
  'facilitymanager@test.com',
  'securitynorth@test.com',
  'maintenancestaff@test.com',
  'serviceprovider@test.com',
  'communityleader@test.com',
  'stateservicemgr@test.com'
)
AND NOT EXISTS (
  SELECT 1 FROM user_roles ur WHERE ur.user_id = p.id
);