import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  Wrench, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface ReportData {
  workOrderStats: {
    total: number;
    completed: number;
    pending: number;
    in_progress: number;
  };
  assetCondition: Array<{
    condition: string;
    count: number;
    color: string;
  }>;
  monthlyCompletion: Array<{
    month: string;
    completed: number;
    created: number;
  }>;
  typeDistribution: Array<{
    type: string;
    count: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function MaintenanceReports() {
  const { user, language } = useAuth();
  const { toast } = useToast();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('overview');
  const [chartColors, setChartColors] = useState<string[]>([]);

  const fetchConfigurationData = async () => {
    try {
      // Fetch chart colors
      const { data: colors, error: colorsError } = await supabase
        .from('chart_colors')
        .select('hex_color')
        .eq('is_active', true)
        .eq('category', 'chart')
        .order('sort_order');

      if (colorsError) throw colorsError;
      setChartColors(colors?.map(c => c.hex_color) || ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']);

    } catch (error) {
      console.error('Error fetching configuration data:', error);
      // Fallback to default colors
      setChartColors(['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']);
    }
  };

  useEffect(() => {
    fetchConfigurationData();
    fetchReportData();
  }, [user, dateRange]);

  useEffect(() => {
    fetchReportData();
  }, [user, dateRange]);

  const fetchReportData = async () => {
    if (!user) return;

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(dateRange));

      // Fetch work orders statistics
      const { data: workOrders, error: workOrderError } = await supabase
        .from('work_orders')
        .select('status, work_order_type, created_at, updated_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (workOrderError) throw workOrderError;

      // Fetch asset condition data
      const { data: assets, error: assetError } = await supabase
        .from('assets')
        .select('condition_status, asset_type')
        .eq('is_active', true);

      if (assetError) throw assetError;

      // Process work order statistics
      const workOrderStats = {
        total: workOrders?.length || 0,
        completed: workOrders?.filter(wo => wo.status === 'completed').length || 0,
        pending: workOrders?.filter(wo => wo.status === 'pending').length || 0,
        in_progress: workOrders?.filter(wo => wo.status === 'in_progress').length || 0
      };

      // Process asset condition data
      const conditionCounts = assets?.reduce((acc: any, asset) => {
        acc[asset.condition_status] = (acc[asset.condition_status] || 0) + 1;
        return acc;
      }, {}) || {};

      const assetCondition = Object.entries(conditionCounts).map(([condition, count], index) => ({
        condition,
        count: count as number,
        color: COLORS[index % COLORS.length]
      }));

      // Process monthly completion data
      const monthlyData: { [key: string]: { completed: number; created: number } } = {};
      const months = [];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().substring(0, 7);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        months.push(monthName);
        monthlyData[monthKey] = { completed: 0, created: 0 };
      }

      workOrders?.forEach(wo => {
        const monthKey = wo.created_at.substring(0, 7);
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].created++;
          if (wo.status === 'completed') {
            monthlyData[monthKey].completed++;
          }
        }
      });

      const monthlyCompletion = months.map((month, index) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - index));
        const monthKey = date.toISOString().substring(0, 7);
        return {
          month,
          completed: monthlyData[monthKey]?.completed || 0,
          created: monthlyData[monthKey]?.created || 0
        };
      });

      // Process type distribution
      const typeCounts = workOrders?.reduce((acc: any, wo) => {
        acc[wo.work_order_type] = (acc[wo.work_order_type] || 0) + 1;
        return acc;
      }, {}) || {};

      const typeDistribution = Object.entries(typeCounts).map(([type, count]) => ({
        type,
        count: count as number
      }));

      setReportData({
        workOrderStats,
        assetCondition,
        monthlyCompletion,
        typeDistribution
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: language === 'ms' ? 'Ralat' : 'Error',
        description: language === 'ms' ? 'Gagal memuat data laporan' : 'Failed to load report data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    if (!reportData) return;

    try {
      const reportContent = {
        generatedAt: new Date().toISOString(),
        dateRange: `${dateRange} days`,
        workOrderStats: reportData.workOrderStats,
        assetCondition: reportData.assetCondition,
        monthlyCompletion: reportData.monthlyCompletion,
        typeDistribution: reportData.typeDistribution
      };

      const blob = new Blob([JSON.stringify(reportContent, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `maintenance-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: language === 'ms' ? 'Berjaya' : 'Success',
        description: language === 'ms' ? 'Laporan telah dimuat turun' : 'Report has been downloaded'
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: language === 'ms' ? 'Ralat' : 'Error',
        description: language === 'ms' ? 'Gagal mengeksport laporan' : 'Failed to export report',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground">
            {language === 'ms' ? 'Tiada data laporan tersedia' : 'No report data available'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            {language === 'ms' ? 'Laporan Penyelenggaraan' : 'Maintenance Reports'}
          </h1>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {language === 'ms' ? 'Eksport' : 'Export'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            title: language === 'ms' ? 'Jumlah Pesanan Kerja' : 'Total Work Orders',
            value: reportData.workOrderStats.total,
            icon: Wrench,
            color: 'text-primary'
          },
          {
            title: language === 'ms' ? 'Selesai' : 'Completed',
            value: reportData.workOrderStats.completed,
            icon: CheckCircle,
            color: 'text-success'
          },
          {
            title: language === 'ms' ? 'Sedang Berjalan' : 'In Progress',
            value: reportData.workOrderStats.in_progress,
            icon: Clock,
            color: 'text-warning'
          },
          {
            title: language === 'ms' ? 'Kadar Penyelesaian' : 'Completion Rate',
            value: reportData.workOrderStats.total > 0 
              ? `${Math.round((reportData.workOrderStats.completed / reportData.workOrderStats.total) * 100)}%`
              : '0%',
            icon: TrendingUp,
            color: 'text-primary'
          }
        ].map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                </div>
                <metric.icon className={`h-8 w-8 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Completion Trend */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'ms' ? 'Trend Penyelesaian Bulanan' : 'Monthly Completion Trend'}
            </CardTitle>
            <CardDescription>
              {language === 'ms' 
                ? 'Perbandingan pesanan kerja yang dibuat dan diselesaikan'
                : 'Comparison of work orders created vs completed'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData.monthlyCompletion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="created" stroke="#8884d8" name="Created" />
                <Line type="monotone" dataKey="completed" stroke="#82ca9d" name="Completed" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Asset Condition Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'ms' ? 'Keadaan Aset' : 'Asset Condition'}
            </CardTitle>
            <CardDescription>
              {language === 'ms' 
                ? 'Taburan keadaan aset komuniti'
                : 'Distribution of community asset conditions'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.assetCondition}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ condition, count }) => `${condition}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {reportData.assetCondition.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Work Order Types */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'ms' ? 'Jenis Pesanan Kerja' : 'Work Order Types'}
            </CardTitle>
            <CardDescription>
              {language === 'ms' 
                ? 'Taburan jenis pesanan kerja'
                : 'Distribution of work order types'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.typeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Work Order Status */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'ms' ? 'Status Pesanan Kerja' : 'Work Order Status'}
            </CardTitle>
            <CardDescription>
              {language === 'ms' 
                ? 'Taburan status pesanan kerja semasa'
                : 'Current work order status distribution'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Completed', value: reportData.workOrderStats.completed, fill: '#00C49F' },
                    { name: 'In Progress', value: reportData.workOrderStats.in_progress, fill: '#FFBB28' },
                    { name: 'Pending', value: reportData.workOrderStats.pending, fill: '#FF8042' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'Completed', value: reportData.workOrderStats.completed, fill: '#00C49F' },
                    { name: 'In Progress', value: reportData.workOrderStats.in_progress, fill: '#FFBB28' },
                    { name: 'Pending', value: reportData.workOrderStats.pending, fill: '#FF8042' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}