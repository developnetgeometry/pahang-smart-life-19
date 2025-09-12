import { useState } from 'react';
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
import { Map as MapIcon, MapPin, Search, Building, Users, Loader2, Eye, RefreshCw } from 'lucide-react';
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate(`/admin/district/${district.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {t.view}
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
      
      {/* Edit District Modal */}
      <Dialog open={!!editingDistrict} onOpenChange={(open) => !open && setEditingDistrict(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit District - {editingDistrict?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="3.1390"
                  value={editForm.latitude}
                  onChange={(e) => setEditForm({ ...editForm, latitude: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="101.6869"
                  value={editForm.longitude}
                  onChange={(e) => setEditForm({ ...editForm, longitude: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="District address..."
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                placeholder="25000"
                value={editForm.postal_code}
                onChange={(e) => setEditForm({ ...editForm, postal_code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="District description..."
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditingDistrict(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateDistrict} disabled={isUpdating}>
                {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update District
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}