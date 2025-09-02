-- Create shipping methods table
CREATE TABLE public.shipping_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  service_type TEXT NOT NULL DEFAULT 'standard',
  base_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  estimated_days_min INTEGER NOT NULL DEFAULT 1,
  estimated_days_max INTEGER NOT NULL DEFAULT 7,
  is_active BOOLEAN NOT NULL DEFAULT true,
  tracking_available BOOLEAN NOT NULL DEFAULT false,
  insurance_available BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  district_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shipping zones table  
CREATE TABLE public.shipping_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  states TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  district_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shipping rates table
CREATE TABLE public.shipping_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  method_id UUID NOT NULL,
  zone_id UUID NOT NULL,
  base_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  per_kg_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  min_weight DECIMAL(8,2) DEFAULT 0,
  max_weight DECIMAL(8,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(method_id, zone_id)
);

-- Create product shares table
CREATE TABLE public.product_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  shared_by UUID NOT NULL,
  shared_with UUID[] DEFAULT '{}',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wishlists table
CREATE TABLE public.wishlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wishlist items table
CREATE TABLE public.wishlist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wishlist_id UUID NOT NULL,
  product_id UUID NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(wishlist_id, product_id)
);

-- Create product recommendations table
CREATE TABLE public.product_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  recommended_by UUID NOT NULL,
  recommended_to UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shipping tables (admin/seller management)
CREATE POLICY "Admins can manage shipping methods" ON public.shipping_methods
  FOR ALL USING (
    has_enhanced_role('community_admin'::enhanced_user_role) OR 
    has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
    has_enhanced_role('state_admin'::enhanced_user_role)
  );

CREATE POLICY "Everyone can view active shipping methods" ON public.shipping_methods
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage shipping zones" ON public.shipping_zones
  FOR ALL USING (
    has_enhanced_role('community_admin'::enhanced_user_role) OR 
    has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
    has_enhanced_role('state_admin'::enhanced_user_role)
  );

CREATE POLICY "Everyone can view active shipping zones" ON public.shipping_zones
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage shipping rates" ON public.shipping_rates
  FOR ALL USING (
    has_enhanced_role('community_admin'::enhanced_user_role) OR 
    has_enhanced_role('district_coordinator'::enhanced_user_role) OR 
    has_enhanced_role('state_admin'::enhanced_user_role)
  );

CREATE POLICY "Everyone can view active shipping rates" ON public.shipping_rates
  FOR SELECT USING (is_active = true);

-- RLS Policies for social features
CREATE POLICY "Users can create product shares" ON public.product_shares
  FOR INSERT WITH CHECK (shared_by = auth.uid());

CREATE POLICY "Users can view shares of their products and shares they made" ON public.product_shares
  FOR SELECT USING (
    shared_by = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM marketplace_items mi 
      WHERE mi.id = product_shares.product_id AND mi.seller_id = auth.uid()
    )
  );

CREATE POLICY "Users can create wishlists" ON public.wishlists
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own wishlists" ON public.wishlists
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can view public wishlists and their own" ON public.wishlists
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can manage their wishlist items" ON public.wishlist_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM wishlists w 
      WHERE w.id = wishlist_items.wishlist_id AND w.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view wishlist items for accessible wishlists" ON public.wishlist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wishlists w 
      WHERE w.id = wishlist_items.wishlist_id 
      AND (w.is_public = true OR w.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can create recommendations" ON public.product_recommendations
  FOR INSERT WITH CHECK (recommended_by = auth.uid());

CREATE POLICY "Users can view recommendations made to them" ON public.product_recommendations
  FOR SELECT USING (recommended_to = auth.uid() OR recommended_by = auth.uid());

-- Add foreign key constraints
ALTER TABLE public.shipping_rates 
  ADD CONSTRAINT fk_shipping_rates_method FOREIGN KEY (method_id) REFERENCES public.shipping_methods(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_shipping_rates_zone FOREIGN KEY (zone_id) REFERENCES public.shipping_zones(id) ON DELETE CASCADE;

ALTER TABLE public.product_shares
  ADD CONSTRAINT fk_product_shares_product FOREIGN KEY (product_id) REFERENCES public.marketplace_items(id) ON DELETE CASCADE;

ALTER TABLE public.wishlist_items
  ADD CONSTRAINT fk_wishlist_items_wishlist FOREIGN KEY (wishlist_id) REFERENCES public.wishlists(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_wishlist_items_product FOREIGN KEY (product_id) REFERENCES public.marketplace_items(id) ON DELETE CASCADE;

ALTER TABLE public.product_recommendations
  ADD CONSTRAINT fk_product_recommendations_product FOREIGN KEY (product_id) REFERENCES public.marketplace_items(id) ON DELETE CASCADE;

-- Add triggers for updated_at
CREATE TRIGGER update_shipping_methods_updated_at
  BEFORE UPDATE ON public.shipping_methods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shipping_zones_updated_at
  BEFORE UPDATE ON public.shipping_zones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shipping_rates_updated_at
  BEFORE UPDATE ON public.shipping_rates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wishlists_updated_at
  BEFORE UPDATE ON public.wishlists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default shipping data
INSERT INTO public.shipping_methods (name, service_type, base_cost, estimated_days_min, estimated_days_max, tracking_available, insurance_available, description) VALUES
('Standard Delivery', 'standard', 5.00, 3, 5, true, false, 'Regular delivery service'),
('Express Delivery', 'express', 12.00, 1, 2, true, true, 'Fast delivery with insurance'),
('Economy Shipping', 'economy', 2.50, 5, 10, false, false, 'Budget-friendly slow shipping');

INSERT INTO public.shipping_zones (name, states) VALUES
('Klang Valley', ARRAY['Kuala Lumpur', 'Selangor', 'Putrajaya']),
('Northern Region', ARRAY['Penang', 'Kedah', 'Perlis', 'Perak']),
('Southern Region', ARRAY['Johor', 'Melaka', 'Negeri Sembilan']),
('East Coast', ARRAY['Kelantan', 'Terengganu', 'Pahang']),
('East Malaysia', ARRAY['Sabah', 'Sarawak', 'Labuan']);

-- Insert default shipping rates
INSERT INTO public.shipping_rates (method_id, zone_id, base_rate, per_kg_rate)
SELECT 
  sm.id, 
  sz.id,
  sm.base_cost,
  CASE 
    WHEN sm.service_type = 'economy' THEN 1.00
    WHEN sm.service_type = 'standard' THEN 2.00
    WHEN sm.service_type = 'express' THEN 3.50
  END
FROM shipping_methods sm
CROSS JOIN shipping_zones sz;