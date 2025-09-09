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
import { CalendarIcon, Loader2 } from 'lucide-react';
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
  const [formData, setFormData] = useState({
    name: '',
    community_type: 'residential',
    address: '',
    description: '',
    total_units: '',
    postal_code: '',
    established_date: new Date()
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
      residential: 'Residential',
      commercial: 'Commercial',
      mixed: 'Mixed Use',
      industrial: 'Industrial',
      cancel: 'Cancel',
      create: 'Create Community',
      creating: 'Creating...',
      nameRequired: 'Community name is required',
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
      residential: 'Kediaman',
      commercial: 'Komersial',
      mixed: 'Penggunaan Campuran',
      industrial: 'Perindustrian',
      cancel: 'Batal',
      create: 'Cipta Komuniti',
      creating: 'Mencipta...',
      nameRequired: 'Nama komuniti diperlukan',
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
          district_id: districtId,
          status: 'active'
        });

      if (error) throw error;

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
        established_date: new Date()
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Community Name */}
            <div className="sm:col-span-2">
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

            {/* Address */}
            <div className="sm:col-span-2">
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
            <div className="sm:col-span-2">
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