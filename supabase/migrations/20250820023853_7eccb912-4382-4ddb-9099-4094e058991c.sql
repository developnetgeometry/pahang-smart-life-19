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

-- Insert role for existing security user only (we know this one exists)
INSERT INTO public.user_roles (user_id, role, district_id, community_id) 
SELECT id, 'security_officer', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010'
FROM auth.users 
WHERE email = 'securitynorth@test.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Update profiles with primary role for security user
UPDATE public.profiles 
SET primary_role = 'security_officer' 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'securitynorth@test.com');