import { useState } from 'react';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoleRequestForm } from '@/components/role-management/RoleRequestForm';
import { RoleRequestsList } from '@/components/role-management/RoleRequestsList';
import { NotificationSystem } from '@/components/role-management/NotificationSystem';
import { ApprovalDashboard } from '@/components/role-management/ApprovalDashboard';
import { AuditLogViewer } from '@/components/role-management/AuditLogViewer';
import { RoleSwitcher } from '@/components/role-management/RoleSwitcher';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, FileText, Bell, Settings, Eye, RotateCcw } from 'lucide-react';

export default function RoleManagement() {
  const { user, language, hasRoleLevel, roleInfo, roles } = useEnhancedAuth();
  const [activeTab, setActiveTab] = useState('request');

  if (!user) return null;

  const canManageRoles = hasRoleLevel(8); // Community admin level and above
  const canViewAuditLogs = hasRoleLevel(8); // Community admin level and above

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
        
        {/* Role Information and Switcher */}
        <div className="flex items-center gap-4">
          {roleInfo && (
            <div className="text-right">
              <div className="text-sm font-medium">Current Role</div>
              <Badge 
                variant="outline" 
                className="text-sm"
                style={{ 
                  backgroundColor: roleInfo.color_code + '20',
                  borderColor: roleInfo.color_code,
                  color: roleInfo.color_code 
                }}
              >
                <Shield className="h-3 w-3 mr-1" />
                {roleInfo.display_name} (Level {roleInfo.level})
              </Badge>
            </div>
          )}
          <RoleSwitcher />
        </div>
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
          {canViewAuditLogs && (
            <TabsTrigger value="audit" className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>{language === 'en' ? 'Audit Logs' : 'Log Audit'}</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="request">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {language === 'en' ? 'Role Change Request' : 'Permohonan Tukar Peranan'}
              </CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? 'Submit a request to change your role or request additional permissions'
                  : 'Hantar permohonan untuk tukar peranan atau minta kebenaran tambahan'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RoleRequestForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                {language === 'en' ? 'Request History' : 'Sejarah Permohonan'}
              </CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? 'View the status of your role change requests'
                  : 'Lihat status permohonan tukar peranan anda'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RoleRequestsList />
            </CardContent>
          </Card>
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

        {canViewAuditLogs && (
          <TabsContent value="audit">
            <AuditLogViewer />
          </TabsContent>
        )}
      </Tabs>

      {/* Role Matrix Information */}
      {hasRoleLevel(8) && (
        <Card>
          <CardHeader>
            <CardTitle>Role Hierarchy Matrix</CardTitle>
            <CardDescription>
              Understanding the 10-role hierarchical access control system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-lg font-semibold text-blue-600 mb-2">Full Access (Level 8-10)</div>
                <div className="space-y-1 text-sm">
                  <div>• State Admin (L10)</div>
                  <div>• District Coordinator (L9)</div>
                  <div>• Community Admin (L8)</div>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-lg font-semibold text-green-600 mb-2">Standard Access (Level 2-7)</div>
                <div className="space-y-1 text-sm">
                  <div>• Facility Manager (L7)</div>
                  <div>• Security Officer (L6)</div>
                  <div>• Maintenance Staff (L5)</div>
                  <div>• Service Provider (L4)</div>
                  <div>• Community Leader (L3)</div>
                  <div>• State Service Manager (L2)</div>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-lg font-semibold text-yellow-600 mb-2">Limited Access (Level 1)</div>
                <div className="space-y-1 text-sm">
                  <div>• Resident (L1)</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}