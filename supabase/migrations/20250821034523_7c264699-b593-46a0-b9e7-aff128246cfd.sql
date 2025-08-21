-- Fix RLS policy for chat_room_members to allow room creators to add members
DROP POLICY IF EXISTS "Users can join rooms they are invited to" ON public.chat_room_members;

-- Allow room creators to add members when creating a room
CREATE POLICY "Users can manage room membership" ON public.chat_room_members
FOR INSERT 
WITH CHECK (
  -- Users can add themselves to any room
  user_id = auth.uid() 
  OR 
  -- Room creators can add members to rooms they created
  EXISTS (
    SELECT 1 FROM chat_rooms cr 
    WHERE cr.id = room_id 
    AND cr.created_by = auth.uid()
  )
  OR
  -- Room admins can add members
  user_is_room_admin(room_id)
);