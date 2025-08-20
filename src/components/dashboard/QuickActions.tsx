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
  const { user } = useEnhancedAuth();
  const { t } = useTranslation('ms');
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Tempah Kemudahan',
      description: 'Tempah kemudahan komuniti',
      icon: Calendar,
      color: 'bg-gradient-primary',
      href: '/facilities'
    },
    {
      title: 'Lapor Masalah',
      description: 'Hantar permintaan penyelenggaraan',
      icon: FileText,
      color: 'bg-gradient-sunset',
      href: '/my-complaints'
    },
    {
      title: 'Daftar Pelawat',
      description: 'Pra-daftar tetamu anda',
      icon: UserPlus,
      color: 'bg-gradient-community',
      href: '/my-visitors'
    },
    {
      title: 'Amaran Kecemasan',
      description: 'Akses pantas kepada bantuan',
      icon: AlertTriangle,
      color: 'bg-destructive',
      href: '#emergency'
    }
  ];


  const handleEmergencyAlert = () => {
    // In a real app, this would trigger emergency protocols
    alert('Amaran kecemasan dihantar! Kakitangan keselamatan telah dimaklumkan.');
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