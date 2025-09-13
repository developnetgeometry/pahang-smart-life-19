import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/use-user-roles';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, MapPin, Users, Building, Calendar, Map as MapIcon, Settings, Plus, Loader2, Filter } from 'lucide-react';
import { toast } from 'sonner';
import CreateCommunityModal from '@/components/communities/CreateCommunityModal';
import EditDistrictModal from '@/components/districts/EditDistrictModal';
import AssignCommunityAdminModal from '@/components/districts/AssignCommunityAdminModal';
import { useDistricts } from '@/hooks/use-districts';

interface District {
  id: string;
  name: string;
  code?: string;
  area?: number;
  area_km2?: number;
  population?: number;
  communities_count?: number;
  coordinator_id?: string;
  coordinator_name?: string;
  established_date?: string;
  status?: string;
  district_type?: string;
  address?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

interface Community {
  id: string;
  name: string;
  community_type?: string;
  total_units?: number;
  occupied_units?: number;
  status?: string;
  established_date?: string;
}

export default function DistrictDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useAuth();
  const { hasRole } = useUserRoles();
  const [district, setDistrict] = useState<District | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [communitiesLoading, setCommunitiesLoading] = useState(true);
  const { updateDistrict } = useDistricts();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);

  const text = {
    en: {
      backToDistricts: 'Back to Districts',
      districtDetails: 'District Details',
      overview: 'Overview',
      communities: 'Communities in District',
      area: 'Area',
      population: 'Population',
      totalCommunities: 'Total Communities',
      coordinator: 'Coordinator',
      established: 'Established',
      status: 'Status',
      type: 'Type',
      address: 'Address',
      description: 'Description',
      addCommunity: 'Add Community',
      editDistrict: 'Edit District',
      settings: 'Settings',
      active: 'Active',
      planning: 'Planning',
      development: 'Development',
      urban: 'Urban',
      suburban: 'Suburban',
      rural: 'Rural',
      residential: 'Residential',
      commercial: 'Commercial',
      mixed: 'Mixed',
      industrial: 'Industrial',
      filterByType: 'Filter by Type',
      allTypes: 'All Types',
      totalUnits: 'Total Units',
      occupancy: 'Occupancy',
      districtNotFound: 'District not found',
      loadingError: 'Error loading district details',
      noCommunities: 'No communities found in this district',
      unassigned: 'Unassigned'
    },
    ms: {
      backToDistricts: 'Kembali ke Daerah',
      districtDetails: 'Butiran Daerah',
      overview: 'Gambaran Keseluruhan',
      communities: 'Komuniti dalam Daerah',
      area: 'Keluasan',
      population: 'Penduduk',
      totalCommunities: 'Jumlah Komuniti',
      coordinator: 'Penyelaras',
      established: 'Ditubuhkan',
      status: 'Status',
      type: 'Jenis',
      address: 'Alamat',
      description: 'Penerangan',
      addCommunity: 'Tambah Komuniti',
      editDistrict: 'Edit Daerah',
      settings: 'Tetapan',
      active: 'Aktif',
      planning: 'Perancangan',
      development: 'Pembangunan',
      urban: 'Bandar',
      suburban: 'Pinggir Bandar',
      rural: 'Luar Bandar',
      residential: 'Kediaman',
      commercial: 'Komersial',
      mixed: 'Campuran',
      industrial: 'Perindustrian',
      filterByType: 'Tapis mengikut Jenis',
      allTypes: 'Semua Jenis',
      totalUnits: 'Jumlah Unit',
      occupancy: 'Penghunian',
      districtNotFound: 'Daerah tidak dijumpai',
      loadingError: 'Ralat memuatkan butiran daerah',
      noCommunities: 'Tiada komuniti dijumpai dalam daerah ini',
      unassigned: 'Belum Ditetapkan'
    }
  };

  const t = text[language];

  // Check role permissions
  const canManage = hasRole('state_admin') || hasRole('district_coordinator');

  useEffect(() => {
    if (!id) {
      navigate('/admin/districts');
      return;
    }
    fetchDistrictDetails();
    fetchCommunities();
  }, [id, navigate]);

  const fetchDistrictDetails = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('districts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching district:', error);
        toast.error(t.loadingError);
        return;
      }

      if (!data) {
        toast.error(t.districtNotFound);
        navigate('/admin/districts');
        return;
      }

      setDistrict(data);
    } catch (error) {
      console.error('Error fetching district:', error);
      toast.error(t.loadingError);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunities = async () => {
    try {
      setCommunitiesLoading(true);
      
      const { data, error } = await supabase
        .from('communities')
        .select('id, name, community_type, total_units, occupied_units, status, established_date')
        .eq('district_id', id)
        .order('name');

      if (error) {
        console.error('Error fetching communities:', error);
        return;
      }

      setCommunities(data || []);
      setFilteredCommunities(data || []);
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setCommunitiesLoading(false);
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urban': return 'bg-blue-100 text-blue-800';
      case 'suburban': return 'bg-green-100 text-green-800';
      case 'rural': return 'bg-yellow-100 text-yellow-800';
      case 'residential': return 'bg-purple-100 text-purple-800';
      case 'commercial': return 'bg-orange-100 text-orange-800';
      case 'mixed': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const getTypeText = (type?: string) => {
    switch (type) {
      case 'urban': return t.urban;
      case 'suburban': return t.suburban;
      case 'rural': return t.rural;
      case 'residential': return t.residential;
      case 'commercial': return t.commercial;
      case 'mixed': return t.mixed;
      case 'industrial': return t.industrial;
      default: return type || '';
    }
  };

  // Filter communities when type filter changes
  useEffect(() => {
    if (typeFilter === 'all') {
      setFilteredCommunities(communities);
    } else {
      setFilteredCommunities(communities.filter(community => community.community_type === typeFilter));
    }
  }, [communities, typeFilter]);

  if (!hasRole('state_admin') && !hasRole('district_coordinator')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You need appropriate privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!district) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">{t.districtNotFound}</h2>
          <Button onClick={() => navigate('/admin/districts')}>
            {t.backToDistricts}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/districts')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToDistricts}
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{district.name}</h1>
            <p className="text-muted-foreground flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {district.code || 'No code'}
            </p>
          </div>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowEditModal(true)}>
              <Settings className="h-4 w-4 mr-2" />
              {t.editDistrict}
            </Button>
          </div>
        )}
      </div>

      {/* District Overview */}
      <Card>
        <CardHeader>
          <CardTitle>{t.overview}</CardTitle>
          <CardDescription>
            <div className="flex gap-2 mt-2">
              <Badge className={getTypeColor(district.district_type || 'urban')}>
                {getTypeText(district.district_type)}
              </Badge>
              <Badge className={getStatusColor(district.status || 'active')}>
                {getStatusText(district.status)}
              </Badge>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <MapIcon className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t.area}</p>
                <p className="text-xl font-semibold">{district.area_km2 || 0} km²</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t.population}</p>
                <p className="text-xl font-semibold">{(district.population || 0).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t.totalCommunities}</p>
                <p className="text-xl font-semibold">{communities.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t.established}</p>
                <p className="text-xl font-semibold">
                  {district.established_date 
                    ? new Date(district.established_date).getFullYear()
                    : 'Not set'
                  }
                </p>
              </div>
            </div>
          </div>

          {(district.address || district.description) && (
            <div className="mt-6 space-y-4">
              {district.address && (
                <div>
                  <h4 className="text-sm font-medium mb-2">{t.address}</h4>
                  <p className="text-sm text-muted-foreground">{district.address}</p>
                </div>
              )}
              {district.description && (
                <div>
                  <h4 className="text-sm font-medium mb-2">{t.description}</h4>
                  <p className="text-sm text-muted-foreground">{district.description}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Communities Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>{t.communities}</CardTitle>
              <CardDescription>
                {filteredCommunities.length} of {communities.length} communities {typeFilter !== 'all' && `(filtered by ${getTypeText(typeFilter)})`}
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              {/* Type Filter */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder={t.filterByType} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allTypes}</SelectItem>
                    <SelectItem value="residential">{t.residential}</SelectItem>
                    <SelectItem value="commercial">{t.commercial}</SelectItem>
                    <SelectItem value="mixed">{t.mixed}</SelectItem>
                    <SelectItem value="industrial">{t.industrial}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {canManage && (
                <Button size="sm" onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  {t.addCommunity}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {communitiesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredCommunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCommunities.map((community) => (
                <Card key={community.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{community.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {getTypeText(community.community_type)}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(community.status || 'active')} variant="secondary">
                        {getStatusText(community.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2 text-sm flex-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t.totalUnits}:</span>
                            <span className="font-medium">{community.total_units || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t.occupancy}:</span>
                            <span className="font-medium">
                              {community.total_units 
                                ? `${Math.round(((community.occupied_units || 0) / community.total_units) * 100)}%`
                                : '0%'
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t.established}:</span>
                            <span className="font-medium">
                              {community.established_date 
                                ? new Date(community.established_date).getFullYear()
                                : 'Not set'
                              }
                            </span>
                          </div>
                        </div>
                        {canManage && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedCommunity(community);
                              setShowAssignModal(true);
                            }}
                          >
                            Assign Admin
                          </Button>
                        )}
                      </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.noCommunities}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateCommunityModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        districtId={id!}
        onSuccess={fetchCommunities}
      />
      
      <EditDistrictModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        district={district}
        onSuccess={fetchDistrictDetails}
        onUpdate={updateDistrict}
      />
      
      <AssignCommunityAdminModal
        open={showAssignModal}
        onOpenChange={setShowAssignModal}
        community={selectedCommunity}
        districtId={id!}
        onSuccess={() => {
          // Refresh any community admin data if needed
          fetchCommunities();
        }}
      />
    </div>
  );
}