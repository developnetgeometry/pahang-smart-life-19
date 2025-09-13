import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/use-user-roles';
import { useModuleAccess } from '@/hooks/use-module-access';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { LogOut, User, Settings } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

import { getSharedNavigationForUser } from '@/utils/navigationUtils';
import { useTranslation } from '@/lib/translations';

export function MobileSidebar() {
  const { user, logout, language, hasRole } = useAuth();
  const { userRoles } = useUserRoles();
  const moduleAccess = useModuleAccess();
  const { t } = useTranslation(language);
  const navigate = useNavigate();

  const navigation = getSharedNavigationForUser(hasRole, t, moduleAccess.isModuleEnabled);

  const handleNavClick = () => {
    // Close the sheet after navigation
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  };

  const handleLogout = () => {
    logout();
    handleNavClick();
  };

  return (
    <div className="flex flex-col h-full">
      {/* User Profile Section */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.display_name?.split(' ').map(n => n[0]).join('') || user?.email?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">
              {user?.display_name || user?.email}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {navigation.map((group) => (
            <div key={group.label} className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground px-2">
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.url}
                    to={item.url}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-foreground'
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border/50 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={() => {
            navigate('/my-profile');
            handleNavClick();
          }}
        >
          <User className="h-4 w-4" />
          Profil Saya
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={() => {
            navigate('/notification-settings');
            handleNavClick();
          }}
        >
          <Settings className="h-4 w-4" />
          Tetapan
        </Button>
        
        <Separator />
        
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Log Keluar
        </Button>
      </div>
    </div>
  );
}