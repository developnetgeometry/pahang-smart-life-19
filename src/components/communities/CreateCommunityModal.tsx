import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CalendarIcon, Loader2, ChevronDown, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
// Map picking is temporarily disabled per request
// import mapboxgl from 'mapbox-gl';
// import 'mapbox-gl/dist/mapbox-gl.css';

interface CreateCommunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  districtId: string;
  onSuccess?: () => void;
}

export default function CreateCommunityModal({ 
  open, 
  onOpenChange, 
  districtId, 
  onSuccess 
}: CreateCommunityModalProps) {
  const { language } = useAuth();
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState<string>('');
  const [checkingName, setCheckingName] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  // const [mapOpen, setMapOpen] = useState(false);
  // const mapContainer = useState<HTMLDivElement | null>(null)[0] as any;
  // const mapRef = useState<mapboxgl.Map | null>(null)[0] as any;
  // const markerRef = useState<mapboxgl.Marker | null>(null)[0] as any;
  // const mapContainerRef = (node: HTMLDivElement | null) => {
  //   (CreateCommunityModal as any)._mapContainer = node;
  // };
  // const getMapContainer = () => (CreateCommunityModal as any)._mapContainer as HTMLDivElement | null;
  // const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    community_type: 'residential',
    address: '',
    description: '',
    total_units: '',
    occupied_units: '',
    postal_code: '',
    latitude: '',
    longitude: '',
    established_date: new Date(),
    status: 'active'
  });

  const text = {
    en: {
      createCommunity: 'Create Community',
      communityDetails: 'Enter the details for the new community in this district.',
      name: 'Community Name',
      namePlaceholder: 'Enter community name',
      type: 'Type',
      address: 'Address',
      addressPlaceholder: 'Enter community address',
      description: 'Description',
      descriptionPlaceholder: 'Enter community description',
      totalUnits: 'Total Units (No. of Houses)',
      totalUnitsPlaceholder: 'Number of units',
      occupiedUnits: 'Occupied Units',
      occupiedUnitsPlaceholder: 'Number of occupied units',
      postalCode: 'Postal Code',
      postalCodePlaceholder: 'Enter postal code',
      establishedDate: 'Established Date',
      selectDate: 'Select date',
      latitude: 'Latitude',
      latitudePlaceholder: 'Enter latitude',
      longitude: 'Longitude',
      longitudePlaceholder: 'Enter longitude',
      city: 'City',
      cityPlaceholder: 'Enter city',
      country: 'Country',
      countryPlaceholder: 'Enter country',
      status: 'Status',
      active: 'Active',
      planning: 'Planning',
      development: 'Development',
      residential: 'Residential',
      commercial: 'Commercial',
      mixed: 'Mixed Use',
      industrial: 'Industrial',
      advancedDetails: 'Advanced Details',
      typeDescription: 'Helps categorize the community for reporting and management',
      cancel: 'Cancel',
      create: 'Create Community',
      creating: 'Creating...',
      // pickOnMap: 'Pick on map',
      // useMyLocation: 'Use my location',
      nameRequired: 'Community name is required',
      duplicateName: 'This community is already registered in this district',
      checkingName: 'Checking availability...',
      success: 'Community created successfully',
      error: 'Failed to create community'
    },
    ms: {
      createCommunity: 'Cipta Komuniti',
      communityDetails: 'Masukkan butiran untuk komuniti baru dalam daerah ini.',
      name: 'Nama Komuniti',
      namePlaceholder: 'Masukkan nama komuniti',
      type: 'Jenis',
      address: 'Alamat',
      addressPlaceholder: 'Masukkan alamat komuniti',
      description: 'Penerangan',
      descriptionPlaceholder: 'Masukkan penerangan komuniti',
      totalUnits: 'Jumlah Unit (Bilangan Rumah)',
      totalUnitsPlaceholder: 'Bilangan unit',
      occupiedUnits: 'Unit Diduduki',
      occupiedUnitsPlaceholder: 'Bilangan unit diduduki',
      postalCode: 'Poskod',
      postalCodePlaceholder: 'Masukkan poskod',
      establishedDate: 'Tarikh Ditubuhkan',
      selectDate: 'Pilih tarikh',
      latitude: 'Latitud',
      latitudePlaceholder: 'Masukkan latitud',
      longitude: 'Longitud',
      longitudePlaceholder: 'Masukkan longitud',
      city: 'Bandar',
      cityPlaceholder: 'Masukkan bandar',
      country: 'Negara',
      countryPlaceholder: 'Masukkan negara',
      status: 'Status',
      active: 'Aktif',
      planning: 'Perancangan',
      development: 'Pembangunan',
      residential: 'Kediaman',
      commercial: 'Komersial',
      mixed: 'Penggunaan Campuran',
      industrial: 'Perindustrian',
      advancedDetails: 'Butiran Lanjutan',
      typeDescription: 'Membantu mengkategorikan komuniti untuk pelaporan dan pengurusan',
      cancel: 'Batal',
      create: 'Cipta Komuniti',
      creating: 'Mencipta...',
      // pickOnMap: 'Pilih pada peta',
      // useMyLocation: 'Guna lokasi saya',
      nameRequired: 'Nama komuniti diperlukan',
      duplicateName: 'Komuniti ini sudah didaftarkan dalam daerah ini',
      checkingName: 'Semak ketersediaan...',
      success: 'Komuniti berjaya dicipta',
      error: 'Gagal mencipta komuniti'
    }
  };

  const t = text[language];

  // Mapbox token fetch (disabled)
  // useEffect(() => {
  //   const fetchToken = async () => {
  //     try {
  //       const { data, error } = await supabase.functions.invoke('get-mapbox-token');
  //       if (error) return;
  //       setMapboxToken(data.token);
  //     } catch (e) {
  //       console.warn('Mapbox token not available');
  //     }
  //   };
  //   if (open) fetchToken();
  // }, [open]);

  // Initialize map when popover opens (disabled)
  // useEffect(() => {
  //   if (!mapOpen || !mapboxToken) return;
  //   const container = getMapContainer();
  //   if (!container) return;
  //   if ((CreateCommunityModal as any)._map) return; // already initialized
  //   mapboxgl.accessToken = mapboxToken;
  //   const map = new mapboxgl.Map({
  //     container,
  //     style: 'mapbox://styles/mapbox/streets-v12',
  //     center: [101.6869, 3.139],
  //     zoom: 10,
  //   });
  //   (CreateCommunityModal as any)._map = map;
  //   map.addControl(new mapboxgl.NavigationControl(), 'top-right');
  //   map.on('click', (e) => {
  //     const { lng, lat } = e.lngLat;
  //     setFormData(prev => ({ ...prev, latitude: String(lat), longitude: String(lng) }));
  //     let marker = (CreateCommunityModal as any)._marker as mapboxgl.Marker | null;
  //     if (marker) marker.remove();
  //     marker = new mapboxgl.Marker({ draggable: true }).setLngLat([lng, lat]).addTo(map);
  //     marker.on('dragend', () => {
  //       const ll = marker!.getLngLat();
  //       setFormData(prev => ({ ...prev, latitude: String(ll.lat), longitude: String(ll.lng) }));
  //     });
  //     (CreateCommunityModal as any)._marker = marker;
  //   });
  // }, [mapOpen, mapboxToken]);

  // const useMyLocation = () => {
  //   if (!navigator.geolocation) {
  //     toast.error('Geolocation not supported');
  //     return;
  //   }
  //   navigator.geolocation.getCurrentPosition((pos) => {
  //     const { latitude, longitude } = pos.coords;
  //     setFormData(prev => ({ ...prev, latitude: String(latitude), longitude: String(longitude) }));
  //     const map = (CreateCommunityModal as any)._map as mapboxgl.Map | null;
  //     if (map) map.flyTo({ center: [longitude, latitude], zoom: 14 });
  //     let marker = (CreateCommunityModal as any)._marker as mapboxgl.Marker | null;
  //     if (marker) marker.remove();
  //     if ((CreateCommunityModal as any)._map) {
  //       marker = new mapboxgl.Marker({ draggable: true }).setLngLat([longitude, latitude]).addTo((CreateCommunityModal as any)._map);
  //       marker.on('dragend', () => {
  //         const ll = marker!.getLngLat();
  //         setFormData(prev => ({ ...prev, latitude: String(ll.lat), longitude: String(ll.lng) }));
  //       });
  //       (CreateCommunityModal as any)._marker = marker;
  //     }
  //   }, () => toast.error('Unable to get current location'));
  // };

  // Debounced name check
  const checkNameAvailability = useCallback(async (name: string) => {
    if (!name.trim() || name.trim().length < 2) {
      setNameError('');
      return;
    }

    setCheckingName(true);
    setNameError('');

    try {
      const { data: existingCommunity } = await supabase
        .from('communities')
        .select('id')
        .eq('district_id', districtId)
        .eq('is_active', true)
        .ilike('name', name.trim())
        .maybeSingle();

      if (existingCommunity) {
        setNameError(t.duplicateName);
      } else {
        setNameError('');
      }
    } catch (error) {
      console.error('Error checking name availability:', error);
    } finally {
      setCheckingName(false);
    }
  }, [districtId, t.duplicateName]);

  // Debounce name checking
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.name.trim()) {
        checkNameAvailability(formData.name);
      } else {
        setNameError('');
        setCheckingName(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.name, checkNameAvailability]);

  // Reset errors when modal opens/closes
  useEffect(() => {
    if (!open) {
      setNameError('');
      setCheckingName(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error(t.nameRequired);
      return;
    }

    if (nameError) {
      toast.error(nameError);
      return;
    }

    // Basic validation: occupied cannot exceed total
    const total = formData.total_units ? parseInt(formData.total_units) : 0;
    const occupied = formData.occupied_units ? parseInt(formData.occupied_units) : 0;
    if (occupied > total) {
      toast.error('Occupied units cannot exceed total units');
      return;
    }

    // Coordinates validation (if provided)
    const lat = formData.latitude ? parseFloat(formData.latitude) : null;
    const lng = formData.longitude ? parseFloat(formData.longitude) : null;
    if (lat !== null && (isNaN(lat) || lat < -90 || lat > 90)) {
      toast.error('Latitude must be between -90 and 90');
      return;
    }
    if (lng !== null && (isNaN(lng) || lng < -180 || lng > 180)) {
      toast.error('Longitude must be between -180 and 180');
      return;
    }

    setLoading(true);
    
    try {

      const { error } = await supabase
        .from('communities')
        .insert({
          name: formData.name.trim(),
          community_type: formData.community_type,
          address: formData.address.trim() || null,
          description: formData.description.trim() || null,
          total_units: formData.total_units ? parseInt(formData.total_units) : 0,
          occupied_units: formData.occupied_units ? parseInt(formData.occupied_units) : 0,
          postal_code: formData.postal_code.trim() || null,
          latitude: lat,
          longitude: lng,
          established_date: formData.established_date.toISOString().split('T')[0],
          district_id: districtId,
          status: formData.status,
          is_active: true
        });

      if (error) {
        // Handle unique constraint violation (duplicate name)
        if (error.code === '23505' && error.message.includes('idx_communities_unique_name_per_district')) {
          toast.error(t.duplicateName);
          return;
        }
        throw error;
      }

      toast.success(t.success);
      onOpenChange(false);
      onSuccess?.();
      
      // Reset form
      setFormData({
        name: '',
        community_type: 'residential',
        address: '',
        description: '',
        total_units: '',
        occupied_units: '',
        postal_code: '',
        latitude: '',
        longitude: '',
        established_date: new Date(),
        status: 'active'
      });
    } catch (error) {
      console.error('Error creating community:', error);
      toast.error(t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t.createCommunity}</DialogTitle>
          <DialogDescription>{t.communityDetails}</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Essential Details */}
          <div className="space-y-4">
            {/* Community Name */}
            <div>
              <Label htmlFor="name">{t.name} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t.namePlaceholder}
                required
                disabled={loading}
                className={nameError ? 'border-destructive' : ''}
              />
              {checkingName && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {t.checkingName}
                </p>
              )}
              {nameError && (
                <p className="text-xs text-destructive mt-1">{nameError}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address">{t.address}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder={t.addressPlaceholder}
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">{t.description}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t.descriptionPlaceholder}
                rows={3}
                disabled={loading}
              />
            </div>
          </div>

          {/* Advanced Details - Collapsible */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <div role="button" className="flex items-center justify-between w-full px-2 py-1 rounded-md bg-muted text-foreground select-none">
                <span className="text-sm font-medium">{t.advancedDetails}</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", showAdvanced && "rotate-180")} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Community Type */}
                <div>
                  <Label htmlFor="type">{t.type}</Label>
                  <Select 
                    value={formData.community_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, community_type: value }))}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">{t.residential}</SelectItem>
                      <SelectItem value="commercial">{t.commercial}</SelectItem>
                      <SelectItem value="mixed">{t.mixed}</SelectItem>
                      <SelectItem value="industrial">{t.industrial}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">{t.typeDescription}</p>
                </div>

                {/* Coordinates */}
                <div className="relative">
                  <Label htmlFor="latitude">{t.latitude}</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.000001"
                    min="-90"
                    max="90"
                    value={formData.latitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                    placeholder={t.latitudePlaceholder}
                    disabled={loading}
                  />
                </div>
                <div className="relative">
                  <Label htmlFor="longitude">{t.longitude}</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.000001"
                    min="-180"
                    max="180"
                    value={formData.longitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                    placeholder={t.longitudePlaceholder}
                    disabled={loading}
                  />
                </div>
                {/* Map picking temporarily disabled
                <div className="sm:col-span-2 flex items-center gap-2">
                  ... pick on map / use my location ...
                </div>
                */}

                {/* Total Units */}
                <div>
                  <Label htmlFor="totalUnits">{t.totalUnits}</Label>
                  <Input
                    id="totalUnits"
                    type="number"
                    min="0"
                    value={formData.total_units}
                    onChange={(e) => setFormData(prev => ({ ...prev, total_units: e.target.value }))}
                    placeholder={t.totalUnitsPlaceholder}
                    disabled={loading}
                  />
                </div>

                {/* Occupied Units */}
                <div>
                  <Label htmlFor="occupiedUnits">{t.occupiedUnits}</Label>
                  <Input
                    id="occupiedUnits"
                    type="number"
                    min="0"
                    value={formData.occupied_units}
                    onChange={(e) => setFormData(prev => ({ ...prev, occupied_units: e.target.value }))}
                    placeholder={t.occupiedUnitsPlaceholder}
                    disabled={loading}
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <Label htmlFor="postalCode">{t.postalCode}</Label>
                  <Input
                    id="postalCode"
                    value={formData.postal_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                    placeholder={t.postalCodePlaceholder}
                    disabled={loading}
                  />
                </div>

                {/* Established Date */}
                <div>
                  <Label>{t.establishedDate}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.established_date && "text-muted-foreground"
                        )}
                        disabled={loading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.established_date ? (
                          format(formData.established_date, "PPP")
                        ) : (
                          <span>{t.selectDate}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.established_date}
                        onSelect={(date) => date && setFormData(prev => ({ ...prev, established_date: date }))}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Status */}
                <div>
                  <Label htmlFor="status">{t.status}</Label>
                  <Select 
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                    disabled={loading}
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
            </CollapsibleContent>
          </Collapsible>

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t.cancel}
            </Button>
            <Button type="submit" disabled={loading || checkingName || !!nameError}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t.creating}
                </>
              ) : (
                t.create
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
