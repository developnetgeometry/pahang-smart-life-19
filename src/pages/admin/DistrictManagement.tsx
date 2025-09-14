import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/use-user-roles';
import { useDistricts } from '@/hooks/use-districts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Map as MapIcon, MapPin, Search, Building, Users, Loader2, Eye, RefreshCw, Plus, Edit, Trash2, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function DistrictManagement() {
  const navigate = useNavigate();
  const { language } = useAuth();
  const { hasRole } = useUserRoles();
  const { districts, loading, updateDistrict, refetchDistricts } = useDistricts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isUpdatingAreas, setIsUpdatingAreas] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    latitude: '',
    longitude: '',
    description: '',
    address: '',
    postal_code: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Admin management states
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [showAdminDetails, setShowAdminDetails] = useState(false);
  const [selectedDistrictForAdmin, setSelectedDistrictForAdmin] = useState<any>(null);
  const [districtAdmins, setDistrictAdmins] = useState<any[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any>(null);
  
  // Create admin form
  const [createAdminForm, setCreateAdminForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    district_id: ''
  });
  
  // Edit admin form
  const [editAdminForm, setEditAdminForm] = useState({
    email: '',
    full_name: '',
    phone: '',
    district_id: ''
  });

  // Validation functions
  const validatePassword = (password: string) => {
    const hasCapital = /[A-Z]/.test(password);
    const hasMinLength = password.length >= 8;
    return {
      isValid: hasCapital && hasMinLength,
      hasCapital,
      hasMinLength
    };
  };

  const validatePhone = (phone: string) => {
    const isNumeric = /^\d+$/.test(phone);
    const startsWithZero = phone.startsWith('0');
    return {
      isValid: isNumeric && startsWithZero && phone.length >= 10,
      isNumeric,
      startsWithZero,
      hasMinLength: phone.length >= 10
    };
  };

  // Load admins for a district
  const loadDistrictAdmins = async (districtId: string) => {
    setLoadingAdmins(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles!inner(role)
        `)
        .eq('district_id', districtId)
        .eq('user_roles.role', 'community_admin');
      
      if (error) throw error;
      setDistrictAdmins(data || []);
    } catch (error) {
      console.error('Error loading district admins:', error);
      toast.error('Failed to load district administrators');
    } finally {
      setLoadingAdmins(false);
    }
  };

  // Create new admin
  const handleCreateAdmin = async () => {
    const passwordValidation = validatePassword(createAdminForm.password);
    const phoneValidation = validatePhone(createAdminForm.phone);
    
    if (!passwordValidation.isValid) {
      toast.error('Password must be at least 8 characters and contain at least one capital letter');
      return;
    }
    
    if (!phoneValidation.isValid) {
      toast.error('Phone number must contain only numbers, start with 0, and be at least 10 digits');
      return;
    }
    
    if (createAdminForm.password !== createAdminForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setIsUpdating(true);
      
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: createAdminForm.email,
        password: createAdminForm.password,
      });

      if (authError) throw authError;
      
      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: authData.user.id,
            email: createAdminForm.email,
            full_name: createAdminForm.full_name,
            mobile_no: createAdminForm.phone,
            district_id: createAdminForm.district_id,
            account_status: 'approved'
          });

        if (profileError) throw profileError;

        // Assign community admin role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: 'community_admin'
          });

        if (roleError) throw roleError;

        toast.success('Community admin created successfully');
        setShowCreateAdmin(false);
        setCreateAdminForm({
          email: '',
          password: '',
          confirmPassword: '',
          full_name: '',
          phone: '',
          district_id: ''
        });
        
        if (selectedDistrictForAdmin) {
          loadDistrictAdmins(selectedDistrictForAdmin.id);
        }
      }
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast.error(error.message || 'Failed to create admin');
    } finally {
      setIsUpdating(false);
    }
  };

  // Update admin
  const handleUpdateAdmin = async () => {
    const phoneValidation = validatePhone(editAdminForm.phone);
    
    if (!phoneValidation.isValid) {
      toast.error('Phone number must contain only numbers, start with 0, and be at least 10 digits');
      return;
    }

    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          email: editAdminForm.email,
          full_name: editAdminForm.full_name,
          mobile_no: editAdminForm.phone,
          district_id: editAdminForm.district_id
        })
        .eq('id', editingAdmin.id);

      if (error) throw error;

      toast.success('Admin updated successfully');
      setEditingAdmin(null);
      setEditAdminForm({
        email: '',
        full_name: '',
        phone: '',
        district_id: ''
      });
      
      if (selectedDistrictForAdmin) {
        loadDistrictAdmins(selectedDistrictForAdmin.id);
      }
    } catch (error: any) {
      console.error('Error updating admin:', error);
      toast.error(error.message || 'Failed to update admin');
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete admin
  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to delete this admin? This action cannot be undone.')) {
      return;
    }

    try {
      setIsUpdating(true);
      
      // Delete user roles first
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', adminId);

      if (roleError) throw roleError;

      // Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', adminId);

      if (profileError) throw profileError;

      toast.success('Admin deleted successfully');
      
      if (selectedDistrictForAdmin) {
        loadDistrictAdmins(selectedDistrictForAdmin.id);
      }
    } catch (error: any) {
      console.error('Error deleting admin:', error);
      toast.error(error.message || 'Failed to delete admin');
    } finally {
      setIsUpdating(false);
    }
  };

  const openEditAdmin = (admin: any) => {
    setEditingAdmin(admin);
    setEditAdminForm({
      email: admin.email || '',
      full_name: admin.full_name || '',
      phone: admin.mobile_no || '',
      district_id: admin.district_id || ''
    });
  };

  const openEditModal = (district: any) => {
    setEditingDistrict(district);
    setEditForm({
      latitude: district.latitude?.toString() || '',
      longitude: district.longitude?.toString() || '',
      description: district.description || '',
      address: district.address || '',
      postal_code: district.postal_code || ''
    });
  };

  const handleUpdateDistrict = async () => {
    if (!editingDistrict) return;
    
    setIsUpdating(true);
    try {
      const updates = {
        latitude: editForm.latitude ? parseFloat(editForm.latitude) : null,
        longitude: editForm.longitude ? parseFloat(editForm.longitude) : null,
        description: editForm.description || null,
        address: editForm.address || null,
        postal_code: editForm.postal_code || null
      };

      await updateDistrict(editingDistrict.id, updates);
      setEditingDistrict(null);
      toast.success('District updated successfully');
    } catch (error) {
      console.error('Error updating district:', error);
      toast.error('Failed to update district');
    } finally {
      setIsUpdating(false);
    }
  };

  const text = {
    en: {
      title: 'District Management',
      subtitle: 'Manage districts and regional coordination',
      updateAreas: 'Update Areas from OSM',
      search: 'Search districts...',
      type: 'Type',
      allTypes: 'All Types',
      urban: 'Urban',
      suburban: 'Suburban',
      rural: 'Rural',
      name: 'District Name',
      code: 'District Code',
      area: 'Area',
      population: 'Population',
      communities: 'Communities',
      coordinator: 'Coordinator',
      established: 'Established',
      status: 'Status',
      active: 'Active',
      planning: 'Planning',
      development: 'Development',
      edit: 'Edit',
      view: 'View Details',
      settings: 'Settings',
      totalArea: 'Total Area',
      totalPopulation: 'Total Population',
      totalCommunities: 'Total Communities',
      avgPopulation: 'Avg Population',
      // Admin management
      createAdmin: 'Create Admin',
      manageAdmins: 'Manage Admins',
      adminDetails: 'Admin Details',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      fullName: 'Full Name',
      phone: 'Phone Number',
      district: 'District',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      update: 'Update',
      passwordRequirement: 'Password must be at least 8 characters with one capital letter',
      phoneRequirement: 'Phone must start with 0 and contain only numbers',
      assignedAdmins: 'Assigned Administrators',
      noAdmins: 'No administrators assigned to this district',
    },
    ms: {
      title: 'Pengurusan Daerah',
      subtitle: 'Urus daerah dan penyelarasan wilayah',
      updateAreas: 'Kemaskini Keluasan dari OSM',
      search: 'Cari daerah...',
      type: 'Jenis',
      allTypes: 'Semua Jenis',
      urban: 'Bandar',
      suburban: 'Pinggir Bandar',
      rural: 'Luar Bandar',
      name: 'Nama Daerah',
      code: 'Kod Daerah',
      area: 'Keluasan',
      population: 'Penduduk',
      communities: 'Komuniti',
      coordinator: 'Penyelaras',
      established: 'Ditubuhkan',
      status: 'Status',
      active: 'Aktif',
      planning: 'Perancangan',
      development: 'Pembangunan',
      edit: 'Edit',
      view: 'Lihat Butiran',
      settings: 'Tetapan',
      totalArea: 'Jumlah Keluasan',
      totalPopulation: 'Jumlah Penduduk',
      totalCommunities: 'Jumlah Komuniti',
      avgPopulation: 'Purata Penduduk',
      // Admin management
      createAdmin: 'Cipta Admin',
      manageAdmins: 'Urus Admin',
      adminDetails: 'Butiran Admin',
      email: 'Emel',
      password: 'Kata Laluan',
      confirmPassword: 'Sahkan Kata Laluan',
      fullName: 'Nama Penuh',
      phone: 'Nombor Telefon',
      district: 'Daerah',
      save: 'Simpan',
      cancel: 'Batal',
      delete: 'Padam',
      update: 'Kemaskini',
      passwordRequirement: 'Kata laluan mesti sekurang-kurangnya 8 aksara dengan satu huruf besar',
      phoneRequirement: 'Telefon mesti bermula dengan 0 dan hanya mengandungi nombor',
      assignedAdmins: 'Pentadbir yang Ditugaskan',
      noAdmins: 'Tiada pentadbir ditugaskan untuk daerah ini',
    }
  };

  const t = text[language];

  // Only show content if user has state_admin role
  if (!hasRole('state_admin')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You need State Admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const districtTypes = [
    { value: 'all', label: t.allTypes },
    { value: 'urban', label: t.urban },
    { value: 'suburban', label: t.suburban },
    { value: 'rural', label: t.rural }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urban': return 'bg-blue-100 text-blue-800';
      case 'suburban': return 'bg-green-100 text-green-800';
      case 'rural': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'development': return 'bg-yellow-100 text-yellow-800';
      case 'planning': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type?: string) => {
    switch (type) {
      case 'urban': return t.urban;
      case 'suburban': return t.suburban;
      case 'rural': return t.rural;
      default: return type || '';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'active': return t.active;
      case 'development': return t.development;
      case 'planning': return t.planning;
      default: return status || '';
    }
  };

  // Filter to show only the 15 predefined Pahang districts using robust matching
  const pahangDistricts = [
    'Bentong', 'Bera', 'Cameron Highlands', 'Jerantut', 'Kuantan',
    'Kuala Lipis', 'Maran', 'Pekan', 'Raub', 'Rompin', 'Temerloh',
    'Genting', 'Gebeng', 'Jelai', 'Muadzam Shah'
  ];

  // Helper function to normalize district names for matching
  const normalizeDistrictName = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\s+(district|daerah)$/i, ''); // Remove district/daerah suffix
  };

  const filteredDistricts = districts
    .filter(district => {
      const normalizedDistrictName = normalizeDistrictName(district.name);
      return pahangDistricts.some(pahangDistrict => {
        const normalizedPahangName = normalizeDistrictName(pahangDistrict);
        // Check for exact match, partial match, or if one contains the other
        return normalizedDistrictName === normalizedPahangName ||
               normalizedDistrictName.includes(normalizedPahangName) ||
               normalizedPahangName.includes(normalizedDistrictName);
      });
    })
    .filter(district => {
      const matchesSearch = district.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (district.code?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesType = selectedType === 'all' || district.district_type === selectedType;
      return matchesSearch && matchesType;
    });

  const totalStats = {
    totalArea: filteredDistricts.reduce((sum, d) => sum + (d.area_km2 || d.area || 0), 0),
    totalPopulation: filteredDistricts.reduce((sum, d) => sum + (d.population || 0), 0),
    totalCommunities: filteredDistricts.reduce((sum, d) => sum + (d.communities_count || 0), 0),
    avgPopulation: filteredDistricts.length > 0 ? filteredDistricts.reduce((sum, d) => sum + (d.population || 0), 0) / filteredDistricts.length : 0
  };

  const handleUpdateAreas = async () => {
    if (isUpdatingAreas) return;
    
    setIsUpdatingAreas(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-osm-boundaries');
      
      if (error) {
        console.error('Error updating areas:', error);
        toast.error('Failed to update areas from OSM');
        return;
      }

      if (data?.success) {
        toast.success(data.message || 'Areas updated successfully');
        // Refresh districts data
        window.location.reload();
      } else {
        toast.error(data?.error || 'Failed to update areas');
      }
    } catch (error) {
      console.error('Error calling OSM function:', error);
      toast.error('Failed to update areas from OSM');
    } finally {
      setIsUpdatingAreas(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button onClick={handleUpdateAreas} disabled={isUpdatingAreas}>
          {isUpdatingAreas ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {t.updateAreas}
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalArea}</CardTitle>
            <MapIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalArea.toLocaleString()} km²</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalPopulation}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalPopulation.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalCommunities}</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalCommunities}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.avgPopulation}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalStats.avgPopulation).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t.type} />
          </SelectTrigger>
          <SelectContent>
            {districtTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Districts Grid */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDistricts.map((district) => (
            <Card key={district.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{district.name}</CardTitle>
                    {district.code && (
                      <CardDescription className="font-mono text-xs">{district.code}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className={getTypeColor(district.district_type || '')}>
                      {getTypeText(district.district_type)}
                    </Badge>
                    <Badge variant="secondary" className={getStatusColor(district.status || '')}>
                      {getStatusText(district.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{t.area}</p>
                      <p className="text-muted-foreground">
                        {district.area_km2 
                          ? `${district.area_km2.toLocaleString()} km²` 
                          : district.area 
                            ? `${district.area.toLocaleString()} km²`
                            : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{t.population}</p>
                      <p className="text-muted-foreground">
                        {(district.population || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{t.communities}</p>
                      <p className="text-muted-foreground">{district.communities_count || 0}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-muted-foreground text-xs">
                        {district.latitude && district.longitude 
                          ? `${district.latitude.toFixed(3)}, ${district.longitude.toFixed(3)}`
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  {/* Quick Edit disabled; use Detailed Edit on District page
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => openEditModal(district)}
                  >
                    {t.edit}
                  </Button>
                  */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate(`/admin/districts/${district.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {t.view}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedDistrictForAdmin(district);
                      loadDistrictAdmins(district.id);
                      setShowAdminDetails(true);
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    {t.manageAdmins}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredDistricts.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No districts found matching your criteria.</p>
            </div>
          )}
        </div>
      )}
      
      {/* Admin Management Modal */}
      <Dialog open={showAdminDetails} onOpenChange={setShowAdminDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t.adminDetails} - {selectedDistrictForAdmin?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">{t.assignedAdmins}</h4>
              <Button 
                onClick={() => {
                  setCreateAdminForm(prev => ({ ...prev, district_id: selectedDistrictForAdmin?.id || '' }));
                  setShowCreateAdmin(true);
                }}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                {t.createAdmin}
              </Button>
            </div>
            
            {loadingAdmins ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : districtAdmins.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">{t.noAdmins}</p>
            ) : (
              <div className="space-y-2">
                {districtAdmins.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{admin.full_name}</p>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                      <p className="text-sm text-muted-foreground">{admin.mobile_no}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditAdmin(admin)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteAdmin(admin.user_id)}
                        disabled={isUpdating}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Admin Modal */}
      <Dialog open={showCreateAdmin} onOpenChange={setShowCreateAdmin}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t.createAdmin}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                value={createAdminForm.email}
                onChange={(e) => setCreateAdminForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="admin@example.com"
              />
            </div>
            
            <div>
              <Label htmlFor="password">{t.password}</Label>
              <Input
                id="password"
                type="password"
                value={createAdminForm.password}
                onChange={(e) => setCreateAdminForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Password"
              />
              <p className="text-xs text-muted-foreground mt-1">{t.passwordRequirement}</p>
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={createAdminForm.confirmPassword}
                onChange={(e) => setCreateAdminForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm Password"
              />
            </div>
            
            <div>
              <Label htmlFor="fullName">{t.fullName}</Label>
              <Input
                id="fullName"
                value={createAdminForm.full_name}
                onChange={(e) => setCreateAdminForm(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">{t.phone}</Label>
              <Input
                id="phone"
                value={createAdminForm.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                  setCreateAdminForm(prev => ({ ...prev, phone: value }));
                }}
                placeholder="0123456789"
                maxLength={15}
              />
              <p className="text-xs text-muted-foreground mt-1">{t.phoneRequirement}</p>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateAdmin(false)}>
                {t.cancel}
              </Button>
              <Button onClick={handleCreateAdmin} disabled={isUpdating}>
                {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {t.save}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Modal */}
      <Dialog open={!!editingAdmin} onOpenChange={(open) => !open && setEditingAdmin(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t.edit} {t.adminDetails}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="editEmail">{t.email}</Label>
              <Input
                id="editEmail"
                type="email"
                value={editAdminForm.email}
                onChange={(e) => setEditAdminForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="admin@example.com"
              />
            </div>
            
            <div>
              <Label htmlFor="editFullName">{t.fullName}</Label>
              <Input
                id="editFullName"
                value={editAdminForm.full_name}
                onChange={(e) => setEditAdminForm(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <Label htmlFor="editPhone">{t.phone}</Label>
              <Input
                id="editPhone"
                value={editAdminForm.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                  setEditAdminForm(prev => ({ ...prev, phone: value }));
                }}
                placeholder="0123456789"
                maxLength={15}
              />
              <p className="text-xs text-muted-foreground mt-1">{t.phoneRequirement}</p>
            </div>
            
            <div>
              <Label htmlFor="editDistrict">{t.district}</Label>
              <Select 
                value={editAdminForm.district_id} 
                onValueChange={(value) => setEditAdminForm(prev => ({ ...prev, district_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {filteredDistricts.map((district) => (
                    <SelectItem key={district.id} value={district.id}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditingAdmin(null)}>
                {t.cancel}
              </Button>
              <Button onClick={handleUpdateAdmin} disabled={isUpdating}>
                {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {t.update}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Edit Modal disabled; use Detailed Edit on District page
      <Dialog open={!!editingDistrict} onOpenChange={(open) => !open && setEditingDistrict(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit District - {editingDistrict?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            ...
          </div>
        </DialogContent>
      </Dialog>
      */}
    </div>
  );
}
