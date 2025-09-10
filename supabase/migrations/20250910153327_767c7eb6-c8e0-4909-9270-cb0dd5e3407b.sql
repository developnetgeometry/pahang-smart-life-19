-- Insert/Update the 15 canonical Pahang districts with correct data
-- This ensures consistent data structure and naming

-- Insert or update the 15 Pahang districts with proper data
INSERT INTO districts (name, code, district_type, status, state, country, area_km2, population) 
VALUES 
  ('Bentong', 'BTG', 'rural', 'active', 'Pahang', 'Malaysia', 1831.0, 112000),
  ('Bera', 'BRA', 'rural', 'active', 'Pahang', 'Malaysia', 7346.0, 98000),
  ('Cameron Highlands', 'CAM', 'rural', 'active', 'Pahang', 'Malaysia', 712.0, 38000),
  ('Jerantut', 'JRT', 'rural', 'active', 'Pahang', 'Malaysia', 8040.0, 115000),
  ('Kuantan', 'KTN', 'urban', 'active', 'Pahang', 'Malaysia', 2960.0, 607000),
  ('Kuala Lipis', 'KLP', 'rural', 'active', 'Pahang', 'Malaysia', 5198.0, 91000),
  ('Maran', 'MRN', 'rural', 'active', 'Pahang', 'Malaysia', 1795.0, 120000),
  ('Pekan', 'PKN', 'suburban', 'active', 'Pahang', 'Malaysia', 5285.0, 127000),
  ('Raub', 'RAU', 'suburban', 'active', 'Pahang', 'Malaysia', 2271.0, 105000),
  ('Rompin', 'RMP', 'rural', 'active', 'Pahang', 'Malaysia', 5296.0, 102000),
  ('Temerloh', 'TML', 'suburban', 'active', 'Pahang', 'Malaysia', 3887.0, 230000),
  ('Genting', 'GTG', 'suburban', 'active', 'Pahang', 'Malaysia', 350.0, 25000),
  ('Gebeng', 'GBG', 'suburban', 'active', 'Pahang', 'Malaysia', 45.0, 15000),
  ('Jelai', 'JLI', 'rural', 'active', 'Pahang', 'Malaysia', 1200.0, 22000),
  ('Muadzam Shah', 'MDS', 'suburban', 'active', 'Pahang', 'Malaysia', 2874.0, 68000)
ON CONFLICT (name) DO UPDATE SET
  code = EXCLUDED.code,
  district_type = EXCLUDED.district_type,
  status = EXCLUDED.status,
  state = EXCLUDED.state,
  country = EXCLUDED.country,
  area_km2 = COALESCE(districts.area_km2, EXCLUDED.area_km2),
  population = COALESCE(districts.population, EXCLUDED.population),
  updated_at = now();

-- Update existing districts that might have similar names but not exact matches
UPDATE districts SET 
  name = 'Cameron Highlands'
WHERE name ILIKE '%cameron%highland%' AND name != 'Cameron Highlands';

UPDATE districts SET 
  name = 'Kuantan'
WHERE name ILIKE '%kuantan%' AND name != 'Kuantan';

UPDATE districts SET 
  name = 'Kuala Lipis'
WHERE name ILIKE '%kuala%lipis%' AND name != 'Kuala Lipis';

UPDATE districts SET 
  name = 'Muadzam Shah'
WHERE name ILIKE '%muadzam%shah%' AND name != 'Muadzam Shah';