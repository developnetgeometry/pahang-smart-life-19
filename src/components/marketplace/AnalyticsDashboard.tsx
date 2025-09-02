import { useState, useEffect } from 'react';
import { TrendingUp, Eye, ShoppingCart, DollarSign, Users, Star, Package, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalViews: number;
  totalSales: number;
  totalRevenue: number;
  averageRating: number;
  conversionRate: number;
  topProducts: Array<{
    id: string;
    title: string;
    views: number;
    sales: number;
    revenue: number;
    rating: number;
  }>;
  salesTrend: Array<{
    date: string;
    sales: number;
    revenue: number;
    views: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    sales: number;
    revenue: number;
    percentage: number;
  }>;
  userAnalytics: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('sales');

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case '1d':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
      }

      // Use existing orders data until new analytics tables are available
      const marketplaceData: any[] = [];
      const productData: any[] = [];
      const userAnalyticsData: any[] = [];

      // Fetch orders for revenue calculation
      const { data: ordersData, error: ordersError } = await supabase
        .from('marketplace_orders')
        .select(`
          *,
          marketplace_items!inner(title, seller_id, price)
        `)
        .eq('marketplace_items.seller_id', user?.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (ordersError) throw ordersError;

      // Process analytics data
      const processedAnalytics = processAnalyticsData(marketplaceData, productData, userAnalyticsData, ordersData);
      setAnalytics(processedAnalytics);

    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (marketplaceData: any[], productData: any[], userAnalyticsData: any[], ordersData: any[]): AnalyticsData => {
    // Calculate totals
    const totalViews = marketplaceData.reduce((sum, item) => sum + (item.event_data?.views || 0), 0);
    const totalSales = ordersData.filter(order => order.status === 'completed').length;
    const totalRevenue = ordersData
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + (order.total_amount || 0), 0);

    // Calculate average rating
    const ratings = productData
      .filter(item => item.average_rating && typeof item.average_rating === 'number')
      .map(item => Number(item.average_rating));
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length 
      : 0;

    // Calculate conversion rate
    const conversionRate = totalViews > 0 ? (totalSales / totalViews) * 100 : 0;

    // Process top products
    const productMap = new Map();
    productData.forEach(item => {
      const productId = item.product_id;
      if (!productMap.has(productId)) {
        productMap.set(productId, {
          id: productId,
          title: item.marketplace_items?.title || 'Unknown Product',
          views: 0,
          sales: 0,
          revenue: 0,
          rating: item.average_rating || 0
        });
      }
      const product = productMap.get(productId);
      product.views += item.view_count || 0;
    });

    ordersData.forEach(order => {
      if (order.status === 'completed' && productMap.has(order.item_id)) {
        const product = productMap.get(order.item_id);
        product.sales += order.quantity || 1;
        product.revenue += order.total_amount || 0;
      }
    });

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Process sales trend
    const salesByDate = new Map();
    const viewsByDate = new Map();
    const revenueByDate = new Map();

    // Initialize dates
    const dates = [];
    for (let d = new Date(Date.now() - (parseInt(timeRange) * 24 * 60 * 60 * 1000)); d <= new Date(); d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dates.push(dateStr);
      salesByDate.set(dateStr, 0);
      viewsByDate.set(dateStr, 0);
      revenueByDate.set(dateStr, 0);
    }

    ordersData.forEach(order => {
      const date = order.created_at.split('T')[0];
      if (order.status === 'completed') {
        salesByDate.set(date, (salesByDate.get(date) || 0) + 1);
        revenueByDate.set(date, (revenueByDate.get(date) || 0) + (order.total_amount || 0));
      }
    });

    productData.forEach(item => {
      const date = item.date;
      viewsByDate.set(date, (viewsByDate.get(date) || 0) + (item.view_count || 0));
    });

    const salesTrend = dates.map(date => ({
      date,
      sales: salesByDate.get(date) || 0,
      revenue: revenueByDate.get(date) || 0,
      views: viewsByDate.get(date) || 0
    }));

    // Process category performance (placeholder - would need category data)
    const categoryPerformance = [
      { category: 'Electronics', sales: 45, revenue: 12500, percentage: 35 },
      { category: 'Clothing', sales: 32, revenue: 8900, percentage: 25 },
      { category: 'Home & Garden', sales: 28, revenue: 7200, percentage: 20 },
      { category: 'Books', sales: 15, revenue: 3400, percentage: 12 },
      { category: 'Sports', sales: 12, revenue: 2800, percentage: 8 }
    ];

    // Process user analytics
    const userTypes: Record<string, number> = userAnalyticsData.reduce((acc, item) => {
      const type = item.user_type || 'visitor';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalUsers = Object.values(userTypes).reduce((sum: number, count: number) => sum + count, 0);
    const userAnalytics = Object.entries(userTypes).map(([type, count]) => ({
      type,
      count,
      percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0
    }));

    return {
      totalViews,
      totalSales,
      totalRevenue,
      averageRating,
      conversionRate,
      topProducts,
      salesTrend,
      categoryPerformance,
      userAnalytics
    };
  };

  const formatCurrency = (amount: number) => {
    return `RM${amount.toLocaleString()}`;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  if (!analytics) {
    return <div>Failed to load analytics data</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Marketplace Analytics</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1d">Last Day</SelectItem>
            <SelectItem value="7d">Last Week</SelectItem>
            <SelectItem value="30d">Last Month</SelectItem>
            <SelectItem value="90d">Last 3 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Product page views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSales}</div>
            <p className="text-xs text-muted-foreground">
              Completed orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Gross sales revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Product ratings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversionRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              Views to sales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Trend Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Performance Trends</CardTitle>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="views">Views</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.salesTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.6} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Top Performing Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topProducts.slice(0, 5).map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <span className="font-medium truncate">{product.title}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {product.views} views • {product.sales} sales
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(product.revenue)}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.rating > 0 && `★ ${product.rating.toFixed(1)}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics.categoryPerformance}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="sales"
                >
                  {analytics.categoryPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.userAnalytics.map((userType) => (
              <div key={userType.type} className="space-y-2">
                <div className="flex justify-between">
                  <span className="capitalize">{userType.type}</span>
                  <span>{userType.count} ({userType.percentage}%)</span>
                </div>
                <Progress value={userType.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}