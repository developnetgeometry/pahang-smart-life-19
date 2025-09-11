-- Add database indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_enhanced_user_roles_user_active 
ON enhanced_user_roles(user_id, is_active) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_community_features_community_enabled 
ON community_features(community_id, is_enabled) 
WHERE is_enabled = true;

CREATE INDEX IF NOT EXISTS idx_profiles_user_community 
ON profiles(user_id, community_id);

CREATE INDEX IF NOT EXISTS idx_profiles_community_district 
ON profiles(community_id, district_id);

-- Add composite index for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created 
ON notifications(user_id, is_read, created_at DESC);

-- Add index for chat messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created 
ON chat_messages(room_id, created_at DESC);

-- Add index for facility bookings
CREATE INDEX IF NOT EXISTS idx_bookings_facility_date 
ON facility_bookings(facility_id, booking_date, status);