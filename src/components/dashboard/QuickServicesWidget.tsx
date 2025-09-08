import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Phone, ArrowRight, Mail, Clock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface QuickServicesWidgetProps {
  language: 'en' | 'ms';
}

interface ServiceItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  price?: number;
  currency?: string;
  business_name: string;
  is_active: boolean;
  contact_phone?: string;
  contact_email?: string;
  service_areas?: string[];
  rating?: number;
  review_count?: number;
  distance?: number;
  location?: string;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

// Simple distance calculation using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Mock coordinates for service locations (in a real app, these would be in the database)
const getServiceCoordinates = (businessName: string): { lat: number; lng: number } | null => {
  const mockCoordinates: Record<string, { lat: number; lng: number }> = {
    "Ahmad Plumbing Solutions": { lat: 3.2255, lng: 101.4531 },
    "Segar Mart Express": { lat: 3.2280, lng: 101.4550 },
    "Sparkle Clean Pro": { lat: 3.2290, lng: 101.4520 },
  };
  return mockCoordinates[businessName] || null;
};

export function QuickServicesWidget({ language }: QuickServicesWidgetProps) {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string>('');

  // Get user's geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Geolocation error:', error);
          setLocationError('Location access denied');
          // Set default location (Kuala Selangor area)
          setUserLocation({ latitude: 3.2278, longitude: 101.4551 });
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    } else {
      setLocationError('Geolocation not supported');
      setUserLocation({ latitude: 3.2278, longitude: 101.4551 });
    }
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('advertisements')
          .select(`
            id, 
            title, 
            description,
            category, 
            price, 
            currency, 
            business_name, 
            is_active,
            contact_phone,
            contact_email,
            service_areas
          `)
          .eq('is_active', true)
          .eq('product_type', 'service')
          .limit(3);

        if (error) {
          console.error('Error fetching services:', error);
          return;
        }

        let servicesWithDistance = (data || []).map(service => {
          // Calculate distance if user location is available
          let distance: number | undefined;
          if (userLocation && service.business_name) {
            const serviceCoords = getServiceCoordinates(service.business_name);
            if (serviceCoords) {
              distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                serviceCoords.lat,
                serviceCoords.lng
              );
            }
          }

          return {
            ...service,
            distance,
            rating: Math.random() * 2 + 3, // Mock rating between 3-5
            review_count: Math.floor(Math.random() * 50) + 5, // Mock review count
          };
        });

        // Sort by distance if available
        if (userLocation) {
          servicesWithDistance = servicesWithDistance.sort((a, b) => {
            if (a.distance && b.distance) {
              return a.distance - b.distance;
            }
            return 0;
          });
        }

        setServices(servicesWithDistance);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userLocation) {
      fetchServices();
    }
  }, [userLocation]);

  const handleCallService = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmailService = (email: string) => {
    window.open(`mailto:${email}`, '_self');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{language === 'en' ? 'Nearby Services' : 'Perkhidmatan Berdekatan'}</span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/marketplace')}
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 bg-muted/30 rounded-lg animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            {language === 'en' ? 'No services available' : 'Tiada perkhidmatan tersedia'}
          </div>
        ) : (
          services.map((service) => (
            <div key={service.id} className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-all duration-200 cursor-pointer border border-transparent hover:border-muted">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{service.title}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    <User className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <p className="text-xs text-muted-foreground truncate">{service.business_name}</p>
                  </div>
                  
                  {/* Rating and Reviews */}
                  {service.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${
                              i < Math.floor(service.rating!) 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-muted-foreground/30'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {service.rating.toFixed(1)} ({service.review_count})
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-1 ml-2">
                  {service.price && (
                    <Badge variant="outline" className="text-xs">
                      {service.currency || 'RM'}{service.price}
                    </Badge>
                  )}
                  {service.distance && (
                    <Badge variant="secondary" className="text-xs">
                      {service.distance < 1 
                        ? `${(service.distance * 1000).toFixed(0)}m`
                        : `${service.distance.toFixed(1)}km`
                      }
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Category and Service Areas */}
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <span className="capitalize bg-primary/10 text-primary px-2 py-1 rounded">
                    {service.category}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>
                    {service.distance 
                      ? (language === 'en' ? 'Near you' : 'Berdekatan anda')
                      : (language === 'en' ? 'Nearby' : 'Berdekatan')
                    }
                  </span>
                </div>
              </div>

              {/* Service Areas */}
              {service.service_areas && service.service_areas.length > 0 && (
                <div className="mb-2">
                  <div className="flex flex-wrap gap-1">
                    {service.service_areas.slice(0, 2).map((area, index) => (
                      <span key={index} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                        {area}
                      </span>
                    ))}
                    {service.service_areas.length > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{service.service_areas.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Contact Actions and Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {language === 'en' ? 'Available' : 'Tersedia'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1">
                  {service.contact_phone && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCallService(service.contact_phone!);
                      }}
                    >
                      <Phone className="w-3 h-3" />
                    </Button>
                  )}
                  {service.contact_email && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEmailService(service.contact_email!);
                      }}
                    >
                      <Mail className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-3"
          onClick={() => navigate('/marketplace', { 
            state: { 
              filterType: 'services',
              location: userLocation,
              showNearbyOnly: true 
            } 
          })}
        >
          {language === 'en' ? 'View All Nearby Services' : 'Lihat Semua Perkhidmatan Berdekatan'}
        </Button>
      </CardContent>
    </Card>
  );
}