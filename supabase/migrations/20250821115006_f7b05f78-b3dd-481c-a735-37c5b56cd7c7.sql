-- Add image column to facilities table
ALTER TABLE public.facilities 
ADD COLUMN image TEXT;

-- Update existing facilities with the generated images
UPDATE public.facilities 
SET image = CASE 
  WHEN LOWER(name) LIKE '%gym%' OR LOWER(name) LIKE '%gim%' THEN 'community-gym.jpg'
  WHEN LOWER(name) LIKE '%pool%' OR LOWER(name) LIKE '%kolam%' THEN 'swimming-pool.jpg' 
  WHEN LOWER(name) LIKE '%hall%' OR LOWER(name) LIKE '%dewan%' THEN 'function-hall.jpg'
  ELSE NULL
END;