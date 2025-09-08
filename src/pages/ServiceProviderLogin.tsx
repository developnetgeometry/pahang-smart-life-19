import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Building, Shield, Users, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function ServiceProviderLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [communityId, setCommunityId] = useState('');
  const [location, setLocation] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [pdpaAccepted, setPdpaAccepted] = useState(false);
  const [showPdpaDialog, setShowPdpaDialog] = useState(false);
  const [districts, setDistricts] = useState<Array<{id: string, name: string}>>([]);
  const [communities, setCommunities] = useState<Array<{id: string, name: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const { login, language, switchLanguage } = useAuth();
  const { t } = useTranslation(language || 'ms');
  const { toast } = useToast();

  // Load districts for registration
  useEffect(() => {
    const loadDistricts = async () => {
      const { data, error } = await supabase
        .from('districts')
        .select('id, name')
        .order('name');
      
      if (!error && data) {
        setDistricts(data);
      }
    };
    
    if (mode === 'signUp') {
      loadDistricts();
    }
  }, [mode]);

  // Load communities based on selected district
  useEffect(() => {
    const loadCommunities = async () => {
      if (!districtId) {
        setCommunities([]);
        setCommunityId('');
        return;
      }

      const { data, error } = await supabase
        .from('communities')
        .select('id, name')
        .eq('district_id', districtId)
        .order('name');
      
      if (!error && data) {
        setCommunities(data);
      }
    };
    
    if (mode === 'signUp' && districtId) {
      loadCommunities();
    }
  }, [mode, districtId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'signIn') {
        await login(email, password);
      } else {
        // Validate required fields for service provider registration
        if (!fullName.trim()) {
          throw new Error(language === 'en' ? 'Full name is required' : 'Nama penuh diperlukan');
        }
        if (!districtId) {
          throw new Error(language === 'en' ? 'Please select a district' : 'Sila pilih daerah');
        }
        if (!communityId) {
          throw new Error(language === 'en' ? 'Please select a community' : 'Sila pilih komuniti');
        }
        if (!location.trim()) {
          throw new Error(language === 'en' ? 'Location is required' : 'Lokasi diperlukan');
        }
        if (!businessName.trim()) {
          throw new Error(language === 'en' ? 'Business name is required' : 'Nama perniagaan diperlukan');
        }
        if (!businessType.trim()) {
          throw new Error(language === 'en' ? 'Business type is required' : 'Jenis perniagaan diperlukan');
        }
        if (!yearsOfExperience.trim()) {
          throw new Error(language === 'en' ? 'Years of experience is required' : 'Tahun pengalaman diperlukan');
        }
        if (!pdpaAccepted) {
          throw new Error(language === 'en' ? 'You must read and accept the PDPA to register' : 'Anda mesti membaca dan menerima PDPA untuk mendaftar');
        }

        const redirectUrl = `${window.location.origin}/`;
        
        // Pass all signup data as metadata including signup_flow for the trigger
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName.trim(),
              mobile_no: phone.trim() || null,
              district_id: districtId?.replace('district-', '') || districtId,
              community_id: communityId?.replace('community-', '') || communityId,
              address: location.trim(),
              language: language,
              pdpa_declare: pdpaAccepted,
              signup_flow: 'service_provider', // This tells the trigger to assign service_provider role
              business_name: businessName.trim(),
              business_type: businessType.trim(),
              business_description: `Service provider registered via signup`,
              experience_years: yearsOfExperience.trim()
            }
          }
        });
        
        if (signUpError) throw signUpError;
        
        if (authData.user) {
          // Show success message
          toast({
            title: language === 'en' ? 'Service Provider Account Created!' : 'Akaun Penyedia Perkhidmatan Dicipta!',
            description: language === 'en' 
              ? 'Your service provider account has been created and is pending approval. You will be able to sign in once approved by the community admin.'
              : 'Akaun penyedia perkhidmatan anda telah dicipta dan sedang menunggu kelulusan. Anda boleh log masuk setelah diluluskan oleh pentadbir komuniti.',
          });

          // Switch to sign in mode
          setMode('signIn');
          // Reset form fields
          setFullName('');
          setPhone('');
          setDistrictId('');
          setCommunityId('');
          setLocation('');
          setBusinessName('');
          setBusinessType('');
          setYearsOfExperience('');
          setPdpaAccepted(false);
          setPassword('');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full max-w-full overflow-x-hidden relative flex items-center justify-center p-4"
      style={{
        backgroundImage: `url('/lovable-uploads/7687f368-63da-4bc0-a610-d88851aebf13.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <Button
          variant={language === 'en' ? 'default' : 'outline'}
          size="sm"
          onClick={() => switchLanguage('en')}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          EN
        </Button>
        <Button
          variant={language === 'ms' ? 'default' : 'outline'}
          size="sm"
          onClick={() => switchLanguage('ms')}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          BM
        </Button>
      </div>

      {/* Back to Resident Login Link */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = '/login'}
          className="text-white hover:bg-white/20"
        >
          ← {language === 'en' ? 'Resident Login' : 'Login Penduduk'}
        </Button>
      </div>

      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Hero content */}
        <div className="text-center lg:text-left space-y-6 text-white">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur rounded-full px-4 py-2">
              <Building className="w-5 h-5" />
              <span className="font-medium">
                {language === 'en' ? 'Service Provider Portal' : 'Portal Penyedia Perkhidmatan'}
              </span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              {language === 'en' ? 'Business Hub' : 'Hub Perniagaan'}
            </h1>
            <p className="text-xl text-white/90 max-w-lg">
              {language === 'en' 
                ? 'Join our network of trusted service providers and grow your business within Pahang communities.'
                : 'Sertai rangkaian penyedia perkhidmatan yang dipercayai dan kembangkan perniagaan anda dalam komuniti Pahang.'
              }
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <Building className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">
                {language === 'en' ? 'Business Growth' : 'Pertumbuhan Perniagaan'}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">
                {language === 'en' ? 'Community Network' : 'Rangkaian Komuniti'}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <Shield className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">
                {language === 'en' ? 'Verified Provider' : 'Penyedia Disahkan'}
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-elegant border-white/20 bg-card/95 backdrop-blur">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                {mode === 'signIn'
                  ? (language === 'en' ? 'Service Provider Login' : 'Login Penyedia Perkhidmatan')
                  : (language === 'en' ? 'Register Business' : 'Daftar Perniagaan')}
              </CardTitle>
              <CardDescription>
                {mode === 'signIn'
                  ? (language === 'en' ? 'Access your service provider dashboard' : 'Akses papan pemuka penyedia perkhidmatan anda')
                  : (language === 'en' ? 'Join our trusted service provider network' : 'Sertai rangkaian penyedia perkhidmatan yang dipercayai')}
              </CardDescription>
              <div className="mt-2 flex justify-center gap-2">
                <Button type="button" variant={mode === 'signIn' ? 'default' : 'outline'} size="sm" onClick={() => setMode('signIn')}>
                  {language === 'en' ? 'Sign In' : 'Log Masuk'}
                </Button>
                <Button type="button" variant={mode === 'signUp' ? 'default' : 'outline'} size="sm" onClick={() => setMode('signUp')}>
                  {language === 'en' ? 'Register' : 'Daftar'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {mode === 'signUp' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">
                        {language === 'en' ? 'Full Name' : 'Nama Penuh'} *
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={language === 'en' ? 'Ahmad Razak bin Abdullah' : 'Ahmad Razak bin Abdullah'}
                        required
                        className="transition-smooth"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessName">
                        {language === 'en' ? 'Business Name' : 'Nama Perniagaan'} *
                      </Label>
                      <Input
                        id="businessName"
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder={language === 'en' ? 'ABC Services Sdn Bhd' : 'Perkhidmatan ABC Sdn Bhd'}
                        required
                        className="transition-smooth"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessType">
                        {language === 'en' ? 'Business Type' : 'Jenis Perniagaan'} *
                      </Label>
                      <Select value={businessType} onValueChange={setBusinessType} required>
                        <SelectTrigger className="transition-smooth">
                          <SelectValue placeholder={
                            language === 'en' ? 'Select business type' : 'Pilih jenis perniagaan'
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cleaning">
                            {language === 'en' ? 'Cleaning Services' : 'Perkhidmatan Pembersihan'}
                          </SelectItem>
                          <SelectItem value="maintenance">
                            {language === 'en' ? 'Maintenance & Repairs' : 'Penyelenggaraan & Pembaikan'}
                          </SelectItem>
                          <SelectItem value="landscaping">
                            {language === 'en' ? 'Landscaping' : 'Landskap'}
                          </SelectItem>
                          <SelectItem value="security">
                            {language === 'en' ? 'Security Services' : 'Perkhidmatan Keselamatan'}
                          </SelectItem>
                          <SelectItem value="delivery">
                            {language === 'en' ? 'Delivery Services' : 'Perkhidmatan Penghantaran'}
                          </SelectItem>
                          <SelectItem value="other">
                            {language === 'en' ? 'Other' : 'Lain-lain'}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="yearsOfExperience">
                        {language === 'en' ? 'Years of Experience' : 'Tahun Pengalaman'} *
                      </Label>
                      <Input
                        id="yearsOfExperience"
                        type="number"
                        value={yearsOfExperience}
                        onChange={(e) => setYearsOfExperience(e.target.value)}
                        placeholder="5"
                        min="0"
                        required
                        className="transition-smooth"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        {language === 'en' ? 'Phone Number (Optional)' : 'Nombor Telefon (Pilihan)'}
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+60123456789"
                        className="transition-smooth"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="district">
                        {language === 'en' ? 'Service District' : 'Daerah Perkhidmatan'} *
                      </Label>
                      <Select value={districtId} onValueChange={setDistrictId} required>
                        <SelectTrigger className="transition-smooth">
                          <SelectValue placeholder={
                            language === 'en' ? 'Select your service district' : 'Pilih daerah perkhidmatan anda'
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {districts.map((district) => (
                            <SelectItem key={district.id} value={district.id}>
                              {district.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {districtId && (
                      <div className="space-y-2">
                        <Label htmlFor="community">
                          {language === 'en' ? 'Primary Community' : 'Komuniti Utama'} *
                        </Label>
                        <Select value={communityId} onValueChange={setCommunityId} required>
                          <SelectTrigger className="transition-smooth">
                            <SelectValue placeholder={
                              language === 'en' ? 'Select primary community' : 'Pilih komuniti utama'
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {communities.map((community) => (
                              <SelectItem key={community.id} value={community.id}>
                                {community.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="location">
                        {language === 'en' ? 'Business Address' : 'Alamat Perniagaan'} *
                      </Label>
                      <Input
                        id="location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder={language === 'en' ? 'No. 123, Jalan ABC, Kuantan' : 'No. 123, Jalan ABC, Kuantan'}
                        required
                        className="transition-smooth"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ahmad.razak@email.com"
                    required
                    className="transition-smooth"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">
                    {language === 'en' ? 'Password' : 'Kata Laluan'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="transition-smooth"
                  />
                </div>

                {mode === 'signUp' && (
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="pdpa" 
                      checked={pdpaAccepted}
                      onCheckedChange={(checked) => setPdpaAccepted(checked as boolean)}
                      required
                    />
                    <div className="text-sm leading-4">
                      <Label htmlFor="pdpa" className="cursor-pointer">
                        {language === 'en' ? 'I have read and agree to the ' : 'Saya telah membaca dan bersetuju dengan '}
                        <Dialog open={showPdpaDialog} onOpenChange={setShowPdpaDialog}>
                          <DialogTrigger asChild>
                            <Button variant="link" className="p-0 h-auto text-blue-600 underline text-sm">
                              {language === 'en' ? 'Personal Data Protection Act (PDPA)' : 'Akta Perlindungan Data Peribadi (PDPA)'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle>
                                {language === 'en' ? 'Personal Data Protection Act (PDPA)' : 'Akta Perlindungan Data Peribadi (PDPA)'}
                              </DialogTitle>
                              <DialogDescription>
                                {language === 'en' ? 'Please read the following terms carefully' : 'Sila baca terma berikut dengan teliti'}
                              </DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="h-[400px] w-full">
                              <div className="space-y-4 text-sm">
                                <div>
                                  <h4 className="font-semibold mb-2">
                                    {language === 'en' ? '1. Data Collection' : '1. Pengumpulan Data'}
                                  </h4>
                                  <p>
                                    {language === 'en' 
                                      ? 'We collect personal information including your name, contact details, and business information to provide our smart community services.'
                                      : 'Kami mengumpul maklumat peribadi termasuk nama, butiran kenalan, dan maklumat perniagaan anda untuk menyediakan perkhidmatan komuniti pintar kami.'
                                    }
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">
                                    {language === 'en' ? '2. Data Usage' : '2. Penggunaan Data'}
                                  </h4>
                                  <p>
                                    {language === 'en' 
                                      ? 'Your data will be used for account management, service delivery, communication, and improving our platform services.'
                                      : 'Data anda akan digunakan untuk pengurusan akaun, penghantaran perkhidmatan, komunikasi, dan penambahbaikan perkhidmatan platform kami.'
                                    }
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">
                                    {language === 'en' ? '3. Data Protection' : '3. Perlindungan Data'}
                                  </h4>
                                  <p>
                                    {language === 'en' 
                                      ? 'We implement appropriate security measures to protect your personal data from unauthorized access, disclosure, or misuse.'
                                      : 'Kami melaksanakan langkah keselamatan yang sesuai untuk melindungi data peribadi anda daripada akses, pendedahan, atau penyalahgunaan tanpa kebenaran.'
                                    }
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">
                                    {language === 'en' ? '4. Your Rights' : '4. Hak Anda'}
                                  </h4>
                                  <p>
                                    {language === 'en' 
                                      ? 'You have the right to access, correct, or request deletion of your personal data. Contact us for any data-related inquiries.'
                                      : 'Anda mempunyai hak untuk mengakses, membetulkan, atau meminta pemadaman data peribadi anda. Hubungi kami untuk sebarang pertanyaan berkaitan data.'
                                    }
                                  </p>
                                </div>
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                        {' *'}
                      </Label>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full transition-smooth" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {language === 'en' ? 'Please wait...' : 'Sila tunggu...'}
                    </>
                  ) : (
                    mode === 'signIn' ? t('signIn') : (language === 'en' ? 'Register Business' : 'Daftar Perniagaan')
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}