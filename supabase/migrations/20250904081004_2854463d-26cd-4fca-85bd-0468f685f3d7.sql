-- DATABASE OPTIMIZATION: Add Performance Indexes and Data Integrity Constraints

-- 2. Add Strategic Indexes for Performance

-- User-based queries (most common access pattern)
CREATE INDEX idx_access_cards_user_district ON access_cards(user_id, district_id) WHERE is_active = true;
CREATE INDEX idx_access_logs_user_time ON access_logs(user_id, access_time DESC);
CREATE INDEX idx_bookings_user_status ON bookings(user_id, status, booking_date);

-- District-based queries
CREATE INDEX idx_announcements_district_published ON announcements(district_id, is_published, publish_at) WHERE is_published = true;
CREATE INDEX idx_community_activities_district_published ON community_activities(district_id, is_published, date_time) WHERE is_published = true;

-- Time-based queries
CREATE INDEX idx_announcements_expire_time ON announcements(expire_at) WHERE expire_at IS NOT NULL;
CREATE INDEX idx_notifications_recipient_time ON notifications(recipient_id, created_at DESC, is_read);

-- Chat performance indexes
CREATE INDEX idx_chat_messages_room_time ON chat_messages(room_id, created_at DESC) WHERE is_deleted = false;

-- Marketplace performance
CREATE INDEX idx_marketplace_items_category_active ON marketplace_items(category, is_active, created_at DESC) WHERE is_active = true;
CREATE INDEX idx_orders_user_status_date ON orders(user_id, status, created_at DESC);

-- 3. Add Data Integrity Constraints

-- Ensure valid date ranges
ALTER TABLE announcements 
ADD CONSTRAINT chk_announcements_date_range 
CHECK (expire_at IS NULL OR expire_at > publish_at);

ALTER TABLE bookings 
ADD CONSTRAINT chk_bookings_time_range 
CHECK (end_time > start_time);

ALTER TABLE community_activities 
ADD CONSTRAINT chk_activities_time_range 
CHECK (end_time IS NULL OR end_time > date_time);

-- Ensure positive values
ALTER TABLE marketplace_items 
ADD CONSTRAINT chk_marketplace_items_positive_price 
CHECK (price >= 0);

ALTER TABLE marketplace_items 
ADD CONSTRAINT chk_marketplace_items_positive_stock 
CHECK (stock_quantity >= 0);