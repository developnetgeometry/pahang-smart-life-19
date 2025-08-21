import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WeatherWidget } from './WeatherWidget';
import { 
  Users, 
  DollarSign, 
  AlertTriangle, 
  Star,
  Building,
  Activity,
  Megaphone,
  FileText,
  Calendar,
  MessageSquare
} from 'lucide-react';

export function CommunityAdminDashboard() {
  const { language } = useAuth();

  const communityMetrics = [
    {
      title: language === 'en' ? 'Total Residents' : 'Jumlah Penduduk',
      value: '342',
      icon: Users,
      trend: '+5 new residents'
    },
    {
      title: language === 'en' ? 'Active Issues' : 'Isu Aktif',
      value: '8',
      icon: AlertTriangle,
      trend: '3 resolved this week'
    },
    {
      title: language === 'en' ? 'Collections' : 'Kutipan',
      value: 'RM 52K',
      icon: DollarSign,
      trend: '92% collection rate'
    },
    {
      title: language === 'en' ? 'Satisfaction' : 'Kepuasan',
      value: '4.1/5',
      icon: Star,
      trend: '78% engagement rate'
    }
  ];

  const recentActivities = [
    {
      type: 'Maintenance',
      message: language === 'en' ? '3 new maintenance requests submitted' : '3 permohonan penyelenggaraan baharu dikemukakan',
      time: '2 hours ago',
      icon: FileText
    },
    {
      type: 'Event',
      message: language === 'en' ? 'Community event planning: CNY celebration' : 'Perancangan acara komuniti: sambutan CNY',
      time: '4 hours ago',
      icon: Calendar
    },
    {
      type: 'Bookings',
      message: language === 'en' ? '12 facility bookings this week' : '12 tempahan kemudahan minggu ini',
      time: '1 day ago',
      icon: Building
    },
    {
      type: 'Residents',
      message: language === 'en' ? '2 new resident registrations' : '2 pendaftaran penduduk baharu',
      time: '2 days ago',
      icon: Users
    }
  ];

  const facilityUsage = [
    { name: 'Community Hall', bookings: 28, utilization: 85 },
    { name: 'Swimming Pool', bookings: 45, utilization: 72 },
    { name: 'Gym', bookings: 32, utilization: 68 },
    { name: 'Playground', bookings: 15, utilization: 45 }
  ];

  const upcomingEvents = [
    {
      title: language === 'en' ? 'Chinese New Year Celebration' : 'Sambutan Tahun Baru Cina',
      date: 'Feb 12, 2024',
      attendees: 89,
      status: 'confirmed'
    },
    {
      title: language === 'en' ? 'Community Clean-up Day' : 'Hari Gotong-royong Komuniti',
      date: 'Feb 18, 2024',
      attendees: 45,
      status: 'planning'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {language === 'en' ? 'Community Admin Dashboard' : 'Papan Pemuka Admin Komuniti'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'en' ? 'Community management and resident services' : 'Pengurusan komuniti dan perkhidmatan penduduk'}
        </p>
      </div>

      {/* Community Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {communityMetrics.map((metric, index) => (
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
                {language === 'en' ? 'Today\'s Summary' : 'Ringkasan Hari Ini'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {language === 'en' 
                  ? 'All systems operational. 3 new resident registrations pending approval.' 
                  : 'Semua sistem beroperasi. 3 pendaftaran penduduk baru menunggu kelulusan.'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {language === 'en' ? 'Recent Activities' : 'Aktiviti Terkini'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <activity.icon className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {activity.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                  <p className="text-sm">{activity.message}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Facility Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {language === 'en' ? 'Facility Usage' : 'Penggunaan Kemudahan'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {facilityUsage.map((facility, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{facility.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {facility.bookings} {language === 'en' ? 'bookings' : 'tempahan'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={facility.utilization} className="flex-1" />
                  <span className="text-xs text-muted-foreground w-12">
                    {facility.utilization}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {language === 'en' ? 'Upcoming Community Events' : 'Acara Komuniti Akan Datang'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{event.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span>{event.date}</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {event.attendees} {language === 'en' ? 'registered' : 'berdaftar'}
                    </span>
                    <Badge variant={event.status === 'confirmed' ? 'default' : 'secondary'}>
                      {event.status}
                    </Badge>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  {language === 'en' ? 'Manage' : 'Urus'}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="flex items-center gap-2 h-12">
              <Megaphone className="h-4 w-4" />
              {language === 'en' ? 'Create Announcement' : 'Cipta Pengumuman'}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <AlertTriangle className="h-4 w-4" />
              {language === 'en' ? 'Manage Complaints' : 'Urus Aduan'}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <MessageSquare className="h-4 w-4" />
              {language === 'en' ? 'View Reports' : 'Lihat Laporan'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}