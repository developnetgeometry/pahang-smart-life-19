import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { useTranslation } from '@/lib/translations';
import { NavLink, useLocation } from 'react-router-dom';
import { EnhancedNavigation } from '@/components/enhanced/EnhancedNavigation';
import { ScrollArea } from '@/components/ui/scroll-area';

export function AppSidebar() {
  const { language } = useEnhancedAuth();
  const { t } = useTranslation((language as 'en' | 'ms') || 'ms');

  return (
    <div className="flex h-full w-full flex-col bg-card border-r border-border">
      {/* Logo section */}
      <div className="flex h-16 items-center border-b border-border px-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">SC</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">Smart Community</span>
            <span className="text-xs text-muted-foreground">Pahang</span>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation */}
      <ScrollArea className="flex-1 px-3">
        <div className="py-4">
          <EnhancedNavigation />
        </div>
      </ScrollArea>
    </div>
  );
}