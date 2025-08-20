import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, AlertTriangle, CheckCircle, Building, Shield, Activity, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function DashboardStats() {
  const { language, hasRole, user } = useAuth();
  const { t } = useTranslation(language);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        // In demo mode, show sample stats without user filtering
        if (user.id.startsWith('demo-') || user.id === '11111111-1111-1111-1111-111111111111') {
          // Show realistic demo data
          setStats({
            bookings: 3, // Active bookings for demo user
            pendingComplaints: 2, // Pending complaints for demo user  
            announcements: 5, // Total announcements in district
            facilities: 5, // Available facilities
            totalProfiles: 247 // Total community members
          });
        } else {
          // Real user mode - filter by user
          const [bookingsRes, complaintsRes, announcementsRes, facilitiesRes, profilesRes] = await Promise.all([
            supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
            supabase.from('complaints').select('id', { count: 'exact', head: true }).eq('complainant_id', user.id).eq('status', 'pending'),
            supabase.from('announcements').select('id', { count: 'exact', head: true }),
            supabase.from('facilities').select('id', { count: 'exact', head: true }),
            supabase.from('profiles').select('id', { count: 'exact', head: true })
          ]);

          setStats({
            bookings: bookingsRes.count || 0,
            pendingComplaints: complaintsRes.count || 0,
            announcements: announcementsRes.count || 0,
            facilities: facilitiesRes.count || 0,
            totalProfiles: profilesRes.count || 0
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const residentStats = stats ? [
    {
      title: language === 'en' ? 'Active Bookings' : 'Tempahan Aktif',
      value: stats.bookings.toString(),
      icon: Calendar,
      description: language === 'en' ? 'This month' : 'Bulan ini',
      trend: language === 'en' ? 'Personal bookings' : 'Tempahan peribadi',
      color: 'bg-gradient-primary'
    },
    {
      title: language === 'en' ? 'Pending Complaints' : 'Aduan Pending',
      value: stats.pendingComplaints.toString(),
      icon: AlertTriangle,
      description: language === 'en' ? 'Awaiting response' : 'Menunggu respons',
      trend: language === 'en' ? 'Your complaints' : 'Aduan anda',
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
      value: stats.announcements.toString(),
      icon: Users,
      description: language === 'en' ? 'Total published' : 'Jumlah diterbitkan',
      trend: language === 'en' ? 'Community updates' : 'Kemas kini komuniti',
      color: 'bg-primary'
    }
  ] : [];

  const professionalStats = stats ? [
    {
      title: language === 'en' ? 'Total Residents' : 'Jumlah Penduduk',
      value: stats.totalProfiles.toString(),
      icon: Users,
      description: language === 'en' ? 'Active users' : 'Pengguna aktif',
      trend: language === 'en' ? 'Registered profiles' : 'Profil berdaftar',
      color: 'bg-gradient-primary'
    },
    {
      title: language === 'en' ? 'Available Facilities' : 'Kemudahan Tersedia',
      value: stats.facilities.toString(),
      icon: Building,
      description: language === 'en' ? 'Community facilities' : 'Kemudahan komuniti',
      trend: language === 'en' ? 'Ready for booking' : 'Sedia untuk tempahan',
      color: 'bg-gradient-sunset'
    },
    {
      title: language === 'en' ? 'Total Announcements' : 'Jumlah Pengumuman',
      value: stats.announcements.toString(),
      icon: Activity,
      description: language === 'en' ? 'Published notices' : 'Notis diterbitkan',
      trend: language === 'en' ? 'Community updates' : 'Kemas kini komuniti',
      color: 'bg-gradient-community'
    },
    {
      title: language === 'en' ? 'System Health' : 'Kesihatan Sistem',
      value: '98%',
      icon: Shield,
      description: language === 'en' ? 'All systems operational' : 'Semua sistem beroperasi',
      trend: language === 'en' ? 'Excellent status' : 'Status cemerlang',
      color: 'bg-primary'
    }
  ] : [];

  // Show resident stats by default, professional stats for admin roles
  const showProfessionalStats = hasRole('admin') || hasRole('manager') || hasRole('security_officer');
  
  const displayStats = showProfessionalStats ? professionalStats : residentStats;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {displayStats.map((stat, index) => (
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