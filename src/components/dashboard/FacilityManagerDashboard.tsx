import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Users, AlertTriangle, Building, Wrench, Eye, Shield, TrendingUp, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { WeatherWidget } from './WeatherWidget';
import { PrayerTimesWidget } from './PrayerTimesWidget';

interface DashboardStats {
  totalFacilities: number;
  activeFacilities: number;
  todayBookings: number;
  pendingMaintenance: number;
  monthlyRevenue: number;
  utilizationRate: number;
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'maintenance' | 'complaint' | 'security';
  title: string;
  description: string;
  time: string;
  priority?: 'high' | 'medium' | 'low';
}

interface FacilityStatus {
  id: string;
  name: string;
  status: 'available' | 'occupied' | 'maintenance';
  currentBooking?: string;
  nextMaintenance?: string;
  utilizationToday: number;
}

export const FacilityManagerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalFacilities: 0,
    activeFacilities: 0,
    todayBookings: 0,
    pendingMaintenance: 0,
    monthlyRevenue: 0,
    utilizationRate: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [facilityStatus, setFacilityStatus] = useState<FacilityStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch facilities data
      const { data: facilities } = await supabase
        .from('facilities')
        .select('*');

      // Fetch today's bookings
      const today = new Date().toISOString().split('T')[0];
      const { data: todayBookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_date', today);

      // Fetch maintenance requests
      const { data: maintenance } = await supabase
        .from('maintenance_requests')
        .select('*')
        .in('status', ['pending', 'in_progress']);

      // Fetch recent complaints
      const { data: complaints } = await supabase
        .from('complaints')
        .select('*')
        .eq('category', 'facilities')
        .order('created_at', { ascending: false })
        .limit(5);

      // Calculate stats
      const totalFacilities = facilities?.length || 0;
      const activeFacilities = facilities?.filter(f => f.is_available)?.length || 0;
      const pendingMaintenance = maintenance?.length || 0;
      
      // Calculate monthly revenue (simplified)
      const monthlyRevenue = todayBookings?.reduce((sum, booking) => 
        sum + (booking.total_amount || 0), 0) * 30 || 0;

      const utilizationRate = totalFacilities > 0 
        ? Math.round((todayBookings?.length || 0) / totalFacilities * 100) 
        : 0;

      setStats({
        totalFacilities,
        activeFacilities,
        todayBookings: todayBookings?.length || 0,
        pendingMaintenance,
        monthlyRevenue,
        utilizationRate
      });

      // Set recent activities
      const activities: RecentActivity[] = [
        ...(complaints?.map(c => ({
          id: c.id,
          type: 'complaint' as const,
          title: 'Facility Complaint',
          description: c.title,
          time: new Date(c.created_at).toLocaleTimeString(),
          priority: c.priority as any
        })) || []),
        ...(maintenance?.slice(0, 3).map(m => ({
          id: m.id,
          type: 'maintenance' as const,
          title: 'Maintenance Request',
          description: m.description || 'Maintenance needed',
          time: new Date(m.created_at).toLocaleTimeString(),
          priority: m.priority as any
        })) || [])
      ].slice(0, 5);

      setRecentActivities(activities);

      // Set facility status
      const facilityStatuses: FacilityStatus[] = facilities?.map(f => ({
        id: f.id,
        name: f.name,
        status: f.is_available ? 'available' : 'maintenance',
        utilizationToday: Math.floor(Math.random() * 80) + 20 // Mock data
      })) || [];

      setFacilityStatus(facilityStatuses);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return Calendar;
      case 'maintenance': return Wrench;
      case 'complaint': return AlertTriangle;
      case 'security': return Shield;
      default: return Clock;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Facility Manager Dashboard</h1>
        <p className="text-muted-foreground">Manage facilities, bookings, and maintenance operations</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Facilities</p>
                <p className="text-2xl font-bold">{stats.totalFacilities}</p>
              </div>
              <Building className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Facilities</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeFacilities}</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Bookings</p>
                <p className="text-2xl font-bold text-blue-600">{stats.todayBookings}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Maintenance</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingMaintenance}</p>
              </div>
              <Wrench className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-600">RM {stats.monthlyRevenue.toFixed(0)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Utilization Rate</p>
                <p className="text-2xl font-bold text-purple-600">{stats.utilizationRate}%</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weather and Prayer Times Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeatherWidget />
        <PrayerTimesWidget />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="facilities">Facilities</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activities
                </CardTitle>
                <CardDescription>Latest facility management activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                        <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate">{activity.title}</p>
                            {activity.priority && (
                              <Badge variant={getPriorityColor(activity.priority) as any} className="text-xs">
                                {activity.priority}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-muted-foreground py-4">No recent activities</p>
                )}
              </CardContent>
            </Card>

            {/* Facility Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Facility Status
                </CardTitle>
                <CardDescription>Current status of all facilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {facilityStatus.length > 0 ? (
                  facilityStatus.map((facility) => (
                    <div key={facility.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{facility.name}</p>
                          <Badge 
                            variant={facility.status === 'available' ? 'default' : 
                                   facility.status === 'occupied' ? 'secondary' : 'destructive'} 
                            className="text-xs"
                          >
                            {facility.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Today: {facility.utilizationToday}%</p>
                        <Progress value={facility.utilizationToday} className="w-20 h-2" />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">No facilities found</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="facilities" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Facility Management</CardTitle>
                <CardDescription>Manage all community facilities</CardDescription>
              </div>
              <Button asChild>
                <Link to="/facilities">Manage Facilities</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Access comprehensive facility management tools including configuration, 
                availability management, and performance analytics.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Booking Management</CardTitle>
                <CardDescription>Oversee facility bookings and reservations</CardDescription>
              </div>
              <Button asChild>
                <Link to="/my-bookings">View Bookings</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Monitor all facility bookings, approve reservations, manage conflicts, 
                and track utilization rates across all facilities.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Maintenance Operations</CardTitle>
                <CardDescription>Track and manage facility maintenance</CardDescription>
              </div>
              <Button asChild>
                <Link to="/admin/maintenance">Maintenance Dashboard</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Schedule preventive maintenance, track repair requests, manage service providers, 
                and ensure optimal facility conditions.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complaints" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Facility Complaint Center
                </CardTitle>
                <CardDescription>Monitor and manage facility-related complaints</CardDescription>
              </div>
              <Button asChild>
                <Link to="/facility-complaint-center">View All Complaints</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Access the dedicated complaint center to view, track, and manage all 
                facility-related complaints including maintenance issues, booking problems, 
                and amenity concerns.
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">Pending</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Complaints awaiting action</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Wrench className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">In Progress</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Currently being addressed</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Resolved</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Successfully completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Button asChild variant="outline" className="h-20">
          <Link to="/facilities" className="flex flex-col items-center gap-2">
            <Building className="h-6 w-6" />
            <span className="text-sm">Manage Facilities</span>
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="h-20">
          <Link to="/cctv-live-feed" className="flex flex-col items-center gap-2">
            <Eye className="h-6 w-6" />
            <span className="text-sm">CCTV Monitoring</span>
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="h-20">
          <Link to="/facility-complaint-center" className="flex flex-col items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            <span className="text-sm">Facility Complaints</span>
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="h-20">
          <Link to="/admin/maintenance" className="flex flex-col items-center gap-2">
            <Wrench className="h-6 w-6" />
            <span className="text-sm">Maintenance</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};