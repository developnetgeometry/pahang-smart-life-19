-- Fix security warning by setting search_path for the functions
CREATE OR REPLACE FUNCTION get_announcement_title(
  p_title_en text,
  p_title_ms text,
  p_title_fallback text,
  p_language text DEFAULT 'ms'
) RETURNS text
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = 'public'
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
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT CASE 
    WHEN p_language = 'en' AND p_content_en IS NOT NULL AND p_content_en != '' THEN p_content_en
    WHEN p_language = 'ms' AND p_content_ms IS NOT NULL AND p_content_ms != '' THEN p_content_ms
    WHEN p_content_en IS NOT NULL AND p_content_en != '' THEN p_content_en
    WHEN p_content_ms IS NOT NULL AND p_content_ms != '' THEN p_content_ms
    ELSE p_content_fallback
  END;
$$;