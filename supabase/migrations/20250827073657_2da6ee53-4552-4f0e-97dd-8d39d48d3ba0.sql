-- Remove duplicate announcements, keeping only the oldest one for each title
WITH ranked_announcements AS (
  SELECT id, title, 
         ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at ASC) as rn
  FROM announcements
)
DELETE FROM announcements 
WHERE id IN (
  SELECT id FROM ranked_announcements WHERE rn > 1
);