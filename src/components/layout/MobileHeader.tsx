import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, Bell } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MobileSidebar } from './MobileSidebar';
import OptimizedNotificationBell from '@/components/communication/OptimizedNotificationBell';

export function MobileHeader() {
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between px-4 bg-card/80 backdrop-blur-lg shadow-elegant border-b border-border/50 supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
      {/* Left: Menu Button */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <MobileSidebar />
        </SheetContent>
      </Sheet>

      {/* Center: Logo/Title */}
      <div className="flex-1 text-center">
        <h1 className="text-lg font-semibold text-foreground truncate">
          Smart Community
        </h1>
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-2">
        <OptimizedNotificationBell />
        
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {user?.display_name?.split(' ').map(n => n[0]).join('') || user?.email?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}