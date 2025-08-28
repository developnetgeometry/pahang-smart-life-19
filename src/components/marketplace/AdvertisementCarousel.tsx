import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ExternalLink, Phone, Mail, Globe, Star } from 'lucide-react';
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
  is_featured: boolean;
  click_count: number;
}

interface AdvertisementCarouselProps {
  language: 'en' | 'ms';
}

export default function AdvertisementCarousel({ language }: AdvertisementCarouselProps) {
  const { user } = useAuth();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const text = {
    en: {
      title: 'Service Provider Advertisements',
      subtitle: 'Discover local services in your community',
      featured: 'Featured',
      contact: 'Contact',
      website: 'Website',
      viewMore: 'View More',
      noAds: 'No advertisements available'
    },
    ms: {
      title: 'Iklan Penyedia Perkhidmatan',
      subtitle: 'Temui perkhidmatan tempatan dalam komuniti anda',
      featured: 'Pilihan',
      contact: 'Hubungi',
      website: 'Laman Web',
      viewMore: 'Lihat Lebih',
      noAds: 'Tiada iklan tersedia'
    }
  };

  const t = text[language];

  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        const { data, error } = await supabase
          .from('advertisements')
          .select('*')
          .eq('is_active', true)
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        setAdvertisements(data || []);
      } catch (error) {
        console.error('Error fetching advertisements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertisements();
  }, []);

  const handleAdClick = async (adId: string) => {
    try {
      // Get current click count and increment it
      const { data: currentAd } = await supabase
        .from('advertisements')
        .select('click_count')
        .eq('id', adId)
        .single();
      
      if (currentAd) {
        await supabase
          .from('advertisements')
          .update({ click_count: (currentAd.click_count || 0) + 1 })
          .eq('id', adId);
      }
    } catch (error) {
      console.error('Error updating click count:', error);
    }
  };

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
        <div className="h-48 bg-muted rounded-lg animate-pulse" />
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
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">{t.noAds}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentAd = advertisements[currentIndex];

  return (
    <div className="space-y-4">
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
                  {currentAd.tags && currentAd.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {currentAd.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {currentAd.contact_phone && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleAdClick(currentAd.id);
                      window.location.href = `tel:${currentAd.contact_phone}`;
                    }}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {t.contact}
                  </Button>
                )}
                {currentAd.contact_email && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleAdClick(currentAd.id);
                      window.location.href = `mailto:${currentAd.contact_email}`;
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                )}
                {currentAd.website_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleAdClick(currentAd.id);
                      window.open(currentAd.website_url, '_blank');
                    }}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    {t.website}
                  </Button>
                )}
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