-- Insert the 15 canonical Pahang districts if they don't exist
-- Use a simple approach without ON CONFLICT

-- First, delete any test/invalid districts that shouldn't be there
DELETE FROM districts WHERE name IN ('testings', 'test', 'Test Lipis', 'shah ale', 'Bentongssss', 'Pahang Prima South', 'Pahang Prima East', 'Pahang Prima West', 'Pahang Prima North', 'Shah Alam District');

-- Update existing districts with similar names to canonical names
UPDATE districts SET name = 'Cameron Highlands' WHERE name ILIKE '%cameron%highland%' AND name != 'Cameron Highlands';
UPDATE districts SET name = 'Kuantan' WHERE name ILIKE '%kuantan%' AND name != 'Kuantan';
UPDATE districts SET name = 'Kuala Lipis' WHERE name ILIKE '%kuala%lipis%' AND name != 'Kuala Lipis';
UPDATE districts SET name = 'Muadzam Shah' WHERE name ILIKE '%muadzam%shah%' AND name != 'Muadzam Shah';

-- Insert canonical Pahang districts if they don't exist
INSERT INTO districts (name, code, district_type, status, state, country, area_km2, population) 
SELECT 'Bentong', 'BTG', 'rural', 'active', 'Pahang', 'Malaysia', 1831.0, 112000
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE name = 'Bentong');

INSERT INTO districts (name, code, district_type, status, state, country, area_km2, population) 
SELECT 'Bera', 'BRA', 'rural', 'active', 'Pahang', 'Malaysia', 7346.0, 98000
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE name = 'Bera');

INSERT INTO districts (name, code, district_type, status, state, country, area_km2, population) 
SELECT 'Cameron Highlands', 'CAM', 'rural', 'active', 'Pahang', 'Malaysia', 712.0, 38000
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE name = 'Cameron Highlands');

INSERT INTO districts (name, code, district_type, status, state, country, area_km2, population) 
SELECT 'Kuantan', 'KTN', 'urban', 'active', 'Pahang', 'Malaysia', 2960.0, 607000
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE name = 'Kuantan');

INSERT INTO districts (name, code, district_type, status, state, country, area_km2, population) 
SELECT 'Kuala Lipis', 'KLP', 'rural', 'active', 'Pahang', 'Malaysia', 5198.0, 91000
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE name = 'Kuala Lipis');

INSERT INTO districts (name, code, district_type, status, state, country, area_km2, population) 
SELECT 'Maran', 'MRN', 'rural', 'active', 'Pahang', 'Malaysia', 1795.0, 120000
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE name = 'Maran');

INSERT INTO districts (name, code, district_type, status, state, country, area_km2, population) 
SELECT 'Pekan', 'PKN', 'suburban', 'active', 'Pahang', 'Malaysia', 5285.0, 127000
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE name = 'Pekan');

INSERT INTO districts (name, code, district_type, status, state, country, area_km2, population) 
SELECT 'Raub', 'RAU', 'suburban', 'active', 'Pahang', 'Malaysia', 2271.0, 105000
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE name = 'Raub');

INSERT INTO districts (name, code, district_type, status, state, country, area_km2, population) 
SELECT 'Rompin', 'RMP', 'rural', 'active', 'Pahang', 'Malaysia', 5296.0, 102000
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE name = 'Rompin');

INSERT INTO districts (name, code, district_type, status, state, country, area_km2, population) 
SELECT 'Temerloh', 'TML', 'suburban', 'active', 'Pahang', 'Malaysia', 3887.0, 230000
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE name = 'Temerloh');

INSERT INTO districts (name, code, district_type, status, state, country, area_km2, population) 
SELECT 'Genting', 'GTG', 'suburban', 'active', 'Pahang', 'Malaysia', 350.0, 25000
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE name = 'Genting');

INSERT INTO districts (name, code, district_type, status, state, country, area_km2, population) 
SELECT 'Gebeng', 'GBG', 'suburban', 'active', 'Pahang', 'Malaysia', 45.0, 15000
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE name = 'Gebeng');

INSERT INTO districts (name, code, district_type, status, state, country, area_km2, population) 
SELECT 'Jelai', 'JLI', 'rural', 'active', 'Pahang', 'Malaysia', 1200.0, 22000
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE name = 'Jelai');

INSERT INTO districts (name, code, district_type, status, state, country, area_km2, population) 
SELECT 'Muadzam Shah', 'MDS', 'suburban', 'active', 'Pahang', 'Malaysia', 2874.0, 68000
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE name = 'Muadzam Shah');