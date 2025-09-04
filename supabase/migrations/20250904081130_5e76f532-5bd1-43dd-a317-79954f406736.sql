-- DATABASE OPTIMIZATION PHASE 2: Strategic Indexes and Data Integrity

-- 1. Add Strategic Performance Indexes (only if they don't exist)

-- User-based query optimization
DO $$ 
BEGIN
    -- Check and create user-district index for access cards
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_access_cards_user_district_active') THEN
        CREATE INDEX CONCURRENTLY idx_access_cards_user_district_active 
        ON access_cards(user_id, district_id) WHERE is_active = true;
    END IF;
    
    -- User access logs with time ordering
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_access_logs_user_time_desc') THEN
        CREATE INDEX CONCURRENTLY idx_access_logs_user_time_desc 
        ON access_logs(user_id, access_time DESC);
    END IF;
    
    -- Booking queries by user and status
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bookings_user_status_date') THEN
        CREATE INDEX CONCURRENTLY idx_bookings_user_status_date 
        ON bookings(user_id, status, booking_date);
    END IF;
END $$;

-- 2. District-based query optimization
DO $$ 
BEGIN
    -- Published announcements by district
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_announcements_district_published_time') THEN
        CREATE INDEX CONCURRENTLY idx_announcements_district_published_time 
        ON announcements(district_id, is_published, publish_at DESC) 
        WHERE is_published = true;
    END IF;
    
    -- Community activities by district
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_activities_district_published_time') THEN
        CREATE INDEX CONCURRENTLY idx_activities_district_published_time 
        ON community_activities(district_id, is_published, date_time DESC) 
        WHERE is_published = true;
    END IF;
END $$;

-- 3. Communication system optimization
DO $$ 
BEGIN
    -- Chat messages with room and time
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_chat_messages_room_time_active') THEN
        CREATE INDEX CONCURRENTLY idx_chat_messages_room_time_active 
        ON chat_messages(room_id, created_at DESC) 
        WHERE is_deleted = false;
    END IF;
    
    -- Notifications by recipient and status
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_recipient_unread') THEN
        CREATE INDEX CONCURRENTLY idx_notifications_recipient_unread 
        ON notifications(recipient_id, created_at DESC) 
        WHERE is_read = false;
    END IF;
END $$;

-- 4. Marketplace optimization
DO $$ 
BEGIN
    -- Active marketplace items by category
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_marketplace_items_active_category') THEN
        CREATE INDEX CONCURRENTLY idx_marketplace_items_active_category 
        ON marketplace_items(category, is_active, created_at DESC) 
        WHERE is_active = true;
    END IF;
    
    -- Orders by user and status
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_user_status_time') THEN
        CREATE INDEX CONCURRENTLY idx_orders_user_status_time 
        ON orders(user_id, status, created_at DESC);
    END IF;
END $$;

-- 5. Create lookup tables for better normalization
CREATE TABLE IF NOT EXISTS announcement_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color_code TEXT DEFAULT '#3B82F6',
    icon TEXT DEFAULT 'bell',
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marketplace_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_category_id UUID,
    icon TEXT DEFAULT 'tag',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add self-referencing foreign key for marketplace categories
ALTER TABLE marketplace_categories 
ADD CONSTRAINT fk_marketplace_categories_parent 
FOREIGN KEY (parent_category_id) REFERENCES marketplace_categories(id) ON DELETE SET NULL;

-- 6. Insert predefined categories
INSERT INTO announcement_categories (name, description, color_code, icon, sort_order) VALUES
('general', 'General community announcements', '#3B82F6', 'bell', 1),
('maintenance', 'Maintenance and repair notices', '#EF4444', 'wrench', 2),
('emergency', 'Emergency alerts and notifications', '#DC2626', 'alert-triangle', 3),
('event', 'Community events and activities', '#10B981', 'calendar', 4),
('policy', 'Policy changes and updates', '#8B5CF6', 'file-text', 5),
('facility', 'Facility bookings and availability', '#F59E0B', 'building', 6)
ON CONFLICT (name) DO NOTHING;

INSERT INTO marketplace_categories (name, description, icon, sort_order) VALUES
('electronics', 'Electronic devices and gadgets', 'smartphone', 1),
('furniture', 'Furniture and home decor items', 'home', 2),
('clothing', 'Clothing and fashion accessories', 'shirt', 3),
('books', 'Books and educational materials', 'book', 4),
('services', 'Professional and personal services', 'briefcase', 5),
('food', 'Food items and beverages', 'coffee', 6),
('sports', 'Sports equipment and accessories', 'activity', 7),
('automotive', 'Car parts and automotive services', 'car', 8),
('health', 'Health and wellness products', 'heart', 9),
('toys', 'Toys and games for children', 'gamepad2', 10)
ON CONFLICT (name) DO NOTHING;

-- 7. Enable RLS for new tables
ALTER TABLE announcement_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_categories ENABLE ROW LEVEL SECURITY;

-- 8. Add RLS policies
DROP POLICY IF EXISTS "Everyone can view active announcement categories" ON announcement_categories;
CREATE POLICY "Everyone can view active announcement categories" 
ON announcement_categories FOR SELECT 
USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage announcement categories" ON announcement_categories;
CREATE POLICY "Admins can manage announcement categories" 
ON announcement_categories FOR ALL 
USING (has_enhanced_role('community_admin') OR has_enhanced_role('district_coordinator') OR has_enhanced_role('state_admin'));

DROP POLICY IF EXISTS "Everyone can view active marketplace categories" ON marketplace_categories;
CREATE POLICY "Everyone can view active marketplace categories" 
ON marketplace_categories FOR SELECT 
USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage marketplace categories" ON marketplace_categories;
CREATE POLICY "Admins can manage marketplace categories" 
ON marketplace_categories FOR ALL 
USING (has_enhanced_role('community_admin') OR has_enhanced_role('district_coordinator') OR has_enhanced_role('state_admin'));

-- 9. Add data validation constraints where missing
DO $$
BEGIN
    -- Positive price validation for marketplace
    BEGIN
        ALTER TABLE marketplace_items 
        ADD CONSTRAINT chk_marketplace_positive_price 
        CHECK (price >= 0);
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
    END;
    
    -- Stock quantity validation
    BEGIN
        ALTER TABLE marketplace_items 
        ADD CONSTRAINT chk_marketplace_positive_stock 
        CHECK (stock_quantity >= 0);
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
    END;
    
    -- Booking time validation
    BEGIN
        ALTER TABLE bookings 
        ADD CONSTRAINT chk_booking_time_range 
        CHECK (end_time > start_time);
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
    END;
    
    -- Announcement date validation
    BEGIN
        ALTER TABLE announcements 
        ADD CONSTRAINT chk_announcement_date_range 
        CHECK (expire_at IS NULL OR expire_at > publish_at);
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
    END;
END $$;