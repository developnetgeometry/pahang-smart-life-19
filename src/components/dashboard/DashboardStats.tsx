import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, AlertTriangle, CheckCircle, Building, Shield, Activity, TrendingUp } from 'lucide-react';

export function DashboardStats() {
  const { language, hasRole } = useAuth();
  const { t } = useTranslation(language);

  const residentStats = [
    {
      title: language === 'en' ? 'Active Bookings' : 'Tempahan Aktif',
      value: '3',
      icon: Calendar,
      description: language === 'en' ? 'This month' : 'Bulan ini',
      trend: '+2 from last month',
      color: 'bg-gradient-primary'
    },
    {
      title: language === 'en' ? 'Pending Complaints' : 'Aduan Pending',
      value: '1',
      icon: AlertTriangle,
      description: language === 'en' ? 'Awaiting response' : 'Menunggu respons',
      trend: '-1 from last week',
      color: 'bg-gradient-sunset'
    },
    {
      title: language === 'en' ? 'Community Score' : 'Skor Komuniti',
      value: '8.5',
      icon: TrendingUp,
      description: language === 'en' ? 'Safety & satisfaction' : 'Keselamatan & kepuasan',
      trend: '+0.3 this month',
      color: 'bg-gradient-community'
    },
    {
      title: language === 'en' ? 'Announcements' : 'Pengumuman',
      value: '5',
      icon: Users,
      description: language === 'en' ? 'Unread messages' : 'Mesej belum dibaca',
      trend: '2 new today',
      color: 'bg-primary'
    }
  ];

  const professionalStats = [
    {
      title: language === 'en' ? 'Total Residents' : 'Jumlah Penduduk',
      value: '1,247',
      icon: Users,
      description: language === 'en' ? 'Active users' : 'Pengguna aktif',
      trend: '+12 this month',
      color: 'bg-gradient-primary'
    },
    {
      title: language === 'en' ? 'Open Complaints' : 'Aduan Terbuka',
      value: '23',
      icon: AlertTriangle,
      description: language === 'en' ? 'Requires attention' : 'Memerlukan perhatian',
      trend: '-5 from last week',
      color: 'bg-gradient-sunset'
    },
    {
      title: language === 'en' ? 'Facilities Utilization' : 'Penggunaan Kemudahan',
      value: '78%',
      icon: Building,
      description: language === 'en' ? 'This month' : 'Bulan ini',
      trend: '+15% from last month',
      color: 'bg-gradient-community'
    },
    {
      title: language === 'en' ? 'Security Incidents' : 'Insiden Keselamatan',
      value: '2',
      icon: Shield,
      description: language === 'en' ? 'This week' : 'Minggu ini',
      trend: '-3 from last week',
      color: 'bg-primary'
    }
  ];

  // Show resident stats by default, professional stats for admin roles
  const showProfessionalStats = hasRole('state_admin') || hasRole('district_coordinator') || 
                                hasRole('community_admin') || hasRole('security_officer') || 
                                hasRole('facility_manager') || hasRole('maintenance_staff') ||
                                hasRole('state_service_manager');
  
  const stats = showProfessionalStats ? professionalStats : residentStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden hover:shadow-elegant transition-spring group">
          <div className={`absolute top-0 left-0 w-1 h-full ${stat.color}`} />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.color} group-hover:shadow-glow transition-spring`}>
              <stat.icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
            {stat.trend && (
              <Badge variant="secondary" className="text-xs">
                {stat.trend}
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}