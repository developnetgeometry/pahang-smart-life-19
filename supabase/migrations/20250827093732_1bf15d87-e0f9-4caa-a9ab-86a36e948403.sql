-- Insert sample districts
INSERT INTO districts (id, name, description, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Kuantan District', 'Main district in Pahang', now()),
('33333333-3333-3333-3333-333333333333', 'Shah Alam District', 'Main district in Selangor', now())
ON CONFLICT (id) DO NOTHING;

-- Insert sample communities
INSERT INTO communities (id, name, district_id, address, description, created_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Prima Pahang', '11111111-1111-1111-1111-111111111111', 'Jalan Prima, Kuantan, Pahang', 'Modern residential community with full amenities', now()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Taman Selayang', '11111111-1111-1111-1111-111111111111', 'Taman Selayang, Kuantan, Pahang', 'Established community with parks and recreational facilities', now()),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Bandar Utama', '33333333-3333-3333-3333-333333333333', 'Bandar Utama, Shah Alam, Selangor', 'Urban community with shopping centers and business district', now())
ON CONFLICT (id) DO NOTHING;