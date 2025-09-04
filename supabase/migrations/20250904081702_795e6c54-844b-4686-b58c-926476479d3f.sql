-- DATABASE OPTIMIZATION: Essential Performance Indexes Only

-- Add only the most critical performance indexes that are likely missing
CREATE INDEX IF NOT EXISTS idx_access_cards_user_lookup 
ON access_cards(user_id) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_access_logs_user_lookup 
ON access_logs(user_id, access_time DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_user_lookup 
ON bookings(user_id, booking_date DESC);

CREATE INDEX IF NOT EXISTS idx_announcements_district_lookup 
ON announcements(district_id, created_at DESC) WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_chat_messages_room_lookup 
ON chat_messages(room_id, created_at DESC) WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_lookup 
ON notifications(recipient_id, is_read, created_at DESC);