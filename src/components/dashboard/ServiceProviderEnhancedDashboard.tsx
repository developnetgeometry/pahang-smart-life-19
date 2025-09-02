import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, 
  DollarSign, 
  Package, 
  Star,
  TrendingUp,
  Clock,
  Users,
  Calendar,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WeatherWidget } from './WeatherWidget';
import SecurityAlertButton from '@/components/security/SecurityAlertButton';

interface ServiceProviderStats {
  totalOrders: number;
  monthlyRevenue: number;
  averageRating: number;
  completedServices: number;
  pendingOrders: number;
  recentOrders: any[];
  topServices: any[];
}

export default function ServiceProviderEnhancedDashboard() {
  const { language, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [stats, setStats] = useState<ServiceProviderStats>({
    totalOrders: 0,
    monthlyRevenue: 0,
    averageRating: 0,
    completedServices: 0,
    pendingOrders: 0,
    recentOrders: [],
    topServices: []
  });
  const [loading, setLoading] = useState(true);

  const text = {
    en: {
      title: 'Service Provider Dashboard',
      subtitle: 'Manage your services and track performance',
      overview: 'Business Overview',
      totalOrders: 'Total Orders',
      monthlyRevenue: 'Monthly Revenue',
      averageRating: 'Average Rating',
      completedServices: 'Completed Services',
      pendingOrders: 'Pending Orders',
      recentOrders: 'Recent Orders',
      topServices: 'Top Services',
      quickActions: 'Quick Actions',
      viewAllOrders: 'View All Orders',
      manageServices: 'Manage Services',
      updateProfile: 'Update Profile',
      viewAnalytics: 'View Analytics',
      reportSecurity: 'Report Security Issue',
      noOrders: 'No orders yet',
      orderDetails: 'View Details',
      revenue: 'Revenue',
      orders: 'orders',
      services: 'services',
      thisMonth: 'This Month',
      performance: 'Performance Metrics',
      customerSatisfaction: 'Customer Satisfaction',
      responseTime: 'Avg Response Time',
      completionRate: 'Completion Rate',
      hours: 'hours',
      securityAlert: 'Security Alert',
      securityDesc: 'Report security concerns that require immediate attention'
    },
    ms: {
      title: 'Papan Pemuka Penyedia Perkhidmatan',
      subtitle: 'Urus perkhidmatan anda dan jejaki prestasi',
      overview: 'Gambaran Keseluruhan Perniagaan',
      totalOrders: 'Jumlah Pesanan',
      monthlyRevenue: 'Pendapatan Bulanan',
      averageRating: 'Penilaian Purata',
      completedServices: 'Perkhidmatan Selesai',
      pendingOrders: 'Pesanan Tertangguh',
      recentOrders: 'Pesanan Terkini',
      topServices: 'Perkhidmatan Teratas',
      quickActions: 'Tindakan Pantas',
      viewAllOrders: 'Lihat Semua Pesanan',
      manageServices: 'Urus Perkhidmatan',
      updateProfile: 'Kemaskini Profil',
      viewAnalytics: 'Lihat Analitik',
      reportSecurity: 'Laporkan Isu Keselamatan',
      noOrders: 'Tiada pesanan lagi',
      orderDetails: 'Lihat Butiran',
      revenue: 'Pendapatan',
      orders: 'pesanan',
      services: 'perkhidmatan',
      thisMonth: 'Bulan Ini',
      performance: 'Metrik Prestasi',
      customerSatisfaction: 'Kepuasan Pelanggan',
      responseTime: 'Purata Masa Respons',
      completionRate: 'Kadar Penyiapan',
      hours: 'jam',
      securityAlert: 'Amaran Keselamatan',
      securityDesc: 'Laporkan kebimbangan keselamatan yang memerlukan perhatian segera'
    }
  };

  const t = text[language];

  useEffect(() => {
    if (user) {
      fetchServiceProviderStats();
    }
  }, [user]);

  const fetchServiceProviderStats = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch marketplace orders where user is the seller
      const { data: orders, error: ordersError } = await supabase
        .from('marketplace_orders')
        .select('*')
        .eq('seller_id', user.id)
        .order('order_date', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch marketplace items created by user
      const { data: items, error: itemsError } = await supabase
        .from('marketplace_items')
        .select('*')
        .eq('seller_id', user.id);

      if (itemsError) throw itemsError;

      // Calculate stats
      const ordersList = orders || [];
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyOrders = ordersList.filter(order => {
        const orderDate = new Date(order.order_date);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      });

      const completedOrders = ordersList.filter(order => order.status === 'delivered');
      const pendingOrders = ordersList.filter(order => ['pending', 'confirmed', 'shipped'].includes(order.status));
      const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.total_amount, 0);

      // Get top services (most ordered items)
      const itemOrderCount: { [key: string]: { item: any, count: number, revenue: number } } = {};
      ordersList.forEach(order => {
        const item = items?.find(item => item.id === order.item_id);
        if (item) {
          if (!itemOrderCount[item.id]) {
            itemOrderCount[item.id] = { item, count: 0, revenue: 0 };
          }
          itemOrderCount[item.id].count += order.quantity;
          itemOrderCount[item.id].revenue += order.total_amount;
        }
      });

      const topServices = Object.values(itemOrderCount)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalOrders: ordersList.length,
        monthlyRevenue,
        averageRating: 4.3, // Placeholder - would need actual rating calculation
        completedServices: completedOrders.length,
        pendingOrders: pendingOrders.length,
        recentOrders: ordersList.slice(0, 5),
        topServices
      });

    } catch (error) {
      console.error('Error fetching service provider stats:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to fetch dashboard data' : 'Gagal mendapatkan data papan pemuka',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'orders':
        navigate('/my-orders');
        break;
      case 'services':
        navigate('/marketplace');
        break;
      case 'profile':
        navigate('/my-profile');
        break;
      case 'analytics':
        navigate('/seller-dashboard');
        break;
      default:
        toast({
          title: language === 'en' ? 'Info' : 'Maklumat',
          description: language === 'en' ? `${action} feature coming soon` : `Ciri ${action} akan datang`,
        });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <SecurityAlertButton />
      </div>

      {/* Security Alert Card */}
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
            <Shield className="w-5 h-5" />
            {t.securityAlert}
          </CardTitle>
          <CardDescription className="text-orange-700 dark:text-orange-300">
            {t.securityDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SecurityAlertButton variant="outline" className="border-orange-300 text-orange-800 hover:bg-orange-100" />
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t.totalOrders}</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
                <p className="text-xs text-muted-foreground">{t.thisMonth}</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t.monthlyRevenue}</p>
                <p className="text-2xl font-bold text-green-600">RM{stats.monthlyRevenue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{t.thisMonth}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t.averageRating}</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</p>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t.completedServices}</p>
                <p className="text-2xl font-bold text-purple-600">{stats.completedServices}</p>
                <p className="text-xs text-muted-foreground">{t.services}</p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t.pendingOrders}</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</p>
                <p className="text-xs text-muted-foreground">{t.orders}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              {t.recentOrders}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t.noOrders}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">Order #{order.id.slice(-8)}</p>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.order_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">RM{order.total_amount.toFixed(2)}</p>
                      <Button variant="ghost" size="sm">
                        {t.orderDetails}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weather Widget */}
        <WeatherWidget />
      </div>

      {/* Top Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {t.topServices}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.topServices.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No services data available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.topServices.map((service, index) => (
                <div key={service.item.id} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">#{index + 1}</Badge>
                    <h4 className="font-medium">{service.item.title}</h4>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{service.count} {t.orders}</p>
                    <p className="text-green-600 font-medium">RM{service.revenue.toFixed(2)} {t.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t.quickActions}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2" 
              onClick={() => handleQuickAction('orders')}
            >
              <ShoppingBag className="w-6 h-6" />
              {t.viewAllOrders}
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2" 
              onClick={() => handleQuickAction('services')}
            >
              <Package className="w-6 h-6" />
              {t.manageServices}
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2" 
              onClick={() => handleQuickAction('profile')}
            >
              <Users className="w-6 h-6" />
              {t.updateProfile}
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2" 
              onClick={() => handleQuickAction('analytics')}
            >
              <TrendingUp className="w-6 h-6" />
              {t.viewAnalytics}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}