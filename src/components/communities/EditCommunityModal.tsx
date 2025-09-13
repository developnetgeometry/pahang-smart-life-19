import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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

interface EditCommunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityId: string | null;
  onSuccess?: () => void;
}

export default function EditCommunityModal({ open, onOpenChange, communityId, onSuccess }: EditCommunityModalProps) {
  const { language } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    community_type: 'residential',
    address: '',
    description: '',
    total_units: '',
    occupied_units: '',
    postal_code: '',
    established_date: new Date(),
    status: 'active'
  });

  const t = {
    en: {
      title: 'Edit Community',
      desc: 'Update the community details and save changes.',
      name: 'Community Name',
      type: 'Type',
      address: 'Address',
      description: 'Description',
      totalUnits: 'Total Units (No. of Houses)',
      occupiedUnits: 'Occupied Units',
      postalCode: 'Postal Code',
      establishedDate: 'Established Date',
      
      status: 'Status',
      residential: 'Residential',
      commercial: 'Commercial',
      mixed: 'Mixed Use',
      industrial: 'Industrial',
      active: 'Active',
      planning: 'Planning',
      development: 'Development',
      cancel: 'Cancel',
      save: 'Save Changes',
      saving: 'Saving...',
      loadError: 'Failed to load community details',
      success: 'Community updated successfully',
      error: 'Failed to update community'
    },
    ms: {
      title: 'Edit Komuniti',
      desc: 'Kemas kini butiran komuniti dan simpan perubahan.',
      name: 'Nama Komuniti',
      type: 'Jenis',
      address: 'Alamat',
      description: 'Penerangan',
      totalUnits: 'Jumlah Unit (Bilangan Rumah)',
      occupiedUnits: 'Unit Diduduki',
      postalCode: 'Poskod',
      establishedDate: 'Tarikh Ditubuhkan',
      
      status: 'Status',
      residential: 'Kediaman',
      commercial: 'Komersial',
      mixed: 'Penggunaan Campuran',
      industrial: 'Perindustrian',
      active: 'Aktif',
      planning: 'Perancangan',
      development: 'Pembangunan',
      cancel: 'Batal',
      save: 'Simpan Perubahan',
      saving: 'Menyimpan...',
      loadError: 'Gagal memuat butiran komuniti',
      success: 'Komuniti berjaya dikemas kini',
      error: 'Gagal mengemas kini komuniti'
    }
  }[language];

  useEffect(() => {
    const load = async () => {
      if (!open || !communityId) return;
      setInitializing(true);
      try {
        const { data, error } = await supabase
          .from('communities')
          .select('id, name, community_type, address, description, total_units, occupied_units, postal_code, established_date, status')
          .eq('id', communityId)
          .single();
        if (error) throw error;
        if (data) {
          setFormData({
            name: data.name || '',
            community_type: data.community_type || 'residential',
            address: data.address || '',
            description: data.description || '',
            total_units: (data.total_units ?? '').toString(),
            occupied_units: (data.occupied_units ?? '').toString(),
            postal_code: data.postal_code || '',
            established_date: data.established_date ? new Date(data.established_date) : new Date(),
            status: data.status || 'active'
          });
        }
      } catch (e) {
        console.error('Failed to load community', e);
        toast.error(t.loadError);
      } finally {
        setInitializing(false);
      }
    };
    load();
  }, [open, communityId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!communityId) return;
    const total = formData.total_units ? parseInt(formData.total_units) : 0;
    const occupied = formData.occupied_units ? parseInt(formData.occupied_units) : 0;
    if (occupied > total) {
      toast.error('Occupied units cannot exceed total units');
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        name: formData.name.trim(),
        community_type: formData.community_type,
        address: formData.address.trim() || null,
        description: formData.description.trim() || null,
        total_units: formData.total_units ? parseInt(formData.total_units) : 0,
        occupied_units: formData.occupied_units ? parseInt(formData.occupied_units) : 0,
        postal_code: formData.postal_code.trim() || null,
        established_date: formData.established_date ? formData.established_date.toISOString().split('T')[0] : null,
        status: formData.status,
      };

      const { error } = await supabase
        .from('communities')
        .update(payload)
        .eq('id', communityId);
      if (error) throw error;
      toast.success(t.success);
      onOpenChange(false);
      onSuccess?.();
    } catch (e) {
      console.error('Failed to update community', e);
      toast.error(t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.desc}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-6">
          {initializing ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">{t.name}</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData(p => ({...p, name: e.target.value}))} disabled={loading} />
                </div>
                <div>
                  <Label htmlFor="address">{t.address}</Label>
                  <Input id="address" value={formData.address} onChange={(e) => setFormData(p => ({...p, address: e.target.value}))} disabled={loading} />
                </div>
                <div>
                  <Label htmlFor="description">{t.description}</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData(p => ({...p, description: e.target.value}))} rows={3} disabled={loading} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">{t.type}</Label>
                    <Select value={formData.community_type} onValueChange={(v) => setFormData(p => ({...p, community_type: v}))} disabled={loading}>
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
                  <div>
                    <Label htmlFor="status">{t.status}</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData(p => ({...p, status: v}))} disabled={loading}>
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
                  <div>
                    <Label htmlFor="total_units">{t.totalUnits}</Label>
                    <Input id="total_units" type="number" min="0" value={formData.total_units} onChange={(e) => setFormData(p => ({...p, total_units: e.target.value}))} disabled={loading} />
                  </div>
                  <div>
                    <Label htmlFor="occupied_units">{t.occupiedUnits}</Label>
                    <Input id="occupied_units" type="number" min="0" value={formData.occupied_units} onChange={(e) => setFormData(p => ({...p, occupied_units: e.target.value}))} disabled={loading} />
                  </div>
                  <div>
                    <Label htmlFor="postal_code">{t.postalCode}</Label>
                    <Input id="postal_code" value={formData.postal_code} onChange={(e) => setFormData(p => ({...p, postal_code: e.target.value}))} disabled={loading} />
                  </div>
                  <div>
                    <Label>{t.establishedDate}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.established_date && "text-muted-foreground")} disabled={loading}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.established_date ? format(formData.established_date, 'PPP') : ''}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={formData.established_date} onSelect={(date) => date && setFormData(p => ({...p, established_date: date}))} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>{t.cancel}</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t.saving}</>) : t.save}
                </Button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
