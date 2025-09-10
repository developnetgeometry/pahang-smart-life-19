import { useState } from 'react';
import { useAuth, Language } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Loader2, UserCheck } from 'lucide-react';

export default function CompleteAccount() {
  const { user, language, loadProfileAndRoles } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    phone: '',
    unit_number: '',
    family_size: 1,
    emergency_contact_name: '',
    emergency_contact_phone: '',
    vehicle_number: '',
    language_preference: (language as Language) || 'ms'
  });

  const text = {
    en: {
      title: 'Complete Your Account',
      subtitle: 'Please provide the following information to complete your account setup',
      phone: 'Phone Number',
      unitNumber: 'Unit Number',
      familySize: 'Family Size',
      emergencyContactName: 'Emergency Contact Name',
      emergencyContactPhone: 'Emergency Contact Phone',
      vehicleNumber: 'Vehicle Number (Optional)',
      languagePreference: 'Language Preference',
      english: 'English',
      malay: 'Bahasa Malaysia',
      complete: 'Complete Account',
      completing: 'Completing Account...',
      success: 'Account completed successfully!',
      error: 'Failed to complete account',
      required: 'This field is required'
    },
    ms: {
      title: 'Lengkapkan Akaun Anda',
      subtitle: 'Sila berikan maklumat berikut untuk melengkapkan persediaan akaun anda',
      phone: 'Nombor Telefon',
      unitNumber: 'Nombor Unit',
      familySize: 'Saiz Keluarga',
      emergencyContactName: 'Nama Hubungan Kecemasan',
      emergencyContactPhone: 'Telefon Hubungan Kecemasan',
      vehicleNumber: 'Nombor Kenderaan (Pilihan)',
      languagePreference: 'Pilihan Bahasa',
      english: 'Bahasa Inggeris',
      malay: 'Bahasa Malaysia',
      complete: 'Lengkapkan Akaun',
      completing: 'Melengkapkan Akaun...',
      success: 'Akaun berjaya dilengkapkan!',
      error: 'Gagal melengkapkan akaun',
      required: 'Medan ini diperlukan'
    }
  };

  const t = text[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.phone || !form.unit_number || !form.emergency_contact_name || !form.emergency_contact_phone) {
      toast({
        title: 'Error',
        description: t.required,
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          phone: form.phone,
          unit_number: form.unit_number,
          family_size: form.family_size,
          emergency_contact_name: form.emergency_contact_name,
          emergency_contact_phone: form.emergency_contact_phone,
          vehicle_number: form.vehicle_number || null,
          language_preference: form.language_preference,
          account_status: 'approved'
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: t.success,
        description: 'Welcome to the community management system!'
      });

      // Reload profile and roles to update auth context
      await loadProfileAndRoles();
      
      // Navigate to home page
      navigate('/');
      
    } catch (error) {
      console.error('Error completing account:', error);
      toast({
        title: 'Error',
        description: t.error,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>{t.title}</CardTitle>
          <CardDescription className="text-center">
            {t.subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">{t.phone} *</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+60123456789"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_number">{t.unitNumber} *</Label>
              <Input
                id="unit_number"
                value={form.unit_number}
                onChange={(e) => setForm({ ...form, unit_number: e.target.value })}
                placeholder="A-10-05"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="family_size">{t.familySize} *</Label>
              <Input
                id="family_size"
                type="number"
                min="1"
                max="20"
                value={form.family_size}
                onChange={(e) => setForm({ ...form, family_size: parseInt(e.target.value) || 1 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_contact_name">{t.emergencyContactName} *</Label>
              <Input
                id="emergency_contact_name"
                value={form.emergency_contact_name}
                onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_contact_phone">{t.emergencyContactPhone} *</Label>
              <Input
                id="emergency_contact_phone"
                type="tel"
                value={form.emergency_contact_phone}
                onChange={(e) => setForm({ ...form, emergency_contact_phone: e.target.value })}
                placeholder="+60123456789"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_number">{t.vehicleNumber}</Label>
              <Input
                id="vehicle_number"
                value={form.vehicle_number}
                onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })}
                placeholder="ABC 1234"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language_preference">{t.languagePreference} *</Label>
              <Select 
                value={form.language_preference} 
                onValueChange={(value) => setForm({ ...form, language_preference: value as Language })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t.english}</SelectItem>
                  <SelectItem value="ms">{t.malay}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.completing}
                </>
              ) : (
                t.complete
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}