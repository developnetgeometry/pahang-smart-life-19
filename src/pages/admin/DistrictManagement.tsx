import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  code: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  area_km2: number | null;
  population: number | null;
  communities_count: number | null;
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
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDistrict, setNewDistrict] = useState({
    name: '',
    code: '',
    area_km2: '',
    population: '',
    latitude: '',
    longitude: '',
    description: ''
  });

  const text = {
    en: {
      title: 'District Management',
      subtitle: 'Manage districts and regional coordination',
      addDistrict: 'Add District',
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
      createDistrict: 'Create New District',
      createSubtitle: 'Add a new district to the system',
      description: 'Description',
      selectCoordinator: 'Select Coordinator',
      create: 'Create District',
      cancel: 'Cancel',
      edit: 'Edit',
      view: 'View Details',
      settings: 'Settings',
      districtCreated: 'District created successfully!',
      totalArea: 'Total Area',
      totalPopulation: 'Total Population',
      totalCommunities: 'Total Communities',
      avgPopulation: 'Avg Population'
    },
    ms: {
      title: 'Pengurusan Daerah',
      subtitle: 'Urus daerah dan penyelarasan wilayah',
      addDistrict: 'Tambah Daerah',
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
      createDistrict: 'Cipta Daerah Baru',
      createSubtitle: 'Tambah daerah baru ke sistem',
      description: 'Penerangan',
      selectCoordinator: 'Pilih Penyelaras',
      create: 'Cipta Daerah',
      cancel: 'Batal',
      edit: 'Edit',
      view: 'Lihat Butiran',
      settings: 'Tetapan',
      districtCreated: 'Daerah berjaya dicipta!',
      totalArea: 'Jumlah Keluasan',
      totalPopulation: 'Jumlah Penduduk',
      totalCommunities: 'Jumlah Komuniti',
      avgPopulation: 'Purata Penduduk'
    }
  };

  const t = text[language];

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      const { data, error } = await supabase
        .from('districts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get coordinator names separately
      const districtsWithCoordinators = await Promise.all(
        (data || []).map(async (district) => {
          if (district.coordinator_id) {
            const { data: coordinatorData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', district.coordinator_id)
              .single();
            
            return {
              ...district,
              coordinator_name: coordinatorData?.full_name || 'Not assigned'
            };
          }
          return {
            ...district,
            coordinator_name: 'Not assigned'
          };
        })
      );

      setDistricts(districtsWithCoordinators as District[]);
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
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'development': return 'bg-yellow-100 text-yellow-800';
      case 'planning': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return t.active;
      case 'development': return t.development;
      case 'planning': return t.planning;
      default: return status;
    }
  };

  const filteredDistricts = districts.filter(district => {
    const matchesSearch = district.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (district.code && district.code.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const totalStats = {
    totalArea: districts.reduce((sum, d) => sum + (d.area_km2 || 0), 0),
    totalPopulation: districts.reduce((sum, d) => sum + (d.population || 0), 0),
    totalCommunities: districts.reduce((sum, d) => sum + (d.communities_count || 0), 0),
    avgPopulation: districts.length > 0 ? districts.reduce((sum, d) => sum + (d.population || 0), 0) / districts.length : 0
  };

  const handleCreateDistrict = async () => {
    try {
      const { error } = await supabase
        .from('districts')
        .insert([{
          name: newDistrict.name,
          code: newDistrict.code,
          area_km2: newDistrict.area_km2 ? parseFloat(newDistrict.area_km2) : null,
          population: newDistrict.population ? parseInt(newDistrict.population) : null,
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
        latitude: '',
        longitude: '',
        description: ''
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
              {t.addDistrict}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>{t.createDistrict}</DialogTitle>
              <DialogDescription>{t.createSubtitle}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t.name}</Label>
                  <Input 
                    id="name" 
                    placeholder={t.name}
                    value={newDistrict.name}
                    onChange={(e) => setNewDistrict({...newDistrict, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">{t.code}</Label>
                  <Input 
                    id="code" 
                    placeholder="e.g., BB001"
                    value={newDistrict.code}
                    onChange={(e) => setNewDistrict({...newDistrict, code: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area">{t.area} (km²)</Label>
                  <Input 
                    id="area" 
                    type="number" 
                    placeholder="0"
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input 
                    id="latitude" 
                    type="number" 
                    step="any"
                    placeholder="3.1319"
                    value={newDistrict.latitude}
                    onChange={(e) => setNewDistrict({...newDistrict, latitude: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input 
                    id="longitude" 
                    type="number" 
                    step="any"
                    placeholder="101.6841"
                    value={newDistrict.longitude}
                    onChange={(e) => setNewDistrict({...newDistrict, longitude: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t.description}</Label>
                <Textarea 
                  id="description" 
                  placeholder={t.description} 
                  rows={3}
                  value={newDistrict.description}
                  onChange={(e) => setNewDistrict({...newDistrict, description: e.target.value})}
                />
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
            <div className="text-2xl font-bold">{totalStats.totalArea} km²</div>
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
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalStats.avgPopulation).toLocaleString()}</div>
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
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDistricts.map((district) => (
            <Card key={district.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{district.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {district.code || 'No code'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(district.status)}>
                      {getStatusText(district.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">{t.area}</p>
                    <p className="font-medium">{district.area_km2 || 0} km²</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t.population}</p>
                    <p className="font-medium">{(district.population || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t.communities}</p>
                    <p className="font-medium">{district.communities_count || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t.coordinator}</p>
                    <p className="font-medium">{district.coordinator_name}</p>
                  </div>
                </div>
                
                {(district.latitude && district.longitude) && (
                  <div className="text-xs text-muted-foreground">
                    📍 {district.latitude.toFixed(4)}, {district.longitude.toFixed(4)}
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    {t.established}: {district.established_date || 'Not set'}
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
      )}
    </div>
  );
}