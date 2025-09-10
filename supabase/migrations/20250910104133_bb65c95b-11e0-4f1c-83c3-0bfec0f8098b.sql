-- Add unique constraint on district names (case-insensitive, trimmed)
CREATE UNIQUE INDEX IF NOT EXISTS idx_districts_name_ci_unique 
ON public.districts (lower(trim(name)));