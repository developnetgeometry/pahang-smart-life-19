import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WeatherWidget } from './WeatherWidget';
import { PrayerTimesWidget } from './PrayerTimesWidget';
import { 
  Briefcase, 
  DollarSign, 
  Star, 
  Clock,
  Users,
  Calendar,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  Phone,
  Activity
} from 'lucide-react';

export function ServiceProviderDashboard() {
  const { language } = useAuth();

  const serviceMetrics = [
    {
      title: language === 'en' ? 'Active Contracts' : 'Kontrak Aktif',
      value: '23',
      icon: Briefcase,
      trend: '+2 this month'
    },
    {
      title: language === 'en' ? 'Monthly Revenue' : 'Pendapatan Bulanan',
      value: 'RM 18,500',
      icon: DollarSign,
      trend: '+15% from last month'
    },
    {
      title: language === 'en' ? 'Customer Rating' : 'Penilaian Pelanggan',
      value: '4.8/5',
      icon: Star,
      trend: 'Excellent service',
      status: 96
    },
    {
      title: language === 'en' ? 'Response Time' : 'Masa Tindak Balas',
      value: '< 2 hours',
      icon: Clock,
      trend: '98% completion rate'
    }
  ];

  const upcomingAppointments = [
    {
      time: '10:00 AM',
      service: language === 'en' ? 'Cleaning service' : 'Perkhidmatan pembersihan',
      client: 'Unit A-12-05',
      duration: '2 hours',
      type: 'regular',
      contact: '+6012-345-6789'
    },
    {
      time: '2:30 PM',
      service: language === 'en' ? 'Delivery service' : 'Perkhidmatan penghantaran',
      client: 'Building B Lobby',
      duration: '30 minutes',
      type: 'one-time',
      contact: '+6012-987-6543'
    },
    {
      time: '4:00 PM',
      service: language === 'en' ? 'Installation service' : 'Perkhidmatan pemasangan',
      client: 'Unit C-08-12',
      duration: '1.5 hours',
      type: 'installation',
      contact: '+6012-555-1234'
    }
  ];

  const customerFeedback = [
    {
      client: 'Mrs. Chen',
      rating: 5,
      comment: language === 'en' ? '"Excellent service as always!"' : '"Perkhidmatan yang cemerlang seperti biasa!"',
      service: 'Cleaning',
      date: '2 days ago'
    },
    {
      client: 'Mr. Ahmad',
      rating: 5,
      comment: language === 'en' ? '"Quick response time, very satisfied"' : '"Tindak balas pantas, sangat berpuas hati"',
      service: 'Maintenance',
      date: '1 week ago'
    },
    {
      client: 'Ms. Lim',
      rating: 4,
      comment: language === 'en' ? '"Professional and reliable service"' : '"Perkhidmatan yang profesional dan boleh dipercayai"',
      service: 'Delivery',
      date: '1 week ago'
    }
  ];

  const serviceRequests = [
    {
      id: 'SR-2024-001',
      type: 'Regular Cleaning',
      client: 'Residensi Prima A',
      status: 'confirmed',
      date: 'Tomorrow',
      priority: 'medium'
    },
    {
      id: 'SR-2024-002',
      type: 'Emergency Plumbing',
      client: 'Unit B-05-08',
      status: 'urgent',
      date: 'Today',
      priority: 'high'
    },
    {
      id: 'SR-2024-003',
      type: 'Garden Maintenance',
      client: 'Vista Gardens',
      status: 'scheduled',
      date: 'Next Week',
      priority: 'low'
    }
  ];

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'regular': return 'bg-blue-100 text-blue-800';
      case 'one-time': return 'bg-green-100 text-green-800';
      case 'installation': return 'bg-purple-100 text-purple-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
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
          {language === 'en' ? 'Service Provider Dashboard' : 'Papan Pemuka Penyedia Perkhidmatan'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'en' ? 'Service delivery and customer management' : 'Penyampaian perkhidmatan dan pengurusan pelanggan'}
        </p>
      </div>

      {/* Service Metrics Overview */}
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
                  ? '23 active contracts. 4.8/5 customer rating. RM 18,500 monthly revenue.' 
                  : '23 kontrak aktif. Penilaian pelanggan 4.8/5. Pendapatan bulanan RM 18,500.'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {language === 'en' ? 'Upcoming Appointments' : 'Temujanji Akan Datang'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingAppointments.map((appointment, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getServiceTypeColor(appointment.type)}>
                      {appointment.type}
                    </Badge>
                    <span className="text-sm font-medium">{appointment.time}</span>
                  </div>
                  <p className="text-sm font-medium">{appointment.service}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>{appointment.client}</span>
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                    <span>{appointment.duration}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" variant="outline">
                    <Phone className="h-3 w-3 mr-1" />
                    {language === 'en' ? 'Call' : 'Panggil'}
                  </Button>
                  <Button size="sm">
                    {language === 'en' ? 'Navigate' : 'Arah'}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Customer Feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {language === 'en' ? 'Recent Customer Feedback' : 'Maklum Balas Pelanggan Terkini'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {customerFeedback.map((feedback, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{feedback.client}</span>
                    <Badge variant="secondary">{feedback.service}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3 w-3 ${i < feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">{feedback.comment}</p>
                <p className="text-xs text-muted-foreground mt-2">{feedback.date}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Service Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            {language === 'en' ? 'Service Requests' : 'Permohonan Perkhidmatan'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {serviceRequests.map((request, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{request.id}</Badge>
                    <Badge variant={getPriorityColor(request.priority) as any}>
                      {request.priority}
                    </Badge>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{request.type}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span>{request.client}</span>
                    <span>Scheduled: {request.date}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    {language === 'en' ? 'Details' : 'Butiran'}
                  </Button>
                  {request.status === 'confirmed' && (
                    <Button size="sm">
                      {language === 'en' ? 'Start Service' : 'Mula Perkhidmatan'}
                    </Button>
                  )}
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
              <Calendar className="h-4 w-4" />
              {language === 'en' ? 'View Schedule' : 'Lihat Jadual'}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <Users className="h-4 w-4" />
              {language === 'en' ? 'Customer List' : 'Senarai Pelanggan'}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <TrendingUp className="h-4 w-4" />
              {language === 'en' ? 'Performance' : 'Prestasi'}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <CheckCircle className="h-4 w-4" />
              {language === 'en' ? 'Complete Service' : 'Selesaikan Perkhidmatan'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}