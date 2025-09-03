-- Insert sample work orders for testing with correct enum values
INSERT INTO work_orders (
  title, 
  description, 
  work_order_type, 
  priority, 
  status, 
  location, 
  assigned_to, 
  created_by, 
  district_id
) VALUES 
(
  'Fix Air Conditioning Unit',
  'Air conditioning unit in Block A is not cooling properly. Residents have complained about high temperature.',
  'maintenance',
  'high',
  'assigned',
  'Block A, Level 3, Community Hall',
  '2e9e595e-c6f2-4ee6-8436-953dc6274eb6', -- maintenance staff user
  'bfe88021-d76b-4f65-8b43-1b879ad4617a', -- some admin user
  '0a1c51a3-55dd-46b2-b894-c39c6d75557c'
),
(
  'Repair Elevator Door',
  'Elevator door in Block B is getting stuck and making loud noises. Safety concern for residents.',
  'repair',
  'high',
  'pending',
  'Block B, Main Elevator',
  '2e9e595e-c6f2-4ee6-8436-953dc6274eb6', -- maintenance staff user
  'bfe88021-d76b-4f65-8b43-1b879ad4617a', -- some admin user
  '0a1c51a3-55dd-46b2-b894-c39c6d75557c'
),
(
  'Replace Broken Light Fixtures',
  'Several light fixtures in the parking garage have burnt out bulbs and broken covers.',
  'repair',
  'medium',
  'in_progress',
  'Basement Parking Garage',
  '2e9e595e-c6f2-4ee6-8436-953dc6274eb6', -- maintenance staff user
  'bfe88021-d76b-4f65-8b43-1b879ad4617a', -- some admin user
  '0a1c51a3-55dd-46b2-b894-c39c6d75557c'
),
(
  'Clean and Service Pool Equipment',
  'Monthly maintenance of swimming pool filtration system and chemical balance check.',
  'maintenance',
  'low',
  'completed',
  'Swimming Pool Area',
  '2e9e595e-c6f2-4ee6-8436-953dc6274eb6', -- maintenance staff user
  'bfe88021-d76b-4f65-8b43-1b879ad4617a', -- some admin user
  '0a1c51a3-55dd-46b2-b894-c39c6d75557c'
),
(
  'Emergency Water Leak',
  'Major water leak detected in basement causing flooding. Immediate attention required.',
  'emergency',
  'urgent',
  'assigned',
  'Basement Storage Area',
  '2e9e595e-c6f2-4ee6-8436-953dc6274eb6', -- maintenance staff user
  'bfe88021-d76b-4f65-8b43-1b879ad4617a', -- some admin user
  '0a1c51a3-55dd-46b2-b894-c39c6d75557c'
);

-- Insert sample assets for testing
INSERT INTO assets (
  name,
  description,
  asset_type,
  condition_status,
  location,
  brand,
  model,
  serial_number,
  purchase_date,
  purchase_price,
  current_value,
  assigned_to,
  district_id
) VALUES 
(
  'HVAC System Block A',
  'Central air conditioning and heating system for residential Block A',
  'HVAC',
  'good',
  'Block A Rooftop',
  'Carrier',
  'WeatherExpert 48TC',
  'HVAC-001-2023',
  '2023-01-15',
  25000.00,
  22000.00,
  '2e9e595e-c6f2-4ee6-8436-953dc6274eb6',
  '0a1c51a3-55dd-46b2-b894-c39c6d75557c'
),
(
  'Elevator System Block B',
  'Main passenger elevator serving all floors in Block B',
  'Elevator',
  'fair',
  'Block B Central Core',
  'Otis',
  'Gen2 Comfort',
  'ELEV-002-2022',
  '2022-08-10',
  45000.00,
  40000.00,
  '2e9e595e-c6f2-4ee6-8436-953dc6274eb6',
  '0a1c51a3-55dd-46b2-b894-c39c6d75557c'
),
(
  'Swimming Pool Filtration System',
  'Complete water filtration and chemical treatment system for community pool',
  'Pool Equipment',
  'excellent',
  'Swimming Pool Equipment Room',
  'Pentair',
  'FNS Plus 60',
  'POOL-003-2024',
  '2024-03-20',
  15000.00,
  14500.00,
  '2e9e595e-c6f2-4ee6-8436-953dc6274eb6',
  '0a1c51a3-55dd-46b2-b894-c39c6d75557c'
),
(
  'Emergency Generator',
  'Backup power generator for essential systems during outages',
  'Generator',
  'good',
  'Utility Room Basement',
  'Caterpillar',
  'C7.1 (60 Hz)',
  'GEN-004-2023',
  '2023-06-05',
  35000.00,
  32000.00,
  '2e9e595e-c6f2-4ee6-8436-953dc6274eb6',
  '0a1c51a3-55dd-46b2-b894-c39c6d75557c'
);