import { useState, useEffect } from "react";
import { useAuth, Language } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/use-user-roles";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Loader2, UserCheck, Eye, EyeOff, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CompleteAccount() {
  const { language, loadProfileAndRoles } = useAuth();
  const [user, setUser] = useState<any>(null);
  const { hasRole } = useUserRoles();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [form, setForm] = useState({
    phone: "",
    unit_number: "",
    family_size: 1,
    emergency_contact_name: "",
    emergency_contact_phone: "",
    vehicle_number: "",
    language_preference: (language as Language) || "ms",
    password: "",
    confirmPassword: "",
  });

  const text = {
    en: {
      title: "Complete Your Account",
      subtitle: "Please provide the following information to complete your account setup",
      completingFor: "Completing account for:",
      phone: "Phone Number",
      unitNumber: "Unit Number",
      familySize: "Family Size",
      emergencyContactName: "Emergency Contact Name",
      emergencyContactPhone: "Emergency Contact Phone",
      vehicleNumber: "Vehicle Number (Optional)",
      languagePreference: "Language Preference",
      password: "New Password (Optional)",
      confirmPassword: "Confirm Password",
      showPassword: "Show password",
      hidePassword: "Hide password",
      passwordTooShort: "Password must be at least 6 characters",
      passwordsDoNotMatch: "Passwords do not match",
      english: "English",
      malay: "Bahasa Malaysia",
      complete: "Complete Account",
      completing: "Completing Account...",
      success: "Account completed successfully!",
      error: "Failed to complete account",
      required: "This field is required",
      sessionExpired: "Session Expired",
      sessionExpiredDesc: "Your invitation link has expired. Please contact an administrator for a new invitation.",
      linkExpired: "Invitation Link Expired",
      linkExpiredDesc: "This invitation link is no longer valid or has already been used.",
      tryAgain: "Try Another Email",
      resendInvitation: "Request New Invitation",
      wrongAccount: "Wrong account? Sign out",
    },
    ms: {
      title: "Lengkapkan Akaun Anda",
      subtitle: "Sila berikan maklumat berikut untuk melengkapkan persediaan akaun anda",
      completingFor: "Melengkapkan akaun untuk:",
      phone: "Nombor Telefon",
      unitNumber: "Nombor Unit",
      familySize: "Saiz Keluarga",
      emergencyContactName: "Nama Hubungan Kecemasan",
      emergencyContactPhone: "Telefon Hubungan Kecemasan",
      vehicleNumber: "Nombor Kenderaan (Pilihan)",
      languagePreference: "Pilihan Bahasa",
      password: "Kata Laluan Baru (Pilihan)",
      confirmPassword: "Sahkan Kata Laluan",
      showPassword: "Tunjukkan kata laluan",
      hidePassword: "Sembunyikan kata laluan",
      passwordTooShort: "Kata laluan mestilah sekurang-kurangnya 6 aksara",
      passwordsDoNotMatch: "Kata laluan tidak sepadan",
      english: "Bahasa Inggeris",
      malay: "Bahasa Malaysia",
      complete: "Lengkapkan Akaun",
      completing: "Melengkapkan Akaun...",
      success: "Akaun berjaya dilengkapkan!",
      error: "Gagal melengkapkan akaun",
      required: "Medan ini diperlukan",
      sessionExpired: "Sesi Tamat Tempoh",
      sessionExpiredDesc: "Pautan jemputan anda telah tamat tempoh. Sila hubungi pentadbir untuk jemputan baharu.",
      linkExpired: "Pautan Jemputan Tamat Tempoh",
      linkExpiredDesc: "Pautan jemputan ini tidak sah lagi atau telah digunakan.",
      tryAgain: "Cuba Emel Lain",
      resendInvitation: "Minta Jemputan Baharu",
      wrongAccount: "Akaun salah? Daftar keluar",
    },
  };

  const t = text[language];

  // Check if user is a guest
  const isGuest = hasRole('guest');

  // Smart session initialization - handle both invitation links and regular login flow
  useEffect(() => {
    let processed = false;

    const initializeSession = async () => {
      if (processed) return;
      processed = true;

      console.log('=== STARTING COMPLETE ACCOUNT INITIALIZATION ===');
      
      // 1. CHECK FOR EXISTING SESSION FIRST
      console.log('Step 1: Checking for existing valid session');
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      
      if (existingSession?.user) {
        console.log('✅ Found existing valid session for:', existingSession.user.email);
        setUser(existingSession.user);
        setUserEmail(existingSession.user.email || '');
        setSessionValid(true);
        
        // Check if this is a normal login flow (no tokens in URL)
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hasTokens = urlParams.get('code') || urlParams.get('token_hash') || 
                         hashParams.get('access_token') || hashParams.get('refresh_token');
        
        if (!hasTokens) {
          console.log('✅ Normal login flow - user has valid session, no invitation tokens');
        } else {
          console.log('✅ Invitation link flow - user has valid session with tokens');
          // Clean up URL for invitation flows
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        return; // Use existing session
      }

      // 2. PARSE TOKENS: Extract tokens from URL (for invitation links only)
      console.log('Step 2: No existing session, parsing tokens from URL');
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      const code = urlParams.get('code');
      const tokenHash = urlParams.get('token_hash');
      const type = urlParams.get('type');
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      console.log('Found tokens:', { 
        code: !!code, 
        tokenHash: !!tokenHash, 
        type, 
        accessToken: !!accessToken, 
        refreshToken: !!refreshToken 
      });

      // If no tokens found and no session, redirect to login
      if (!code && !tokenHash && !accessToken && !refreshToken) {
        console.log('❌ No session and no tokens - redirecting to login');
        setSessionValid(false);
        setProcessingError('Please log in to access this page.');
        // Redirect to login after a brief delay
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      // 3. PROCESS TOKENS: Try to establish session using tokens (invitation link flow)
      let sessionEstablished = false;
      
      try {
        console.log('Step 3: Processing invitation tokens to establish session');
        
        // Priority 1: Hash tokens (most reliable for invitations)
        if (accessToken && refreshToken) {
          console.log('Using access_token/refresh_token from hash');
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (data.session && data.user && !error) {
            setUser(data.user);
            setUserEmail(data.user.email || '');
            setSessionValid(true);
            sessionEstablished = true;
            console.log('✅ Session established via hash tokens for:', data.user.email);
          }
        }
        
        // Priority 2: Code exchange
        if (!sessionEstablished && code) {
          console.log('Using code exchange');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (data.session && data.user && !error) {
            setUser(data.user);
            setUserEmail(data.user.email || '');
            setSessionValid(true);
            sessionEstablished = true;
            console.log('✅ Session established via code exchange for:', data.user.email);
          }
        }
        
        // Priority 3: Token hash verification
        if (!sessionEstablished && tokenHash && type) {
          console.log('Using token_hash verification');
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as any,
          });
          
          if (data.session && data.user && !error) {
            setUser(data.user);
            setUserEmail(data.user.email || '');
            setSessionValid(true);
            sessionEstablished = true;
            console.log('✅ Session established via token_hash for:', data.user.email);
          }
        }
        
        if (sessionEstablished) {
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          console.log('✅ URL cleaned up');
        } else {
          console.error('❌ Failed to establish session from invitation tokens');
          setSessionValid(false);
          setProcessingError('Invalid or expired invitation link');
        }
        
      } catch (error: any) {
        console.error('❌ Token processing error:', error);
        setSessionValid(false);
        setProcessingError(error.message || 'Failed to process invitation link');
      }
    };

    initializeSession();
  }, [navigate]);

  const handleResendInvitation = () => {
    toast({
      title: "Contact Administrator",
      description: "Please contact your community administrator for a new invitation link.",
    });
  };

  const handleTryAnotherEmail = () => {
    navigate("/login");
  };

  const handleWrongAccount = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed Out",
      description: "Please use the correct invitation link for your account.",
    });
    navigate("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.phone ||
      !form.unit_number ||
      !form.emergency_contact_name ||
      !form.emergency_contact_phone
    ) {
      toast({
        title: "Error",
        description: t.required,
        variant: "destructive",
      });
      return;
    }

    // Validate password if provided
    if (form.password) {
      if (form.password.length < 6) {
        setPasswordError(t.passwordTooShort);
        return;
      }
      if (form.password !== form.confirmPassword) {
        setPasswordError(t.passwordsDoNotMatch);
        return;
      }
    }

    setLoading(true);
    setPasswordError("");

    try {
      // 4. SESSION VERIFICATION: Get current user from session
      console.log('Step 4: Verifying session and user identity');
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !currentUser) {
        console.error("❌ No valid session for account completion:", userError);
        toast({
          title: "Session Expired",
          description: "Please use your invitation link again to complete your account.",
          variant: "destructive",
        });
        setSessionValid(false);
        return;
      }

      // Verify we're completing the correct user's account
      if (currentUser.id !== user?.id) {
        console.error("❌ Session user mismatch - expected:", user?.id, "got:", currentUser.id);
        toast({
          title: "Account Mismatch",
          description: "Session belongs to different user. Please sign out and use the correct invitation link.",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        setSessionValid(false);
        return;
      }

      console.log('✅ VERIFIED: Completing account for user:', currentUser.email);

      // Update password if provided
      if (form.password) {
        console.log('Updating password...');
        const { error: passwordError } = await supabase.auth.updateUser({
          password: form.password
        });
        
        if (passwordError) {
          if (passwordError.message?.includes("session") || passwordError.message?.includes("auth")) {
            console.warn("Password update failed due to session issue, continuing with profile update");
            toast({
              title: "Password Update Failed",
              description: "Your profile will be updated, but password change failed due to session expiry.",
              variant: "destructive",
            });
          } else {
            throw passwordError;
          }
        } else {
          console.log('✅ Password updated successfully');
        }
      }

      // 5. STATUS MANAGEMENT: Set correct account status for residents
      console.log('Step 5: Setting account status');
      const signupFlow = currentUser?.user_metadata?.signup_flow || 'unknown';
      let accountStatus = "approved"; // Default for all
      let isActive = true; // Default active
      
      if (signupFlow === 'resident_invite') {
        // Residents should be approved and active after completing profile
        accountStatus = "approved";
        isActive = true;
        console.log('✅ Setting resident to approved and active status');
      }
      
      console.log('Setting account_status to:', accountStatus, 'and is_active to:', isActive);
      
      const { error } = await supabase
        .from("profiles")
        .update({
          phone: form.phone,
          unit_number: form.unit_number,
          family_size: form.family_size,
          emergency_contact_name: form.emergency_contact_name,
          emergency_contact_phone: form.emergency_contact_phone,
          vehicle_plate_number: form.vehicle_number || null,
          language_preference: form.language_preference,
          account_status: accountStatus,
          is_active: isActive,
        })
        .eq("user_id", currentUser.id);

      if (error) {
        console.error('❌ Profile update error:', error);
        throw error;
      }

      console.log('✅ Profile updated successfully with status:', accountStatus);

      toast({
        title: t.success,
        description: "Welcome to the community management system!",
      });

      // Reload profile and roles
      console.log('Reloading profile and roles...');
      await loadProfileAndRoles();

      // Navigate to home
      setTimeout(() => {
        console.log('✅ Navigating to home page');
        navigate("/");
      }, 500);
      
    } catch (error) {
      console.error("❌ Error completing account:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : t.error,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading while processing
  if (sessionValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Processing Invitation...</CardTitle>
            <CardDescription>
              Setting up your account session
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error recovery UI if session setup failed
  if (sessionValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <CardTitle>
              {processingError?.includes('Please log in') ? 'Login Required' : t.linkExpired}
            </CardTitle>
            <CardDescription>
              {processingError || t.linkExpiredDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!processingError?.includes('Please log in') && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {t.sessionExpiredDesc}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              {processingError?.includes('Please log in') ? (
                <Button 
                  onClick={() => navigate('/login')} 
                  className="w-full"
                >
                  Go to Login
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={handleResendInvitation} 
                    className="w-full"
                    variant="outline"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t.resendInvitation}
                  </Button>
                  
                  <Button 
                    onClick={handleTryAnotherEmail} 
                    className="w-full"
                    variant="secondary"
                  >
                    {t.tryAgain}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main account completion form
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <UserCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">{t.title}</CardTitle>
          <CardDescription>{t.subtitle}</CardDescription>
          
          {userEmail && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {t.completingFor} <span className="font-semibold text-foreground">{userEmail}</span>
              </p>
              <Button 
                onClick={handleWrongAccount}
                variant="ghost" 
                size="sm" 
                className="mt-2 text-xs"
              >
                {t.wrongAccount}
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  {t.phone} *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="01X-XXXXXXX"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_number" className="text-sm font-medium">
                  {t.unitNumber} *
                </Label>
                <Input
                  id="unit_number"
                  value={form.unit_number}
                  onChange={(e) =>
                    setForm({ ...form, unit_number: e.target.value })
                  }
                  placeholder="A-01-01"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="family_size" className="text-sm font-medium">
                {t.familySize} *
              </Label>
              <Input
                id="family_size"
                type="number"
                min="1"
                max="20"
                value={form.family_size}
                onChange={(e) =>
                  setForm({ ...form, family_size: parseInt(e.target.value) || 1 })
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name" className="text-sm font-medium">
                  {t.emergencyContactName} *
                </Label>
                <Input
                  id="emergency_contact_name"
                  value={form.emergency_contact_name}
                  onChange={(e) =>
                    setForm({ ...form, emergency_contact_name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone" className="text-sm font-medium">
                  {t.emergencyContactPhone} *
                </Label>
                <Input
                  id="emergency_contact_phone"
                  type="tel"
                  value={form.emergency_contact_phone}
                  onChange={(e) =>
                    setForm({ ...form, emergency_contact_phone: e.target.value })
                  }
                  placeholder="01X-XXXXXXX"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_number" className="text-sm font-medium">
                {t.vehicleNumber}
              </Label>
              <Input
                id="vehicle_number"
                value={form.vehicle_number}
                onChange={(e) =>
                  setForm({ ...form, vehicle_number: e.target.value })
                }
                placeholder="ABC1234"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language_preference" className="text-sm font-medium">
                {t.languagePreference}
              </Label>
              <Select
                value={form.language_preference}
                onValueChange={(value) =>
                  setForm({ ...form, language_preference: value as Language })
                }
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  {t.password}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  {t.confirmPassword}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {passwordError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}

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