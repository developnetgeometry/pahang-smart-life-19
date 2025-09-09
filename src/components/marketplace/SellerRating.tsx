import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import StarRating from './StarRating';
import { supabase } from '@/integrations/supabase/client';

interface SellerRatingData {
  seller_id: string;
  total_reviews: number;
  average_rating: number;
  one_star_count: number;
  two_star_count: number;
  three_star_count: number;
  four_star_count: number;
  five_star_count: number;
}

interface SellerRatingProps {
  sellerId: string;
  language: 'en' | 'ms';
}

export default function SellerRating({ sellerId, language }: SellerRatingProps) {
  const [rating, setRating] = useState<SellerRatingData | null>(null);
  const [loading, setLoading] = useState(true);

  const text = {
    en: {
      sellerRating: 'Seller Rating',
      overallRating: 'Overall Rating',
      ratingBreakdown: 'Rating Breakdown',
      stars: 'stars',
      star: 'star'
    },
    ms: {
      sellerRating: 'Penilaian Penjual',
      overallRating: 'Penilaian Keseluruhan',
      ratingBreakdown: 'Pecahan Penilaian',
      stars: 'bintang',
      star: 'bintang'
    }
  };

  const t = text[language];

  useEffect(() => {
    fetchSellerRating();
  }, [sellerId]);

  const fetchSellerRating = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('seller_ratings')
        .select('*')
        .eq('seller_id', sellerId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error is OK
        throw error;
      }

      setRating(data);
    } catch (error) {
      console.error('Error fetching seller rating:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="animate-pulse">
            <div className="h-5 bg-muted rounded w-32"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!rating || rating.total_reviews === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.sellerRating}</CardTitle>
          <CardDescription>No reviews yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const ratingBreakdown = [
    { stars: 5, count: rating.five_star_count },
    { stars: 4, count: rating.four_star_count },
    { stars: 3, count: rating.three_star_count },
    { stars: 2, count: rating.two_star_count },
    { stars: 1, count: rating.one_star_count }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.sellerRating}</CardTitle>
        <CardDescription>{t.overallRating}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="text-3xl font-bold">
            {rating.average_rating.toFixed(1)}
          </div>
          <div>
            <StarRating
              rating={rating.average_rating}
              totalReviews={rating.total_reviews}
              size="lg"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">{t.ratingBreakdown}</h4>
          {ratingBreakdown.map(({ stars, count }) => (
            <div key={stars} className="flex items-center space-x-2 text-sm">
              <span className="w-8">{stars}</span>
              <StarRating
                rating={stars}
                size="sm"
                showText={false}
              />
              <Progress
                value={(count / rating.total_reviews) * 100}
                className="flex-1 h-2"
              />
              <span className="w-8 text-right text-muted-foreground">
                {count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}