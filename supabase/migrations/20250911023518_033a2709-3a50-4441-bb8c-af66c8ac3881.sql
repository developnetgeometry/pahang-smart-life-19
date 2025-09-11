-- Add is_active column first
ALTER TABLE communities ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Update all existing records to be active by default
UPDATE communities SET is_active = true WHERE is_active IS NULL;

-- Handle existing duplicates by making them inactive and renaming them
WITH duplicates AS (
  SELECT c1.id 
  FROM communities c1
  JOIN communities c2 ON c1.district_id = c2.district_id 
    AND lower(trim(c1.name)) = lower(trim(c2.name))
    AND c1.id > c2.id
)
UPDATE communities 
SET 
  is_active = false,
  name = name || ' (Duplicate-' || substring(id::text, 1, 8) || ')',
  updated_at = now()
WHERE id IN (SELECT id FROM duplicates);

-- Create unique index to prevent duplicate community names within the same district
CREATE UNIQUE INDEX IF NOT EXISTS idx_communities_unique_name_per_district 
ON communities (district_id, lower(trim(name))) 
WHERE is_active = true;