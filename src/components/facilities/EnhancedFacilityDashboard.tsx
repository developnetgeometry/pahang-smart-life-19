import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, DollarSign, Users, AlertTriangle, Wrench, Package, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardStats {
  totalBookings: number;
  pendingApprovals: number;
  totalRevenue: number;
  occupancyRate: number;
  activeWorkOrders: number;
  lowStockItems: number;
  upcomingMaintenance: number;
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'complaint' | 'maintenance' | 'supply';
  title: string;
  description: string;
  timestamp: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export function EnhancedFacilityDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    activeWorkOrders: 0,
    lowStockItems: 0,
    upcomingMaintenance: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch booking stats
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .gte('booking_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      const { data: pendingApprovals } = await supabase
        .from('booking_approvals')
        .select('*')
        .eq('approval_status', 'pending');

      // Fetch usage analytics for revenue
      const { data: usageData } = await supabase
        .from('facility_usage_analytics')
        .select('revenue_generated, occupancy_rate')
        .gte('usage_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      // Fetch work orders
      const { data: workOrders } = await supabase
        .from('facility_work_orders')
        .select('*')
        .in('status', ['pending', 'assigned', 'in_progress']);

      // Fetch low stock items
      const { data: lowStock } = await supabase
        .from('facility_supplies')
        .select('*')
        .filter('current_stock', 'lte', 'minimum_stock')
        .eq('is_active', true);

      // Fetch upcoming maintenance
      const { data: maintenance } = await supabase
        .from('maintenance_schedules')
        .select('*')
        .eq('status', 'scheduled')
        .gte('scheduled_date', new Date().toISOString().split('T')[0])
        .lte('scheduled_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      setStats({
        totalBookings: bookings?.length || 0,
        pendingApprovals: pendingApprovals?.length || 0,
        totalRevenue: usageData?.reduce((sum, item) => sum + (item.revenue_generated || 0), 0) || 0,
        occupancyRate: usageData?.length ? usageData.reduce((sum, item) => sum + (item.occupancy_rate || 0), 0) / usageData.length : 0,
        activeWorkOrders: workOrders?.length || 0,
        lowStockItems: lowStock?.length || 0,
        upcomingMaintenance: maintenance?.length || 0
      });

      // Fetch recent activities
      await fetchRecentActivity();

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const activities: RecentActivity[] = [];

      // Recent bookings
      const { data: recentBookings } = await supabase
        .from('bookings')
        .select(`
          id, purpose, created_at,
          facilities!facility_id(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      recentBookings?.forEach(booking => {
        activities.push({
          id: booking.id,
          type: 'booking',
          title: 'New Booking Request',
          description: `New booking request for ${booking.facilities?.name}`,
          timestamp: booking.created_at
        });
      });

      // Recent complaints
      const { data: recentComplaints } = await supabase
        .from('complaints')
        .select('id, title, created_at, priority')
        .eq('category', 'facilities')
        .order('created_at', { ascending: false })
        .limit(3);

      recentComplaints?.forEach(complaint => {
        activities.push({
          id: complaint.id,
          type: 'complaint',
          title: 'Facility Complaint',
          description: complaint.title,
          timestamp: complaint.created_at,
          priority: complaint.priority as any
        });
      });

      // Sort by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivity(activities.slice(0, 10));

    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Facility Management Dashboard</h1>
        <p className="text-muted-foreground">Comprehensive overview of facility operations</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.occupancyRate)}%</div>
            <Progress value={stats.occupancyRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Work Orders</CardTitle>
            <Wrench className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.activeWorkOrders}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <Package className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Maintenance</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.upcomingMaintenance}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from facility operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg border">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <div className="flex items-center space-x-2">
                      {activity.priority && (
                        <Badge variant={getPriorityColor(activity.priority)} className="text-xs">
                          {activity.priority}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {activity.type}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common facility management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-20 flex-col space-y-2">
              <Calendar className="h-6 w-6" />
              <span>Approve Bookings</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Wrench className="h-6 w-6" />
              <span>Create Work Order</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Package className="h-6 w-6" />
              <span>Manage Inventory</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Users className="h-6 w-6" />
              <span>Schedule Maintenance</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}