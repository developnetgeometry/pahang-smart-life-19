-- First, clean up any existing test users to avoid conflicts
DELETE FROM public.user_roles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@test.com'
);

DELETE FROM public.profiles WHERE email LIKE '%@test.com';

DELETE FROM auth.users WHERE email LIKE '%@test.com';

-- Insert test users directly into auth.users table
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES 
-- State Admin
('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'stateadmin@test.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dato Ahmad Rashid"}', now(), now(), '', '', '', ''),
-- District Coordinator  
('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'districtcoord@test.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Hajjah Siti Aminah"}', now(), now(), '', '', '', ''),
-- Community Admin
('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'communityadmin@test.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Encik Lim Chee Kong"}', now(), now(), '', '', '', ''),
-- Admin
('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@test.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Ahmad Rahman"}', now(), now(), '', '', '', ''),
-- Manager North
('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'managernorth@test.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Siti Nurhaliza"}', now(), now(), '', '', '', ''),
-- Facility Manager
('00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'facilitymanager@test.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Kumar Selvam"}', now(), now(), '', '', '', ''),
-- Security North
('00000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'securitynorth@test.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Mohd Faizal"}', now(), now(), '', '', '', ''),
-- Maintenance Staff
('00000000-0000-0000-0000-000000000108', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'maintenancestaff@test.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Raj Kumar"}', now(), now(), '', '', '', ''),
-- Resident
('00000000-0000-0000-0000-000000000109', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'resident@test.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Ali bin Hassan"}', now(), now(), '', '', '', ''),
-- Service Provider
('00000000-0000-0000-0000-000000000110', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'serviceprovider@test.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Mary Tan"}', now(), now(), '', '', '', ''),
-- Community Leader
('00000000-0000-0000-0000-000000000111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'communityleader@test.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Fatimah binti Ahmad"}', now(), now(), '', '', '', ''),
-- State Service Manager
('00000000-0000-0000-0000-000000000112', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'stateservicemgr@test.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "David Wong"}', now(), now(), '', '', '', '');

-- Insert corresponding profiles
INSERT INTO public.profiles (id, email, full_name, phone, unit_number, district_id) VALUES
('00000000-0000-0000-0000-000000000101', 'stateadmin@test.com', 'Dato Ahmad Rashid', '013-1001001', 'State Office', '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000102', 'districtcoord@test.com', 'Hajjah Siti Aminah', '013-1001002', 'District Office A', '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000103', 'communityadmin@test.com', 'Encik Lim Chee Kong', '013-1001003', 'Community Center', '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000104', 'admin@test.com', 'Ahmad Rahman', '013-1001004', 'A-1-01', '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000105', 'managernorth@test.com', 'Siti Nurhaliza', '013-1001005', 'B-2-05', '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000106', 'facilitymanager@test.com', 'Kumar Selvam', '013-1001006', 'Facility Office', '2384b1ce-dbb1-4449-8e78-136d11dbc28e'),
('00000000-0000-0000-0000-000000000107', 'securitynorth@test.com', 'Mohd Faizal', '013-1001007', 'Guard House A', '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000108', 'maintenancestaff@test.com', 'Raj Kumar', '013-1001008', 'Maintenance Office', '0a1c51a3-55dd-46b2-b894-c39c6d75557c'),
('00000000-0000-0000-0000-000000000109', 'resident@test.com', 'Ali bin Hassan', '013-1001009', 'A-5-12', '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000110', 'serviceprovider@test.com', 'Mary Tan', '013-1001010', 'Service Center', '2384b1ce-dbb1-4449-8e78-136d11dbc28e'),
('00000000-0000-0000-0000-000000000111', 'communityleader@test.com', 'Fatimah binti Ahmad', '013-1001011', 'D-6-09', '64a08b8c-820d-40e6-910c-0fc03c45ffe5'),
('00000000-0000-0000-0000-000000000112', 'stateservicemgr@test.com', 'David Wong', '013-1001012', 'State Service Office', 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc');

-- Insert user roles
INSERT INTO public.user_roles (user_id, role, district_id) VALUES
('00000000-0000-0000-0000-000000000101', 'state_admin', '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000102', 'district_coordinator', '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000103', 'community_admin', '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000104', 'admin', '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000105', 'manager', '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000106', 'facility_manager', '2384b1ce-dbb1-4449-8e78-136d11dbc28e'),
('00000000-0000-0000-0000-000000000107', 'security', '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000108', 'maintenance_staff', '0a1c51a3-55dd-46b2-b894-c39c6d75557c'),
('00000000-0000-0000-0000-000000000109', 'resident', '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000110', 'service_provider', '2384b1ce-dbb1-4449-8e78-136d11dbc28e'),
('00000000-0000-0000-0000-000000000111', 'community_leader', '64a08b8c-820d-40e6-910c-0fc03c45ffe5'),
('00000000-0000-0000-0000-000000000112', 'state_service_manager', 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc');