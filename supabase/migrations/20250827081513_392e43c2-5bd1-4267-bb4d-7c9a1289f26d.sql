-- Add multilingual support to announcements
ALTER TABLE public.announcements 
ADD COLUMN title_en text,
ADD COLUMN title_ms text,
ADD COLUMN content_en text,
ADD COLUMN content_ms text;

-- Update existing announcements to populate the appropriate language field
-- For now, we'll assume existing announcements are in Malay and set them accordingly
UPDATE public.announcements 
SET 
  title_ms = title,
  content_ms = content
WHERE title_ms IS NULL;

-- Create a function to get localized announcement content
CREATE OR REPLACE FUNCTION get_announcement_title(
  p_title_en text,
  p_title_ms text,
  p_title_fallback text,
  p_language text DEFAULT 'ms'
) RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE 
    WHEN p_language = 'en' AND p_title_en IS NOT NULL AND p_title_en != '' THEN p_title_en
    WHEN p_language = 'ms' AND p_title_ms IS NOT NULL AND p_title_ms != '' THEN p_title_ms
    WHEN p_title_en IS NOT NULL AND p_title_en != '' THEN p_title_en
    WHEN p_title_ms IS NOT NULL AND p_title_ms != '' THEN p_title_ms
    ELSE p_title_fallback
  END;
$$;

CREATE OR REPLACE FUNCTION get_announcement_content(
  p_content_en text,
  p_content_ms text,
  p_content_fallback text,
  p_language text DEFAULT 'ms'
) RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE 
    WHEN p_language = 'en' AND p_content_en IS NOT NULL AND p_content_en != '' THEN p_content_en
    WHEN p_language = 'ms' AND p_content_ms IS NOT NULL AND p_content_ms != '' THEN p_content_ms
    WHEN p_content_en IS NOT NULL AND p_content_en != '' THEN p_content_en
    WHEN p_content_ms IS NOT NULL AND p_content_ms != '' THEN p_content_ms
    ELSE p_content_fallback
  END;
$$;