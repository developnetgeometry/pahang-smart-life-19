-- Check if marketplace_items table exists, if not create it with basic structure
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'marketplace_items') THEN
    CREATE TABLE public.marketplace_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      price NUMERIC NOT NULL,
      category TEXT NOT NULL,
      condition TEXT NOT NULL,
      seller TEXT,
      seller_rating NUMERIC DEFAULT 0,
      location TEXT,
      posted_date DATE DEFAULT CURRENT_DATE,
      image TEXT,
      is_favorite BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- Enable RLS
    ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
    
    -- RLS policy
    CREATE POLICY "Users can view marketplace items"
    ON public.marketplace_items FOR SELECT
    USING (true);
    
    -- Insert sample data  
    INSERT INTO public.marketplace_items (
      title, description, price, category, condition, seller, seller_rating, 
      location, image, posted_date
    ) VALUES
      ('iPhone 13 Pro Max', 'Excellent condition, comes with original box and charger', 3500, 'electronics', 'like-new', 'John Doe', 4.8, 'Block A, Unit 15-2', 'iphone-marketplace.jpg', '2024-01-15'),
      ('IKEA Dining Table Set', '6-seater dining table with chairs, good condition', 800, 'furniture', 'good', 'Sarah Chen', 4.5, 'Block B, Unit 8-1', 'dining-table-marketplace.jpg', '2024-01-12'),
      ('Programming Books Collection', 'Various programming books, perfect for students', 150, 'books', 'good', 'Mike Wong', 4.9, 'Block C, Unit 12-5', 'programming-books-marketplace.jpg', '2024-01-10');
  ELSE
    -- Add image column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplace_items' AND column_name = 'image') THEN
      ALTER TABLE public.marketplace_items ADD COLUMN image TEXT;
    END IF;
  END IF;
END
$$;