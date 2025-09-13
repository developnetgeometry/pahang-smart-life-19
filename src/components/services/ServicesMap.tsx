import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Phone, Mail, Star, Building2, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface ServiceProvider {
  id: string;
  business_name: string;
  business_address?: string;
  business_phone?: string;
  business_email?: string;
  location_latitude?: number;
  location_longitude?: number;
  coverage_radius_km?: number;
  is_mobile?: boolean;
  accepts_emergency?: boolean;
  travel_fee?: number;
  operating_hours?: any;
  user_id: string;
  advertisements?: {
    id: string;
    title: string;
    description?: string;
    category: string;
    price?: number;
    image_url?: string;
    is_featured: boolean;
  }[];
  advertiser_profile?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface ServicesMapProps {
  language: "en" | "ms";
  selectedCategory: string;
  searchTerm: string;
}

export function ServicesMap({
  language,
  selectedCategory,
  searchTerm,
}: ServicesMapProps) {
  const { toast } = useToast();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [selectedProvider, setSelectedProvider] =
    useState<ServiceProvider | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  const text = {
    en: {
      loading: "Loading map...",
      noProviders: "No service providers found in this area",
      distance: "Distance",
      coverage: "Coverage Area",
      mobile: "Mobile Service",
      emergency: "Emergency Service",
      travelFee: "Travel Fee",
      openNow: "Open Now",
      closed: "Closed",
      contactProvider: "Contact Provider",
      directions: "Get Directions",
      featured: "Featured",
      mapError: "Failed to load map",
    },
    ms: {
      loading: "Memuatkan peta...",
      noProviders: "Tiada penyedia perkhidmatan dijumpai di kawasan ini",
      distance: "Jarak",
      coverage: "Kawasan Liputan",
      mobile: "Perkhidmatan Bergerak",
      emergency: "Perkhidmatan Kecemasan",
      travelFee: "Yuran Perjalanan",
      openNow: "Buka Sekarang",
      closed: "Tutup",
      contactProvider: "Hubungi Penyedia",
      directions: "Dapatkan Arah",
      featured: "Pilihan",
      mapError: "Gagal memuatkan peta",
    },
  };

  const t = text[language];

  useEffect(() => {
    fetchMapboxToken();
    getUserLocation();
  }, []);

  useEffect(() => {
    if (mapboxToken && mapContainer.current && !map.current) {
      initializeMap();
    }
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken, userLocation]);

  useEffect(() => {
    if (map.current) {
      fetchServiceProviders();
    }
  }, [selectedCategory, searchTerm]);

  const fetchMapboxToken = async () => {
    try {
      console.log("Fetching Mapbox token...");
      const { data, error } = await supabase.functions.invoke(
        "get-mapbox-token"
      );
      
      if (error) {
        console.error("Error from edge function:", error);
        throw error;
      }
      
      if (!data || !data.token) {
        console.error("No token received from edge function");
        throw new Error("No token received");
      }
      
      console.log("Mapbox token received successfully");
      setMapboxToken(data.token);
    } catch (error) {
      console.error("Error fetching Mapbox token:", error);
      setMapError("Failed to load map token");
      setLoading(false);
      
      // Fallback: Try using environment variable if available
      const envToken = import.meta.env.VITE_MAPBOX_TOKEN;
      if (envToken) {
        console.log("Using fallback token from environment");
        setMapboxToken(envToken);
        setMapError(null);
      }
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("User location obtained:", position.coords);
          setUserLocation([
            position.coords.longitude,
            position.coords.latitude,
          ]);
        },
        (error) => {
          console.warn("Geolocation error:", error);
          // Default to Kuala Lumpur
          setUserLocation([101.6869, 3.1390]);
        }
      );
    } else {
      console.log("Geolocation not supported, using default location");
      // Default to Kuala Lumpur
      setUserLocation([101.6869, 3.1390]);
    }
  };

  const initializeMap = () => {
    if (!mapboxToken || !mapContainer.current || map.current) {
      console.log("Map initialization skipped:", { 
        hasToken: !!mapboxToken, 
        hasContainer: !!mapContainer.current, 
        hasMap: !!map.current 
      });
      return;
    }

    try {
      console.log("Initializing Mapbox map...");
      mapboxgl.accessToken = mapboxToken;

      const center = userLocation || [101.6869, 3.1390];
      console.log("Map center:", center);

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center,
        zoom: 12,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Add user location marker if available
      if (userLocation) {
        new mapboxgl.Marker({ color: "#3b82f6" })
          .setLngLat(userLocation)
          .setPopup(new mapboxgl.Popup().setHTML("<p>Your Location</p>"))
          .addTo(map.current);
      }

      map.current.on("load", () => {
        console.log("Map loaded successfully");
        setLoading(false);
        setMapError(null);
        fetchServiceProviders();
      });

      // Add error handler
      map.current.on("error", (e) => {
        console.error("Mapbox map error:", e);
        setMapError("Failed to load map");
        setLoading(false);
      });

    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError("Failed to initialize map");
      setLoading(false);
    }
  };

  const fetchServiceProviders = async () => {
    try {
      console.log("Fetching service providers...");
      
      // First get service provider businesses with location data
      const { data: businessesData, error: businessesError } = await supabase
        .from("service_provider_businesses")
        .select("*")
        .not("location_latitude", "is", null)
        .not("location_longitude", "is", null);

      if (businessesError) {
        console.error("Error fetching businesses:", businessesError);
        throw businessesError;
      }

      console.log("Businesses found:", businessesData?.length || 0);

      if (!businessesData || businessesData.length === 0) {
        setProviders([]);
        updateMapMarkers([]);
        return;
      }

      // Get profile data for these providers
      const providerIds = businessesData.map((business) => business.user_id);
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", providerIds);

      const profilesMap = (profilesData || []).reduce((acc, profile) => {
        acc[profile.user_id] = profile;
        return acc;
      }, {} as Record<string, any>);

      // Get advertisements for these service providers
      let adsQuery = supabase
        .from("advertisements")
        .select("*")
        .in("advertiser_id", providerIds)
        .eq("is_active", true);

      // Apply category filter
      if (selectedCategory !== "all") {
        adsQuery = adsQuery.eq("category", selectedCategory);
      }

      const { data: adsData, error: adsError } = await adsQuery;
      if (adsError) {
        console.error("Error fetching advertisements:", adsError);
        throw adsError;
      }

      console.log("Advertisements found:", adsData?.length || 0);

      // Combine businesses with their advertisements and profiles
      let providersWithData = businessesData.map((business) => ({
        ...business,
        advertisements: (adsData || []).filter(
          (ad) => ad.advertiser_id === business.user_id
        ),
        advertiser_profile: profilesMap[business.user_id] || null,
      }));

      // Filter out providers with no advertisements if category filter is applied
      if (selectedCategory !== "all") {
        providersWithData = providersWithData.filter(
          (provider) => provider.advertisements.length > 0
        );
      }

      // Apply search filter
      if (searchTerm) {
        providersWithData = providersWithData.filter(
          (provider) =>
            provider.business_name
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            provider.advertisements?.some(
              (ad: any) =>
                ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ad.description?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
      }

      // Calculate distances if user location is available
      if (userLocation) {
        providersWithData = providersWithData
          .map((provider) => ({
            ...provider,
            distance: calculateDistance(
              userLocation[1],
              userLocation[0],
              provider.location_latitude!,
              provider.location_longitude!
            ),
          }))
          .sort((a: any, b: any) => (a.distance || 0) - (b.distance || 0));
      }

      console.log("Final providers count:", providersWithData.length);
      setProviders(providersWithData as ServiceProvider[]);
      updateMapMarkers(providersWithData as ServiceProvider[]);
    } catch (error) {
      console.error("Error fetching service providers:", error);
      toast({
        title: language === "en" ? "Error" : "Ralat",
        description:
          language === "en"
            ? "Failed to load service providers"
            : "Gagal memuat penyedia perkhidmatan",
        variant: "destructive",
      });
    }
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const updateMapMarkers = (providersData: ServiceProvider[]) => {
    if (!map.current) {
      console.log("Map not ready for markers");
      return;
    }

    console.log("Updating markers for", providersData.length, "providers");

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Add new markers
    providersData.forEach((provider) => {
      if (provider.location_latitude && provider.location_longitude) {
        const el = document.createElement("div");
        el.className = "marker";
        el.style.backgroundImage =
          "url(https://docs.mapbox.com/help/demos/custom-markers-gl-js/mapbox-icon.png)";
        el.style.width = "25px";
        el.style.height = "25px";
        el.style.backgroundSize = "100%";
        el.style.cursor = "pointer";

        const marker = new mapboxgl.Marker(el)
          .setLngLat([provider.location_longitude, provider.location_latitude])
          .addTo(map.current!);

        el.addEventListener("click", () => {
          setSelectedProvider(provider);
          map.current?.flyTo({
            center: [provider.location_longitude!, provider.location_latitude!],
            zoom: 15,
          });
        });

        markers.current.push(marker);
      }
    });

    // Fit map to markers if any exist
    if (providersData.length > 0) {
      const coordinates = providersData
        .filter((p) => p.location_latitude && p.location_longitude)
        .map(
          (p) =>
            [p.location_longitude!, p.location_latitude!] as [number, number]
        );

      if (coordinates.length > 0) {
        const bounds = coordinates.reduce((bounds, coord) => {
          return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

        map.current?.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15,
        });
      }
    }
  };

  const isOpenNow = (operatingHours: any): boolean => {
    if (!operatingHours) return false;

    const now = new Date();
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const today = dayNames[now.getDay()];
    const currentTime = now.toTimeString().slice(0, 5);

    const todayHours = operatingHours[today];
    if (todayHours?.closed) return false;

    return currentTime >= todayHours?.open && currentTime <= todayHours?.close;
  };

  const handleGetDirections = (provider: ServiceProvider) => {
    if (provider.location_latitude && provider.location_longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${provider.location_latitude},${provider.location_longitude}`;
      window.open(url, "_blank");
    }
  };

  // Always render the container - this is the key fix!
  return (
    <div className="relative w-full min-h-[500px] lg:h-[600px] rounded-lg overflow-hidden border">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">{t.loading}</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-20">
          <div className="text-center p-4">
            <MapPin className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-destructive font-medium">{t.mapError}</p>
            <p className="text-sm text-muted-foreground mt-1">{mapError}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="mt-3"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Selected provider card - Mobile bottom sheet on small screens, top-right card on larger screens */}
      {selectedProvider && (
        <Card className="absolute bottom-0 left-0 right-0 md:top-4 md:right-4 md:bottom-auto md:left-auto w-full md:w-96 max-h-[75vh] md:max-h-[calc(100%-2rem)] overflow-hidden z-30 shadow-xl bg-background/95 backdrop-blur-sm">
          {/* Mobile drag handle */}
          <div className="md:hidden w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto mt-3"></div>
          
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold truncate">
                  {selectedProvider.business_name}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-1 mt-2">
                  {selectedProvider.is_mobile && (
                    <Badge variant="secondary" className="text-xs">
                      {t.mobile}
                    </Badge>
                  )}
                  {selectedProvider.accepts_emergency && (
                    <Badge variant="destructive" className="text-xs">
                      {t.emergency}
                    </Badge>
                  )}
                  <Badge
                    variant={
                      isOpenNow(selectedProvider.operating_hours)
                        ? "default"
                        : "outline"
                    }
                    className="text-xs"
                  >
                    {isOpenNow(selectedProvider.operating_hours)
                      ? t.openNow
                      : t.closed}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProvider(null)}
                className="flex-shrink-0 ml-2"
              >
                ×
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 overflow-y-auto max-h-[50vh] md:max-h-80">
            {/* Advertisements */}
            {selectedProvider.advertisements &&
              selectedProvider.advertisements.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2 text-muted-foreground">
                    {language === 'en' ? 'Services' : 'Perkhidmatan'}
                  </h4>
                  <div className="space-y-2">
                    {selectedProvider.advertisements
                      .slice(0, 2)
                      .map((ad: any) => (
                        <div key={ad.id} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{ad.title}</h4>
                              <Badge variant="outline" className="text-xs mt-1">
                                {ad.category}
                              </Badge>
                            </div>
                            {ad.is_featured && (
                              <Badge variant="secondary" className="text-xs flex-shrink-0">
                                {t.featured}
                              </Badge>
                            )}
                          </div>
                          {ad.description && (
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {ad.description}
                            </p>
                          )}
                          {ad.price && (
                            <p className="text-sm font-semibold text-primary">
                              RM{ad.price.toFixed(2)}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {/* Contact Information */}
            <div>
              <h4 className="font-medium text-sm mb-2 text-muted-foreground">
                {language === 'en' ? 'Contact Information' : 'Maklumat Hubungan'}
              </h4>
              <div className="space-y-2">
                {selectedProvider.business_address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground flex-1">
                      {selectedProvider.business_address}
                    </p>
                  </div>
                )}
                
                {selectedProvider.business_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <p className="text-sm text-muted-foreground flex-1">
                      {selectedProvider.business_phone}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-2">
              {(selectedProvider as any).distance && (
                <div className="flex items-center justify-center gap-2 p-2 bg-primary/10 rounded-lg">
                  <Navigation className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {t.distance}: {(selectedProvider as any).distance.toFixed(1)} km
                  </span>
                </div>
              )}

              {selectedProvider.coverage_radius_km &&
                selectedProvider.is_mobile && (
                  <div className="text-sm text-muted-foreground text-center">
                    {t.coverage}: {selectedProvider.coverage_radius_km} km radius
                  </div>
                )}

              {selectedProvider.travel_fee && selectedProvider.travel_fee > 0 && (
                <div className="text-sm text-muted-foreground text-center">
                  {t.travelFee}: RM{selectedProvider.travel_fee.toFixed(2)}
                </div>
              )}
            </div>
          </CardContent>

          {/* Action buttons */}
          <div className="p-4 border-t bg-background/50">
            <div className="flex gap-3">
              {selectedProvider.business_phone && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      `tel:${selectedProvider.business_phone}`,
                      "_self"
                    )
                  }
                  className="flex-1"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'Call' : 'Panggil'}
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => handleGetDirections(selectedProvider)}
                className="flex-1"
              >
                <Navigation className="w-4 h-4 mr-2" />
                {t.directions}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* No providers overlay */}
      {providers.length === 0 && !loading && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
          <div className="text-center p-4">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{t.noProviders}</p>
          </div>
        </div>
      )}
    </div>
  );
}
