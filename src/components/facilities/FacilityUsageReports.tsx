import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, Clock, Users, DollarSign, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Facility {
  id: string;
  name: string;
  hourly_rate: number;
}

interface UsageStats {
  total_bookings: number;
  total_hours: number;
  total_revenue: number;
  utilization_rate: number;
  popular_times: Array<{ hour: number; count: number }>;
  monthly_trend: Array<{ month: string; bookings: number }>;
}

interface FacilityUsageReportsProps {
  facilities: Facility[];
}

export function FacilityUsageReports({ facilities }: FacilityUsageReportsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30');
  const [usageStats, setUsageStats] = useState<UsageStats>({
    total_bookings: 0,
    total_hours: 0,
    total_revenue: 0,
    utilization_rate: 0,
    popular_times: [],
    monthly_trend: []
  });

  useEffect(() => {
    fetchUsageStats();
  }, [selectedFacility, selectedPeriod]);

  const fetchUsageStats = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(selectedPeriod));

      let query = supabase
        .from('bookings')
        .select(`
          *,
          facilities!facility_id (
            hourly_rate
          )
        `)
        .eq('status', 'confirmed')
        .gte('booking_date', startDate.toISOString().split('T')[0])
        .lte('booking_date', endDate.toISOString().split('T')[0]);

      if (selectedFacility !== 'all') {
        query = query.eq('facility_id', selectedFacility);
      }

      const { data: bookings, error } = await query;

      if (error) throw error;

      // Calculate statistics
      const totalBookings = bookings?.length || 0;
      const totalHours = bookings?.reduce((sum, booking) => sum + (booking.duration_hours || 0), 0) || 0;
      const totalRevenue = bookings?.reduce((sum, booking) => {
        const rate = booking.facilities?.hourly_rate || 0;
        return sum + (rate * (booking.duration_hours || 0));
      }, 0) || 0;

      // Calculate popular times
      const hourCounts: Record<number, number> = {};
      bookings?.forEach(booking => {
        const hour = new Date(`2000-01-01T${booking.start_time}`).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      const popularTimes = Object.entries(hourCounts)
        .map(([hour, count]) => ({ hour: parseInt(hour), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate monthly trend (simplified)
      const monthCounts: Record<string, number> = {};
      bookings?.forEach(booking => {
        const month = new Date(booking.booking_date).toLocaleDateString('en-US', { 
          month: 'short',
          year: 'numeric'
        });
        monthCounts[month] = (monthCounts[month] || 0) + 1;
      });

      const monthlyTrend = Object.entries(monthCounts)
        .map(([month, bookings]) => ({ month, bookings }))
        .slice(-6);

      // Calculate utilization rate (simplified - assumes 14 hours per day)
      const totalAvailableHours = parseInt(selectedPeriod) * 14 * (selectedFacility === 'all' ? facilities.length : 1);
      const utilizationRate = totalAvailableHours > 0 ? (totalHours / totalAvailableHours) * 100 : 0;

      setUsageStats({
        total_bookings: totalBookings,
        total_hours: totalHours,
        total_revenue: totalRevenue,
        utilization_rate: Math.round(utilizationRate),
        popular_times: popularTimes,
        monthly_trend: monthlyTrend
      });

    } catch (error) {
      console.error('Error fetching usage stats:', error);
      toast({
        title: "Error",
        description: "Failed to load usage statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatHour = (hour: number) => {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading usage reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Usage Reports</h2>
        <div className="flex gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedFacility} onValueChange={setSelectedFacility}>
            <SelectTrigger className="w-48">
              <SelectValue />
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
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                <p className="text-3xl font-bold">{usageStats.total_bookings}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                <p className="text-3xl font-bold">{usageStats.total_hours}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-3xl font-bold">RM {usageStats.total_revenue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Utilization Rate</p>
                <p className="text-3xl font-bold">{usageStats.utilization_rate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Times */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Popular Booking Times
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {usageStats.popular_times.length > 0 ? (
              usageStats.popular_times.map((timeSlot, index) => (
                <div key={timeSlot.hour} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <span className="font-medium">{formatHour(timeSlot.hour)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/20 rounded-full h-2 w-24 overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full" 
                        style={{ 
                          width: `${(timeSlot.count / Math.max(...usageStats.popular_times.map(t => t.count))) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">{timeSlot.count} bookings</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No booking data available for the selected period.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trend */}
      {usageStats.monthly_trend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Booking Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {usageStats.monthly_trend.map((monthData) => (
                <div key={monthData.month} className="flex items-center justify-between">
                  <span className="font-medium">{monthData.month}</span>
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/20 rounded-full h-2 w-32 overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full" 
                        style={{ 
                          width: `${(monthData.bookings / Math.max(...usageStats.monthly_trend.map(m => m.bookings))) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-16 text-right">
                      {monthData.bookings} bookings
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}