import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUserRoles } from '@/hooks/use-user-roles';
import { 
  Home, 
  MessageSquare, 
  Calendar, 
  ShoppingBag, 
  Users 
} from 'lucide-react';

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function MobileBottomNavigation() {
  const { userRoles } = useUserRoles();

  // Define core navigation items that work for most users
  const navigationItems: NavItem[] = [
    {
      title: 'Utama',
      url: '/',
      icon: Home
    },
    {
      title: 'Komunikasi',
      url: '/communication',
      icon: MessageSquare
    },
    {
      title: 'Acara',
      url: '/events',
      icon: Calendar
    },
    {
      title: 'Pasar',
      url: '/marketplace',
      icon: ShoppingBag
    },
    {
      title: 'Direktori',
      url: '/directory',
      icon: Users
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border/50 supports-[backdrop-filter]:bg-card/80">
      <div className="grid grid-cols-5 h-16">
        {navigationItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium truncate">{item.title}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}