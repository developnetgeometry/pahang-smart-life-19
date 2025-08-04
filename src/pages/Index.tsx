import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/translations';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  const { user, currentViewRole, language } = useAuth();
  const { t } = useTranslation(language);

  if (!user) return null;

  const recentActivities = [
    {
      id: 1,
      type: 'booking',
      title: language === 'en' ? 'Facility booking confirmed' : 'Tempahan kemudahan disahkan',
      description: language === 'en' ? 'Swimming pool - Tomorrow 2:00 PM' : 'Kolam renang - Esok 2:00 PM',
      time: '2 hours ago',
      icon: Clock,
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'announcement',
      title: language === 'en' ? 'New community announcement' : 'Pengumuman komuniti baru',
      description: language === 'en' ? 'Maintenance schedule update' : 'Kemas kini jadual penyelenggaraan',
      time: '5 hours ago',
      icon: Megaphone,
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'discussion',
      title: language === 'en' ? 'New discussion reply' : 'Balasan perbincangan baru',
      description: language === 'en' ? 'Community garden project' : 'Projek taman komuniti',
      time: '1 day ago',
      icon: MessageSquare,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t('dashboard.welcome')}, {user.display_name}!
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
              {currentViewRole === 'resident' ? t('viewRole.resident') : t('viewRole.professional')}
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
                <span>{t('dashboard.recentActivity')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
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
                ))}
              </div>
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
