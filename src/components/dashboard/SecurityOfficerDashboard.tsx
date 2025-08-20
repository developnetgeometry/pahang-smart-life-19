import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PanicAlertManager from '@/components/emergency/PanicAlertManager';
import { 
  Camera, 
  Shield, 
  Users, 
  AlertTriangle,
  Activity,
  Clock,
  Eye,
  Ban,
  FileText,
  CheckCircle
} from 'lucide-react';

export function SecurityOfficerDashboard() {
  const { language } = useAuth();

  const securityMetrics = [
    {
      title: language === 'en' ? 'CCTV Cameras' : 'Kamera CCTV',
      value: '24',
      icon: Camera,
      trend: '23 online',
      status: 96
    },
    {
      title: language === 'en' ? 'Access Points' : 'Titik Akses',
      value: '12',
      icon: Shield,
      trend: 'All operational',
      status: 100
    },
    {
      title: language === 'en' ? "Today's Visitors" : 'Pelawat Hari Ini',
      value: '47',
      icon: Users,
      trend: '+12 from yesterday'
    },
    {
      title: language === 'en' ? 'Active Alerts' : 'Amaran Aktif',
      value: '2',
      icon: AlertTriangle,
      trend: 'Medium priority'
    }
  ];

  const liveAlerts = [
    {
      type: 'warning',
      message: language === 'en' ? 'Tailgate detected at Main Gate' : 'Tailgate dikesan di Pintu Utama',
      time: '2:15 PM',
      location: 'Main Gate',
      priority: 'medium'
    },
    {
      type: 'info',
      message: language === 'en' ? 'All clear - Patrol round completed' : 'Semua selamat - Rondaan selesai',
      time: '1:45 PM',
      location: 'Building A',
      priority: 'low'
    }
  ];

  const cctvFeeds = [
    { name: 'Main Gate', status: 'online', location: 'Entrance' },
    { name: 'Parking Area', status: 'online', location: 'Level 1' },
    { name: 'Pool Area', status: 'online', location: 'Recreation' },
    { name: 'Playground', status: 'online', location: 'Ground Floor' },
    { name: 'Gym', status: 'online', location: 'Level 2' },
    { name: 'Community Hall', status: 'online', location: 'Level 3' },
    { name: 'Lobby', status: 'offline', location: 'Ground Floor' },
    { name: 'Back Gate', status: 'online', location: 'Service Entrance' }
  ];

  const recentIncidents = [
    {
      type: 'Access Denied',
      description: language === 'en' ? 'Invalid card used at Main Gate' : 'Kad tidak sah digunakan di Pintu Utama',
      time: '11:30 AM',
      status: 'resolved'
    },
    {
      type: 'Visitor Alert',
      description: language === 'en' ? 'Unregistered visitor detected' : 'Pelawat tidak berdaftar dikesan',
      time: '10:15 AM',
      status: 'investigating'
    },
    {
      type: 'Equipment',
      description: language === 'en' ? 'Camera maintenance completed' : 'Penyelenggaraan kamera selesai',
      time: '9:00 AM',
      status: 'resolved'
    }
  ];

  const patrolSchedule = [
    { time: '3:00 PM', area: 'Building A - Levels 1-5', status: 'upcoming' },
    { time: '4:00 PM', area: 'Parking & Common Areas', status: 'upcoming' },
    { time: '5:00 PM', area: 'Recreation Facilities', status: 'upcoming' },
    { time: '6:00 PM', area: 'Perimeter Check', status: 'upcoming' }
  ];

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'warning': return 'destructive';
      case 'info': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {language === 'en' ? 'Security Officer Dashboard' : 'Papan Pemuka Pegawai Keselamatan'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'en' ? 'Security monitoring and incident management' : 'Pemantauan keselamatan dan pengurusan insiden'}
        </p>
      </div>

      {/* Panic Alert Management - High Priority Section */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            {language === 'en' ? 'Emergency Panic Alerts' : 'Amaran Panik Kecemasan'}
          </CardTitle>
          <CardDescription>
            {language === 'en' ? 'Monitor and respond to emergency panic alerts from residents' : 'Pantau dan respon kepada amaran panik kecemasan daripada penduduk'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PanicAlertManager />
        </CardContent>
      </Card>

      {/* Security Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {securityMetrics.map((metric, index) => (
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

      {/* Live Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {language === 'en' ? 'Live Security Alerts' : 'Amaran Keselamatan Langsung'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {liveAlerts.map((alert, index) => (
            <Alert key={index} variant={getAlertVariant(alert.type) as any}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{alert.message}</p>
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <Clock className="h-3 w-3" />
                      {alert.time}
                      <span>•</span>
                      {alert.location}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    {language === 'en' ? 'Respond' : 'Bertindak'}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CCTV Camera Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              {language === 'en' ? 'CCTV Camera Status' : 'Status Kamera CCTV'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {cctvFeeds.map((camera, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{camera.name}</p>
                    <p className="text-xs text-muted-foreground">{camera.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(camera.status)}>
                      {camera.status}
                    </Badge>
                    {camera.status === 'online' && (
                      <Button size="sm" variant="ghost">
                        <Eye className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Incidents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {language === 'en' ? 'Recent Incidents' : 'Insiden Terkini'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentIncidents.map((incident, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary">{incident.type}</Badge>
                    <Badge className={getStatusColor(incident.status)}>
                      {incident.status}
                    </Badge>
                  </div>
                  <p className="text-sm">{incident.description}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    {incident.time}
                  </div>
                </div>
                {incident.status === 'resolved' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Button size="sm" variant="outline">
                    {language === 'en' ? 'Review' : 'Semak'}
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Patrol Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {language === 'en' ? 'Patrol Schedule' : 'Jadual Rondaan'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {patrolSchedule.map((patrol, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Clock className="h-4 w-4" />
                    {patrol.time}
                  </div>
                  <span className="text-sm">{patrol.area}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(patrol.status)}>
                    {patrol.status}
                  </Badge>
                  <Button size="sm" variant="outline">
                    {language === 'en' ? 'Start' : 'Mula'}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="flex items-center gap-2 h-12">
              <Camera className="h-4 w-4" />
              {language === 'en' ? 'View All Cameras' : 'Lihat Semua Kamera'}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <Users className="h-4 w-4" />
              {language === 'en' ? 'Visitor Log' : 'Log Pelawat'}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <FileText className="h-4 w-4" />
              {language === 'en' ? 'Incident Report' : 'Laporan Insiden'}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <Activity className="h-4 w-4" />
              {language === 'en' ? 'System Check' : 'Semak Sistem'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}