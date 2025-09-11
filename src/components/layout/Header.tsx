import { useAuth } from '@/contexts/AuthContext';
import EnhancedNotificationBell from '@/components/communication/EnhancedNotificationBell';
import { useTranslation } from '@/lib/translations';
import { useUserRoles } from '@/hooks/use-user-roles';
import { GuestIndicator } from '@/components/ui/guest-indicator';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  User, 
  Settings, 
  LogOut, 
  Globe, 
  Moon,
  Sun
} from 'lucide-react';

import React from 'react';

export const Header = React.memo(() => {
  const { user, language, switchLanguage, theme, switchTheme, logout, roles } = useAuth();
  const { t } = useTranslation(language || 'ms');
  const navigate = useNavigate();

  // Memoized primary role calculation using roles from auth context
  const primaryRole = React.useMemo(() => {
    const roleHierarchy = [
      'state_admin',
      'spouse',
      'district_coordinator', 
      'community_admin',
      'state_service_manager',
      'facility_manager',
      'security_officer',
      'maintenance_staff',
      'service_provider',
      'community_leader',
      'resident',
      'tenant',
      'guest'
    ];
    
    for (const role of roleHierarchy) {
      if (roles.includes(role as any)) {
        return role;
      }
    }
    return 'resident';
  }, [roles]);

  if (!user) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="flex items-center space-x-4 ml-auto">
      {/* Language Switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Globe className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="z-50">
          <DropdownMenuLabel>Language / Bahasa</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => switchLanguage('en')}>
            {language === 'en' && '✓ '}{t('english')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => switchLanguage('ms')}>
            {language === 'ms' && '✓ '}{t('malay')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Theme Switcher */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => switchTheme(theme === 'light' ? 'dark' : 'light')}
      >
        {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      </Button>

      {/* Guest Indicator */}
      <GuestIndicator />

      {/* Notifications */}
      <EnhancedNotificationBell />

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                {getInitials(user.display_name)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 z-50" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.display_name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
              <div className="flex space-x-1 pt-1">
                <Badge variant="secondary" className="text-xs">
                  {user.community || '—'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {primaryRole.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/my-profile')}>
            <User className="mr-2 h-4 w-4" />
            <span>{t('profileTitle')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/notification-settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>{t('settings')}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t('logout')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});

Header.displayName = 'Header';