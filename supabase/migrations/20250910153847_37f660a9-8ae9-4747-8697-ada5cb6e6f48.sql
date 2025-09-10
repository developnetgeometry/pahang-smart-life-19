-- Insert missing canonical Pahang districts without deleting existing ones
-- This ensures all 15 districts are available

-- Insert canonical Pahang districts if they don't exist (checking case-insensitive)
INSERT INTO districts (name, code, district_type, status, state, country, area_km2, population) 
SELECT 'Bentong', 'BTG', 'rural', 'active', 'Pahang', 'Malaysia', 1831.0, 112000
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE LOWER(name) LIKE '%bentong%');

INSERT INTO districts (name, code, district_type, status, state, country, area_km2, population) 
SELECT 'Bera', 'BRA', 'rural', 'active', 'Pahang', 'Malaysia', 7346.0, 98000
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE LOWER(name) LIKE '%bera%');

INSERT INTO districts (name, code, district_type, status, state, country, area_km2, population) 
SELECT 'Cameron Highlands', 'CAM', 'rural', 'active', 'Pahang', 'Malaysia', 712.0, 38000
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE LOWER(name) LIKE '%cameron%');

INSERT INTO districts (name, code, district_type, status, state, country, area_km2, population) 
SELECT 'Maran', 'MRN', 'rural', 'active', 'Pahang', 'Malaysia', 1795.0, 120000
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE LOWER(name) LIKE '%maran%');

INSERT INTO districts (name, code, district_type, status, state, country, area_km2, population) 
SELECT 'Pekan', 'PKN', 'suburban', 'active', 'Pahang', 'Malaysia', 5285.0, 127000
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE LOWER(name) LIKE '%pekan%');

INSERT INTO districts (name, code, district_type, status, state, country, area_km2, population) 
SELECT 'Raub', 'RAU', 'suburban', 'active', 'Pahang', 'Malaysia', 2271.0, 105000
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE LOWER(name) LIKE '%raub%');

INSERT INTO districts (name, code, district_type, status, state, country, area_km2, population) 
SELECT 'Rompin', 'RMP', 'rural', 'active', 'Pahang', 'Malaysia', 5296.0, 102000
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE LOWER(name) LIKE '%rompin%');

INSERT INTO districts (name, code, district_type, status, state, country, area_km2, population) 
SELECT 'Temerloh', 'TML', 'suburban', 'active', 'Pahang', 'Malaysia', 3887.0, 230000
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE LOWER(name) LIKE '%temerloh%');

INSERT INTO districts (name, code, district_type, status, state, country, area_km2, population) 
SELECT 'Genting', 'GTG', 'suburban', 'active', 'Pahang', 'Malaysia', 350.0, 25000
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE LOWER(name) LIKE '%genting%');

INSERT INTO districts (name, code, district_type, status, state, country, area_km2, population) 
SELECT 'Gebeng', 'GBG', 'suburban', 'active', 'Pahang', 'Malaysia', 45.0, 15000
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE LOWER(name) LIKE '%gebeng%');

INSERT INTO districts (name, code, district_type, status, state, country, area_km2, population) 
SELECT 'Jelai', 'JLI', 'rural', 'active', 'Pahang', 'Malaysia', 1200.0, 22000
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE LOWER(name) LIKE '%jelai%');

INSERT INTO districts (name, code, district_type, status, state, country, area_km2, population) 
SELECT 'Muadzam Shah', 'MDS', 'suburban', 'active', 'Pahang', 'Malaysia', 2874.0, 68000
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE LOWER(name) LIKE '%muadzam%');