import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, Camera, Users, AlertTriangle, Clock, MapPin, 
  Activity, TrendingUp, CheckCircle, Eye, Route, UserCheck 
} from 'lucide-react';

export default function SecurityDashboard() {
  const { user, language } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeIncidents, setActiveIncidents] = useState(12);
  const [totalCameras, setTotalCameras] = useState(48);
  const [activeCameras, setActiveCameras] = useState(45);
  const [todayVisitors, setTodayVisitors] = useState(156);

  useEffect(() => {
    if (user) {
      fetchSecurityData();
    }
  }, [user]);

  const fetchSecurityData = async () => {
    try {
      // Fetch real data when available
      // For now using mock data
      setLoading(false);
    } catch (error) {
      console.error('Error fetching security data:', error);
      setLoading(false);
    }
  };

  const securityMetrics = [
    {
      title: language === 'en' ? 'Active Incidents' : 'Insiden Aktif',
      value: activeIncidents.toString(),
      icon: AlertTriangle,
      trend: '-15% from yesterday',
      color: 'destructive'
    },
    {
      title: language === 'en' ? 'CCTV Status' : 'Status CCTV',
      value: `${activeCameras}/${totalCameras}`,
      icon: Camera,
      trend: '94% operational',
      color: 'default'
    },
    {
      title: language === 'en' ? 'Today\'s Visitors' : 'Pelawat Hari Ini',
      value: todayVisitors.toString(),
      icon: Users,
      trend: '+8% from yesterday',
      color: 'default'
    },
    {
      title: language === 'en' ? 'Security Level' : 'Tahap Keselamatan',
      value: 'High',
      icon: Shield,
      trend: 'All systems operational',
      color: 'default'
    }
  ];

  const recentIncidents = [
    {
      id: '1',
      type: 'Unauthorized Access',
      location: 'Main Gate',
      time: '2 hours ago',
      status: 'investigating',
      priority: 'high'
    },
    {
      id: '2',
      type: 'Suspicious Activity',
      location: 'Parking Lot B',
      time: '4 hours ago',
      status: 'resolved',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'Equipment Malfunction',
      location: 'Camera #23',
      time: '6 hours ago',
      status: 'in_progress',
      priority: 'low'
    }
  ];

  const patrolSchedule = [
    {
      officer: 'Ahmad Rahman',
      route: 'Perimeter Check',
      time: '14:00 - 16:00',
      status: 'active'
    },
    {
      officer: 'Sarah Lee',
      route: 'Building Inspection',
      time: '16:00 - 18:00',
      status: 'scheduled'
    },
    {
      officer: 'Kumar Singh',
      route: 'Night Patrol',
      time: '22:00 - 06:00',
      status: 'scheduled'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <Badge variant="default">Resolved</Badge>;
      case 'investigating':
        return <Badge variant="destructive">Investigating</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'scheduled':
        return <Badge variant="outline">Scheduled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="p-6">Loading security dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            {language === 'en' ? 'Security Dashboard' : 'Papan Pemuka Keselamatan'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' ? 'Monitor security operations and incidents' : 'Pantau operasi keselamatan dan insiden'}
          </p>
        </div>
        <Button>
          <AlertTriangle className="h-4 w-4 mr-2" />
          {language === 'en' ? 'Report Incident' : 'Laporkan Insiden'}
        </Button>
      </div>

      {/* Security Metrics */}
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
              {metric.title.includes('CCTV') && (
                <Progress value={(activeCameras / totalCameras) * 100} className="mt-2" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="incidents">
        <TabsList>
          <TabsTrigger value="incidents">
            {language === 'en' ? 'Recent Incidents' : 'Insiden Terkini'}
          </TabsTrigger>
          <TabsTrigger value="patrols">
            {language === 'en' ? 'Patrol Schedule' : 'Jadual Rondaan'}
          </TabsTrigger>
          <TabsTrigger value="cameras">
            {language === 'en' ? 'CCTV Status' : 'Status CCTV'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {language === 'en' ? 'Recent Security Incidents' : 'Insiden Keselamatan Terkini'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentIncidents.map((incident) => (
                  <div key={incident.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      <div>
                        <h4 className="font-medium">{incident.type}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {incident.location}
                          <Clock className="h-3 w-3 ml-2" />
                          {incident.time}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(incident.status)}
                      <Button size="sm" variant="outline">
                        {language === 'en' ? 'View Details' : 'Lihat Butiran'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patrols" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                {language === 'en' ? 'Security Patrol Schedule' : 'Jadual Rondaan Keselamatan'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patrolSchedule.map((patrol, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <UserCheck className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium">{patrol.officer}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Route className="h-3 w-3" />
                          {patrol.route}
                          <Clock className="h-3 w-3 ml-2" />
                          {patrol.time}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(patrol.status)}
                      <Button size="sm" variant="outline">
                        {language === 'en' ? 'Track' : 'Jejaki'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cameras" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Camera #{String(i + 1).padStart(2, '0')}
                    </CardTitle>
                    <Badge variant={i === 2 ? "destructive" : "default"}>
                      {i === 2 ? "Offline" : "Online"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span>Entrance {String.fromCharCode(65 + i)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Resolution:</span>
                      <span>1080p</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={i === 2 ? "text-destructive" : "text-green-600"}>
                        {i === 2 ? "Offline" : "Recording"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      {language === 'en' ? 'View' : 'Lihat'}
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      {language === 'en' ? 'Control' : 'Kawalan'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'en' ? 'Quick Security Actions' : 'Tindakan Keselamatan Pantas'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="flex items-center gap-2 h-12">
              <Camera className="h-4 w-4" />
              {language === 'en' ? 'View All Cameras' : 'Lihat Semua Kamera'}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <UserCheck className="h-4 w-4" />
              {language === 'en' ? 'Visitor Log' : 'Log Pelawat'}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <Route className="h-4 w-4" />
              {language === 'en' ? 'Start Patrol' : 'Mula Rondaan'}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <Activity className="h-4 w-4" />
              {language === 'en' ? 'Security Report' : 'Laporan Keselamatan'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}