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
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

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
    categorySpending: {}
  });

  const text = {
    en: {
      title: 'My Marketplace Activity',
      subtitle: 'Track your buying and selling activity',
      overview: 'Overview',
      purchases: 'Purchase History',
      sales: 'My Sales',
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
      viewDetails: 'View Details'
    },
    ms: {
      title: 'Aktiviti Marketplace Saya',
      subtitle: 'Jejaki aktiviti pembelian dan penjualan anda',
      overview: 'Gambaran Keseluruhan',
      purchases: 'Sejarah Pembelian',
      sales: 'Jualan Saya',
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
      viewDetails: 'Lihat Butiran'
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

      // Calculate purchase stats
      const purchasesList = purchases || [];
      const salesList = sales || [];
      
      const totalSpent = purchasesList.reduce((sum, order) => sum + order.total_amount, 0);
      const revenueEarned = salesList.reduce((sum, order) => sum + order.total_amount, 0);
      const averageOrderValue = purchasesList.length > 0 ? totalSpent / purchasesList.length : 0;

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
        categorySpending
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
      </Tabs>
    </div>
  );
}