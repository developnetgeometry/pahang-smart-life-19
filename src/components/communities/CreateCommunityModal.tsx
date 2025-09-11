import { useState } from 'react';
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
import { CalendarIcon, Loader2, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    community_type: 'residential',
    address: '',
    description: '',
    total_units: '',
    postal_code: '',
    established_date: new Date(),
    latitude: '',
    longitude: '',
    city: '',
    country: 'Malaysia'
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
      totalUnits: 'Total Units',
      totalUnitsPlaceholder: 'Number of units',
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
      residential: 'Residential',
      commercial: 'Commercial',
      mixed: 'Mixed Use',
      industrial: 'Industrial',
      advancedDetails: 'Advanced Details',
      typeDescription: 'Helps categorize the community for reporting and management',
      cancel: 'Cancel',
      create: 'Create Community',
      creating: 'Creating...',
      nameRequired: 'Community name is required',
      duplicateName: 'A community with this name already exists in this district',
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
      totalUnits: 'Jumlah Unit',
      totalUnitsPlaceholder: 'Bilangan unit',
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
      residential: 'Kediaman',
      commercial: 'Komersial',
      mixed: 'Penggunaan Campuran',
      industrial: 'Perindustrian',
      advancedDetails: 'Butiran Lanjutan',
      typeDescription: 'Membantu mengkategorikan komuniti untuk pelaporan dan pengurusan',
      cancel: 'Batal',
      create: 'Cipta Komuniti',
      creating: 'Mencipta...',
      nameRequired: 'Nama komuniti diperlukan',
      duplicateName: 'Komuniti dengan nama ini sudah wujud dalam daerah ini',
      success: 'Komuniti berjaya dicipta',
      error: 'Gagal mencipta komuniti'
    }
  };

  const t = text[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error(t.nameRequired);
      return;
    }

    setLoading(true);
    
    try {
      // Pre-check for existing community with same name in district
      const { data: existingCommunity } = await supabase
        .from('communities')
        .select('id')
        .eq('district_id', districtId)
        .eq('is_active', true)
        .ilike('name', formData.name.trim())
        .maybeSingle();

      if (existingCommunity) {
        toast.error(t.duplicateName);
        return;
      }

      const { error } = await supabase
        .from('communities')
        .insert({
          name: formData.name.trim(),
          community_type: formData.community_type,
          address: formData.address.trim() || null,
          description: formData.description.trim() || null,
          total_units: formData.total_units ? parseInt(formData.total_units) : 0,
          postal_code: formData.postal_code.trim() || null,
          established_date: formData.established_date.toISOString().split('T')[0],
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          district_id: districtId,
          status: 'active',
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
        postal_code: '',
        established_date: new Date(),
        latitude: '',
        longitude: '',
        city: '',
        country: 'Malaysia'
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
              />
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
              <Button variant="ghost" type="button" className="flex items-center justify-between w-full p-0 h-auto">
                <span className="text-sm font-medium">{t.advancedDetails}</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", showAdvanced && "rotate-180")} />
              </Button>
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

                {/* City */}
                <div>
                  <Label htmlFor="city">{t.city}</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder={t.cityPlaceholder}
                    disabled={loading}
                  />
                </div>

                {/* Country */}
                <div>
                  <Label htmlFor="country">{t.country}</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    placeholder={t.countryPlaceholder}
                    disabled={loading}
                  />
                </div>

                {/* Latitude */}
                <div>
                  <Label htmlFor="latitude">{t.latitude}</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                    placeholder={t.latitudePlaceholder}
                    disabled={loading}
                  />
                </div>

                {/* Longitude */}
                <div>
                  <Label htmlFor="longitude">{t.longitude}</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                    placeholder={t.longitudePlaceholder}
                    disabled={loading}
                  />
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
            <Button type="submit" disabled={loading}>
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