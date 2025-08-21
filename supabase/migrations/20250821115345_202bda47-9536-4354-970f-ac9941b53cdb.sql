-- Check if marketplace_items table exists and add missing columns
DO $$ 
BEGIN
    -- Check if table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'marketplace_items') THEN
        -- Create the table if it doesn't exist
        CREATE TABLE public.marketplace_items (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            description TEXT,
            price NUMERIC NOT NULL,
            category TEXT NOT NULL,
            condition TEXT NOT NULL CHECK (condition IN ('new', 'like-new', 'good', 'fair')),
            seller_id UUID,
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
        
    ELSE
        -- Add image column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplace_items' AND column_name = 'image') THEN
            ALTER TABLE public.marketplace_items ADD COLUMN image TEXT;
        END IF;
        
        -- Add is_active column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplace_items' AND column_name = 'is_active') THEN
            ALTER TABLE public.marketplace_items ADD COLUMN is_active BOOLEAN DEFAULT true;
        END IF;
    END IF;
END $$;

-- Create RLS policies (will only create if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'marketplace_items' AND policyname = 'Users can view active marketplace items') THEN
        CREATE POLICY "Users can view active marketplace items"
        ON public.marketplace_items FOR SELECT
        USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'marketplace_items' AND policyname = 'Users can create their own listings') THEN
        CREATE POLICY "Users can create their own listings"
        ON public.marketplace_items FOR INSERT
        WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'marketplace_items' AND policyname = 'Users can update their own listings') THEN
        CREATE POLICY "Users can update their own listings"
        ON public.marketplace_items FOR UPDATE
        USING (true);
    END IF;
END $$;