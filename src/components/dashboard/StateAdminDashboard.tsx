import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { WeatherWidget } from './WeatherWidget';
import { PrayerTimesWidget } from './PrayerTimesWidget';
import { useState } from 'react';
import { 
  MapPin, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  Building2,
  FileText,
  Calendar,
  Star,
  Home,
  Shield,
  Wrench,
  Activity,
  Zap
} from 'lucide-react';

export function StateAdminDashboard() {
  const { language } = useAuth();
  const [selectedDistrict, setSelectedDistrict] = useState<typeof districtPerformance[0] | null>(null);

  const metrics = [
    {
      title: language === 'en' ? 'Total Districts' : 'Jumlah Daerah',
      value: '15',
      icon: MapPin,
      trend: '+2 this year'
    },
    {
      title: language === 'en' ? 'Active Residents' : 'Penduduk Aktif',
      value: '12,450',
      icon: Users,
      trend: '+5.2% this month'
    },
    {
      title: language === 'en' ? 'System Health' : 'Kesihatan Sistem',
      value: '4/5',
      icon: TrendingUp,
      trend: 'Systems operational'
    }
  ];

  const criticalAlerts = [
    {
      type: 'Role Request',
      message: language === 'en' ? '3 Role upgrade requests pending approval' : '3 permohonan naik taraf peranan menunggu kelulusan',
      priority: 'high'
    },
    {
      type: 'Reports',
      message: language === 'en' ? 'District coordinator reports due' : 'Laporan penyelaras daerah perlu dikemukakan',
      priority: 'medium'
    },
    {
      type: 'Budget',
      message: language === 'en' ? 'Budget approval needed for Pahang Prima North' : 'Kelulusan bajet diperlukan untuk Pahang Prima North',
      priority: 'high'
    }
  ];

  const districtPerformance = [
    { name: 'Pahang Prima North', residents: 2180, satisfaction: 4.2, issues: 12 },
    { name: 'Pahang Prima South', residents: 1850, satisfaction: 4.0, issues: 8 },
    { name: 'Pahang Prima East', residents: 1920, satisfaction: 4.1, issues: 15 },
    { name: 'Pahang Prima West', residents: 1750, satisfaction: 3.8, issues: 18 }
  ];

  // Enhanced data for detailed views
  const getDistrictDetailedData = (districtName: string) => {
    const monthlyData = [
      { month: 'Jan', residents: 2100, satisfaction: 4.0, issues: 15, revenue: 850000 },
      { month: 'Feb', residents: 2120, satisfaction: 4.1, issues: 13, revenue: 880000 },
      { month: 'Mar', residents: 2140, satisfaction: 4.0, issues: 14, revenue: 890000 },
      { month: 'Apr', residents: 2160, satisfaction: 4.2, issues: 12, revenue: 920000 },
      { month: 'May', residents: 2170, satisfaction: 4.3, issues: 10, revenue: 950000 },
      { month: 'Jun', residents: 2180, satisfaction: 4.2, issues: 12, revenue: 940000 }
    ];

    const facilitiesData = [
      { name: 'Community Hall', utilization: 85, bookings: 45 },
      { name: 'Swimming Pool', utilization: 92, bookings: 120 },
      { name: 'Gym', utilization: 78, bookings: 89 },
      { name: 'Tennis Court', utilization: 65, bookings: 32 },
      { name: 'BBQ Area', utilization: 88, bookings: 28 }
    ];

    const issueTypes = [
      { name: 'Maintenance', value: 40, color: '#8884d8' },
      { name: 'Security', value: 25, color: '#82ca9d' },
      { name: 'Utilities', value: 20, color: '#ffc658' },
      { name: 'Noise', value: 10, color: '#ff7300' },
      { name: 'Others', value: 5, color: '#0088fe' }
    ];

    const demographics = [
      { ageGroup: '18-30', count: 580, percentage: 26.6 },
      { ageGroup: '31-45', count: 720, percentage: 33.0 },
      { ageGroup: '46-60', count: 650, percentage: 29.8 },
      { ageGroup: '60+', count: 230, percentage: 10.6 }
    ];

    return { monthlyData, facilitiesData, issueTypes, demographics };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {language === 'en' ? 'State Administration Dashboard' : 'Papan Pemuka Pentadbiran Negeri'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'en' ? 'Strategic overview of all districts and operations' : 'Gambaran strategik semua daerah dan operasi'}
        </p>
      </div>

      {/* State Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
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

      {/* Weather and Prayer Times Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeatherWidget />
        <PrayerTimesWidget />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {language === 'en' ? 'State Administration Status' : 'Status Pentadbiran Negeri'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {language === 'en' 
                  ? '15 districts operational. 12,450 active residents across all regions.' 
                  : '15 daerah beroperasi. 12,450 penduduk aktif di semua wilayah.'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Critical Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            {language === 'en' ? 'Critical Alerts & Approvals' : 'Amaran Kritikal & Kelulusan'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {criticalAlerts.map((alert, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant={alert.priority === 'high' ? 'destructive' : 'secondary'}>
                  {alert.type}
                </Badge>
                <span className="text-sm">{alert.message}</span>
              </div>
              <Button size="sm" variant="outline">
                {language === 'en' ? 'Review' : 'Semak'}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* District Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {language === 'en' ? 'District Performance Overview' : 'Gambaran Prestasi Daerah'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {districtPerformance.map((district, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{district.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {district.residents} residents
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {district.satisfaction}/5
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {district.issues} issues
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Progress value={district.satisfaction * 20} className="w-20" />
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => setSelectedDistrict(district)}>
                        {language === 'en' ? 'View Details' : 'Lihat Butiran'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          {district.name} - {language === 'en' ? 'Comprehensive District Analytics' : 'Analitik Daerah Komprehensif'}
                        </DialogTitle>
                      </DialogHeader>
                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="overview">{language === 'en' ? 'Overview' : 'Gambaran Keseluruhan'}</TabsTrigger>
                          <TabsTrigger value="trends">{language === 'en' ? 'Trends' : 'Trend'}</TabsTrigger>
                          <TabsTrigger value="facilities">{language === 'en' ? 'Facilities' : 'Kemudahan'}</TabsTrigger>
                          <TabsTrigger value="demographics">{language === 'en' ? 'Demographics' : 'Demografi'}</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="overview" className="space-y-6">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  {language === 'en' ? 'Total Residents' : 'Jumlah Penduduk'}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold">{district.residents}</div>
                                <p className="text-xs text-muted-foreground">+2.3% from last month</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2">
                                  <Star className="h-4 w-4" />
                                  {language === 'en' ? 'Satisfaction' : 'Kepuasan'}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold">{district.satisfaction}/5</div>
                                <Progress value={district.satisfaction * 20} className="mt-2" />
                              </CardContent>
                            </Card>
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4" />
                                  {language === 'en' ? 'Active Issues' : 'Isu Aktif'}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold text-destructive">{district.issues}</div>
                                <p className="text-xs text-muted-foreground">-15% from last month</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2">
                                  <DollarSign className="h-4 w-4" />
                                  {language === 'en' ? 'Monthly Revenue' : 'Pendapatan Bulanan'}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold">RM 940K</div>
                                <p className="text-xs text-muted-foreground">+8.2% from last month</p>
                              </CardContent>
                            </Card>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <Activity className="h-5 w-5" />
                                  {language === 'en' ? 'Issue Distribution' : 'Taburan Isu'}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ResponsiveContainer width="100%" height={200}>
                                  <PieChart>
                                    <Pie
                                      data={getDistrictDetailedData(district.name).issueTypes}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={40}
                                      outerRadius={80}
                                      dataKey="value"
                                    >
                                      {getDistrictDetailedData(district.name).issueTypes.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                      ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                  </PieChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <Home className="h-5 w-5" />
                                  {language === 'en' ? 'Quick Stats' : 'Statistik Pantas'}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    {language === 'en' ? 'Security Incidents' : 'Insiden Keselamatan'}
                                  </span>
                                  <Badge variant="secondary">3 this month</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm flex items-center gap-2">
                                    <Wrench className="h-4 w-4" />
                                    {language === 'en' ? 'Maintenance Requests' : 'Permintaan Penyelenggaraan'}
                                  </span>
                                  <Badge variant="secondary">18 pending</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm flex items-center gap-2">
                                    <Zap className="h-4 w-4" />
                                    {language === 'en' ? 'Utility Efficiency' : 'Kecekapan Utiliti'}
                                  </span>
                                  <Badge variant="secondary">92%</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    {language === 'en' ? 'Occupancy Rate' : 'Kadar Penghunian'}
                                  </span>
                                  <Badge variant="secondary">96.5%</Badge>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </TabsContent>

                        <TabsContent value="trends" className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">{language === 'en' ? 'Resident Growth Trend' : 'Trend Pertumbuhan Penduduk'}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                  <LineChart data={getDistrictDetailedData(district.name).monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="residents" stroke="#8884d8" strokeWidth={2} />
                                  </LineChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">{language === 'en' ? 'Satisfaction Score Trend' : 'Trend Skor Kepuasan'}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                  <AreaChart data={getDistrictDetailedData(district.name).monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis domain={[3.5, 4.5]} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="satisfaction" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">{language === 'en' ? 'Issues Resolution Trend' : 'Trend Penyelesaian Isu'}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                  <BarChart data={getDistrictDetailedData(district.name).monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="issues" fill="#ffc658" />
                                  </BarChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">{language === 'en' ? 'Revenue Trend' : 'Trend Pendapatan'}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                  <LineChart data={getDistrictDetailedData(district.name).monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [`RM ${(Number(value) / 1000)}K`, 'Revenue']} />
                                    <Line type="monotone" dataKey="revenue" stroke="#ff7300" strokeWidth={2} />
                                  </LineChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>
                          </div>
                        </TabsContent>

                        <TabsContent value="facilities" className="space-y-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">{language === 'en' ? 'Facility Utilization Analysis' : 'Analisis Penggunaan Kemudahan'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={getDistrictDetailedData(district.name).facilitiesData} layout="horizontal">
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis type="number" domain={[0, 100]} />
                                  <YAxis dataKey="name" type="category" width={100} />
                                  <Tooltip formatter={(value) => [`${value}%`, 'Utilization']} />
                                  <Bar dataKey="utilization" fill="#8884d8" />
                                </BarChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {getDistrictDetailedData(district.name).facilitiesData.map((facility, index) => (
                              <Card key={index}>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm">{facility.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span>{language === 'en' ? 'Utilization' : 'Penggunaan'}</span>
                                      <span className="font-medium">{facility.utilization}%</span>
                                    </div>
                                    <Progress value={facility.utilization} />
                                    <div className="flex justify-between text-sm">
                                      <span>{language === 'en' ? 'Monthly Bookings' : 'Tempahan Bulanan'}</span>
                                      <span className="font-medium">{facility.bookings}</span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="demographics" className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">{language === 'en' ? 'Age Distribution' : 'Taburan Umur'}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                  <PieChart>
                                    <Pie
                                      data={getDistrictDetailedData(district.name).demographics}
                                      cx="50%"
                                      cy="50%"
                                      labelLine={false}
                                      label={({ ageGroup, percentage }) => `${ageGroup}: ${percentage}%`}
                                      outerRadius={80}
                                      fill="#8884d8"
                                      dataKey="count"
                                    >
                                      {getDistrictDetailedData(district.name).demographics.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                                      ))}
                                    </Pie>
                                    <Tooltip />
                                  </PieChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">{language === 'en' ? 'Demographic Breakdown' : 'Pecahan Demografi'}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  {getDistrictDetailedData(district.name).demographics.map((demo, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                      <div>
                                        <span className="font-medium">{demo.ageGroup} {language === 'en' ? 'years' : 'tahun'}</span>
                                        <div className="text-sm text-muted-foreground">{demo.count} residents</div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-lg font-bold">{demo.percentage}%</div>
                                        <Progress value={demo.percentage} className="w-16 h-2" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">{language === 'en' ? 'Population Insights' : 'Wawasan Populasi'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted rounded-lg">
                                  <div className="text-2xl font-bold text-primary">67%</div>
                                  <div className="text-sm text-muted-foreground">{language === 'en' ? 'Working Age (18-60)' : 'Umur Bekerja (18-60)'}</div>
                                </div>
                                <div className="text-center p-4 bg-muted rounded-lg">
                                  <div className="text-2xl font-bold text-primary">1.2:1</div>
                                  <div className="text-sm text-muted-foreground">{language === 'en' ? 'Adult to Senior Ratio' : 'Nisbah Dewasa kepada Warga Emas'}</div>
                                </div>
                                <div className="text-center p-4 bg-muted rounded-lg">
                                  <div className="text-2xl font-bold text-primary">42</div>
                                  <div className="text-sm text-muted-foreground">{language === 'en' ? 'Average Age' : 'Purata Umur'}</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'en' ? 'Quick Actions' : 'Tindakan Pantas'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="flex items-center gap-2 h-12">
              <FileText className="h-4 w-4" />
              {language === 'en' ? 'Review Reports' : 'Semak Laporan'}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <Users className="h-4 w-4" />
              {language === 'en' ? 'Manage Districts' : 'Urus Daerah'}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <Calendar className="h-4 w-4" />
              {language === 'en' ? 'Schedule Meeting' : 'Jadualkan Mesyuarat'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}