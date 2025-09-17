import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/use-user-roles';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, MapPin, Users, Building, Calendar, Map as MapIcon, Settings, Plus, Loader2, Filter, UserCheck, Pencil, Trash2, UserPlus, Globe, Hash, UserMinus, Edit } from 'lucide-react';
import { toast } from 'sonner';
import CreateCommunityModal from '@/components/communities/CreateCommunityModal';
import EditCommunityModal from '@/components/communities/EditCommunityModal';
import EditDistrictModal from '@/components/districts/EditDistrictModal';
import AssignCommunityAdminModal from '@/components/districts/AssignCommunityAdminModal';
import { useDistricts } from '@/hooks/use-districts';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';

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
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
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
  // Derived fields for admin assignment indicator
  has_admin?: boolean;
  admin_name?: string;
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
  const [editCommunityId, setEditCommunityId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Community | null>(null);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [communityToReassign, setCommunityToReassign] = useState<Community | null>(null);
  const [removingAdmin, setRemovingAdmin] = useState<string | null>(null);

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
      latitude: 'Latitude',
      longitude: 'Longitude',
      coordinates: 'Coordinates',
      status: 'Status',
      type: 'Type',
      address: 'Address',
      description: 'Description',
      location: 'Location',
      city: 'City',
      state: 'State',
      country: 'Country',
      postalCode: 'Postal Code',
      districtCode: 'District Code',
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
      unassigned: 'Unassigned',
      adminAssigned: 'Admin Assigned',
      adminLabel: 'Admin',
      viewOnMap: 'View on map',
      notSet: 'Not set',
      additional: 'Additional',
      reassignAdmin: 'Reassign Admin',
      removeAdmin: 'Remove Admin',
      confirmRemoveAdmin: 'Are you sure you want to remove the admin assignment from this community?',
      adminRemoved: 'Admin assignment removed successfully',
      removeAdminFailed: 'Failed to remove admin assignment'
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
      latitude: 'Latitud',
      longitude: 'Longitud',
      coordinates: 'Koordinat',
      status: 'Status',
      type: 'Jenis',
      address: 'Alamat',
      description: 'Penerangan',
      location: 'Lokasi',
      city: 'Bandar',
      state: 'Negeri',
      country: 'Negara',
      postalCode: 'Poskod',
      districtCode: 'Kod Daerah',
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
      unassigned: 'Belum Ditetapkan',
      adminAssigned: 'Pentadbir Ditugaskan',
      adminLabel: 'Pentadbir',
      viewOnMap: 'Lihat pada peta',
      notSet: 'Belum ditetapkan',
      additional: 'Maklumat Lain',
      reassignAdmin: 'Tugaskan Semula Pentadbir',
      removeAdmin: 'Buang Pentadbir',
      confirmRemoveAdmin: 'Adakah anda pasti mahu membuang tugasan pentadbir dari komuniti ini?',
      adminRemoved: 'Tugasan pentadbir berjaya dibuang',
      removeAdminFailed: 'Gagal membuang tugasan pentadbir'
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
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching communities:', error);
        return;
      }

      const communitiesData = data || [];

      // Fetch profiles linked to these communities to detect assigned admins
      if (communitiesData.length > 0) {
        const communityIds = communitiesData.map((c) => c.id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, community_id')
          .in('community_id', communityIds);

        if (profilesError) {
          console.error('Error fetching community admins:', profilesError);
        }

        const adminByCommunity = new Map<string, { id: string; full_name: string }>();
        (profiles || []).forEach((p: any) => {
          if (p.community_id && !adminByCommunity.has(p.community_id)) {
            adminByCommunity.set(p.community_id, { id: p.id, full_name: p.full_name });
          }
        });

        const withAdmin = communitiesData.map((c) => ({
          ...c,
          has_admin: adminByCommunity.has(c.id),
          admin_name: adminByCommunity.get(c.id)?.full_name,
        }));

        setCommunities(withAdmin as Community[]);
        setFilteredCommunities(withAdmin as Community[]);
      } else {
        setCommunities([]);
        setFilteredCommunities([]);
      }
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

  const formatCoordinates = (lat?: number | null, lng?: number | null) => {
    const hasLat = typeof lat === 'number';
    const hasLng = typeof lng === 'number';
    if (!hasLat && !hasLng) return t.notSet;
    const latStr = hasLat ? lat!.toFixed(6) : '-';
    const lngStr = hasLng ? lng!.toFixed(6) : '-';
    return `${latStr}, ${lngStr}`;
  };

  type IconType = React.ComponentType<{ className?: string }>;
  const InfoRow = ({
    icon: Icon,
    label,
    value,
  }: { icon: IconType; label: string; value?: string | number | null }) => {
    if (!value && value !== 0) return null;
    return (
      <div className="flex items-start justify-between py-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4" />
          <span className="text-sm">{label}</span>
        </div>
        <div className="text-sm font-medium text-right max-w-[65%] break-words">
          {String(value)}
        </div>
      </div>
    );
  };

  // Filter communities when type filter changes
  useEffect(() => {
    if (typeFilter === 'all') {
      setFilteredCommunities(communities);
    } else {
      setFilteredCommunities(communities.filter(community => community.community_type === typeFilter));
    }
  }, [communities, typeFilter]);

  // Function to remove admin assignment from a community
  const handleRemoveAdmin = async (communityId: string) => {
    try {
      setRemovingAdmin(communityId);
      
      // Update profiles to remove community_id assignment
      const { error } = await supabase
        .from('profiles')
        .update({ community_id: null })
        .eq('community_id', communityId);

      if (error) {
        console.error('Error removing admin assignment:', error);
        toast.error(t.removeAdminFailed);
        return;
      }

      toast.success(t.adminRemoved);
      
      // Refresh communities to update the UI
      fetchCommunities();
    } catch (error) {
      console.error('Error removing admin assignment:', error);
      toast.error(t.removeAdminFailed);
    } finally {
      setRemovingAdmin(null);
    }
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
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
            <div className="flex items-center gap-3">
              <Globe className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t.latitude}</p>
                <p className="text-xl font-semibold">
                  {district.latitude ? `${Number(district.latitude).toFixed(6)}°` : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t.longitude}</p>
                <p className="text-xl font-semibold">
                  {district.longitude ? `${Number(district.longitude).toFixed(6)}°` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg border bg-muted/30 p-4">
              <h4 className="text-sm font-semibold mb-2">{t.location}</h4>
              <div className="divide-y">
                <InfoRow icon={Hash} label={t.districtCode} value={district.code || t.notSet} />
                <InfoRow icon={MapPin} label={`${t.city}/${t.state}`} value={([district.city, district.state].filter(Boolean).join(', ')) || t.notSet} />
                <InfoRow icon={Globe} label={`${t.postalCode}/${t.country}`} value={([district.postal_code, district.country].filter(Boolean).join(', ')) || t.notSet} />
                <InfoRow icon={MapIcon} label={t.address} value={district.address || t.notSet} />
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <h4 className="text-sm font-semibold mb-2">{t.additional}</h4>
              <div className="divide-y">
                <InfoRow icon={Users} label={t.coordinator} value={district.coordinator_name || t.unassigned} />
                <InfoRow icon={Building} label={t.totalCommunities} value={communities.length} />
                <InfoRow icon={MapIcon} label={t.type} value={getTypeText(district.district_type)} />
                <InfoRow icon={Settings} label={t.status} value={getStatusText(district.status)} />
              </div>
              {district.description && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium mb-1">{t.description}</h5>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{district.description}</p>
                </div>
              )}
            </div>
          </div>
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
                <Card key={community.id} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 hover:border-l-blue-600">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold text-gray-900 truncate">
                          {community.name}
                        </CardTitle>
                        <CardDescription className="text-xs text-gray-600 mt-1">
                          {getTypeText(community.community_type)}
                        </CardDescription>
                        <div className="flex gap-1 mt-2">
                          <Badge className={`${getStatusColor(community.status || 'active')} text-xs px-2 py-0.5`} variant="secondary">
                            {getStatusText(community.status)}
                          </Badge>
                          {community.has_admin ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 text-xs px-2 py-0.5">
                              <UserCheck className="h-3 w-3 mr-1" /> {t.adminAssigned}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs px-2 py-0.5">
                              <UserPlus className="h-3 w-3 mr-1" /> {t.unassigned}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {canManage && (
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7 opacity-60 hover:opacity-100"
                            onClick={() => setEditCommunityId(community.id)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-7 w-7 opacity-60 hover:opacity-100 hover:text-red-600" 
                                onClick={() => setDeleteTarget(community)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete community?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action will deactivate the community "{deleteTarget?.name}". You can re-create it later if needed.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={async () => {
                                  if (!deleteTarget) return;
                                  const { error } = await supabase
                                    .from('communities')
                                    .update({ is_active: false })
                                    .eq('id', deleteTarget.id);
                                  if (error) {
                                    toast.error('Failed to delete community');
                                    return;
                                  }
                                  setCommunities(prev => prev.filter(c => c.id !== deleteTarget.id));
                                  setFilteredCommunities(prev => prev.filter(c => c.id !== deleteTarget.id));
                                  setDeleteTarget(null);
                                  toast.success('Community deleted');
                                }}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {/* Statistics */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-gray-900">{community.total_units || 0}</div>
                          <div className="text-xs text-gray-600">{t.totalUnits}</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-gray-900">
                            {community.total_units 
                              ? `${Math.round(((community.occupied_units || 0) / community.total_units) * 100)}%`
                              : '0%'
                            }
                          </div>
                          <div className="text-xs text-gray-600">{t.occupancy}</div>
                        </div>
                      </div>

                      {/* Admin Info */}
                      {community.has_admin && (
                        <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-3 w-3 text-green-600" />
                            <span className="text-xs font-medium text-green-800">{t.adminLabel}</span>
                          </div>
                          <div className="text-xs text-green-700 mt-1 truncate">{community.admin_name || '-'}</div>
                        </div>
                      )}

                      {/* Established Date */}
                      <div className="text-xs text-gray-500">
                        {t.established}: {community.established_date 
                          ? new Date(community.established_date).getFullYear()
                          : 'Not set'
                        }
                      </div>

                      {/* Action Buttons */}
                      {canManage && (
                        <div className="flex gap-1 pt-2">
                          {!community.has_admin ? (
                            <Button 
                              size="sm" 
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs h-8"
                              onClick={() => {
                                setSelectedCommunity(community);
                                setShowAssignModal(true);
                              }}
                            >
                              <UserPlus className="h-3 w-3 mr-1" />
                              Assign Admin
                            </Button>
                          ) : (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="flex-1 text-xs h-8"
                                onClick={() => {
                                  setCommunityToReassign(community);
                                  setShowReassignModal(true);
                                }}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                {t.reassignAdmin}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                                    disabled={removingAdmin === community.id}
                                  >
                                    {removingAdmin === community.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <UserMinus className="h-3 w-3" />
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{t.removeAdmin}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t.confirmRemoveAdmin}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      className="bg-red-600 hover:bg-red-700"
                                      onClick={() => handleRemoveAdmin(community.id)}
                                    >
                                      {t.removeAdmin}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
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

      <EditCommunityModal
        open={!!editCommunityId}
        onOpenChange={(open) => !open && setEditCommunityId(null)}
        communityId={editCommunityId}
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
      
      {/* Reassign Admin Modal - reuses the same component */}
      <AssignCommunityAdminModal
        open={showReassignModal}
        onOpenChange={setShowReassignModal}
        community={communityToReassign}
        districtId={id!}
        onSuccess={() => {
          // Refresh community data after reassignment
          fetchCommunities();
          setCommunityToReassign(null);
        }}
      />
      
      {/* Reassign Admin Modal */}
      <AssignCommunityAdminModal
        open={showReassignModal}
        onOpenChange={setShowReassignModal}
        community={communityToReassign}
        districtId={id!}
        onSuccess={() => {
          // Refresh any community admin data if needed
          fetchCommunities();
          setCommunityToReassign(null);
        }}
      />
    </div>
  );
}
