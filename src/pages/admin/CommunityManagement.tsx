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
import { Building2, Users, Plus, Search, MapPin, Calendar, TrendingUp, Settings, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Community {
  id: string;
  name: string;
  type: 'residential' | 'commercial' | 'mixed';
  address: string;
  totalUnits: number;
  occupiedUnits: number;
  managementFee: number;
  establishedDate: string;
  status: 'active' | 'under-construction' | 'planning';
}

export default function CommunityManagement() {
  const { language } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);

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
      viewDetails: 'View Details',
      communityDetails: 'Community Details',
      basicInfo: 'Basic Information',
      statistics: 'Statistics',
      close: 'Close'
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
      viewDetails: 'Lihat Butiran',
      communityDetails: 'Butiran Komuniti',
      basicInfo: 'Maklumat Asas',
      statistics: 'Statistik',
      close: 'Tutup'
    }
  };

  const t = text[language];

  const mockCommunities: Community[] = [
    {
      id: '1',
      name: 'Skyline Residences',
      type: 'residential',
      address: 'Jalan Bukit Bintang, 50200 Kuala Lumpur',
      totalUnits: 350,
      occupiedUnits: 295,
      managementFee: 450,
      establishedDate: '2020-03-15',
      status: 'active'
    },
    {
      id: '2',
      name: 'Metro Business Center',
      type: 'commercial',
      address: 'Jalan Ampang, 50450 Kuala Lumpur',
      totalUnits: 120,
      occupiedUnits: 95,
      managementFee: 850,
      establishedDate: '2019-08-20',
      status: 'active'
    },
    {
      id: '3',
      name: 'Garden Heights',
      type: 'mixed',
      address: 'Jalan Tun Razak, 50400 Kuala Lumpur',
      totalUnits: 200,
      occupiedUnits: 145,
      managementFee: 550,
      establishedDate: '2021-12-10',
      status: 'under-construction'
    }
  ];

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

  const filteredCommunities = mockCommunities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         community.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || community.type === selectedType;
    return matchesSearch && matchesType;
  });

  const totalStats = {
    totalUnits: mockCommunities.reduce((sum, c) => sum + c.totalUnits, 0),
    occupiedUnits: mockCommunities.reduce((sum, c) => sum + c.occupiedUnits, 0),
    totalRevenue: mockCommunities.reduce((sum, c) => sum + (c.occupiedUnits * c.managementFee), 0),
    avgFee: mockCommunities.reduce((sum, c) => sum + c.managementFee, 0) / mockCommunities.length
  };

  const handleCreateCommunity = () => {
    toast({
      title: t.communityCreated,
    });
    setIsCreateOpen(false);
  };

  const handleViewDetails = (community: Community) => {
    setSelectedCommunity(community);
    setIsViewDetailsOpen(true);
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
                <Input id="name" placeholder={t.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">{t.type}</Label>
                <Select>
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
                <Textarea id="address" placeholder={t.address} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalUnits">{t.totalUnits}</Label>
                  <Input id="totalUnits" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managementFee">{t.managementFee}</Label>
                  <Input id="managementFee" type="number" placeholder="0" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t.description}</Label>
                <Textarea id="description" placeholder={t.description} rows={3} />
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
            <CardTitle className="text-sm font-medium">{t.totalRevenue}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RM{totalStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Monthly</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.avgFee}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RM{Math.round(totalStats.avgFee)}</div>
            <p className="text-xs text-muted-foreground">Per unit</p>
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
                  <Badge className={getTypeColor(community.type)}>
                    {getTypeText(community.type)}
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
                  <p className="font-medium">{community.totalUnits}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t.occupiedUnits}</p>
                  <p className="font-medium">{community.occupiedUnits}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t.occupancy}</p>
                  <p className="font-medium">
                    {Math.round((community.occupiedUnits / community.totalUnits) * 100)}%
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t.managementFee}</p>
                  <p className="font-medium">RM{community.managementFee}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  {t.establishedDate}: {community.establishedDate}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(community)}>
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
      </div>

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{t.communityDetails}</DialogTitle>
            <DialogDescription>
              {selectedCommunity?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCommunity && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t.basicInfo}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">{t.name}</Label>
                      <p className="mt-1">{selectedCommunity.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">{t.type}</Label>
                      <div className="mt-1">
                        <Badge className={getTypeColor(selectedCommunity.type)}>
                          {getTypeText(selectedCommunity.type)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">{t.status}</Label>
                      <div className="mt-1">
                        <Badge className={getStatusColor(selectedCommunity.status)}>
                          {getStatusText(selectedCommunity.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">{t.address}</Label>
                      <p className="mt-1 text-sm">{selectedCommunity.address}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">{t.establishedDate}</Label>
                      <p className="mt-1">{new Date(selectedCommunity.establishedDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">{t.managementFee}</Label>
                      <p className="mt-1">RM{selectedCommunity.managementFee}/month</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t.statistics}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{t.totalUnits}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedCommunity.totalUnits}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{t.occupiedUnits}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedCommunity.occupiedUnits}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{t.occupancyRate}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {Math.round((selectedCommunity.occupiedUnits / selectedCommunity.totalUnits) * 100)}%
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      RM{(selectedCommunity.occupiedUnits * selectedCommunity.managementFee).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {selectedCommunity.occupiedUnits} units × RM{selectedCommunity.managementFee}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsViewDetailsOpen(false)}>
                  {t.close}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}