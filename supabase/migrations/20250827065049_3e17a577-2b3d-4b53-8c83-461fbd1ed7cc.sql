-- Add image_url field to announcements table
ALTER TABLE public.announcements 
ADD COLUMN image_url TEXT;

-- Add some sample images to existing announcements for demo
UPDATE public.announcements 
SET image_url = '/activity-images/gotong-royong-day.jpg' 
WHERE type = 'general' AND image_url IS NULL;

UPDATE public.announcements 
SET image_url = '/activity-images/health-fitness-workshop.jpg' 
WHERE type = 'maintenance' AND image_url IS NULL;

UPDATE public.announcements 
SET image_url = '/activity-images/chinese-new-year-celebration.jpg' 
WHERE type = 'event' AND image_url IS NULL;