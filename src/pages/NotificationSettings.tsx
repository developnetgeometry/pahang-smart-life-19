import React from 'react';
import { Header } from '@/components/layout/Header';
import { AppSidebar } from '@/components/layout/Sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import NotificationSettingsContent from '@/components/notifications/NotificationSettings';

export default function NotificationSettings() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        
        <div className="flex flex-1 flex-col">
          <header className="flex h-16 items-center border-b border-border px-4">
            <SidebarTrigger className="mr-4" />
            <Header />
          </header>
          <main className="flex-1 p-6">
            <NotificationSettingsContent />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}