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
import { Loader2, MapPin, Shield, Users, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { createTestUsers } from '@/utils/createTestUsers';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [communityId, setCommunityId] = useState('');
  const [location, setLocation] = useState('');
  const [selectedRole, setSelectedRole] = useState('resident');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [pdpaAccepted, setPdpaAccepted] = useState(false);
  const [showPdpaDialog, setShowPdpaDialog] = useState(false);
  const [districts, setDistricts] = useState<Array<{id: string, name: string}>>([]);
  const [communities, setCommunities] = useState<Array<{id: string, name: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [isCreatingUsers, setIsCreatingUsers] = useState(false);
  const { login, language, switchLanguage } = useAuth();
  const { t } = useTranslation(language || 'ms'); // Ensure we always have a language
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
        // Validate required fields for registration
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

        // Validate service provider specific fields
        if (selectedRole === 'service_provider') {
          if (!businessName.trim()) {
            throw new Error(language === 'en' ? 'Business name is required' : 'Nama perniagaan diperlukan');
          }
          if (!businessType.trim()) {
            throw new Error(language === 'en' ? 'Business type is required' : 'Jenis perniagaan diperlukan');
          }
          if (!yearsOfExperience.trim()) {
            throw new Error(language === 'en' ? 'Years of experience is required' : 'Tahun pengalaman diperlukan');
          }
        }

        // Validate PDPA acceptance
        if (!pdpaAccepted) {
          throw new Error(language === 'en' ? 'You must read and accept the PDPA to register' : 'Anda mesti membaca dan menerima PDPA untuk mendaftar');
        }

        const redirectUrl = `${window.location.origin}/`;
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName.trim()
            }
          }
        });
        
        if (signUpError) throw signUpError;
        
        if (authData.user) {
          // Wait for the trigger to create the basic profile, then update it
          await new Promise(resolve => setTimeout(resolve, 1000)); // Brief delay for trigger
          
          // Update the profile with registration details
          const profileUpdate: any = {
            mobile_no: phone.trim() || null,
            district_id: districtId?.replace('district-', '') || districtId,
            community_id: communityId?.replace('community-', '') || communityId,
            address: location.trim(),
            language: language,
            pdpa_declare: pdpaAccepted,
            account_status: 'pending',
            is_active: true
          };

          // Add service provider specific data
          if (selectedRole === 'service_provider') {
            profileUpdate.business_name = businessName.trim();
            profileUpdate.business_type = businessType.trim();
            profileUpdate.license_number = licenseNumber.trim() || null;
            profileUpdate.years_of_experience = parseInt(yearsOfExperience) || null;
          }

          const { error: profileError } = await supabase
            .from('profiles')
            .update(profileUpdate)
            .eq('id', authData.user.id);

          if (profileError) {
            console.error('Profile update error:', profileError);
            throw new Error(`Profile update failed: ${profileError.message}`);
          }

          console.log('Profile updated successfully for user:', authData.user.id);

          // Assign selected role using enhanced_user_roles table
          const roleData = {
            user_id: authData.user.id,
            role: selectedRole as any,
            district_id: districtId?.replace('district-', '') || districtId,
            assigned_by: authData.user.id, // Self-assigned during registration
            is_active: true
          };

          const { error: roleError } = await supabase
            .from('enhanced_user_roles')
            .insert(roleData);

          if (roleError) {
            console.error('Role assignment error:', roleError);
            throw new Error(`Role assignment failed: ${roleError.message}`);
          }

          // Show success message
          toast({
            title: language === 'en' ? 'Account Created!' : 'Akaun Dicipta!',
            description: language === 'en' 
              ? 'Your account has been created and is pending approval. You will be able to sign in once approved by the community admin.'
              : 'Akaun anda telah dicipta dan sedang menunggu kelulusan. Anda boleh log masuk setelah diluluskan oleh pentadbir komuniti.',
          });

          // Switch to sign in mode
          setMode('signIn');
          setFullName('');
          setPhone('');
          setDistrictId('');
          setCommunityId('');
          setLocation('');
          setSelectedRole('resident');
          setBusinessName('');
          setBusinessType('');
          setLicenseNumber('');
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

  const handleCreateTestUsers = async () => {
    console.log('🚀 Starting user creation process...');
    setIsCreatingUsers(true);
    try {
      console.log('📞 Calling createTestUsers function...');
      const results = await createTestUsers();
      console.log('📊 User creation results:', results);
      
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      console.log(`✅ Successful: ${successful.length}, ❌ Failed: ${failed.length}`);
      
      if (successful.length > 0) {
        console.log('✅ Showing success toast');
        toast({
          title: language === 'en' ? 'Test Users Created' : 'Pengguna Ujian Dicipta',
          description: `${successful.length} accounts created successfully: ${successful.map(r => `${r.email} (${r.role})`).join(', ')}`,
        });
      }
      
      if (failed.length > 0) {
        console.log('❌ Showing failure toast', failed);
        toast({
          variant: 'destructive',
          title: language === 'en' ? 'Some Users Failed' : 'Sesetengah Pengguna Gagal',
          description: `${failed.length} accounts failed: ${failed.map(r => r.email).join(', ')}`,
        });
      }
    } catch (error) {
      console.error('💥 Unexpected error in handleCreateTestUsers:', error);
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error Creating Users' : 'Ralat Mencipta Pengguna',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      console.log('🏁 User creation process completed');
      setIsCreatingUsers(false);
    }
  };


  return (
    <div 
      className="min-h-screen relative flex items-center justify-center p-4"
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
      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Hero content */}
        <div className="text-center lg:text-left space-y-6 text-white">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur rounded-full px-4 py-2">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">{t('pahangState')}</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              {t('smartCommunity')}
            </h1>
            <p className="text-xl text-white/90 max-w-lg">
              {language === 'en' 
                ? 'Connecting communities across Pahang state with modern digital solutions for residents, administrators, and security personnel.'
                : 'Menghubungkan komuniti di seluruh negeri Pahang dengan penyelesaian digital moden untuk penduduk, pentadbir, dan kakitangan keselamatan.'
              }
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">
                {language === 'en' ? 'Multi-Role System' : 'Sistem Pelbagai Peranan'}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <Shield className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">
                {language === 'en' ? 'Smart Security' : 'Keselamatan Pintar'}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">
                {language === 'en' ? 'Community Hub' : 'Hub Komuniti'}
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
                  ? t('signIn')
                  : (language === 'en' ? 'Create Account' : 'Buat Akaun')}
              </CardTitle>
              <CardDescription>
                {mode === 'signIn'
                  ? (language === 'en' ? 'Access your smart community platform' : 'Akses platform komuniti pintar anda')
                  : (language === 'en' ? 'Join your smart community platform' : 'Sertai platform komuniti pintar anda')}
              </CardDescription>
              <div className="mt-2 flex justify-center gap-2">
                <Button type="button" variant={mode === 'signIn' ? 'default' : 'outline'} size="sm" onClick={() => setMode('signIn')}>
                  {t('signIn')}
                </Button>
                <Button type="button" variant={mode === 'signUp' ? 'default' : 'outline'} size="sm" onClick={() => setMode('signUp')}>
                  {language === 'en' ? 'Sign Up' : 'Daftar'}
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
                      <Label htmlFor="role">
                        {language === 'en' ? 'Select Role' : 'Pilih Peranan'} *
                      </Label>
                      <Select value={selectedRole} onValueChange={setSelectedRole} required>
                        <SelectTrigger className="transition-smooth">
                          <SelectValue placeholder={
                            language === 'en' ? 'Choose your role' : 'Pilih peranan anda'
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="resident">
                            {language === 'en' ? 'Resident' : 'Penduduk'}
                          </SelectItem>
                          <SelectItem value="service_provider">
                            {language === 'en' ? 'Service Provider' : 'Penyedia Perkhidmatan'}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

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
                        {language === 'en' ? 'Select District' : 'Pilih Daerah'} *
                      </Label>
                      <Select value={districtId} onValueChange={(value) => {
                        console.log('District selected:', value);
                        setDistrictId(value);
                      }} required>
                        <SelectTrigger className="transition-smooth bg-background border-2">
                          <SelectValue placeholder={
                            language === 'en' ? 'Choose your district' : 'Pilih daerah anda'
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

                    <div className="space-y-2">
                      <Label htmlFor="community">
                        {language === 'en' ? 'Select Community' : 'Pilih Komuniti'} *
                      </Label>
                      <Select value={communityId} onValueChange={setCommunityId} required disabled={!districtId}>
                        <SelectTrigger className="transition-smooth">
                          <SelectValue placeholder={
                            !districtId 
                              ? (language === 'en' ? 'Please select district first' : 'Sila pilih daerah dahulu')
                              : (language === 'en' ? 'Choose your community' : 'Pilih komuniti anda')
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

                    <div className="space-y-2">
                      <Label htmlFor="location">
                        {language === 'en' ? 'Specific Location/Address' : 'Lokasi/Alamat Khusus'} *
                      </Label>
                      <Input
                        id="location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder={language === 'en' ? 'e.g., Taman Sejahtera, Block A' : 'cth: Taman Sejahtera, Blok A'}
                        required
                        className="transition-smooth"
                      />
                    </div>

                    {/* Service Provider specific fields */}
                    {selectedRole === 'service_provider' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="businessName">
                            {language === 'en' ? 'Business Name' : 'Nama Perniagaan'} *
                          </Label>
                          <Input
                            id="businessName"
                            type="text"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            placeholder={language === 'en' ? 'e.g., ABC Plumbing Services' : 'cth: Perkhidmatan Paip ABC'}
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
                              <SelectItem value="plumbing">
                                {language === 'en' ? 'Plumbing Services' : 'Perkhidmatan Paip'}
                              </SelectItem>
                              <SelectItem value="electrical">
                                {language === 'en' ? 'Electrical Services' : 'Perkhidmatan Elektrik'}
                              </SelectItem>
                              <SelectItem value="cleaning">
                                {language === 'en' ? 'Cleaning Services' : 'Perkhidmatan Pembersihan'}
                              </SelectItem>
                              <SelectItem value="maintenance">
                                {language === 'en' ? 'Maintenance Services' : 'Perkhidmatan Penyelenggaraan'}
                              </SelectItem>
                              <SelectItem value="landscaping">
                                {language === 'en' ? 'Landscaping Services' : 'Perkhidmatan Landskap'}
                              </SelectItem>
                              <SelectItem value="security">
                                {language === 'en' ? 'Security Services' : 'Perkhidmatan Keselamatan'}
                              </SelectItem>
                              <SelectItem value="other">
                                {language === 'en' ? 'Other Services' : 'Perkhidmatan Lain'}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="licenseNumber">
                            {language === 'en' ? 'License Number (Optional)' : 'Nombor Lesen (Pilihan)'}
                          </Label>
                          <Input
                            id="licenseNumber"
                            type="text"
                            value={licenseNumber}
                            onChange={(e) => setLicenseNumber(e.target.value)}
                            placeholder={language === 'en' ? 'e.g., LIC123456' : 'cth: LIC123456'}
                            className="transition-smooth"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="yearsOfExperience">
                            {language === 'en' ? 'Years of Experience' : 'Tahun Pengalaman'} *
                          </Label>
                          <Input
                            id="yearsOfExperience"
                            type="number"
                            min="0"
                            max="50"
                            value={yearsOfExperience}
                            onChange={(e) => setYearsOfExperience(e.target.value)}
                            placeholder={language === 'en' ? 'e.g., 5' : 'cth: 5'}
                            required
                            className="transition-smooth"
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ahmad.razak@example.com"
                    required
                    className="transition-smooth"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t('password')}</Label>
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
                  <div className="flex items-start space-x-2 p-3 border rounded-lg">
                    <Checkbox 
                      id="pdpa" 
                      checked={pdpaAccepted}
                      onCheckedChange={(checked) => setPdpaAccepted(checked === true)}
                      required
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label 
                        htmlFor="pdpa"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {language === 'en' 
                          ? "I have read and agree to the Personal Data Protection Act (PDPA)" 
                          : "Saya telah membaca dan bersetuju dengan Akta Perlindungan Data Peribadi (PDPA)"}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {language === 'en' 
                          ? "By checking this box, you consent to the collection and processing of your personal data in accordance with PDPA guidelines. "
                          : "Dengan menandai kotak ini, anda memberikan persetujuan untuk pengumpulan dan pemprosesan data peribadi anda mengikut garis panduan PDPA. "}
                        <Dialog open={showPdpaDialog} onOpenChange={setShowPdpaDialog}>
                          <DialogTrigger asChild>
                            <Button variant="link" className="h-auto p-0 text-xs text-primary underline">
                              {language === 'en' ? 'Read full PDPA' : 'Baca PDPA penuh'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                {language === 'en' 
                                  ? 'Personal Data Protection Act (PDPA)' 
                                  : 'Akta Perlindungan Data Peribadi (PDPA)'}
                              </DialogTitle>
                              <DialogDescription>
                                {language === 'en' 
                                  ? 'Smart Community Management System - Data Protection Notice'
                                  : 'Sistem Pengurusan Komuniti Pintar - Notis Perlindungan Data'}
                              </DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
                              <div className="space-y-4 text-sm">
                                {language === 'en' ? (
                                  <>
                                    <section>
                                      <h3 className="font-semibold text-base mb-2">1. Introduction</h3>
                                      <p>This Personal Data Protection Notice explains how we collect, use, disclose, and protect your personal data in compliance with Malaysia's Personal Data Protection Act 2010 (PDPA).</p>
                                    </section>

                                    <section>
                                      <h3 className="font-semibold text-base mb-2">2. Data Controller</h3>
                                      <p>Pahang State Smart Community Management System is the data controller responsible for your personal data.</p>
                                    </section>

                                    <section>
                                      <h3 className="font-semibold text-base mb-2">3. Personal Data We Collect</h3>
                                      <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Identity information (full name, email, phone number)</li>
                                        <li>Location data (district, address, specific location)</li>
                                        <li>Role and professional information (for service providers)</li>
                                        <li>Communication records and messages</li>
                                        <li>System usage data and access logs</li>
                                        <li>CCTV footage and security-related data</li>
                                      </ul>
                                    </section>

                                    <section>
                                      <h3 className="font-semibold text-base mb-2">4. Purpose of Data Collection</h3>
                                      <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>User registration and account management</li>
                                        <li>Community services and facility management</li>
                                        <li>Security monitoring and emergency response</li>
                                        <li>Communication between residents and service providers</li>
                                        <li>Maintenance scheduling and complaint handling</li>
                                        <li>System administration and improvement</li>
                                      </ul>
                                    </section>

                                    <section>
                                      <h3 className="font-semibold text-base mb-2">5. Data Sharing and Disclosure</h3>
                                      <p>We may share your personal data with:</p>
                                      <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Authorized community administrators and security personnel</li>
                                        <li>Service providers within your community</li>
                                        <li>Government agencies when legally required</li>
                                        <li>Emergency services during critical situations</li>
                                      </ul>
                                    </section>

                                    <section>
                                      <h3 className="font-semibold text-base mb-2">6. Data Security</h3>
                                      <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>
                                    </section>

                                    <section>
                                      <h3 className="font-semibold text-base mb-2">7. Your Rights</h3>
                                      <p>Under PDPA, you have the right to:</p>
                                      <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Access your personal data</li>
                                        <li>Correct inaccurate personal data</li>
                                        <li>Withdraw consent (where applicable)</li>
                                        <li>Request deletion of personal data</li>
                                        <li>Lodge complaints with the Personal Data Protection Department</li>
                                      </ul>
                                    </section>

                                    <section>
                                      <h3 className="font-semibold text-base mb-2">8. Data Retention</h3>
                                      <p>We retain your personal data only for as long as necessary to fulfill the purposes outlined in this notice or as required by law.</p>
                                    </section>

                                    <section>
                                      <h3 className="font-semibold text-base mb-2">9. Contact Information</h3>
                                      <p>For any questions regarding this notice or your personal data, please contact our Data Protection Officer through the system's support channels.</p>
                                    </section>

                                    <section>
                                      <h3 className="font-semibold text-base mb-2">10. Updates to This Notice</h3>
                                      <p>We may update this notice from time to time. Users will be notified of significant changes through the system.</p>
                                    </section>
                                  </>
                                ) : (
                                  <>
                                    <section>
                                      <h3 className="font-semibold text-base mb-2">1. Pengenalan</h3>
                                      <p>Notis Perlindungan Data Peribadi ini menerangkan bagaimana kami mengumpul, menggunakan, mendedahkan, dan melindungi data peribadi anda selaras dengan Akta Perlindungan Data Peribadi Malaysia 2010 (PDPA).</p>
                                    </section>

                                    <section>
                                      <h3 className="font-semibold text-base mb-2">2. Pengawal Data</h3>
                                      <p>Sistem Pengurusan Komuniti Pintar Negeri Pahang adalah pengawal data yang bertanggungjawab ke atas data peribadi anda.</p>
                                    </section>

                                    <section>
                                      <h3 className="font-semibold text-base mb-2">3. Data Peribadi Yang Kami Kumpul</h3>
                                      <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Maklumat identiti (nama penuh, emel, nombor telefon)</li>
                                        <li>Data lokasi (daerah, alamat, lokasi khusus)</li>
                                        <li>Maklumat peranan dan profesional (untuk penyedia perkhidmatan)</li>
                                        <li>Rekod komunikasi dan mesej</li>
                                        <li>Data penggunaan sistem dan log akses</li>
                                        <li>Rakaman CCTV dan data berkaitan keselamatan</li>
                                      </ul>
                                    </section>

                                    <section>
                                      <h3 className="font-semibold text-base mb-2">4. Tujuan Pengumpulan Data</h3>
                                      <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Pendaftaran pengguna dan pengurusan akaun</li>
                                        <li>Perkhidmatan komuniti dan pengurusan kemudahan</li>
                                        <li>Pemantauan keselamatan dan tindak balas kecemasan</li>
                                        <li>Komunikasi antara penduduk dan penyedia perkhidmatan</li>
                                        <li>Penjadualan penyelenggaraan dan pengendalian aduan</li>
                                        <li>Pentadbiran dan penambahbaikan sistem</li>
                                      </ul>
                                    </section>

                                    <section>
                                      <h3 className="font-semibold text-base mb-2">5. Perkongsian dan Pendedahan Data</h3>
                                      <p>Kami mungkin berkongsi data peribadi anda dengan:</p>
                                      <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Pentadbir komuniti dan kakitangan keselamatan yang dibenarkan</li>
                                        <li>Penyedia perkhidmatan dalam komuniti anda</li>
                                        <li>Agensi kerajaan apabila diperlukan secara undang-undang</li>
                                        <li>Perkhidmatan kecemasan semasa situasi kritikal</li>
                                      </ul>
                                    </section>

                                    <section>
                                      <h3 className="font-semibold text-base mb-2">6. Keselamatan Data</h3>
                                      <p>Kami melaksanakan langkah teknikal dan organisasi yang sesuai untuk melindungi data peribadi anda daripada akses, pengubahan, pendedahan, atau pemusnahan tanpa kebenaran.</p>
                                    </section>

                                    <section>
                                      <h3 className="font-semibold text-base mb-2">7. Hak Anda</h3>
                                      <p>Di bawah PDPA, anda mempunyai hak untuk:</p>
                                      <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Mengakses data peribadi anda</li>
                                        <li>Membetulkan data peribadi yang tidak tepat</li>
                                        <li>Menarik balik persetujuan (jika berkenaan)</li>
                                        <li>Meminta pemadaman data peribadi</li>
                                        <li>Membuat aduan kepada Jabatan Perlindungan Data Peribadi</li>
                                      </ul>
                                    </section>

                                    <section>
                                      <h3 className="font-semibold text-base mb-2">8. Pengekalan Data</h3>
                                      <p>Kami menyimpan data peribadi anda hanya selama yang diperlukan untuk memenuhi tujuan yang digariskan dalam notis ini atau seperti yang dikehendaki undang-undang.</p>
                                    </section>

                                    <section>
                                      <h3 className="font-semibold text-base mb-2">9. Maklumat Hubungan</h3>
                                      <p>Untuk sebarang pertanyaan mengenai notis ini atau data peribadi anda, sila hubungi Pegawai Perlindungan Data kami melalui saluran sokongan sistem.</p>
                                    </section>

                                    <section>
                                      <h3 className="font-semibold text-base mb-2">10. Kemas Kini Kepada Notis Ini</h3>
                                      <p>Kami mungkin mengemaskini notis ini dari semasa ke semasa. Pengguna akan dimaklumkan tentang perubahan penting melalui sistem.</p>
                                    </section>
                                  </>
                                )}
                                
                                <div className="border-t pt-4 mt-6">
                                  <p className="text-xs text-muted-foreground">
                                    {language === 'en' 
                                      ? 'Last updated: January 2024. This notice is effective immediately upon registration.'
                                      : 'Kemaskini terakhir: Januari 2024. Notis ini berkuat kuasa serta-merta selepas pendaftaran.'}
                                  </p>
                                </div>
                              </div>
                            </ScrollArea>
                            <div className="flex justify-end pt-4">
                              <Button onClick={() => setShowPdpaDialog(false)}>
                                {language === 'en' ? 'Close' : 'Tutup'}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </p>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:shadow-glow transition-spring"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('loading')}
                    </>
                  ) : (
                    mode === 'signIn' 
                      ? t('signIn') 
                      : (language === 'en' ? 'Create account' : 'Cipta akaun')
                  )}
                </Button>


                <div className="text-center">
                  <Button variant="link" className="text-muted-foreground">
                    {t('forgotPassword')}
                  </Button>
                </div>
              </form>

              {/* Test Users Section */}
               <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                 <p className="text-sm font-medium mb-2">
                   {language === 'en' ? 'Test Credentials (10 Users - Various Roles):' : 'Kredensi Ujian (10 Pengguna - Pelbagai Peranan):'}
                 </p>
                 <div className="text-xs text-muted-foreground space-y-1 max-h-40 overflow-y-auto">
                   <p><strong>State Admin:</strong> stateadmin@test.com / password123</p>
                   <p><strong>District Coordinator:</strong> districtcoord@test.com / password123</p>
                   <p><strong>Community Admin:</strong> communityadmin@test.com / password123</p>
                   <p><strong>Facility Manager:</strong> facilitymanager@test.com / password123</p>
                   <p><strong>Security Officer:</strong> securitynorth@test.com / password123</p>
                   <p><strong>Maintenance Staff:</strong> maintenancestaff@test.com / password123</p>
                   <p><strong>Resident:</strong> resident@test.com / password123</p>
                   <p><strong>Service Provider:</strong> serviceprovider@test.com / password123</p>
                   <p><strong>Community Leader:</strong> communityleader@test.com / password123</p>
                   <p><strong>State Service Manager:</strong> stateservicemgr@test.com / password123</p>
                 </div>
               </div>
            </CardContent>
          </Card>

          <p className="text-center text-white/70 text-sm mt-6">
            {t('poweredBy')}
          </p>
        </div>
      </div>
    </div>
  );
}