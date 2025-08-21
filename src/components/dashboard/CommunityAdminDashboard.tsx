import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WeatherWidget } from './WeatherWidget';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  DollarSign, 
  AlertTriangle, 
  Star,
  Building,
  Activity,
  Megaphone,
  FileText,
  Calendar,
  MessageSquare,
  UserPlus,
  CheckCircle,
  XCircle
} from 'lucide-react';

export function CommunityAdminDashboard() {
  const { language, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalResidents: 0,
    pendingRegistrations: 0,
    activeComplaints: 0,
    completedComplaints: 0,
    totalBookings: 0,
    upcomingEvents: 0,
    recentAnnouncements: 0,
    facilityUsage: [] as any[]
  });
  const [pendingRoleRequests, setPendingRoleRequests] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get user's district for filtering
        const { data: profileData } = await supabase
          .from('profiles')
          .select('district_id')
          .eq('id', user?.id)
          .single();

        const districtId = profileData?.district_id;

        // Fetch all metrics in parallel
        const [
          { data: residents, count: residentsCount },
          { data: activeComplaints, count: activeComplaintsCount },
          { data: completedComplaints, count: completedComplaintsCount },
          { data: bookings, count: bookingsCount },
          { data: events, count: eventsCount },
          { data: announcements, count: announcementsCount },
          { data: facilities },
          { data: roleRequests, count: roleRequestsCount }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact' }).eq('district_id', districtId),
          supabase.from('complaints').select('*', { count: 'exact' }).in('status', ['pending', 'in_progress']).eq('district_id', districtId),
          supabase.from('complaints').select('*', { count: 'exact' }).eq('status', 'resolved').eq('district_id', districtId),
          supabase.from('bookings').select('*', { count: 'exact' }).gte('booking_date', new Date().toISOString().split('T')[0]),
          supabase.from('events').select('*', { count: 'exact' }).eq('district_id', districtId).gte('start_date', new Date().toISOString().split('T')[0]),
          supabase.from('announcements').select('*', { count: 'exact' }).eq('district_id', districtId).eq('is_published', true),
          supabase.from('facilities').select('*').eq('district_id', districtId),
          supabase.from('role_change_requests').select(`
            *,
            profiles!role_change_requests_requester_id_fkey(full_name, email)
          `, { count: 'exact' }).eq('status', 'pending').eq('district_id', districtId)
        ]);

        setDashboardData({
          totalResidents: residentsCount || 0,
          pendingRegistrations: roleRequestsCount || 0,
          activeComplaints: activeComplaintsCount || 0,
          completedComplaints: completedComplaintsCount || 0,
          totalBookings: bookingsCount || 0,
          upcomingEvents: eventsCount || 0,
          recentAnnouncements: announcementsCount || 0,
          facilityUsage: facilities || []
        });

        setPendingRoleRequests(roleRequests || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  const communityMetrics = [
    {
      title: language === 'en' ? 'Total Residents' : 'Jumlah Penduduk',
      value: loading ? '...' : dashboardData.totalResidents.toString(),
      icon: Users,
      trend: loading ? '...' : `${dashboardData.pendingRegistrations} ${language === 'en' ? 'pending approvals' : 'menunggu kelulusan'}`
    },
    {
      title: language === 'en' ? 'Active Issues' : 'Isu Aktif',
      value: loading ? '...' : dashboardData.activeComplaints.toString(),
      icon: AlertTriangle,
      trend: loading ? '...' : `${dashboardData.completedComplaints} ${language === 'en' ? 'resolved' : 'diselesaikan'}`
    },
    {
      title: language === 'en' ? 'Bookings' : 'Tempahan',
      value: loading ? '...' : dashboardData.totalBookings.toString(),
      icon: Building,
      trend: loading ? '...' : `${language === 'en' ? 'upcoming bookings' : 'tempahan akan datang'}`
    },
    {
      title: language === 'en' ? 'Events' : 'Acara',
      value: loading ? '...' : dashboardData.upcomingEvents.toString(),
      icon: Calendar,
      trend: loading ? '...' : `${language === 'en' ? 'upcoming events' : 'acara akan datang'}`
    }
  ];

  const handleRoleRequestAction = async (requestId: string, action: 'approved' | 'rejected') => {
    try {
      await supabase
        .from('role_change_requests')
        .update({ 
          status: action,
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId);

      // Refresh the data
      setPendingRoleRequests(prev => 
        prev.filter(req => req.id !== requestId)
      );
      
      setDashboardData(prev => ({
        ...prev,
        pendingRegistrations: prev.pendingRegistrations - 1
      }));

    } catch (error) {
      console.error('Error updating role request:', error);
    }
  };

  const recentActivities = [
    {
      type: 'Maintenance',
      message: language === 'en' ? '3 new maintenance requests submitted' : '3 permohonan penyelenggaraan baharu dikemukakan',
      time: '2 hours ago',
      icon: FileText
    },
    {
      type: 'Event',
      message: language === 'en' ? 'Community event planning: CNY celebration' : 'Perancangan acara komuniti: sambutan CNY',
      time: '4 hours ago',
      icon: Calendar
    },
    {
      type: 'Bookings',
      message: language === 'en' ? '12 facility bookings this week' : '12 tempahan kemudahan minggu ini',
      time: '1 day ago',
      icon: Building
    },
    {
      type: 'Residents',
      message: language === 'en' ? '2 new resident registrations' : '2 pendaftaran penduduk baharu',
      time: '2 days ago',
      icon: Users
    }
  ];

  const facilityUsage = [
    { name: 'Community Hall', bookings: 28, utilization: 85 },
    { name: 'Swimming Pool', bookings: 45, utilization: 72 },
    { name: 'Gym', bookings: 32, utilization: 68 },
    { name: 'Playground', bookings: 15, utilization: 45 }
  ];

  const upcomingEvents = [
    {
      title: language === 'en' ? 'Chinese New Year Celebration' : 'Sambutan Tahun Baru Cina',
      date: 'Feb 12, 2024',
      attendees: 89,
      status: 'confirmed'
    },
    {
      title: language === 'en' ? 'Community Clean-up Day' : 'Hari Gotong-royong Komuniti',
      date: 'Feb 18, 2024',
      attendees: 45,
      status: 'planning'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {language === 'en' ? 'Community Admin Dashboard' : 'Papan Pemuka Admin Komuniti'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'en' ? 'Community management and resident services' : 'Pengurusan komuniti dan perkhidmatan penduduk'}
        </p>
      </div>

      {/* Community Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {communityMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weather Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <WeatherWidget />
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {language === 'en' ? 'Today\'s Summary' : 'Ringkasan Hari Ini'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {language === 'en' ? 'System Status' : 'Status Sistem'}
                  </span>
                  <Badge variant="default" className="bg-green-500">
                    {language === 'en' ? 'Operational' : 'Beroperasi'}
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>{language === 'en' ? 'Pending Registrations:' : 'Pendaftaran Menunggu:'}</span>
                    <span className="font-medium">{loading ? '...' : dashboardData.pendingRegistrations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'en' ? 'Active Complaints:' : 'Aduan Aktif:'}</span>
                    <span className="font-medium">{loading ? '...' : dashboardData.activeComplaints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'en' ? 'Published Announcements:' : 'Pengumuman Diterbitkan:'}</span>
                    <span className="font-medium">{loading ? '...' : dashboardData.recentAnnouncements}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {language === 'en' ? 'Recent Activities' : 'Aktiviti Terkini'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <activity.icon className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {activity.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                  <p className="text-sm">{activity.message}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Facility Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {language === 'en' ? 'Facility Usage' : 'Penggunaan Kemudahan'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {facilityUsage.map((facility, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{facility.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {facility.bookings} {language === 'en' ? 'bookings' : 'tempahan'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={facility.utilization} className="flex-1" />
                  <span className="text-xs text-muted-foreground w-12">
                    {facility.utilization}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {language === 'en' ? 'Upcoming Community Events' : 'Acara Komuniti Akan Datang'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{event.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span>{event.date}</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {event.attendees} {language === 'en' ? 'registered' : 'berdaftar'}
                    </span>
                    <Badge variant={event.status === 'confirmed' ? 'default' : 'secondary'}>
                      {event.status}
                    </Badge>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  {language === 'en' ? 'Manage' : 'Urus'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Role Requests */}
      {pendingRoleRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              {language === 'en' ? 'Pending Role Requests' : 'Permohonan Peranan Menunggu'}
            </CardTitle>
            <CardDescription>
              {language === 'en' 
                ? 'Review and approve role change requests from residents'
                : 'Semak dan luluskan permohonan tukar peranan daripada penduduk'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRoleRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">
                        {request.profiles?.full_name || request.profiles?.email}
                      </h4>
                      <Badge variant="outline">
                        {request.current_user_role}
                      </Badge>
                      <span className="text-sm text-muted-foreground">→</span>
                      <Badge variant="secondary">
                        {request.requested_user_role}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Reason:' : 'Sebab:'} {request.justification || 'No reason provided'}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRoleRequestAction(request.id, 'approved')}
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {language === 'en' ? 'Approve' : 'Lulus'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRoleRequestAction(request.id, 'rejected')}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      {language === 'en' ? 'Reject' : 'Tolak'}
                    </Button>
                  </div>
                </div>
              ))}
              
              {pendingRoleRequests.length > 3 && (
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm">
                    {language === 'en' ? `View all ${pendingRoleRequests.length} requests` : `Lihat semua ${pendingRoleRequests.length} permohonan`}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'en' ? 'Quick Actions' : 'Tindakan Pantas'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="flex items-center gap-2 h-12">
              <Megaphone className="h-4 w-4" />
              {language === 'en' ? 'Create Announcement' : 'Cipta Pengumuman'}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <AlertTriangle className="h-4 w-4" />
              {language === 'en' ? 'Manage Complaints' : 'Urus Aduan'}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <MessageSquare className="h-4 w-4" />
              {language === 'en' ? 'View Reports' : 'Lihat Laporan'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}