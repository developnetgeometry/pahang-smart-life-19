import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/use-user-roles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingBag, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  TrendingUp,
  DollarSign,
  Package,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  created_at: string;
  totalSold?: number; // Add optional totalSold property
}

interface DashboardStats {
  totalListings: number;
  activeListings: number;
  totalSales: number;
  totalRevenue: number;
  totalViews: number;
  averageOrderValue: number;
  conversionRate: number;
  topSellingProducts: MarketplaceItem[];
  recentOrders: any[];
  monthlyRevenue: { [key: string]: number };
  categoryPerformance: { [key: string]: { sales: number; revenue: number } };
  customerInsights: {
    totalCustomers: number;
    repeatCustomers: number;
    averageRating: number;
    totalReviews: number;
  };
}

export default function SellerDashboard() {
  const { language, user } = useAuth();
  const { hasRole } = useUserRoles();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    activeListings: 0,
    totalSales: 0,
    totalRevenue: 0,
    totalViews: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    topSellingProducts: [],
    recentOrders: [],
    monthlyRevenue: {},
    categoryPerformance: {},
    customerInsights: {
      totalCustomers: 0,
      repeatCustomers: 0,
      averageRating: 0,
      totalReviews: 0
    }
  });

  const isServiceProvider = hasRole('service_provider');

  const text = {
    en: {
      title: 'Seller Dashboard',
      subtitle: 'Manage your marketplace listings and track performance',
      overview: 'Overview',
      myListings: 'My Listings',
      createListing: 'Create New Listing',
      totalListings: 'Total Listings',
      activeListings: 'Active Listings',
      totalSales: 'Total Sales',
      totalRevenue: 'Total Revenue',
      totalViews: 'Total Views',
      averageOrderValue: 'Avg Order Value',
      conversionRate: 'Conversion Rate',
      customerInsights: 'Customer Insights',
      totalCustomers: 'Total Customers',
      repeatCustomers: 'Repeat Customers',
      averageRating: 'Avg Rating',
      totalReviews: 'Total Reviews',
      topProducts: 'Top Selling Products',
      recentOrders: 'Recent Orders',
      monthlyTrends: 'Monthly Trends',
      categoryPerformance: 'Category Performance',
      revenueGrowth: 'Revenue Growth',
      noListings: 'No listings yet',
      noListingsDesc: 'Create your first listing to start selling',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      views: 'Views',
      sold: 'Sold',
      stock: 'Stock',
      price: 'Price',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      activate: 'Activate',
      deactivate: 'Deactivate',
      deleteConfirm: 'Are you sure you want to delete this listing?',
      deleteSuccess: 'Listing deleted successfully',
      deleteError: 'Failed to delete listing',
      updateSuccess: 'Listing updated successfully',
      updateError: 'Failed to update listing',
      accessDenied: 'Access Denied',
      accessDeniedDesc: 'Only service providers can access the seller dashboard'
    },
    ms: {
      title: 'Papan Pemuka Penjual',
      subtitle: 'Uruskan senarai marketplace dan jejak prestasi anda',
      overview: 'Gambaran Keseluruhan',
      myListings: 'Senarai Saya',
      createListing: 'Cipta Senarai Baru',
      totalListings: 'Jumlah Senarai',
      activeListings: 'Senarai Aktif',
      totalSales: 'Jumlah Jualan',
      totalRevenue: 'Jumlah Pendapatan',
      totalViews: 'Jumlah Paparan',
      averageOrderValue: 'Purata Nilai Pesanan',
      conversionRate: 'Kadar Penukaran',
      customerInsights: 'Pandangan Pelanggan',
      totalCustomers: 'Jumlah Pelanggan',
      repeatCustomers: 'Pelanggan Berulang',
      averageRating: 'Purata Penilaian',
      totalReviews: 'Jumlah Ulasan',
      topProducts: 'Produk Terlaris',
      recentOrders: 'Pesanan Terkini',
      monthlyTrends: 'Trend Bulanan',
      categoryPerformance: 'Prestasi Kategori',
      revenueGrowth: 'Pertumbuhan Pendapatan',
      noListings: 'Belum ada senarai',
      noListingsDesc: 'Cipta senarai pertama anda untuk mula menjual',
      status: 'Status',
      active: 'Aktif',
      inactive: 'Tidak Aktif',
      views: 'Paparan',
      sold: 'Dijual',
      stock: 'Stok',
      price: 'Harga',
      actions: 'Tindakan',
      edit: 'Edit',
      delete: 'Padam',
      view: 'Lihat',
      activate: 'Aktifkan',
      deactivate: 'Nyahaktifkan',
      deleteConfirm: 'Adakah anda pasti mahu memadamkan senarai ini?',
      deleteSuccess: 'Senarai berjaya dipadamkan',
      deleteError: 'Gagal memadamkan senarai',
      updateSuccess: 'Senarai berjaya dikemas kini',
      updateError: 'Gagal mengemas kini senarai',
      accessDenied: 'Akses Ditolak',
      accessDeniedDesc: 'Hanya penyedia perkhidmatan boleh mengakses papan pemuka penjual'
    }
  };

  const t = text[language];

  useEffect(() => {
    if (user && isServiceProvider) {
      fetchSellerData();
    }
  }, [user, isServiceProvider]);

  const fetchSellerData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch seller's items with detailed analytics
      const { data: itemsData, error: itemsError } = await supabase
        .from('marketplace_items')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (itemsError) throw itemsError;

      // Fetch orders for this seller
      const { data: ordersData, error: ordersError } = await supabase
        .from('marketplace_orders')
        .select('*')
        .eq('seller_id', user.id)
        .order('order_date', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch reviews for seller's products
      const itemIds = (itemsData || []).map(item => item.id);
      let reviewsData = [];
      if (itemIds.length > 0) {
        const { data: reviews, error: reviewsError } = await supabase
          .from('product_reviews')
          .select('*')
          .in('item_id', itemIds);
        
        if (!reviewsError) reviewsData = reviews || [];
      }

      const items = itemsData || [];
      setItems(items as MarketplaceItem[]);
      const orders = ordersData || [];
      const reviews = reviewsData || [];

      // Calculate comprehensive analytics
      const totalViews = items.reduce((sum, item) => sum + (item.view_count || 0), 0);
      const totalSales = orders.filter(order => order.status === 'delivered').length;
      const totalRevenue = orders
        .filter(order => order.status === 'delivered')
        .reduce((sum, order) => sum + order.total_amount, 0);
      
      const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
      const conversionRate = totalViews > 0 ? (totalSales / totalViews) * 100 : 0;

      // Customer analytics
      const uniqueCustomers = new Set(orders.map(order => order.buyer_id)).size;
      const customerOrderCounts = {};
      orders.forEach(order => {
        customerOrderCounts[order.buyer_id] = (customerOrderCounts[order.buyer_id] || 0) + 1;
      });
      const repeatCustomers = Object.values(customerOrderCounts).filter((count: any) => Number(count) > 1).length;

      // Review analytics
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;

      // Top selling products
      const itemSalesMap = {};
      orders.filter(order => order.status === 'delivered').forEach(order => {
        itemSalesMap[order.item_id] = (itemSalesMap[order.item_id] || 0) + order.quantity;
      });
      
      const topSellingProducts = items
        .map(item => ({
          ...item,
          totalSold: itemSalesMap[item.id] || 0
        }))
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 5);

      // Monthly revenue (last 6 months)
      const monthlyRevenue = {};
      const categoryPerformance = {};
      const now = new Date();
      
      for (let i = 0; i < 6; i++) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = month.toLocaleDateString(language === 'en' ? 'en-US' : 'ms-MY', { 
          year: 'numeric', 
          month: 'short' 
        });
        monthlyRevenue[monthKey] = 0;
      }

      orders.filter(order => order.status === 'delivered').forEach(order => {
        const orderDate = new Date(order.order_date);
        const monthKey = orderDate.toLocaleDateString(language === 'en' ? 'en-US' : 'ms-MY', { 
          year: 'numeric', 
          month: 'short' 
        });
        
        if (monthlyRevenue.hasOwnProperty(monthKey)) {
          monthlyRevenue[monthKey] += order.total_amount;
        }

        // Category performance
        const item = items.find(item => item.id === order.item_id);
        if (item) {
          if (!categoryPerformance[item.category]) {
            categoryPerformance[item.category] = { sales: 0, revenue: 0 };
          }
          categoryPerformance[item.category].sales += order.quantity;
          categoryPerformance[item.category].revenue += order.total_amount;
        }
      });

      setStats({
        totalListings: items.length,
        activeListings: items.filter(item => item.is_active).length,
        totalSales,
        totalRevenue,
        totalViews,
        averageOrderValue,
        conversionRate,
        topSellingProducts,
        recentOrders: orders.slice(0, 10),
        monthlyRevenue,
        categoryPerformance,
        customerInsights: {
          totalCustomers: uniqueCustomers,
          repeatCustomers,
          averageRating,
          totalReviews: reviews.length
        }
      });

    } catch (error) {
      console.error('Error fetching seller data:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to fetch seller data' : 'Gagal mendapatkan data penjual',
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

      fetchSellerData(); // Refresh data
    } catch (error) {
      console.error('Error updating item status:', error);
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

      fetchSellerData(); // Refresh data
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: t.deleteError,
        variant: 'destructive'
      });
    }
  };

  if (!isServiceProvider) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{t.accessDenied}</h3>
              <p className="text-muted-foreground">{t.accessDeniedDesc}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
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

  const StatCard = ({ title, value, icon: Icon, color = "text-primary" }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground mt-2">{t.subtitle}</p>
        </div>
        <Button onClick={() => navigate('/marketplace')} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          {t.createListing}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="listings">{t.myListings}</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title={t.totalListings} 
              value={stats.totalListings} 
              icon={Package}
              color="text-blue-600"
            />
            <StatCard 
              title={t.activeListings} 
              value={stats.activeListings} 
              icon={ShoppingBag}
              color="text-green-600"
            />
            <StatCard 
              title={t.totalSales} 
              value={stats.totalSales} 
              icon={TrendingUp}
              color="text-purple-600"
            />
            <StatCard 
              title={t.totalRevenue} 
              value={`RM${stats.totalRevenue.toFixed(2)}`} 
              icon={DollarSign}
              color="text-emerald-600"
            />
          </div>

          {/* Advanced Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title={t.totalViews} 
              value={stats.totalViews} 
              icon={Eye}
              color="text-orange-600"
            />
            <StatCard 
              title={t.averageOrderValue} 
              value={`RM${stats.averageOrderValue.toFixed(2)}`} 
              icon={DollarSign}
              color="text-indigo-600"
            />
            <StatCard 
              title={t.conversionRate} 
              value={`${stats.conversionRate.toFixed(2)}%`} 
              icon={TrendingUp}
              color="text-cyan-600"
            />
            <StatCard 
              title={t.totalCustomers} 
              value={stats.customerInsights.totalCustomers} 
              icon={Users}
              color="text-pink-600"
            />
          </div>

          {/* Customer Insights */}
          <Card>
            <CardHeader>
              <CardTitle>{t.customerInsights}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-pink-600">{stats.customerInsights.totalCustomers}</p>
                  <p className="text-sm text-muted-foreground">{t.totalCustomers}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.customerInsights.repeatCustomers}</p>
                  <p className="text-sm text-muted-foreground">{t.repeatCustomers}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{stats.customerInsights.averageRating.toFixed(1)} ⭐</p>
                  <p className="text-sm text-muted-foreground">{t.averageRating}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.customerInsights.totalReviews}</p>
                  <p className="text-sm text-muted-foreground">{t.totalReviews}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Products */}
          <Card>
            <CardHeader>
              <CardTitle>{t.topProducts}</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topSellingProducts.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">{t.noListings}</p>
              ) : (
                <div className="space-y-4">
                  {stats.topSellingProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                          {product.image ? (
                            <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{product.title}</p>
                          <p className="text-sm text-muted-foreground">RM{product.price.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{product.totalSold || 0} sold</p>
                        <p className="text-sm text-muted-foreground">{product.view_count || 0} views</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Monthly Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>{t.monthlyTrends}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.monthlyRevenue).map(([month, revenue]) => (
                  <div key={month} className="flex items-center justify-between p-2 border-b">
                    <span className="text-sm font-medium">{month}</span>
                    <span className="text-sm font-bold text-green-600">RM{revenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle>{t.categoryPerformance}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.categoryPerformance).map(([category, performance]) => (
                  <div key={category} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium capitalize">{category}</h4>
                      <Badge>{performance.sales} sales</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Revenue: RM{performance.revenue.toFixed(2)}</span>
                      <span>Avg: RM{(performance.revenue / Math.max(performance.sales, 1)).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
                {Object.keys(stats.categoryPerformance).length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No sales data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.recentOrders}</CardTitle>
              <CardDescription>Latest orders from your customers</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent orders</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Order #{order.id.slice(-8)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.order_date).toLocaleDateString()}
                        </p>
                        <Badge className="mt-1">
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">RM{order.total_amount.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Qty: {order.quantity}</p>
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/my-orders')} 
                    className="w-full"
                  >
                    View All Orders
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listings" className="space-y-4">
          {items.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">{t.noListings}</h3>
                  <p className="text-muted-foreground mb-4">{t.noListingsDesc}</p>
                  <Button onClick={() => navigate('/marketplace')}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t.createListing}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0 mr-4">
                            <h3 className="text-lg font-semibold truncate">{item.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {item.is_active ? t.active : t.inactive}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm flex-1">
                            <div>
                              <span className="text-muted-foreground">{t.price}:</span>
                              <p className="font-semibold text-primary">RM{item.price.toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">{t.views}:</span>
                              <p className="font-semibold">{item.view_count || 0}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">{t.sold}:</span>
                              <p className="font-semibold">{item.sold_count || 0}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">{t.stock}:</span>
                              <p className="font-semibold">{item.stock_quantity || 'N/A'}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/marketplace/item/${item.id}`)}
                              className="flex-shrink-0"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="hidden sm:inline-block ml-1">{t.view}</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleItemStatus(item.id, item.is_active)}
                              className="flex-shrink-0"
                            >
                              {item.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              <span className="hidden sm:inline-block ml-1">
                                {item.is_active ? t.deactivate : t.activate}
                              </span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteItem(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="hidden sm:inline-block ml-1">{t.delete}</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}