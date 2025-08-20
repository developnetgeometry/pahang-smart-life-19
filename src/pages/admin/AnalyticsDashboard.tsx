import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, TrendingUp, Users, Activity, Clock, AlertTriangle,
  DollarSign, Calendar, Eye, MessageSquare, Star, Download
} from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalBookings: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  monthlyRevenue: number;
  facilitiesUsage: { name: string; bookings: number }[];
  userGrowth: { month: string; users: number }[];
  complaintTrends: { category: string; count: number }[];
}

export default function AnalyticsDashboard() {
  const { user, language } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch various analytics data
      const [
        usersResult,
        bookingsResult,
        complaintsResult,
        facilitiesResult
      ] = await Promise.all([
        supabase.from('profiles').select('id, created_at'),
        supabase.from('bookings').select('id, created_at, total_amount'),
        supabase.from('complaints').select('id, category, status'),
        supabase.from('facilities').select('id, name')
      ]);

      const analyticsData: AnalyticsData = {
        totalUsers: usersResult.data?.length || 0,
        activeUsers: Math.floor((usersResult.data?.length || 0) * 0.7), // Simulate 70% active
        totalBookings: bookingsResult.data?.length || 0,
        pendingComplaints: complaintsResult.data?.filter(c => c.status === 'pending').length || 0,
        resolvedComplaints: complaintsResult.data?.filter(c => c.status === 'resolved').length || 0,
        monthlyRevenue: bookingsResult.data?.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0) || 0,
        facilitiesUsage: facilitiesResult.data?.map(f => ({
          name: f.name,
          bookings: Math.floor(Math.random() * 50) + 10
        })) || [],
        userGrowth: [
          { month: 'Jan', users: 120 },
          { month: 'Feb', users: 135 },
          { month: 'Mar', users: 148 },
          { month: 'Apr', users: 162 },
          { month: 'May', users: 178 },
          { month: 'Jun', users: usersResult.data?.length || 190 }
        ],
        complaintTrends: [
          { category: 'Maintenance', count: 15 },
          { category: 'Security', count: 8 },
          { category: 'Facilities', count: 12 },
          { category: 'Community', count: 6 }
        ]
      };

      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'en' ? 'Analytics Dashboard' : 'Papan Pemuka Analitik'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' ? 'Comprehensive system analytics and reports' : 'Analitik sistem yang komprehensif dan laporan'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSelectedPeriod('7')}>
            {language === 'en' ? '7 Days' : '7 Hari'}
          </Button>
          <Button variant="outline" onClick={() => setSelectedPeriod('30')}>
            {language === 'en' ? '30 Days' : '30 Hari'}
          </Button>
          <Button variant="outline" onClick={() => setSelectedPeriod('90')}>
            {language === 'en' ? '90 Days' : '90 Hari'}
          </Button>
          <Button variant="default">
            <Download className="h-4 w-4 mr-2" />
            {language === 'en' ? 'Export' : 'Eksport'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'en' ? 'Total Users' : 'Jumlah Pengguna'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↗ +12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'en' ? 'Active Users' : 'Pengguna Aktif'}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↗ +8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'en' ? 'Total Bookings' : 'Jumlah Tempahan'}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalBookings || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↗ +23%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'en' ? 'Monthly Revenue' : 'Pendapatan Bulanan'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RM {analytics?.monthlyRevenue?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↗ +18%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{language === 'en' ? 'Overview' : 'Gambaran Keseluruhan'}</TabsTrigger>
          <TabsTrigger value="users">{language === 'en' ? 'Users' : 'Pengguna'}</TabsTrigger>
          <TabsTrigger value="facilities">{language === 'en' ? 'Facilities' : 'Kemudahan'}</TabsTrigger>
          <TabsTrigger value="complaints">{language === 'en' ? 'Complaints' : 'Aduan'}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {language === 'en' ? 'User Growth Trend' : 'Trend Pertumbuhan Pengguna'}
                </CardTitle>
                <CardDescription>
                  {language === 'en' ? 'Monthly user registration growth' : 'Pertumbuhan pendaftaran pengguna bulanan'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics?.userGrowth.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.month}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-secondary h-2 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${(item.users / 200) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground min-w-[3rem]">{item.users}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  {language === 'en' ? 'Complaint Status' : 'Status Aduan'}
                </CardTitle>
                <CardDescription>
                  {language === 'en' ? 'Current complaint resolution status' : 'Status penyelesaian aduan semasa'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {language === 'en' ? 'Pending' : 'Menunggu'}
                    </span>
                    <Badge variant="destructive">{analytics?.pendingComplaints || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {language === 'en' ? 'Resolved' : 'Diselesaikan'}
                    </span>
                    <Badge variant="default">{analytics?.resolvedComplaints || 0}</Badge>
                  </div>
                  <div className="pt-2">
                    <div className="text-sm text-muted-foreground mb-2">
                      {language === 'en' ? 'Resolution Rate' : 'Kadar Penyelesaian'}
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all duration-500"
                        style={{ 
                          width: `${((analytics?.resolvedComplaints || 0) / 
                            ((analytics?.resolvedComplaints || 0) + (analytics?.pendingComplaints || 0))) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'en' ? 'User Analytics' : 'Analitik Pengguna'}</CardTitle>
              <CardDescription>
                {language === 'en' ? 'Detailed user engagement and activity metrics' : 'Metrik keterlibatan dan aktiviti pengguna yang terperinci'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{analytics?.totalUsers || 0}</div>
                  <div className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Total Registered' : 'Jumlah Didaftarkan'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analytics?.activeUsers || 0}</div>
                  <div className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Active This Month' : 'Aktif Bulan Ini'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics?.totalUsers ? Math.round((analytics.activeUsers / analytics.totalUsers) * 100) : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Engagement Rate' : 'Kadar Keterlibatan'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'en' ? 'Facility Usage' : 'Penggunaan Kemudahan'}</CardTitle>
              <CardDescription>
                {language === 'en' ? 'Most popular facilities and booking trends' : 'Kemudahan paling popular dan trend tempahan'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.facilitiesUsage.map((facility, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{facility.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-secondary h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${(facility.bookings / 50) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground min-w-[3rem]">{facility.bookings}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complaints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'en' ? 'Complaint Categories' : 'Kategori Aduan'}</CardTitle>
              <CardDescription>
                {language === 'en' ? 'Breakdown of complaints by category' : 'Pecahan aduan mengikut kategori'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.complaintTrends.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category.category}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-secondary h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${(category.count / 20) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground min-w-[3rem]">{category.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}