-- First, identify and handle existing duplicates by making them inactive and renaming them
UPDATE communities 
SET 
  is_active = false,
  name = name || ' (Duplicate ' || id::text || ')',
  updated_at = now()
WHERE id IN (
  SELECT c1.id 
  FROM communities c1
  JOIN communities c2 ON c1.district_id = c2.district_id 
    AND lower(trim(c1.name)) = lower(trim(c2.name))
    AND c1.id > c2.id
);

-- Add is_active column if it doesn't exist
ALTER TABLE communities ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Create unique index to prevent duplicate community names within the same district
CREATE UNIQUE INDEX IF NOT EXISTS idx_communities_unique_name_per_district 
ON communities (district_id, lower(trim(name))) 
WHERE is_active = true;