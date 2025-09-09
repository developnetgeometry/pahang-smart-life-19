import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WeatherWidget } from './WeatherWidget';
import { PrayerTimesWidget } from './PrayerTimesWidget';
import { 
  MapPin, 
  Users, 
  TrendingUp, 
  Clock,
  CheckCircle,
  DollarSign,
  AlertTriangle,
  FileText,
  Star,
  Activity,
  Settings,
  BarChart3
} from 'lucide-react';

export function StateServiceManagerDashboard() {
  const { language } = useAuth();

  const serviceMetrics = [
    {
      title: language === 'en' ? 'Service Regions' : 'Wilayah Perkhidmatan',
      value: '4',
      icon: MapPin,
      trend: 'All regions active'
    },
    {
      title: language === 'en' ? 'Active Providers' : 'Penyedia Aktif',
      value: '67',
      icon: Users,
      trend: '+3 new this month'
    },
    {
      title: language === 'en' ? 'Service Quality' : 'Kualiti Perkhidmatan',
      value: '4.2/5',
      icon: Star,
      trend: 'Average rating',
      status: 84
    },
    {
      title: language === 'en' ? 'Monthly Volume' : 'Volum Bulanan',
      value: '1,245',
      icon: Activity,
      trend: 'Service requests'
    }
  ];

  const regionPerformance = [
    {
      region: 'Pahang Prima North',
      providers: 18,
      requests: 320,
      avgResolution: '1.5 days',
      satisfaction: 4.3,
      efficiency: 92
    },
    {
      region: 'Pahang Prima South',
      providers: 15,
      requests: 285,
      avgResolution: '2.1 days',
      satisfaction: 4.1,
      efficiency: 88
    },
    {
      region: 'Pahang Prima East',
      providers: 16,
      requests: 305,
      avgResolution: '1.8 days',
      satisfaction: 4.2,
      efficiency: 90
    },
    {
      region: 'Pahang Prima West',
      providers: 18,
      requests: 335,
      avgResolution: '1.6 days',
      satisfaction: 4.4,
      efficiency: 94
    }
  ];

  const serviceTypes = [
    {
      type: 'Cleaning Services',
      providers: 25,
      monthlyRequests: 450,
      avgRating: 4.3,
      trend: '+8%'
    },
    {
      type: 'Maintenance Services',
      providers: 18,
      monthlyRequests: 320,
      avgRating: 4.1,
      trend: '+12%'
    },
    {
      type: 'Delivery Services',
      providers: 12,
      monthlyRequests: 280,
      avgRating: 4.0,
      trend: '+5%'
    },
    {
      type: 'Installation Services',
      providers: 12,
      monthlyRequests: 195,
      avgRating: 4.2,
      trend: '+15%'
    }
  ];

  const performanceIssues = [
    {
      issue: language === 'en' ? 'Response time exceeding target in South region' : 'Masa tindak balas melebihi sasaran di rantau Selatan',
      severity: 'medium',
      affectedProviders: 3,
      impact: 'Service quality',
      action: 'Performance review scheduled'
    },
    {
      issue: language === 'en' ? 'Provider availability low during peak hours' : 'Ketersediaan penyedia rendah semasa waktu puncak',
      severity: 'high',
      affectedProviders: 8,
      impact: 'Customer satisfaction',
      action: 'Staffing optimization needed'
    },
    {
      issue: language === 'en' ? 'Contract renewal pending for cleaning services' : 'Pembaharuan kontrak menunggu untuk perkhidmatan pembersihan',
      severity: 'low',
      affectedProviders: 5,
      impact: 'Service continuity',
      action: 'Contract review in progress'
    }
  ];

  const actionItems = [
    {
      task: language === 'en' ? 'Q1 Service provider performance reviews' : 'Ulasan prestasi penyedia perkhidmatan Q1',
      dueDate: '2024-03-15',
      priority: 'high',
      status: 'in_progress'
    },
    {
      task: language === 'en' ? 'Update service standards documentation' : 'Kemaskini dokumentasi standard perkhidmatan',
      dueDate: '2024-02-28',
      priority: 'medium',
      status: 'pending'
    },  
    {
      task: language === 'en' ? 'Schedule regional coordination meetings' : 'Jadualkan mesyuarat koordinasi serantau',
      dueDate: '2024-02-25',
      priority: 'medium',
      status: 'scheduled'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {language === 'en' ? 'State Service Manager Dashboard' : 'Papan Pemuka Pengurus Perkhidmatan Negeri'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'en' ? 'State-wide service delivery oversight and optimization' : 'Pengawasan dan pengoptimuman penyampaian perkhidmatan seluruh negeri'}
        </p>
      </div>

      {/* Service Delivery Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {serviceMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.trend}</p>
              {metric.status && (
                <Progress value={metric.status} className="mt-2" />
              )}
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
                {language === 'en' ? 'Service Operations Status' : 'Status Operasi Perkhidmatan'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {language === 'en' 
                  ? 'All service regions operational. 67 active providers across 4 regions.' 
                  : 'Semua wilayah perkhidmatan beroperasi. 67 penyedia aktif merentasi 4 wilayah.'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Performance Issues Alert */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            {language === 'en' ? 'Performance Issues & Alerts' : 'Isu Prestasi & Amaran'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {performanceIssues.map((issue, index) => (
            <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={getSeverityColor(issue.severity) as any}>
                    {issue.severity}
                  </Badge>
                  <span className="text-sm font-medium">{issue.issue}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground mt-2">
                  <span>Affected: {issue.affectedProviders} providers</span>
                  <span>Impact: {issue.impact}</span>
                  <span>Action: {issue.action}</span>
                </div>
              </div>
              <Button size="sm" variant="outline">
                {language === 'en' ? 'Address' : 'Tangani'}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {language === 'en' ? 'Regional Performance' : 'Prestasi Serantau'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {regionPerformance.map((region, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{region.region}</h4>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{region.satisfaction}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span>{region.providers} providers</span>
                    <span>{region.requests} requests</span>
                    <span>Avg: {region.avgResolution}</span>
                    <span>Efficiency: {region.efficiency}%</span>
                  </div>
                  <Progress value={region.efficiency} className="mt-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Service Type Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {language === 'en' ? 'Service Type Performance' : 'Prestasi Jenis Perkhidmatan'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {serviceTypes.map((service, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{service.type}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span>{service.providers} providers</span>
                      <span>{service.monthlyRequests} requests/month</span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {service.avgRating}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{service.trend}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">Growth</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            {language === 'en' ? 'Action Items' : 'Item Tindakan'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {actionItems.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg space-y-2 sm:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getPriorityColor(item.priority) as any}>
                      {item.priority}
                    </Badge>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{item.task}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    Due: {item.dueDate}
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  {language === 'en' ? 'Update' : 'Kemaskini'}
                </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="flex items-center gap-2 h-12">
              <FileText className="h-4 w-4" />
              {language === 'en' ? 'Generate Report' : 'Jana Laporan'}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <Users className="h-4 w-4" />
              {language === 'en' ? 'Provider Review' : 'Ulasan Penyedia'}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <Settings className="h-4 w-4" />
              {language === 'en' ? 'Service Standards' : 'Standard Perkhidmatan'}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <Activity className="h-4 w-4" />
              {language === 'en' ? 'Performance Analytics' : 'Analitik Prestasi'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}