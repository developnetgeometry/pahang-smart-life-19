-- Create comprehensive marketplace tables to eliminate hardcoded data (Fixed version)

-- Product categories table
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES public.product_categories(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default categories
INSERT INTO public.product_categories (name, description) VALUES
('Electronics', 'Electronic devices and gadgets'),
('Clothing', 'Apparel and accessories'),
('Home & Garden', 'Home improvement and garden supplies'),
('Books', 'Books and educational materials'),
('Sports', 'Sports and fitness equipment'),
('Automotive', 'Car parts and accessories'),
('Health & Beauty', 'Health and beauty products'),
('Toys & Games', 'Children toys and games'),
('Food & Beverages', 'Food and drink items'),
('Services', 'Professional services')
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