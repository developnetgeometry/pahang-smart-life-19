import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useTranslation } from '@/lib/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, AlertTriangle, CheckCircle, Building, Shield, Activity, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function DashboardStats() {
  const { user } = useSimpleAuth();
  const { t } = useTranslation('ms');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        // In demo mode, show sample stats without user filtering
        if (user.id === '11111111-1111-1111-1111-111111111111') {
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
      title: 'Tempahan Aktif',
      value: stats.bookings.toString(),
      icon: Calendar,
      description: 'Bulan ini',
      trend: 'Tempahan peribadi',
      color: 'bg-gradient-primary'
    },
    {
      title: 'Aduan Pending',
      value: stats.pendingComplaints.toString(),
      icon: AlertTriangle,
      description: 'Menunggu respons',
      trend: 'Aduan anda',
      color: 'bg-gradient-sunset'
    },
    {
      title: 'Skor Komuniti',
      value: '8.5',
      icon: TrendingUp,
      description: 'Keselamatan & kepuasan',
      trend: '+0.3 bulan ini',
      color: 'bg-gradient-community'
    },
    {
      title: 'Pengumuman',
      value: stats.announcements.toString(),
      icon: Users,
      description: 'Jumlah diterbitkan',
      trend: 'Kemas kini komuniti',
      color: 'bg-primary'
    }
  ] : [];

  const displayStats = residentStats;


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