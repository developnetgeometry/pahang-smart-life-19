-- Fix search_path for the create_direct_chat function
CREATE OR REPLACE FUNCTION public.create_direct_chat(other_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_room_id UUID;
  new_room_id UUID;
  other_user_name TEXT;
BEGIN
  -- Check if direct chat already exists between these users
  SELECT cr.id INTO existing_room_id
  FROM chat_rooms cr
  JOIN chat_room_members crm1 ON cr.id = crm1.room_id
  JOIN chat_room_members crm2 ON cr.id = crm2.room_id
  WHERE cr.room_type = 'direct'
    AND crm1.user_id = auth.uid()
    AND crm2.user_id = other_user_id
    AND (SELECT COUNT(*) FROM chat_room_members WHERE room_id = cr.id) = 2;

  IF existing_room_id IS NOT NULL THEN
    RETURN existing_room_id;
  END IF;

  -- Get other user's name for room name
  SELECT full_name INTO other_user_name 
  FROM profiles 
  WHERE id = other_user_id;

  -- Create new direct chat room
  INSERT INTO chat_rooms (name, room_type, is_private, created_by, max_members)
  VALUES (COALESCE(other_user_name, 'Direct Chat'), 'direct', true, auth.uid(), 2)
  RETURNING id INTO new_room_id;

  -- Add both users to the room
  INSERT INTO chat_room_members (room_id, user_id, is_admin)
  VALUES 
    (new_room_id, auth.uid(), true),
    (new_room_id, other_user_id, false);

  RETURN new_room_id;
END;
$$;