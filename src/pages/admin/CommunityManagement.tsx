import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
}

export default function CommunityManagement() {
  const { language, user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    community_type: 'residential',
    address: '',
    total_units: '',
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
      mixed: 'Mixed Use',
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
      totalCommunities: 'Total Communities'
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
      totalCommunities: 'Jumlah Komuniti'
    }
  };

  const t = text[language];

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .order('created_at', { ascending: false });

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

  const communityTypes = [
    { value: 'all', label: t.allTypes },
    { value: 'residential', label: t.residential },
    { value: 'commercial', label: t.commercial },
    { value: 'mixed', label: t.mixed }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'residential': return 'bg-green-100 text-green-800';
      case 'commercial': return 'bg-blue-100 text-blue-800';
      case 'mixed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'under-construction': return 'bg-yellow-100 text-yellow-800';
      case 'planning': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'residential': return t.residential;
      case 'commercial': return t.commercial;
      case 'mixed': return t.mixed;
      default: return type;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return t.active;
      case 'under-construction': return t.underConstruction;
      case 'planning': return t.planning;
      default: return status;
    }
  };

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (community.address && community.address.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || community.community_type === selectedType;
    return matchesSearch && matchesType;
  });

  const totalStats = {
    totalUnits: communities.reduce((sum, c) => sum + (c.total_units || 0), 0),
    occupiedUnits: communities.reduce((sum, c) => sum + (c.occupied_units || 0), 0),
    totalCommunities: communities.length,
    avgOccupancy: communities.length > 0 ? 
      communities.reduce((sum, c) => {
        const occupancy = (c.total_units && c.occupied_units) ? 
          (c.occupied_units / c.total_units) * 100 : 0;
        return sum + occupancy;
      }, 0) / communities.length : 0
  };

  const handleCreateCommunity = async () => {
    try {
      const { error } = await supabase
        .from('communities')
        .insert([{
          name: newCommunity.name,
          community_type: newCommunity.community_type,
          address: newCommunity.address,
          total_units: newCommunity.total_units ? parseInt(newCommunity.total_units) : null,
          latitude: newCommunity.latitude ? parseFloat(newCommunity.latitude) : null,
          longitude: newCommunity.longitude ? parseFloat(newCommunity.longitude) : null,
          district_id: user?.district || null,
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t.addCommunity}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>{t.createCommunity}</DialogTitle>
              <DialogDescription>{t.createSubtitle}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t.name}</Label>
                <Input 
                  id="name" 
                  placeholder={t.name}
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity({...newCommunity, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">{t.type}</Label>
                <Select 
                  value={newCommunity.community_type} 
                  onValueChange={(value) => setNewCommunity({...newCommunity, community_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {communityTypes.slice(1).map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t.address}</Label>
                <Textarea 
                  id="address" 
                  placeholder={t.address} 
                  rows={2}
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
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input 
                    id="latitude" 
                    type="number" 
                    step="any"
                    placeholder="3.1319"
                    value={newCommunity.latitude}
                    onChange={(e) => setNewCommunity({...newCommunity, latitude: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input 
                  id="longitude" 
                  type="number" 
                  step="any"
                  placeholder="101.6841"
                  value={newCommunity.longitude}
                  onChange={(e) => setNewCommunity({...newCommunity, longitude: e.target.value})}
                />
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
              {Math.round((totalStats.occupiedUnits / totalStats.totalUnits) * 100)}%
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
            <p className="text-xs text-muted-foreground">Communities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.occupancyRate}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalStats.avgOccupancy)}%</div>
            <p className="text-xs text-muted-foreground">Average occupancy</p>
          </CardContent>
        </Card>
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
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {communityTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCommunities.map((community) => (
          <Card key={community.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{community.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {community.address}
                  </CardDescription>
                </div>
                  <div className="flex gap-2">
                    <Badge className={getTypeColor(community.community_type || 'residential')}>
                      {getTypeText(community.community_type || 'residential')}
                    </Badge>
                    <Badge className={getStatusColor(community.status)}>
                      {getStatusText(community.status)}
                    </Badge>
                  </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">{t.totalUnits}</p>
                    <p className="font-medium">{community.total_units || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t.occupiedUnits}</p>
                    <p className="font-medium">{community.occupied_units || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t.occupancy}</p>
                    <p className="font-medium">
                      {(community.total_units && community.occupied_units) ? Math.round((community.occupied_units / community.total_units) * 100) : 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Admin</p>
                    <p className="font-medium">{community.admin_name}</p>
                  </div>
                </div>
                
                {(community.latitude && community.longitude) && (
                  <div className="text-xs text-muted-foreground">
                    📍 {community.latitude.toFixed(4)}, {community.longitude.toFixed(4)}
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    {t.establishedDate}: {community.established_date || 'Not set'}
                  </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    {t.view}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}