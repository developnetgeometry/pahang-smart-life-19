-- DATABASE OPTIMIZATION: Safe Performance Improvements

-- 1. Add Strategic Performance Indexes Only
CREATE INDEX IF NOT EXISTS idx_access_cards_user_active 
ON access_cards(user_id) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_access_logs_user_time 
ON access_logs(user_id, access_time DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_user_date 
ON bookings(user_id, booking_date DESC);

CREATE INDEX IF NOT EXISTS idx_announcements_district_time 
ON announcements(district_id, created_at DESC) WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_chat_messages_room_time 
ON chat_messages(room_id, created_at DESC) WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read 
ON notifications(recipient_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketplace_items_active 
ON marketplace_items(is_active, created_at DESC) WHERE is_active = true;

-- 2. Add Category Lookup Tables (Simple Structure)
CREATE TABLE IF NOT EXISTS announcement_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marketplace_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, 
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Enable RLS for new tables
ALTER TABLE announcement_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_categories ENABLE ROW LEVEL SECURITY;

-- 4. Add RLS Policies
CREATE POLICY "view_announcement_categories" ON announcement_categories 
FOR SELECT USING (is_active = true);

CREATE POLICY "manage_announcement_categories" ON announcement_categories 
FOR ALL USING (
    has_enhanced_role('community_admin') OR 
    has_enhanced_role('district_coordinator') OR 
    has_enhanced_role('state_admin')
);

CREATE POLICY "view_marketplace_categories" ON marketplace_categories 
FOR SELECT USING (is_active = true);

CREATE POLICY "manage_marketplace_categories" ON marketplace_categories 
FOR ALL USING (
    has_enhanced_role('community_admin') OR 
    has_enhanced_role('district_coordinator') OR 
    has_enhanced_role('state_admin')
);

-- 5. Insert Basic Categories (Only Required Columns)
INSERT INTO announcement_categories (name, description) VALUES
('general', 'General community announcements'),
('maintenance', 'Maintenance and repair notices'),
('emergency', 'Emergency alerts and notifications'),
('event', 'Community events and activities'),
('policy', 'Policy changes and updates')
ON CONFLICT (name) DO NOTHING;

INSERT INTO marketplace_categories (name, description) VALUES
('electronics', 'Electronic devices and gadgets'),
('furniture', 'Furniture and home decor'),
('clothing', 'Clothing and accessories'),
('books', 'Books and educational materials'),
('services', 'Professional services'),
('automotive', 'Automotive items and services')
ON CONFLICT (name) DO NOTHING;