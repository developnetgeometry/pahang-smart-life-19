import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Star,
  MessageCircle,
  ExternalLink,
  Shield,
  Package,
  Calendar,
  TrendingUp,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useChatRooms } from "@/hooks/use-chat-rooms";
import StarRating from "@/components/marketplace/StarRating";
import SellerRating from "@/components/marketplace/SellerRating";
import { SmartImage } from "@/components/ui/dynamic-image";

interface SellerProfile {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  profile_bio?: string;
  created_at: string;
  seller_type: "resident" | "service_provider";
  business_profile?: {
    business_name: string;
    business_type: string;
    is_verified: boolean;
    service_areas: string[];
    website_url?: string;
    contact_phone?: string;
    contact_email?: string;
  };
}

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition?: string;
  image?: string;
  view_count: number;
  is_active: boolean;
  is_available: boolean;
  created_at: string;
}

interface ServiceAdvertisement {
  id: string;
  title: string;
  description: string;
  business_name: string;
  category: string;
  price?: number;
  image_url?: string;
  click_count: number;
  is_featured: boolean;
  service_areas: string[];
  created_at: string;
}

export default function SellerProfile() {
  const { sellerId } = useParams();
  const { language, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createDirectChat } = useChatRooms();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [services, setServices] = useState<ServiceAdvertisement[]>([]);
  const [stats, setStats] = useState({
    totalListings: 0,
    totalViews: 0,
    averageRating: 0,
    memberSince: "",
  });

  const text = {
    en: {
      title: "Seller Profile",
      verified: "Verified",
      resident: "Community Resident",
      serviceProvider: "Service Provider",
      memberSince: "Member since",
      contact: "Contact Seller",
      viewWebsite: "Visit Website",
      items: "Items for Sale",
      services: "Services Offered",
      noItems: "No items available",
      noServices: "No services available",
      totalListings: "Total Listings",
      totalViews: "Total Views",
      averageRating: "Average Rating",
      businessInfo: "Business Information",
      contactInfo: "Contact Information",
      serviceAreas: "Service Areas",
      about: "About",
      overview: "Overview",
      notFound: "Seller not found",
      notFoundDesc: "The seller profile you are looking for does not exist.",
      contactSuccess: "Chat created successfully!",
      contactError: "Failed to create chat",
    },
    ms: {
      title: "Profil Penjual",
      verified: "Disahkan",
      resident: "Penduduk Komuniti",
      serviceProvider: "Penyedia Perkhidmatan",
      memberSince: "Ahli sejak",
      contact: "Hubungi Penjual",
      viewWebsite: "Lawati Laman Web",
      items: "Barang untuk Dijual",
      services: "Perkhidmatan Ditawarkan",
      noItems: "Tiada barang tersedia",
      noServices: "Tiada perkhidmatan tersedia",
      totalListings: "Jumlah Senarai",
      totalViews: "Jumlah Paparan",
      averageRating: "Purata Penilaian",
      businessInfo: "Maklumat Perniagaan",
      contactInfo: "Maklumat Hubungan",
      serviceAreas: "Kawasan Perkhidmatan",
      about: "Tentang",
      overview: "Ringkasan",
      notFound: "Penjual tidak dijumpai",
      notFoundDesc: "Profil penjual yang anda cari tidak wujud.",
      contactSuccess: "Chat berjaya dicipta!",
      contactError: "Gagal mencipta chat",
    },
  };

  const t = text[language];

  useEffect(() => {
    if (sellerId) {
      fetchSellerProfile();
    }
  }, [sellerId]);

  const fetchSellerProfile = async () => {
    if (!sellerId) return;

    setLoading(true);
    try {
      // Fetch seller profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", sellerId)
        .single();

      if (profileError) throw profileError;

      // Check if seller is service provider and fetch business profile
      const { data: roleData } = await supabase
        .from("enhanced_user_roles")
        .select("role")
        .eq("user_id", sellerId)
        .eq("role", "service_provider")
        .eq("is_active", true)
        .single();

      let businessProfile = null;
      if (roleData) {
        const { data: businessData } = await supabase
          .from("service_provider_businesses")
          .select("*")
          .eq("user_id", sellerId)
          .single();

        businessProfile = businessData;
      }

      const sellerProfile: SellerProfile = {
        ...profileData,
        seller_type: roleData ? "service_provider" : "resident",
        business_profile: businessProfile,
      };

      setProfile(sellerProfile);

      // Fetch marketplace items
      const { data: itemsData } = await supabase
        .from("marketplace_items")
        .select("*")
        .eq("seller_id", sellerId)
        .eq("is_active", true)
        .eq("is_available", true)
        .order("created_at", { ascending: false });

      setItems(itemsData || []);

      // Fetch service advertisements if service provider
      if (roleData) {
        const { data: servicesData } = await supabase
          .from("advertisements")
          .select("*")
          .eq("advertiser_id", sellerId)
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        setServices(servicesData || []);
      }

      // Calculate stats
      const totalItems = (itemsData || []).length;
      const totalServices = roleData ? (services || []).length : 0;
      const totalViews =
        (itemsData || []).reduce(
          (sum, item) => sum + (item.view_count || 0),
          0
        ) +
        (services || []).reduce(
          (sum, service) => sum + (service.click_count || 0),
          0
        );

      setStats({
        totalListings: totalItems + totalServices,
        totalViews,
        averageRating: 4.5, // Placeholder
        memberSince: new Date(profileData.created_at).getFullYear().toString(),
      });
    } catch (error) {
      console.error("Error fetching seller profile:", error);
      toast({
        title: language === "en" ? "Error" : "Ralat",
        description:
          language === "en"
            ? "Failed to load seller profile"
            : "Gagal memuat profil penjual",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async () => {
    if (!profile || !user) return;

    try {
      const roomId = await createDirectChat(profile.id);
      if (roomId) {
        navigate("/communication-hub");
        toast({
          title: t.contactSuccess,
        });
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      toast({
        title: t.contactError,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-muted rounded-full" />
            <div className="space-y-2">
              <div className="h-6 bg-muted rounded w-48" />
              <div className="h-4 bg-muted rounded w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{t.notFound}</h3>
              <p className="text-muted-foreground">{t.notFoundDesc}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "new":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "like-new":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "good":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "fair":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback>
                  {profile.full_name?.charAt(0) || "S"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">
                    {profile.business_profile?.business_name ||
                      profile.full_name}
                  </h1>
                  {profile.seller_type === "service_provider" &&
                    profile.business_profile?.is_verified && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <Shield className="w-3 h-3" />
                        {t.verified}
                      </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">
                    {profile.seller_type === "service_provider"
                      ? t.serviceProvider
                      : t.resident}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {t.memberSince} {stats.memberSince}
                    </span>
                  </div>
                </div>
                <SellerRating sellerId={profile.id} language={language} />
              </div>
            </div>

            <div className="flex gap-2">
              {profile.business_profile?.website_url && (
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(profile.business_profile?.website_url, "_blank")
                  }
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  {t.viewWebsite}
                </Button>
              )}
              {user && user.id !== profile.id && (
                <Button onClick={handleContact}>
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {t.contact}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Package className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">{stats.totalListings}</span>
            </div>
            <p className="text-sm text-muted-foreground">{t.totalListings}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">{stats.totalViews}</span>
            </div>
            <p className="text-sm text-muted-foreground">{t.totalViews}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">
                {stats.averageRating.toFixed(1)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{t.averageRating}</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
          {items.length > 0 && (
            <TabsTrigger value="items">
              {t.items} ({items.length})
            </TabsTrigger>
          )}
          {services.length > 0 && (
            <TabsTrigger value="services">
              {t.services} ({services.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* About */}
            {profile.profile_bio && (
              <Card>
                <CardHeader>
                  <CardTitle>{t.about}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{profile.profile_bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Business Info for Service Providers */}
            {profile.business_profile && (
              <Card>
                <CardHeader>
                  <CardTitle>{t.businessInfo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium">
                      {profile.business_profile.business_name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {profile.business_profile.business_type}
                    </p>
                  </div>

                  {profile.business_profile.service_areas.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-1">
                        {t.serviceAreas}
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {profile.business_profile.service_areas.map(
                          (area, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {area}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>{t.contactInfo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(profile.business_profile?.contact_email || profile.email) && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {profile.business_profile?.contact_email || profile.email}
                    </span>
                  </div>
                )}
                {(profile.business_profile?.contact_phone || profile.phone) && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {profile.business_profile?.contact_phone || profile.phone}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {items.length > 0 && (
          <TabsContent value="items" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {item.image && (
                        <SmartImage
                          src={item.image}
                          alt={item.title}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                      )}

                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold line-clamp-2">
                            {item.title}
                          </h3>
                          {item.condition && (
                            <Badge
                              className={getConditionColor(item.condition)}
                            >
                              {item.condition}
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">
                            RM{item.price.toFixed(2)}
                          </span>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Eye className="h-3 w-3" />
                            <span>{item.view_count || 0}</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => navigate(`/marketplace/item/${item.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}

        {services.length > 0 && (
          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {service.image_url && (
                        <SmartImage
                          src={service.image_url}
                          alt={service.title}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                      )}

                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold line-clamp-2">
                            {service.title}
                          </h3>
                          {service.is_featured && (
                            <Badge variant="secondary">Featured</Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {service.description}
                        </p>

                        <div className="flex items-center justify-between">
                          {service.price && (
                            <span className="text-lg font-bold text-primary">
                              RM{service.price.toFixed(2)}
                            </span>
                          )}
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Eye className="h-3 w-3" />
                            <span>{service.click_count || 0}</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => navigate(`/advertisement/${service.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
