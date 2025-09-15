import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  reviewer_id: string;
  reviewer_name?: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  user_voted_helpful?: boolean | null;
}

interface ProductReviewsProps {
  itemId: string;
  sellerId: string;
  language: 'en' | 'ms';
}

export default function ProductReviews({ itemId, sellerId, language }: ProductReviewsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  
  // Form state
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: ''
  });

  const text = {
    en: {
      reviews: 'Reviews',
      noReviews: 'No reviews yet',
      beFirst: 'Be the first to review this product!',
      writeReview: 'Write a Review',
      yourRating: 'Your Rating',
      reviewTitle: 'Review Title',
      reviewComment: 'Your Review',
      submit: 'Submit Review',
      cancel: 'Cancel',
      verified: 'Verified Purchase',
      helpful: 'Helpful',
      notHelpful: 'Not Helpful',
      outOf5: 'out of 5 stars',
      loginRequired: 'Please login to write a review',
      reviewSuccess: 'Review submitted successfully!',
      reviewError: 'Failed to submit review',
      alreadyReviewed: 'You have already reviewed this product',
      cantReviewOwn: 'You cannot review your own product'
    },
    ms: {
      reviews: 'Ulasan',
      noReviews: 'Tiada ulasan lagi',
      beFirst: 'Jadilah yang pertama mengulas produk ini!',
      writeReview: 'Tulis Ulasan',
      yourRating: 'Penilaian Anda',
      reviewTitle: 'Tajuk Ulasan',
      reviewComment: 'Ulasan Anda',
      submit: 'Hantar Ulasan',
      cancel: 'Batal',
      verified: 'Pembelian Disahkan',
      helpful: 'Berguna',
      notHelpful: 'Tidak Berguna',
      outOf5: 'daripada 5 bintang',
      loginRequired: 'Sila log masuk untuk menulis ulasan',
      reviewSuccess: 'Ulasan berjaya dihantar!',
      reviewError: 'Gagal menghantar ulasan',
      alreadyReviewed: 'Anda telah mengulas produk ini',
      cantReviewOwn: 'Anda tidak boleh mengulas produk sendiri'
    }
  };

  const t = text[language];

  useEffect(() => {
    fetchReviews();
  }, [itemId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      // Fetch reviews with optional user helpfulness votes
      const { data: reviewsData, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          review_helpfulness(is_helpful)
        `)
        .eq('item_id', itemId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user profiles for reviewer names (simplified for demo)
      const reviewsWithProfiles = (reviewsData || []).map(review => ({
        ...review,
        reviewer_name: 'Anonymous User', // In real app, fetch from profiles
        user_voted_helpful: user && review.review_helpfulness ? 
          review.review_helpfulness.find((vote: any) => vote.user_id === user.id)?.is_helpful || null 
          : null
      }));

      setReviews(reviewsWithProfiles);
      
      // Calculate average rating
      if (reviewsWithProfiles.length > 0) {
        const avg = reviewsWithProfiles.reduce((sum, review) => sum + review.rating, 0) / reviewsWithProfiles.length;
        setAverageRating(Number(avg.toFixed(1)));
        setTotalReviews(reviewsWithProfiles.length);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: t.loginRequired,
        variant: 'destructive'
      });
      return;
    }

    if (user.id === sellerId) {
      toast({
        title: t.cantReviewOwn,
        variant: 'destructive'
      });
      return;
    }

    if (!newReview.title.trim() || !newReview.comment.trim()) {
      return;
    }

    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('product_reviews')
        .insert({
          item_id: itemId,
          seller_id: sellerId,
          reviewer_id: user.id,
          rating: newReview.rating,
          title: newReview.title.trim(),
          comment: newReview.comment.trim(),
          is_verified_purchase: false // TODO: Check if user actually purchased
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: t.alreadyReviewed,
            variant: 'destructive'
          });
          return;
        }
        throw error;
      }

      toast({
        title: t.reviewSuccess,
      });

      // Reset form and close dialog
      setNewReview({ rating: 5, title: '', comment: '' });
      setIsCreateOpen(false);
      
      // Refresh reviews
      await fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: t.reviewError,
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpfulVote = async (reviewId: string, isHelpful: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('review_helpfulness')
        .upsert({
          review_id: reviewId,
          user_id: user.id,
          is_helpful: isHelpful
        });

      if (error) throw error;
      
      // Refresh reviews to update helpful counts
      await fetchReviews();
    } catch (error) {
      console.error('Error voting on review helpfulness:', error);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    return (
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
    );
  };

  const renderRatingInput = () => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setNewReview({ ...newReview, rating: star })}
          className="transition-colors"
        >
          <Star
            className={`h-6 w-6 ${
              star <= newReview.rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground hover:text-yellow-400'
            }`}
          />
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.reviews}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full mb-1"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <></>
    // <Card>
    //   <CardHeader>
    //     <div className="flex items-center justify-between">
    //       <div>
    //         <CardTitle>{t.reviews}</CardTitle>
    //         {totalReviews > 0 && (
    //           <CardDescription className="flex items-center space-x-2 mt-1">
    //             {renderStars(averageRating)}
    //             <span>{averageRating} {t.outOf5} ({totalReviews} reviews)</span>
    //           </CardDescription>
    //         )}
    //       </div>
          
    //       <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
    //         <DialogTrigger asChild>
    //           <Button variant="outline">
    //             <MessageSquare className="h-4 w-4 mr-2" />
    //             {t.writeReview}
    //           </Button>
    //         </DialogTrigger>
    //         <DialogContent>
    //           <DialogHeader>
    //             <DialogTitle>{t.writeReview}</DialogTitle>
    //             <DialogDescription>
    //               Share your experience with this product
    //             </DialogDescription>
    //           </DialogHeader>
              
    //           <div className="space-y-4">
    //             <div>
    //               <Label>{t.yourRating}</Label>
    //               {renderRatingInput()}
    //             </div>
                
    //             <div>
    //               <Label htmlFor="title">{t.reviewTitle}</Label>
    //               <Input
    //                 id="title"
    //                 value={newReview.title}
    //                 onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
    //                 placeholder="Summarize your review"
    //               />
    //             </div>
                
    //             <div>
    //               <Label htmlFor="comment">{t.reviewComment}</Label>
    //               <Textarea
    //                 id="comment"
    //                 value={newReview.comment}
    //                 onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
    //                 placeholder="Tell others about your experience"
    //                 rows={4}
    //               />
    //             </div>
                
    //             <div className="flex justify-end space-x-2">
    //               <Button
    //                 variant="outline"
    //                 onClick={() => setIsCreateOpen(false)}
    //               >
    //                 {t.cancel}
    //               </Button>
    //               <Button
    //                 onClick={handleSubmitReview}
    //                 disabled={submitting || !newReview.title.trim() || !newReview.comment.trim()}
    //               >
    //                 {submitting ? 'Submitting...' : t.submit}
    //               </Button>
    //             </div>
    //           </div>
    //         </DialogContent>
    //       </Dialog>
    //     </div>
    //   </CardHeader>
      
    //   <CardContent>
    //     {reviews.length === 0 ? (
    //       <div className="text-center py-8 text-muted-foreground">
    //         <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
    //         <p>{t.noReviews}</p>
    //         <p className="text-sm">{t.beFirst}</p>
    //       </div>
    //     ) : (
    //       <div className="space-y-6">
    //         {reviews.map((review) => (
    //           <div key={review.id} className="border-b pb-6 last:border-b-0">
    //             <div className="flex items-start space-x-4">
    //               <Avatar>
    //                 <AvatarFallback>
    //                   {review.reviewer_name?.charAt(0) || 'U'}
    //                 </AvatarFallback>
    //               </Avatar>
                  
    //               <div className="flex-1 space-y-2">
    //                 <div className="flex items-center space-x-2">
    //                   {renderStars(review.rating, 'sm')}
    //                   {review.is_verified_purchase && (
    //                     <Badge variant="secondary" className="text-xs">
    //                       {t.verified}
    //                     </Badge>
    //                   )}
    //                 </div>
                    
    //                 <h4 className="font-medium">{review.title}</h4>
    //                 <p className="text-sm text-muted-foreground">
    //                   by {review.reviewer_name} on {new Date(review.created_at).toLocaleDateString()}
    //                 </p>
    //                 <p className="text-sm">{review.comment}</p>
                    
    //                 {user && (
    //                   <div className="flex items-center space-x-4 pt-2">
    //                     <button
    //                       onClick={() => handleHelpfulVote(review.id, true)}
    //                       className={`flex items-center space-x-1 text-xs transition-colors ${
    //                         review.user_voted_helpful === true
    //                           ? 'text-green-600'
    //                           : 'text-muted-foreground hover:text-green-600'
    //                       }`}
    //                     >
    //                       <ThumbsUp className="h-3 w-3" />
    //                       <span>{t.helpful}</span>
    //                     </button>
                        
    //                     <button
    //                       onClick={() => handleHelpfulVote(review.id, false)}
    //                       className={`flex items-center space-x-1 text-xs transition-colors ${
    //                         review.user_voted_helpful === false
    //                           ? 'text-red-600'
    //                           : 'text-muted-foreground hover:text-red-600'
    //                       }`}
    //                     >
    //                       <ThumbsDown className="h-3 w-3" />
    //                       <span>{t.notHelpful}</span>
    //                     </button>
                        
    //                     {review.helpful_count > 0 && (
    //                       <span className="text-xs text-muted-foreground">
    //                         {review.helpful_count} people found this helpful
    //                       </span>
    //                     )}
    //                   </div>
    //                 )}
    //               </div>
    //             </div>
    //           </div>
    //         ))}
    //       </div>
    //     )}
    //   </CardContent>
    // </Card>
  );
}