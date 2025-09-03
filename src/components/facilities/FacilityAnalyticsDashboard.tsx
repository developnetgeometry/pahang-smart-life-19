import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, DollarSign, Users, Clock, Download, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface UsageAnalytics {
  facility_name: string;
  total_bookings: number;
  total_hours: number;
  total_revenue: number;
  avg_occupancy: number;
  peak_hours: string[];
}

interface RevenueData {
  date: string;
  revenue: number;
  bookings: number;
}

interface FacilityUsage {
  name: string;
  bookings: number;
  revenue: number;
  hours: number;
}

interface PeakHoursData {
  hour: string;
  bookings: number;
}

export function FacilityAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days
  const [selectedFacility, setSelectedFacility] = useState('all');
  
  const [analytics, setAnalytics] = useState<UsageAnalytics[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [facilityUsage, setFacilityUsage] = useState<FacilityUsage[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHoursData[]>([]);
  const [facilities, setFacilities] = useState<Array<{id: string, name: string}>>([]);
  
  const [totalStats, setTotalStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalHours: 0,
    avgOccupancy: 0,
    growthRate: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, selectedFacility]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      
      // Fetch facilities
      const { data: facilitiesData } = await supabase
        .from('facilities')
        .select('id, name');
      
      // Build facility filter
      let facilityFilter = '';
      if (selectedFacility !== 'all') {
        facilityFilter = selectedFacility;
      }
      
      // Fetch usage analytics
      let analyticsQuery = supabase
        .from('facility_usage_analytics')
        .select(`
          *,
          facilities(name)
        `)
        .gte('usage_date', startDate.toISOString().split('T')[0]);
        
      if (facilityFilter) {
        analyticsQuery = analyticsQuery.eq('facility_id', facilityFilter);
      }
      
      const { data: analyticsData } = await analyticsQuery;
      
      // Fetch bookings for additional metrics
      let bookingsQuery = supabase
        .from('bookings')
        .select(`
          *,
          facilities(name)
        `)
        .gte('booking_date', startDate.toISOString().split('T')[0])
        .in('status', ['confirmed', 'completed']);
        
      if (facilityFilter) {
        bookingsQuery = bookingsQuery.eq('facility_id', facilityFilter);
      }
      
      const { data: bookingsData } = await bookingsQuery;
      
      // Process data for charts and analytics
      processAnalyticsData(analyticsData || [], bookingsData || []);
      setFacilities(facilitiesData || []);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (analyticsData: any[], bookingsData: any[]) => {
    // Process facility usage summary
    const facilityMap = new Map<string, any>();
    
    // Initialize with analytics data
    analyticsData.forEach(item => {
      const facilityName = item.facilities?.name || 'Unknown';
      if (!facilityMap.has(facilityName)) {
        facilityMap.set(facilityName, {
          name: facilityName,
          total_bookings: 0,
          total_hours: 0,
          total_revenue: 0,
          occupancy_rates: []
        });
      }
      
      const facility = facilityMap.get(facilityName)!;
      facility.total_hours += item.usage_hours || 0;
      facility.total_revenue += item.revenue_generated || 0;
      if (item.occupancy_rate) facility.occupancy_rates.push(item.occupancy_rate);
    });
    
    // Add booking counts
    bookingsData.forEach(booking => {
      const facilityName = booking.facilities?.name || 'Unknown';
      if (facilityMap.has(facilityName)) {
        facilityMap.get(facilityName)!.total_bookings++;
      }
    });
    
    // Convert to arrays and calculate averages
    const processedAnalytics: UsageAnalytics[] = Array.from(facilityMap.values()).map(facility => ({
      facility_name: facility.name,
      total_bookings: facility.total_bookings,
      total_hours: facility.total_hours,
      total_revenue: facility.total_revenue,
      avg_occupancy: facility.occupancy_rates.length > 0 
        ? facility.occupancy_rates.reduce((sum: number, rate: number) => sum + rate, 0) / facility.occupancy_rates.length 
        : 0,
      peak_hours: [] // Will be calculated from bookings
    }));
    
    // Process daily revenue data
    const dailyRevenue = new Map<string, {revenue: number, bookings: number}>();
    
    analyticsData.forEach(item => {
      const date = item.usage_date;
      if (!dailyRevenue.has(date)) {
        dailyRevenue.set(date, { revenue: 0, bookings: 0 });
      }
      dailyRevenue.get(date)!.revenue += item.revenue_generated || 0;
    });
    
    bookingsData.forEach(booking => {
      const date = booking.booking_date;
      if (!dailyRevenue.has(date)) {
        dailyRevenue.set(date, { revenue: 0, bookings: 0 });
      }
      dailyRevenue.get(date)!.bookings++;
    });
    
    const revenueChartData: RevenueData[] = Array.from(dailyRevenue.entries())
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString(),
        revenue: data.revenue,
        bookings: data.bookings
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14); // Last 14 days for chart
    
    // Process peak hours
    const hourCounts = new Map<string, number>();
    bookingsData.forEach(booking => {
      const hour = booking.start_time?.split(':')[0] + ':00' || '00:00';
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });
    
    const peakHoursData: PeakHoursData[] = Array.from(hourCounts.entries())
      .map(([hour, bookings]) => ({ hour, bookings }))
      .sort((a, b) => a.hour.localeCompare(b.hour));
    
    // Calculate totals
    const totals = {
      totalRevenue: processedAnalytics.reduce((sum, item) => sum + item.total_revenue, 0),
      totalBookings: processedAnalytics.reduce((sum, item) => sum + item.total_bookings, 0),
      totalHours: processedAnalytics.reduce((sum, item) => sum + item.total_hours, 0),
      avgOccupancy: processedAnalytics.length > 0 
        ? processedAnalytics.reduce((sum, item) => sum + item.avg_occupancy, 0) / processedAnalytics.length 
        : 0,
      growthRate: 0 // Would need historical data to calculate
    };
    
    setAnalytics(processedAnalytics);
    setRevenueData(revenueChartData);
    setFacilityUsage(processedAnalytics.map(item => ({
      name: item.facility_name,
      bookings: item.total_bookings,
      revenue: item.total_revenue,
      hours: item.total_hours
    })));
    setPeakHours(peakHoursData);
    setTotalStats(totals);
  };

  const exportAnalytics = () => {
    // Create CSV export functionality
    const csvData = analytics.map(item => ({
      Facility: item.facility_name,
      'Total Bookings': item.total_bookings,
      'Total Hours': item.total_hours,
      'Total Revenue': item.total_revenue,
      'Average Occupancy': `${Math.round(item.avg_occupancy)}%`
    }));
    
    const headers = Object.keys(csvData[0] || {}).join(',');
    const rows = csvData.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `facility-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Analytics exported successfully');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR'
    }).format(amount);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Facility Analytics</h2>
          <p className="text-muted-foreground">Detailed usage and revenue analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedFacility} onValueChange={setSelectedFacility}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Facilities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Facilities</SelectItem>
              {facilities.map(facility => (
                <SelectItem key={facility.id} value={facility.id}>
                  {facility.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="365">1 year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportAnalytics} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalStats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Last {dateRange} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">Confirmed bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalStats.totalHours)}</div>
            <p className="text-xs text-muted-foreground">Total hours booked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Occupancy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalStats.avgOccupancy)}%</div>
            <p className="text-xs text-muted-foreground">Average utilization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Facilities</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.length}</div>
            <p className="text-xs text-muted-foreground">With activity</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="w-full">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="usage">Facility Usage</TabsTrigger>
          <TabsTrigger value="peak">Peak Hours</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Revenue & Bookings</CardTitle>
              <CardDescription>Revenue and booking trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(value as number) : value,
                      name === 'revenue' ? 'Revenue' : 'Bookings'
                    ]}
                  />
                  <Bar yAxisId="right" dataKey="bookings" fill="#8884d8" opacity={0.6} />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#00C49F" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Facility Usage Comparison</CardTitle>
              <CardDescription>Bookings and revenue by facility</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={facilityUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(value as number) : value,
                      name === 'revenue' ? 'Revenue' : name === 'bookings' ? 'Bookings' : 'Hours'
                    ]}
                  />
                  <Bar yAxisId="left" dataKey="bookings" fill="#0088FE" />
                  <Bar yAxisId="right" dataKey="revenue" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="peak" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Peak Usage Hours</CardTitle>
              <CardDescription>Booking distribution throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={peakHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'Bookings']} />
                  <Bar dataKey="bookings" fill="#FFBB28" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
                <CardDescription>Revenue share by facility</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={facilityUsage}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {facilityUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Facility Performance</CardTitle>
                <CardDescription>Detailed metrics per facility</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.map((facility, index) => (
                    <div key={facility.facility_name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{facility.facility_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {facility.total_bookings} bookings • {Math.round(facility.total_hours)} hours
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{formatCurrency(facility.total_revenue)}</div>
                        <Badge 
                          variant="outline" 
                          className={facility.avg_occupancy > 70 ? 'border-green-500 text-green-700' : 
                                   facility.avg_occupancy > 40 ? 'border-yellow-500 text-yellow-700' : 
                                   'border-red-500 text-red-700'}
                        >
                          {Math.round(facility.avg_occupancy)}% occupancy
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}