-- Create chat room members table to track who's in each room
CREATE TABLE public.chat_room_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_admin BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(room_id, user_id)
);

-- Enable RLS on chat room members
ALTER TABLE public.chat_room_members ENABLE ROW LEVEL SECURITY;

-- Users can view members of rooms they're in
CREATE POLICY "Users can view members of their rooms" 
ON public.chat_room_members 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM chat_room_members crm2 
  WHERE crm2.room_id = chat_room_members.room_id 
  AND crm2.user_id = auth.uid()
));

-- Users can join rooms (insert membership)
CREATE POLICY "Users can join rooms" 
ON public.chat_room_members 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Room admins can manage members
CREATE POLICY "Room admins can manage members" 
ON public.chat_room_members 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM chat_room_members crm2 
  WHERE crm2.room_id = chat_room_members.room_id 
  AND crm2.user_id = auth.uid() 
  AND crm2.is_admin = true
));

-- Update chat_rooms policies to work with membership
DROP POLICY "Users can view chat rooms in their district" ON chat_rooms;
DROP POLICY "Users can create chat rooms" ON chat_rooms;

-- Users can view rooms they're members of
CREATE POLICY "Users can view their chat rooms" 
ON public.chat_rooms 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM chat_room_members crm 
  WHERE crm.room_id = chat_rooms.id 
  AND crm.user_id = auth.uid()
) OR NOT is_private);

-- Users can create chat rooms
CREATE POLICY "Users can create chat rooms" 
ON public.chat_rooms 
FOR INSERT 
WITH CHECK (created_by = auth.uid());

-- Update chat_messages policy to work with room membership
DROP POLICY "Users can view messages in accessible rooms" ON chat_messages;

-- Users can view messages in rooms they're members of
CREATE POLICY "Users can view messages in their rooms" 
ON public.chat_messages 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM chat_room_members crm 
  WHERE crm.room_id = chat_messages.room_id 
  AND crm.user_id = auth.uid()
));

-- Function to create a direct chat between two users
CREATE OR REPLACE FUNCTION public.create_direct_chat(other_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
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