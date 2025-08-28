-- Insert diverse marketplace advertisements using the current authenticated user
INSERT INTO advertisements (
  id, advertiser_id, title, description, business_name, category, 
  contact_phone, contact_email, website_url, image_url, tags, 
  is_featured, is_active, price, currency, stock_quantity, is_in_stock,
  shipping_required, shipping_cost, product_weight, product_dimensions,
  product_type, condition_status, warranty_period, return_policy,
  district_id, created_at
) VALUES

-- SERVICES
('ad1e8400-e29b-41d4-a716-446655440001', 'bfe88021-d76b-4f65-8b43-1b879ad4617a', 
 'Professional Home Cleaning Service', 
 'Comprehensive home cleaning service including deep cleaning, regular maintenance, and post-renovation cleanup. Experienced team with eco-friendly products.',
 'ProClean Solutions', 'cleaning', '+60123456789', 'cleaningpro@test.com', 'https://proclean.my',
 '/activity-images/health-fitness-workshop.jpg', 
 ARRAY['deep cleaning', 'regular cleaning', 'eco-friendly', 'insured'], 
 true, true, 120.00, 'MYR', NULL, true, false, NULL, NULL, NULL,
 'service', NULL, '6 months service guarantee', 'Satisfaction guaranteed or money back',
 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc', now()),

('ad1e8400-e29b-41d4-a716-446655440002', 'bfe88021-d76b-4f65-8b43-1b879ad4617a',
 'Personal Fitness Training', 
 'Certified personal trainer offering one-on-one and group fitness sessions. Specializing in weight loss, muscle building, and athletic performance.',
 'FitLife Personal Training', 'fitness', '+60198765432', 'fitnessguru@test.com', NULL,
 '/activity-images/badminton-tournament.jpg',
 ARRAY['personal training', 'group sessions', 'nutrition guidance', 'certified trainer'],
 false, true, 80.00, 'MYR', NULL, true, false, NULL, NULL, NULL,
 'service', NULL, NULL, 'First session free trial',
 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc', now()),

('ad1e8400-e29b-41d4-a716-446655440003', 'bfe88021-d76b-4f65-8b43-1b879ad4617a',
 'Garden Maintenance & Landscaping', 
 'Complete garden care services including lawn mowing, pruning, landscaping design, and plant care. Weekly, bi-weekly or monthly packages available.',
 'Green Thumb Garden Services', 'gardening', '+60187654321', 'gardencare@test.com', 'https://greenthumb.my',
 '/activity-images/gotong-royong-day.jpg',
 ARRAY['lawn care', 'landscaping', 'plant care', 'weekly service'],
 false, true, 150.00, 'MYR', NULL, true, false, NULL, NULL, NULL,
 'service', NULL, 'Satisfaction guarantee', '30-day money back guarantee',
 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc', now()),

-- PRODUCTS
('ad1e8400-e29b-41d4-a716-446655440004', 'bfe88021-d76b-4f65-8b43-1b879ad4617a',
 'Refurbished Smartphone - iPhone 12', 
 'Excellent condition iPhone 12 with 128GB storage. Fully tested and certified. Includes original charger and protective case.',
 'TechFix Electronics', 'electronics', '+60176543210', 'techrepair@test.com', NULL,
 '/assets/iphone-marketplace.jpg',
 ARRAY['smartphone', 'iPhone', 'refurbished', 'warranty included'],
 true, true, 1299.00, 'MYR', 3, true, true, 15.00, 0.2, '14.7 x 7.2 x 0.8 cm',
 'product', 'refurbished', '6 months warranty', '14-day return policy',
 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc', now()),

('ad1e8400-e29b-41d4-a716-446655440005', 'bfe88021-d76b-4f65-8b43-1b879ad4617a',
 'Homemade Traditional Kuih Assortment', 
 'Fresh daily-made traditional Malaysian kuih including onde-onde, kuih lapis, and curry puffs. Perfect for events or daily treats.',
 'Siti Traditional Bakery', 'food', '+60165432109', 'homemade@test.com', NULL,
 '/activity-images/chinese-new-year-celebration.jpg',
 ARRAY['homemade', 'traditional', 'halal', 'fresh daily'],
 false, true, 25.00, 'MYR', 20, true, true, 8.00, 1.0, '25 x 20 x 10 cm',
 'product', 'new', 'Best consumed within 3 days', 'No returns for food items',
 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc', now()),

('ad1e8400-e29b-41d4-a716-446655440006', 'bfe88021-d76b-4f65-8b43-1b879ad4617a',
 'Gaming Setup - RGB Mechanical Keyboard', 
 'Brand new RGB mechanical keyboard with blue switches. Perfect for gaming and professional typing. Customizable lighting effects.',
 'TechFix Electronics', 'electronics', '+60176543210', 'techrepair@test.com', NULL,
 '/assets/programming-books-marketplace.jpg',
 ARRAY['gaming', 'mechanical keyboard', 'RGB', 'blue switches'],
 false, true, 299.00, 'MYR', 8, true, true, 12.00, 1.2, '44 x 13 x 4 cm',
 'product', 'new', '2 years manufacturer warranty', '30-day return policy',
 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc', now()),

('ad1e8400-e29b-41d4-a716-446655440007', 'bfe88021-d76b-4f65-8b43-1b879ad4617a',
 'Handcrafted Wooden Dining Table', 
 'Beautiful solid wood dining table for 6 people. Handcrafted with natural finish. Perfect for family gatherings.',
 'Green Thumb Woodworks', 'furniture', '+60187654321', 'gardencare@test.com', NULL,
 '/assets/dining-table-marketplace.jpg',
 ARRAY['handcrafted', 'solid wood', '6-seater', 'natural finish'],
 true, true, 899.00, 'MYR', 2, true, true, 50.00, 45.0, '180 x 90 x 75 cm',
 'product', 'new', '5 years craftsmanship warranty', '7-day return policy',
 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc', now()),

-- MIXED SERVICES & PRODUCTS
('ad1e8400-e29b-41d4-a716-446655440008', 'bfe88021-d76b-4f65-8b43-1b879ad4617a',
 'Catering Service + Homemade Cookies', 
 'Professional catering for events with option to purchase our signature homemade cookies separately. Specializing in Malaysian and Western cuisine.',
 'Siti Catering & Bakery', 'food', '+60165432109', 'homemade@test.com', 'https://siticatering.my',
 '/activity-images/chinese-new-year-celebration.jpg',
 ARRAY['catering', 'events', 'homemade cookies', 'halal certified'],
 false, true, 35.00, 'MYR', 50, true, true, 5.00, 0.8, '20 x 15 x 8 cm',
 'both', 'new', NULL, '24-hour cancellation policy',
 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc', now()),

('ad1e8400-e29b-41d4-a716-446655440009', 'bfe88021-d76b-4f65-8b43-1b879ad4617a',
 'Laptop Repair Service + Used Laptops', 
 'Professional laptop repair services and certified used laptops for sale. Specializing in business and gaming laptops.',
 'TechFix Solutions', 'electronics', '+60176543210', 'techrepair@test.com', 'https://techfix.my',
 '/assets/programming-books-marketplace.jpg',
 ARRAY['laptop repair', 'used laptops', 'warranty', 'business grade'],
 true, true, 799.00, 'MYR', 5, true, true, 25.00, 2.5, '35 x 25 x 3 cm',
 'both', 'refurbished', '1 year warranty', '30-day return policy',
 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc', now()),

-- OUT OF STOCK EXAMPLE
('ad1e8400-e29b-41d4-a716-446655440010', 'bfe88021-d76b-4f65-8b43-1b879ad4617a',
 'Limited Edition Raya Cookies Gift Box', 
 'Special Raya edition cookie gift box with premium packaging. Contains 12 varieties of traditional cookies. Limited quantity!',
 'Siti Premium Treats', 'food', '+60165432109', 'homemade@test.com', NULL,
 '/activity-images/chinese-new-year-celebration.jpg',
 ARRAY['limited edition', 'raya special', 'gift box', 'premium'],
 true, true, 75.00, 'MYR', 0, false, true, 12.00, 2.0, '30 x 25 x 15 cm',
 'product', 'new', 'Best consumed within 2 weeks', 'No returns for food items',
 'f44ef553-d0af-40e0-a9fd-aa741b5fd2fc', now());

-- Update click counts for some popular items
UPDATE advertisements SET click_count = 45 WHERE id = 'ad1e8400-e29b-41d4-a716-446655440001';
UPDATE advertisements SET click_count = 32 WHERE id = 'ad1e8400-e29b-41d4-a716-446655440004';
UPDATE advertisements SET click_count = 28 WHERE id = 'ad1e8400-e29b-41d4-a716-446655440007';
UPDATE advertisements SET click_count = 67 WHERE id = 'ad1e8400-e29b-41d4-a716-446655440009';
UPDATE advertisements SET click_count = 89 WHERE id = 'ad1e8400-e29b-41d4-a716-446655440010';