import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoleRequestForm } from '@/components/role-management/RoleRequestForm';
import { RoleRequestsList } from '@/components/role-management/RoleRequestsList';
import { NotificationSystem } from '@/components/role-management/NotificationSystem';
import { ApprovalDashboard } from '@/components/role-management/ApprovalDashboard';
import { Shield, Users, FileText, Bell, Settings } from 'lucide-react';

export default function RoleManagement() {
  const { user, language, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('request');

  if (!user) return null;

  const canManageRoles = hasRole('admin') || hasRole('manager') || hasRole('community_admin') || hasRole('district_coordinator') || hasRole('state_admin');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {language === 'en' ? 'Role Management' : 'Pengurusan Peranan'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'en' 
            ? 'Request role changes and manage user permissions'
            : 'Mohon tukar peranan dan urus kebenaran pengguna'
          }
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="request" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>{language === 'en' ? 'New Request' : 'Permohonan Baru'}</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>{language === 'en' ? 'My Requests' : 'Permohonan Saya'}</span>
          </TabsTrigger>
          {canManageRoles && (
            <>
              <TabsTrigger value="notifications" className="flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span>{language === 'en' ? 'Notifications' : 'Notifikasi'}</span>
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>{language === 'en' ? 'Approval Dashboard' : 'Papan Pemuka Kelulusan'}</span>
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="request">
          <RoleRequestForm />
        </TabsContent>

        <TabsContent value="history">
          <RoleRequestsList />
        </TabsContent>

        {canManageRoles && (
          <>
            <TabsContent value="notifications">
              <NotificationSystem />
            </TabsContent>
            
            <TabsContent value="dashboard">
              <ApprovalDashboard />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}