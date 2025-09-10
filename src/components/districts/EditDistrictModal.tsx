import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { District } from '@/hooks/use-districts';

interface EditDistrictModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  district: District | null;
  onSuccess: () => void;
  onUpdate: (id: string, updates: Partial<District>) => Promise<boolean>;
}

export default function EditDistrictModal({ 
  open, 
  onOpenChange, 
  district, 
  onSuccess, 
  onUpdate 
}: EditDistrictModalProps) {
  const { language } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    district_type: 'urban' as 'urban' | 'suburban' | 'rural',
    area_km2: '',
    population: '',
    address: '',
    description: '',
    city: '',
    country: '',
    latitude: '',
    longitude: '',
    established_date: null as Date | null,
    status: 'active' as 'active' | 'planning' | 'development'
  });

  const text = {
    en: {
      editDistrict: 'Edit District',
      editSubtitle: 'Update district information',
      name: 'District Name',
      code: 'District Code',
      type: 'Type',
      status: 'Status',
      area: 'Area',
      population: 'Population',
      city: 'City',
      country: 'Country',
      latitude: 'Latitude',
      longitude: 'Longitude',
      establishedDate: 'Established Date',
      selectDate: 'Select date',
      address: 'Address',
      description: 'Description',
      active: 'Active',
      planning: 'Planning',
      development: 'Development',
      urban: 'Urban',
      suburban: 'Suburban',
      rural: 'Rural',
      save: 'Save Changes',
      cancel: 'Cancel',
      updating: 'Updating...'
    },
    ms: {
      editDistrict: 'Edit Daerah',
      editSubtitle: 'Kemaskini maklumat daerah',
      name: 'Nama Daerah',
      code: 'Kod Daerah',
      type: 'Jenis',
      status: 'Status',
      area: 'Keluasan',
      population: 'Penduduk',
      city: 'Bandar',
      country: 'Negara',
      latitude: 'Latitud',
      longitude: 'Longitud',
      establishedDate: 'Tarikh Ditubuhkan',
      selectDate: 'Pilih tarikh',
      address: 'Alamat',
      description: 'Penerangan',
      active: 'Aktif',
      planning: 'Perancangan',
      development: 'Pembangunan',
      urban: 'Bandar',
      suburban: 'Pinggir Bandar',
      rural: 'Luar Bandar',
      save: 'Simpan Perubahan',
      cancel: 'Batal',
      updating: 'Mengemaskini...'
    }
  };

  const t = text[language];

  useEffect(() => {
    if (district && open) {
      setFormData({
        name: district.name || '',
        code: district.code || '',
        district_type: (district.district_type as any) || 'urban',
        area_km2: district.area_km2?.toString() || district.area?.toString() || '',
        population: district.population?.toString() || '',
        address: district.address || '',
        description: district.description || '',
        city: district.city || '',
        country: district.country || '',
        latitude: district.latitude?.toString() || '',
        longitude: district.longitude?.toString() || '',
        established_date: district.established_date ? new Date(district.established_date) : null,
        status: (district.status as any) || 'active'
      });
    }
  }, [district, open]);

  const handleSubmit = async () => {
    if (!district) return;

    setLoading(true);
    try {
      const updateData: Partial<District> = {
        name: formData.name,
        code: formData.code || undefined,
        district_type: formData.district_type,
        area_km2: formData.area_km2 ? parseFloat(formData.area_km2) : undefined,
        population: formData.population ? parseInt(formData.population) : undefined,
        address: formData.address || undefined,
        description: formData.description || undefined,
        city: formData.city || undefined,
        country: formData.country || undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        established_date: formData.established_date ? formData.established_date.toISOString().split('T')[0] : undefined,
        status: formData.status
      };

      const success = await onUpdate(district.id, updateData);
      if (success) {
        onOpenChange(false);
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{t.editDistrict}</DialogTitle>
          <DialogDescription>{t.editSubtitle}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">{t.name} *</Label>
              <Input 
                id="edit-name" 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-code">{t.code}</Label>
              <Input 
                id="edit-code" 
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.type}</Label>
              <Select 
                value={formData.district_type}
                onValueChange={(value: 'urban' | 'suburban' | 'rural') => 
                  setFormData(prev => ({ ...prev, district_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urban">{t.urban}</SelectItem>
                  <SelectItem value="suburban">{t.suburban}</SelectItem>
                  <SelectItem value="rural">{t.rural}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t.status}</Label>
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
              <Label htmlFor="edit-area">{t.area} (km²)</Label>
              <Input 
                id="edit-area" 
                type="number" 
                step="0.01"
                value={formData.area_km2}
                onChange={(e) => setFormData(prev => ({ ...prev, area_km2: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-population">{t.population}</Label>
              <Input 
                id="edit-population" 
                type="number" 
                value={formData.population}
                onChange={(e) => setFormData(prev => ({ ...prev, population: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-city">{t.city}</Label>
              <Input 
                id="edit-city" 
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-country">{t.country}</Label>
              <Input 
                id="edit-country" 
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-latitude">{t.latitude}</Label>
              <Input 
                id="edit-latitude" 
                type="number" 
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-longitude">{t.longitude}</Label>
              <Input 
                id="edit-longitude" 
                type="number" 
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
            <Label htmlFor="edit-address">{t.address}</Label>
            <Textarea 
              id="edit-address" 
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">{t.description}</Label>
            <Textarea 
              id="edit-description" 
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t.cancel}
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !formData.name}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.updating}
              </>
            ) : (
              t.save
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}