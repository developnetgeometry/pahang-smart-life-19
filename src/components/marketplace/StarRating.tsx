import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  totalReviews?: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  language?: 'en' | 'ms';
}

export default function StarRating({ 
  rating, 
  totalReviews, 
  size = 'md', 
  showText = true,
  language = 'en'
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const text = {
    en: {
      outOf5: 'out of 5',
      reviews: 'reviews',
      review: 'review'
    },
    ms: {
      outOf5: 'daripada 5',
      reviews: 'ulasan',
      review: 'ulasan'
    }
  };

  const t = text[language];

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
      
      {showText && (
        <div className={`${textSizeClasses[size]} text-muted-foreground`}>
          <span>{rating.toFixed(1)}</span>
          <span className="mx-1">{t.outOf5}</span>
          {totalReviews !== undefined && (
            <span>
              ({totalReviews} {totalReviews === 1 ? t.review : t.reviews})
            </span>
          )}
        </div>
      )}
    </div>
  );
}