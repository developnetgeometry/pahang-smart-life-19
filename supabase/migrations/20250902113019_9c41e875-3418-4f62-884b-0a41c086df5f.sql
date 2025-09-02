-- Fix security issue by setting search_path for the notification function
CREATE OR REPLACE FUNCTION public.notify_discussion_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  discussion_owner_id UUID;
  discussion_title TEXT;
  author_name TEXT;
BEGIN
  -- Get the discussion owner and title
  SELECT author_id, title INTO discussion_owner_id, discussion_title
  FROM discussions 
  WHERE id = NEW.discussion_id;
  
  -- Don't notify if the reply author is the discussion owner
  IF discussion_owner_id = NEW.author_id THEN
    RETURN NEW;
  END IF;
  
  -- Get the reply author's name
  SELECT COALESCE(full_name, email, 'Anonymous') INTO author_name
  FROM profiles 
  WHERE id = NEW.author_id;
  
  -- Insert notification for the discussion owner
  INSERT INTO notifications (
    recipient_id,
    title,
    message,
    notification_type,
    category,
    reference_id,
    reference_table,
    created_by,
    sent_at
  ) VALUES (
    discussion_owner_id,
    'New reply in your discussion',
    CONCAT(author_name, ' replied to your discussion "', discussion_title, '"'),
    'discussion_reply',
    'discussion',
    NEW.discussion_id,
    'discussions',
    NEW.author_id,
    NOW()
  );
  
  RETURN NEW;
END;
$function$;