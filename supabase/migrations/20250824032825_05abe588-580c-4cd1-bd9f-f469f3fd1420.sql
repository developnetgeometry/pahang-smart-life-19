-- Update community activities with proper public image URLs
UPDATE community_activities 
SET image_url = 'https://hjhalygcsdolryngmlry.supabase.co/storage/v1/object/public/activity-images/chinese-new-year-celebration.jpg'
WHERE title = 'Chinese New Year Celebration';

UPDATE community_activities 
SET image_url = 'https://hjhalygcsdolryngmlry.supabase.co/storage/v1/object/public/activity-images/badminton-tournament.jpg'
WHERE title = 'Community Badminton Tournament';

UPDATE community_activities 
SET image_url = 'https://hjhalygcsdolryngmlry.supabase.co/storage/v1/object/public/activity-images/gotong-royong-day.jpg'
WHERE title = 'Gotong-Royong Day';

UPDATE community_activities 
SET image_url = 'https://hjhalygcsdolryngmlry.supabase.co/storage/v1/object/public/activity-images/swimming-pool-hours.jpg'
WHERE title = 'New Swimming Pool Hours';

UPDATE community_activities 
SET image_url = 'https://hjhalygcsdolryngmlry.supabase.co/storage/v1/object/public/activity-images/health-fitness-workshop.jpg'
WHERE title = 'Health & Fitness Workshop';