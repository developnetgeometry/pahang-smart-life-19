import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building, 
  Calendar, 
  DollarSign, 
  Wrench,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  Activity
} from 'lucide-react';

export function FacilityManagerDashboard() {
  const { language } = useAuth();

  const facilityMetrics = [
    {
      title: language === 'en' ? 'Facilities' : 'Kemudahan',
      value: '8',
      icon: Building,
      trend: '7 operational',
      status: 87.5
    },
    {
      title: language === 'en' ? "Today's Bookings" : 'Tempahan Hari Ini',
      value: '12',
      icon: Calendar,
      trend: '+3 from yesterday'
    },
    {
      title: language === 'en' ? 'Revenue' : 'Pendapatan',
      value: 'RM 2,400',
      icon: DollarSign,
      trend: 'This month'
    },
    {
      title: language === 'en' ? 'Maintenance Due' : 'Penyelenggaraan Perlu',
      value: '3',
      icon: Wrench,
      trend: 'This week'
    }
  ];

  const facilityStatus = [
    { name: 'Swimming Pool', status: 'operational', utilization: 85, revenue: 'RM 450', bookings: 8 },
    { name: 'Community Hall', status: 'operational', utilization: 92, revenue: 'RM 680', bookings: 3 },
    { name: 'Gym', status: 'operational', utilization: 78, revenue: 'RM 320', bookings: 12 },
    { name: 'Tennis Court', status: 'maintenance', utilization: 0, revenue: 'RM 0', bookings: 0 },
    { name: 'BBQ Area', status: 'operational', utilization: 65, revenue: 'RM 240', bookings: 4 },
    { name: 'Function Room A', status: 'operational', utilization: 55, revenue: 'RM 180', bookings: 2 },
    { name: 'Function Room B', status: 'operational', utilization: 70, revenue: 'RM 220', bookings: 3 },
    { name: 'Playground', status: 'operational', utilization: 40, revenue: 'RM 0', bookings: 8 }
  ];

  const upcomingMaintenance = [
    {
      task: language === 'en' ? 'Pool cleaning' : 'Pembersihan kolam',
      facility: 'Swimming Pool',
      date: 'Tomorrow',
      time: '9:00 AM',
      priority: 'high'
    },
    {
      task: language === 'en' ? 'Gym equipment inspection' : 'Pemeriksaan peralatan gim',
      facility: 'Gym',
      date: 'Thursday',
      time: '2:00 PM',
      priority: 'medium'
    },
    {
      task: language === 'en' ? 'Hall AC servicing' : 'Servis AC dewan',
      facility: 'Community Hall',
      date: 'Next week',
      time: '10:00 AM',
      priority: 'low'
    }
  ];

  const todayBookings = [
    { time: '8:00 AM', facility: 'Swimming Pool', user: 'Ahmad Rahman', duration: '2 hours' },
    { time: '10:00 AM', facility: 'Gym', user: 'Sarah Chen', duration: '1 hour' },
    { time: '2:00 PM', facility: 'Community Hall', user: 'Community Event', duration: '4 hours' },
    { time: '6:00 PM', facility: 'BBQ Area', user: 'Family Gathering', duration: '3 hours' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
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
          {language === 'en' ? 'Facility Manager Dashboard' : 'Papan Pemuka Pengurus Kemudahan'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'en' ? 'Facility operations and maintenance oversight' : 'Operasi kemudahan dan pengawasan penyelenggaraan'}
        </p>
      </div>

      {/* Facility Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {facilityMetrics.map((metric, index) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              {language === 'en' ? 'Upcoming Maintenance' : 'Penyelenggaraan Akan Datang'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingMaintenance.map((maintenance, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getPriorityColor(maintenance.priority) as any}>
                      {maintenance.priority}
                    </Badge>
                    <span className="text-sm font-medium">{maintenance.task}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{maintenance.facility}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    {maintenance.date} at {maintenance.time}
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  {language === 'en' ? 'Schedule' : 'Jadual'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Today's Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {language === 'en' ? "Today's Bookings" : 'Tempahan Hari Ini'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayBookings.map((booking, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{booking.time}</span>
                    <Badge variant="secondary">{booking.facility}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{booking.user}</p>
                  <p className="text-xs text-muted-foreground">{booking.duration}</p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Facility Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {language === 'en' ? 'Facility Performance' : 'Prestasi Kemudahan'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {facilityStatus.map((facility, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{facility.name}</h4>
                    <Badge className={getStatusColor(facility.status)}>
                      {facility.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Utilization: {facility.utilization}%</span>
                    <span>Revenue: {facility.revenue}</span>
                    <span>Bookings: {facility.bookings}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Progress value={facility.utilization} className="w-20" />
                  <Button size="sm" variant="outline">
                    {language === 'en' ? 'Manage' : 'Urus'}
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
              <Calendar className="h-4 w-4" />
              {language === 'en' ? 'View Bookings' : 'Lihat Tempahan'}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <Wrench className="h-4 w-4" />
              {language === 'en' ? 'Schedule Maintenance' : 'Jadual Penyelenggaraan'}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <Activity className="h-4 w-4" />
              {language === 'en' ? 'Generate Report' : 'Jana Laporan'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}