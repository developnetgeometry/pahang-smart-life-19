-- Update all remaining tables with district_id references
UPDATE discussions 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
WHERE district_id = '00000000-0000-0000-0000-000000000001';

UPDATE marketplace_items 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
WHERE district_id = '00000000-0000-0000-0000-000000000001';

UPDATE role_change_requests 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
WHERE district_id = '00000000-0000-0000-0000-000000000001';

UPDATE service_provider_applications 
SET district_id = 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc'
WHERE district_id = '00000000-0000-0000-0000-000000000001';

-- Add communities for districts without removing the duplicate first
INSERT INTO communities (id, name, district_id, description) VALUES
-- Communities for Pahang Prima North
('11111111-2222-3333-4444-555555555551', 'Taman Prima Utara', 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc', 'Northern residential area'),
('11111111-2222-3333-4444-555555555552', 'Bandar Prima North', 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc', 'Commercial and residential hub'),

-- Communities for Pahang Prima East  
('11111111-2222-3333-4444-555555555553', 'Taman Prima Timur', '0a1c51a3-55dd-46b2-b894-c39c6d75557c', 'Eastern residential community'),
('11111111-2222-3333-4444-555555555554', 'Bandar Prima East', '0a1c51a3-55dd-46b2-b894-c39c6d75557c', 'Eastern commercial district'),

-- Communities for Pahang Prima South
('11111111-2222-3333-4444-555555555555', 'Taman Prima Selatan', '2384b1ce-dbb1-4449-8e78-136d11dbc28e', 'Southern residential area'),
('11111111-2222-3333-4444-555555555556', 'Bandar Prima South', '2384b1ce-dbb1-4449-8e78-136d11dbc28e', 'Southern town center'),

-- Communities for Pahang Prima West
('11111111-2222-3333-4444-555555555557', 'Taman Prima Barat', '64a08b8c-820d-40e6-910c-0fc03c45ffe5', 'Western residential community'),
('11111111-2222-3333-4444-555555555558', 'Bandar Prima West', '64a08b8c-820d-40e6-910c-0fc03c45ffe5', 'Western commercial area');