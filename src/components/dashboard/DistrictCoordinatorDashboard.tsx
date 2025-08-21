import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WeatherWidget } from './WeatherWidget';
import { 
  Building2,
  Users, 
  DollarSign, 
  AlertTriangle, 
  Star,
  TrendingUp,
  FileText,
  Settings,
  Calendar,
  Activity
} from 'lucide-react';

export function DistrictCoordinatorDashboard() {
  const { language } = useAuth();

  const districtMetrics = [
    {
      title: language === 'en' ? 'Communities' : 'Komuniti',
      value: '8',
      icon: Building2,
      trend: 'All active'
    },
    {
      title: language === 'en' ? 'Total Residents' : 'Jumlah Penduduk',
      value: '2,180',
      icon: Users,
      trend: '+12 this month'
    },
    {
      title: language === 'en' ? 'Monthly Collection' : 'Kutipan Bulanan',
      value: 'RM 420K',
      icon: DollarSign,
      trend: '95% collection rate'
    },
    {
      title: language === 'en' ? 'Satisfaction Score' : 'Skor Kepuasan',
      value: '4.2/5',
      icon: Star,
      trend: '+0.2 from last month'
    }
  ];

  const communityPerformance = [
    { name: 'Residensi Prima A', residents: 320, satisfaction: 4.3, collection: 98, issues: 3 },
    { name: 'Residensi Prima B', residents: 280, satisfaction: 4.1, collection: 92, issues: 2 },
    { name: 'Vista Gardens', residents: 245, satisfaction: 4.0, collection: 88, issues: 4 },
    { name: 'Green Valley', residents: 190, satisfaction: 4.4, collection: 96, issues: 1 },
    { name: 'Palm Heights', residents: 225, satisfaction: 3.9, collection: 85, issues: 6 }
  ];

  const pendingActions = [
    {
      type: 'Role Requests',
      message: language === 'en' ? '5 role requests awaiting review' : '5 permohonan peranan menunggu semakan',
      priority: 'high',
      count: 5
    },
    {
      type: 'Reports',
      message: language === 'en' ? '2 community admin reports pending' : '2 laporan admin komuniti belum selesai',
      priority: 'medium',
      count: 2
    },
    {
      type: 'Maintenance',
      message: language === 'en' ? 'Facility maintenance scheduling needed' : 'Penjadualan penyelenggaraan kemudahan diperlukan',
      priority: 'medium',
      count: 1
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {language === 'en' ? 'District Coordinator Dashboard' : 'Papan Pemuka Penyelaras Daerah'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'en' ? 'Pahang Prima North - Regional coordination and oversight' : 'Pahang Prima North - Penyelarasan dan pengawasan serantau'}
        </p>
      </div>

      {/* District Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {districtMetrics.map((metric, index) => (
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
                {language === 'en' ? 'District Operations Status' : 'Status Operasi Daerah'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {language === 'en' 
                  ? '8 communities active. 5 role requests pending review.' 
                  : '8 komuniti aktif. 5 permohonan peranan menunggu semakan.'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pending Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            {language === 'en' ? 'Pending Actions' : 'Tindakan Belum Selesai'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingActions.map((action, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant={action.priority === 'high' ? 'destructive' : 'secondary'}>
                  {action.count}
                </Badge>
                <div>
                  <p className="font-medium text-sm">{action.type}</p>
                  <p className="text-xs text-muted-foreground">{action.message}</p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                {language === 'en' ? 'Handle' : 'Uruskan'}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Community Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {language === 'en' ? 'Community Performance' : 'Prestasi Komuniti'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {communityPerformance.map((community, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{community.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {community.residents}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {community.satisfaction}/5
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {community.collection}%
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {community.issues} issues
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground">Health</div>
                    <Progress value={community.satisfaction * 20} className="w-16" />
                  </div>
                  <Button size="sm" variant="outline">
                    {language === 'en' ? 'Details' : 'Butiran'}
                  </Button>
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
              {language === 'en' ? 'Review Requests' : 'Semak Permohonan'}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <Settings className="h-4 w-4" />
              {language === 'en' ? 'Manage Communities' : 'Urus Komuniti'}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <Calendar className="h-4 w-4" />
              {language === 'en' ? 'Schedule Review' : 'Jadual Semakan'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}