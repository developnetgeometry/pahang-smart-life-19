import { useState } from 'react';
import { useUserRoles } from '@/hooks/use-user-roles';
import GuestPermissionsManager from '@/components/admin/GuestPermissionsManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Settings } from 'lucide-react';

export default function GuestManagement() {
  const { hasRole } = useUserRoles();

  // Only community admins and above can access guest management
  if (!hasRole('community_admin') && !hasRole('district_coordinator') && !hasRole('state_admin')) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">Access denied. Only community administrators can manage guest settings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Guest Management</h1>
        <p className="text-muted-foreground">
          Manage guest users and configure their access permissions
        </p>
      </div>

      <Tabs defaultValue="permissions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="permissions" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Permissions</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Guest Users</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="permissions">
          <GuestPermissionsManager />
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Guest Users</CardTitle>
              <CardDescription>
                View and manage guest users in your community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Guest user management will be available in a future update.
                Currently, guests are managed through the household accounts system.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}