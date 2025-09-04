-- DATABASE OPTIMIZATION: Add Missing Foreign Key Constraints and Indexes

-- 1. Add Foreign Key Constraints for Core Relationships
ALTER TABLE access_cards 
ADD CONSTRAINT fk_access_cards_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE access_cards 
ADD CONSTRAINT fk_access_cards_district_id 
FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE SET NULL;

ALTER TABLE access_logs 
ADD CONSTRAINT fk_access_logs_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE access_logs 
ADD CONSTRAINT fk_access_logs_card_id 
FOREIGN KEY (card_id) REFERENCES access_cards(id) ON DELETE SET NULL;

-- Announcements relationships
ALTER TABLE announcements 
ADD CONSTRAINT fk_announcements_author_id 
FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE announcements 
ADD CONSTRAINT fk_announcements_district_id 
FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE;

ALTER TABLE announcements 
ADD CONSTRAINT fk_announcements_community_id 
FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE;

-- Announcement related tables
ALTER TABLE announcement_bookmarks 
ADD CONSTRAINT fk_announcement_bookmarks_announcement_id 
FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE;

ALTER TABLE announcement_bookmarks 
ADD CONSTRAINT fk_announcement_bookmarks_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE announcement_comments 
ADD CONSTRAINT fk_announcement_comments_announcement_id 
FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE;

ALTER TABLE announcement_comments 
ADD CONSTRAINT fk_announcement_comments_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE announcement_comments 
ADD CONSTRAINT fk_announcement_comments_parent_id 
FOREIGN KEY (parent_comment_id) REFERENCES announcement_comments(id) ON DELETE CASCADE;

-- Bookings relationships
ALTER TABLE bookings 
ADD CONSTRAINT fk_bookings_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE bookings 
ADD CONSTRAINT fk_bookings_facility_id 
FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE;

ALTER TABLE bookings 
ADD CONSTRAINT fk_bookings_approved_by 
FOREIGN KEY (approved_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Chat system relationships
ALTER TABLE chat_rooms 
ADD CONSTRAINT fk_chat_rooms_created_by 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE chat_room_members 
ADD CONSTRAINT fk_chat_room_members_room_id 
FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE;

ALTER TABLE chat_room_members 
ADD CONSTRAINT fk_chat_room_members_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE chat_messages 
ADD CONSTRAINT fk_chat_messages_room_id 
FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE;

ALTER TABLE chat_messages 
ADD CONSTRAINT fk_chat_messages_sender_id 
FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Add Strategic Indexes for Performance

-- User-based queries (most common access pattern)
CREATE INDEX CONCURRENTLY idx_access_cards_user_district ON access_cards(user_id, district_id) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_access_logs_user_time ON access_logs(user_id, access_time DESC);
CREATE INDEX CONCURRENTLY idx_bookings_user_status ON bookings(user_id, status, booking_date);

-- District-based queries
CREATE INDEX CONCURRENTLY idx_announcements_district_published ON announcements(district_id, is_published, publish_at) WHERE is_published = true;
CREATE INDEX CONCURRENTLY idx_community_activities_district_published ON community_activities(district_id, is_published, date_time) WHERE is_published = true;

-- Time-based queries
CREATE INDEX CONCURRENTLY idx_announcements_expire_time ON announcements(expire_at) WHERE expire_at IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_notifications_recipient_time ON notifications(recipient_id, created_at DESC, is_read);

-- Chat performance indexes
CREATE INDEX CONCURRENTLY idx_chat_messages_room_time ON chat_messages(room_id, created_at DESC) WHERE is_deleted = false;
CREATE INDEX CONCURRENTLY idx_chat_room_members_user_active ON chat_room_members(user_id, room_id) WHERE room_id IN (SELECT id FROM chat_rooms WHERE is_active = true);

-- Marketplace performance
CREATE INDEX CONCURRENTLY idx_marketplace_items_category_active ON marketplace_items(category, is_active, created_at DESC) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_orders_user_status_date ON orders(user_id, status, created_at DESC);

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

-- 4. Improve Normalization - Create lookup tables for categories

CREATE TABLE IF NOT EXISTS announcement_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color_code TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marketplace_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_category_id UUID REFERENCES marketplace_categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert common categories
INSERT INTO announcement_categories (name, description, color_code) VALUES
('general', 'General announcements', '#3B82F6'),
('maintenance', 'Maintenance related announcements', '#EF4444'),
('emergency', 'Emergency announcements', '#DC2626'),
('event', 'Event announcements', '#10B981'),
('policy', 'Policy updates', '#8B5CF6')
ON CONFLICT (name) DO NOTHING;

INSERT INTO marketplace_categories (name, description) VALUES
('electronics', 'Electronic items and gadgets'),
('furniture', 'Furniture and home decor'),
('clothing', 'Clothing and accessories'),
('books', 'Books and educational materials'),
('services', 'Service offerings'),
('food', 'Food and beverages'),
('sports', 'Sports and recreational items'),
('automotive', 'Automotive related items')
ON CONFLICT (name) DO NOTHING;

-- 5. Add RLS Policies for new tables
ALTER TABLE announcement_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active categories" ON announcement_categories
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage announcement categories" ON announcement_categories
FOR ALL USING (has_enhanced_role('community_admin') OR has_enhanced_role('district_coordinator') OR has_enhanced_role('state_admin'));

CREATE POLICY "Everyone can view active marketplace categories" ON marketplace_categories
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage marketplace categories" ON marketplace_categories
FOR ALL USING (has_enhanced_role('community_admin') OR has_enhanced_role('district_coordinator') OR has_enhanced_role('state_admin'));