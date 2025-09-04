-- DATABASE OPTIMIZATION: Core Performance and Normalization Improvements

-- 1. Strategic Performance Indexes
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

-- 2. Create Category Lookup Tables for Better Normalization
CREATE TABLE IF NOT EXISTS announcement_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color_code TEXT DEFAULT '#3B82F6',
    icon TEXT DEFAULT 'bell',
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marketplace_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT DEFAULT 'tag',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Insert Common Categories
INSERT INTO announcement_categories (name, description, color_code, icon, sort_order) VALUES
('general', 'General community announcements', '#3B82F6', 'bell', 1),
('maintenance', 'Maintenance and repair notices', '#EF4444', 'wrench', 2),
('emergency', 'Emergency alerts', '#DC2626', 'alert-triangle', 3),
('event', 'Community events', '#10B981', 'calendar', 4),
('policy', 'Policy updates', '#8B5CF6', 'file-text', 5)
ON CONFLICT (name) DO NOTHING;

INSERT INTO marketplace_categories (name, description, icon, sort_order) VALUES
('electronics', 'Electronic devices', 'smartphone', 1),
('furniture', 'Furniture items', 'home', 2),
('clothing', 'Clothing & accessories', 'shirt', 3),
('books', 'Books & education', 'book', 4),
('services', 'Services offered', 'briefcase', 5),
('automotive', 'Car related items', 'car', 6)
ON CONFLICT (name) DO NOTHING;

-- 4. Enable RLS
ALTER TABLE announcement_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_categories ENABLE ROW LEVEL SECURITY;

-- 5. Add Basic RLS Policies
CREATE POLICY "view_announcement_categories" ON announcement_categories FOR SELECT USING (is_active = true);
CREATE POLICY "manage_announcement_categories" ON announcement_categories FOR ALL USING (
    has_enhanced_role('community_admin') OR 
    has_enhanced_role('district_coordinator') OR 
    has_enhanced_role('state_admin')
);

CREATE POLICY "view_marketplace_categories" ON marketplace_categories FOR SELECT USING (is_active = true);
CREATE POLICY "manage_marketplace_categories" ON marketplace_categories FOR ALL USING (
    has_enhanced_role('community_admin') OR 
    has_enhanced_role('district_coordinator') OR 
    has_enhanced_role('state_admin')
);