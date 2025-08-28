-- Insert sample marketplace items (only if they don't exist)
INSERT INTO marketplace_items (
  id, seller_id, title, description, price, currency, image, category, 
  condition_status, is_in_stock, stock_quantity, shipping_required, 
  shipping_cost, location, tags, created_at
) VALUES
('item-mkt-001', 'bfe88021-d76b-4f65-8b43-1b879ad4617a', 'Vintage Motorcycle Helmet', 
 'Authentic vintage motorcycle helmet in excellent condition. Perfect for collectors or daily use.', 
 450.00, 'MYR', '/assets/motorcycle-helmet.jpg', 'automotive', 'used', true, 1, true, 25.00, 
 'Kuala Lumpur', ARRAY['vintage', 'motorcycle', 'helmet', 'collectible'], now()),

('item-mkt-002', 'bfe88021-d76b-4f65-8b43-1b879ad4617a', 'Homemade Chocolate Cookies (24pcs)', 
 'Freshly baked chocolate chip cookies made with premium ingredients. Perfect for gifts or treats.', 
 35.00, 'MYR', '/assets/chocolate-cookies.jpg', 'food', 'new', true, 15, true, 8.00, 
 'Selangor', ARRAY['homemade', 'cookies', 'chocolate', 'fresh'], now()),

('item-mkt-003', 'bfe88021-d76b-4f65-8b43-1b879ad4617a', 'Ceramic Plant Pots Set (3pcs)', 
 'Beautiful handcrafted ceramic plant pots in different sizes. Drainage holes included.', 
 89.00, 'MYR', '/assets/ceramic-pots.jpg', 'home-garden', 'new', true, 8, true, 15.00, 
 'Pahang', ARRAY['ceramic', 'plant pots', 'handcrafted', 'drainage'], now()),

('item-mkt-004', 'bfe88021-d76b-4f65-8b43-1b879ad4617a', 'Gaming Mouse - RGB Wireless', 
 'High-performance wireless gaming mouse with customizable RGB lighting and precision tracking.', 
 199.00, 'MYR', '/assets/gaming-mouse.jpg', 'electronics', 'new', true, 12, true, 12.00, 
 'Kuala Lumpur', ARRAY['gaming', 'mouse', 'wireless', 'RGB'], now()),

('item-mkt-005', 'bfe88021-d76b-4f65-8b43-1b879ad4617a', 'Handwoven Rattan Basket', 
 'Traditional handwoven rattan basket perfect for storage or home decoration. Eco-friendly material.', 
 65.00, 'MYR', '/assets/rattan-basket.jpg', 'home-decor', 'new', true, 5, true, 18.00, 
 'Terengganu', ARRAY['handwoven', 'rattan', 'basket', 'eco-friendly'], now()),

('item-mkt-006', 'bfe88021-d76b-4f65-8b43-1b879ad4617a', 'Limited Edition T-Shirt', 
 'Exclusive community event t-shirt. Limited quantities available.', 
 55.00, 'MYR', '/assets/limited-tshirt.jpg', 'clothing', 'new', false, 0, true, 10.00, 
 'Selangor', ARRAY['limited edition', 't-shirt', 'community', 'exclusive'], now()),

('item-mkt-007', 'bfe88021-d76b-4f65-8b43-1b879ad4617a', 'Artisan Coffee Beans (500g)', 
 'Locally roasted coffee beans from Cameron Highlands. Medium roast with chocolate notes.', 
 42.00, 'MYR', '/assets/coffee-beans.jpg', 'food', 'new', true, 25, true, 12.00, 
 'Cameron Highlands', ARRAY['coffee', 'beans', 'artisan', 'local'], now()),

('item-mkt-008', 'bfe88021-d76b-4f65-8b43-1b879ad4617a', 'Wooden Kitchen Utensils Set', 
 'Sustainable bamboo kitchen utensils including spatula, spoons, and tongs.', 
 78.00, 'MYR', '/assets/kitchen-utensils.jpg', 'kitchenware', 'new', true, 10, true, 15.00, 
 'Johor', ARRAY['bamboo', 'kitchen', 'sustainable', 'utensils'], now()),

('item-mkt-009', 'bfe88021-d76b-4f65-8b43-1b879ad4617a', 'Traditional Batik Scarf', 
 'Handmade batik scarf with traditional Malaysian patterns. Perfect for gifts or personal use.', 
 120.00, 'MYR', '/assets/batik-scarf.jpg', 'fashion', 'new', true, 6, true, 10.00, 
 'Kelantan', ARRAY['batik', 'handmade', 'traditional', 'scarf'], now()),

('item-mkt-010', 'bfe88021-d76b-4f65-8b43-1b879ad4617a', 'Organic Honey (250ml)', 
 'Pure organic honey from local beekeepers. No artificial additives or preservatives.', 
 28.00, 'MYR', '/assets/organic-honey.jpg', 'food', 'new', true, 20, true, 6.00, 
 'Perak', ARRAY['organic', 'honey', 'local', 'pure'], now())

ON CONFLICT (id) DO NOTHING;

-- Insert sample shopping cart items for the current user
INSERT INTO shopping_cart (id, user_id, item_id, quantity, added_at) VALUES
('cart-mkt-001', 'bfe88021-d76b-4f65-8b43-1b879ad4617a', 'item-mkt-002', 2, now() - INTERVAL '2 hours'),
('cart-mkt-002', 'bfe88021-d76b-4f65-8b43-1b879ad4617a', 'item-mkt-004', 1, now() - INTERVAL '1 day'),
('cart-mkt-003', 'bfe88021-d76b-4f65-8b43-1b879ad4617a', 'item-mkt-007', 3, now() - INTERVAL '3 hours')
ON CONFLICT (user_id, item_id) DO NOTHING;