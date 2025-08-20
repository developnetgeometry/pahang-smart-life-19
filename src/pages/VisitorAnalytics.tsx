import { useState, useEffect } from 'react';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, TrendingUp, Users, Clock, BarChart3, PieChart, Filter } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface VisitorStats {
  totalVisitors: number;
  todayVisitors: number;
  weeklyVisitors: number;
  monthlyVisitors: number;
  averageDaily: number;
  peakHour: string;
  statusBreakdown: {
    pending: number;
    approved: number;
    checked_in: number;
    checked_out: number;
    denied: number;
  };
  weeklyData: Array<{
    date: string;
    count: number;
  }>;
  popularPurposes: Array<{
    purpose: string;
    count: number;
  }>;
}

export default function VisitorAnalytics() {
  const { language } = useEnhancedAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));

      // Fetch visitors data
      const { data: visitors, error } = await supabase
        .from('visitors')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // For now, we'll calculate analytics from visitors table only
      // since visitor_logs table might not be available yet

      // Calculate statistics
      const today = new Date().toISOString().split('T')[0];
      const thisWeekStart = new Date();
      thisWeekStart.setDate(thisWeekStart.getDate() - 7);
      const thisMonthStart = new Date();
      thisMonthStart.setDate(thisMonthStart.getDate() - 30);

      const todayVisitors = visitors.filter(v => 
        new Date(v.created_at).toISOString().split('T')[0] === today
      ).length;

      const weeklyVisitors = visitors.filter(v => 
        new Date(v.created_at) >= thisWeekStart
      ).length;

      const monthlyVisitors = visitors.filter(v => 
        new Date(v.created_at) >= thisMonthStart
      ).length;

      // Status breakdown
      const statusBreakdown = visitors.reduce((acc, visitor) => {
        acc[visitor.status as keyof typeof acc] = (acc[visitor.status as keyof typeof acc] || 0) + 1;
        return acc;
      }, {
        pending: 0,
        approved: 0,
        checked_in: 0,
        checked_out: 0,
        denied: 0
      });

      // Weekly data for chart
      const weeklyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const count = visitors.filter(v => 
          new Date(v.created_at).toISOString().split('T')[0] === dateStr
        ).length;
        weeklyData.push({
          date: dateStr,
          count
        });
      }

      // Popular purposes
      const purposeCount: Record<string, number> = {};
      visitors.forEach(visitor => {
        purposeCount[visitor.purpose] = (purposeCount[visitor.purpose] || 0) + 1;
      });
      
      const popularPurposes = Object.entries(purposeCount)
        .map(([purpose, count]) => ({ purpose, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate peak hour from check-in times
      const checkInTimes = visitors.filter(v => v.check_in_time);
      const hourCount: Record<number, number> = {};
      checkInTimes.forEach(visitor => {
        const hour = new Date(visitor.check_in_time!).getHours();
        hourCount[hour] = (hourCount[hour] || 0) + 1;
      });
      
      const peakHour = Object.entries(hourCount)
        .sort(([,a], [,b]) => b - a)[0]?.[0];

      setStats({
        totalVisitors: visitors.length,
        todayVisitors,
        weeklyVisitors,
        monthlyVisitors,
        averageDaily: Math.round(visitors.length / parseInt(timeRange)),
        peakHour: peakHour ? `${peakHour}:00` : 'N/A',
        statusBreakdown,
        weeklyData,
        popularPurposes
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch visitor analytics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-500';
      case 'approved': return 'bg-green-500';
      case 'checked_in': return 'bg-emerald-500';
      case 'checked_out': return 'bg-gray-500';
      case 'denied': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    if (language === 'en') {
      switch (status) {
        case 'pending': return 'Pending';
        case 'approved': return 'Approved';
        case 'checked_in': return 'Checked In';
        case 'checked_out': return 'Checked Out';
        case 'denied': return 'Denied';
        default: return status;
      }
    } else {
      switch (status) {
        case 'pending': return 'Menunggu';
        case 'approved': return 'Diluluskan';
        case 'checked_in': return 'Daftar Masuk';
        case 'checked_out': return 'Daftar Keluar';
        case 'denied': return 'Ditolak';
        default: return status;
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'en' ? 'Visitor Analytics' : 'Analitik Pelawat'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Comprehensive visitor data and insights'
              : 'Data pelawat yang komprehensif dan pandangan mendalam'
            }
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4" />
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">
                {language === 'en' ? 'Last 7 days' : '7 hari lepas'}
              </SelectItem>
              <SelectItem value="30">
                {language === 'en' ? 'Last 30 days' : '30 hari lepas'}
              </SelectItem>
              <SelectItem value="90">
                {language === 'en' ? 'Last 90 days' : '90 hari lepas'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Total Visitors' : 'Jumlah Pelawat'}
                </p>
                <p className="text-2xl font-bold">{stats?.totalVisitors}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Today' : 'Hari Ini'}
                </p>
                <p className="text-2xl font-bold">{stats?.todayVisitors}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Daily Average' : 'Purata Harian'}
                </p>
                <p className="text-2xl font-bold">{stats?.averageDaily}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Peak Hour' : 'Jam Puncak'}
                </p>
                <p className="text-2xl font-bold">{stats?.peakHour}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              {language === 'en' ? 'Status Breakdown' : 'Pecahan Status'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats?.statusBreakdown || {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getStatusColor(status)} text-white w-3 h-3 p-0`} />
                    <span className="text-sm font-medium">{getStatusText(status)}</span>
                  </div>
                  <span className="text-sm font-bold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              {language === 'en' ? 'Weekly Trend' : 'Trend Mingguan'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.weeklyData.map((day, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-sm w-20">
                    {new Date(day.date).toLocaleDateString(language === 'en' ? 'en-US' : 'ms-MY', { 
                      weekday: 'short' 
                    })}
                  </span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-primary h-2 rounded-full" 
                      style={{ 
                        width: `${Math.max(5, (day.count / Math.max(...(stats?.weeklyData.map(d => d.count) || [1]))) * 100)}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8">{day.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Purposes */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'en' ? 'Popular Visit Purposes' : 'Tujuan Lawatan Popular'}
          </CardTitle>
          <CardDescription>
            {language === 'en' 
              ? 'Most common reasons for visits'
              : 'Sebab paling biasa untuk lawatan'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats?.popularPurposes.map((purpose, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">{purpose.purpose}</p>
                  <p className="text-xs text-muted-foreground">
                    #{index + 1} {language === 'en' ? 'most common' : 'paling biasa'}
                  </p>
                </div>
                <Badge variant="secondary">{purpose.count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'en' ? 'Export Data' : 'Eksport Data'}
          </CardTitle>
          <CardDescription>
            {language === 'en' 
              ? 'Download visitor data for further analysis'
              : 'Muat turun data pelawat untuk analisis lanjut'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button variant="outline">
              {language === 'en' ? 'Export to CSV' : 'Eksport ke CSV'}
            </Button>
            <Button variant="outline">
              {language === 'en' ? 'Generate Report' : 'Jana Laporan'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}