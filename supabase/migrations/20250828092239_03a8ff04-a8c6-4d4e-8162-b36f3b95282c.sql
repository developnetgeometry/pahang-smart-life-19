-- Insert sample marketplace items using proper UUIDs
INSERT INTO marketplace_items (
  seller_id, title, description, price, image, category, 
  condition, is_in_stock, stock_quantity, location, 
  is_available, is_active, district_id, seller_type, created_at
) VALUES
('bfe88021-d76b-4f65-8b43-1b879ad4617a', 'Vintage Motorcycle Helmet', 
 'Authentic vintage motorcycle helmet in excellent condition. Perfect for collectors or daily use.', 
 450.00, '/assets/iphone-marketplace.jpg', 'automotive', 'used', true, 1, 'Kuala Lumpur', 
 true, true, 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc', 'individual', now()),

('bfe88021-d76b-4f65-8b43-1b879ad4617a', 'Homemade Chocolate Cookies (24pcs)', 
 'Freshly baked chocolate chip cookies made with premium ingredients. Perfect for gifts or treats.', 
 35.00, '/activity-images/chinese-new-year-celebration.jpg', 'food', 'new', true, 15, 'Selangor', 
 true, true, 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc', 'business', now()),

('bfe88021-d76b-4f65-8b43-1b879ad4617a', 'Ceramic Plant Pots Set (3pcs)', 
 'Beautiful handcrafted ceramic plant pots in different sizes. Drainage holes included.', 
 89.00, '/assets/garden-facility.jpg', 'home-garden', 'new', true, 8, 'Pahang', 
 true, true, 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc', 'artisan', now()),

('bfe88021-d76b-4f65-8b43-1b879ad4617a', 'Gaming Mouse - RGB Wireless', 
 'High-performance wireless gaming mouse with customizable RGB lighting and precision tracking.', 
 199.00, '/assets/programming-books-marketplace.jpg', 'electronics', 'new', true, 12, 'Kuala Lumpur', 
 true, true, 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc', 'business', now()),

('bfe88021-d76b-4f65-8b43-1b879ad4617a', 'Handwoven Rattan Basket', 
 'Traditional handwoven rattan basket perfect for storage or home decoration. Eco-friendly material.', 
 65.00, '/assets/community-gym.jpg', 'home-decor', 'new', true, 5, 'Terengganu', 
 true, true, 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc', 'artisan', now()),

('bfe88021-d76b-4f65-8b43-1b879ad4617a', 'Limited Edition T-Shirt', 
 'Exclusive community event t-shirt. Limited quantities available.', 
 55.00, '/activity-images/badminton-tournament.jpg', 'clothing', 'new', false, 0, 'Selangor', 
 true, true, 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc', 'business', now()),

('bfe88021-d76b-4f65-8b43-1b879ad4617a', 'Artisan Coffee Beans (500g)', 
 'Locally roasted coffee beans from Cameron Highlands. Medium roast with chocolate notes.', 
 42.00, '/assets/dining-table-marketplace.jpg', 'food', 'new', true, 25, 'Cameron Highlands', 
 true, true, 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc', 'artisan', now()),

('bfe88021-d76b-4f65-8b43-1b879ad4617a', 'Wooden Kitchen Utensils Set', 
 'Sustainable bamboo kitchen utensils including spatula, spoons, and tongs.', 
 78.00, '/assets/function-hall.jpg', 'kitchenware', 'new', true, 10, 'Johor', 
 true, true, 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc', 'artisan', now()),

('bfe88021-d76b-4f65-8b43-1b879ad4617a', 'Traditional Batik Scarf', 
 'Handmade batik scarf with traditional Malaysian patterns. Perfect for gifts or personal use.', 
 120.00, '/assets/playground-facility.jpg', 'fashion', 'new', true, 6, 'Kelantan', 
 true, true, 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc', 'artisan', now()),

('bfe88021-d76b-4f65-8b43-1b879ad4617a', 'Organic Honey (250ml)', 
 'Pure organic honey from local beekeepers. No artificial additives or preservatives.', 
 28.00, '/assets/prayer-hall-facility.jpg', 'food', 'new', true, 20, 'Perak', 
 true, true, 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc', 'individual', now()),

('bfe88021-d76b-4f65-8b43-1b879ad4617a', 'Smartphone Repair Kit', 
 'Complete smartphone repair kit with tools and components for common repairs.', 
 145.00, '/assets/programming-books-marketplace.jpg', 'electronics', 'new', true, 7, 'Penang', 
 true, true, 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc', 'business', now()),

('bfe88021-d76b-4f65-8b43-1b879ad4617a', 'Handmade Soap Collection', 
 'Natural handmade soaps with essential oils. Set of 6 different scents.', 
 38.00, '/activity-images/health-fitness-workshop.jpg', 'beauty', 'new', true, 18, 'Melaka', 
 true, true, 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc', 'individual', now());