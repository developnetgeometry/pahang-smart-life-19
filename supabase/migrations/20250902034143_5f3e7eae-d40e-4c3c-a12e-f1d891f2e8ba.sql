-- Create comprehensive marketplace tables to eliminate hardcoded data

-- Product categories table
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES public.product_categories(id),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default categories
INSERT INTO public.product_categories (name, description, display_order) VALUES
('Electronics', 'Electronic devices and gadgets', 1),
('Clothing', 'Apparel and accessories', 2),
('Home & Garden', 'Home improvement and garden supplies', 3),
('Books', 'Books and educational materials', 4),
('Sports', 'Sports and fitness equipment', 5),
('Automotive', 'Car parts and accessories', 6),
('Health & Beauty', 'Health and beauty products', 7),
('Toys & Games', 'Children toys and games', 8),
('Food & Beverages', 'Food and drink items', 9),
('Services', 'Professional services', 10)
ON CONFLICT (name) DO NOTHING;

-- Shipping methods table
CREATE TABLE IF NOT EXISTS public.shipping_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  service_type TEXT NOT NULL DEFAULT 'standard',
  base_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  cost_per_kg DECIMAL(10,2) DEFAULT 0,
  estimated_days_min INTEGER NOT NULL DEFAULT 1,
  estimated_days_max INTEGER NOT NULL DEFAULT 3,
  tracking_available BOOLEAN DEFAULT false,
  insurance_available BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default shipping methods
INSERT INTO public.shipping_methods (name, description, service_type, base_cost, cost_per_kg, estimated_days_min, estimated_days_max, tracking_available, insurance_available) VALUES
('Standard Delivery', 'Regular delivery service', 'standard', 5.00, 1.50, 3, 5, true, false),
('Express Delivery', 'Fast delivery service', 'express', 12.00, 2.00, 1, 2, true, true),
('Economy Shipping', 'Budget-friendly delivery', 'economy', 2.50, 1.00, 5, 10, false, false),
('Overnight Express', 'Next day delivery', 'overnight', 25.00, 3.00, 1, 1, true, true)
ON CONFLICT DO NOTHING;

-- Shipping zones table
CREATE TABLE IF NOT EXISTS public.shipping_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  states TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default shipping zones
INSERT INTO public.shipping_zones (name, description, states) VALUES
('Klang Valley', 'Greater Kuala Lumpur area', ARRAY['Kuala Lumpur', 'Selangor', 'Putrajaya']),
('Northern Region', 'Northern states of Malaysia', ARRAY['Penang', 'Kedah', 'Perlis', 'Perak']),
('Southern Region', 'Southern states of Malaysia', ARRAY['Johor', 'Melaka', 'Negeri Sembilan']),
('East Coast', 'East coast states', ARRAY['Kelantan', 'Terengganu', 'Pahang']),
('East Malaysia', 'Borneo states', ARRAY['Sabah', 'Sarawak', 'Labuan'])
ON CONFLICT (name) DO NOTHING;

-- Shipping rates table
CREATE TABLE IF NOT EXISTS public.shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  method_id UUID NOT NULL REFERENCES public.shipping_methods(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES public.shipping_zones(id) ON DELETE CASCADE,
  base_rate DECIMAL(10,2) NOT NULL,
  per_kg_rate DECIMAL(10,2) DEFAULT 0,
  min_weight DECIMAL(8,2) DEFAULT 0,
  max_weight DECIMAL(8,2) DEFAULT 1000,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(method_id, zone_id)
);

-- Insert default shipping rates
INSERT INTO public.shipping_rates (method_id, zone_id, base_rate, per_kg_rate, min_weight, max_weight)
SELECT 
  sm.id,
  sz.id,
  CASE 
    WHEN sm.service_type = 'standard' AND sz.name = 'Klang Valley' THEN 5.00
    WHEN sm.service_type = 'standard' AND sz.name != 'Klang Valley' THEN 8.00
    WHEN sm.service_type = 'express' AND sz.name = 'Klang Valley' THEN 12.00
    WHEN sm.service_type = 'express' AND sz.name != 'Klang Valley' THEN 15.00
    WHEN sm.service_type = 'economy' THEN 3.00
    WHEN sm.service_type = 'overnight' AND sz.name = 'Klang Valley' THEN 25.00
    WHEN sm.service_type = 'overnight' AND sz.name != 'Klang Valley' THEN 35.00
    ELSE sm.base_cost
  END,
  CASE
    WHEN sz.name = 'East Malaysia' THEN sm.cost_per_kg * 1.5
    ELSE sm.cost_per_kg
  END,
  0,
  1000
FROM public.shipping_methods sm
CROSS JOIN public.shipping_zones sz
WHERE sm.service_type != 'overnight' OR sz.name IN ('Klang Valley', 'Northern Region', 'Southern Region')
ON CONFLICT (method_id, zone_id) DO NOTHING;

-- Promotional codes table
CREATE TABLE IF NOT EXISTS public.promotional_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  applicable_categories UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Item promotions table (for individual product promotions)
CREATE TABLE IF NOT EXISTS public.item_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
  promotion_type TEXT NOT NULL CHECK (promotion_type IN ('percentage', 'fixed_amount', 'buy_x_get_y')),
  discount_value DECIMAL(10,2) NOT NULL,
  buy_quantity INTEGER DEFAULT 1,
  get_quantity INTEGER DEFAULT 0, -- for buy_x_get_y promotions
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bulk operations tracking table
CREATE TABLE IF NOT EXISTS public.bulk_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  performed_by UUID REFERENCES auth.users(id),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  items_affected INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  error_details JSONB,
  filters_applied JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Social features tables
CREATE TABLE IF NOT EXISTS public.product_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id),
  shared_with UUID[] NOT NULL DEFAULT '{}',
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.shared_wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.shared_wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id UUID NOT NULL REFERENCES public.shared_wishlists(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(wishlist_id, item_id)
);

CREATE TABLE IF NOT EXISTS public.product_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommended_product_id UUID NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
  recommended_to UUID NOT NULL REFERENCES auth.users(id),
  recommended_by UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Analytics tables
CREATE TABLE IF NOT EXISTS public.marketplace_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  add_to_cart_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, date)
);

CREATE TABLE IF NOT EXISTS public.user_marketplace_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  user_type TEXT DEFAULT 'visitor',
  page_views INTEGER DEFAULT 0,
  session_duration INTEGER DEFAULT 0, -- in seconds
  actions_taken JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Add missing columns to marketplace_items if they don't exist
DO $$ 
BEGIN
  -- Add stock_quantity column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_items' AND column_name='stock_quantity') THEN
    ALTER TABLE public.marketplace_items ADD COLUMN stock_quantity INTEGER DEFAULT 0;
  END IF;
  
  -- Add category_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_items' AND column_name='category_id') THEN
    ALTER TABLE public.marketplace_items ADD COLUMN category_id UUID REFERENCES public.product_categories(id);
  END IF;
  
  -- Add sku column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_items' AND column_name='sku') THEN
    ALTER TABLE public.marketplace_items ADD COLUMN sku TEXT UNIQUE;
  END IF;
  
  -- Add weight column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_items' AND column_name='weight') THEN
    ALTER TABLE public.marketplace_items ADD COLUMN weight DECIMAL(8,2);
  END IF;
  
  -- Add dimensions column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_items' AND column_name='dimensions') THEN
    ALTER TABLE public.marketplace_items ADD COLUMN dimensions TEXT;
  END IF;
  
  -- Add view_count column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_items' AND column_name='view_count') THEN
    ALTER TABLE public.marketplace_items ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add missing columns to marketplace_orders if they don't exist
DO $$ 
BEGIN
  -- Add shipping_method_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_orders' AND column_name='shipping_method_id') THEN
    ALTER TABLE public.marketplace_orders ADD COLUMN shipping_method_id UUID REFERENCES public.shipping_methods(id);
  END IF;
  
  -- Add shipping_address column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_orders' AND column_name='shipping_address') THEN
    ALTER TABLE public.marketplace_orders ADD COLUMN shipping_address JSONB;
  END IF;
  
  -- Add shipping_cost column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_orders' AND column_name='shipping_cost') THEN
    ALTER TABLE public.marketplace_orders ADD COLUMN shipping_cost DECIMAL(10,2) DEFAULT 0;
  END IF;
  
  -- Add tracking_number column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_orders' AND column_name='tracking_number') THEN
    ALTER TABLE public.marketplace_orders ADD COLUMN tracking_number TEXT;
  END IF;
  
  -- Add promotion_code_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_orders' AND column_name='promotion_code_id') THEN
    ALTER TABLE public.marketplace_orders ADD COLUMN promotion_code_id UUID REFERENCES public.promotional_codes(id);
  END IF;
  
  -- Add discount_amount column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_orders' AND column_name='discount_amount') THEN
    ALTER TABLE public.marketplace_orders ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0;
  END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotional_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_marketplace_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_categories (public read, admin manage)
CREATE POLICY "Everyone can view categories" ON public.product_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage categories" ON public.product_categories FOR ALL USING (has_enhanced_role('state_admin') OR has_enhanced_role('district_coordinator') OR has_enhanced_role('community_admin'));

-- RLS Policies for shipping tables (service providers and admins)
CREATE POLICY "Everyone can view shipping methods" ON public.shipping_methods FOR SELECT USING (is_active = true);
CREATE POLICY "Service providers can manage shipping methods" ON public.shipping_methods FOR ALL USING (has_enhanced_role('service_provider') OR has_enhanced_role('state_admin') OR has_enhanced_role('district_coordinator') OR has_enhanced_role('community_admin'));

CREATE POLICY "Everyone can view shipping zones" ON public.shipping_zones FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage shipping zones" ON public.shipping_zones FOR ALL USING (has_enhanced_role('state_admin') OR has_enhanced_role('district_coordinator') OR has_enhanced_role('community_admin'));

CREATE POLICY "Everyone can view shipping rates" ON public.shipping_rates FOR SELECT USING (true);
CREATE POLICY "Service providers can manage shipping rates" ON public.shipping_rates FOR ALL USING (has_enhanced_role('service_provider') OR has_enhanced_role('state_admin') OR has_enhanced_role('district_coordinator') OR has_enhanced_role('community_admin'));

-- RLS Policies for promotional codes
CREATE POLICY "Everyone can view active promotions" ON public.promotional_codes FOR SELECT USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));
CREATE POLICY "Service providers can create promotions" ON public.promotional_codes FOR INSERT WITH CHECK (created_by = auth.uid() AND has_enhanced_role('service_provider'));
CREATE POLICY "Creators can manage their promotions" ON public.promotional_codes FOR ALL USING (created_by = auth.uid());

-- RLS Policies for item promotions
CREATE POLICY "Everyone can view active item promotions" ON public.item_promotions FOR SELECT USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));
CREATE POLICY "Item owners can create promotions" ON public.item_promotions FOR INSERT WITH CHECK (created_by = auth.uid() AND EXISTS (SELECT 1 FROM marketplace_items WHERE id = item_id AND seller_id = auth.uid()));
CREATE POLICY "Creators can manage their item promotions" ON public.item_promotions FOR ALL USING (created_by = auth.uid());

-- RLS Policies for bulk operations
CREATE POLICY "Users can view their bulk operations" ON public.bulk_operations FOR SELECT USING (performed_by = auth.uid());
CREATE POLICY "Users can create bulk operations" ON public.bulk_operations FOR INSERT WITH CHECK (performed_by = auth.uid());
CREATE POLICY "Users can update their bulk operations" ON public.bulk_operations FOR UPDATE USING (performed_by = auth.uid());

-- RLS Policies for social features
CREATE POLICY "Users can view shares" ON public.product_shares FOR SELECT USING (shared_by = auth.uid() OR auth.uid() = ANY(shared_with));
CREATE POLICY "Users can create shares" ON public.product_shares FOR INSERT WITH CHECK (shared_by = auth.uid());

CREATE POLICY "Everyone can view public wishlists" ON public.shared_wishlists FOR SELECT USING (is_public = true OR created_by = auth.uid());
CREATE POLICY "Users can create wishlists" ON public.shared_wishlists FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can manage their wishlists" ON public.shared_wishlists FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Users can view wishlist items" ON public.shared_wishlist_items FOR SELECT USING (EXISTS (SELECT 1 FROM shared_wishlists WHERE id = wishlist_id AND (is_public = true OR created_by = auth.uid())));
CREATE POLICY "Wishlist owners can manage items" ON public.shared_wishlist_items FOR ALL USING (EXISTS (SELECT 1 FROM shared_wishlists WHERE id = wishlist_id AND created_by = auth.uid()));

CREATE POLICY "Users can view their recommendations" ON public.product_recommendations FOR SELECT USING (recommended_to = auth.uid() OR recommended_by = auth.uid());
CREATE POLICY "Users can create recommendations" ON public.product_recommendations FOR INSERT WITH CHECK (recommended_by = auth.uid());

-- RLS Policies for analytics
CREATE POLICY "System can insert analytics" ON public.marketplace_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their analytics" ON public.marketplace_analytics FOR SELECT USING (user_id = auth.uid() OR has_enhanced_role('state_admin') OR has_enhanced_role('district_coordinator') OR has_enhanced_role('community_admin'));

CREATE POLICY "System can manage product analytics" ON public.product_analytics FOR ALL USING (true);
CREATE POLICY "Product owners can view analytics" ON public.product_analytics FOR SELECT USING (EXISTS (SELECT 1 FROM marketplace_items WHERE id = product_id AND seller_id = auth.uid()) OR has_enhanced_role('state_admin') OR has_enhanced_role('district_coordinator') OR has_enhanced_role('community_admin'));

CREATE POLICY "System can manage user analytics" ON public.user_marketplace_analytics FOR ALL USING (true);
CREATE POLICY "Users can view their analytics" ON public.user_marketplace_analytics FOR SELECT USING (user_id = auth.uid() OR has_enhanced_role('state_admin') OR has_enhanced_role('district_coordinator') OR has_enhanced_role('community_admin'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_categories_active ON public.product_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_active ON public.shipping_methods(is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_zones_active ON public.shipping_zones(is_active);
CREATE INDEX IF NOT EXISTS idx_promotional_codes_active ON public.promotional_codes(is_active, valid_until);
CREATE INDEX IF NOT EXISTS idx_item_promotions_active ON public.item_promotions(item_id, is_active, valid_until);
CREATE INDEX IF NOT EXISTS idx_product_shares_product ON public.product_shares(product_id);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_user ON public.product_recommendations(recommended_to);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_category ON public.marketplace_items(category_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_user ON public.marketplace_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_product_analytics_product_date ON public.product_analytics(product_id, date);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_date ON public.user_marketplace_analytics(user_id, date);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at columns
DROP TRIGGER IF EXISTS update_product_categories_updated_at ON public.product_categories;
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON public.product_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shipping_methods_updated_at ON public.shipping_methods;
CREATE TRIGGER update_shipping_methods_updated_at BEFORE UPDATE ON public.shipping_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shipping_zones_updated_at ON public.shipping_zones;
CREATE TRIGGER update_shipping_zones_updated_at BEFORE UPDATE ON public.shipping_zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shipping_rates_updated_at ON public.shipping_rates;
CREATE TRIGGER update_shipping_rates_updated_at BEFORE UPDATE ON public.shipping_rates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_promotional_codes_updated_at ON public.promotional_codes;
CREATE TRIGGER update_promotional_codes_updated_at BEFORE UPDATE ON public.promotional_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_item_promotions_updated_at ON public.item_promotions;
CREATE TRIGGER update_item_promotions_updated_at BEFORE UPDATE ON public.item_promotions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shared_wishlists_updated_at ON public.shared_wishlists;
CREATE TRIGGER update_shared_wishlists_updated_at BEFORE UPDATE ON public.shared_wishlists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_analytics_updated_at ON public.product_analytics;
CREATE TRIGGER update_product_analytics_updated_at BEFORE UPDATE ON public.product_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();