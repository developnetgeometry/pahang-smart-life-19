import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MapPin, Shield, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { createTestUsers } from '@/utils/createTestUsers';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [isCreatingUsers, setIsCreatingUsers] = useState(false);
  const { login, language, switchLanguage } = useAuth();
  const { t } = useTranslation(language || 'ms'); // Ensure we always have a language
  const { toast } = useToast();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'signIn') {
        await login(email, password);
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl }
        });
        if (signUpError) throw signUpError;

        // Try to sign in immediately (if confirm email disabled)
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (!signInError) {
          console.log('Successfully signed up and logged in');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTestUsers = async () => {
    setIsCreatingUsers(true);
    try {
      const results = await createTestUsers();
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      if (successful.length > 0) {
        toast({
          title: language === 'en' ? 'Test Users Created' : 'Pengguna Ujian Dicipta',
          description: `${successful.length} accounts created successfully: ${successful.map(r => `${r.email} (${r.role})`).join(', ')}`,
        });
      }
      
      if (failed.length > 0) {
        toast({
          variant: 'destructive',
          title: language === 'en' ? 'Some Users Failed' : 'Sesetengah Pengguna Gagal',
          description: `${failed.length} accounts failed: ${failed.map(r => r.email).join(', ')}`,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error Creating Users' : 'Ralat Mencipta Pengguna',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
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
                  <p><strong>State Admin:</strong> state.admin@pahangprima.com / password123</p>
                  <p><strong>District Coordinator:</strong> district.coordinator@pahangprima.com / password123</p>
                  <p><strong>Community Admin:</strong> community.admin@pahangprima.com / password123</p>
                  <p><strong>Admin:</strong> admin@pahangprima.com / password123</p>
                  <p><strong>Manager:</strong> manager.north@pahangprima.com / password123</p>
                  <p><strong>Facility Manager:</strong> facility.manager@pahangprima.com / password123</p>
                  <p><strong>Security Officer:</strong> security.north@pahangprima.com / password123</p>
                  <p><strong>Maintenance Staff:</strong> maintenance.staff@pahangprima.com / password123</p>
                  <p><strong>Resident:</strong> resident@pahangprima.com / password123</p>
                  <p><strong>Service Provider:</strong> service.provider@pahangprima.com / password123</p>
                  <p><strong>Community Leader:</strong> community.leader@pahangprima.com / password123</p>
                  <p><strong>State Service Manager:</strong> state.service.manager@pahangprima.com / password123</p>
                </div>
                
                <Button
                  onClick={handleCreateTestUsers}
                  variant="outline"
                  className="mt-4 w-full"
                  disabled={isCreatingUsers}
                >
                  {isCreatingUsers ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {language === 'en' ? 'Creating Users...' : 'Mencipta Pengguna...'}
                    </>
                  ) : (
                    language === 'en' ? 'Create All 12 Users (Complete Hierarchy)' : 'Cipta Semua 12 Pengguna (Hierarki Lengkap)'
                  )}
                </Button>
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