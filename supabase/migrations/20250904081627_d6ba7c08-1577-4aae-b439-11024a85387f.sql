-- DATABASE OPTIMIZATION: Essential Performance Indexes Only

-- Add strategic performance indexes for most common query patterns
CREATE INDEX IF NOT EXISTS idx_access_cards_user_active 
ON access_cards(user_id) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_access_logs_user_time 
ON access_logs(user_id, access_time DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_user_date 
ON bookings(user_id, booking_date DESC);

CREATE INDEX IF NOT EXISTS idx_announcements_district_published 
ON announcements(district_id, created_at DESC) WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_chat_messages_room_recent 
ON chat_messages(room_id, created_at DESC) WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON notifications(recipient_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_activities_district_active 
ON community_activities(district_id, date_time DESC) WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_marketplace_items_active 
ON marketplace_items(is_active, created_at DESC) WHERE is_active = true;

-- Add composite indexes for common join patterns
CREATE INDEX IF NOT EXISTS idx_chat_room_members_user_room 
ON chat_room_members(user_id, room_id);

CREATE INDEX IF NOT EXISTS idx_announcement_bookmarks_user 
ON announcement_bookmarks(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_booking_approvals_status 
ON booking_approvals(approval_status, created_at DESC);

-- Add indexes for foreign key lookups to improve join performance
CREATE INDEX IF NOT EXISTS idx_profiles_district 
ON profiles(district_id);

CREATE INDEX IF NOT EXISTS idx_profiles_community 
ON profiles(community_id);

CREATE INDEX IF NOT EXISTS idx_enhanced_user_roles_user 
ON enhanced_user_roles(user_id) WHERE is_active = true;