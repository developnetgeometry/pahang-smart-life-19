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
import { Loader2, UserCheck, Eye, EyeOff } from "lucide-react";

export default function CompleteAccount() {
  const { user: authUser, language, loadProfileAndRoles } = useAuth();
  const [user, setUser] = useState<any>(authUser);
  const { hasRole } = useUserRoles();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
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
      subtitle:
        "Please provide the following information to complete your account setup",
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
    },
    ms: {
      title: "Lengkapkan Akaun Anda",
      subtitle:
        "Sila berikan maklumat berikut untuk melengkapkan persediaan akaun anda",
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
    },
  };

  const t = text[language];

  // Check if user is a guest
  const isGuest = hasRole('guest');

  // Check session validity and handle invitation links
  useEffect(() => {
    let hasSetInitialSession = false;
    
    // Set up auth state listener FIRST to catch auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change in CompleteAccount:', event, session ? 'session exists' : 'no session');
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSessionValid(!!session);
          setUser(session?.user ?? null);
        } else if (event === 'SIGNED_OUT') {
          setSessionValid(false);
          setUser(null);
        }
      }
    );

    // Check for invitation/verification parameters in URL
    const handleInvitationLink = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenHash = urlParams.get('token_hash');
      const type = urlParams.get('type');
      const code = urlParams.get('code');
      
      if (tokenHash && type) {
        console.log('Processing invitation link with token_hash and type:', type);
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as any,
          });
          
          if (error) {
            console.error('Token verification failed:', error);
            if (!hasSetInitialSession) {
              setSessionValid(false);
              hasSetInitialSession = true;
            }
            return;
          }
          
          if (data.session) {
            console.log('Session established from invitation link');
            setSessionValid(true);
            setUser(data.session.user);
            hasSetInitialSession = true;
            
            // Clean up URL parameters
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
            return;
          }
        } catch (error) {
          console.error('Invitation link processing error:', error);
          if (!hasSetInitialSession) {
            setSessionValid(false);
            hasSetInitialSession = true;
          }
          return;
        }
      }
      
      if (code) {
        console.log('Processing invitation link with code');
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('Code exchange failed:', error);
            if (!hasSetInitialSession) {
              setSessionValid(false);
              hasSetInitialSession = true;
            }
            return;
          }
          
          if (data.session) {
            console.log('Session established from code exchange');
            setSessionValid(true);
            setUser(data.session.user);
            hasSetInitialSession = true;
            
            // Clean up URL parameters
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
            return;
          }
        } catch (error) {
          console.error('Code exchange error:', error);
          if (!hasSetInitialSession) {
            setSessionValid(false);
            hasSetInitialSession = true;
          }
          return;
        }
      }
      
      // If no URL parameters, check for existing session
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session check error:", error);
          if (!hasSetInitialSession) {
            setSessionValid(false);
            hasSetInitialSession = true;
          }
          return;
        }
        if (!hasSetInitialSession) {
          setSessionValid(!!session);
          setUser(session?.user ?? null);
          hasSetInitialSession = true;
        }
      } catch (error) {
        console.error("Session validation error:", error);
        if (!hasSetInitialSession) {
          setSessionValid(false);
          hasSetInitialSession = true;
        }
      }
    };
    
    handleInvitationLink();
    
    return () => subscription.unsubscribe();
  }, []);

  const handleSessionRecovery = () => {
    toast({
      title: "Session Expired",
      description: "Please log in again to continue",
      variant: "destructive",
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
      // Check session before attempting password update
      if (form.password) {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error("No valid session for password update:", sessionError);
          toast({
            title: "Session Expired",
            description: "Password update requires a valid session. Please log in again.",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: form.password
        });
        
        if (passwordError) {
          // If password update fails due to session, still allow profile completion
          if (passwordError.message?.includes("session") || passwordError.message?.includes("auth")) {
            console.warn("Password update failed due to session issue, continuing with profile update only");
            toast({
              title: "Password Update Failed",
              description: "Your profile will be updated, but password change failed due to session expiry.",
              variant: "destructive",
            });
          } else {
            throw passwordError;
          }
        }
      }

      // Update profile - use 'id' column not 'user_id'
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
          account_status: "approved",
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast({
        title: t.success,
        description: "Welcome to the community management system!",
      });

      // Reload profile and roles to update auth context
      console.log('Reloading profile and roles after account completion');
      await loadProfileAndRoles();

      // Add a small delay to ensure context updates properly
      setTimeout(() => {
        console.log('Navigating to home page');
        navigate("/");
      }, 500);
    } catch (error) {
      console.error("Error completing account:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : t.error,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking session
  if (sessionValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Connecting your session...</CardTitle>
            <CardDescription>
              Please wait while we verify your authentication.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show session recovery UI if session is invalid
  if (sessionValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Session Expired</CardTitle>
            <CardDescription>
              Your session has expired. Please log in again to complete your account setup.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSessionRecovery} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                onChange={(e) =>
                  setForm({ ...form, unit_number: e.target.value })
                }
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
                onChange={(e) =>
                  setForm({
                    ...form,
                    family_size: parseInt(e.target.value) || 1,
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_contact_name">
                {t.emergencyContactName} *
              </Label>
              <Input
                id="emergency_contact_name"
                value={form.emergency_contact_name}
                onChange={(e) =>
                  setForm({ ...form, emergency_contact_name: e.target.value })
                }
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_contact_phone">
                {t.emergencyContactPhone} *
              </Label>
              <Input
                id="emergency_contact_phone"
                type="tel"
                value={form.emergency_contact_phone}
                onChange={(e) =>
                  setForm({ ...form, emergency_contact_phone: e.target.value })
                }
                placeholder="+60123456789"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_number">{t.vehicleNumber}</Label>
              <Input
                id="vehicle_number"
                value={form.vehicle_number}
                onChange={(e) =>
                  setForm({ ...form, vehicle_number: e.target.value })
                }
                placeholder="ABC 1234"
              />
            </div>

            {/* Password Section */}
            <div className="space-y-2">
              <Label htmlFor="password">{t.password}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    setPasswordError("");
                  }}
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t.hidePassword : t.showPassword}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            {form.password && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => {
                      setForm({ ...form, confirmPassword: e.target.value });
                      setPasswordError("");
                    }}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? t.hidePassword : t.showPassword}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-xs text-destructive mt-1">{passwordError}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="language_preference">
                {t.languagePreference} *
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

            <Button type="submit" className="w-full" disabled={loading}>
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