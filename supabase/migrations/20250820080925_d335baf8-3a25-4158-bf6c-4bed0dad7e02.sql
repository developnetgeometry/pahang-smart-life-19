-- Create missing enum types
CREATE TYPE app_role AS ENUM (
  'resident',
  'community_leader', 
  'facility_manager',
  'security_officer',
  'maintenance_staff',
  'service_provider',
  'community_admin',
  'district_coordinator',
  'state_admin',
  'admin'
);

-- Update the has_role function to work with user_role enum
CREATE OR REPLACE FUNCTION public.has_role(check_role user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = check_role
  );
$function$;

-- Insert some sample facilities data for testing
INSERT INTO facilities (name, description, capacity, operating_hours, location, district_id, hourly_rate, is_available)
VALUES 
  ('Kolam Renang', 'Kolam renang komuniti dengan kemudahan lengkap', 50, 
   '{"monday": "6:00-22:00", "tuesday": "6:00-22:00", "wednesday": "6:00-22:00", "thursday": "6:00-22:00", "friday": "6:00-22:00", "saturday": "6:00-22:00", "sunday": "6:00-22:00"}'::jsonb, 
   'Blok A, Tingkat 1', 
   (SELECT id FROM districts LIMIT 1), 
   20.00, true),
   
  ('Dewan Komuniti', 'Dewan serbaguna untuk acara dan majlis', 200,
   '{"monday": "8:00-23:00", "tuesday": "8:00-23:00", "wednesday": "8:00-23:00", "thursday": "8:00-23:00", "friday": "8:00-23:00", "saturday": "8:00-23:00", "sunday": "8:00-23:00"}'::jsonb,
   'Blok B, Tingkat Bawah',
   (SELECT id FROM districts LIMIT 1),
   50.00, true),
   
  ('Gimnasium', 'Kemudahan senaman dengan peralatan moden', 30,
   '{"monday": "5:00-23:00", "tuesday": "5:00-23:00", "wednesday": "5:00-23:00", "thursday": "5:00-23:00", "friday": "5:00-23:00", "saturday": "5:00-23:00", "sunday": "5:00-23:00"}'::jsonb,
   'Blok C, Tingkat 2',
   (SELECT id FROM districts LIMIT 1),
   15.00, false),
   
  ('Padang Badminton', 'Gelanggang badminton tertutup', 8,
   '{"monday": "7:00-22:00", "tuesday": "7:00-22:00", "wednesday": "7:00-22:00", "thursday": "7:00-22:00", "friday": "7:00-22:00", "saturday": "7:00-22:00", "sunday": "7:00-22:00"}'::jsonb,
   'Blok D, Tingkat 1', 
   (SELECT id FROM districts LIMIT 1),
   25.00, true),
   
  ('Taman Permainan Kanak-kanak', 'Taman permainan selamat untuk kanak-kanak', 20,
   '{"monday": "6:00-20:00", "tuesday": "6:00-20:00", "wednesday": "6:00-20:00", "thursday": "6:00-20:00", "friday": "6:00-20:00", "saturday": "6:00-20:00", "sunday": "6:00-20:00"}'::jsonb,
   'Kawasan Taman Utama',
   (SELECT id FROM districts LIMIT 1),
   0.00, true);

-- Ensure there's at least one district
INSERT INTO districts (name, description, city, state, country)
VALUES ('Pahang Prima', 'Komuniti perumahan moden di Pahang', 'Kuantan', 'Pahang', 'Malaysia')
ON CONFLICT DO NOTHING;