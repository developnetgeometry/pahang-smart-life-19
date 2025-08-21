-- Update existing facilities with proper image mappings based on their names
UPDATE public.facilities 
SET image = CASE 
  -- Gym/Fitness facilities
  WHEN LOWER(name) LIKE '%gym%' OR LOWER(name) LIKE '%gim%' OR LOWER(name) LIKE '%fitness%' OR LOWER(name) LIKE '%kecergasan%' 
    THEN 'community-gym.jpg'
  
  -- Swimming pool facilities  
  WHEN LOWER(name) LIKE '%pool%' OR LOWER(name) LIKE '%kolam%' OR LOWER(name) LIKE '%swimming%' OR LOWER(name) LIKE '%renang%'
    THEN 'swimming-pool.jpg'
    
  -- Function halls
  WHEN LOWER(name) LIKE '%hall%' OR LOWER(name) LIKE '%dewan%' OR LOWER(name) LIKE '%function%' OR LOWER(name) LIKE '%majlis%'
    THEN 'function-hall.jpg'
    
  -- Playgrounds and children areas
  WHEN LOWER(name) LIKE '%playground%' OR LOWER(name) LIKE '%taman%' OR LOWER(name) LIKE '%kanak%' OR LOWER(name) LIKE '%children%' OR LOWER(name) LIKE '%play%'
    THEN 'playground-facility.jpg'
    
  -- Prayer halls and religious facilities
  WHEN LOWER(name) LIKE '%surau%' OR LOWER(name) LIKE '%prayer%' OR LOWER(name) LIKE '%solat%' OR LOWER(name) LIKE '%mosque%' OR LOWER(name) LIKE '%masjid%'
    THEN 'prayer-hall-facility.jpg'
    
  -- Gardens, parks and landscaping
  WHEN LOWER(name) LIKE '%garden%' OR LOWER(name) LIKE '%park%' OR LOWER(name) LIKE '%landscape%' OR LOWER(name) LIKE '%landskap%'
    THEN 'garden-facility.jpg'
    
  -- Keep existing image if none of the above match
  ELSE COALESCE(image, null)
END
WHERE image IS NULL OR image = '';

-- Insert additional sample facilities with proper images if no facilities exist
INSERT INTO public.facilities (name, description, location, capacity, amenities, image, hourly_rate)
SELECT * FROM (VALUES
  ('Children''s Playground', 'Safe playground area for children with modern equipment', 'Recreation Area', 25, ARRAY['Swings', 'Slides', 'Climbing frames', 'Soft play area', 'Benches for parents'], 'playground-facility.jpg', null),
  ('Prayer Hall', 'Prayer hall for Muslim community members', 'Block C, Ground Floor', 100, ARRAY['Prayer mats', 'Ablution area', 'Air conditioning', 'Sound system for Azan'], 'prayer-hall-facility.jpg', null),
  ('Community Garden', 'Beautiful garden area for relaxation and community activities', 'Central Area', 50, ARRAY['Walking paths', 'Benches', 'Landscaping', 'Gazebo'], 'garden-facility.jpg', null)
) AS new_facilities(name, description, location, capacity, amenities, image, hourly_rate)
WHERE NOT EXISTS (
  SELECT 1 FROM public.facilities 
  WHERE LOWER(name) LIKE '%playground%' 
  OR LOWER(name) LIKE '%prayer%' 
  OR LOWER(name) LIKE '%surau%'
  OR LOWER(name) LIKE '%garden%'
);