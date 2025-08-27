-- Update announcements that don't have images yet
UPDATE announcements 
SET image_url = CASE 
  WHEN title LIKE '%Security%' OR title LIKE '%Keselamatan%' THEN '/activity-images/swimming-pool-hours.jpg'
  WHEN title LIKE '%Patrol%' THEN '/activity-images/badminton-tournament.jpg'
  ELSE '/activity-images/chinese-new-year-celebration.jpg'
END
WHERE image_url IS NULL;