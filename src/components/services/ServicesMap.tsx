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
  }, [mapboxToken]);

  useEffect(() => {
    if (map.current) {
      fetchServiceProviders();
    }
  }, [selectedCategory, searchTerm, userLocation]);

  const fetchMapboxToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "get-mapbox-token"
      );
      if (error) throw error;
      setMapboxToken(data.token);
    } catch (error) {
      console.error("Error fetching Mapbox token:", error);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.longitude,
            position.coords.latitude,
          ]);
        },
        (error) => {
          console.warn("Geolocation error:", error);
          // Default to Kuala Selangor
          setUserLocation([101.4551, 3.2278]);
        }
      );
    } else {
      setUserLocation([101.4551, 3.2278]);
    }
  };

  const initializeMap = () => {
    if (!mapboxToken || !mapContainer.current || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    const center = userLocation || [101.4551, 3.2278];

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
      setLoading(false);
    });
  };

  const fetchServiceProviders = async () => {
    try {
      // First get service provider businesses with location data
      const { data: businessesData, error: businessesError } = await supabase
        .from("service_provider_businesses")
        .select("*")
        .not("location_latitude", "is", null)
        .not("location_longitude", "is", null);

      if (businessesError) throw businessesError;

      if (!businessesData || businessesData.length === 0) {
        setProviders([]);
        updateMapMarkers([]);
        return;
      }

      // Get profile data for these providers
      const providerIds = businessesData.map((business) => business.user_id);
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("user_id", providerIds);

      const profilesMap = (profilesData || []).reduce((acc, profile) => {
        acc[profile.id] = profile;
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
      if (adsError) throw adsError;

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
    if (!map.current) return;

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

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center bg-muted rounded-lg">
        <div className="text-center">
          <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 relative rounded-lg overflow-hidden border">
      <div ref={mapContainer} className="w-full h-full" />

      {selectedProvider && (
        <Card className="absolute top-4 right-4 w-80 max-h-80 overflow-y-auto z-10">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">
                  {selectedProvider.business_name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
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
              >
                ×
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {selectedProvider.advertisements &&
              selectedProvider.advertisements.length > 0 && (
                <div className="space-y-2">
                  {selectedProvider.advertisements
                    .slice(0, 2)
                    .map((ad: any) => (
                      <div key={ad.id} className="p-2 bg-muted/50 rounded">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{ad.title}</h4>
                            <Badge variant="outline" className="text-xs mt-1">
                              {ad.category}
                            </Badge>
                          </div>
                          {ad.is_featured && (
                            <Badge variant="secondary" className="text-xs">
                              {t.featured}
                            </Badge>
                          )}
                        </div>
                        {ad.price && (
                          <p className="text-sm font-semibold text-primary mt-1">
                            RM{ad.price.toFixed(2)}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              )}

            {selectedProvider.business_address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  {selectedProvider.business_address}
                </p>
              </div>
            )}

            {(selectedProvider as any).distance && (
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {t.distance}: {(selectedProvider as any).distance.toFixed(1)}{" "}
                  km
                </span>
              </div>
            )}

            {selectedProvider.coverage_radius_km &&
              selectedProvider.is_mobile && (
                <div className="text-sm text-muted-foreground">
                  {t.coverage}: {selectedProvider.coverage_radius_km} km radius
                </div>
              )}

            {selectedProvider.travel_fee && selectedProvider.travel_fee > 0 && (
              <div className="text-sm text-muted-foreground">
                {t.travelFee}: RM{selectedProvider.travel_fee.toFixed(2)}
              </div>
            )}

            <div className="flex gap-2 pt-2">
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
                  <Phone className="w-3 h-3 mr-1" />
                  Call
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => handleGetDirections(selectedProvider)}
                className="flex-1"
              >
                <Navigation className="w-3 h-3 mr-1" />
                {t.directions}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {providers.length === 0 && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{t.noProviders}</p>
          </div>
        </div>
      )}
    </div>
  );
}
