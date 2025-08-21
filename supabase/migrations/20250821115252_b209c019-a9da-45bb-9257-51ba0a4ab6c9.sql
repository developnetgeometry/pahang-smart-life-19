-- Create marketplace_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('new', 'like-new', 'good', 'fair')),
  seller_id UUID REFERENCES auth.users(id),
  seller_name TEXT,
  seller_rating NUMERIC DEFAULT 0,
  location TEXT,
  image TEXT,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_favorite BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  district_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view active marketplace items"
ON public.marketplace_items FOR SELECT
USING (is_active = true);

CREATE POLICY "Users can create their own listings"
ON public.marketplace_items FOR INSERT
WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Users can update their own listings"
ON public.marketplace_items FOR UPDATE
USING (seller_id = auth.uid());

-- Insert sample data
INSERT INTO public.marketplace_items (
  title, description, price, category, condition, seller_name, seller_rating, 
  location, image, created_at
) VALUES
  ('iPhone 13 Pro Max', 'Excellent condition, comes with original box and charger', 3500, 'electronics', 'like-new', 'John Doe', 4.8, 'Block A, Unit 15-2', 'iphone-marketplace.jpg', '2024-01-15'),
  ('IKEA Dining Table Set', '6-seater dining table with chairs, good condition', 800, 'furniture', 'good', 'Sarah Chen', 4.5, 'Block B, Unit 8-1', 'dining-table-marketplace.jpg', '2024-01-12'),
  ('Programming Books Collection', 'Various programming books, perfect for students', 150, 'books', 'good', 'Mike Wong', 4.9, 'Block C, Unit 12-5', 'programming-books-marketplace.jpg', '2024-01-10');