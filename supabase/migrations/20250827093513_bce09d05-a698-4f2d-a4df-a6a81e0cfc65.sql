-- Insert sample states (if not exists)
INSERT INTO states (id, name, created_at) VALUES
('22222222-2222-2222-2222-222222222222', 'Pahang', now()),
('44444444-4444-4444-4444-444444444444', 'Selangor', now())
ON CONFLICT (id) DO NOTHING;

-- Insert sample districts
INSERT INTO districts (id, name, state_id, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Kuantan', '22222222-2222-2222-2222-222222222222', now()),
('33333333-3333-3333-3333-333333333333', 'Shah Alam', '44444444-4444-4444-4444-444444444444', now())
ON CONFLICT (id) DO NOTHING;

-- Insert sample communities
INSERT INTO communities (id, name, district_id, address, created_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Prima Pahang', '11111111-1111-1111-1111-111111111111', 'Jalan Prima, Kuantan, Pahang', now()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Taman Selayang', '11111111-1111-1111-1111-111111111111', 'Taman Selayang, Kuantan, Pahang', now()),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Bandar Utama', '33333333-3333-3333-3333-333333333333', 'Bandar Utama, Shah Alam, Selangor', now())
ON CONFLICT (id) DO NOTHING;