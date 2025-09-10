import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Users, UserPlus, Search, Filter, MoreVertical, Edit, Trash2, Shield, ShieldCheck, Loader2, UserCheck, UserX, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useModuleAccess } from '@/hooks/use-module-access';

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

interface HouseholdAccount {
  id: string;
  linked_user_id: string;
  relationship_type: string;
  permissions: {
    marketplace: boolean;
    bookings: boolean;
    announcements: boolean;
    complaints: boolean;
    discussions: boolean;
  };
  is_active: boolean;
  created_at: string;
  profiles: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
  };
}

interface TenantFormData {
  tenant_name: string;
  tenant_email: string;
  tenant_phone: string;
  permissions: {
    marketplace: boolean;
    bookings: boolean;
    announcements: boolean;
    complaints: boolean;
    discussions: boolean;
    panic_button: boolean;
  };
}

export default function UserManagement() {
  const { language, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isModuleEnabled } = useModuleAccess();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<{ 
    name: string; 
    email: string; 
    phone: string; 
    unit: string; 
    role: string; 
    status: User['status'] | '';
    password: string;
    confirmPassword: string;
    // Role-specific fields
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    shiftType?: string;
    badgeId?: string;
    yearsExperience?: string;
    certificationsText?: string;
    vehicleNumber?: string;
    familySize?: number;
    specialization?: string;
  }>({ 
    name: '', 
    email: '', 
    phone: '', 
    unit: '', 
    role: '', 
    status: '',
    password: '',
    confirmPassword: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    shiftType: '',
    badgeId: '',
    yearsExperience: '',
    certificationsText: '',
    vehicleNumber: '',
    familySize: 1,
    specialization: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // User details sheet states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [householdAccounts, setHouseholdAccounts] = useState<HouseholdAccount[]>([]);
  const [isLoadingHousehold, setIsLoadingHousehold] = useState(false);

  // Add tenant states
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [isCreatingTenant, setIsCreatingTenant] = useState(false);
  const [tenantForm, setTenantForm] = useState<TenantFormData>({
    tenant_name: '',
    tenant_email: '',
    tenant_phone: '',
    permissions: {
      marketplace: true,
      bookings: true,
      announcements: true,
      complaints: true,
      discussions: true,
      panic_button: true,
    },
  });

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
      password: 'Password',
      confirmPassword: 'Confirm Password',
      passwordMismatch: 'Passwords do not match',
      passwordRequired: 'Password is required for new users',
      userCreated: 'User created successfully!',
      userUpdated: 'User updated successfully!',
      userDeleted: 'User deleted successfully!',
      userApproved: 'User approved successfully!',
      userRejected: 'User rejected successfully!',
      // User details and tenant management
      userDetails: 'User Details',
      householdMembers: 'Household Members',
      addTenant: 'Add Tenant',
      tenantName: 'Tenant Name',
      tenantEmail: 'Tenant Email',
      tenantPhone: 'Tenant Phone',
      tenantPermissions: 'Tenant Permissions',
      marketplace: 'Marketplace',
      bookings: 'Bookings',
      announcements: 'Announcements',
      complaints: 'Complaints',
      discussions: 'Discussions',
      createTenant: 'Create Tenant',
      tenantCreated: 'Tenant account created successfully!',
      noHouseholdMembers: 'No household members found.',
      // Role-specific fields
      familySize: 'Family Size',
      vehicleNumber: 'Vehicle Number',
      emergencyContactName: 'Emergency Contact Name',
      emergencyContactPhone: 'Emergency Contact Phone',
      securityLicenseNumber: 'Security License Number',
      badgeId: 'Badge ID',
      shiftType: 'Shift Type',
      specialization: 'Specialization',
      yearsExperience: 'Years of Experience',
      certificationsText: 'Certifications'
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
      password: 'Kata Laluan',
      confirmPassword: 'Sahkan Kata Laluan',
      passwordMismatch: 'Kata laluan tidak sepadan',
      passwordRequired: 'Kata laluan diperlukan untuk pengguna baru',
      userCreated: 'Pengguna berjaya dicipta!',
      userUpdated: 'Pengguna berjaya dikemaskini!',
      userDeleted: 'Pengguna berjaya dipadam!',
      userApproved: 'Pengguna berjaya diluluskan!',
      userRejected: 'Pengguna berjaya ditolak!',
      // User details and tenant management
      userDetails: 'Butiran Pengguna',
      householdMembers: 'Ahli Rumah',
      addTenant: 'Tambah Penyewa',
      tenantName: 'Nama Penyewa',
      tenantEmail: 'E-mel Penyewa',
      tenantPhone: 'Telefon Penyewa',
      tenantPermissions: 'Kebenaran Penyewa',
      marketplace: 'Pasar',
      bookings: 'Tempahan',
      announcements: 'Pengumuman',
      complaints: 'Aduan',
      discussions: 'Perbincangan',
      createTenant: 'Cipta Penyewa',
      tenantCreated: 'Akaun penyewa berjaya dicipta!',
      noHouseholdMembers: 'Tiada ahli rumah dijumpai.',
      // Role-specific fields
      familySize: 'Saiz Keluarga',
      vehicleNumber: 'Nombor Kenderaan',
      emergencyContactName: 'Nama Hubungan Kecemasan',
      emergencyContactPhone: 'Telefon Hubungan Kecemasan',
      securityLicenseNumber: 'Nombor Lesen Keselamatan',
      badgeId: 'ID Lencana',
      shiftType: 'Jenis Syif',
      specialization: 'Kepakaran',
      yearsExperience: 'Tahun Pengalaman',
      certificationsText: 'Sijil-sijil'
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
        .from('enhanced_user_roles')
        .select('user_id, role')
        .eq('is_active', true);

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
        status: (profile.account_status || 'pending') as User['status'],
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
    ...(isModuleEnabled('security') ? [{ value: 'security_officer', label: t.security }] : []),
    ...(isModuleEnabled('facilities') ? [
      { value: 'facility_manager', label: 'Facility Manager' },
      { value: 'maintenance_staff', label: t.maintenance }
    ] : [])
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

      await fetchUsers(); // Refresh the user list
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

  // Reset role-specific fields when role changes
  const handleRoleChange = (newRole: string) => {
    setForm(prev => ({
      ...prev,
      role: newRole,
      unit: newRole === 'resident' ? prev.unit : '',
      // Reset all role-specific fields
      emergencyContactName: '',
      emergencyContactPhone: '',
      shiftType: '',
      badgeId: '',
      yearsExperience: '',
      certificationsText: '',
      vehicleNumber: '',
      familySize: 1,
      specialization: ''
    }));
  };

  const handleCreateUser = async () => {
    if (!form.name || !form.email || !form.role) {
      toast({ title: t.createUser, description: 'Please fill all required fields.' });
      return;
    }

    // Check if the selected role is allowed based on enabled modules
    if (form.role === 'security_officer' && !isModuleEnabled('security')) {
      toast({ 
        title: 'Error', 
        description: 'Security module is disabled. Cannot create Security Officer accounts.',
        variant: 'destructive' 
      });
      return;
    }

    if ((form.role === 'facility_manager' || form.role === 'maintenance_staff') && !isModuleEnabled('facilities')) {
      toast({ 
        title: 'Error', 
        description: 'Facilities module is disabled. Cannot create Facility Manager or Maintenance Staff accounts.',
        variant: 'destructive' 
      });
      return;
    }

    // For residents, no password or status required (handled by invite flow)
    // For other roles, password validation is still required
    if (!editingId && form.role !== 'resident') {
      if (!form.password) {
        toast({ title: 'Error', description: t.passwordRequired, variant: 'destructive' });
        return;
      }
      if (form.password !== form.confirmPassword) {
        toast({ title: 'Error', description: t.passwordMismatch, variant: 'destructive' });
        return;
      }
      if (form.password.length < 6) {
        toast({ title: 'Error', description: 'Password must be at least 6 characters long', variant: 'destructive' });
        return;
      }
    }

    // For non-residents, status is required
    if (form.role !== 'resident' && !form.status) {
      toast({ title: t.createUser, description: 'Please select account status.' });
      return;
    }

    try {
      setCreating(true);
      
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

        // Update user role - use upsert to handle existing roles
        const { error: roleError } = await supabase
          .from('enhanced_user_roles')
          .upsert({
            user_id: editingId,
            role: form.role as any,
            is_active: true,
            assigned_by: user?.id,
            assigned_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,role'
          });

        if (roleError) throw roleError;

        toast({ title: t.userUpdated });
      } else {
        // Create new user using edge function
        const requestBody: any = {
          email: form.email,
          full_name: form.name,
          phone: form.phone,
          role: form.role,
        };

        // Only include password and status for non-residents
        if (form.role !== 'resident') {
          requestBody.password = form.password;
          requestBody.status = form.status;
        }

        // Add unit for residents
        if (form.role === 'resident' && form.unit) {
          requestBody.unit_number = form.unit;
        }

        const { data, error } = await supabase.functions.invoke('admin-create-user', {
          body: requestBody
        });

        if (error) throw error;

        toast({ title: t.userCreated });
      }

      setIsCreateOpen(false);
      setEditingId(null);
      setForm({ 
        name: '', email: '', phone: '', unit: '', role: '', status: '', password: '', confirmPassword: '',
        emergencyContactName: '', emergencyContactPhone: '', shiftType: '', badgeId: '', 
        yearsExperience: '', certificationsText: '', vehicleNumber: '', familySize: 1, specialization: ''
      });
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save user changes',
        variant: 'destructive'
      });
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
      setForm({ 
        name: user.name, 
        email: user.email, 
        phone: user.phone, 
        unit: user.unit, 
        role: user.role, 
        status: user.status,
        password: '',
        confirmPassword: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        shiftType: '',
        badgeId: '',
        yearsExperience: '',
        certificationsText: '',
        vehicleNumber: '',
        familySize: 1,
        specialization: ''
      });
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

  // Fetch household accounts for a user
  const fetchHouseholdAccounts = async (userId: string) => {
    try {
      setIsLoadingHousehold(true);
      
      // Get the auth header
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(
        `https://hjhalygcsdolryngmlry.supabase.co/functions/v1/admin-household?host_user_id=${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqaGFseWdjc2RvbHJ5bmdtbHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODYwNDYsImV4cCI6MjA3MTA2MjA0Nn0.xfJ_IHy-Pw1iiKFbKxHxGe93wgKu26PtW8QCtzj34cI',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setHouseholdAccounts(result?.data || []);
    } catch (error) {
      console.error('Error fetching household accounts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch household accounts',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingHousehold(false);
    }
  };

  // Handle user row click
  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailsOpen(true);
    fetchHouseholdAccounts(user.id);
  };

  // Handle create tenant
  const handleCreateTenant = async () => {
    if (!selectedUser || !tenantForm.tenant_name || !tenantForm.tenant_email) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsCreatingTenant(true);

      const { data, error } = await supabase.functions.invoke('admin-household', {
        body: {
          host_user_id: selectedUser.id,
          tenant_name: tenantForm.tenant_name,
          tenant_email: tenantForm.tenant_email,
          tenant_phone: tenantForm.tenant_phone,
          permissions: tenantForm.permissions,
        }
      });

      if (error) throw error;

      toast({
        title: t.tenantCreated,
        description: language === 'en' ? 'Tenant invitation email has been sent.' : 'E-mel jemputan penyewa telah dihantar.'
      });

      // Reset form and close modal
      setTenantForm({
        tenant_name: '',
        tenant_email: '',
        tenant_phone: '',
        permissions: {
          marketplace: true,
          bookings: true,
          announcements: true,
          complaints: true,
          discussions: true,
          panic_button: true,
        },
      });
      setIsAddTenantOpen(false);

      // Refresh household accounts
      if (selectedUser) {
        fetchHouseholdAccounts(selectedUser.id);
      }
    } catch (error) {
      console.error('Error creating tenant:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create tenant account',
        variant: 'destructive'
      });
    } finally {
      setIsCreatingTenant(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => { 
          setIsCreateOpen(open); 
          if (!open) { 
            setEditingId(null); 
            setForm({ 
              name: '', email: '', phone: '', unit: '', role: 'resident', status: 'pending', password: '', confirmPassword: '',
              emergencyContactName: '', emergencyContactPhone: '', shiftType: '', badgeId: '', 
              yearsExperience: '', certificationsText: '', vehicleNumber: '', familySize: 1, specialization: ''
            });
          } 
        }}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              {t.addUser}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t.createUser}</DialogTitle>
              <DialogDescription>{t.createSubtitle}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Simplified form for residents, full form for other roles */}
              {form.role === 'resident' || !form.role ? (
                <>
                  {/* Basic Information for Residents */}
                  <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <UserPlus className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        {language === 'en' ? 'Creating New Resident' : 'Mencipta Penduduk Baru'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {language === 'en' 
                        ? 'Residents will receive an email invitation to complete their account setup.'
                        : 'Penduduk akan menerima jemputan emel untuk melengkapkan persediaan akaun mereka.'
                      }
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t.fullName} *</Label>
                      <Input 
                        id="name" 
                        placeholder={t.fullName} 
                        value={form.name} 
                        onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t.email} *</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder={t.email} 
                        value={form.email} 
                        onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} 
                        disabled={!!editingId} 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="unit">{t.unit} *</Label>
                      <Input 
                        id="unit" 
                        placeholder={language === 'en' ? 'e.g. A-15-03' : 'cth: A-15-03'} 
                        value={form.unit} 
                        onChange={(e) => setForm(prev => ({ ...prev, unit: e.target.value }))} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t.phone}</Label>
                      <Input 
                        id="phone" 
                        placeholder={language === 'en' ? 'e.g. +60123456789' : 'cth: +60123456789'} 
                        value={form.phone} 
                        onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))} 
                      />
                    </div>
                  </div>
                  
                  {/* Hidden role field defaulted to resident */}
                  <input type="hidden" value="resident" />
                </>
              ) : (
                <>
                  {/* Full form for other roles */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t.fullName}</Label>
                      <Input id="name" placeholder={t.fullName} value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t.email}</Label>
                      <Input id="email" type="email" placeholder={t.email} value={form.email} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} disabled={!!editingId} />
                    </div>
                  </div>

                  {/* Password fields for non-resident new users */}
                  {!editingId && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">{t.password}</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          placeholder={t.password} 
                          value={form.password} 
                          onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                        <Input 
                          id="confirmPassword" 
                          type="password" 
                          placeholder={t.confirmPassword} 
                          value={form.confirmPassword} 
                          onChange={(e) => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))} 
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t.phone}</Label>
                      <Input id="phone" placeholder={t.phone} value={form.phone} onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))} />
                    </div>
                    {form.role === 'resident' && (
                      <div className="space-y-2">
                        <Label htmlFor="unit">{t.unit}</Label>
                        <Input id="unit" placeholder={t.unit} value={form.unit} onChange={(e) => setForm(prev => ({ ...prev, unit: e.target.value }))} />
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">{t.role}</Label>
                      <Select value={form.role} onValueChange={handleRoleChange}>
                        <SelectTrigger>
                          <SelectValue placeholder={t.selectRole} />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.slice(1).map((role) => {
                            const isDisabled = 
                              (role.value === 'security_officer' && !isModuleEnabled('security')) ||
                              ((role.value === 'facility_manager' || role.value === 'maintenance_staff') && !isModuleEnabled('facilities'));
                            
                            return (
                              <SelectItem 
                                key={role.value} 
                                value={role.value}
                                disabled={isDisabled}
                              >
                                {role.label}
                                {isDisabled && (
                                  <span className="text-xs text-muted-foreground ml-2">
                                    (Module disabled)
                                  </span>
                                )}
                              </SelectItem>
                            );
                          })}
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
                </>
              )}

              {/* Role-specific fields */}
              {form.role === 'resident' && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="text-sm font-semibold">{language === 'en' ? 'Resident Details' : 'Butiran Penduduk'}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="familySize">{t.familySize}</Label>
                      <Input 
                        id="familySize" 
                        type="number" 
                        min="1" 
                        value={form.familySize || 1} 
                        onChange={(e) => setForm(prev => ({ ...prev, familySize: parseInt(e.target.value) || 1 }))} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehicleNumber">{t.vehicleNumber}</Label>
                      <Input 
                        id="vehicleNumber" 
                        placeholder={language === 'en' ? 'e.g. ABC 1234' : 'cth: ABC 1234'} 
                        value={form.vehicleNumber || ''} 
                        onChange={(e) => setForm(prev => ({ ...prev, vehicleNumber: e.target.value }))} 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactName">{t.emergencyContactName}</Label>
                      <Input 
                        id="emergencyContactName" 
                        placeholder={language === 'en' ? 'Emergency contact name' : 'Nama hubungan kecemasan'} 
                        value={form.emergencyContactName || ''} 
                        onChange={(e) => setForm(prev => ({ ...prev, emergencyContactName: e.target.value }))} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">{t.emergencyContactPhone}</Label>
                      <Input 
                        id="emergencyContactPhone" 
                        placeholder={language === 'en' ? 'Emergency contact phone' : 'Telefon hubungan kecemasan'} 
                        value={form.emergencyContactPhone || ''} 
                        onChange={(e) => setForm(prev => ({ ...prev, emergencyContactPhone: e.target.value }))} 
                      />
                    </div>
                  </div>
                </div>
              )}

              {form.role === 'security_officer' && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="text-sm font-semibold">{language === 'en' ? 'Security Officer Details' : 'Butiran Pegawai Keselamatan'}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="badgeId">{t.badgeId}</Label>
                      <Input 
                        id="badgeId" 
                        placeholder={language === 'en' ? 'Enter badge ID' : 'Masukkan ID lencana'} 
                        value={form.badgeId || ''} 
                        onChange={(e) => setForm(prev => ({ ...prev, badgeId: e.target.value }))} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shiftType">{t.shiftType}</Label>
                      <Select value={form.shiftType} onValueChange={(v) => setForm(prev => ({ ...prev, shiftType: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder={language === 'en' ? 'Select shift type' : 'Pilih jenis syif'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning</SelectItem>
                          <SelectItem value="afternoon">Afternoon</SelectItem>
                          <SelectItem value="night">Night</SelectItem>
                          <SelectItem value="rotating">Rotating</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactName">{t.emergencyContactName}</Label>
                      <Input 
                        id="emergencyContactName" 
                        placeholder={language === 'en' ? 'Emergency contact name' : 'Nama hubungan kecemasan'} 
                        value={form.emergencyContactName || ''} 
                        onChange={(e) => setForm(prev => ({ ...prev, emergencyContactName: e.target.value }))} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">{t.emergencyContactPhone}</Label>
                      <Input 
                        id="emergencyContactPhone" 
                        placeholder={language === 'en' ? 'Emergency contact phone' : 'Telefon hubungan kecemasan'} 
                        value={form.emergencyContactPhone || ''} 
                        onChange={(e) => setForm(prev => ({ ...prev, emergencyContactPhone: e.target.value }))} 
                      />
                    </div>
                  </div>
                </div>
              )}

              {form.role === 'maintenance_staff' && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="text-sm font-semibold">{language === 'en' ? 'Maintenance Staff Details' : 'Butiran Kakitangan Penyelenggaraan'}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="specialization">{t.specialization}</Label>
                      <Input 
                        id="specialization" 
                        placeholder={language === 'en' ? 'e.g. Electrical, Plumbing' : 'cth: Elektrik, Paip'} 
                        value={form.specialization || ''} 
                        onChange={(e) => setForm(prev => ({ ...prev, specialization: e.target.value }))} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearsExperience">{t.yearsExperience}</Label>
                      <Input 
                        id="yearsExperience" 
                        type="number"
                        min="0"
                        placeholder={language === 'en' ? 'Years of experience' : 'Tahun pengalaman'} 
                        value={form.yearsExperience || ''} 
                        onChange={(e) => setForm(prev => ({ ...prev, yearsExperience: e.target.value }))} 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="certificationsText">{t.certificationsText}</Label>
                      <Input 
                        id="certificationsText" 
                        placeholder={language === 'en' ? 'List certifications' : 'Senaraikan sijil'} 
                        value={form.certificationsText || ''} 
                        onChange={(e) => setForm(prev => ({ ...prev, certificationsText: e.target.value }))} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">{t.emergencyContactPhone}</Label>
                      <Input 
                        id="emergencyContactPhone" 
                        placeholder={language === 'en' ? 'Emergency contact phone' : 'Telefon hubungan kecemasan'} 
                        value={form.emergencyContactPhone || ''} 
                        onChange={(e) => setForm(prev => ({ ...prev, emergencyContactPhone: e.target.value }))} 
                      />
                    </div>
                  </div>
                </div>
              )}

              {form.role === 'facility_manager' && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="text-sm font-semibold">{language === 'en' ? 'Facility Manager Details' : 'Butiran Pengurus Kemudahan'}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="specialization">{t.specialization}</Label>
                      <Input 
                        id="specialization" 
                        placeholder={language === 'en' ? 'e.g. Operations, Maintenance' : 'cth: Operasi, Penyelenggaraan'} 
                        value={form.specialization || ''} 
                        onChange={(e) => setForm(prev => ({ ...prev, specialization: e.target.value }))} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearsExperience">{t.yearsExperience}</Label>
                      <Input 
                        id="yearsExperience" 
                        type="number"
                        min="0"
                        placeholder={language === 'en' ? 'Years of experience' : 'Tahun pengalaman'} 
                        value={form.yearsExperience || ''} 
                        onChange={(e) => setForm(prev => ({ ...prev, yearsExperience: e.target.value }))} 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="certificationsText">{t.certificationsText}</Label>
                      <Input 
                        id="certificationsText" 
                        placeholder={language === 'en' ? 'Management certifications' : 'Sijil pengurusan'} 
                        value={form.certificationsText || ''} 
                        onChange={(e) => setForm(prev => ({ ...prev, certificationsText: e.target.value }))} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">{t.emergencyContactPhone}</Label>
                      <Input 
                        id="emergencyContactPhone" 
                        placeholder={language === 'en' ? 'Emergency contact phone' : 'Telefon hubungan kecemasan'} 
                        value={form.emergencyContactPhone || ''} 
                        onChange={(e) => setForm(prev => ({ ...prev, emergencyContactPhone: e.target.value }))} 
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={creating}>
                  {t.cancel}
                </Button>
                <Button onClick={handleCreateUser} disabled={creating}>
                  {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
                  <div 
                    key={user.id} 
                    className="flex items-center justify-between p-4 border rounded-lg cursor-pointer"
                    onClick={() => handleUserClick(user)}
                  >
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
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        {user.status === 'pending' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleApproveUser(user.id)}
                              className="text-green-600"
                              title={t.approve}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleRejectUser(user.id)}
                              className="text-red-600"
                              title={t.reject}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEdit(user)}
                          title={t.edit}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600"
                          title={t.delete}
                        >
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

      {/* User Details Dialog */}
      <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              {t.userDetails}
            </DialogTitle>
            <DialogDescription>
              {language === 'en' 
                ? 'View user information and manage household members' 
                : 'Lihat maklumat pengguna dan urus ahli rumah'
              }
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="mt-6 space-y-6">
              {/* User Profile Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-lg">
                      {selectedUser.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{selectedUser.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                    <p className="text-sm text-muted-foreground">{selectedUser.phone}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getRoleColor(selectedUser.role)}>
                        {getRoleText(selectedUser.role)}
                      </Badge>
                      <Badge className={getStatusColor(selectedUser.status)}>
                        {getStatusText(selectedUser.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Household Members Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">{t.householdMembers}</h4>
                  <Dialog open={isAddTenantOpen} onOpenChange={setIsAddTenantOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        {t.addTenant}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t.addTenant}</DialogTitle>
                        <DialogDescription>
                          {language === 'en' 
                            ? 'Add a new tenant to this household. They will receive an invitation email.'
                            : 'Tambah penyewa baru ke rumah ini. Mereka akan menerima e-mel jemputan.'
                          }
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="tenantName">{t.tenantName} *</Label>
                          <Input
                            id="tenantName"
                            value={tenantForm.tenant_name}
                            onChange={(e) => setTenantForm(prev => ({ ...prev, tenant_name: e.target.value }))}
                            placeholder={language === 'en' ? 'Enter tenant name' : 'Masukkan nama penyewa'}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="tenantEmail">{t.tenantEmail} *</Label>
                          <Input
                            id="tenantEmail"
                            type="email"
                            value={tenantForm.tenant_email}
                            onChange={(e) => setTenantForm(prev => ({ ...prev, tenant_email: e.target.value }))}
                            placeholder={language === 'en' ? 'Enter tenant email' : 'Masukkan e-mel penyewa'}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="tenantPhone">{t.tenantPhone}</Label>
                          <Input
                            id="tenantPhone"
                            value={tenantForm.tenant_phone}
                            onChange={(e) => setTenantForm(prev => ({ ...prev, tenant_phone: e.target.value }))}
                            placeholder={language === 'en' ? 'Enter tenant phone (optional)' : 'Masukkan telefon penyewa (pilihan)'}
                          />
                        </div>

                        {/* Permissions */}
                        <div className="space-y-3">
                          <Label>{t.tenantPermissions}</Label>
                          <div className="space-y-3">
                            {[
                              { key: 'marketplace', label: t.marketplace },
                              { key: 'bookings', label: t.bookings },
                              { key: 'announcements', label: t.announcements },
                              { key: 'complaints', label: t.complaints },
                              { key: 'discussions', label: t.discussions },
                              { key: 'panic_button', label: language === 'en' ? 'Panic Button' : 'Butang Panik' },
                            ].map(({ key, label }) => (
                              <div key={key} className="flex items-center justify-between">
                                <Label htmlFor={`perm-${key}`} className="text-sm">
                                  {label}
                                </Label>
                                <Switch
                                  id={`perm-${key}`}
                                  checked={tenantForm.permissions[key as keyof typeof tenantForm.permissions]}
                                  onCheckedChange={(checked) =>
                                    setTenantForm(prev => ({
                                      ...prev,
                                      permissions: { ...prev.permissions, [key]: checked }
                                    }))
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsAddTenantOpen(false)}>
                            {t.cancel}
                          </Button>
                          <Button onClick={handleCreateTenant} disabled={isCreatingTenant}>
                            {isCreatingTenant && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {t.createTenant}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {isLoadingHousehold ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : householdAccounts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t.noHouseholdMembers}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {householdAccounts.map((account) => (
                      <div key={account.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {account.profiles.full_name?.split(' ').map(n => n[0]).join('') || 'T'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{account.profiles.full_name}</p>
                          <p className="text-xs text-muted-foreground">{account.profiles.email}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {account.relationship_type}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {language === 'en' ? 'Tenant' : 'Penyewa'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}