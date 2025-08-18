import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/translations';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  LayoutDashboard, 
  Clock, 
  Megaphone, 
  MessageSquare, 
  AlertTriangle,
  TrendingUp,
  Users,
  Activity
} from 'lucide-react';

const Index = () => {
  const { user, language, hasRole } = useAuth();
  const { t } = useTranslation(language || 'ms');
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  if (!user) return null;

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        // Fetch recent announcements, discussions, and complaints
        const [announcementsRes, discussionsRes, complaintsRes] = await Promise.all([
          supabase
            .from('announcements')
            .select('id, title, content, created_at, type')
            .order('created_at', { ascending: false })
            .limit(2),
          supabase
            .from('discussions')
            .select('id, title, content, created_at')
            .order('created_at', { ascending: false })
            .limit(2),
          supabase
            .from('complaints')
            .select('id, title, description, created_at, status')
            .order('created_at', { ascending: false })
            .limit(1)
        ]);

        const activities = [];

        // Add announcements
        if (announcementsRes.data) {
          activities.push(...announcementsRes.data.map((item: any) => ({
            id: `announcement-${item.id}`,
            type: 'announcement',
            title: item.title,
            description: item.content.substring(0, 80) + '...',
            time: new Date(item.created_at).toLocaleDateString('ms-MY'),
            icon: Megaphone,
            color: 'text-blue-600'
          })));
        }

        // Add discussions
        if (discussionsRes.data) {
          activities.push(...discussionsRes.data.map((item: any) => ({
            id: `discussion-${item.id}`,
            type: 'discussion',
            title: item.title,
            description: item.content.substring(0, 80) + '...',
            time: new Date(item.created_at).toLocaleDateString('ms-MY'),
            icon: MessageSquare,
            color: 'text-purple-600'
          })));
        }

        // Add complaints
        if (complaintsRes.data) {
          activities.push(...complaintsRes.data.map((item: any) => ({
            id: `complaint-${item.id}`,
            type: 'complaint',
            title: item.title,
            description: item.description.substring(0, 80) + '...',
            time: new Date(item.created_at).toLocaleDateString('ms-MY'),
            icon: AlertTriangle,
            color: item.status === 'resolved' ? 'text-green-600' : 'text-orange-600'
          })));
        }

        // Sort by most recent and take top 3
        activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setRecentActivities(activities.slice(0, 3));
      } catch (error) {
        console.error('Error fetching activities:', error);
        // Fallback to demo data if fetch fails
        setRecentActivities([
          {
            id: 1,
            type: 'announcement',
            title: language === 'en' ? 'Independence Day Celebration' : 'Sambutan Hari Kemerdekaan',
            description: language === 'en' ? 'Join our community celebration on August 31st...' : 'Sertai sambutan komuniti pada 31 Ogos...',
            time: '2 jam yang lalu',
            icon: Megaphone,
            color: 'text-blue-600'
          },
          {
            id: 2,
            type: 'discussion',
            title: language === 'en' ? 'Security Improvement Suggestions' : 'Cadangan Peningkatan Keselamatan',
            description: language === 'en' ? 'Additional lighting needed for parking area...' : 'Lampu tambahan diperlukan di kawasan parking...',
            time: '1 hari yang lalu',
            icon: MessageSquare,
            color: 'text-purple-600'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivities();
  }, [language]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t('welcomeBack')}, {user.display_name}!
            </h1>
            <p className="text-muted-foreground">
              {language === 'en' 
                ? `Here's what's happening in your community today.`
                : `Berikut adalah yang berlaku di komuniti anda hari ini.`
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-gradient-primary text-white border-none">
              {user.user_role.replace('_', ' ')}
            </Badge>
            <Badge variant="secondary">
              {user.district}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <DashboardStats />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Actions & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <QuickActions />
          
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>{t('recentActivity')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start space-x-3 p-3">
                      <div className="w-8 h-8 bg-muted animate-pulse rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted animate-pulse rounded" />
                        <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                        <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-smooth">
                        <div className={`p-2 rounded-lg bg-muted ${activity.color}`}>
                          <activity.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground">
                            {activity.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">
                        {language === 'en' ? 'No recent activities' : 'Tiada aktiviti terkini'}
                      </p>
                    </div>
                  )}
                </div>
              )}
              <div className="mt-4 pt-4 border-t">
                <Button variant="ghost" className="w-full">
                  {language === 'en' ? 'View all activities' : 'Lihat semua aktiviti'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Weather & Community Info */}
        <div className="space-y-6">
          <WeatherWidget />
          
          {/* Community Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>
                  {language === 'en' ? 'Community Health' : 'Kesihatan Komuniti'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Safety Score' : 'Skor Keselamatan'}
                  </span>
                  <span className="text-sm font-medium text-green-600">9.2/10</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full w-[92%]" />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Community Engagement' : 'Penglibatan Komuniti'}
                  </span>
                  <span className="text-sm font-medium text-blue-600">8.7/10</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full w-[87%]" />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Facility Usage' : 'Penggunaan Kemudahan'}
                  </span>
                  <span className="text-sm font-medium text-purple-600">7.8/10</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full w-[78%]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
