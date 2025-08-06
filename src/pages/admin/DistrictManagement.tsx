import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Map, MapPin, Plus, Search, Building, Users, Calendar, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface District {
  id: string;
  name: string;
  code: string;
  area: number; // in sq km
  population: number;
  communities: number;
  coordinator: string;
  established: string;
  status: 'active' | 'planning' | 'development';
  type: 'urban' | 'suburban' | 'rural';
}

export default function DistrictManagement() {
  const { language } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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

  const mockDistricts: District[] = [
    {
      id: '1',
      name: 'Bukit Bintang',
      code: 'BB001',
      area: 15.2,
      population: 45000,
      communities: 12,
      coordinator: 'Ahmad Rahman',
      established: '2019-03-15',
      status: 'active',
      type: 'urban'
    },
    {
      id: '2',
      name: 'Petaling Jaya',
      code: 'PJ002',
      area: 97.2,
      population: 125000,
      communities: 28,
      coordinator: 'Lim Wei Ming',
      established: '2018-06-20',
      status: 'active',
      type: 'suburban'
    },
    {
      id: '3',
      name: 'Kajang Selatan',
      code: 'KS003',
      area: 45.8,
      population: 35000,
      communities: 8,
      coordinator: 'Siti Aminah',
      established: '2020-12-10',
      status: 'development',
      type: 'suburban'
    }
  ];

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

  const getTypeText = (type: string) => {
    switch (type) {
      case 'urban': return t.urban;
      case 'suburban': return t.suburban;
      case 'rural': return t.rural;
      default: return type;
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

  const filteredDistricts = mockDistricts.filter(district => {
    const matchesSearch = district.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         district.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || district.type === selectedType;
    return matchesSearch && matchesType;
  });

  const totalStats = {
    totalArea: mockDistricts.reduce((sum, d) => sum + d.area, 0),
    totalPopulation: mockDistricts.reduce((sum, d) => sum + d.population, 0),
    totalCommunities: mockDistricts.reduce((sum, d) => sum + d.communities, 0),
    avgPopulation: mockDistricts.reduce((sum, d) => sum + d.population, 0) / mockDistricts.length
  };

  const handleCreateDistrict = () => {
    toast({
      title: t.districtCreated,
    });
    setIsCreateOpen(false);
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
                  <Input id="name" placeholder={t.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">{t.code}</Label>
                  <Input id="code" placeholder="e.g., BB001" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">{t.type}</Label>
                <Select>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area">{t.area} (km²)</Label>
                  <Input id="area" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="population">{t.population}</Label>
                  <Input id="population" type="number" placeholder="0" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="coordinator">{t.coordinator}</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectCoordinator} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ahmad">Ahmad Rahman</SelectItem>
                    <SelectItem value="lim">Lim Wei Ming</SelectItem>
                    <SelectItem value="siti">Siti Aminah</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t.description}</Label>
                <Textarea id="description" placeholder={t.description} rows={3} />
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
            <Map className="h-4 w-4 text-muted-foreground" />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDistricts.map((district) => (
          <Card key={district.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{district.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {district.code}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={getTypeColor(district.type)}>
                    {getTypeText(district.type)}
                  </Badge>
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
                  <p className="font-medium">{district.area} km²</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t.population}</p>
                  <p className="font-medium">{district.population.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t.communities}</p>
                  <p className="font-medium">{district.communities}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t.coordinator}</p>
                  <p className="font-medium">{district.coordinator}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  {t.established}: {district.established}
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