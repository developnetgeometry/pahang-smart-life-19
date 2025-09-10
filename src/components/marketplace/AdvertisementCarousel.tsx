import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ExternalLink, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Advertisement {
  id: string;
  title: string;
  description: string;
  image_url: string;
  business_name: string;
  contact_phone: string;
  contact_email: string;
  website_url: string;
  category: string;
  tags: string[];
  service_areas: string[];
  is_featured: boolean;
  click_count: number;
  price: number;
  currency: string;
  stock_quantity: number;
  is_in_stock: boolean;
  shipping_required: boolean;
  shipping_cost: number;
  product_type: 'service' | 'product' | 'both';
  condition_status: string;
}

interface AdvertisementCarouselProps {
  language: 'en' | 'ms';
}

export default function AdvertisementCarousel({ language }: AdvertisementCarouselProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const text = {
    en: {
      title: 'Services & Products',
      subtitle: 'Discover local services and products in your community',
      featured: 'Featured',
      contact: 'Contact',
      website: 'Website',
      viewMore: 'View Details',
      noAds: 'No advertisements available',
      outOfStock: 'Out of Stock',
      inStock: 'In Stock',
      freeShipping: 'Free Shipping',
      shippingCost: 'Shipping'
    },
    ms: {
      title: 'Perkhidmatan & Produk',
      subtitle: 'Temui perkhidmatan dan produk tempatan dalam komuniti anda',
      featured: 'Pilihan',
      contact: 'Hubungi',
      website: 'Laman Web',
      viewMore: 'Lihat Butiran',
      noAds: 'Tiada iklan tersedia',
      outOfStock: 'Kehabisan Stok',
      inStock: 'Ada Stok',
      freeShipping: 'Penghantaran Percuma',
      shippingCost: 'Penghantaran'
    }
  };

  const t = text[language];

  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        // Add timeout and limit results for better performance
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 3000)
        );

        const queryPromise = supabase
          .from('advertisements')
          .select('*')
          .eq('is_active', true)
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(5); // Limit to 5 ads for better performance

        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

        if (error) throw error;

        setAdvertisements(data || []);
      } catch (error) {
        console.error('Error fetching advertisements:', error);
        // Silently fail and show no ads rather than blocking the page
        setAdvertisements([]);
      } finally {
        setLoading(false);
      }
    };

    // Add delay to prevent blocking initial page render
    const timer = setTimeout(fetchAdvertisements, 200);
    return () => clearTimeout(timer);
  }, []);

  const handleAdClick = async (adId: string) => {
    try {
      const { error } = await supabase.functions.invoke('track-ad-click', {
        body: { adId }
      });

      if (error) {
        console.error('Error tracking ad click:', error);
      }
    } catch (error) {
      console.error('Error tracking ad click:', error);
    }
  };

  const handleViewDetails = async (ad: Advertisement) => {
    // Track the click
    await handleAdClick(ad.id);
    
    // Navigate to the advertisement detail page
    navigate(`/advertisement/${ad.id}`);
  };

  const handleBuyNow = async (ad: Advertisement) => {
    console.log('Buy Now button clicked!', { ad, user });
    
    try {
      if (!user) {
        console.log('User not authenticated, redirecting to login');
        // Redirect to login if user is not authenticated
        window.location.href = '/login';
        return;
      }

      console.log('User authenticated, proceeding with purchase');
      
      // Track the click
      handleAdClick(ad.id);

      console.log('Calling Stripe edge function...');
      
      // Create Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: {
          advertisementId: ad.id,
          businessName: ad.business_name,
          title: ad.title,
          price: 2999 // Default price 29.99 RM in cents - you can make this dynamic
        }
      });

      console.log('Stripe response:', { data, error });

      if (error) {
        console.error('Stripe checkout error:', error);
        alert(`Stripe Error: ${error.message}`);
        throw error;
      }

      if (data?.url) {
        console.log('Opening Stripe checkout URL:', data.url);
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      } else {
        console.error('No checkout URL received from Stripe');
        alert('Failed to create checkout session - no URL received');
      }
    } catch (error) {
      console.error('Error initiating purchase:', error);
      alert(`Purchase Error: ${error.message || 'Unknown error occurred'}`);
    }
  };

  // Auto-advance slideshow
  useEffect(() => {
    if (advertisements.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === advertisements.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [advertisements.length, isPaused]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === advertisements.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? advertisements.length - 1 : prevIndex - 1
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 bg-muted rounded w-64 animate-pulse" />
            <div className="h-4 bg-muted rounded w-48 mt-2 animate-pulse" />
          </div>
        </div>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="h-48 bg-muted animate-pulse" />
            <div className="p-6">
              <div className="h-4 bg-muted rounded mb-4 animate-pulse" />
              <div className="h-4 bg-muted rounded w-3/4 mb-2 animate-pulse" />
              <div className="h-6 bg-muted rounded w-1/2 mb-4 animate-pulse" />
              <div className="h-10 bg-muted rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (advertisements.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">{t.title}</h2>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-muted rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-muted-foreground text-sm">{t.noAds}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentAd = advertisements[currentIndex];

  return (
    <div 
      className="space-y-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{t.title}</h2>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
        {advertisements.length > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              disabled={advertisements.length <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              disabled={advertisements.length <= 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative">
            {currentAd.image_url && (
              <div className="h-48 overflow-hidden">
                <img
                  src={currentAd.image_url}
                  alt={currentAd.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{currentAd.title}</h3>
                    {currentAd.is_featured && (
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      </div>
                    )}
                  </div>
                   <p className="text-sm text-muted-foreground mb-2">{currentAd.business_name}</p>
                   {currentAd.description && (
                     <p className="text-sm mb-4">{currentAd.description}</p>
                   )}
                   
                   {/* Price and Stock Information */}
                   <div className="flex items-center gap-4 mb-3">
                     {currentAd.price && (
                       <div className="flex items-center gap-1">
                         <span className="text-lg font-bold text-primary">
                           {currentAd.currency} {currentAd.price.toFixed(2)}
                         </span>
                       </div>
                     )}
                     
                     {currentAd.product_type === 'product' && (
                       <Badge 
                         variant={currentAd.is_in_stock ? "default" : "destructive"}
                         className="text-xs"
                       >
                         {currentAd.is_in_stock ? t.inStock : t.outOfStock}
                       </Badge>
                     )}
                     
                     {currentAd.shipping_required && (
                       <Badge variant="outline" className="text-xs">
                         {currentAd.shipping_cost > 0 
                           ? `${t.shippingCost}: ${currentAd.currency} ${currentAd.shipping_cost.toFixed(2)}`
                           : t.freeShipping
                         }
                       </Badge>
                     )}
                   </div>

                   {/* Service Areas */}
                   {currentAd.service_areas && currentAd.service_areas.length > 0 && (
                     <div className="mb-3">
                       <p className="text-xs text-muted-foreground mb-1">
                         {language === 'en' ? 'Service Areas:' : 'Kawasan Perkhidmatan:'}
                       </p>
                       <div className="flex flex-wrap gap-1">
                         {currentAd.service_areas.slice(0, 3).map((area, index) => (
                           <Badge key={index} variant="secondary" className="text-xs">
                             {area}
                           </Badge>
                         ))}
                         {currentAd.service_areas.length > 3 && (
                           <Badge variant="outline" className="text-xs">
                             +{currentAd.service_areas.length - 3} more
                           </Badge>
                         )}
                       </div>
                     </div>
                   )}
                   
                   {currentAd.tags && currentAd.tags.length > 0 && (
                     <div className="flex flex-wrap gap-1 mb-4">
                       {currentAd.tags.slice(0, 4).map((tag, index) => (
                         <Badge key={index} variant="outline" className="text-xs">
                           {tag}
                         </Badge>
                       ))}
                       {currentAd.tags.length > 4 && (
                         <Badge variant="outline" className="text-xs text-muted-foreground">
                           +{currentAd.tags.length - 4}
                         </Badge>
                       )}
                     </div>
                   )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleViewDetails(currentAd)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {language === 'en' ? 'View Details' : 'Lihat Butiran'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {advertisements.length > 1 && (
        <div className="flex justify-center gap-2">
          {advertisements.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary' : 'bg-muted'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}

    </div>
  );
}