-- Set up single community system - step by step approach
-- Assign all users to Prima Pahang community

-- First, update all users to belong to the default community
UPDATE profiles 
SET community_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
WHERE community_id IS NULL;