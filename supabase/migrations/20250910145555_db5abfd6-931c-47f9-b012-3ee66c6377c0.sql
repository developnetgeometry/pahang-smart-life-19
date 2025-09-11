-- First add unique constraint on district name, then insert the predefined districts
ALTER TABLE districts ADD CONSTRAINT unique_district_name UNIQUE (name);

-- Insert the 15 predefined Pahang districts
INSERT INTO districts (name, description, district_type, status, country) VALUES
('Bentong', 'Administrative district in central Pahang', 'administrative', 'active', 'Malaysia'),
('Bera', 'Administrative district in central Pahang', 'administrative', 'active', 'Malaysia'),
('Cameron Highlands', 'Hill station district in northwestern Pahang', 'administrative', 'active', 'Malaysia'),
('Jerantut', 'Administrative district in north-central Pahang', 'administrative', 'active', 'Malaysia'),
('Kuantan', 'Capital district and administrative center of Pahang', 'administrative', 'active', 'Malaysia'),
('Kuala Lipis', 'Administrative district in northern Pahang', 'administrative', 'active', 'Malaysia'),
('Maran', 'Administrative district in central Pahang', 'administrative', 'active', 'Malaysia'),
('Pekan', 'Administrative district in eastern Pahang', 'administrative', 'active', 'Malaysia'),
('Raub', 'Administrative district in western Pahang', 'administrative', 'active', 'Malaysia'),
('Rompin', 'Administrative district in southern Pahang', 'administrative', 'active', 'Malaysia'),
('Temerloh', 'Administrative district in central Pahang', 'administrative', 'active', 'Malaysia'),
('Genting', 'Operational district covering Genting Highlands area', 'operational', 'active', 'Malaysia'),
('Gebeng', 'Operational district covering industrial areas', 'operational', 'active', 'Malaysia'),
('Jelai', 'Operational district in Kuala Lipis area', 'operational', 'active', 'Malaysia'),
('Muadzam Shah', 'Operational district covering town and surrounding areas', 'operational', 'active', 'Malaysia')
ON CONFLICT (name) DO UPDATE SET
description = EXCLUDED.description,
district_type = EXCLUDED.district_type,
status = EXCLUDED.status,
country = EXCLUDED.country;

-- Update RLS policy to prevent creation of new districts
DROP POLICY IF EXISTS "State admins can create districts" ON districts;
CREATE POLICY "State admins can only view and update districts" ON districts
FOR ALL USING (true)
WITH CHECK (false); -- Prevents INSERT operations