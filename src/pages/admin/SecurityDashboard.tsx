import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Camera, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users,
  Eye,
  MapPin,
  Activity,
  Bell,
  Settings
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  type: 'access' | 'alarm' | 'camera' | 'patrol';
  title: string;
  description: string;
  location: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'investigating';
}

interface SystemStatus {
  cameras: { total: number; online: number; offline: number };
  alarms: { total: number; active: number; resolved: number };
  access: { total: number; granted: number; denied: number };
  patrols: { scheduled: number; completed: number; pending: number };
}

export default function SecurityDashboard() {
  const { language } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const text = {
    en: {
      title: 'Security Dashboard',
      subtitle: 'Monitor community security systems',
      overview: 'Overview',
      events: 'Security Events',
      cameras: 'Camera Status',
      access: 'Access Control',
      systemStatus: 'System Status',
      camerasOnline: 'Cameras Online',
      activeAlarms: 'Active Alarms',
      accessGrants: 'Access Grants Today',
      patrolsCompleted: 'Patrols Completed',
      recentEvents: 'Recent Security Events',
      allCameras: 'All Cameras',
      onlineCameras: 'Online',
      offlineCameras: 'Offline',
      totalAlarms: 'Total Alarms',
      activeAlarmsCount: 'Active',
      resolvedAlarms: 'Resolved',
      accessControl: 'Access Control',
      granted: 'Granted',
      denied: 'Denied',
      securityPatrols: 'Security Patrols',
      scheduled: 'Scheduled',
      completed: 'Completed',
      pending: 'Pending',
      severity: 'Severity',
      status: 'Status',
      location: 'Location',
      timestamp: 'Timestamp',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical',
      active: 'Active',
      resolved: 'Resolved',
      investigating: 'Investigating',
      viewDetails: 'View Details',
      acknowledge: 'Acknowledge',
      resolve: 'Resolve'
    },
    ms: {
      title: 'Papan Pemuka Keselamatan',
      subtitle: 'Pantau sistem keselamatan komuniti',
      overview: 'Gambaran Keseluruhan',
      events: 'Peristiwa Keselamatan',
      cameras: 'Status Kamera',
      access: 'Kawalan Akses',
      systemStatus: 'Status Sistem',
      camerasOnline: 'Kamera Dalam Talian',
      activeAlarms: 'Penggera Aktif',
      accessGrants: 'Akses Diberi Hari Ini',
      patrolsCompleted: 'Rondaan Selesai',
      recentEvents: 'Peristiwa Keselamatan Terkini',
      allCameras: 'Semua Kamera',
      onlineCameras: 'Dalam Talian',
      offlineCameras: 'Luar Talian',
      totalAlarms: 'Jumlah Penggera',
      activeAlarmsCount: 'Aktif',
      resolvedAlarms: 'Selesai',
      accessControl: 'Kawalan Akses',
      granted: 'Diberi',
      denied: 'Ditolak',
      securityPatrols: 'Rondaan Keselamatan',
      scheduled: 'Dijadualkan',
      completed: 'Selesai',
      pending: 'Menunggu',
      severity: 'Keterukan',
      status: 'Status',
      location: 'Lokasi',
      timestamp: 'Masa',
      low: 'Rendah',
      medium: 'Sederhana',
      high: 'Tinggi',
      critical: 'Kritikal',
      active: 'Aktif',
      resolved: 'Selesai',
      investigating: 'Menyiasat',
      viewDetails: 'Lihat Butiran',
      acknowledge: 'Akui',
      resolve: 'Selesaikan'
    }
  };

  const t = text[language];

  const systemStatus: SystemStatus = {
    cameras: { total: 24, online: 22, offline: 2 },
    alarms: { total: 156, active: 3, resolved: 153 },
    access: { total: 1248, granted: 1195, denied: 53 },
    patrols: { scheduled: 8, completed: 6, pending: 2 }
  };

  const mockSecurityEvents: SecurityEvent[] = [
    {
      id: '1',
      type: 'alarm',
      title: language === 'en' ? 'Motion detected in parking area' : 'Pergerakan dikesan di kawasan parkir',
      description: language === 'en' ? 'Unauthorized motion detected after hours' : 'Pergerakan tanpa kebenaran dikesan selepas waktu kerja',
      location: 'Parking Level B1',
      timestamp: '2024-01-20 23:45',
      severity: 'high',
      status: 'active'
    },
    {
      id: '2',
      type: 'access',
      title: language === 'en' ? 'Failed access attempt' : 'Percubaan akses gagal',
      description: language === 'en' ? 'Multiple failed card swipes at main entrance' : 'Beberapa percubaan kad gagal di pintu masuk utama',
      location: 'Main Entrance',
      timestamp: '2024-01-20 22:30',
      severity: 'medium',
      status: 'investigating'
    },
    {
      id: '3',
      type: 'camera',
      title: language === 'en' ? 'Camera offline' : 'Kamera luar talian',
      description: language === 'en' ? 'Pool area camera lost connection' : 'Kamera kawasan kolam kehilangan sambungan',
      location: 'Swimming Pool Area',
      timestamp: '2024-01-20 20:15',
      severity: 'low',
      status: 'resolved'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'critical': return t.critical;
      case 'high': return t.high;
      case 'medium': return t.medium;
      case 'low': return t.low;
      default: return severity;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return t.active;
      case 'investigating': return t.investigating;
      case 'resolved': return t.resolved;
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Alerts
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
          <TabsTrigger value="events">{t.events}</TabsTrigger>
          <TabsTrigger value="cameras">{t.cameras}</TabsTrigger>
          <TabsTrigger value="access">{t.access}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.camerasOnline}</CardTitle>
                <Camera className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStatus.cameras.online}/{systemStatus.cameras.total}</div>
                <p className="text-xs text-muted-foreground">
                  {systemStatus.cameras.offline} offline
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.activeAlarms}</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStatus.alarms.active}</div>
                <p className="text-xs text-muted-foreground">
                  {systemStatus.alarms.resolved} resolved today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.accessGrants}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStatus.access.granted}</div>
                <p className="text-xs text-muted-foreground">
                  {systemStatus.access.denied} denied
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.patrolsCompleted}</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStatus.patrols.completed}/{systemStatus.patrols.scheduled}</div>
                <p className="text-xs text-muted-foreground">
                  {systemStatus.patrols.pending} pending
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t.recentEvents}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSecurityEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.timestamp}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(event.severity)}>
                        {getSeverityText(event.severity)}
                      </Badge>
                      <Badge className={getStatusColor(event.status)}>
                        {getStatusText(event.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.events}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSecurityEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.timestamp}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(event.severity)}>
                        {getSeverityText(event.severity)}
                      </Badge>
                      <Badge className={getStatusColor(event.status)}>
                        {getStatusText(event.status)}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cameras">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Camera management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Access control management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}