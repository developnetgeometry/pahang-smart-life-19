-- Fix the room_type constraint to allow 'direct' type
ALTER TABLE chat_rooms DROP CONSTRAINT IF EXISTS chat_rooms_room_type_check;

-- Add the correct check constraint that allows 'direct' type
ALTER TABLE chat_rooms 
ADD CONSTRAINT chat_rooms_room_type_check 
CHECK (room_type IN ('group', 'direct', 'channel', 'broadcast'));