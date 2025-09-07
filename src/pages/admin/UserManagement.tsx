import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, Search, Filter, MoreVertical, Edit, Trash2, Shield, ShieldCheck, Loader2, UserCheck, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  unit: string;
  role: string;
  status: 'active' | 'inactive' | 'pending' | 'approved' | 'rejected';
  joinDate: string;
  district_id: string;
}

export default function UserManagement() {
  const { language } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<{ name: string; email: string; phone: string; unit: string; role: string; status: User['status'] | '' }>({ name: '', email: '', phone: '', unit: '', role: '', status: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const text = {
    en: {
      title: 'User Management',
      subtitle: 'Manage system users and permissions',
      addUser: 'Add User',
      search: 'Search users...',
      role: 'Role',
      status: 'Status',
      allRoles: 'All Roles',
      allStatus: 'All Status',
      resident: 'Resident',
      admin: 'Administrator',
      security: 'Security',
      maintenance: 'Maintenance',
      active: 'Active',
      inactive: 'Inactive',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      unit: 'Unit',
      joinDate: 'Join Date',
      actions: 'Actions',
      createUser: 'Create New User',
      createSubtitle: 'Add a new user to the system',
      fullName: 'Full Name',
      selectRole: 'Select Role',
      selectStatus: 'Select Status',
      create: 'Create User',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      approve: 'Approve',
      reject: 'Reject',
      permissions: 'Permissions',
      userCreated: 'User created successfully!',
      userUpdated: 'User updated successfully!',
      userDeleted: 'User deleted successfully!',
      userApproved: 'User approved successfully!',
      userRejected: 'User rejected successfully!'
    },
    ms: {
      title: 'Pengurusan Pengguna',
      subtitle: 'Urus pengguna sistem dan kebenaran',
      addUser: 'Tambah Pengguna',
      search: 'Cari pengguna...',
      role: 'Peranan',
      status: 'Status',
      allRoles: 'Semua Peranan',
      allStatus: 'Semua Status',
      resident: 'Penduduk',
      admin: 'Pentadbir',
      security: 'Keselamatan',
      maintenance: 'Penyelenggaraan',
      active: 'Aktif',
      inactive: 'Tidak Aktif',
      pending: 'Menunggu',
      approved: 'Diluluskan',
      rejected: 'Ditolak',
      name: 'Nama',
      email: 'E-mel',
      phone: 'Telefon',
      unit: 'Unit',
      joinDate: 'Tarikh Sertai',
      actions: 'Tindakan',
      createUser: 'Cipta Pengguna Baru',
      createSubtitle: 'Tambah pengguna baru ke sistem',
      fullName: 'Nama Penuh',
      selectRole: 'Pilih Peranan',
      selectStatus: 'Pilih Status',
      create: 'Cipta Pengguna',
      cancel: 'Batal',
      edit: 'Edit',
      delete: 'Padam',
      approve: 'Luluskan',
      reject: 'Tolak',
      permissions: 'Kebenaran',
      userCreated: 'Pengguna berjaya dicipta!',
      userUpdated: 'Pengguna berjaya dikemaskini!',
      userDeleted: 'Pengguna berjaya dipadam!',
      userApproved: 'Pengguna berjaya diluluskan!',
      userRejected: 'Pengguna berjaya ditolak!'
    }
  };

  const t = text[language];

  // Fetch users from database
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          phone,
          unit_number,
          district_id,
          account_status,
          created_at
        `);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        toast({
          title: 'Error',
          description: 'Failed to fetch users',
          variant: 'destructive'
        });
        return;
      }

      // Get user roles separately
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
      }

      // Create a map of user roles for quick lookup
      const roleMap = new Map();
      userRoles?.forEach(ur => {
        if (!roleMap.has(ur.user_id)) {
          roleMap.set(ur.user_id, []);
        }
        roleMap.get(ur.user_id).push(ur.role);
      });

      const formattedUsers: User[] = (profiles || []).map(profile => ({
        id: profile.id,
        name: profile.full_name || 'Unknown User',
        email: profile.email || '',
        phone: profile.phone || '',
        unit: profile.unit_number || '',
        role: roleMap.get(profile.id)?.[0] || 'resident',
        status: (profile.account_status || 'active') as User['status'],
        joinDate: profile.created_at ? new Date(profile.created_at).toISOString().slice(0, 10) : '',
        district_id: profile.district_id || ''
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'all', label: t.allRoles },
    { value: 'resident', label: t.resident },
    { value: 'state_admin', label: t.admin },
    { value: 'community_admin', label: 'Community Admin' },
    { value: 'district_coordinator', label: 'District Coordinator' },
    { value: 'security_officer', label: t.security },
    { value: 'maintenance_staff', label: t.maintenance },
    { value: 'service_provider', label: 'Service Provider' },
    { value: 'community_leader', label: 'Community Leader' }
  ];

  const statuses = [
    { value: 'all', label: t.allStatus },
    { value: 'pending', label: t.pending },
    { value: 'approved', label: t.approved },
    { value: 'rejected', label: t.rejected },
    { value: 'active', label: t.active },
    { value: 'inactive', label: t.inactive }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'state_admin': return 'bg-purple-100 text-purple-800';
      case 'community_admin': return 'bg-purple-50 text-purple-700';
      case 'district_coordinator': return 'bg-indigo-100 text-indigo-800';
      case 'security_officer': return 'bg-blue-100 text-blue-800';
      case 'maintenance_staff': return 'bg-orange-100 text-orange-800';
      case 'service_provider': return 'bg-cyan-100 text-cyan-800';
      case 'community_leader': return 'bg-emerald-100 text-emerald-800';
      case 'resident': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': 
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': 
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'state_admin': return t.admin;
      case 'community_admin': return 'Community Admin';
      case 'district_coordinator': return 'District Coordinator';
      case 'security_officer': return t.security;
      case 'maintenance_staff': return t.maintenance;
      case 'service_provider': return 'Service Provider';
      case 'community_leader': return 'Community Leader';
      case 'resident': return t.resident;
      default: return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return t.active;
      case 'inactive': return t.inactive;
      case 'pending': return t.pending;
      case 'approved': return t.approved;
      case 'rejected': return t.rejected;
      default: return status;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleApproveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ account_status: 'approved' })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: t.userApproved,
        description: language === 'en' ? 'User can now login to the system' : 'Pengguna kini boleh log masuk ke sistem',
      });

      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve user',
        variant: 'destructive'
      });
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ account_status: 'rejected' })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: t.userRejected,
        description: language === 'en' ? 'User registration has been rejected' : 'Pendaftaran pengguna telah ditolak',
      });

      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject user',
        variant: 'destructive'
      });
    }
  };

  const handleCreateUser = async () => {
    if (!form.name || !form.email || !form.role || !form.status) {
      toast({ title: t.createUser, description: 'Please fill all required fields.' });
      return;
    }

    try {
      if (editingId) {
        // Update existing user
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: form.name,
            phone: form.phone,
            unit_number: form.unit,
            account_status: form.status
          })
          .eq('id', editingId);

        if (profileError) throw profileError;

        // Update user role
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: form.role as any })
          .eq('user_id', editingId);

        if (roleError) throw roleError;

        toast({ title: t.userUpdated });
      } else {
        // For new users, they would need to be created through auth signup
        toast({ 
          title: 'Info', 
          description: 'User creation requires authentication setup. Please use the proper registration flow.',
          variant: 'default'
        });
        return;
      }

      setIsCreateOpen(false);
      setEditingId(null);
      setForm({ name: '', email: '', phone: '', unit: '', role: '', status: '' });
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: 'Error',
        description: 'Failed to save user changes',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, phone: user.phone, unit: user.unit, role: user.role, status: user.status });
    setIsCreateOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this user? This action cannot be undone.')) {
      try {
        // First delete user roles
        const { error: roleError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', id);

        if (roleError) throw roleError;

        // Then delete profile
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', id);

        if (profileError) throw profileError;

        toast({ title: t.userDeleted });
        fetchUsers(); // Refresh the list
      } catch (error) {
        console.error('Error deleting user:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete user',
          variant: 'destructive'
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) { setEditingId(null); setForm({ name: '', email: '', phone: '', unit: '', role: '', status: '' }); } }}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              {t.addUser}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>{t.createUser}</DialogTitle>
              <DialogDescription>{t.createSubtitle}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t.fullName}</Label>
                <Input id="name" placeholder={t.fullName} value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t.email}</Label>
                <Input id="email" type="email" placeholder={t.email} value={form.email} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t.phone}</Label>
                <Input id="phone" placeholder={t.phone} value={form.phone} onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">{t.unit}</Label>
                <Input id="unit" placeholder={t.unit} value={form.unit} onChange={(e) => setForm(prev => ({ ...prev, unit: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">{t.role}</Label>
                  <Select value={form.role} onValueChange={(v) => setForm(prev => ({ ...prev, role: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectRole} />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.slice(1).map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">{t.status}</Label>
                  <Select value={form.status} onValueChange={(v) => setForm(prev => ({ ...prev, status: v as User['status'] }))}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectStatus} />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.slice(1).map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  {t.cancel}
                </Button>
                <Button onClick={handleCreateUser}>
                  {editingId ? t.edit : t.create}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading users...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No users found
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{user.name}</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{user.email}</p>
                          <p>{user.phone}</p>
                          <p>{t.unit}: {user.unit}</p>
                          <p>{t.joinDate}: {user.joinDate}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getRoleColor(user.role)}>
                        {getRoleText(user.role)}
                      </Badge>
                      <Badge className={getStatusColor(user.status)}>
                        {getStatusText(user.status)}
                      </Badge>
                      <div className="flex gap-1">
                        {user.status === 'pending' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleApproveUser(user.id)}
                              className="text-green-600 hover:text-green-700"
                              title={t.approve}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleRejectUser(user.id)}
                              className="text-red-600 hover:text-red-700"
                              title={t.reject}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/permissions/${user.id}`)}>
                          <Shield className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(user.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}