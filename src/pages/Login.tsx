import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MapPin, Shield, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [role, setRole] = useState<string>('resident');
  const { login, language, switchLanguage } = useAuth();
  const { t } = useTranslation(language || 'ms'); // Ensure we always have a language
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

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
          const { error: rpcError } = await supabase.rpc('self_assign_demo_role', { _role: role as any });
          if (rpcError) console.warn('Role assign failed:', rpcError.message);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const seedDemoUsers = async () => {
    setIsSeeding(true);
    const roles = [
      'state_admin',
      'district_coordinator',
      'community_admin',
      'security_officer',
      'facility_manager',
      'maintenance_staff',
      'resident',
      'service_provider',
      'community_leader',
      'state_service_manager',
    ];
    const timestamp = Date.now();
    const created: string[] = [];
    try {
      for (const role of roles) {
        const email = `demo.${role}.${timestamp}@gmail.com`;
        const password = 'password123';
        const redirectUrl = `${window.location.origin}/`;

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl }
        });
        if (signUpError && !/registered/i.test(signUpError.message)) {
          console.warn(`Sign up failed for ${role}:`, signUpError.message);
          toast({
            variant: 'destructive',
            title: language === 'en' ? 'Sign up failed' : 'Daftar gagal',
            description: `${email} — ${signUpError.message}`,
          });
          continue;
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          toast({
            title: language === 'en' ? 'Email confirmation required?' : 'Perlu pengesahan e-mel?',
            description: `${email} — ${signInError.message}`,
          });
          continue;
        }

        const { error: rpcError } = await supabase.rpc('self_assign_demo_role', { _role: role as any });
        if (rpcError) {
          toast({
            variant: 'destructive',
            title: language === 'en' ? 'Role assign failed' : 'Gagal tetapkan peranan',
            description: `${role} — ${rpcError.message}`,
          });
        } else {
          created.push(`${email} (${role})`);
        }

        await supabase.auth.signOut();
      }

      if (created.length) {
        toast({
          title: language === 'en' ? 'Demo users created' : 'Pengguna demo dicipta',
          description: created.join(', '),
        });
      }
    } finally {
      setIsSeeding(false);
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
                {mode === 'signIn' ? t('signIn') : (language === 'en' ? 'Create Demo Account' : 'Buat Akaun Demo')}
              </CardTitle>
              <CardDescription>
                {mode === 'signIn'
                  ? (language === 'en' ? 'Access your smart community platform' : 'Akses platform komuniti pintar anda')
                  : (language === 'en' ? 'Sign up and choose a role to preview its view' : 'Daftar dan pilih peranan untuk pratonton')}
              </CardDescription>
              <div className="mt-2 flex justify-center gap-2">
                <Button type="button" variant={mode === 'signIn' ? 'default' : 'outline'} size="sm" onClick={() => setMode('signIn')}>
                  {t('signIn')}
                </Button>
                <Button type="button" variant={mode === 'signUp' ? 'default' : 'outline'} size="sm" onClick={() => setMode('signUp')}>
                  Sign Up
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

                {mode === 'signUp' && (
                  <div className="space-y-2">
                    <Label htmlFor="role">{language === 'en' ? 'Role' : 'Peranan'}</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger id="role">
                        <SelectValue placeholder={language === 'en' ? 'Select role' : 'Pilih peranan'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="state_admin">State Admin</SelectItem>
                        <SelectItem value="district_coordinator">District Coordinator</SelectItem>
                        <SelectItem value="community_admin">Community Admin</SelectItem>
                        <SelectItem value="security_officer">Security Officer</SelectItem>
                        <SelectItem value="facility_manager">Facility Manager</SelectItem>
                        <SelectItem value="maintenance_staff">Maintenance Staff</SelectItem>
                        <SelectItem value="resident">Resident</SelectItem>
                        <SelectItem value="service_provider">Service Provider</SelectItem>
                        <SelectItem value="community_leader">Community Leader</SelectItem>
                        <SelectItem value="state_service_manager">State Service Manager</SelectItem>
                      </SelectContent>
                    </Select>
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
                    mode === 'signIn' ? t('signIn') : (language === 'en' ? 'Create account' : 'Cipta akaun')
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

              {/* Demo credentials */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">
                  {language === 'en' ? 'Demo Credentials:' : 'Kredensi Demo:'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Email: ahmad.razak@example.com<br />
                  Password: password123
                </p>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="mt-4 w-full"
                      disabled={isSeeding}
                    >
                      {isSeeding ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {language === 'en' ? 'Seeding...' : 'Menjana...'}
                        </>
                      ) : (
                        language === 'en' ? 'Create demo users' : 'Cipta pengguna demo'
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {language === 'en' ? 'Create demo users?' : 'Cipta pengguna demo?'}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {language === 'en'
                          ? 'Creates one account per role with password "password123" and assigns roles. Tip: disable Confirm email in Supabase Auth for best results.'
                          : 'Mencipta satu akaun bagi setiap peranan dengan kata laluan "password123" dan menetapkan peranan. Tip: matikan Pengesahan e-mel di Supabase Auth untuk hasil terbaik.'}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{language === 'en' ? 'Cancel' : 'Batal'}</AlertDialogCancel>
                      <AlertDialogAction onClick={seedDemoUsers}>
                        {language === 'en' ? 'Proceed' : 'Teruskan'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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