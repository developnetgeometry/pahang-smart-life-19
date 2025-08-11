import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  User, 
  Settings, 
  LogOut, 
  Globe, 
  Monitor, 
  Users,
  UserCheck,
  Moon,
  Sun,
  ChevronDown
} from 'lucide-react';

export function Header() {
  const { user, currentViewRole, switchViewRole, language, switchLanguage, theme, switchTheme, logout } = useAuth();
  const { t } = useTranslation(language || 'ms'); // Ensure we always have a language
  const [showRoleDialog, setShowRoleDialog] = useState(false);

  if (!user) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleViewRoleSwitch = (role: 'resident' | 'professional') => {
    switchViewRole(role);
    setShowRoleDialog(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left side - Logo */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">SC</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-foreground">
                {t('smartCommunity')}
              </h1>
              <p className="text-xs text-muted-foreground">
                {t('pahangState')}
              </p>
            </div>
          </div>
        </div>

        {/* Center - View Role Switcher */}
        <div className="flex items-center space-x-2">
          <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="hidden sm:flex items-center space-x-2">
                {currentViewRole === 'resident' ? (
                  <>
                    <User className="w-4 h-4" />
                    <span>{t('residentView')}</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>{t('professionalView')}</span>
                  </>
                )}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('switchView')}</DialogTitle>
                <DialogDescription>
                  Choose how you want to view and interact with the platform
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Button
                  variant={currentViewRole === 'resident' ? 'default' : 'outline'}
                  onClick={() => handleViewRoleSwitch('resident')}
                  className="justify-start"
                >
                  <User className="w-4 h-4 mr-2" />
                  {t('residentView')}
                </Button>
                <Button
                  variant={currentViewRole === 'professional' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => handleViewRoleSwitch('professional')}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  {t('professionalView')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center space-x-4">
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
      </div>
    </header>
  );
}