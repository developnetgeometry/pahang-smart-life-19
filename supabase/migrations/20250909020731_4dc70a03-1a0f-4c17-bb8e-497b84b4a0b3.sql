-- Fix district coordinator role and enhance database schema
-- First, ensure district coordinator has proper role
INSERT INTO enhanced_user_roles (user_id, role, district_id, assigned_by, is_active)
SELECT 
  '5301e810-974c-4f8e-9749-1e8cd31b709d', -- districtcoord@test.com user_id
  'district_coordinator'::enhanced_user_role,
  'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc', -- district_id 
  'e020613a-3e8b-4c68-ba4f-c3cab73125b9', -- assigned by state admin
  true
WHERE NOT EXISTS (
  SELECT 1 FROM enhanced_user_roles 
  WHERE user_id = '5301e810-974c-4f8e-9749-1e8cd31b709d' 
  AND role = 'district_coordinator'::enhanced_user_role
  AND is_active = true
);

-- Deactivate any resident role for district coordinator
UPDATE enhanced_user_roles 
SET is_active = false
WHERE user_id = '5301e810-974c-4f8e-9749-1e8cd31b709d' 
AND role = 'resident'::enhanced_user_role;

-- Enhance districts table with management and location fields
ALTER TABLE districts ADD COLUMN IF NOT EXISTS latitude numeric(10,8);
ALTER TABLE districts ADD COLUMN IF NOT EXISTS longitude numeric(11,8);
ALTER TABLE districts ADD COLUMN IF NOT EXISTS coordinator_id uuid REFERENCES auth.users(id);
ALTER TABLE districts ADD COLUMN IF NOT EXISTS established_date date DEFAULT CURRENT_DATE;
ALTER TABLE districts ADD COLUMN IF NOT EXISTS area_km2 numeric(10,2);
ALTER TABLE districts ADD COLUMN IF NOT EXISTS population integer DEFAULT 0;
ALTER TABLE districts ADD COLUMN IF NOT EXISTS communities_count integer DEFAULT 0;
ALTER TABLE districts ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Update existing district with coordinator
UPDATE districts 
SET coordinator_id = '5301e810-974c-4f8e-9749-1e8cd31b709d',
    latitude = 3.1319,
    longitude = 101.6841,
    area_km2 = 25.5,
    population = 15000,
    communities_count = 3,
    established_date = '2020-01-15'
WHERE id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc';

-- Enhance communities table with location and management fields
ALTER TABLE communities ADD COLUMN IF NOT EXISTS latitude numeric(10,8);
ALTER TABLE communities ADD COLUMN IF NOT EXISTS longitude numeric(11,8);
ALTER TABLE communities ADD COLUMN IF NOT EXISTS admin_id uuid REFERENCES auth.users(id);
ALTER TABLE communities ADD COLUMN IF NOT EXISTS established_date date DEFAULT CURRENT_DATE;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS total_units integer DEFAULT 0;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS occupied_units integer DEFAULT 0;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS community_type text DEFAULT 'residential';
ALTER TABLE communities ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';