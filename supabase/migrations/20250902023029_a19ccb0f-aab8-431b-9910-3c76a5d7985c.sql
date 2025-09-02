-- Create product reviews table
CREATE TABLE public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES marketplace_items(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(item_id, reviewer_id) -- One review per user per item
);

-- Create seller ratings aggregate table
CREATE TABLE public.seller_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL UNIQUE,
  total_reviews INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00 CHECK (average_rating >= 0 AND average_rating <= 5),
  one_star_count INTEGER DEFAULT 0,
  two_star_count INTEGER DEFAULT 0,
  three_star_count INTEGER DEFAULT 0,
  four_star_count INTEGER DEFAULT 0,
  five_star_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create review helpfulness tracking table
CREATE TABLE public.review_helpfulness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(review_id, user_id) -- One vote per user per review
);

-- Enable RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_helpfulness ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_reviews
CREATE POLICY "Everyone can view reviews" ON public.product_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.product_reviews
  FOR INSERT WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Users can update their own reviews" ON public.product_reviews
  FOR UPDATE USING (reviewer_id = auth.uid());

CREATE POLICY "Users can delete their own reviews" ON public.product_reviews
  FOR DELETE USING (reviewer_id = auth.uid());

-- RLS Policies for seller_ratings
CREATE POLICY "Everyone can view seller ratings" ON public.seller_ratings
  FOR SELECT USING (true);

CREATE POLICY "System can manage seller ratings" ON public.seller_ratings
  FOR ALL USING (true);

-- RLS Policies for review_helpfulness
CREATE POLICY "Everyone can view helpfulness votes" ON public.review_helpfulness
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their helpfulness votes" ON public.review_helpfulness
  FOR ALL USING (user_id = auth.uid());

-- Function to update seller ratings
CREATE OR REPLACE FUNCTION update_seller_ratings()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update seller ratings when new review is added
    INSERT INTO seller_ratings (seller_id, total_reviews, average_rating, one_star_count, two_star_count, three_star_count, four_star_count, five_star_count)
    VALUES (
      NEW.seller_id,
      1,
      NEW.rating,
      CASE WHEN NEW.rating = 1 THEN 1 ELSE 0 END,
      CASE WHEN NEW.rating = 2 THEN 1 ELSE 0 END,
      CASE WHEN NEW.rating = 3 THEN 1 ELSE 0 END,
      CASE WHEN NEW.rating = 4 THEN 1 ELSE 0 END,
      CASE WHEN NEW.rating = 5 THEN 1 ELSE 0 END
    )
    ON CONFLICT (seller_id) DO UPDATE SET
      total_reviews = seller_ratings.total_reviews + 1,
      average_rating = (
        SELECT ROUND(AVG(rating::DECIMAL), 2)
        FROM product_reviews 
        WHERE seller_id = NEW.seller_id
      ),
      one_star_count = seller_ratings.one_star_count + CASE WHEN NEW.rating = 1 THEN 1 ELSE 0 END,
      two_star_count = seller_ratings.two_star_count + CASE WHEN NEW.rating = 2 THEN 1 ELSE 0 END,
      three_star_count = seller_ratings.three_star_count + CASE WHEN NEW.rating = 3 THEN 1 ELSE 0 END,
      four_star_count = seller_ratings.four_star_count + CASE WHEN NEW.rating = 4 THEN 1 ELSE 0 END,
      five_star_count = seller_ratings.five_star_count + CASE WHEN NEW.rating = 5 THEN 1 ELSE 0 END,
      updated_at = now();
      
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'UPDATE' THEN
    -- Recalculate seller ratings when review is updated
    UPDATE seller_ratings SET
      average_rating = (
        SELECT ROUND(AVG(rating::DECIMAL), 2)
        FROM product_reviews 
        WHERE seller_id = NEW.seller_id
      ),
      one_star_count = (SELECT COUNT(*) FROM product_reviews WHERE seller_id = NEW.seller_id AND rating = 1),
      two_star_count = (SELECT COUNT(*) FROM product_reviews WHERE seller_id = NEW.seller_id AND rating = 2),
      three_star_count = (SELECT COUNT(*) FROM product_reviews WHERE seller_id = NEW.seller_id AND rating = 3),
      four_star_count = (SELECT COUNT(*) FROM product_reviews WHERE seller_id = NEW.seller_id AND rating = 4),
      five_star_count = (SELECT COUNT(*) FROM product_reviews WHERE seller_id = NEW.seller_id AND rating = 5),
      updated_at = now()
    WHERE seller_id = NEW.seller_id;
    
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    -- Update seller ratings when review is deleted
    UPDATE seller_ratings SET
      total_reviews = seller_ratings.total_reviews - 1,
      average_rating = COALESCE((
        SELECT ROUND(AVG(rating::DECIMAL), 2)
        FROM product_reviews 
        WHERE seller_id = OLD.seller_id
      ), 0),
      one_star_count = seller_ratings.one_star_count - CASE WHEN OLD.rating = 1 THEN 1 ELSE 0 END,
      two_star_count = seller_ratings.two_star_count - CASE WHEN OLD.rating = 2 THEN 1 ELSE 0 END,
      three_star_count = seller_ratings.three_star_count - CASE WHEN OLD.rating = 3 THEN 1 ELSE 0 END,
      four_star_count = seller_ratings.four_star_count - CASE WHEN OLD.rating = 4 THEN 1 ELSE 0 END,
      five_star_count = seller_ratings.five_star_count - CASE WHEN OLD.rating = 5 THEN 1 ELSE 0 END,
      updated_at = now()
    WHERE seller_id = OLD.seller_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating seller ratings
CREATE TRIGGER update_seller_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_seller_ratings();

-- Function to update review helpfulness count
CREATE OR REPLACE FUNCTION update_review_helpfulness_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE product_reviews 
    SET helpful_count = helpful_count + CASE WHEN NEW.is_helpful THEN 1 ELSE -1 END
    WHERE id = NEW.review_id;
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'UPDATE' THEN
    UPDATE product_reviews 
    SET helpful_count = helpful_count + 
      CASE 
        WHEN NEW.is_helpful AND NOT OLD.is_helpful THEN 2
        WHEN NOT NEW.is_helpful AND OLD.is_helpful THEN -2
        ELSE 0
      END
    WHERE id = NEW.review_id;
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    UPDATE product_reviews 
    SET helpful_count = helpful_count - CASE WHEN OLD.is_helpful THEN 1 ELSE -1 END
    WHERE id = OLD.review_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating review helpfulness count
CREATE TRIGGER update_review_helpfulness_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON review_helpfulness
  FOR EACH ROW EXECUTE FUNCTION update_review_helpfulness_count();

-- Create indexes for better performance
CREATE INDEX idx_product_reviews_item_id ON product_reviews(item_id);
CREATE INDEX idx_product_reviews_seller_id ON product_reviews(seller_id);
CREATE INDEX idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX idx_seller_ratings_seller_id ON seller_ratings(seller_id);
CREATE INDEX idx_review_helpfulness_review_id ON review_helpfulness(review_id);