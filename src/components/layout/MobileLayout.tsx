import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MobileHeader } from './MobileHeader';
import { MobileBottomNavigation } from './MobileBottomNavigation';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20">
      <MobileHeader />
      
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 bg-transparent">
        <div className="animate-fade-in p-4 pt-6">
          {children}
        </div>
      </main>

      <MobileBottomNavigation />
    </div>
  );
}