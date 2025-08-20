import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { useTranslation } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  UserPlus, 
  FileText, 
  AlertTriangle, 
  Megaphone, 
  Settings,
  Building,
  Camera,
  Shield,
  Activity
} from 'lucide-react';

export function QuickActions() {
  const { language, hasRole } = useEnhancedAuth();
  const { t } = useTranslation((language as 'en' | 'ms') || 'ms');
  const navigate = useNavigate();

  const residentActions = [
    {
      title: language === 'en' ? 'Book Facility' : 'Tempah Kemudahan',
      description: language === 'en' ? 'Reserve community facilities' : 'Tempah kemudahan komuniti',
      icon: Calendar,
      color: 'bg-gradient-primary',
      href: '/facilities'
    },
    {
      title: language === 'en' ? 'Report Issue' : 'Lapor Masalah',
      description: language === 'en' ? 'Submit maintenance request' : 'Hantar permintaan penyelenggaraan',
      icon: FileText,
      color: 'bg-gradient-sunset',
      href: '/my-complaints'
    },
    {
      title: language === 'en' ? 'Register Visitor' : 'Daftar Pelawat',
      description: language === 'en' ? 'Pre-register your guests' : 'Pra-daftar tetamu anda',
      icon: UserPlus,
      color: 'bg-gradient-community',
      href: '/my-visitors'
    },
    {
      title: language === 'en' ? 'Emergency Alert' : 'Amaran Kecemasan',
      description: language === 'en' ? 'Quick access to help' : 'Akses pantas kepada bantuan',
      icon: AlertTriangle,
      color: 'bg-destructive',
      href: '#emergency'
    }
  ];

  const professionalActions = [
    {
      title: language === 'en' ? 'Create Announcement' : 'Cipta Pengumuman',
      description: language === 'en' ? 'Broadcast to community' : 'Siarkan kepada komuniti',
      icon: Megaphone,
      color: 'bg-gradient-primary',
      href: '/admin/announcements'
    },
    {
      title: language === 'en' ? 'Manage Facilities' : 'Urus Kemudahan',
      description: language === 'en' ? 'Update facility status' : 'Kemas kini status kemudahan',
      icon: Building,
      color: 'bg-gradient-community',
      href: '/admin/facilities'
    },
    {
      title: language === 'en' ? 'Security Dashboard' : 'Papan Pemuka Keselamatan',
      description: language === 'en' ? 'Monitor CCTV & alerts' : 'Pantau CCTV & amaran',
      icon: Shield,
      color: 'bg-gradient-sunset',
      href: '/admin/security'
    },
    {
      title: language === 'en' ? 'System Settings' : 'Tetapan Sistem',
      description: language === 'en' ? 'Configure platform' : 'Konfigur platform',
      icon: Settings,
      color: 'bg-primary',
      href: '/admin/settings'
    }
  ];

  // Show resident actions by default, professional actions for admin roles
  const showProfessionalActions = hasRole('state_admin') || hasRole('community_admin') || hasRole('facility_manager') || hasRole('security_officer');
  
  const actions = showProfessionalActions ? professionalActions : residentActions;

  const handleEmergencyAlert = () => {
    // In a real app, this would trigger emergency protocols
    alert(language === 'en' 
      ? 'Emergency alert sent! Security personnel have been notified.' 
      : 'Amaran kecemasan dihantar! Kakitangan keselamatan telah dimaklumkan.'
    );
  };

  const handleActionClick = (action: any) => {
    if (action.href === '#emergency') {
      handleEmergencyAlert();
    } else {
      navigate(action.href);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="w-5 h-5" />
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className="h-auto p-4 justify-start text-left hover:shadow-community transition-spring group"
              onClick={() => handleActionClick(action)}
            >
              <div className="flex items-start space-x-3 w-full">
                <div className={`p-2 rounded-lg ${action.color} group-hover:shadow-glow transition-spring flex-shrink-0`}>
                  <action.icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground group-hover:text-primary transition-smooth">
                    {action.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}