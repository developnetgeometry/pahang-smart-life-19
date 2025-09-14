import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useModuleAccess } from "@/hooks/use-module-access";
import { useUserRoles } from "@/hooks/use-user-roles";
import { useShoppingCart } from "@/hooks/use-shopping-cart";
import AdvertisementCarousel from "@/components/marketplace/AdvertisementCarousel";
import ShoppingCart from "@/components/marketplace/ShoppingCart";
import CartIcon from "@/components/marketplace/CartIcon";
import StarRating from "@/components/marketplace/StarRating";
import FavoriteButton from "@/components/marketplace/FavoriteButton";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ShoppingBag,
  Plus,
  Search,
  Heart,
  MessageCircle,
  Star,
  MapPin,
  Clock,
  Loader2,
  ShoppingCart as ShoppingCartIcon,
  Shield,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useChatRooms } from "@/hooks/use-chat-rooms";
import { supabase } from "@/integrations/supabase/client";

import { SmartImage } from "@/components/ui/dynamic-image";

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: "new" | "like-new" | "good" | "fair";
  seller: string;
  sellerRating: number;
  location: string;
  postedDate: string;
  images: string[];
  isFavorite: boolean;
  sellerType: "resident" | "service_provider";
}

export default function Marketplace() {
  const { language, user } = useAuth();
  const { isModuleEnabled } = useModuleAccess();
  const { hasRole } = useUserRoles();
  const { addToCart } = useShoppingCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createGroupChat, createDirectChat } = useChatRooms();

  const [showCart, setShowCart] = useState(false);

  // Remove mock items since we're now using database data
  const mockItems: MarketplaceItem[] = [];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [marketplaceItems, setMarketplaceItems] =
    useState<MarketplaceItem[]>(mockItems); // Initialize with mock data for immediate display
  const [loading, setLoading] = useState(false); // Changed to false for immediate UI display
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dbCategories, setDbCategories] = useState<{ name: string }[]>([]);

  // Check if user is a service provider
  const isServiceProvider = hasRole("service_provider");

  // Form state for new listing
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    condition: "",
    price: "",
    location: "",
    contact: "",
    image: null as File | null,
  });

  const text = {
    en: {
      title: "Community Marketplace",
      subtitle: "Buy and sell items within your community",
      newListing: "New Listing",
      search: "Search items...",
      category: "Category",
      condition: "Condition",
      allCategories: "All Categories",
      allConditions: "All Conditions",
      electronics: "Electronics",
      furniture: "Furniture",
      clothing: "Clothing",
      books: "Books",
      sports: "Sports & Recreation",
      others: "Others",
      new: "New",
      likeNew: "Like New",
      good: "Good",
      fair: "Fair",
      price: "Price",
      seller: "Seller",
      rating: "Rating",
      location: "Location",
      postedOn: "Posted on",
      contact: "Contact Seller",
      favorite: "Add to Favorites",
      createTitle: "Create New Listing",
      createSubtitle: "Sell your items to the community",
      itemTitle: "Item Title",
      itemDescription: "Description",
      itemPrice: "Price (RM)",
      itemImage: "Product Image",
      selectCategory: "Select Category",
      selectCondition: "Select Condition",
      contactInfo: "Contact Information",
      create: "Create Listing",
      cancel: "Cancel",
      createSuccess: "Listing created successfully!",
      contactSuccess: "Contact request sent!",
    },
    ms: {
      title: "Pasar Komuniti",
      subtitle: "Beli dan jual barang dalam komuniti anda",
      newListing: "Senarai Baru",
      search: "Cari barang...",
      category: "Kategori",
      condition: "Keadaan",
      allCategories: "Semua Kategori",
      allConditions: "Semua Keadaan",
      electronics: "Elektronik",
      furniture: "Perabot",
      clothing: "Pakaian",
      books: "Buku",
      sports: "Sukan & Rekreasi",
      others: "Lain-lain",
      new: "Baru",
      likeNew: "Seperti Baru",
      good: "Baik",
      fair: "Sederhana",
      price: "Harga",
      seller: "Penjual",
      rating: "Penilaian",
      location: "Lokasi",
      postedOn: "Disiarkan pada",
      contact: "Hubungi Penjual",
      favorite: "Tambah ke Kegemaran",
      createTitle: "Cipta Senarai Baru",
      createSubtitle: "Jual barang anda kepada komuniti",
      itemTitle: "Tajuk Barang",
      itemDescription: "Penerangan",
      itemPrice: "Harga (RM)",
      itemImage: "Gambar Produk",
      selectCategory: "Pilih Kategori",
      selectCondition: "Pilih Keadaan",
      contactInfo: "Maklumat Hubungan",
      create: "Cipta Senarai",
      cancel: "Batal",
      createSuccess: "Senarai berjaya dicipta!",
      contactSuccess: "Permintaan hubungan dihantar!",
    },
  };

  const t = text[language];

  // Fetch categories from database - MOVED BEFORE CONDITIONAL RETURN
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("marketplace_categories")
        .select("name");
      setDbCategories(data || []);
    };
    fetchCategories();
  }, []);

  // Fetch marketplace items from Supabase with timeout - MOVED BEFORE CONDITIONAL RETURN
  useEffect(() => {
    const fetchMarketplaceItems = async () => {
      try {
        // Add timeout to prevent hanging queries
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Query timeout")), 5000)
        );

        const queryPromise = supabase
          .from("marketplace_items")
          .select(
            `
            *,
            profiles!marketplace_items_seller_id_profiles_fkey (
              full_name,
              avatar_url
            )
          `
          )
          .eq("is_active", true)
          .eq("community_id", user?.active_community_id)
          .order("created_at", { ascending: false })
          .limit(20); // Limit results for better performance

        const { data, error } = (await Promise.race([
          queryPromise,
          timeoutPromise,
        ])) as any;

        if (error) throw error;

        // Helper function to get fallback image based on category/title
        const getFallbackImage = (title: string, category: string) => {
          const titleLower = title.toLowerCase();
          if (titleLower.includes("iphone") || category === "electronics")
            return "/src/assets/iphone-marketplace.jpg";
          if (
            titleLower.includes("table") ||
            titleLower.includes("dining") ||
            category === "furniture"
          )
            return "/src/assets/dining-table-marketplace.jpg";
          if (titleLower.includes("book") || category === "books")
            return "/src/assets/programming-books-marketplace.jpg";
          return "/placeholder.svg";
        };

        // Transform Supabase data to match our interface
        const transformedItems: MarketplaceItem[] = (data || []).map(
          (item) => ({
            id: item.id,
            title: item.title,
            description: item.description || "",
            price: Number(item.price),
            category: item.category,
            condition: item.condition as "new" | "like-new" | "good" | "fair",
            seller: (item.profiles as any)?.full_name || "Unknown User",
            sellerRating: 4.5,
            location: item.location || "",
            postedDate: new Date(item.created_at).toISOString().split("T")[0],
            images: item.image
              ? [
                item.image.startsWith("http")
                  ? item.image
                  : item.image === "iphone-marketplace.jpg"
                    ? "/src/assets/iphone-marketplace.jpg"
                    : item.image === "dining-table-marketplace.jpg"
                      ? "/src/assets/dining-table-marketplace.jpg"
                      : item.image === "programming-books-marketplace.jpg"
                        ? "/src/assets/programming-books-marketplace.jpg"
                        : getFallbackImage(item.title, item.category),
              ]
              : [getFallbackImage(item.title, item.category)],
            isFavorite: false,
            sellerType: item.seller_type as "resident" | "service_provider",
          })
        );

        setMarketplaceItems(
          transformedItems.length > 0 ? transformedItems : mockItems
        );
      } catch (error) {
        console.error("Error fetching marketplace items:", error);
        // Fallback to demo data immediately on error/timeout
        setMarketplaceItems(mockItems);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to prevent initial render blocking
    const timer = setTimeout(fetchMarketplaceItems, 100);
    return () => clearTimeout(timer);
  }, [language]);

  // Compute categories with useMemo - MOVED BEFORE CONDITIONAL RETURN
  const categories = useMemo(
    () => [
      { value: "all", label: t.allCategories },
      ...dbCategories.map((cat) => ({ value: cat.name, label: cat.name })),
    ],
    [dbCategories, t.allCategories]
  );

  // Check if marketplace module is enabled - MOVED AFTER ALL HOOKS
  if (!isModuleEnabled("marketplace")) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Module Disabled
            </h3>
            <p className="text-sm text-muted-foreground">
              The Marketplace module is not enabled for this community.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const conditions = [
    { value: "all", label: t.allConditions },
    { value: "new", label: t.new },
    { value: "like-new", label: t.likeNew },
    { value: "good", label: t.good },
    { value: "fair", label: t.fair },
  ];

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "new":
        return "bg-green-100 text-green-800";
      case "like-new":
        return "bg-blue-100 text-blue-800";
      case "good":
        return "bg-yellow-100 text-yellow-800";
      case "fair":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case "new":
        return t.new;
      case "like-new":
        return t.likeNew;
      case "good":
        return t.good;
      case "fair":
        return t.fair;
      default:
        return condition;
    }
  };

  const filteredItems = marketplaceItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesCondition =
      selectedCondition === "all" || item.condition === selectedCondition;
    return matchesSearch && matchesCategory && matchesCondition;
  });

  const handleCreateListing = async () => {
    if (!user) {
      toast({
        title:
          language === "en"
            ? "Authentication Required"
            : "Pengesahan Diperlukan",
        description:
          language === "en"
            ? "Please login to create a listing"
            : "Sila log masuk untuk mencipta senarai",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (
      !formData.title ||
      !formData.category ||
      !formData.condition ||
      !formData.price
    ) {
      toast({
        title: language === "en" ? "Validation Error" : "Ralat Pengesahan",
        description:
          language === "en"
            ? "Please fill in all required fields"
            : "Sila isi semua medan yang diperlukan",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get user's district and role information
      const { data: profile } = await supabase
        .from("profiles")
        .select("district_id")
        .eq("user_id", user.id)
        .single();

      // Check if user is a service provider
      const { data: userRole } = await supabase
        .from("enhanced_user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "service_provider")
        .eq("is_active", true)
        .single();

      const sellerType = userRole ? "service_provider" : "resident";

      let imageUrl = null;

      // Upload image if provided
      if (formData.image) {
        const fileExt = formData.image.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("marketplace-images")
          .upload(fileName, formData.image);

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
        } else {
          const {
            data: { publicUrl },
          } = supabase.storage
            .from("marketplace-images")
            .getPublicUrl(fileName);
          imageUrl = publicUrl;
        }
      }

      const { error } = await supabase.from("marketplace_items").insert({
        seller_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        condition: formData.condition,
        location: formData.location,
        district_id: profile?.district_id,
        seller_type: sellerType,
        is_available: true,
        is_active: true,
        image: imageUrl,
      });

      if (error) throw error;

      toast({
        title: t.createSuccess,
      });

      // Reset form and close dialog
      setFormData({
        title: "",
        description: "",
        category: "",
        condition: "",
        price: "",
        location: "",
        contact: "",
        image: null,
      });
      setIsCreateOpen(false);

      // Refresh the marketplace items
      const fetchMarketplaceItems = async () => {
        try {
          const { data, error } = await supabase
            .from("marketplace_items")
            .select(
              `
              *,
              profiles!marketplace_items_seller_id_profiles_fkey (
                full_name,
                avatar_url
              )
            `
            )
            .eq("is_active", true)
            .eq("community_id", user?.active_community_id)
            .order("created_at", { ascending: false });

          if (error) throw error;

          // Transform data to match our interface (reusing existing logic)
          const getFallbackImage = (title: string, category: string) => {
            const titleLower = title.toLowerCase();
            if (titleLower.includes("iphone") || category === "electronics")
              return "/src/assets/iphone-marketplace.jpg";
            if (
              titleLower.includes("table") ||
              titleLower.includes("dining") ||
              category === "furniture"
            )
              return "/src/assets/dining-table-marketplace.jpg";
            if (titleLower.includes("book") || category === "books")
              return "/src/assets/programming-books-marketplace.jpg";
            return "/placeholder.svg";
          };

          const transformedItems: MarketplaceItem[] = (data || []).map(
            (item) => ({
              id: item.id,
              title: item.title,
              description: item.description || "",
              price: Number(item.price),
              category: item.category,
              condition: item.condition as "new" | "like-new" | "good" | "fair",
              seller: (item.profiles as any)?.full_name || "Unknown User",
              sellerRating: 4.5,
              location: item.location || "",
              postedDate: new Date(item.created_at).toISOString().split("T")[0],
              images: item.image
                ? [
                  item.image.startsWith("http")
                    ? item.image
                    : item.image === "iphone-marketplace.jpg"
                      ? "/src/assets/iphone-marketplace.jpg"
                      : item.image === "dining-table-marketplace.jpg"
                        ? "/src/assets/dining-table-marketplace.jpg"
                        : item.image === "programming-books-marketplace.jpg"
                          ? "/src/assets/programming-books-marketplace.jpg"
                          : getFallbackImage(item.title, item.category),
                ]
                : [getFallbackImage(item.title, item.category)],
              isFavorite: false,
              sellerType: item.seller_type as "resident" | "service_provider",
            })
          );

          setMarketplaceItems(
            transformedItems.length > 0 ? transformedItems : mockItems
          );
        } catch (error) {
          console.error("Error refreshing marketplace items:", error);
        }
      };

      await fetchMarketplaceItems();
    } catch (error) {
      console.error("Error creating listing:", error);
      toast({
        title: language === "en" ? "Error" : "Ralat",
        description:
          language === "en"
            ? "Failed to create listing"
            : "Gagal mencipta senarai",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToCart = async (item: MarketplaceItem) => {
    const success = await addToCart(item.id, 1);
    if (success) {
      // Optional: Show success feedback
    }
  };

  const handleContactSeller = async (item: MarketplaceItem) => {
    try {
      // Get seller ID from database
      const { data: sellerData } = await supabase
        .from('marketplace_items')
        .select('seller_id')
        .eq('id', item.id)
        .single();

      if (!sellerData?.seller_id) {
        throw new Error('Seller not found');
      }

      // Create direct chat with the seller
      const roomId = await createDirectChat(sellerData.seller_id);

      // Navigate to communication-hub with proper state and URL parameters
      navigate(`/communication-hub?roomId=${roomId}`, {
        state: {
          initialRoomId: roomId,
          marketplaceChat: {
            chatWith: item.seller,
            presetMessage:
              language === "en"
                ? `Hi, is this item still available? - ${item.title
                } (RM${item.price.toLocaleString()})`
                : `Hai, adakah item ini masih tersedia? - ${item.title
                } (RM${item.price.toLocaleString()})`,
            itemInfo: {
              title: item.title,
              price: item.price,
              id: item.id,
            },
          },
        },
      });

      toast({
        title: language === "en" ? "Chat Created" : "Chat Dicipta",
        description:
          language === "en"
            ? `Chat room created for ${item.title}`
            : `Bilik chat dicipta untuk ${item.title}`,
      });
    } catch (error) {
      console.error("Error creating chat:", error);
      toast({
        title: language === "en" ? "Error" : "Ralat",
        description:
          language === "en"
            ? "Failed to create chat room"
            : "Gagal mencipta bilik chat",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Cart */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {t.title}
          </h1>
          <p className="text-muted-foreground mt-2">{t.subtitle}</p>
        </div>
        {/* <pre>{JSON.stringify(user, null, 2)}</pre> */}

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <CartIcon onClick={() => setShowCart(!showCart)} />
          {user && (
            <>
              {/* Analytics Dashboard Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate(
                    isServiceProvider
                      ? "/seller-dashboard"
                      : "/marketplace-analytics"
                  )
                }
                className="w-full sm:w-auto"
              >
                <span className="hidden sm:inline">
                  {language === "en" ? "My Analytics" : "Analitik Saya"}
                </span>
                <span className="sm:hidden">
                  {language === "en" ? "Analytics" : "Analitik"}
                </span>
              </Button>

              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{t.newListing}</span>
                    <span className="sm:hidden">
                      {language === "en" ? "New" : "Baru"}
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>{t.createTitle}</DialogTitle>
                    <DialogDescription>{t.createSubtitle}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">{t.itemTitle}*</Label>
                      <Input
                        id="title"
                        placeholder={t.itemTitle}
                        value={formData.title}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">{t.category}*</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              category: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t.selectCategory} />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.slice(1).map((category) => (
                              <SelectItem
                                key={category.value}
                                value={category.value}
                              >
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="condition">{t.condition}*</Label>
                        <Select
                          value={formData.condition}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              condition: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t.selectCondition} />
                          </SelectTrigger>
                          <SelectContent>
                            {conditions.slice(1).map((condition) => (
                              <SelectItem
                                key={condition.value}
                                value={condition.value}
                              >
                                {condition.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">{t.itemPrice}*</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="0"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            price: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image">{t.itemImage}</Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setFormData((prev) => ({ ...prev, image: file }));
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">{t.itemDescription}</Label>
                      <Textarea
                        id="description"
                        placeholder={t.itemDescription}
                        rows={3}
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="e.g., Block A, Unit 10-2"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact">{t.contactInfo}</Label>
                      <Input
                        id="contact"
                        placeholder="Phone number or email"
                        value={formData.contact}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            contact: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateOpen(false)}
                        disabled={isSubmitting}
                      >
                        {t.cancel}
                      </Button>
                      <Button
                        onClick={handleCreateListing}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {language === "en" ? "Creating..." : "Mencipta..."}
                          </>
                        ) : (
                          t.create
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="mb-6">
          <ShoppingCart language={language} />
        </div>
      )}

      {/* Advertisement Carousel */}
      <AdvertisementCarousel language={language} />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedCondition} onValueChange={setSelectedCondition}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {conditions.map((condition) => (
              <SelectItem key={condition.value} value={condition.value}>
                {condition.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-muted animate-pulse" />
              <CardHeader>
                <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted animate-pulse rounded" />
                  <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                {item.images[0] && item.images[0] !== "/placeholder.svg" ? (
                  <SmartImage
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {item.description}
                    </CardDescription>
                  </div>
                  <Badge className={getConditionColor(item.condition)}>
                    {getConditionText(item.condition)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-2xl font-bold text-primary">
                    RM{item.price.toLocaleString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xs">
                      {item.seller
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.seller}</p>
                    <StarRating
                      rating={item.sellerRating}
                      size="sm"
                      showText={false}
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {t.postedOn} {item.postedDate}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate(`/marketplace/item/${item.id}`)}
                    className="flex-1"
                  >
                    {language === "en" ? "View Details" : "Lihat Butiran"}
                  </Button>
                  <FavoriteButton itemId={item.id} language={language} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredItems.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {language === "en" ? "No items found" : "Tiada barang dijumpai"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
