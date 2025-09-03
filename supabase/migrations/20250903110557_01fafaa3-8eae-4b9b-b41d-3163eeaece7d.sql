-- Insert sample work orders for testing
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
  'urgent',
  'pending',
  'Block B, Main Elevator',
  '2e9e595e-c6f2-4ee6-8436-953dc6274eb6', -- maintenance staff user
  'bfe88021-d76b-4f65-8b43-1b879ad4617a', -- some admin user
  '0a1c51a3-55dd-46b2-b894-c39c6d75557c'
),
(
  'Replace Broken Light Fixtures',
  'Several light fixtures in the parking garage have burnt out bulbs and broken covers.',
  'electrical',
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
  'cleaning',
  'low',
  'completed',
  'Swimming Pool Area',
  '2e9e595e-c6f2-4ee6-8436-953dc6274eb6', -- maintenance staff user
  'bfe88021-d76b-4f65-8b43-1b879ad4617a', -- some admin user
  '0a1c51a3-55dd-46b2-b894-c39c6d75557c'
);