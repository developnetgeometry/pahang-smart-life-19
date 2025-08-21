-- Drop all existing policies on chat_room_members to start fresh
DROP POLICY IF EXISTS "Users can view members of their rooms" ON chat_room_members;
DROP POLICY IF EXISTS "Users can join rooms" ON chat_room_members;  
DROP POLICY IF EXISTS "Room admins can manage members" ON chat_room_members;
DROP POLICY IF EXISTS "Users can view members of rooms they belong to" ON chat_room_members;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.user_is_room_member(check_room_id UUID, check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM chat_room_members 
    WHERE room_id = check_room_id 
    AND user_id = check_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.user_is_room_admin(check_room_id UUID, check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER  
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM chat_room_members 
    WHERE room_id = check_room_id 
    AND user_id = check_user_id 
    AND is_admin = true
  );
$$;

-- Create new policies without recursion
CREATE POLICY "Members can view room membership" 
ON public.chat_room_members 
FOR SELECT 
USING (user_is_room_member(room_id));

CREATE POLICY "Users can join rooms they are invited to" 
ON public.chat_room_members 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Room admins and members can manage membership" 
ON public.chat_room_members 
FOR ALL 
USING (user_is_room_admin(room_id) OR user_id = auth.uid());