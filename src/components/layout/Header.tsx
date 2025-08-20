import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from '@/components/notifications/NotificationBell';
import { useTranslation } from '@/lib/translations';
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

export function Header() {
  const { user, language, switchLanguage, theme, switchTheme, logout } = useAuth();
  const { t } = useTranslation(language || 'ms');

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

      {/* Notifications */}
      <NotificationBell />

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
                  {user.district}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {user.user_role}
                </Badge>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>{t('profileTitle')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
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
}