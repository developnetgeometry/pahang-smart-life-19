-- Fix the infinite recursion in chat_room_members policies
-- First, drop the problematic policies
DROP POLICY IF EXISTS "Users can view members of their rooms" ON chat_room_members;
DROP POLICY IF EXISTS "Room admins can manage members" ON chat_room_members;

-- Create security definer function to check room membership without recursion
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

-- Create security definer function to check if user is room admin
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

-- Recreate policies using the security definer functions
CREATE POLICY "Users can view members of rooms they belong to" 
ON public.chat_room_members 
FOR SELECT 
USING (user_is_room_member(room_id));

CREATE POLICY "Users can join rooms" 
ON public.chat_room_members 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Room admins can manage members" 
ON public.chat_room_members 
FOR ALL 
USING (user_is_room_admin(room_id) OR user_id = auth.uid());

-- Check and fix room_type constraint
-- First check what values are allowed
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%room_type%';

-- Drop the existing check constraint if it exists
ALTER TABLE chat_rooms DROP CONSTRAINT IF EXISTS chat_rooms_room_type_check;

-- Add the correct check constraint that allows 'direct' type
ALTER TABLE chat_rooms 
ADD CONSTRAINT chat_rooms_room_type_check 
CHECK (room_type IN ('group', 'direct', 'channel', 'broadcast'));