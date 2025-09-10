import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/use-user-roles';
import { useDistricts } from '@/hooks/use-districts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Map as MapIcon, MapPin, Plus, Search, Building, Users, Calendar as CalendarIcon, Settings, Loader2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function DistrictManagement() {
  const navigate = useNavigate();
  const { language } = useAuth();
  const { hasRole } = useUserRoles();
  const { districts, loading, createDistrict } = useDistricts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    district_type: 'urban' as 'urban' | 'suburban' | 'rural',
    area_km2: '',
    population: '',
    coordinator_id: '',
    address: '',
    description: '',
    city: '',
    country: 'Malaysia',
    latitude: '',
    longitude: '',
    established_date: null as Date | null,
    status: 'active' as 'active' | 'planning' | 'development'
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
      avgPopulation: 'Avg Population',
      city: 'City',
      country: 'Country',
      latitude: 'Latitude',
      longitude: 'Longitude',
      establishedDate: 'Established Date',
      selectDate: 'Select date',
      address: 'Address'
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
      avgPopulation: 'Purata Penduduk',
      city: 'Bandar',
      country: 'Negara',
      latitude: 'Latitud',
      longitude: 'Longitud',
      establishedDate: 'Tarikh Ditubuhkan',
      selectDate: 'Pilih tarikh',
      address: 'Alamat'
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

  const filteredDistricts = districts.filter(district => {
    const matchesSearch = district.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (district.code?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesType = selectedType === 'all' || district.district_type === selectedType;
    return matchesSearch && matchesType;
  });

  const totalStats = {
    totalArea: districts.reduce((sum, d) => sum + (d.area_km2 || d.area || 0), 0),
    totalPopulation: districts.reduce((sum, d) => sum + (d.population || 0), 0),
    totalCommunities: districts.reduce((sum, d) => sum + (d.communities_count || 0), 0),
    avgPopulation: districts.length > 0 ? districts.reduce((sum, d) => sum + (d.population || 0), 0) / districts.length : 0
  };

  const handleCreateDistrict = async () => {
    if (!formData.name) {
      toast.error('District name is required');
      return;
    }

    const districtData = {
      name: formData.name,
      code: formData.code || undefined,
      district_type: formData.district_type,
      area_km2: formData.area_km2 ? parseFloat(formData.area_km2) : undefined,
      population: formData.population ? parseInt(formData.population) : undefined,
      coordinator_id: formData.coordinator_id || undefined,
      address: formData.address || undefined,
      description: formData.description || undefined,
      city: formData.city || undefined,
      country: formData.country || undefined,
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      established_date: formData.established_date ? formData.established_date.toISOString().split('T')[0] : undefined,
      status: formData.status
    };

    const success = await createDistrict(districtData);
    if (success) {
      setIsCreateOpen(false);
      setFormData({
        name: '',
        code: '',
        district_type: 'urban',
        area_km2: '',
        population: '',
        coordinator_id: '',
        address: '',
        description: '',
        city: '',
        country: 'Malaysia',
        latitude: '',
        longitude: '',
        established_date: null,
        status: 'active'
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
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t.name} *</Label>
                  <Input 
                    id="name" 
                    placeholder={t.name}
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">{t.code}</Label>
                  <Input 
                    id="code" 
                    placeholder="e.g., BB001"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">{t.type}</Label>
                  <Select 
                    value={formData.district_type}
                    onValueChange={(value: 'urban' | 'suburban' | 'rural') => 
                      setFormData(prev => ({ ...prev, district_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {districtTypes.slice(1).map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">{t.status}</Label>
                  <Select 
                    value={formData.status}
                    onValueChange={(value: 'active' | 'planning' | 'development') => 
                      setFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t.active}</SelectItem>
                      <SelectItem value="planning">{t.planning}</SelectItem>
                      <SelectItem value="development">{t.development}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area">{t.area} (km²)</Label>
                  <Input 
                    id="area" 
                    type="number" 
                    placeholder="0"
                    step="0.01"
                    value={formData.area_km2}
                    onChange={(e) => setFormData(prev => ({ ...prev, area_km2: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="population">{t.population}</Label>
                  <Input 
                    id="population" 
                    type="number" 
                    placeholder="0"
                    value={formData.population}
                    onChange={(e) => setFormData(prev => ({ ...prev, population: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">{t.city}</Label>
                  <Input 
                    id="city" 
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">{t.country}</Label>
                  <Input 
                    id="country" 
                    placeholder="Enter country"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">{t.latitude}</Label>
                  <Input 
                    id="latitude" 
                    type="number" 
                    placeholder="0.000000"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">{t.longitude}</Label>
                  <Input 
                    id="longitude" 
                    type="number" 
                    placeholder="0.000000"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t.establishedDate}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.established_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.established_date ? format(formData.established_date, "PPP") : t.selectDate}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.established_date}
                      onSelect={(date) => setFormData(prev => ({ ...prev, established_date: date }))}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{t.address}</Label>
                <Textarea 
                  id="address" 
                  placeholder="District address"
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t.description}</Label>
                <Textarea 
                  id="description" 
                  placeholder="District description"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4 border-t">
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
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
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
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
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

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin" />
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
                    <Badge className={getTypeColor(district.district_type || 'urban')}>
                      {getTypeText(district.district_type)}
                    </Badge>
                    <Badge className={getStatusColor(district.status || 'active')}>
                      {getStatusText(district.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">{t.area}</p>
                    <p className="font-medium">{district.area_km2 || district.area || 0} km²</p>
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
                    <p className="font-medium">Unassigned</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    {t.established}: {district.established_date ? new Date(district.established_date).toLocaleDateString() : 'Not set'}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/admin/districts/${district.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
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
          {!loading && filteredDistricts.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No districts found matching your criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}