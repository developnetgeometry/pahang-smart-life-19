-- Check current constraint and fix the district_type values
-- First, let's see what values are allowed by querying the constraint
-- ALTER TABLE districts DROP CONSTRAINT IF EXISTS districts_type_check;

-- Add the allowed values for district_type if needed
-- ALTER TABLE districts ADD CONSTRAINT districts_type_check CHECK (district_type IN ('urban', 'suburban', 'rural'));

-- Insert the 15 predefined Pahang districts with correct district_type values
INSERT INTO districts (name, description, district_type, status, country) VALUES
('Bentong', 'Administrative district in central Pahang', 'urban', 'active', 'Malaysia'),
('Bera', 'Administrative district in central Pahang', 'rural', 'active', 'Malaysia'),
('Cameron Highlands', 'Hill station district in northwestern Pahang', 'suburban', 'active', 'Malaysia'),
('Jerantut', 'Administrative district in north-central Pahang', 'rural', 'active', 'Malaysia'),
('Kuantan', 'Capital district and administrative center of Pahang', 'urban', 'active', 'Malaysia'),
('Kuala Lipis', 'Administrative district in northern Pahang', 'rural', 'active', 'Malaysia'),
('Maran', 'Administrative district in central Pahang', 'rural', 'active', 'Malaysia'),
('Pekan', 'Administrative district in eastern Pahang', 'suburban', 'active', 'Malaysia'),
('Raub', 'Administrative district in western Pahang', 'suburban', 'active', 'Malaysia'),
('Rompin', 'Administrative district in southern Pahang', 'rural', 'active', 'Malaysia'),
('Temerloh', 'Administrative district in central Pahang', 'urban', 'active', 'Malaysia'),
('Genting', 'Operational district covering Genting Highlands area', 'suburban', 'active', 'Malaysia'),
('Gebeng', 'Operational district covering industrial areas', 'urban', 'active', 'Malaysia'),
('Jelai', 'Operational district in Kuala Lipis area', 'rural', 'active', 'Malaysia'),
('Muadzam Shah', 'Operational district covering town and surrounding areas', 'suburban', 'active', 'Malaysia')
ON CONFLICT (name) DO NOTHING;