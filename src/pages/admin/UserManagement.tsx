import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, Search, Filter, MoreVertical, Edit, Trash2, Shield, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  unit: string;
  role: 'resident' | 'admin' | 'security' | 'maintenance';
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
}

export default function UserManagement() {
  const { language } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<{ name: string; email: string; phone: string; unit: string; role: User['role'] | ''; status: User['status'] | '' }>({ name: '', email: '', phone: '', unit: '', role: '', status: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
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
      permissions: 'Permissions',
      userCreated: 'User created successfully!',
      userUpdated: 'User updated successfully!',
      userDeleted: 'User deleted successfully!'
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
      permissions: 'Kebenaran',
      userCreated: 'Pengguna berjaya dicipta!',
      userUpdated: 'Pengguna berjaya dikemaskini!',
      userDeleted: 'Pengguna berjaya dipadam!'
    }
  };

  const t = text[language];

  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+60123456789',
      unit: 'A-15-02',
      role: 'resident',
      status: 'active',
      joinDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Sarah Chen',
      email: 'sarah.chen@email.com',
      phone: '+60198765432',
      unit: 'B-08-01',
      role: 'admin',
      status: 'active',
      joinDate: '2024-01-10'
    },
    {
      id: '3',
      name: 'Mike Wong',
      email: 'mike.wong@email.com',
      phone: '+60187654321',
      unit: 'Security Office',
      role: 'security',
      status: 'active',
      joinDate: '2024-01-08'
    }
  ]);

  const roles = [
    { value: 'all', label: t.allRoles },
    { value: 'resident', label: t.resident },
    { value: 'admin', label: t.admin },
    { value: 'security', label: t.security },
    { value: 'maintenance', label: t.maintenance }
  ];

  const statuses = [
    { value: 'all', label: t.allStatus },
    { value: 'active', label: t.active },
    { value: 'inactive', label: t.inactive },
    { value: 'pending', label: t.pending }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'security': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'resident': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return t.admin;
      case 'security': return t.security;
      case 'maintenance': return t.maintenance;
      case 'resident': return t.resident;
      default: return role;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return t.active;
      case 'inactive': return t.inactive;
      case 'pending': return t.pending;
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

  const handleCreateUser = () => {
    if (!form.name || !form.email || !form.role || !form.status) {
      toast({ title: t.createUser, description: 'Please fill all required fields.' });
      return;
    }

    if (editingId) {
      setUsers(prev => prev.map(u => u.id === editingId ? { ...u, ...form, role: form.role as User['role'], status: form.status as User['status'] } : u));
      toast({ title: t.userUpdated });
    } else {
      const newUser: User = {
        id: String(Date.now()),
        name: form.name,
        email: form.email,
        phone: form.phone,
        unit: form.unit,
        role: form.role as User['role'],
        status: form.status as User['status'],
        joinDate: new Date().toISOString().slice(0,10)
      };
      setUsers(prev => [newUser, ...prev]);
      toast({ title: t.userCreated });
    }

    setIsCreateOpen(false);
    setEditingId(null);
    setForm({ name: '', email: '', phone: '', unit: '', role: '', status: '' });
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, phone: user.phone, unit: user.unit, role: user.role, status: user.status });
    setIsCreateOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this user?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
      toast({ title: t.userDeleted });
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
                  <Select value={form.role} onValueChange={(v) => setForm(prev => ({ ...prev, role: v as User['role'] }))}>
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
          <div className="space-y-4">
            {filteredUsers.map((user) => (
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
                    <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Shield className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(user.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}