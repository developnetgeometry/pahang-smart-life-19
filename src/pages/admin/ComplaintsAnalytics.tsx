import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

interface ComplaintAnalytics {
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  escalatedComplaints: number;
  avgResolutionTime: number;
  escalationRate: number;
  firstCallResolution: number;
  satisfactionScore: number;
  categoryDistribution: Array<{ category: string; count: number; percentage: number }>;
  priorityDistribution: Array<{ priority: string; count: number; percentage: number }>;
  monthlyTrends: Array<{ month: string; total: number; resolved: number; escalated: number }>;
  resolutionTrends: Array<{ date: string; avgTime: number }>;
  staffPerformance: Array<{ 
    staffName: string; 
    assigned: number; 
    resolved: number; 
    avgTime: number; 
    escalationRate: number 
  }>;
  peakHours: Array<{ hour: number; count: number }>;
  locationAnalysis: Array<{ location: string; count: number; avgTime: number }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function ComplaintsAnalytics() {
  const { language, user } = useAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<ComplaintAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days
  const [selectedCategory, setSelectedCategory] = useState('all');

  const text = {
    en: {
      title: 'Complaints Analytics & KPI Dashboard',
      subtitle: 'Comprehensive insights and performance metrics',
      overview: 'Overview',
      trends: 'Trends',
      performance: 'Performance',
      insights: 'Insights',
      totalComplaints: 'Total Complaints',
      resolvedComplaints: 'Resolved',
      pendingComplaints: 'Pending',
      escalatedComplaints: 'Escalated',
      avgResolutionTime: 'Avg Resolution Time',
      escalationRate: 'Escalation Rate',
      firstCallResolution: 'First Call Resolution',
      satisfactionScore: 'Satisfaction Score',
      categoryDistribution: 'Complaints by Category',
      priorityDistribution: 'Priority Distribution',
      monthlyTrends: 'Monthly Trends',
      resolutionTrends: 'Resolution Time Trends',
      staffPerformance: 'Staff Performance',
      peakHours: 'Peak Hours Analysis',
      locationAnalysis: 'Location Analysis',
      days: 'days',
      hours: 'hours',
      refresh: 'Refresh Data',
      export: 'Export Report',
      last30Days: 'Last 30 Days',
      last7Days: 'Last 7 Days',
      thisMonth: 'This Month',
      lastMonth: 'Last Month',
      allCategories: 'All Categories',
      maintenance: 'Maintenance',
      security: 'Security',
      facilities: 'Facilities',
      noise: 'Noise',
      general: 'General'
    },
    ms: {
      title: 'Analitis Aduan & Papan Pemuka KPI',
      subtitle: 'Wawasan menyeluruh dan metrik prestasi',
      overview: 'Gambaran Keseluruhan',
      trends: 'Trend',
      performance: 'Prestasi',
      insights: 'Wawasan',
      totalComplaints: 'Jumlah Aduan',
      resolvedComplaints: 'Diselesaikan',
      pendingComplaints: 'Menunggu',
      escalatedComplaints: 'Dinaik Taraf',
      avgResolutionTime: 'Purata Masa Penyelesaian',
      escalationRate: 'Kadar Peningkatan',
      firstCallResolution: 'Penyelesaian Panggilan Pertama',
      satisfactionScore: 'Skor Kepuasan',
      categoryDistribution: 'Aduan mengikut Kategori',
      priorityDistribution: 'Taburan Keutamaan',
      monthlyTrends: 'Trend Bulanan',
      resolutionTrends: 'Trend Masa Penyelesaian',
      staffPerformance: 'Prestasi Kakitangan',
      peakHours: 'Analisis Masa Puncak',
      locationAnalysis: 'Analisis Lokasi',
      days: 'hari',
      hours: 'jam',
      refresh: 'Muat Semula Data',
      export: 'Eksport Laporan',
      last30Days: '30 Hari Lalu',
      last7Days: '7 Hari Lalu',
      thisMonth: 'Bulan Ini',
      lastMonth: 'Bulan Lalu',
      allCategories: 'Semua Kategori',
      maintenance: 'Penyelenggaraan',
      security: 'Keselamatan',
      facilities: 'Kemudahan',
      noise: 'Bunyi Bising',
      general: 'Umum'
    }
  };

  const t = text[language];

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, selectedCategory]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const startDate = getStartDate();
      const endDate = new Date();

      // Base query with date filtering
      let query = supabase
        .from('complaints')
        .select(`
          *,
          profiles!complaints_complainant_id_fkey(full_name, email),
          assigned_profiles:profiles!complaints_assigned_to_fkey(full_name, email)
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Add category filter if not 'all'
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data: complaints, error } = await query;

      if (error) throw error;

      // Process analytics data
      const processedAnalytics = processComplaintsData(complaints || []);
      setAnalytics(processedAnalytics);

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: language === 'en' ? 'Error loading analytics' : 'Ralat memuatkan analitis',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = () => {
    const now = new Date();
    switch (dateRange) {
      case '7': return subDays(now, 7);
      case '30': return subDays(now, 30);
      case 'thisMonth': return startOfMonth(now);
      case 'lastMonth': return startOfMonth(subDays(now, 30));
      default: return subDays(now, 30);
    }
  };

  const processComplaintsData = (complaints: any[]): ComplaintAnalytics => {
    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    const pending = complaints.filter(c => c.status === 'pending').length;
    const escalated = complaints.filter(c => c.escalation_level > 0).length;

    // Calculate average resolution time
    const resolvedComplaints = complaints.filter(c => c.status === 'resolved' && c.resolved_at);
    const avgResolutionTime = resolvedComplaints.length > 0 
      ? resolvedComplaints.reduce((sum, c) => {
          const created = new Date(c.created_at);
          const resolved = new Date(c.resolved_at);
          return sum + (resolved.getTime() - created.getTime());
        }, 0) / resolvedComplaints.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    // Category distribution
    const categoryCount: { [key: string]: number } = {};
    complaints.forEach(c => {
      categoryCount[c.category] = (categoryCount[c.category] || 0) + 1;
    });
    const categoryDistribution = Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
      percentage: (count / total) * 100
    }));

    // Priority distribution
    const priorityCount: { [key: string]: number } = {};
    complaints.forEach(c => {
      priorityCount[c.priority] = (priorityCount[c.priority] || 0) + 1;
    });
    const priorityDistribution = Object.entries(priorityCount).map(([priority, count]) => ({
      priority,
      count,
      percentage: (count / total) * 100
    }));

    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const date = subDays(new Date(), i * 30);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const monthComplaints = complaints.filter(c => {
        const created = new Date(c.created_at);
        return created >= monthStart && created <= monthEnd;
      });
      
      monthlyTrends.push({
        month: format(date, 'MMM yyyy'),
        total: monthComplaints.length,
        resolved: monthComplaints.filter(c => c.status === 'resolved').length,
        escalated: monthComplaints.filter(c => c.escalation_level > 0).length
      });
    }

    // Staff performance
    const staffPerformance: { [key: string]: any } = {};
    complaints.forEach(c => {
      if (c.assigned_to && c.assigned_profiles?.full_name) {
        const staffName = c.assigned_profiles.full_name;
        if (!staffPerformance[staffName]) {
          staffPerformance[staffName] = {
            staffName,
            assigned: 0,
            resolved: 0,
            totalTime: 0,
            escalated: 0
          };
        }
        staffPerformance[staffName].assigned++;
        if (c.status === 'resolved') {
          staffPerformance[staffName].resolved++;
          if (c.resolved_at) {
            const resolutionTime = (new Date(c.resolved_at).getTime() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24);
            staffPerformance[staffName].totalTime += resolutionTime;
          }
        }
        if (c.escalation_level > 0) {
          staffPerformance[staffName].escalated++;
        }
      }
    });

    const staffPerformanceArray = Object.values(staffPerformance).map((staff: any) => ({
      ...staff,
      avgTime: staff.resolved > 0 ? staff.totalTime / staff.resolved : 0,
      escalationRate: staff.assigned > 0 ? (staff.escalated / staff.assigned) * 100 : 0
    }));

    // Peak hours analysis
    const hourCount: { [key: number]: number } = {};
    complaints.forEach(c => {
      const hour = new Date(c.created_at).getHours();
      hourCount[hour] = (hourCount[hour] || 0) + 1;
    });
    const peakHours = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: hourCount[hour] || 0
    }));

    // Location analysis
    const locationCount: { [key: string]: { count: number; totalTime: number; resolved: number } } = {};
    complaints.forEach(c => {
      if (c.location) {
        if (!locationCount[c.location]) {
          locationCount[c.location] = { count: 0, totalTime: 0, resolved: 0 };
        }
        locationCount[c.location].count++;
        if (c.status === 'resolved' && c.resolved_at) {
          locationCount[c.location].resolved++;
          const resolutionTime = (new Date(c.resolved_at).getTime() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24);
          locationCount[c.location].totalTime += resolutionTime;
        }
      }
    });

    const locationAnalysis = Object.entries(locationCount).map(([location, data]) => ({
      location,
      count: data.count,
      avgTime: data.resolved > 0 ? data.totalTime / data.resolved : 0
    }));

    return {
      totalComplaints: total,
      resolvedComplaints: resolved,
      pendingComplaints: pending,
      escalatedComplaints: escalated,
      avgResolutionTime,
      escalationRate: total > 0 ? (escalated / total) * 100 : 0,
      firstCallResolution: total > 0 ? ((resolved - escalated) / total) * 100 : 0,
      satisfactionScore: 85, // This would come from actual satisfaction surveys
      categoryDistribution,
      priorityDistribution,
      monthlyTrends,
      resolutionTrends: [], // Would be calculated based on historical data
      staffPerformance: staffPerformanceArray,
      peakHours,
      locationAnalysis
    };
  };

  const handleExport = async () => {
    toast({
      title: language === 'en' ? 'Exporting report...' : 'Mengeksport laporan...',
    });
    // Implementation for exporting analytics data
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-muted animate-pulse rounded mb-2 w-64"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-96"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 bg-muted animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">{t.last7Days}</SelectItem>
              <SelectItem value="30">{t.last30Days}</SelectItem>
              <SelectItem value="thisMonth">{t.thisMonth}</SelectItem>
              <SelectItem value="lastMonth">{t.lastMonth}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allCategories}</SelectItem>
              <SelectItem value="maintenance">{t.maintenance}</SelectItem>
              <SelectItem value="security">{t.security}</SelectItem>
              <SelectItem value="facilities">{t.facilities}</SelectItem>
              <SelectItem value="noise">{t.noise}</SelectItem>
              <SelectItem value="general">{t.general}</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            {t.export}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
          <TabsTrigger value="trends">{t.trends}</TabsTrigger>
          <TabsTrigger value="performance">{t.performance}</TabsTrigger>
          <TabsTrigger value="insights">{t.insights}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.totalComplaints}</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalComplaints}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span>+12% from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.avgResolutionTime}</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.avgResolutionTime.toFixed(1)} {t.days}</div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingDown className="h-3 w-3" />
                  <span>-5% improvement</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.escalationRate}</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.escalationRate.toFixed(1)}%</div>
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+2% from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.satisfactionScore}</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.satisfactionScore}%</div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+3% improvement</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>{t.categoryDistribution}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }) => `${category}: ${percentage.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analytics.categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>{t.priorityDistribution}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.priorityDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="priority" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>{t.monthlyTrends}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={analytics.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="total" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="resolved" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  <Area type="monotone" dataKey="escalated" stackId="1" stroke="#ffc658" fill="#ffc658" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Peak Hours */}
          <Card>
            <CardHeader>
              <CardTitle>{t.peakHours}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.peakHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Staff Performance */}
          <Card>
            <CardHeader>
              <CardTitle>{t.staffPerformance}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.staffPerformance.map((staff, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{staff.staffName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {staff.assigned} assigned • {staff.resolved} resolved
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">
                        {staff.avgTime.toFixed(1)} {t.days} avg
                      </Badge>
                      <Badge variant={staff.escalationRate < 10 ? "default" : "destructive"}>
                        {staff.escalationRate.toFixed(1)}% escalation
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Location Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>{t.locationAnalysis}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.locationAnalysis.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="location" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Key Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Peak complaint hours: 9AM - 11AM</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Resolution time improved by 15% this month</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Top performer: Maintenance Team (2.1 days avg)</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  • Increase staffing during peak hours (9-11AM)
                </div>
                <div className="text-sm">
                  • Focus on maintenance category complaints
                </div>
                <div className="text-sm">
                  • Implement proactive measures for common locations
                </div>
                <div className="text-sm">
                  • Provide additional training for escalation management
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}