import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PanicButton from '@/components/emergency/PanicButton';
import { 
  DollarSign, 
  Calendar, 
  Users, 
  Package,
  Megaphone,
  PartyPopper,
  CreditCard,
  UserPlus,
  FileText,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building
} from 'lucide-react';

export function ResidentDashboard() {
  const { language, user } = useAuth();

  const personalMetrics = [
    {
      title: language === 'en' ? 'Account Balance' : 'Baki Akaun',
      value: 'RM 150',
      icon: DollarSign,
      trend: 'Credit balance',
      status: 'positive'
    },
    {
      title: language === 'en' ? 'Upcoming Bills' : 'Bil Akan Datang',
      value: 'RM 280',
      icon: CreditCard,
      trend: 'Due March 1',
      status: 'pending'
    },
    {
      title: language === 'en' ? 'My Bookings' : 'Tempahan Saya',
      value: '1',
      icon: Calendar,
      trend: 'Pool - 8PM today',
      status: 'active'
    },
    {
      title: language === 'en' ? 'Visitors Today' : 'Pelawat Hari Ini',
      value: '2',
      icon: Users,
      trend: 'Expected arrivals'
    }
  ];

  const communityUpdates = [
    {
      type: 'maintenance',
      title: language === 'en' ? 'Pool Maintenance Scheduled' : 'Penyelenggaraan Kolam Dijadualkan',
      message: language === 'en' ? 'Pool maintenance scheduled for tomorrow 9AM-12PM' : 'Penyelenggaraan kolam dijadualkan esok 9AM-12PM',
      time: '2 hours ago',
      priority: 'medium'
    },
    {
      type: 'event',
      title: language === 'en' ? 'Chinese New Year Celebration' : 'Sambutan Tahun Baru Cina',
      message: language === 'en' ? 'Join us for Chinese New Year celebration - Feb 12, Community Hall' : 'Sertai kami untuk sambutan Tahun Baru Cina - 12 Feb, Dewan Komuniti',
      time: '1 day ago',
      priority: 'low'
    },
    {
      type: 'bill',
      title: language === 'en' ? 'Monthly Fee Reminder' : 'Peringatan Yuran Bulanan',
      message: language === 'en' ? 'Reminder: Monthly maintenance fee due March 1' : 'Peringatan: Yuran penyelenggaraan bulanan perlu dibayar 1 Mac',
      time: '3 days ago',
      priority: 'high'
    }
  ];

  const quickActions = [
    {
      title: language === 'en' ? 'Book Facility' : 'Tempah Kemudahan',
      description: language === 'en' ? 'Reserve community facilities' : 'Tempah kemudahan komuniti',
      icon: Building,
      action: '/facilities'
    },
    {
      title: language === 'en' ? 'Register Visitor' : 'Daftar Pelawat',
      description: language === 'en' ? 'Pre-register your visitors' : 'Pra-daftar pelawat anda',
      icon: UserPlus,
      action: '/my-visitors'
    },
    {
      title: language === 'en' ? 'Submit Complaint' : 'Hantar Aduan',
      description: language === 'en' ? 'Report issues or concerns' : 'Laporkan isu atau masalah',
      icon: FileText,
      action: '/my-complaints'
    },
    {
      title: language === 'en' ? 'Pay Bills' : 'Bayar Bil',
      description: language === 'en' ? 'View and pay outstanding bills' : 'Lihat dan bayar bil tertunggak',
      icon: CreditCard,
      action: '/my-profile'
    },
    {
      title: language === 'en' ? 'Community Chat' : 'Sembang Komuniti',
      description: language === 'en' ? 'Connect with neighbors' : 'Berhubung dengan jiran',
      icon: MessageSquare,
      action: '/communication'
    },
    {
      title: language === 'en' ? 'View Announcements' : 'Lihat Pengumuman',
      description: language === 'en' ? 'Stay updated with community news' : 'Kekal terkini dengan berita komuniti',
      icon: Megaphone,
      action: '/announcements'
    }
  ];

  const recentActivities = [
    {
      type: 'booking',
      title: language === 'en' ? 'Pool booking confirmed' : 'Tempahan kolam disahkan',
      time: 'Today 2:30 PM',
      status: 'confirmed'
    },
    {
      type: 'visitor',
      title: language === 'en' ? 'Visitor registered: John Doe' : 'Pelawat didaftarkan: John Doe',
      time: 'Yesterday 4:15 PM',
      status: 'approved'
    },
    {
      type: 'payment',
      title: language === 'en' ? 'Maintenance fee paid' : 'Yuran penyelenggaraan dibayar',
      time: '3 days ago',
      status: 'completed'
    }
  ];

  const myServices = [
    {
      service: language === 'en' ? 'Internet Service' : 'Perkhidmatan Internet',
      provider: 'TM Unifi',
      status: 'active',
      nextBilling: '2024-03-01'
    },
    {
      service: language === 'en' ? 'Cleaning Service' : 'Perkhidmatan Pembersihan',
      provider: 'Clean Pro',
      status: 'scheduled',
      nextVisit: '2024-02-16'
    }
  ];

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'maintenance': return AlertTriangle;
      case 'event': return PartyPopper;
      case 'bill': return CreditCard;
      default: return Megaphone;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'positive': return 'text-green-600';
      case 'pending': return 'text-orange-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return Calendar;
      case 'visitor': return Users;
      case 'payment': return DollarSign;
      default: return CheckCircle;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {language === 'en' ? `Welcome back, ${user?.display_name || 'Resident'}` : `Selamat kembali, ${user?.display_name || 'Penduduk'}`}
        </h1>
        <p className="text-muted-foreground">
          {language === 'en' ? `${user?.district || 'Your Community'} - Unit A-5-12` : `${user?.district || 'Komuniti Anda'} - Unit A-5-12`}
        </p>
      </div>

      {/* Personal Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {personalMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(metric.status || '')}`}>
                {metric.value}
              </div>
              <p className="text-xs text-muted-foreground">{metric.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Community Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            {language === 'en' ? 'Community Updates' : 'Kemaskini Komuniti'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {communityUpdates.map((update, index) => {
            const IconComponent = getUpdateIcon(update.type);
            return (
              <Alert key={index} variant={update.priority === 'high' ? 'destructive' : 'default'}>
                <IconComponent className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{update.title}</p>
                      <p className="text-sm mt-1">{update.message}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                        <Clock className="h-3 w-3" />
                        {update.time}
                        <Badge variant={getPriorityColor(update.priority) as any} className="text-xs">
                          {update.priority}
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      {language === 'en' ? 'View' : 'Lihat'}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {language === 'en' ? 'Recent Activities' : 'Aktiviti Terkini'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => {
              const IconComponent = getActivityIcon(activity.type);
              return (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Badge className={getStatusColor(activity.status)}>
                    {activity.status}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* My Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {language === 'en' ? 'My Services' : 'Perkhidmatan Saya'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {myServices.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium">{service.service}</p>
                  <p className="text-xs text-muted-foreground">{service.provider}</p>
                  <p className="text-xs text-muted-foreground">
                    {service.status === 'active' 
                      ? `Next billing: ${service.nextBilling}`
                      : `Next visit: ${service.nextVisit}`
                    }
                  </p>
                </div>
                <Badge className={getStatusColor(service.status)}>
                  {service.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'en' ? 'Quick Actions' : 'Tindakan Pantas'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2 hover:shadow-md transition-shadow"
                asChild
              >
                <a href={action.action}>
                  <div className="flex items-center gap-2 w-full">
                    <action.icon className="h-5 w-5 text-primary" />
                    <span className="font-medium">{action.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    {action.description}
                  </p>
                </a>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Panic Button */}
      <PanicButton />
    </div>
  );
}