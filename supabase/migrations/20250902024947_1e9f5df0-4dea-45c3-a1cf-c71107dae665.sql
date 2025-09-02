-- Create orders table for marketplace transactions
CREATE TABLE public.marketplace_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  item_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  shipping_address JSONB,
  notes TEXT,
  order_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  shipped_date TIMESTAMP WITH TIME ZONE,
  delivered_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create favorites/wishlist table
CREATE TABLE public.marketplace_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id)
);

-- Add stock quantity and sold count to marketplace_items
ALTER TABLE public.marketplace_items 
ADD COLUMN stock_quantity INTEGER DEFAULT NULL,
ADD COLUMN sold_count INTEGER DEFAULT 0,
ADD COLUMN view_count INTEGER DEFAULT 0;

-- Enable RLS on new tables
ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketplace_orders
CREATE POLICY "Users can view their own orders as buyer" 
ON public.marketplace_orders 
FOR SELECT 
USING (buyer_id = auth.uid());

CREATE POLICY "Users can view their own orders as seller" 
ON public.marketplace_orders 
FOR SELECT 
USING (seller_id = auth.uid());

CREATE POLICY "Users can create orders as buyer" 
ON public.marketplace_orders 
FOR INSERT 
WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Sellers can update their orders" 
ON public.marketplace_orders 
FOR UPDATE 
USING (seller_id = auth.uid());

CREATE POLICY "Admins can manage all orders" 
ON public.marketplace_orders 
FOR ALL 
USING (has_enhanced_role('community_admin') OR has_enhanced_role('district_coordinator') OR has_enhanced_role('state_admin'));

-- RLS Policies for marketplace_favorites
CREATE POLICY "Users can manage their own favorites" 
ON public.marketplace_favorites 
FOR ALL 
USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_marketplace_orders_buyer_id ON public.marketplace_orders(buyer_id);
CREATE INDEX idx_marketplace_orders_seller_id ON public.marketplace_orders(seller_id);
CREATE INDEX idx_marketplace_orders_item_id ON public.marketplace_orders(item_id);
CREATE INDEX idx_marketplace_orders_status ON public.marketplace_orders(status);
CREATE INDEX idx_marketplace_favorites_user_id ON public.marketplace_favorites(user_id);
CREATE INDEX idx_marketplace_favorites_item_id ON public.marketplace_favorites(item_id);

-- Create function to update marketplace_items sold_count
CREATE OR REPLACE FUNCTION update_marketplace_item_sold_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    UPDATE marketplace_items 
    SET sold_count = sold_count + NEW.quantity
    WHERE id = NEW.item_id;
  ELSIF OLD.status = 'delivered' AND NEW.status != 'delivered' THEN
    UPDATE marketplace_items 
    SET sold_count = GREATEST(0, sold_count - NEW.quantity)
    WHERE id = NEW.item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for sold count updates
CREATE TRIGGER marketplace_order_sold_count_trigger
  AFTER UPDATE ON marketplace_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_marketplace_item_sold_count();

-- Create updated_at trigger for orders
CREATE TRIGGER update_marketplace_orders_updated_at
  BEFORE UPDATE ON marketplace_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();