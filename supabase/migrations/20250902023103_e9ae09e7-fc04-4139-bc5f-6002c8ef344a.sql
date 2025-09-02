-- Fix security issues: Add proper search_path to functions
CREATE OR REPLACE FUNCTION update_seller_ratings()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Fix search_path for review helpfulness function
CREATE OR REPLACE FUNCTION update_review_helpfulness_count()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;