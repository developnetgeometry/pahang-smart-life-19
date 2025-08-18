-- First ensure we have a district for our test users
INSERT INTO districts (id, name, description, address, city, state, postal_code, country)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Pahang Prima North',
  'Premium residential area in northern Pahang',
  'Jalan Prima Utara 1, Taman Prima',
  'Kuantan',
  'Pahang',
  '25300',
  'Malaysia'
) ON CONFLICT (id) DO NOTHING;

-- Create user roles enum if not exists (should already exist)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'manager', 'security', 'resident');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- We'll need to create the auth users first, then insert profiles and roles
-- The profiles will be created when users sign up via the handle_new_user trigger
-- But we need to prepare the user_roles table structure

-- Create user_roles table if not exists
CREATE TABLE IF NOT EXISTS user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    role user_role NOT NULL,
    district_id uuid REFERENCES districts(id),
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
CREATE POLICY "Users can view their own roles" ON user_roles
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
CREATE POLICY "Admins can manage roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );