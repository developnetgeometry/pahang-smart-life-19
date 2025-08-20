import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MapPin, Shield, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { createTestUsers } from '@/utils/createTestUsers';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [location, setLocation] = useState('');
  const [selectedRole, setSelectedRole] = useState('resident');
  const [districts, setDistricts] = useState<Array<{id: string, name: string}>>([]);
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
        if (!location.trim()) {
          throw new Error(language === 'en' ? 'Location is required' : 'Lokasi diperlukan');
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
          // Create profile record
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: email,
              full_name: fullName.trim(),
              phone: phone.trim() || null,
              district_id: districtId,
              address: location.trim(),
              language: language,
              is_active: true
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
            // Don't throw error - profile will be created by trigger if this fails
          }

          // Assign selected role
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: authData.user.id,
              role: selectedRole as any,
              district_id: districtId
            });

          if (roleError) {
            console.error('Role assignment error:', roleError);
            // Don't throw error - this is not critical for signup
          }

          // Show success message
          toast({
            title: language === 'en' ? 'Account Created!' : 'Akaun Dicipta!',
            description: language === 'en' 
              ? 'Your account has been created successfully. You can now sign in.'
              : 'Akaun anda telah berjaya dicipta. Anda boleh log masuk sekarang.',
          });

          // Switch to sign in mode
          setMode('signIn');
          setFullName('');
          setPhone('');
          setDistrictId('');
          setLocation('');
          setSelectedRole('resident');
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
    <div className="min-h-screen relative bg-gradient-hero flex items-center justify-center p-4">
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          variant={language === 'en' ? 'default' : 'outline'}
          size="sm"
          onClick={() => switchLanguage('en')}
        >
          EN
        </Button>
        <Button
          variant={language === 'ms' ? 'default' : 'outline'}
          size="sm"
          onClick={() => switchLanguage('ms')}
        >
          BM
        </Button>
      </div>
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
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
                      <Select value={districtId} onValueChange={setDistrictId} required>
                        <SelectTrigger className="transition-smooth">
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
                          <SelectItem value="community_leader">
                            {language === 'en' ? 'Community Leader' : 'Ketua Komuniti'}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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

                {mode === 'signUp' && (
                  <p className="text-xs text-muted-foreground text-center">
                    {language === 'en'
                      ? 'Tip: Disable Confirm email in Supabase Auth settings for testing, or check your inbox for the confirmation link.'
                      : 'Tip: Matikan pengesahan e-mel di tetapan Supabase Auth untuk ujian, atau semak e-mel pengesahan.'}
                  </p>
                )}

                <div className="text-center">
                  <Button variant="link" className="text-muted-foreground">
                    {t('forgotPassword')}
                  </Button>
                </div>
              </form>

              {/* Test Users Section */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">
                  {language === 'en' ? 'Test Credentials (12 Users - All Roles):' : 'Kredensi Ujian (12 Pengguna - Semua Peranan):'}
                </p>
                <div className="text-xs text-muted-foreground space-y-1 max-h-40 overflow-y-auto">
                  <p><strong>State Admin:</strong> stateadmin@test.com / password123</p>
                  <p><strong>District Coordinator:</strong> districtcoord@test.com / password123</p>
                  <p><strong>Community Admin:</strong> communityadmin@test.com / password123</p>
                  <p><strong>Admin:</strong> admin@test.com / password123</p>
                  <p><strong>Manager:</strong> managernorth@test.com / password123</p>
                  <p><strong>Facility Manager:</strong> facilitymanager@test.com / password123</p>
                  <p><strong>Security Officer:</strong> securitynorth@test.com / password123</p>
                  <p><strong>Maintenance Staff:</strong> maintenancestaff@test.com / password123</p>
                  <p><strong>Resident:</strong> resident@test.com / password123</p>
                  <p><strong>Service Provider:</strong> serviceprovider@test.com / password123</p>
                  <p><strong>Community Leader:</strong> communityleader@test.com / password123</p>
                  <p><strong>State Service Manager:</strong> stateservicemgr@test.com / password123</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-800 font-medium">
                    {language === 'en' ? '✅ All 12 test users are ready!' : '✅ Semua 12 pengguna ujian sudah siap!'}
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    {language === 'en' ? 'Use any email above with password: password123' : 'Gunakan mana-mana e-mel di atas dengan kata laluan: password123'}
                  </p>
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