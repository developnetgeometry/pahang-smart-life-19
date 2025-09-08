import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Star, MapPin, Phone, Navigation, Search, Filter, User, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ServiceProvider {
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

// Mock coordinates for service locations
const getServiceCoordinates = (businessName: string): { lat: number; lng: number } | null => {
  const mockCoordinates: Record<string, { lat: number; lng: number }> = {
    "Ahmad Plumbing Solutions": { lat: 3.2255, lng: 101.4531 },
    "Segar Mart Express": { lat: 3.2280, lng: 101.4550 },
    "Sparkle Clean Pro": { lat: 3.2290, lng: 101.4520 },
  };
  return mockCoordinates[businessName] || null;
};

export default function ServiceProviders() {
  const [services, setServices] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

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
          // Set default location (Kuala Selangor area)
          setUserLocation({ latitude: 3.2278, longitude: 101.4551 });
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    } else {
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
          .eq('product_type', 'service');

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
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(servicesWithDistance.map(s => s.category)));
        setCategories(uniqueCategories);
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

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCallService = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleNavigateToService = (businessName: string) => {
    const coordinates = getServiceCoordinates(businessName);
    if (coordinates) {
      // Use Google Maps for universal compatibility
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
      window.open(mapsUrl, '_blank');
    } else {
      // Fallback to search by business name
      const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(businessName)}`;
      window.open(searchUrl, '_blank');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Service Providers</h1>
        <p className="text-muted-foreground">Find reliable service providers near you</p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search services or providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No service providers found matching your criteria</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{service.title}</CardTitle>
                    <div className="flex items-center gap-1 mt-1">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground truncate">{service.business_name}</p>
                    </div>
                  </div>
                  {service.price && (
                    <Badge variant="outline">
                      {service.currency || 'RM'}{service.price}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Rating and Distance */}
                <div className="flex items-center justify-between">
                  {service.rating && (
                    <div className="flex items-center gap-1">
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
                  {service.distance && (
                    <Badge variant="secondary" className="text-xs">
                      {service.distance < 1 
                        ? `${(service.distance * 1000).toFixed(0)}m`
                        : `${service.distance.toFixed(1)}km`
                      }
                    </Badge>
                  )}
                </div>

                {/* Description */}
                {service.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>
                )}

                {/* Category and Status */}
                <div className="flex items-center justify-between">
                  <Badge variant="default" className="text-xs capitalize">
                    {service.category}
                  </Badge>
                  <Badge variant="default" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Available
                  </Badge>
                </div>

                {/* Service Areas */}
                {service.service_areas && service.service_areas.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>Serves: {service.service_areas.slice(0, 2).join(', ')}</span>
                    {service.service_areas.length > 2 && (
                      <span>+{service.service_areas.length - 2} more</span>
                    )}
                  </div>
                )}

                {/* Contact Actions */}
                <div className="flex gap-2 pt-2">
                  {service.contact_phone && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleCallService(service.contact_phone!)}
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Call
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleNavigateToService(service.business_name)}
                  >
                    <Navigation className="w-3 h-3 mr-1" />
                    Directions
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}