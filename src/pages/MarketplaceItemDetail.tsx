import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useShoppingCart } from '@/hooks/use-shopping-cart';
import { useChatRooms } from '@/hooks/use-chat-rooms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ShoppingCart, MessageCircle, Heart, Star, MapPin, Clock, User, Tag, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ProductReviews from '@/components/marketplace/ProductReviews';
import SellerRating from '@/components/marketplace/SellerRating';
import StarRating from '@/components/marketplace/StarRating';

// Import marketplace product images
import iphoneMarketplaceImage from '@/assets/iphone-marketplace.jpg';
import diningTableMarketplaceImage from '@/assets/dining-table-marketplace.jpg';
import programmingBooksMarketplaceImage from '@/assets/programming-books-marketplace.jpg';

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  seller: string;
  sellerId: string;
  sellerRating: number;
  location: string;
  postedDate: string;
  images: string[];
  isFavorite: boolean;
  sellerType: 'resident' | 'service_provider';
}

export default function MarketplaceItemDetail() {
  const { id } = useParams<{ id: string }>();
  const { language, user } = useAuth();
  const { addToCart } = useShoppingCart();
  const { createGroupChat } = useChatRooms();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  const text = {
    en: {
      backToMarketplace: 'Back to Marketplace',
      price: 'Price',
      condition: 'Condition',
      seller: 'Seller',
      location: 'Location',
      postedOn: 'Posted on',
      description: 'Description',
      addToCart: 'Add to Cart',
      contactSeller: 'Contact Seller',
      addToFavorites: 'Add to Favorites',
      removeFromFavorites: 'Remove from Favorites',
      itemNotFound: 'Item not found',
      itemUnavailable: 'This item is no longer available',
      new: 'New',
      likeNew: 'Like New',
      good: 'Good',
      fair: 'Fair',
      cartSuccess: 'Item added to cart!',
      chatSuccess: 'Chat room created successfully!'
    },
    ms: {
      backToMarketplace: 'Kembali ke Pasar',
      price: 'Harga',
      condition: 'Keadaan',
      seller: 'Penjual',
      location: 'Lokasi',
      postedOn: 'Disiarkan pada',
      description: 'Penerangan',
      addToCart: 'Tambah ke Troli',
      contactSeller: 'Hubungi Penjual',
      addToFavorites: 'Tambah ke Kegemaran',
      removeFromFavorites: 'Buang dari Kegemaran',
      itemNotFound: 'Barang tidak dijumpai',
      itemUnavailable: 'Barang ini tidak lagi tersedia',
      new: 'Baru',
      likeNew: 'Seperti Baru',
      good: 'Baik',
      fair: 'Sederhana',
      cartSuccess: 'Barang ditambah ke troli!',
      chatSuccess: 'Bilik chat berjaya dicipta!'
    }
  };

  const t = text[language];

  // Mock items for fallback
  const mockItems: MarketplaceItem[] = [
    {
      id: '1',
      title: language === 'en' ? 'iPhone 13 Pro Max' : 'iPhone 13 Pro Max',
      description: language === 'en' ? 'Excellent condition, comes with original box and charger. Used for only 6 months. No scratches or dents. All original accessories included. Battery health is at 98%. Perfect for anyone looking for a premium smartphone experience.' : 'Keadaan sangat baik, disertakan dengan kotak asal dan pengecas. Digunakan hanya 6 bulan. Tiada calar atau kemik. Semua aksesori asal disertakan. Kesihatan bateri pada 98%. Sempurna untuk sesiapa yang mencari pengalaman telefon pintar premium.',
      price: 3500,
      category: 'electronics',
      condition: 'like-new',
      seller: 'John Doe',
      sellerId: 'seller-1',
      sellerRating: 4.8,
      location: 'Block A, Unit 15-2',
      postedDate: '2024-01-15',
      images: [iphoneMarketplaceImage],
      isFavorite: false,
      sellerType: 'resident'
    },
    {
      id: '2',
      title: language === 'en' ? 'IKEA Dining Table Set' : 'Set Meja Makan IKEA',
      description: language === 'en' ? '6-seater dining table with chairs, good condition. Made from solid wood with a beautiful oak finish. The table is extendable and can accommodate up to 8 people when fully extended. Chairs are comfortable with cushioned seats. Perfect for family dinners and entertaining guests.' : 'Meja makan 6 tempat duduk dengan kerusi, keadaan baik. Diperbuat daripada kayu pepejal dengan kemasan oak yang cantik. Meja boleh dipanjangkan dan boleh memuatkan hingga 8 orang apabila dipanjangkan sepenuhnya. Kerusi selesa dengan tempat duduk berkusyen. Sempurna untuk makan malam keluarga dan melayan tetamu.',
      price: 800,
      category: 'furniture',
      condition: 'good',
      seller: 'Sarah Chen',
      sellerId: 'seller-2',
      sellerRating: 4.5,
      location: 'Block B, Unit 8-1',
      postedDate: '2024-01-12',
      images: [diningTableMarketplaceImage],
      isFavorite: true,
      sellerType: 'resident'
    },
    {
      id: '3',
      title: language === 'en' ? 'Programming Books Collection' : 'Koleksi Buku Pengaturcaraan',
      description: language === 'en' ? 'Various programming books, perfect for students. Includes books on JavaScript, Python, Java, and web development. All books are in excellent condition with minimal wear. Great for anyone starting their programming journey or looking to expand their knowledge. Some books include practice exercises and code examples.' : 'Pelbagai buku pengaturcaraan, sesuai untuk pelajar. Termasuk buku tentang JavaScript, Python, Java, dan pembangunan web. Semua buku dalam keadaan sangat baik dengan haus minimal. Bagus untuk sesiapa yang memulakan perjalanan pengaturcaraan atau ingin mengembangkan pengetahuan mereka. Sesetengah buku termasuk latihan praktikal dan contoh kod.',
      price: 150,
      category: 'books',
      condition: 'good',
      seller: 'Mike Wong',
      sellerId: 'seller-3',
      sellerRating: 4.9,
      location: 'Block C, Unit 12-5',
      postedDate: '2024-01-10',
      images: [programmingBooksMarketplaceImage],
      isFavorite: false,
      sellerType: 'service_provider'
    }
  ];

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;

      try {
        // Try to fetch from Supabase first
        const { data, error } = await supabase
          .from('marketplace_items')
          .select(`
            *,
            profiles!marketplace_items_seller_id_fkey (
              full_name,
              avatar_url
            )
          `)
          .eq('id', id)
          .eq('is_active', true)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          // Transform Supabase data
          const getFallbackImage = (title: string, category: string) => {
            const titleLower = title.toLowerCase();
            if (titleLower.includes('iphone') || category === 'electronics') return iphoneMarketplaceImage;
            if (titleLower.includes('table') || titleLower.includes('dining') || category === 'furniture') return diningTableMarketplaceImage;
            if (titleLower.includes('book') || category === 'books') return programmingBooksMarketplaceImage;
            return '/placeholder.svg';
          };

          const transformedItem: MarketplaceItem = {
            id: data.id,
            title: data.title,
            description: data.description || '',
            price: Number(data.price),
            category: data.category,
            condition: data.condition as 'new' | 'like-new' | 'good' | 'fair',
            seller: (data.profiles as any)?.full_name || 'Unknown User',
            sellerId: data.seller_id || 'unknown-seller',
            sellerRating: 4.5,
            location: data.location || '',
            postedDate: new Date(data.created_at).toISOString().split('T')[0],
            images: data.image ? [
              data.image.startsWith('http') ? data.image : 
              data.image === 'iphone-marketplace.jpg' ? iphoneMarketplaceImage :
              data.image === 'dining-table-marketplace.jpg' ? diningTableMarketplaceImage :
              data.image === 'programming-books-marketplace.jpg' ? programmingBooksMarketplaceImage :
              getFallbackImage(data.title, data.category)
            ] : [getFallbackImage(data.title, data.category)],
            isFavorite: false,
            sellerType: data.seller_type as 'resident' | 'service_provider'
          };

          setItem(transformedItem);
        }
      } catch (error) {
        console.error('Error fetching item:', error);
        // Fallback to mock data
        const mockItem = mockItems.find(item => item.id === id);
        if (mockItem) {
          setItem(mockItem);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, language]);

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'like-new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'good': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'fair': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'new': return t.new;
      case 'like-new': return t.likeNew;
      case 'good': return t.good;
      case 'fair': return t.fair;
      default: return condition;
    }
  };

  const handleAddToCart = async () => {
    if (!item) return;

    const success = await addToCart(item.id, 1);
    if (success) {
      toast({
        title: t.cartSuccess,
      });
    }
  };

  const handleContactSeller = async () => {
    if (!item) return;

    try {
      const chatName = `${item.seller} - ${item.title}`;
      const chatDescription = language === 'en' 
        ? `Marketplace chat about "${item.title}" (RM${item.price.toLocaleString()})`
        : `Chat marketplace tentang "${item.title}" (RM${item.price.toLocaleString()})`;
      
      const roomId = await createGroupChat(chatName, chatDescription, []);
      
      navigate('/communication', {
        state: {
          roomId,
          chatWith: item.seller,
          presetMessage: language === 'en' 
            ? `Hi, is this item still available? - ${item.title} (RM${item.price.toLocaleString()})`
            : `Hai, adakah item ini masih tersedia? - ${item.title} (RM${item.price.toLocaleString()})`,
          itemInfo: {
            title: item.title,
            price: item.price,
            id: item.id
          }
        }
      });

      toast({
        title: t.chatSuccess,
      });
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' 
          ? 'Failed to create chat room' 
          : 'Gagal mencipta bilik chat',
        variant: 'destructive'
      });
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite functionality with backend
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-32 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-6 bg-muted rounded w-1/2"></div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto p-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/marketplace')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.backToMarketplace}
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.itemNotFound}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/marketplace')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t.backToMarketplace}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Item Image */}
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
            {item.images[0] && item.images[0] !== '/placeholder.svg' ? (
              <img 
                src={item.images[0]} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Item Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-foreground">{item.title}</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFavorite}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl font-bold text-primary">
                RM{item.price.toLocaleString()}
              </span>
              <Badge className={getConditionColor(item.condition)}>
                {getConditionText(item.condition)}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Seller Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="" />
              <AvatarFallback>
                {item.seller.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{item.seller}</p>
              <StarRating
                rating={item.sellerRating}
                size="sm"
                language={language}
              />
            </div>
          </div>

          <Separator />

          {/* Item Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{item.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{t.postedOn} {item.postedDate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="h-4 w-4" />
              <span className="capitalize">{item.category}</span>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">{t.description}</h3>
            <p className="text-muted-foreground leading-relaxed">{item.description}</p>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            {item.sellerType === 'service_provider' && (
              <Button
                size="lg"
                onClick={handleAddToCart}
                className="flex-1"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {t.addToCart}
              </Button>
            )}
            <Button
              variant="outline"
              size="lg"
              onClick={handleContactSeller}
              className={item.sellerType === 'resident' ? 'w-full' : 'flex-1'}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              {t.contactSeller}
            </Button>
          </div>
        </div>
      </div>

      {/* Reviews and Seller Rating Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ProductReviews 
            itemId={item.id}
            sellerId={item.sellerId}
            language={language}
          />
        </div>
        <div>
          <SellerRating 
            sellerId={item.sellerId}
            language={language}
          />
        </div>
      </div>
    </div>
  );
}