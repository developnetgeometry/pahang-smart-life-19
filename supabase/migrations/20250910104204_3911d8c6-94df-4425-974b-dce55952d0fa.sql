-- Remove duplicate district names keeping the oldest record
WITH duplicates AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY lower(trim(name)) ORDER BY created_at ASC) as rn
  FROM public.districts
)
DELETE FROM public.districts 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Add unique constraint on district names (case-insensitive, trimmed)
CREATE UNIQUE INDEX IF NOT EXISTS idx_districts_name_ci_unique 
ON public.districts (lower(trim(name)));