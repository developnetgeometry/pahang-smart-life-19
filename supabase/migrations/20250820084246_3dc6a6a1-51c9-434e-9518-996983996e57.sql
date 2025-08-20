-- Assign proper roles to test users based on their email addresses using correct app_role enum values
INSERT INTO user_roles (user_id, role, district_id)
SELECT 
  p.id, 
  CASE 
    WHEN p.email = 'stateadmin@test.com' THEN 'state_admin'::app_role
    WHEN p.email = 'districtcoord@test.com' THEN 'district_coordinator'::app_role
    WHEN p.email = 'communityadmin@test.com' THEN 'community_admin'::app_role
    WHEN p.email = 'facilitymanager@test.com' THEN 'facility_manager'::app_role
    WHEN p.email = 'securitynorth@test.com' THEN 'security_officer'::app_role
    WHEN p.email = 'maintenancestaff@test.com' THEN 'maintenance_staff'::app_role
    WHEN p.email = 'serviceprovider@test.com' THEN 'service_provider'::app_role
    WHEN p.email = 'communityleader@test.com' THEN 'community_leader'::app_role
    WHEN p.email = 'stateservicemgr@test.com' THEN 'state_service_manager'::app_role
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