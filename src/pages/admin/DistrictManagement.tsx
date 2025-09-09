import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/use-user-roles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Map as MapIcon, MapPin, Plus, Search, Building, Users, Calendar, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface District {
  id: string;
  name: string;
  code?: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  area_km2: number | null;
  population: number | null;
  communities_count?: number | null;
  coordinator_id: string | null;
  coordinator_name?: string;
  established_date: string | null;
  status: string;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export default function DistrictManagement() {
  const { language } = useAuth();
  const { hasRole } = useUserRoles();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [districts, setDistricts] = useState<District[]>([]);
  const [states, setStates] = useState<{id: string; name: string; code: string}[]>([]);
  const [countries, setCountries] = useState<{id: string; name: string; code: string}[]>([]);
  const [districtStatuses, setDistrictStatuses] = useState<{
    status: string; 
    display_name_en: string; 
    display_name_ms: string; 
    color_class: string;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDistrict, setNewDistrict] = useState({
    name: '',
    code: '',
    area_km2: '',
    population: '',
    city: '',
    state: '',
    country: '',
    address: '',
    description: '',
    latitude: '',
    longitude: ''
  });

  // Internationalization
  const text = {
    en: {
      title: 'District Management',
      subtitle: 'Manage districts and administrative regions',
      addDistrict: 'Add District',
      search: 'Search districts...',
      status: 'Status',
      allStatuses: 'All Statuses',
      active: 'Active',
      inactive: 'Inactive',
      pending: 'Pending',
      name: 'District Name',
      code: 'District Code',
      area: 'Area (km²)',
      population: 'Population',
      communities: 'Communities',
      coordinator: 'Coordinator',
      createDistrict: 'Create New District',
      createSubtitle: 'Add a new district to the system',
      create: 'Create District',
      cancel: 'Cancel',
      edit: 'Edit',
      view: 'View Details',
      settings: 'Settings',
      districtCreated: 'District created successfully!',
      totalArea: 'Total Area',
      totalPopulation: 'Total Population',
      totalDistricts: 'Total Districts',
      avgPopulation: 'Average Population',
      city: 'City',
      state: 'State',
      country: 'Country',
      address: 'Address',
      description: 'Description',
      coordinates: 'Coordinates',
      noAccess: 'You do not have permission to create districts'
    },
    ms: {
      title: 'Pengurusan Daerah',
      subtitle: 'Urus daerah dan wilayah pentadbiran',
      addDistrict: 'Tambah Daerah',
      search: 'Cari daerah...',
      status: 'Status',
      allStatuses: 'Semua Status',
      active: 'Aktif',
      inactive: 'Tidak Aktif',
      pending: 'Menunggu',
      name: 'Nama Daerah',
      code: 'Kod Daerah',
      area: 'Keluasan (km²)',
      population: 'Penduduk',
      communities: 'Komuniti',
      coordinator: 'Penyelaras',
      createDistrict: 'Cipta Daerah Baru',
      createSubtitle: 'Tambah daerah baru ke sistem',
      create: 'Cipta Daerah',
      cancel: 'Batal',
      edit: 'Edit',
      view: 'Lihat Butiran',
      settings: 'Tetapan',
      districtCreated: 'Daerah berjaya dicipta!',
      totalArea: 'Jumlah Keluasan',
      totalPopulation: 'Jumlah Penduduk',
      totalDistricts: 'Jumlah Daerah',
      avgPopulation: 'Purata Penduduk',
      city: 'Bandar',
      state: 'Negeri',
      country: 'Negara',
      address: 'Alamat',
      description: 'Penerangan',
      coordinates: 'Koordinat',
      noAccess: 'Anda tidak mempunyai kebenaran untuk mencipta daerah'
    }
  };

  const t = text[language];

  useEffect(() => {
    // Only state admins can access district management
    if (hasRole('state_admin')) {
      fetchReferenceData();
      fetchDistricts();
    } else {
      setLoading(false);
    }
  }, [hasRole]);

  const fetchReferenceData = async () => {
    try {
      // Fetch states
      const { data: statesData, error: statesError } = await supabase
        .from('states')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name');

      if (statesError) throw statesError;
      setStates(statesData || []);

      // Fetch countries
      const { data: countriesData, error: countriesError } = await supabase
        .from('countries')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name');

      if (countriesError) throw countriesError;
      setCountries(countriesData || []);

      // Fetch district statuses
      const { data: statusesData, error: statusesError } = await supabase
        .from('district_statuses')
        .select('status, display_name_en, display_name_ms, color_class')
        .eq('is_active', true)
        .order('sort_order');

      if (statusesError) throw statusesError;
      setDistrictStatuses(statusesData || []);

      // Set default values after fetching reference data
      if (countriesData && countriesData.length > 0) {
        const malaysia = countriesData.find(c => c.name === 'Malaysia');
        if (malaysia) {
          setNewDistrict(prev => ({ ...prev, country: malaysia.name }));
        }
      }

      if (statesData && statesData.length > 0) {
        const pahang = statesData.find(s => s.name === 'Pahang');
        if (pahang) {
          setNewDistrict(prev => ({ ...prev, state: pahang.name }));
        }
      }
    } catch (error) {
      console.error('Error fetching reference data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reference data',
        variant: 'destructive'
      });
    }
  };

  const fetchDistricts = async () => {
    try {
      const { data, error } = await supabase
        .from('districts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get coordinator names and community counts separately
      const districtsWithExtra = await Promise.all(
        (data || []).map(async (district) => {
          // Get coordinator name
          let coordinator_name = 'Not assigned';
          if (district.coordinator_id) {
            const { data: coordData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', district.coordinator_id)
              .single();
            coordinator_name = coordData?.full_name || 'Not assigned';
          }

          // Get community count
          const { count } = await supabase
            .from('communities')
            .select('*', { count: 'exact', head: true })
            .eq('district_id', district.id);
          
          return {
            ...district,
            coordinator_name,
            communities_count: count || 0
          };
        })
      );

      setDistricts(districtsWithExtra);
    } catch (error) {
      console.error('Error fetching districts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load districts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusData = districtStatuses.find(s => s.status === status);
    return statusData?.color_class || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  const getStatusText = (status: string) => {
    const statusData = districtStatuses.find(s => s.status === status);
    if (!statusData) return status;
    return language === 'en' ? statusData.display_name_en : statusData.display_name_ms;
  };

  const filteredDistricts = districts.filter(district => {
    const matchesSearch = district.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         district.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         district.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || district.status === selectedType;
    return matchesSearch && matchesType;
  });

  const totalStats = {
    totalArea: districts.reduce((sum, d) => sum + (d.area_km2 || 0), 0),
    totalPopulation: districts.reduce((sum, d) => sum + (d.population || 0), 0),
    totalDistricts: districts.length,
    avgPopulation: districts.length > 0 
      ? Math.round(districts.reduce((sum, d) => sum + (d.population || 0), 0) / districts.length)
      : 0
  };

  const handleCreateDistrict = async () => {
    if (!newDistrict.name) {
      toast({
        title: 'Error',
        description: 'Please fill in required fields',
        variant: 'destructive'
      });
      return;
    }

    // Check permissions
    if (!hasRole('state_admin')) {
      toast({
        title: 'Error',
        description: t.noAccess,
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('districts')
        .insert([{
          name: newDistrict.name,
          code: newDistrict.code || null,
          area_km2: newDistrict.area_km2 ? parseFloat(newDistrict.area_km2) : null,
          population: newDistrict.population ? parseInt(newDistrict.population) : null,
          city: newDistrict.city || null,
          state: newDistrict.state || null,
          country: newDistrict.country || null,
          address: newDistrict.address || null,
          description: newDistrict.description || null,
          latitude: newDistrict.latitude ? parseFloat(newDistrict.latitude) : null,
          longitude: newDistrict.longitude ? parseFloat(newDistrict.longitude) : null,
          status: 'active'
        }]);

      if (error) throw error;

      toast({
        title: t.districtCreated,
      });
      setIsCreateOpen(false);
      setNewDistrict({
        name: '',
        code: '',
        area_km2: '',
        population: '',
        city: '',
        state: states.find(s => s.name === 'Pahang')?.name || '',
        country: countries.find(c => c.name === 'Malaysia')?.name || '',
        address: '',
        description: '',
        latitude: '',
        longitude: ''
      });
      fetchDistricts();
    } catch (error) {
      console.error('Error creating district:', error);
      toast({
        title: 'Error',
        description: 'Failed to create district',
        variant: 'destructive'
      });
    }
  };

  // Check if user has access
  if (!hasRole('state_admin')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">Only State Administrators can access District Management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t.addDistrict}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t.createDistrict}</DialogTitle>
              <DialogDescription>{t.createSubtitle}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t.name} *</Label>
                  <Input 
                    id="name" 
                    placeholder="Enter district name"
                    value={newDistrict.name}
                    onChange={(e) => setNewDistrict({...newDistrict, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">{t.code}</Label>
                  <Input 
                    id="code" 
                    placeholder="DIS001"
                    value={newDistrict.code}
                    onChange={(e) => setNewDistrict({...newDistrict, code: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">{t.city}</Label>
                  <Input 
                    id="city" 
                    placeholder="City"
                    value={newDistrict.city}
                    onChange={(e) => setNewDistrict({...newDistrict, city: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">{t.state}</Label>
                  <Select 
                    value={newDistrict.state}
                    onValueChange={(value) => setNewDistrict({...newDistrict, state: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state.id} value={state.name}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">{t.country}</Label>
                  <Select 
                    value={newDistrict.country}
                    onValueChange={(value) => setNewDistrict({...newDistrict, country: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.id} value={country.name}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{t.address}</Label>
                <Textarea 
                  id="address" 
                  placeholder="Enter full address"
                  value={newDistrict.address}
                  onChange={(e) => setNewDistrict({...newDistrict, address: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area">{t.area}</Label>
                  <Input 
                    id="area" 
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newDistrict.area_km2}
                    onChange={(e) => setNewDistrict({...newDistrict, area_km2: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="population">{t.population}</Label>
                  <Input 
                    id="population" 
                    type="number"
                    placeholder="0"
                    value={newDistrict.population}
                    onChange={(e) => setNewDistrict({...newDistrict, population: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t.description}</Label>
                <Textarea 
                  id="description" 
                  placeholder="Enter district description"
                  value={newDistrict.description}
                  onChange={(e) => setNewDistrict({...newDistrict, description: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>{t.coordinates}</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    type="number" 
                    step="any"
                    placeholder="Latitude"
                    value={newDistrict.latitude}
                    onChange={(e) => setNewDistrict({...newDistrict, latitude: e.target.value})}
                  />
                  <Input 
                    type="number" 
                    step="any"
                    placeholder="Longitude"
                    value={newDistrict.longitude}
                    onChange={(e) => setNewDistrict({...newDistrict, longitude: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  {t.cancel}
                </Button>
                <Button onClick={handleCreateDistrict}>
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
            <CardTitle className="text-sm font-medium">{t.totalArea}</CardTitle>
            <MapIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalArea.toFixed(2)} km²</div>
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
            <CardTitle className="text-sm font-medium">{t.totalDistricts}</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalDistricts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.avgPopulation}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.avgPopulation.toLocaleString()}</div>
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
            <SelectValue placeholder={t.status} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.allStatuses}</SelectItem>
            {districtStatuses.map((status) => (
              <SelectItem key={status.status} value={status.status}>
                {language === 'en' ? status.display_name_en : status.display_name_ms}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Districts Grid */}
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
        ) : filteredDistricts.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Building className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No districts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new district.
            </p>
          </div>
        ) : (
          filteredDistricts.map((district) => (
            <Card key={district.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{district.name}</CardTitle>
                  <Badge className={getStatusColor(district.status)}>
                    {getStatusText(district.status)}
                  </Badge>
                </div>
                <CardDescription className="flex items-center space-x-2">
                  {district.code && <span>Code: {district.code}</span>}
                  {district.city && <span>• {district.city}</span>}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {district.address && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{district.address}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span>{t.area}: {district.area_km2 || 'N/A'} km²</span>
                    <span>{t.population}: {district.population?.toLocaleString() || 'N/A'}</span>
                    <span>{t.communities}: {district.communities_count || 0}</span>
                    <span>{t.coordinator}: {district.coordinator_name}</span>
                  </div>
                  {(district.latitude && district.longitude) && (
                    <div className="text-xs text-muted-foreground">
                      {district.latitude}, {district.longitude}
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