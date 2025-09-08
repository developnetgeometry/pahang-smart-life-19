import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Phone, Mail, Globe, Star, MapPin, Calendar, Eye, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

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
  start_date: string;
  end_date: string;
  created_at: string;
  price: number;
  currency: string;
  stock_quantity: number;
  is_in_stock: boolean;
  shipping_required: boolean;
  shipping_cost: number;
  product_weight: number;
  product_dimensions: string;
  product_type: 'service' | 'product' | 'both';
  condition_status: string;
  warranty_period: string;
  return_policy: string;
}

export default function AdvertisementDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [advertisement, setAdvertisement] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdvertisement = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('advertisements')
          .select('*')
          .eq('id', id)
          .eq('is_active', true)
          .single();

        if (error) {
          console.error('Error fetching advertisement:', error);
          toast({
            title: "Error",
            description: "Advertisement not found or is no longer active.",
            variant: "destructive",
          });
          navigate('/marketplace');
          return;
        }

        setAdvertisement(data as Advertisement);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "Failed to load advertisement details.",
          variant: "destructive",
        });
        navigate('/marketplace');
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertisement();
  }, [id, navigate]);

  const handleContactClick = async (contactType: string) => {
    if (!advertisement) return;

    try {
      // Track the contact interaction
      await supabase
        .from('advertisements')
        .update({ 
          click_count: (advertisement.click_count || 0) + 1 
        })
        .eq('id', advertisement.id);

      // Handle different contact methods
      switch (contactType) {
        case 'phone':
          if (advertisement.contact_phone) {
            window.location.href = `tel:${advertisement.contact_phone}`;
          }
          break;
        case 'email':
          if (advertisement.contact_email) {
            window.location.href = `mailto:${advertisement.contact_email}`;
          }
          break;
        case 'website':
          if (advertisement.website_url) {
            window.open(advertisement.website_url, '_blank');
          }
          break;
      }
    } catch (error) {
      console.error('Error tracking contact interaction:', error);
    }
  };

  const handleBookService = async () => {
    if (!advertisement || !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book this service.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    try {
      // Track the booking interest
      await supabase
        .from('advertisements')
        .update({ 
          click_count: (advertisement.click_count || 0) + 1 
        })
        .eq('id', advertisement.id);

      // Create Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: {
          advertisementId: advertisement.id,
          businessName: advertisement.business_name,
          title: advertisement.title,
          price: advertisement.price ? Math.round(advertisement.price * 100) : 2999 // Use actual price or default
        }
      });

      if (error) {
        console.error('Stripe checkout error:', error);
        toast({
          title: "Booking Error",
          description: "Failed to initiate booking process. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        toast({
          title: "Booking Error",
          description: "Failed to create booking session.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error booking service:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="h-64 bg-muted rounded-lg animate-pulse" />
          <div className="space-y-4">
            <div className="h-6 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!advertisement) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Advertisement Not Found</h1>
          <p className="text-muted-foreground">
            The advertisement you're looking for doesn't exist or is no longer available.
          </p>
          <Button onClick={() => navigate('/marketplace')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/marketplace')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketplace
        </Button>
        {advertisement.is_featured && (
          <div className="flex items-center gap-1 text-yellow-600">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium">Featured {advertisement.product_type === 'service' ? 'Service' : advertisement.product_type === 'product' ? 'Product' : 'Listing'}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          {advertisement.image_url && (
            <Card>
              <CardContent className="p-0">
                <img
                  src={advertisement.image_url}
                  alt={advertisement.title}
                  className="w-full h-64 md:h-80 object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          )}

          {/* Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{advertisement.title}</CardTitle>
                  <p className="text-lg text-muted-foreground mb-4">{advertisement.business_name}</p>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>{advertisement.click_count} views</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pricing */}
              {advertisement.price && (
                <div className="bg-primary/5 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {advertisement.currency} {advertisement.price.toFixed(2)}
                      </p>
                      {advertisement.product_type === 'product' && (
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={advertisement.is_in_stock ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {advertisement.is_in_stock ? 'In Stock' : 'Out of Stock'}
                          </Badge>
                          {advertisement.stock_quantity && advertisement.is_in_stock && (
                            <span className="text-sm text-muted-foreground">
                              {advertisement.stock_quantity} available
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {advertisement.condition_status && advertisement.product_type === 'product' && (
                      <Badge variant="outline" className="capitalize">
                        {advertisement.condition_status}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">
                  {advertisement.product_type === 'service' ? 'Service' : 
                   advertisement.product_type === 'product' ? 'Product' : 'Item'} Description
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {advertisement.description}
                </p>
              </div>

              {/* Product Specifications */}
              {advertisement.product_type === 'product' && (advertisement.product_weight || advertisement.product_dimensions) && (
                <div>
                  <h3 className="font-semibold mb-2">Specifications</h3>
                  <div className="space-y-2 text-sm">
                    {advertisement.product_dimensions && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dimensions:</span>
                        <span>{advertisement.product_dimensions}</span>
                      </div>
                    )}
                    {advertisement.product_weight && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Weight:</span>
                        <span>{advertisement.product_weight} kg</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Shipping Information */}
              {advertisement.shipping_required && (
                <div>
                  <h3 className="font-semibold mb-2">Shipping Information</h3>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm">
                      {advertisement.shipping_cost > 0 
                        ? `Shipping cost: ${advertisement.currency} ${advertisement.shipping_cost.toFixed(2)}`
                        : 'Free shipping available'
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Warranty & Return Policy */}
              {(advertisement.warranty_period || advertisement.return_policy) && (
                <div>
                  <h3 className="font-semibold mb-2">Warranty & Returns</h3>
                  <div className="space-y-2 text-sm">
                    {advertisement.warranty_period && (
                      <div>
                        <span className="font-medium">Warranty:</span>
                        <p className="text-muted-foreground mt-1">{advertisement.warranty_period}</p>
                      </div>
                    )}
                    {advertisement.return_policy && (
                      <div>
                        <span className="font-medium">Return Policy:</span>
                        <p className="text-muted-foreground mt-1">{advertisement.return_policy}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              {advertisement.tags && advertisement.tags.length > 0 && (
                <div>
                   <h3 className="font-semibold mb-2">
                     {advertisement.product_type === 'service' ? 'Services Offered' : 
                      advertisement.product_type === 'product' ? 'Features' : 'Tags'}
                   </h3>
                  <div className="flex flex-wrap gap-2">
                    {advertisement.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Category */}
              <div>
                <h3 className="font-semibold mb-2">Category</h3>
                <Badge variant="outline" className="capitalize">
                  {advertisement.category}
                </Badge>
              </div>

              {/* Service Period */}
              {advertisement.start_date && advertisement.end_date && (
                <div>
                  <h3 className="font-semibold mb-2">Service Period</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(advertisement.start_date).toLocaleDateString()} - {' '}
                      {new Date(advertisement.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Card */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {advertisement.contact_phone && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleContactClick('phone')}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  {advertisement.contact_phone}
                </Button>
              )}

              {advertisement.contact_email && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleContactClick('email')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {advertisement.contact_email}
                </Button>
              )}

              {advertisement.website_url && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleContactClick('website')}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Visit Website
                </Button>
              )}

              <Separator />

              <Button
                className="w-full"
                onClick={handleBookService}
                disabled={advertisement.product_type === 'product' && !advertisement.is_in_stock}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {advertisement.product_type === 'service' ? 'Book This Service' : 
                 advertisement.product_type === 'product' ? 'Buy Now' : 'Purchase'}
              </Button>
            </CardContent>
          </Card>

          {/* Service Info */}
          <Card>
            <CardHeader>
              <CardTitle>
                {advertisement.product_type === 'service' ? 'Service' : 
                 advertisement.product_type === 'product' ? 'Product' : 'Item'} Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Listed on:</span>
                <span>{new Date(advertisement.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total views:</span>
                <span>{advertisement.click_count}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Category:</span>
                <span className="capitalize">{advertisement.category}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}