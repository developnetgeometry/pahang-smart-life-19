import { useAuth } from '@/contexts/AuthContext';
import { Header } from './Header';
import { AppSidebar } from './Sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}