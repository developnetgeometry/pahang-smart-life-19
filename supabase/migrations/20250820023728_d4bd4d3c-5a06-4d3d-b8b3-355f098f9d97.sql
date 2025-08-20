-- Update the app_role enum to include all 10 hierarchical roles
DROP TYPE IF EXISTS public.app_role CASCADE;

CREATE TYPE public.app_role AS ENUM (
  'state_admin',
  'district_coordinator', 
  'community_admin',
  'facility_manager',
  'security_officer',
  'maintenance_staff',
  'resident',
  'service_provider',
  'community_leader',
  'state_service_manager'
);

-- Recreate user_roles table with new enum
DROP TABLE IF EXISTS public.user_roles CASCADE;

CREATE TABLE public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role app_role not null,
    district_id uuid,
    community_id uuid,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    unique (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Update the has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "State admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'state_admin'));

-- Update profiles table to include primary_role
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS primary_role app_role;

-- Insert test users for each role
INSERT INTO public.user_roles (user_id, role, district_id, community_id) VALUES
-- State Admin
((SELECT id FROM auth.users WHERE email = 'stateadmin@test.com'), 'state_admin', null, null),
-- District Coordinator  
((SELECT id FROM auth.users WHERE email = 'district@test.com'), 'district_coordinator', '550e8400-e29b-41d4-a716-446655440001', null),
-- Community Admin
((SELECT id FROM auth.users WHERE email = 'communityadmin@test.com'), 'community_admin', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010'),
-- Facility Manager
((SELECT id FROM auth.users WHERE email = 'facility@test.com'), 'facility_manager', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010'),
-- Security Officer
((SELECT id FROM auth.users WHERE email = 'securitynorth@test.com'), 'security_officer', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010'),
-- Maintenance Staff
((SELECT id FROM auth.users WHERE email = 'maintenance@test.com'), 'maintenance_staff', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010'),
-- Resident
((SELECT id FROM auth.users WHERE email = 'resident@test.com'), 'resident', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010'),
-- Service Provider
((SELECT id FROM auth.users WHERE email = 'serviceprovider@test.com'), 'service_provider', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010'),
-- Community Leader
((SELECT id FROM auth.users WHERE email = 'leader@test.com'), 'community_leader', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010'),
-- State Service Manager
((SELECT id FROM auth.users WHERE email = 'servicemanager@test.com'), 'state_service_manager', null, null);

-- Update profiles with primary roles
UPDATE public.profiles SET primary_role = 'state_admin' WHERE user_id = (SELECT id FROM auth.users WHERE email = 'stateadmin@test.com');
UPDATE public.profiles SET primary_role = 'district_coordinator' WHERE user_id = (SELECT id FROM auth.users WHERE email = 'district@test.com');
UPDATE public.profiles SET primary_role = 'community_admin' WHERE user_id = (SELECT id FROM auth.users WHERE email = 'communityadmin@test.com');
UPDATE public.profiles SET primary_role = 'facility_manager' WHERE user_id = (SELECT id FROM auth.users WHERE email = 'facility@test.com');
UPDATE public.profiles SET primary_role = 'security_officer' WHERE user_id = (SELECT id FROM auth.users WHERE email = 'securitynorth@test.com');
UPDATE public.profiles SET primary_role = 'maintenance_staff' WHERE user_id = (SELECT id FROM auth.users WHERE email = 'maintenance@test.com');
UPDATE public.profiles SET primary_role = 'resident' WHERE user_id = (SELECT id FROM auth.users WHERE email = 'resident@test.com');
UPDATE public.profiles SET primary_role = 'service_provider' WHERE user_id = (SELECT id FROM auth.users WHERE email = 'serviceprovider@test.com');
UPDATE public.profiles SET primary_role = 'community_leader' WHERE user_id = (SELECT id FROM auth.users WHERE email = 'leader@test.com');
UPDATE public.profiles SET primary_role = 'state_service_manager' WHERE user_id = (SELECT id FROM auth.users WHERE email = 'servicemanager@test.com');