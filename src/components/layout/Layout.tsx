import { useAuth } from '@/contexts/AuthContext';
import { Header } from './Header';
import { AppSidebar } from './Sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useView } from '@/contexts/ViewContext';
import { MobileLayout } from './MobileLayout';
import { TooltipProvider } from '@/components/ui/tooltip';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuth();
  const { viewMode } = useView();

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Use different layouts for mobile vs desktop
  if (viewMode === 'mobile') {
    return <MobileLayout>{children}</MobileLayout>;
  }

  // Desktop layout with sidebar  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20">
        <AppSidebar />
        
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-16 items-center border-b border-border/50 px-4 bg-card/80 backdrop-blur-lg shadow-elegant supports-[backdrop-filter]:bg-card/60">
            <SidebarTrigger className="mr-4" />
            <Header />
          </header>
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 bg-transparent">
            <div className="animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}