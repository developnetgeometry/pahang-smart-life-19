import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Building, MapPin, Phone, Mail, FileText } from 'lucide-react';

interface BusinessSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

interface District {
  id: string;
  name: string;
}

interface Community {
  id: string;
  name: string;
  district_id: string;
}

export function BusinessSetupModal({ open, onOpenChange, onComplete }: BusinessSetupModalProps) {
  const { language } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [districts, setDistricts] = useState<District[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [formData, setFormData] = useState({
    businessName: '',
    businessRegistrationNumber: '',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    businessType: '',
    licenseNumber: '',
    serviceAreas: [] as string[],
    serveAllAreas: false
  });

  const text = {
    en: {
      title: 'Complete Your Business Profile',
      subtitle: 'Set up your business information to start offering services',
      businessName: 'Business Name',
      registrationNumber: 'Registration Number',
      businessAddress: 'Business Address', 
      businessPhone: 'Business Phone',
      businessEmail: 'Business Email',
      businessType: 'Business Type',
      licenseNumber: 'License Number (Optional)',
      serviceAreas: 'Service Areas',
      serveAllAreas: 'I serve all areas',
      selectAreas: 'Select specific areas you serve:',
      businessTypes: {
        cleaning: 'Cleaning Services',
        maintenance: 'Maintenance & Repairs',
        delivery: 'Delivery Services',
        security: 'Security Services',
        gardening: 'Gardening & Landscaping',
        catering: 'Catering Services',
        automotive: 'Automotive Services',
        health: 'Health & Wellness',
        education: 'Education & Training',
        other: 'Other Services'
      },
      save: 'Complete Setup',
      cancel: 'Cancel'
    },
    ms: {
      title: 'Lengkapkan Profil Perniagaan Anda',
      subtitle: 'Sediakan maklumat perniagaan untuk mula menawarkan perkhidmatan',
      businessName: 'Nama Perniagaan',
      registrationNumber: 'Nombor Pendaftaran',
      businessAddress: 'Alamat Perniagaan',
      businessPhone: 'Telefon Perniagaan', 
      businessEmail: 'Emel Perniagaan',
      businessType: 'Jenis Perniagaan',
      licenseNumber: 'Nombor Lesen (Pilihan)',
      serviceAreas: 'Kawasan Perkhidmatan',
      serveAllAreas: 'Saya berkhidmat di semua kawasan',
      selectAreas: 'Pilih kawasan khusus yang anda layani:',
      businessTypes: {
        cleaning: 'Perkhidmatan Pembersihan',
        maintenance: 'Penyelenggaraan & Pembaikan',
        delivery: 'Perkhidmatan Penghantaran',
        security: 'Perkhidmatan Keselamatan', 
        gardening: 'Berkebun & Landskap',
        catering: 'Perkhidmatan Katering',
        automotive: 'Perkhidmatan Automotif',
        health: 'Kesihatan & Kesejahteraan',
        education: 'Pendidikan & Latihan',
        other: 'Perkhidmatan Lain'
      },
      save: 'Selesaikan Persediaan',
      cancel: 'Batal'
    }
  };

  const t = text[language];

  useEffect(() => {
    if (open) {
      fetchDistrictsAndCommunities();
    }
  }, [open]);

  const fetchDistrictsAndCommunities = async () => {
    try {
      const [{ data: districtsData }, { data: communitiesData }] = await Promise.all([
        supabase.from('districts').select('id, name').order('name'),
        supabase.from('communities').select('id, name, district_id').order('name')
      ]);

      setDistricts(districtsData || []);
      setCommunities(communitiesData || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const handleServiceAreaChange = (areaId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        serviceAreas: [...prev.serviceAreas, areaId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        serviceAreas: prev.serviceAreas.filter(id => id !== areaId)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use the setup_service_provider function
      const { data, error } = await supabase.rpc('setup_service_provider', {
        p_business_name: formData.businessName,
        p_service_areas: formData.serveAllAreas ? [] : formData.serviceAreas,
        p_business_type: formData.businessType || null
      });

      if (error) throw error;

      // Update the business profile with additional details
      const { error: updateError } = await supabase
        .from('service_provider_businesses')
        .update({
          business_registration_number: formData.businessRegistrationNumber || null,
          business_address: formData.businessAddress || null,
          business_phone: formData.businessPhone || null,
          business_email: formData.businessEmail || null,
          license_number: formData.licenseNumber || null
        })
        .eq('id', data);

      if (updateError) throw updateError;

      toast({
        title: language === 'en' ? 'Success' : 'Berjaya',
        description: language === 'en' 
          ? 'Business profile created successfully!' 
          : 'Profil perniagaan berjaya dicipta!'
      });

      onComplete?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating business profile:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: error.message || (language === 'en' 
          ? 'Failed to create business profile' 
          : 'Gagal mencipta profil perniagaan'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            {t.title}
          </DialogTitle>
          <DialogDescription>
            {t.subtitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="businessName">{t.businessName} *</Label>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
              required
              placeholder="Enter your business name"
            />
          </div>

          {/* Registration Number */}
          <div className="space-y-2">
            <Label htmlFor="registrationNumber">{t.registrationNumber}</Label>
            <Input
              id="registrationNumber"
              value={formData.businessRegistrationNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, businessRegistrationNumber: e.target.value }))}
              placeholder="Optional business registration number"
            />
          </div>

          {/* Business Type */}
          <div className="space-y-2">
            <Label>{t.businessType}</Label>
            <Select 
              value={formData.businessType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(t.businessTypes).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessPhone">{t.businessPhone}</Label>
              <Input
                id="businessPhone"
                type="tel"
                value={formData.businessPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, businessPhone: e.target.value }))}
                placeholder="+60123456789"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessEmail">{t.businessEmail}</Label>
              <Input
                id="businessEmail"
                type="email"
                value={formData.businessEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, businessEmail: e.target.value }))}
                placeholder="business@example.com"
              />
            </div>
          </div>

          {/* Business Address */}
          <div className="space-y-2">
            <Label htmlFor="businessAddress">{t.businessAddress}</Label>
            <Textarea
              id="businessAddress"
              value={formData.businessAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, businessAddress: e.target.value }))}
              placeholder="Enter your business address"
              rows={3}
            />
          </div>

          {/* License Number */}
          <div className="space-y-2">
            <Label htmlFor="licenseNumber">{t.licenseNumber}</Label>
            <Input
              id="licenseNumber"
              value={formData.licenseNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
              placeholder="Professional license or certification number"
            />
          </div>

          {/* Service Areas */}
          <div className="space-y-4">
            <Label>{t.serviceAreas}</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="serveAllAreas"
                checked={formData.serveAllAreas}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ 
                    ...prev, 
                    serveAllAreas: !!checked,
                    serviceAreas: checked ? [] : prev.serviceAreas 
                  }))
                }
              />
              <Label htmlFor="serveAllAreas">{t.serveAllAreas}</Label>
            </div>

            {!formData.serveAllAreas && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{t.selectAreas}</p>
                
                {districts.map(district => (
                  <div key={district.id} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`district-${district.id}`}
                        checked={formData.serviceAreas.includes(district.id)}
                        onCheckedChange={(checked) => handleServiceAreaChange(district.id, !!checked)}
                      />
                      <Label htmlFor={`district-${district.id}`} className="font-medium">
                        {district.name} (District)
                      </Label>
                    </div>
                    
                    {/* Communities in this district */}
                    <div className="ml-6 space-y-1">
                      {communities
                        .filter(community => community.district_id === district.id)
                        .map(community => (
                          <div key={community.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`community-${community.id}`}
                              checked={formData.serviceAreas.includes(community.id)}
                              onCheckedChange={(checked) => handleServiceAreaChange(community.id, !!checked)}
                            />
                            <Label htmlFor={`community-${community.id}`} className="text-sm">
                              {community.name}
                            </Label>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t.cancel}
            </Button>
            <Button type="submit" disabled={loading || !formData.businessName}>
              {loading ? 'Saving...' : t.save}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}