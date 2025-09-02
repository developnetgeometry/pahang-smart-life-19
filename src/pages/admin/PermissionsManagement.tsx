import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Shield, ShieldCheck, Users, Settings, Eye, Plus, Edit, Trash, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { EnhancedUserRole } from '@/hooks/use-user-roles';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
}

interface UserRole {
  id: string;
  role: EnhancedUserRole;
  is_active: boolean;
  assigned_at: string;
  assigned_by: string;
  district_id: string;
}

interface SystemModule {
  id: string;
  module_name: string;
  display_name: string;
  description: string;
  category: string;
  is_active: boolean;
}

interface RolePermission {
  id: string;
  role: EnhancedUserRole;
  module_id: string;
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_approve: boolean;
  module_name: string;
  display_name: string;
}

interface RoleHierarchy {
  role: EnhancedUserRole;
  level: number;
  permission_level: string;
  display_name: string;
  description: string;
  color_code: string;
}

const availableRoles: EnhancedUserRole[] = [
  'resident',
  'spouse', 
  'tenant',
  'community_leader',
  'service_provider',  
  'maintenance_staff',
  'security_officer',
  'community_admin',
  'district_coordinator',
  'state_admin',
  'state_service_manager'
];

export default function PermissionsManagement() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useAuth();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [systemModules, setSystemModules] = useState<SystemModule[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [roleHierarchy, setRoleHierarchy] = useState<RoleHierarchy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<EnhancedUserRole | ''>('');

  const text = {
    en: {
      title: 'Permissions Management',
      subtitle: 'Manage user roles and module permissions',
      userRoles: 'User Roles',
      modulePermissions: 'Module Permissions',
      addRole: 'Add Role',
      removeRole: 'Remove Role',
      active: 'Active',
      inactive: 'Inactive',
      read: 'Read',
      create: 'Create', 
      update: 'Update',
      delete: 'Delete',
      approve: 'Approve',
      module: 'Module',
      role: 'Role',
      permissions: 'Permissions',
      backToUsers: 'Back to Users',
      selectRole: 'Select Role',
      cancel: 'Cancel',
      add: 'Add',
      confirm: 'Are you sure you want to remove this role?',
      roleAdded: 'Role added successfully!',
      roleRemoved: 'Role removed successfully!',
      permissionUpdated: 'Permission updated successfully!',
      error: 'An error occurred',
      noRoles: 'No roles assigned',
      allModules: 'All Modules',
      roleHierarchy: 'Role Hierarchy'
    },
    ms: {
      title: 'Pengurusan Kebenaran',
      subtitle: 'Urus peranan pengguna dan kebenaran modul',
      userRoles: 'Peranan Pengguna',
      modulePermissions: 'Kebenaran Modul',
      addRole: 'Tambah Peranan',
      removeRole: 'Buang Peranan',
      active: 'Aktif',
      inactive: 'Tidak Aktif',
      read: 'Baca',
      create: 'Cipta',
      update: 'Kemaskini',
      delete: 'Padam',
      approve: 'Lulus',
      module: 'Modul',
      role: 'Peranan',
      permissions: 'Kebenaran',
      backToUsers: 'Kembali ke Pengguna',
      selectRole: 'Pilih Peranan',
      cancel: 'Batal',
      add: 'Tambah',
      confirm: 'Adakah anda pasti untuk membuang peranan ini?',
      roleAdded: 'Peranan berjaya ditambah!',
      roleRemoved: 'Peranan berjaya dibuang!',
      permissionUpdated: 'Kebenaran berjaya dikemaskini!',
      error: 'Ralat berlaku',
      noRoles: 'Tiada peranan diberikan',
      allModules: 'Semua Modul',
      roleHierarchy: 'Hierarki Peranan'
    }
  };

  const t = text[language];

  useEffect(() => {
    if (userId) {
      fetchUserData();
      fetchSystemModules();
      fetchRoleHierarchy();
    }
  }, [userId]);

  useEffect(() => {
    if (userRoles.length > 0) {
      fetchRolePermissions();
    }
  }, [userRoles]);

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      setUserProfile(profile);

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('enhanced_user_roles')
        .select('*')
        .eq('user_id', userId);

      if (rolesError) throw rolesError;
      
      // Filter and type-cast roles to ensure they're valid EnhancedUserRole types
      const validRoles = roles?.filter(role => 
        availableRoles.includes(role.role as EnhancedUserRole)
      ).map(role => ({
        ...role,
        role: role.role as EnhancedUserRole
      })) || [];
      
      setUserRoles(validRoles);

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: t.error,
        description: 'Failed to fetch user data',
        variant: 'destructive'
      });
    }
  };

  const fetchSystemModules = async () => {
    try {
      const { data, error } = await supabase
        .from('system_modules')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      setSystemModules(data || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const fetchRoleHierarchy = async () => {
    try {
      const { data, error } = await supabase
        .from('role_hierarchy')
        .select('*')
        .order('level', { ascending: false });

      if (error) throw error;
      
      // Filter and type-cast roles to ensure they're valid EnhancedUserRole types
      const validHierarchy = data?.filter(hierarchy => 
        availableRoles.includes(hierarchy.role as EnhancedUserRole)
      ).map(hierarchy => ({
        ...hierarchy,
        role: hierarchy.role as EnhancedUserRole
      })) || [];
      
      setRoleHierarchy(validHierarchy);
    } catch (error) {
      console.error('Error fetching role hierarchy:', error);
    }
  };

  const fetchRolePermissions = async () => {
    try {
      const rolesList = userRoles.map(r => r.role);
      
      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          *,
          system_modules (
            module_name,
            display_name
          )
        `)
        .in('role', rolesList);

      if (error) throw error;
      
      const formattedPermissions = data?.filter(permission => 
        availableRoles.includes(permission.role as EnhancedUserRole)
      ).map(permission => ({
        ...permission,
        role: permission.role as EnhancedUserRole,
        module_name: permission.system_modules?.module_name || '',
        display_name: permission.system_modules?.display_name || '',
        can_read: permission.can_read || false,
        can_create: permission.can_create || false,
        can_update: permission.can_update || false,
        can_delete: permission.can_delete || false,
        can_approve: permission.can_approve || false
      })) || [];

      setRolePermissions(formattedPermissions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      setLoading(false);
    }
  };

  const handleAddRole = async () => {
    if (!selectedRole || !userId) return;

    try {
      const { error } = await supabase
        .from('enhanced_user_roles')
        .insert({
          user_id: userId,
          role: selectedRole as EnhancedUserRole,
          assigned_by: (await supabase.auth.getUser()).data.user?.id,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: t.roleAdded,
        description: `Role ${selectedRole} added successfully`
      });

      setIsAddRoleOpen(false);
      setSelectedRole('');
      fetchUserData();
    } catch (error) {
      console.error('Error adding role:', error);
      toast({
        title: t.error,
        description: 'Failed to add role',
        variant: 'destructive'
      });
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    if (!window.confirm(t.confirm)) return;

    try {
      const { error } = await supabase
        .from('enhanced_user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: t.roleRemoved
      });

      fetchUserData();
    } catch (error) {
      console.error('Error removing role:', error);
      toast({
        title: t.error,
        description: 'Failed to remove role',
        variant: 'destructive'
      });
    }
  };

  const handleToggleRoleStatus = async (roleId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('enhanced_user_roles')
        .update({ is_active: !currentStatus })
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: 'Role status updated'
      });

      fetchUserData();
    } catch (error) {
      console.error('Error updating role status:', error);
      toast({
        title: t.error,
        description: 'Failed to update role status',
        variant: 'destructive'
      });
    }
  };

  const handlePermissionChange = async (
    role: EnhancedUserRole, 
    moduleId: string, 
    permissionType: string, 
    value: boolean
  ) => {
    try {
      // Check if permission record exists
      const existingPermission = rolePermissions.find(
        p => p.role === role && p.module_id === moduleId
      );

      if (existingPermission) {
        // Update existing permission
        const { error } = await supabase
          .from('role_permissions')
          .update({ [permissionType]: value })
          .eq('id', existingPermission.id);

        if (error) throw error;
      } else {
        // Create new permission record
        const { error } = await supabase
          .from('role_permissions')
          .insert({
            role: role as EnhancedUserRole,
            module_id: moduleId,
            [permissionType]: value,
            can_read: permissionType === 'can_read' ? value : false,
            can_create: permissionType === 'can_create' ? value : false,
            can_update: permissionType === 'can_update' ? value : false,
            can_delete: permissionType === 'can_delete' ? value : false,
            can_approve: permissionType === 'can_approve' ? value : false
          });

        if (error) throw error;
      }

      toast({
        title: t.permissionUpdated
      });

      fetchRolePermissions();
    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: t.error,
        description: 'Failed to update permission',
        variant: 'destructive'
      });
    }
  };

  const getRoleColor = (role: EnhancedUserRole) => {
    const hierarchy = roleHierarchy.find(h => h.role === role);
    return hierarchy?.color_code || '#6b7280';
  };

  const getRoleLevel = (role: EnhancedUserRole) => {
    const hierarchy = roleHierarchy.find(h => h.role === role);
    return hierarchy?.level || 0;
  };

  const getPermissionValue = (role: EnhancedUserRole, moduleId: string, permissionType: string): boolean => {
    const permission = rolePermissions.find(p => p.role === role && p.module_id === moduleId);
    return permission ? permission[permissionType as keyof RolePermission] as boolean : false;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/admin/users')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.backToUsers}
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground">
            {userProfile?.full_name} ({userProfile?.email})
          </p>
        </div>
      </div>

      {/* Role Hierarchy Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t.roleHierarchy}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roleHierarchy.map((hierarchy) => (
              <div
                key={hierarchy.role}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: hierarchy.color_code }}
                />
                <div>
                  <div className="font-medium">{hierarchy.display_name}</div>
                  <div className="text-sm text-muted-foreground">
                    Level {hierarchy.level} • {hierarchy.permission_level}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Roles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t.userRoles}
            </CardTitle>
            <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t.addRole}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t.addRole}</DialogTitle>
                  <DialogDescription>
                    Select a role to assign to this user
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t.selectRole}</Label>
                    <Select 
                      value={selectedRole} 
                      onValueChange={(value) => setSelectedRole(value as EnhancedUserRole | '')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectRole} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles
                          .filter(role => !userRoles.some(ur => ur.role === role))
                          .map((role) => (
                            <SelectItem key={role} value={role}>
                              {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddRoleOpen(false)}>
                      {t.cancel}
                    </Button>
                    <Button onClick={handleAddRole} disabled={!selectedRole}>
                      {t.add}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {userRoles.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t.noRoles}</p>
          ) : (
            <div className="space-y-4">
              {userRoles.map((userRole) => (
                <div key={userRole.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getRoleColor(userRole.role) }}
                    />
                    <div>
                      <div className="font-medium">
                        {userRole.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Level {getRoleLevel(userRole.role)} • Assigned on {new Date(userRole.assigned_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={userRole.is_active ? "default" : "secondary"}>
                      {userRole.is_active ? t.active : t.inactive}
                    </Badge>
                    <Switch
                      checked={userRole.is_active}
                      onCheckedChange={() => handleToggleRoleStatus(userRole.id, userRole.is_active)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveRole(userRole.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Module Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t.modulePermissions}
          </CardTitle>
          <CardDescription>
            Configure what each role can do in different modules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">{t.module}</th>
                  {userRoles.map((userRole) => (
                    <th key={userRole.id} className="text-center p-3 font-medium min-w-[120px]">
                      <div className="flex items-center justify-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getRoleColor(userRole.role) }}
                        />
                        {userRole.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {systemModules.map((module) => (
                  <tr key={module.id} className="border-b">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{module.display_name}</div>
                        <div className="text-sm text-muted-foreground">{module.description}</div>
                      </div>
                    </td>
                    {userRoles.map((userRole) => (
                      <td key={`${module.id}-${userRole.id}`} className="p-3">
                        <div className="space-y-2">
                          {['can_read', 'can_create', 'can_update', 'can_delete', 'can_approve'].map((permission) => (
                            <div key={permission} className="flex items-center justify-between">
                              <span className="text-xs">
                                {permission.replace('can_', '').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                              <Switch
                                checked={getPermissionValue(userRole.role, module.id, permission)}
                                onCheckedChange={(value) => 
                                  handlePermissionChange(userRole.role, module.id, permission, value)
                                }
                                disabled={!userRole.is_active}
                              />
                            </div>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}