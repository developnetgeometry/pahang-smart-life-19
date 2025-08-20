import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  Star
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
      title: language === 'en' ? 'Monthly Revenue' : 'Pendapatan Bulanan',
      value: 'RM 2.4M',
      icon: DollarSign,
      trend: '+12% vs last month'
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
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{district.name} - {language === 'en' ? 'District Details' : 'Butiran Daerah'}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                {language === 'en' ? 'Total Residents' : 'Jumlah Penduduk'}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">{district.residents}</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <Star className="h-4 w-4" />
                                {language === 'en' ? 'Satisfaction Rating' : 'Penilaian Kepuasan'}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">{district.satisfaction}/5</div>
                              <Progress value={district.satisfaction * 20} className="mt-2" />
                            </CardContent>
                          </Card>
                        </div>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              {language === 'en' ? 'Active Issues' : 'Isu Aktif'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-destructive">{district.issues}</div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {language === 'en' ? 'Issues requiring attention' : 'Isu yang memerlukan perhatian'}
                            </p>
                          </CardContent>
                        </Card>
                        <div className="space-y-3">
                          <h4 className="font-medium">{language === 'en' ? 'Recent Activities' : 'Aktiviti Terkini'}</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <span className="text-sm">{language === 'en' ? 'Monthly maintenance completed' : 'Penyelenggaraan bulanan selesai'}</span>
                              <Badge variant="secondary">{language === 'en' ? 'Completed' : 'Selesai'}</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <span className="text-sm">{language === 'en' ? 'Budget allocation approved' : 'Peruntukan bajet diluluskan'}</span>
                              <Badge variant="secondary">{language === 'en' ? 'Approved' : 'Diluluskan'}</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <span className="text-sm">{language === 'en' ? 'New residents registered' : 'Penduduk baru didaftarkan'}</span>
                              <Badge variant="outline">{language === 'en' ? 'In Progress' : 'Dalam Proses'}</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
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