import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingBag, 
  Heart, 
  DollarSign,
  Package,
  TrendingUp,
  Eye,
  Calendar,
  Star,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string;
  image: string;
  stock_quantity: number;
  sold_count: number;
  view_count: number;
  is_active: boolean;
  is_available?: boolean;
  created_at: string;
}

interface ResidentStats {
  totalPurchases: number;
  totalSpent: number;
  totalFavorites: number;
  itemsSold: number;
  revenueEarned: number;
  averageOrderValue: number;
  recentPurchases: any[];
  recentSales: any[];
  monthlySpending: { [key: string]: number };
  categorySpending: { [key: string]: number };
  myListings: MarketplaceItem[];
  totalListings: number;
  activeListings: number;
  totalViews: number;
}

export default function ResidentAnalytics() {
  const { language, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ResidentStats>({
    totalPurchases: 0,
    totalSpent: 0,
    totalFavorites: 0,
    itemsSold: 0,
    revenueEarned: 0,
    averageOrderValue: 0,
    recentPurchases: [],
    recentSales: [],
    monthlySpending: {},
    categorySpending: {},
    myListings: [],
    totalListings: 0,
    activeListings: 0,
    totalViews: 0
  });
  
  const [editingItem, setEditingItem] = useState<MarketplaceItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([
    'Electronics', 'Furniture', 'Clothing', 'Books', 'Sports & Recreation', 'Others'
  ]);

  const text = {
    en: {
      title: 'My Marketplace Activity',
      subtitle: 'Track your buying and selling activity',
      overview: 'Overview',
      purchases: 'Purchase History',
      sales: 'My Sales',
      listings: 'My Listings',
      favorites: 'Saved Items',
      totalPurchases: 'Total Purchases',
      totalSpent: 'Total Spent',
      totalFavorites: 'Saved Items',
      itemsSold: 'Items Sold',
      revenueEarned: 'Revenue Earned',
      averageOrder: 'Average Order',
      recentPurchases: 'Recent Purchases',
      recentSales: 'Recent Sales',
      monthlySpending: 'Monthly Spending',
      categorySpending: 'Spending by Category',
      noPurchases: 'No purchases yet',
      noPurchasesDesc: 'Start shopping in the marketplace',
      noSales: 'No sales yet',
      noSalesDesc: 'Create your first listing to start selling',
      noFavorites: 'No favorites yet',
      noFavoritesDesc: 'Save items you like for later',
      browseMaketplace: 'Browse Marketplace',
      viewFavorites: 'View Favorites',
      viewOrders: 'View All Orders',
      thisMonth: 'This Month',
      lastMonth: 'Last Month',
      status: 'Status',
      pending: 'Pending',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      viewDetails: 'View Details',
      myListings: 'My Listings',
      totalListings: 'Total Listings',
      activeListings: 'Active Listings',
      totalViews: 'Total Views',
      manageListings: 'Manage your marketplace listings',
      noListings: 'No listings yet',
      noListingsDesc: 'Create your first listing to start selling',
      createListing: 'Create Listing',
      editListing: 'Edit Listing',
      updateListing: 'Update Listing',
      deleteListing: 'Delete Listing',
      toggleStatus: 'Toggle Status',
      active: 'Active',
      inactive: 'Inactive',
      views: 'Views',
      sold: 'Sold',
      stock: 'Stock',
      priceLabel: 'Price',
      conditionLabel: 'Condition',
      categoryLabel: 'Category',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      activate: 'Activate',
      deactivate: 'Deactivate',
      markAsSold: 'Mark as Sold',
      markAsAvailable: 'Mark as Available',
      soldStatus: 'Sold',
      availableStatus: 'Available',
      markedAsSold: 'Item marked as sold',
      markedAsAvailable: 'Item marked as available',
      itemTitle: 'Title',
      itemDescription: 'Description',
      itemLocation: 'Location',
      selectCategory: 'Select Category',
      selectCondition: 'Select Condition',
      new: 'New',
      likeNew: 'Like New',
      good: 'Good',
      fair: 'Fair',
      cancel: 'Cancel',
      save: 'Save Changes',
      deleteConfirm: 'Are you sure you want to delete this listing?',
      updateSuccess: 'Listing updated successfully',
      updateError: 'Failed to update listing',
      deleteSuccess: 'Listing deleted successfully',
      deleteError: 'Failed to delete listing'
    },
    ms: {
      title: 'Aktiviti Marketplace Saya',
      subtitle: 'Jejaki aktiviti pembelian dan penjualan anda',
      overview: 'Gambaran Keseluruhan',
      purchases: 'Sejarah Pembelian',
      sales: 'Jualan Saya',
      listings: 'Senarai Saya',
      favorites: 'Item Tersimpan',
      totalPurchases: 'Jumlah Pembelian',
      totalSpent: 'Jumlah Dibelanja',
      totalFavorites: 'Item Tersimpan',
      itemsSold: 'Item Dijual',
      revenueEarned: 'Pendapatan Diperoleh',
      averageOrder: 'Purata Pesanan',
      recentPurchases: 'Pembelian Terkini',
      recentSales: 'Jualan Terkini',
      monthlySpending: 'Perbelanjaan Bulanan',
      categorySpending: 'Perbelanjaan Mengikut Kategori',
      noPurchases: 'Belum ada pembelian',
      noPurchasesDesc: 'Mula membeli-belah di marketplace',
      noSales: 'Belum ada jualan',
      noSalesDesc: 'Cipta senarai pertama untuk mula menjual',
      noFavorites: 'Belum ada kegemaran',
      noFavoritesDesc: 'Simpan item yang anda suka untuk kemudian',
      browseMaketplace: 'Layari Marketplace',
      viewFavorites: 'Lihat Kegemaran',
      viewOrders: 'Lihat Semua Pesanan',
      thisMonth: 'Bulan Ini',
      lastMonth: 'Bulan Lepas',
      status: 'Status',
      pending: 'Menunggu',
      delivered: 'Dihantar',
      cancelled: 'Dibatalkan',
      viewDetails: 'Lihat Butiran',
      myListings: 'Senarai Saya',
      totalListings: 'Jumlah Senarai',
      activeListings: 'Senarai Aktif',
      totalViews: 'Jumlah Paparan',
      manageListings: 'Uruskan senarai marketplace anda',
      noListings: 'Belum ada senarai',
      noListingsDesc: 'Cipta senarai pertama untuk mula menjual',
      createListing: 'Cipta Senarai',
      editListing: 'Edit Senarai',
      updateListing: 'Kemaskini Senarai',
      deleteListing: 'Padam Senarai',
      toggleStatus: 'Tukar Status',
      active: 'Aktif',
      inactive: 'Tidak Aktif',
      views: 'Paparan',
      sold: 'Dijual',
      stock: 'Stok',
      priceLabel: 'Harga',
      conditionLabel: 'Keadaan',
      categoryLabel: 'Kategori',
      actions: 'Tindakan',
      edit: 'Edit',
      delete: 'Padam',
      activate: 'Aktifkan',
      deactivate: 'Nyahaktifkan',
      markAsSold: 'Tandakan Terjual',
      markAsAvailable: 'Tandakan Tersedia',
      soldStatus: 'Terjual',
      availableStatus: 'Tersedia',
      markedAsSold: 'Item ditanda sebagai terjual',
      markedAsAvailable: 'Item ditanda sebagai tersedia',
      itemTitle: 'Tajuk',
      itemDescription: 'Penerangan',
      itemLocation: 'Lokasi',
      selectCategory: 'Pilih Kategori',
      selectCondition: 'Pilih Keadaan',
      new: 'Baru',
      likeNew: 'Seperti Baru',
      good: 'Baik',
      fair: 'Sederhana',
      cancel: 'Batal',
      save: 'Simpan Perubahan',
      deleteConfirm: 'Adakah anda pasti mahu memadamkan senarai ini?',
      updateSuccess: 'Senarai berjaya dikemaskini',
      updateError: 'Gagal mengemas kini senarai',
      deleteSuccess: 'Senarai berjaya dipadamkan',
      deleteError: 'Gagal memadamkan senarai'
    }
  };

  const t = text[language];

  useEffect(() => {
    if (user) {
      fetchResidentStats();
    }
  }, [user]);

  const fetchResidentStats = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch purchase orders
      const { data: purchases, error: purchasesError } = await supabase
        .from('marketplace_orders')
        .select('*')
        .eq('buyer_id', user.id)
        .order('order_date', { ascending: false });

      if (purchasesError) throw purchasesError;

      // Fetch sales (items sold by user)
      const { data: sales, error: salesError } = await supabase
        .from('marketplace_orders')
        .select('*')
        .eq('seller_id', user.id)
        .order('order_date', { ascending: false });

      if (salesError) throw salesError;

      // Fetch favorites count
      const { count: favoritesCount, error: favoritesError } = await supabase
        .from('marketplace_favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (favoritesError) throw favoritesError;

      // Fetch user's marketplace listings
      const { data: listings, error: listingsError } = await supabase
        .from('marketplace_items')
        .select('*, is_available')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (listingsError) throw listingsError;

      // Calculate purchase stats
      const purchasesList = purchases || [];
      const salesList = sales || [];
      const listingsList = listings || [];
      
      const totalSpent = purchasesList.reduce((sum, order) => sum + order.total_amount, 0);
      const revenueEarned = salesList.reduce((sum, order) => sum + order.total_amount, 0);
      const averageOrderValue = purchasesList.length > 0 ? totalSpent / purchasesList.length : 0;
      
      // Calculate listing stats
      const totalViews = listingsList.reduce((sum, item) => sum + (item.view_count || 0), 0);
      const activeListings = listingsList.filter(item => item.is_active).length;

      // Calculate monthly spending (last 6 months)
      const monthlySpending = {};
      const categorySpending = {};
      const now = new Date();
      
      for (let i = 0; i < 6; i++) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = month.toLocaleDateString(language === 'en' ? 'en-US' : 'ms-MY', { 
          year: 'numeric', 
          month: 'short' 
        });
        monthlySpending[monthKey] = 0;
      }

      // Fetch marketplace items for category spending
      if (purchasesList.length > 0) {
        const itemIds = purchasesList.map(order => order.item_id);
        const { data: items } = await supabase
          .from('marketplace_items')
          .select('id, category, price')
          .in('id', itemIds);

        purchasesList.forEach(order => {
          const orderDate = new Date(order.order_date);
          const monthKey = orderDate.toLocaleDateString(language === 'en' ? 'en-US' : 'ms-MY', { 
            year: 'numeric', 
            month: 'short' 
          });
          
          if (monthlySpending.hasOwnProperty(monthKey)) {
            monthlySpending[monthKey] += order.total_amount;
          }

          // Category spending
          const item = items?.find(item => item.id === order.item_id);
          if (item) {
            categorySpending[item.category] = (categorySpending[item.category] || 0) + order.total_amount;
          }
        });
      }

      setStats({
        totalPurchases: purchasesList.length,
        totalSpent,
        totalFavorites: favoritesCount || 0,
        itemsSold: salesList.length,
        revenueEarned,
        averageOrderValue,
        recentPurchases: purchasesList.slice(0, 5),
        recentSales: salesList.slice(0, 5),
        monthlySpending,
        categorySpending,
        myListings: listingsList,
        totalListings: listingsList.length,
        activeListings,
        totalViews
      });

    } catch (error) {
      console.error('Error fetching resident stats:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to fetch analytics data' : 'Gagal mendapatkan data analitik',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleItemStatus = async (itemId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('marketplace_items')
        .update({ is_active: !currentStatus })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: t.updateSuccess
      });

      fetchResidentStats(); // Refresh data
    } catch (error) {
      console.error('Error updating item status:', error);
      toast({
        title: t.updateError,
        variant: 'destructive'
      });
    }
  };

  const markAsSold = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_items')
        .update({ is_available: false })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: t.markedAsSold
      });

      fetchResidentStats(); // Refresh data
    } catch (error) {
      console.error('Error marking item as sold:', error);
      toast({
        title: t.updateError,
        variant: 'destructive'
      });
    }
  };

  const markAsAvailable = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_items')
        .update({ is_available: true })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: t.markedAsAvailable
      });

      fetchResidentStats(); // Refresh data
    } catch (error) {
      console.error('Error marking item as available:', error);
      toast({
        title: t.updateError,
        variant: 'destructive'
      });
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm(t.deleteConfirm)) return;

    try {
      const { error } = await supabase
        .from('marketplace_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: t.deleteSuccess
      });

      fetchResidentStats(); // Refresh data
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: t.deleteError,
        variant: 'destructive'
      });
    }
  };

  const handleEditListing = (item: MarketplaceItem) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const saveEditedListing = async () => {
    if (!editingItem) return;

    try {
      const { error } = await supabase
        .from('marketplace_items')
        .update({
          title: editingItem.title,
          description: editingItem.description,
          price: editingItem.price,
          category: editingItem.category,
          condition: editingItem.condition,
          location: editingItem.location,
          stock_quantity: editingItem.stock_quantity
        })
        .eq('id', editingItem.id);

      if (error) throw error;

      toast({
        title: t.updateSuccess
      });

      setIsEditDialogOpen(false);
      setEditingItem(null);
      fetchResidentStats(); // Refresh data
    } catch (error) {
      console.error('Error updating listing:', error);
      toast({
        title: t.updateError,
        variant: 'destructive'
      });
    }
  };

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
    const conditionMap = {
      'new': t.new,
      'like-new': t.likeNew,
      'good': t.good,
      'fair': t.fair
    };
    return conditionMap[condition] || condition;
  };

  const StatCard = ({ title, value, icon: Icon, color = "text-primary", subtitle = "" }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {t[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-8 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground mt-2">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/favorites')}>
            <Heart className="h-4 w-4 mr-2" />
            {t.viewFavorites}
          </Button>
          <Button onClick={() => navigate('/my-orders')}>
            <Package className="h-4 w-4 mr-2" />
            {t.viewOrders}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
          <TabsTrigger value="purchases">{t.purchases}</TabsTrigger>
          <TabsTrigger value="sales">{t.sales}</TabsTrigger>
          <TabsTrigger value="listings">{t.listings}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard 
              title={t.totalPurchases} 
              value={stats.totalPurchases} 
              icon={ShoppingBag}
              color="text-blue-600"
            />
            <StatCard 
              title={t.totalSpent} 
              value={`RM${stats.totalSpent.toFixed(2)}`} 
              icon={DollarSign}
              color="text-red-600"
            />
            <StatCard 
              title={t.averageOrder} 
              value={`RM${stats.averageOrderValue.toFixed(2)}`} 
              icon={TrendingUp}
              color="text-purple-600"
            />
            <StatCard 
              title={t.totalFavorites} 
              value={stats.totalFavorites} 
              icon={Heart}
              color="text-pink-600"
            />
            <StatCard 
              title={t.itemsSold} 
              value={stats.itemsSold} 
              icon={Package}
              color="text-green-600"
            />
            <StatCard 
              title={t.revenueEarned} 
              value={`RM${stats.revenueEarned.toFixed(2)}`} 
              icon={DollarSign}
              color="text-emerald-600"
            />
          </div>

          {/* Listing Management Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title={t.totalListings} 
              value={stats.totalListings} 
              icon={Package}
              color="text-blue-600"
            />
            <StatCard 
              title={t.activeListings} 
              value={stats.activeListings} 
              icon={Eye}
              color="text-green-600"
            />
            <StatCard 
              title={t.totalViews} 
              value={stats.totalViews} 
              icon={Eye}
              color="text-purple-600"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="font-semibold mb-2">{t.browseMaketplace}</h3>
                <Button onClick={() => navigate('/marketplace')} className="w-full">
                  {t.browseMaketplace}
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="h-12 w-12 mx-auto mb-4 text-pink-600" />
                <h3 className="font-semibold mb-2">{t.favorites}</h3>
                <Button variant="outline" onClick={() => navigate('/favorites')} className="w-full">
                  {t.viewFavorites}
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="font-semibold mb-2">{t.viewOrders}</h3>
                <Button variant="outline" onClick={() => navigate('/my-orders')} className="w-full">
                  {t.viewOrders}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="purchases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.recentPurchases}</CardTitle>
              <CardDescription>Your latest marketplace purchases</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentPurchases.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">{t.noPurchases}</h3>
                  <p className="text-muted-foreground mb-4">{t.noPurchasesDesc}</p>
                  <Button onClick={() => navigate('/marketplace')}>
                    {t.browseMaketplace}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentPurchases.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Order #{order.id.slice(-8)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.order_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">RM{order.total_amount.toFixed(2)}</p>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/my-orders')} 
                    className="w-full"
                  >
                    {t.viewOrders}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.recentSales}</CardTitle>
              <CardDescription>Items you've sold recently</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentSales.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">{t.noSales}</h3>
                  <p className="text-muted-foreground mb-4">{t.noSalesDesc}</p>
                  <Button onClick={() => navigate('/marketplace')}>
                    {t.browseMaketplace}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentSales.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Order #{order.id.slice(-8)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.order_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">+RM{order.total_amount.toFixed(2)}</p>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/my-orders')} 
                    className="w-full"
                  >
                    {t.viewOrders}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.myListings}</CardTitle>
              <CardDescription>{t.manageListings}</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.myListings.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">{t.noListings}</h3>
                  <p className="text-muted-foreground mb-4">{t.noListingsDesc}</p>
                  <Button onClick={() => navigate('/marketplace')}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t.createListing}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.myListings.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{item.title}</h3>
                            <Badge 
                              variant={item.is_active ? "default" : "secondary"}
                            >
                              {item.is_active ? t.active : t.inactive}
                            </Badge>
                            {item.is_available !== undefined && (
                              <Badge 
                                variant={item.is_available ? "outline" : "destructive"}
                              >
                                {item.is_available ? t.availableStatus : t.soldStatus}
                              </Badge>
                            )}
                            <Badge className={getConditionColor(item.condition)}>
                              {getConditionText(item.condition)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{t.priceLabel}: RM{item.price.toFixed(2)}</span>
                            <span>{t.categoryLabel}: {item.category}</span>
                            <span>{t.stock}: {item.stock_quantity}</span>
                            <span>{t.views}: {item.view_count || 0}</span>
                            <span>{t.sold}: {item.sold_count || 0}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditListing(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleItemStatus(item.id, item.is_active)}
                            title={item.is_active ? t.deactivate : t.activate}
                          >
                            {item.is_active ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => item.is_available ? markAsSold(item.id) : markAsAvailable(item.id)}
                            title={item.is_available ? t.markAsSold : t.markAsAvailable}
                          >
                            {item.is_available ? (
                              <Package className="h-4 w-4 text-orange-600" />
                            ) : (
                              <Package className="h-4 w-4 text-red-600" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteItem(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button 
                    onClick={() => navigate('/marketplace')} 
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t.createListing}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Listing Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.editListing}</DialogTitle>
            <DialogDescription>
              Update your marketplace listing information
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">{t.itemTitle}</Label>
                <Input
                  id="title"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    title: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="description">{t.itemDescription}</Label>
                <Textarea
                  id="description"
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    description: e.target.value
                  })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">{t.priceLabel} (RM)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      price: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="stock">{t.stock}</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={editingItem.stock_quantity}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      stock_quantity: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">{t.categoryLabel}</Label>
                  <Select
                    value={editingItem.category}
                    onValueChange={(value) => setEditingItem({
                      ...editingItem,
                      category: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectCategory} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="condition">{t.conditionLabel}</Label>
                  <Select
                    value={editingItem.condition}
                    onValueChange={(value) => setEditingItem({
                      ...editingItem,
                      condition: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectCondition} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">{t.new}</SelectItem>
                      <SelectItem value="like-new">{t.likeNew}</SelectItem>
                      <SelectItem value="good">{t.good}</SelectItem>
                      <SelectItem value="fair">{t.fair}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="location">{t.itemLocation}</Label>
                <Input
                  id="location"
                  value={editingItem.location}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    location: e.target.value
                  })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingItem(null);
                  }}
                >
                  {t.cancel}
                </Button>
                <Button onClick={saveEditedListing}>
                  {t.save}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}