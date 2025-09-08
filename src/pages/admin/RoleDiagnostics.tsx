import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Users, Database, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from '@/hooks/use-user-roles';
import { toast } from '@/hooks/use-toast';

interface RoleDiagnostic {
  user_id: string;
  email: string;
  full_name: string;
  legacy_roles: string[];
  enhanced_roles: string[];
  account_status: string;
  issues: string[];
}

interface SystemStats {
  total_users: number;
  users_with_enhanced_roles: number;
  users_with_legacy_roles_only: number;
  orphaned_roles: number;
}

export default function RoleDiagnostics() {
  const { hasAnyRole } = useUserRoles();
  const [diagnostics, setDiagnostics] = useState<RoleDiagnostic[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Only allow admins to access this page
  if (!hasAnyRole(['state_admin', 'district_coordinator', 'community_admin'])) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-destructive">
              <XCircle className="w-5 h-5" />
              <span>Access Denied</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>You don't have permission to access role diagnostics.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fetchDiagnostics = async () => {
    setLoading(true);
    try {
      // Get comprehensive role diagnostics
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          account_status
        `);

      if (usersError) throw usersError;

      // Get legacy roles
      const { data: legacyRoles, error: legacyError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (legacyError) throw legacyError;

      // Get enhanced roles
      const { data: enhancedRoles, error: enhancedError } = await supabase
        .from('enhanced_user_roles')
        .select('user_id, role, is_active')
        .eq('is_active', true);

      if (enhancedError) throw enhancedError;

      // Process diagnostics
      const diagnosticResults: RoleDiagnostic[] = users?.map(user => {
        const userLegacyRoles = legacyRoles?.filter(r => r.user_id === user.id).map(r => r.role) || [];
        const userEnhancedRoles = enhancedRoles?.filter(r => r.user_id === user.id).map(r => r.role) || [];
        
        const issues: string[] = [];
        
        // Check for various issues
        if (userLegacyRoles.length > 0 && userEnhancedRoles.length === 0) {
          issues.push('Has legacy roles but no enhanced roles');
        }
        if (userEnhancedRoles.length === 0) {
          issues.push('No enhanced roles assigned');
        }
        if (userLegacyRoles.includes('community_admin') || userLegacyRoles.includes('facility_manager')) {
          issues.push('Has unmapped legacy community_admin/facility_manager roles');
        }
        if (user.account_status !== 'approved') {
          issues.push(`Account status: ${user.account_status}`);
        }

        return {
          user_id: user.id,
          email: user.email || '',
          full_name: user.full_name || '',
          legacy_roles: userLegacyRoles,
          enhanced_roles: userEnhancedRoles,
          account_status: user.account_status || 'unknown',
          issues
        };
      }) || [];

      // Calculate stats
      const systemStats: SystemStats = {
        total_users: users?.length || 0,
        users_with_enhanced_roles: diagnosticResults.filter(d => d.enhanced_roles.length > 0).length,
        users_with_legacy_roles_only: diagnosticResults.filter(d => d.legacy_roles.length > 0 && d.enhanced_roles.length === 0).length,
        orphaned_roles: diagnosticResults.filter(d => d.issues.length > 0).length
      };

      setDiagnostics(diagnosticResults);
      setStats(systemStats);
    } catch (error) {
      console.error('Error fetching diagnostics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch role diagnostics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fixUserRoles = async (userId: string) => {
    try {
      // Add default resident role if user has no enhanced roles
      const { error } = await supabase
        .from('enhanced_user_roles')
        .insert({
          user_id: userId,
          role: 'resident',
          assigned_by: userId,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Added default resident role",
      });

      fetchDiagnostics(); // Refresh data
    } catch (error) {
      console.error('Error fixing user roles:', error);
      toast({
        title: "Error",
        description: "Failed to fix user roles",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  const issueUsers = diagnostics.filter(d => d.issues.length > 0);
  const healthyUsers = diagnostics.filter(d => d.issues.length === 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Role System Diagnostics</h1>
          <p className="text-muted-foreground">Monitor and fix role system issues</p>
        </div>
        <Button onClick={fetchDiagnostics} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Enhanced Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats?.users_with_enhanced_roles || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Legacy Only</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats?.users_with_legacy_roles_only || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Issues Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats?.orphaned_roles || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Diagnostics */}
      <Tabs defaultValue="issues" className="space-y-4">
        <TabsList>
          <TabsTrigger value="issues" className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Issues ({issueUsers.length})</span>
          </TabsTrigger>
          <TabsTrigger value="healthy" className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Healthy ({healthyUsers.length})</span>
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>All Users ({diagnostics.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="space-y-4">
          {issueUsers.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p>No role issues found!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            issueUsers.map(user => (
              <Card key={user.user_id} className="border-destructive/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{user.full_name || user.email}</CardTitle>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Button
                      onClick={() => fixUserRoles(user.user_id)}
                      size="sm"
                      variant="outline"
                    >
                      Fix Roles
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {user.enhanced_roles.map(role => (
                      <Badge key={role} variant="default">{role}</Badge>
                    ))}
                    {user.legacy_roles.map(role => (
                      <Badge key={role} variant="secondary">Legacy: {role}</Badge>
                    ))}
                  </div>
                  <div className="space-y-1">
                    {user.issues.map((issue, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm text-destructive">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="healthy" className="space-y-4">
          {healthyUsers.map(user => (
            <Card key={user.user_id} className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">{user.full_name || user.email}</CardTitle>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user.enhanced_roles.map(role => (
                    <Badge key={role} variant="default">{role}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {diagnostics.map(user => (
            <Card key={user.user_id} className={user.issues.length > 0 ? "border-destructive/20" : "border-primary/20"}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{user.full_name || user.email}</CardTitle>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  {user.issues.length > 0 && (
                    <Button
                      onClick={() => fixUserRoles(user.user_id)}
                      size="sm"
                      variant="outline"
                    >
                      Fix Roles
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {user.enhanced_roles.map(role => (
                    <Badge key={role} variant="default">{role}</Badge>
                  ))}
                  {user.legacy_roles.map(role => (
                    <Badge key={role} variant="secondary">Legacy: {role}</Badge>
                  ))}
                </div>
                {user.issues.length > 0 && (
                  <div className="space-y-1">
                    {user.issues.map((issue, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm text-destructive">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}