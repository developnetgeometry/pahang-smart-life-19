-- Create marketplace items table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'MYR',
  image TEXT,
  category TEXT NOT NULL,
  condition_status TEXT DEFAULT 'new',
  is_in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 1,
  shipping_required BOOLEAN DEFAULT false,
  shipping_cost DECIMAL(8,2) DEFAULT 0,
  location TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create shopping cart table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.shopping_cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  item_id UUID NOT NULL REFERENCES marketplace_items(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, item_id)
);

-- Create orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id),
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'MYR',
  status TEXT DEFAULT 'pending',
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create order items table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES marketplace_items(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for marketplace_items
CREATE POLICY "Everyone can view marketplace items" ON public.marketplace_items FOR SELECT USING (true);
CREATE POLICY "Sellers can manage their items" ON public.marketplace_items FOR ALL USING (seller_id = auth.uid());

-- Create RLS policies for shopping_cart
CREATE POLICY "Users can manage their cart" ON public.shopping_cart FOR ALL USING (user_id = auth.uid());

-- Create RLS policies for orders
CREATE POLICY "Users can view their orders" ON public.orders FOR SELECT USING (buyer_id = auth.uid());
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (buyer_id = auth.uid());

-- Create RLS policies for order_items
CREATE POLICY "Users can view their order items" ON public.order_items 
FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.buyer_id = auth.uid()));

-- Insert sample marketplace items
INSERT INTO marketplace_items (
  id, seller_id, title, description, price, currency, image, category, 
  condition_status, is_in_stock, stock_quantity, shipping_required, 
  shipping_cost, location, tags, created_at
) VALUES
('item-001', 'bfe88021-d76b-4f65-8b43-1b879ad4617a', 'Vintage Motorcycle Helmet', 
 'Authentic vintage motorcycle helmet in excellent condition. Perfect for collectors or daily use.', 
 450.00, 'MYR', '/assets/motorcycle-helmet.jpg', 'automotive', 'used', true, 1, true, 25.00, 
 'Kuala Lumpur', ARRAY['vintage', 'motorcycle', 'helmet', 'collectible'], now()),

('item-002', 'bfe88021-d76b-4f65-8b43-1b879ad4617a', 'Homemade Chocolate Cookies (24pcs)', 
 'Freshly baked chocolate chip cookies made with premium ingredients. Perfect for gifts or treats.', 
 35.00, 'MYR', '/assets/chocolate-cookies.jpg', 'food', 'new', true, 15, true, 8.00, 
 'Selangor', ARRAY['homemade', 'cookies', 'chocolate', 'fresh'], now()),

('item-003', 'bfe88021-d76b-4f65-8b43-1b879ad4617a', 'Ceramic Plant Pots Set (3pcs)', 
 'Beautiful handcrafted ceramic plant pots in different sizes. Drainage holes included.', 
 89.00, 'MYR', '/assets/ceramic-pots.jpg', 'home-garden', 'new', true, 8, true, 15.00, 
 'Pahang', ARRAY['ceramic', 'plant pots', 'handcrafted', 'drainage'], now()),

('item-004', 'bfe88021-d76b-4f65-8b43-1b879ad4617a', 'Gaming Mouse - RGB Wireless', 
 'High-performance wireless gaming mouse with customizable RGB lighting and precision tracking.', 
 199.00, 'MYR', '/assets/gaming-mouse.jpg', 'electronics', 'new', true, 12, true, 12.00, 
 'Kuala Lumpur', ARRAY['gaming', 'mouse', 'wireless', 'RGB'], now()),

('item-005', 'bfe88021-d76b-4f65-8b43-1b879ad4617a', 'Handwoven Rattan Basket', 
 'Traditional handwoven rattan basket perfect for storage or home decoration. Eco-friendly material.', 
 65.00, 'MYR', '/assets/rattan-basket.jpg', 'home-decor', 'new', true, 5, true, 18.00, 
 'Terengganu', ARRAY['handwoven', 'rattan', 'basket', 'eco-friendly'], now()),

-- Out of stock items
('item-006', 'bfe88021-d76b-4f65-8b43-1b879ad4617a', 'Limited Edition T-Shirt', 
 'Exclusive community event t-shirt. Limited quantities available.', 
 55.00, 'MYR', '/assets/limited-tshirt.jpg', 'clothing', 'new', false, 0, true, 10.00, 
 'Selangor', ARRAY['limited edition', 't-shirt', 'community', 'exclusive'], now());

-- Insert sample shopping cart items
INSERT INTO shopping_cart (id, user_id, item_id, quantity, added_at) VALUES
('cart-001', 'bfe88021-d76b-4f65-8b43-1b879ad4617a', 'item-002', 2, now() - INTERVAL '2 hours'),
('cart-002', 'bfe88021-d76b-4f65-8b43-1b879ad4617a', 'item-004', 1, now() - INTERVAL '1 day'),
('cart-003', 'bfe88021-d76b-4f65-8b43-1b879ad4617a', 'item-003', 1, now() - INTERVAL '3 hours');

-- Insert sample orders
INSERT INTO orders (id, buyer_id, total_amount, currency, status, stripe_session_id, created_at) VALUES
('order-001', 'bfe88021-d76b-4f65-8b43-1b879ad4617a', 540.00, 'MYR', 'completed', 'cs_test_12345', now() - INTERVAL '7 days'),
('order-002', 'bfe88021-d76b-4f65-8b43-1b879ad4617a', 89.00, 'MYR', 'shipped', 'cs_test_67890', now() - INTERVAL '3 days'),
('order-003', 'bfe88021-d76b-4f65-8b43-1b879ad4617a', 35.00, 'MYR', 'pending', 'cs_test_11111', now() - INTERVAL '1 day');

-- Insert sample order items
INSERT INTO order_items (id, order_id, item_id, quantity, unit_price, total_price) VALUES
('orderitem-001', 'order-001', 'item-001', 1, 450.00, 450.00),
('orderitem-002', 'order-001', 'item-005', 1, 65.00, 65.00),
('orderitem-003', 'order-001', 'item-004', 1, 25.00, 25.00), -- shipping cost
('orderitem-004', 'order-002', 'item-003', 1, 89.00, 89.00),
('orderitem-005', 'order-003', 'item-002', 1, 35.00, 35.00);