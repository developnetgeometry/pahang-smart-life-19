import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/use-user-roles';
import AdvertisementCarousel from '@/components/marketplace/AdvertisementCarousel';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingBag, Plus, Search, Heart, MessageCircle, Star, MapPin, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useChatRooms } from '@/hooks/use-chat-rooms';
import { supabase } from '@/integrations/supabase/client';

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
  sellerRating: number;
  location: string;
  postedDate: string;
  images: string[];
  isFavorite: boolean;
}

export default function Marketplace() {
  const { language, user } = useAuth();
  const { hasRole } = useUserRoles();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createGroupChat } = useChatRooms();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if user is a service provider
  const isServiceProvider = hasRole('service_provider');
  
  // Form state for new listing
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    price: '',
    location: '',
    contact: ''
  });

  const text = {
    en: {
      title: 'Community Marketplace',
      subtitle: 'Buy and sell items within your community',
      newListing: 'New Listing',
      search: 'Search items...',
      category: 'Category',
      condition: 'Condition',
      allCategories: 'All Categories',
      allConditions: 'All Conditions',
      electronics: 'Electronics',
      furniture: 'Furniture',
      clothing: 'Clothing',
      books: 'Books',
      sports: 'Sports & Recreation',
      others: 'Others',
      new: 'New',
      likeNew: 'Like New',
      good: 'Good',
      fair: 'Fair',
      price: 'Price',
      seller: 'Seller',
      rating: 'Rating',
      location: 'Location',
      postedOn: 'Posted on',
      contact: 'Contact Seller',
      favorite: 'Add to Favorites',
      createTitle: 'Create New Listing',
      createSubtitle: 'Sell your items to the community',
      itemTitle: 'Item Title',
      itemDescription: 'Description',
      itemPrice: 'Price (RM)',
      selectCategory: 'Select Category',
      selectCondition: 'Select Condition',
      contactInfo: 'Contact Information',
      create: 'Create Listing',
      cancel: 'Cancel',
      createSuccess: 'Listing created successfully!',
      contactSuccess: 'Contact request sent!'
    },
    ms: {
      title: 'Pasar Komuniti',
      subtitle: 'Beli dan jual barang dalam komuniti anda',
      newListing: 'Senarai Baru',
      search: 'Cari barang...',
      category: 'Kategori',
      condition: 'Keadaan',
      allCategories: 'Semua Kategori',
      allConditions: 'Semua Keadaan',
      electronics: 'Elektronik',
      furniture: 'Perabot',
      clothing: 'Pakaian',
      books: 'Buku',
      sports: 'Sukan & Rekreasi',
      others: 'Lain-lain',
      new: 'Baru',
      likeNew: 'Seperti Baru',
      good: 'Baik',
      fair: 'Sederhana',
      price: 'Harga',
      seller: 'Penjual',
      rating: 'Penilaian',
      location: 'Lokasi',
      postedOn: 'Disiarkan pada',
      contact: 'Hubungi Penjual',
      favorite: 'Tambah ke Kegemaran',
      createTitle: 'Cipta Senarai Baru',
      createSubtitle: 'Jual barang anda kepada komuniti',
      itemTitle: 'Tajuk Barang',
      itemDescription: 'Penerangan',
      itemPrice: 'Harga (RM)',
      selectCategory: 'Pilih Kategori',
      selectCondition: 'Pilih Keadaan',
      contactInfo: 'Maklumat Hubungan',
      create: 'Cipta Senarai',
      cancel: 'Batal',
      createSuccess: 'Senarai berjaya dicipta!',
      contactSuccess: 'Permintaan hubungan dihantar!'
    }
  };

  const t = text[language];

  // Fetch marketplace items from Supabase with timeout
  useEffect(() => {
    const fetchMarketplaceItems = async () => {
      try {
        // Add timeout to prevent hanging queries
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 5000)
        );

        const queryPromise = supabase
          .from('marketplace_items')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(20); // Limit results for better performance

        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

        if (error) throw error;

        // Helper function to get fallback image based on category/title
        const getFallbackImage = (title: string, category: string) => {
          const titleLower = title.toLowerCase();
          if (titleLower.includes('iphone') || category === 'electronics') return iphoneMarketplaceImage;
          if (titleLower.includes('table') || titleLower.includes('dining') || category === 'furniture') return diningTableMarketplaceImage;
          if (titleLower.includes('book') || category === 'books') return programmingBooksMarketplaceImage;
          return '/placeholder.svg';
        };

        // Transform Supabase data to match our interface
        const transformedItems: MarketplaceItem[] = (data || []).map(item => ({
          id: item.id,
          title: item.title,
          description: item.description || '',
          price: Number(item.price),
          category: item.category,
          condition: item.condition as 'new' | 'like-new' | 'good' | 'fair',
          seller: 'Anonymous User',
          sellerRating: 4.5,
          location: item.location || '',
          postedDate: new Date(item.created_at).toISOString().split('T')[0],
          images: item.image ? [
            item.image.startsWith('http') ? item.image : 
            item.image === 'iphone-marketplace.jpg' ? iphoneMarketplaceImage :
            item.image === 'dining-table-marketplace.jpg' ? diningTableMarketplaceImage :
            item.image === 'programming-books-marketplace.jpg' ? programmingBooksMarketplaceImage :
            getFallbackImage(item.title, item.category)
          ] : [getFallbackImage(item.title, item.category)],
          isFavorite: false
        }));

        setMarketplaceItems(transformedItems.length > 0 ? transformedItems : mockItems);
      } catch (error) {
        console.error('Error fetching marketplace items:', error);
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

  const mockItems: MarketplaceItem[] = [
    {
      id: '1',
      title: language === 'en' ? 'iPhone 13 Pro Max' : 'iPhone 13 Pro Max',
      description: language === 'en' ? 'Excellent condition, comes with original box and charger' : 'Keadaan sangat baik, disertakan dengan kotak asal dan pengecas',
      price: 3500,
      category: 'electronics',
      condition: 'like-new',
      seller: 'John Doe',
      sellerRating: 4.8,
      location: 'Block A, Unit 15-2',
      postedDate: '2024-01-15',
      images: [iphoneMarketplaceImage],
      isFavorite: false
    },
    {
      id: '2',
      title: language === 'en' ? 'IKEA Dining Table Set' : 'Set Meja Makan IKEA',
      description: language === 'en' ? '6-seater dining table with chairs, good condition' : 'Meja makan 6 tempat duduk dengan kerusi, keadaan baik',
      price: 800,
      category: 'furniture',
      condition: 'good',
      seller: 'Sarah Chen',
      sellerRating: 4.5,
      location: 'Block B, Unit 8-1',
      postedDate: '2024-01-12',
      images: [diningTableMarketplaceImage],
      isFavorite: true
    },
    {
      id: '3',
      title: language === 'en' ? 'Programming Books Collection' : 'Koleksi Buku Pengaturcaraan',
      description: language === 'en' ? 'Various programming books, perfect for students' : 'Pelbagai buku pengaturcaraan, sesuai untuk pelajar',
      price: 150,
      category: 'books',
      condition: 'good',
      seller: 'Mike Wong',
      sellerRating: 4.9,
      location: 'Block C, Unit 12-5',
      postedDate: '2024-01-10',
      images: [programmingBooksMarketplaceImage],
      isFavorite: false
    }
  ];

  const categories = [
    { value: 'all', label: t.allCategories },
    { value: 'electronics', label: t.electronics },
    { value: 'furniture', label: t.furniture },
    { value: 'clothing', label: t.clothing },
    { value: 'books', label: t.books },
    { value: 'sports', label: t.sports },
    { value: 'others', label: t.others }
  ];

  const conditions = [
    { value: 'all', label: t.allConditions },
    { value: 'new', label: t.new },
    { value: 'like-new', label: t.likeNew },
    { value: 'good', label: t.good },
    { value: 'fair', label: t.fair }
  ];

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'like-new': return 'bg-blue-100 text-blue-800';
      case 'good': return 'bg-yellow-100 text-yellow-800';
      case 'fair': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const filteredItems = marketplaceItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesCondition = selectedCondition === 'all' || item.condition === selectedCondition;
    return matchesSearch && matchesCategory && matchesCondition;
  });

  const handleCreateListing = async () => {
    if (!user) {
      toast({
        title: language === 'en' ? 'Authentication Required' : 'Pengesahan Diperlukan',
        description: language === 'en' ? 'Please login to create a listing' : 'Sila log masuk untuk mencipta senarai',
        variant: 'destructive'
      });
      return;
    }

    // Validate required fields
    if (!formData.title || !formData.category || !formData.condition || !formData.price) {
      toast({
        title: language === 'en' ? 'Validation Error' : 'Ralat Pengesahan',
        description: language === 'en' ? 'Please fill in all required fields' : 'Sila isi semua medan yang diperlukan',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get user's district from their profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('district_id')
        .eq('id', user.id)
        .single();

      const { error } = await supabase
        .from('marketplace_items')
        .insert({
          seller_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          price: parseFloat(formData.price),
          condition: formData.condition,
          location: formData.location,
          district_id: profile?.district_id,
          is_available: true,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: t.createSuccess,
      });

      // Reset form and close dialog
      setFormData({
        title: '',
        description: '',
        category: '',
        condition: '',
        price: '',
        location: '',
        contact: ''
      });
      setIsCreateOpen(false);

      // Refresh the marketplace items
      const fetchMarketplaceItems = async () => {
        try {
          const { data, error } = await supabase
            .from('marketplace_items')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

          if (error) throw error;

          // Transform data to match our interface (reusing existing logic)
          const getFallbackImage = (title: string, category: string) => {
            const titleLower = title.toLowerCase();
            if (titleLower.includes('iphone') || category === 'electronics') return iphoneMarketplaceImage;
            if (titleLower.includes('table') || titleLower.includes('dining') || category === 'furniture') return diningTableMarketplaceImage;
            if (titleLower.includes('book') || category === 'books') return programmingBooksMarketplaceImage;
            return '/placeholder.svg';
          };

          const transformedItems: MarketplaceItem[] = (data || []).map(item => ({
            id: item.id,
            title: item.title,
            description: item.description || '',
            price: Number(item.price),
            category: item.category,
            condition: item.condition as 'new' | 'like-new' | 'good' | 'fair',
            seller: 'Anonymous User',
            sellerRating: 4.5,
            location: item.location || '',
            postedDate: new Date(item.created_at).toISOString().split('T')[0],
            images: item.image ? [
              item.image.startsWith('http') ? item.image : 
              item.image === 'iphone-marketplace.jpg' ? iphoneMarketplaceImage :
              item.image === 'dining-table-marketplace.jpg' ? diningTableMarketplaceImage :
              item.image === 'programming-books-marketplace.jpg' ? programmingBooksMarketplaceImage :
              getFallbackImage(item.title, item.category)
            ] : [getFallbackImage(item.title, item.category)],
            isFavorite: false
          }));

          setMarketplaceItems(transformedItems.length > 0 ? transformedItems : mockItems);
        } catch (error) {
          console.error('Error refreshing marketplace items:', error);
        }
      };

      await fetchMarketplaceItems();

    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to create listing' : 'Gagal mencipta senarai',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactSeller = async (item: MarketplaceItem) => {
    try {
      // Create a chat room for the marketplace item
      const chatName = `${item.seller} - ${item.title}`;
      const chatDescription = language === 'en' 
        ? `Marketplace chat about "${item.title}" (RM${item.price.toLocaleString()})`
        : `Chat marketplace tentang "${item.title}" (RM${item.price.toLocaleString()})`;
      
      const roomId = await createGroupChat(chatName, chatDescription, []);
      
      // Navigate to communication hub with the created room
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
        title: language === 'en' ? 'Chat Created' : 'Chat Dicipta',
        description: language === 'en' 
          ? `Chat room created for ${item.title}` 
          : `Bilik chat dicipta untuk ${item.title}`
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

  return (
    <div className="space-y-6">
      {/* Advertisement Section */}
      <AdvertisementCarousel language={language} />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        {user && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t.newListing}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">{t.category}*</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectCategory} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.slice(1).map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="condition">{t.condition}*</Label>
                    <Select value={formData.condition} onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectCondition} />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.slice(1).map((condition) => (
                          <SelectItem key={condition.value} value={condition.value}>
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
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t.itemDescription}</Label>
                  <Textarea 
                    id="description" 
                    placeholder={t.itemDescription}
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    placeholder="e.g., Block A, Unit 10-2"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">{t.contactInfo}</Label>
                  <Input 
                    id="contact" 
                    placeholder="Phone number or email"
                    value={formData.contact}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>
                    {t.cancel}
                  </Button>
                  <Button onClick={handleCreateListing} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {language === 'en' ? 'Creating...' : 'Mencipta...'}
                      </>
                    ) : (
                      t.create
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

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
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                {item.images[0] && item.images[0] !== '/placeholder.svg' ? (
                  <img 
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
                <Button variant="ghost" size="sm">
                  <Heart className={`h-4 w-4 ${item.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-xs">
                    {item.seller.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.seller}</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-muted-foreground">{item.sellerRating}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{item.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{t.postedOn} {item.postedDate}</span>
                </div>
              </div>

              <Button className="w-full" onClick={() => handleContactSeller(item)}>
                <MessageCircle className="h-4 w-4 mr-2" />
                {t.contact}
              </Button>
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
                {language === 'en' ? 'No items found' : 'Tiada barang dijumpai'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}