-- Create enhanced chat features tables

-- Create voice messages table
CREATE TABLE IF NOT EXISTS voice_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  transcript TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_deleted BOOLEAN DEFAULT false
);

-- Create file shares table
CREATE TABLE IF NOT EXISTS file_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_deleted BOOLEAN DEFAULT false
);

-- Create message reactions table
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(message_id, user_id, reaction_emoji)
);

-- Create video calls table
CREATE TABLE IF NOT EXISTS video_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  initiated_by UUID NOT NULL,
  call_type TEXT NOT NULL DEFAULT 'video', -- 'video', 'audio', 'screen_share'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'ended', 'missed'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  participants JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  chat_messages BOOLEAN DEFAULT true,
  voice_messages BOOLEAN DEFAULT true,
  video_calls BOOLEAN DEFAULT true,
  mentions BOOLEAN DEFAULT true,
  announcements BOOLEAN DEFAULT true,
  marketing BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user presence table for real-time status
CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'offline', -- 'online', 'away', 'busy', 'offline'
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  current_room_id UUID REFERENCES chat_rooms(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create typing indicators table
CREATE TABLE IF NOT EXISTS typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Create communication analytics table
CREATE TABLE IF NOT EXISTS communication_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  room_id UUID REFERENCES chat_rooms(id),
  event_type TEXT NOT NULL, -- 'message_sent', 'voice_message', 'file_shared', 'video_call', 'reaction_added'
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE voice_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for voice_messages
CREATE POLICY "Users can view voice messages in accessible rooms" ON voice_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_rooms cr 
    WHERE cr.id = voice_messages.room_id 
    AND (cr.district_id = get_user_district() OR NOT cr.is_private)
  )
);

CREATE POLICY "Users can create voice messages" ON voice_messages
FOR INSERT WITH CHECK (sender_id = auth.uid());

-- RLS Policies for file_shares
CREATE POLICY "Users can view file shares in accessible rooms" ON file_shares
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_rooms cr 
    WHERE cr.id = file_shares.room_id 
    AND (cr.district_id = get_user_district() OR NOT cr.is_private)
  )
);

CREATE POLICY "Users can create file shares" ON file_shares
FOR INSERT WITH CHECK (sender_id = auth.uid());

-- RLS Policies for message_reactions
CREATE POLICY "Users can view reactions in accessible rooms" ON message_reactions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_messages cm 
    JOIN chat_rooms cr ON cr.id = cm.room_id 
    WHERE cm.id = message_reactions.message_id 
    AND (cr.district_id = get_user_district() OR NOT cr.is_private)
  )
);

CREATE POLICY "Users can manage their own reactions" ON message_reactions
FOR ALL USING (user_id = auth.uid());

-- RLS Policies for video_calls
CREATE POLICY "Users can view video calls in accessible rooms" ON video_calls
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_rooms cr 
    WHERE cr.id = video_calls.room_id 
    AND (cr.district_id = get_user_district() OR NOT cr.is_private)
  )
);

CREATE POLICY "Users can create video calls" ON video_calls
FOR INSERT WITH CHECK (initiated_by = auth.uid());

-- RLS Policies for notification_preferences
CREATE POLICY "Users can manage their own notification preferences" ON notification_preferences
FOR ALL USING (user_id = auth.uid());

-- RLS Policies for user_presence
CREATE POLICY "Everyone can view user presence" ON user_presence
FOR SELECT USING (true);

CREATE POLICY "Users can update their own presence" ON user_presence
FOR ALL USING (user_id = auth.uid());

-- RLS Policies for typing_indicators
CREATE POLICY "Users can view typing indicators in accessible rooms" ON typing_indicators
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_rooms cr 
    WHERE cr.id = typing_indicators.room_id 
    AND (cr.district_id = get_user_district() OR NOT cr.is_private)
  )
);

CREATE POLICY "Users can manage their own typing indicators" ON typing_indicators
FOR ALL USING (user_id = auth.uid());

-- RLS Policies for communication_analytics
CREATE POLICY "Users can view their own analytics" ON communication_analytics
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own analytics" ON communication_analytics
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all analytics" ON communication_analytics
FOR SELECT USING (
  has_role('admin'::user_role) OR 
  has_role('state_admin'::user_role) OR 
  has_role('district_coordinator'::user_role) OR 
  has_role('community_admin'::user_role)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_voice_messages_room_id ON voice_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_file_shares_room_id ON file_shares(room_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_room_id ON video_calls(room_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_room_id ON typing_indicators(room_id);
CREATE INDEX IF NOT EXISTS idx_communication_analytics_user_id ON communication_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_status ON user_presence(status);

-- Create functions for real-time features
CREATE OR REPLACE FUNCTION update_user_presence(
  p_user_id UUID,
  p_status TEXT,
  p_room_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_presence (user_id, status, current_room_id, updated_at)
  VALUES (p_user_id, p_status, p_room_id, now())
  ON CONFLICT (user_id)
  DO UPDATE SET
    status = EXCLUDED.status,
    current_room_id = EXCLUDED.current_room_id,
    updated_at = EXCLUDED.updated_at,
    last_seen = CASE 
      WHEN EXCLUDED.status = 'offline' THEN now()
      ELSE user_presence.last_seen
    END;
END;
$$;

-- Create function to clean up old typing indicators
CREATE OR REPLACE FUNCTION cleanup_old_typing_indicators()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM typing_indicators
  WHERE started_at < now() - INTERVAL '10 seconds';
END;
$$;

-- Add realtime publication for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE voice_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE file_shares;
ALTER PUBLICATION supabase_realtime ADD TABLE message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE video_calls;
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE typing_indicators;

-- Enable replica identity for realtime updates
ALTER TABLE voice_messages REPLICA IDENTITY FULL;
ALTER TABLE file_shares REPLICA IDENTITY FULL;
ALTER TABLE message_reactions REPLICA IDENTITY FULL;
ALTER TABLE video_calls REPLICA IDENTITY FULL;
ALTER TABLE user_presence REPLICA IDENTITY FULL;
ALTER TABLE typing_indicators REPLICA IDENTITY FULL;