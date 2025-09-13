import PanicAlertHistory from '@/components/emergency/PanicAlertHistory';
import PanicAlertsAdminView from '@/components/emergency/PanicAlertsAdminView';
import { useAuth } from '@/contexts/AuthContext';
import { useModuleAccess } from '@/hooks/use-module-access';
import { useUserRoles } from '@/hooks/use-user-roles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle } from 'lucide-react';

export default function PanicAlerts() {
  const { language } = useAuth();
  const { isModuleEnabled, loading } = useModuleAccess();
  const { hasAnyRole } = useUserRoles();
  
  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                {language === 'en' ? 'Loading...' : 'Memuatkan...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isModuleEnabled('security')) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 space-y-6 p-6">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {language === 'en' ? 'Security Module Disabled' : 'Modul Keselamatan Dimatikan'}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  {language === 'en' 
                    ? 'The security module has been disabled by your community administrator. Panic alerts are not available.' 
                    : 'Modul keselamatan telah dimatikan oleh pentadbir komuniti anda. Amaran panik tidak tersedia.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  const isAdminView = hasAnyRole(['community_admin','district_coordinator','state_admin','security_officer']);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-6 p-6">
        {isAdminView ? (
          <PanicAlertsAdminView />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">
                {language === 'en' ? 'My Panic Alert History' : 'Sejarah Amaran Panik Saya'}
              </h1>
            </div>
            <PanicAlertHistory language={language} />
          </>
        )}
      </div>
    </div>
  );
}
