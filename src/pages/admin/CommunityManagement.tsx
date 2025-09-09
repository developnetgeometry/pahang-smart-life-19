import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/use-user-roles';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Users, Plus, Search, MapPin, Calendar, TrendingUp, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Community {
  id: string;
  name: string;
  community_type: string | null;
  address: string | null;
  total_units: number | null;
  occupied_units: number | null;
  established_date: string | null;
  status: string;
  district_id: string | null;
  latitude: number | null;
  longitude: number | null;
  admin_id: string | null;
  admin_name?: string;
  created_at: string;
  updated_at: string;
  districts?: { name: string };
}

interface District {
  id: string;
  name: string;
}

export default function CommunityManagement() {
  const { language, user } = useAuth();
  const { hasRole } = useUserRoles();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    community_type: 'residential',
    address: '',
    total_units: '',
    district_id: '',
    latitude: '',
    longitude: ''
  });

  const text = {
    en: {
      title: 'Community Management',
      subtitle: 'Manage residential and commercial communities',
      addCommunity: 'Add Community',
      search: 'Search communities...',
      type: 'Type',
      allTypes: 'All Types',
      residential: 'Residential',
      commercial: 'Commercial',
      mixed: 'Mixed',
      name: 'Community Name',
      address: 'Address',
      totalUnits: 'Total Units',
      occupiedUnits: 'Occupied Units',
      occupancy: 'Occupancy',
      managementFee: 'Management Fee',
      establishedDate: 'Established Date',
      status: 'Status',
      active: 'Active',
      underConstruction: 'Under Construction',
      planning: 'Planning',
      createCommunity: 'Create New Community',
      createSubtitle: 'Add a new community to the system',
      description: 'Description',
      create: 'Create Community',
      cancel: 'Cancel',
      edit: 'Edit',
      view: 'View Details',
      settings: 'Settings',
      communityCreated: 'Community created successfully!',
      occupancyRate: 'Occupancy Rate',
      totalRevenue: 'Total Revenue',
      avgFee: 'Average Fee',
      totalCommunities: 'Total Communities',
      district: 'District',
      selectDistrict: 'Select District',
      noAccess: 'You do not have permission to create communities',
      coordinates: 'Coordinates'
    },
    ms: {
      title: 'Pengurusan Komuniti',
      subtitle: 'Urus komuniti kediaman dan komersial',
      addCommunity: 'Tambah Komuniti',
      search: 'Cari komuniti...',
      type: 'Jenis',
      allTypes: 'Semua Jenis',
      residential: 'Kediaman',
      commercial: 'Komersial',
      mixed: 'Campuran',
      name: 'Nama Komuniti',
      address: 'Alamat',
      totalUnits: 'Jumlah Unit',
      occupiedUnits: 'Unit Diduduki',
      occupancy: 'Penghunian',
      managementFee: 'Fi Pengurusan',
      establishedDate: 'Tarikh Ditubuhkan',
      status: 'Status',
      active: 'Aktif',
      underConstruction: 'Dalam Pembinaan',
      planning: 'Perancangan',
      createCommunity: 'Cipta Komuniti Baru',
      createSubtitle: 'Tambah komuniti baru ke sistem',
      description: 'Penerangan',
      create: 'Cipta Komuniti',
      cancel: 'Batal',
      edit: 'Edit',
      view: 'Lihat Butiran',
      settings: 'Tetapan',
      communityCreated: 'Komuniti berjaya dicipta!',
      occupancyRate: 'Kadar Penghunian',
      totalRevenue: 'Jumlah Hasil',
      avgFee: 'Fi Purata',
      totalCommunities: 'Jumlah Komuniti',
      district: 'Daerah',
      selectDistrict: 'Pilih Daerah',
      noAccess: 'Anda tidak mempunyai kebenaran untuk mencipta komuniti',
      coordinates: 'Koordinat'
    }
  };

  const t = text[language];

  useEffect(() => {
    fetchCommunities();
    if (hasRole('state_admin')) {
      fetchDistricts();
    }
  }, []);

  const fetchDistricts = async () => {
    try {
      const { data, error } = await supabase
        .from('districts')
        .select('id, name')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setDistricts(data || []);
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const fetchCommunities = async () => {
    try {
      let query = supabase
        .from('communities')
        .select(`
          *,
          districts(name)
        `)
        .order('created_at', { ascending: false });

      // Role-based filtering
      if (hasRole('district_coordinator')) {
        // District coordinators see only communities in their district
        const userDistrictId = user?.district_id;
        if (userDistrictId) {
          query = query.eq('district_id', userDistrictId);
        }
      } else if (hasRole('community_admin')) {
        // Community admins see only their community
        // Note: This requires the user profile to have community_id field
        // const userCommunity = user?.community_id;
        // if (userCommunity) {
        //   query = query.eq('id', userCommunity);
        // }
      }
      // State admins see all communities (no filter)

      const { data, error } = await query;
      if (error) throw error;

      // Get admin names separately
      const communitiesWithAdmins = await Promise.all(
        (data || []).map(async (community) => {
          if (community.admin_id) {
            const { data: adminData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', community.admin_id)
              .single();
            
            return {
              ...community,
              admin_name: adminData?.full_name || 'Not assigned'
            };
          }
          return {
            ...community,
            admin_name: 'Not assigned'
          };
        })
      );

      setCommunities(communitiesWithAdmins);
    } catch (error) {
      console.error('Error fetching communities:', error);
      toast({
        title: 'Error',
        description: 'Failed to load communities',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string | null) => {
    switch (type) {
      case 'residential': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'commercial': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'mixed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'under_construction': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'planning': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getTypeText = (type: string | null) => {
    switch (type) {
      case 'residential': return t.residential;
      case 'commercial': return t.commercial;
      case 'mixed': return t.mixed;
      default: return 'Unknown';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return t.active;
      case 'under_construction': return t.underConstruction;
      case 'planning': return t.planning;
      default: return status;
    }
  };

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         community.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || community.community_type === selectedType;
    return matchesSearch && matchesType;
  });

  const totalStats = {
    totalUnits: communities.reduce((sum, c) => sum + (c.total_units || 0), 0),
    occupiedUnits: communities.reduce((sum, c) => sum + (c.occupied_units || 0), 0),
    totalCommunities: communities.length,
    avgOccupancy: communities.length > 0 
      ? Math.round((communities.reduce((sum, c) => {
          const rate = c.total_units ? (c.occupied_units || 0) / c.total_units : 0;
          return sum + rate;
        }, 0) / communities.length) * 100) : 0
  };

  const handleCreateCommunity = async () => {
    if (!newCommunity.name) {
      toast({
        title: 'Error',
        description: 'Please fill in required fields',
        variant: 'destructive'
      });
      return;
    }

    // Check permissions
    if (!hasRole('state_admin') && !hasRole('district_coordinator')) {
      toast({
        title: 'Error',
        description: t.noAccess,
        variant: 'destructive'
      });
      return;
    }

    try {
      // Determine district_id based on user role
      let districtId = null;
      if (hasRole('state_admin')) {
        // State admin can select any district
        districtId = newCommunity.district_id || null;
      } else if (hasRole('district_coordinator')) {
        // District coordinator creates communities in their district
        districtId = user?.district_id || null;
      }

      const { data, error } = await supabase
        .from('communities')
        .insert([{
          name: newCommunity.name,
          community_type: newCommunity.community_type,
          address: newCommunity.address,
          total_units: newCommunity.total_units ? parseInt(newCommunity.total_units) : null,
          latitude: newCommunity.latitude ? parseFloat(newCommunity.latitude) : null,
          longitude: newCommunity.longitude ? parseFloat(newCommunity.longitude) : null,
          district_id: districtId,
          status: 'active'
        }]);

      if (error) throw error;

      toast({
        title: t.communityCreated,
      });
      setIsCreateOpen(false);
      setNewCommunity({
        name: '',
        community_type: 'residential',
        address: '',
        total_units: '',
        district_id: '',
        latitude: '',
        longitude: ''
      });
      fetchCommunities();
    } catch (error) {
      console.error('Error creating community:', error);
      toast({
        title: 'Error',
        description: 'Failed to create community',
        variant: 'destructive'
      });
    }
  };

  const canCreateCommunity = hasRole('state_admin') || hasRole('district_coordinator');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        {canCreateCommunity && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t.addCommunity}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{t.createCommunity}</DialogTitle>
                <DialogDescription>{t.createSubtitle}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t.name} *</Label>
                  <Input 
                    id="name" 
                    placeholder="Enter community name"
                    value={newCommunity.name}
                    onChange={(e) => setNewCommunity({...newCommunity, name: e.target.value})}
                  />
                </div>
                
                {hasRole('state_admin') && (
                  <div className="space-y-2">
                    <Label htmlFor="district">{t.district} *</Label>
                    <Select 
                      value={newCommunity.district_id} 
                      onValueChange={(value) => setNewCommunity({...newCommunity, district_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectDistrict} />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map(district => (
                          <SelectItem key={district.id} value={district.id}>
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="type">{t.type}</Label>
                  <Select 
                    value={newCommunity.community_type} 
                    onValueChange={(value) => setNewCommunity({...newCommunity, community_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">{t.residential}</SelectItem>
                      <SelectItem value="commercial">{t.commercial}</SelectItem>
                      <SelectItem value="mixed">{t.mixed}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">{t.address}</Label>
                  <Textarea 
                    id="address" 
                    placeholder="Enter full address"
                    value={newCommunity.address}
                    onChange={(e) => setNewCommunity({...newCommunity, address: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalUnits">{t.totalUnits}</Label>
                    <Input 
                      id="totalUnits" 
                      type="number" 
                      placeholder="0"
                      value={newCommunity.total_units}
                      onChange={(e) => setNewCommunity({...newCommunity, total_units: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="latitude">{t.coordinates}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input 
                        id="latitude" 
                        type="number" 
                        step="any"
                        placeholder="Lat"
                        value={newCommunity.latitude}
                        onChange={(e) => setNewCommunity({...newCommunity, latitude: e.target.value})}
                      />
                      <Input 
                        id="longitude" 
                        type="number" 
                        step="any"
                        placeholder="Lng"
                        value={newCommunity.longitude}
                        onChange={(e) => setNewCommunity({...newCommunity, longitude: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    {t.cancel}
                  </Button>
                  <Button onClick={handleCreateCommunity}>
                    {t.create}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalUnits}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalUnits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.occupancyRate}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalStats.totalUnits > 0 ? Math.round((totalStats.occupiedUnits / totalStats.totalUnits) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {totalStats.occupiedUnits}/{totalStats.totalUnits} units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalCommunities}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalCommunities}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Occupancy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.avgOccupancy}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
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
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t.type} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.allTypes}</SelectItem>
            <SelectItem value="residential">{t.residential}</SelectItem>
            <SelectItem value="commercial">{t.commercial}</SelectItem>
            <SelectItem value="mixed">{t.mixed}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Communities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredCommunities.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No communities found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {canCreateCommunity ? 'Get started by creating a new community.' : 'No communities match your search criteria.'}
            </p>
          </div>
        ) : (
          filteredCommunities.map((community) => (
            <Card key={community.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{community.name}</CardTitle>
                  <Badge className={getStatusColor(community.status)}>
                    {getStatusText(community.status)}
                  </Badge>
                </div>
                <CardDescription className="flex items-center space-x-2">
                  <Badge className={getTypeColor(community.community_type)}>
                    {getTypeText(community.community_type)}
                  </Badge>
                  {community.districts && (
                    <span className="text-sm text-muted-foreground">
                      • {community.districts.name}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {community.address && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{community.address}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>{t.totalUnits}: {community.total_units || 0}</span>
                    <span>{t.occupiedUnits}: {community.occupied_units || 0}</span>
                  </div>
                  {community.total_units && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{
                          width: `${Math.min(((community.occupied_units || 0) / community.total_units) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    Admin: {community.admin_name}
                  </div>
                  {(community.latitude && community.longitude) && (
                    <div className="text-xs text-muted-foreground">
                      {community.latitude}, {community.longitude}
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" size="sm">
                    {t.view}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                    {t.settings}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}