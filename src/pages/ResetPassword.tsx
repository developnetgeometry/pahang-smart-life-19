import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useAuth();
  const { t } = useTranslation(language || "en");
  const { toast } = useToast();

  // Parse tokens from URL and establish session for password reset
  useEffect(() => {
    const setupResetSession = async () => {
      setIsVerifying(true);
      
      try {
        const currentUrl = window.location.href;
        const urlParams = new URLSearchParams(window.location.search);
        
        console.log('=== CUSTOM PASSWORD RESET DEBUG ===');
        console.log('Current timestamp:', new Date().toISOString());
        console.log('Full URL:', currentUrl);
        console.log('Search params:', window.location.search);
        
        // Extract custom reset tokens (token and email from query params)
        const resetToken = urlParams.get('token');
        const resetEmail = urlParams.get('email');
        
        console.log('Custom reset token:', resetToken ? 'FOUND' : 'MISSING');
        console.log('Custom reset email:', resetEmail ? 'FOUND' : 'MISSING');
        
        if (resetToken && resetEmail) {
          console.log('✅ Custom reset tokens found - using custom reset flow');
          
          // Store tokens for the password reset process
          setResetToken(resetToken);  
          setResetEmail(resetEmail);
          setIsVerifying(false);
          return;
        }
        
        // Fallback: Check for Supabase's built-in reset tokens (hash format)
        console.log('No custom tokens found, checking for Supabase tokens...');
        
        // Parse tokens from URL hash (Supabase password reset format)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        console.log('Supabase tokens - access:', accessToken ? 'FOUND' : 'MISSING', 
                   'refresh:', refreshToken ? 'FOUND' : 'MISSING', 'type:', type);
        
        if (accessToken && refreshToken) {
          console.log('✅ Supabase tokens found - using built-in reset flow');
          
          // Establish session using Supabase tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('❌ Session establishment error:', error);
            throw new Error(`Failed to establish reset session: ${error.message}`);
          }
          
          // Verify session is actually established
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            console.error('❌ No session after setSession call');
            throw new Error('Session not established after setSession');
          }
          
          console.log('✅ Supabase password reset session established successfully');
          setIsVerifying(false);
          return;
        }
        
        // No valid reset tokens found
        console.error('❌ NO VALID RESET TOKENS FOUND');
        console.error('Please request a new password reset from the login page');
        
        throw new Error(
          language === "en"
            ? "This page can only be accessed through a password reset link. Please request a new password reset from the login page."
            : "Halaman ini hanya boleh diakses melalui pautan tetapan semula kata laluan. Sila minta tetapan semula kata laluan baharu dari halaman log masuk."
        );
        
      } catch (error: any) {
        console.error('❌ Reset session setup error:', error);
        setError(
          error.message.includes('password reset link') || error.message.includes('Authentication error')
            ? error.message
            : (language === "en"
              ? "Invalid or expired reset link. Please request a new password reset."
              : "Pautan tetapan semula tidak sah atau telah tamat tempoh. Sila minta tetapan semula kata laluan baharu.")
        );
        setIsVerifying(false);
      }
    };

    setupResetSession();
  }, [searchParams, language]);

  const validatePassword = (pass: string): string => {
    if (pass.length < 6) {
      return language === "en"
        ? "Password must be at least 6 characters long"
        : "Kata laluan mesti sekurang-kurangnya 6 aksara";
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pass)) {
      return language === "en"
        ? "Password must contain uppercase, lowercase and number"
        : "Kata laluan mesti mengandungi huruf besar, huruf kecil dan nombor";
    }
    return "";
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validation
      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        return;
      }

      if (password !== confirmPassword) {
        setError(
          language === "en"
            ? "Passwords do not match"
            : "Kata laluan tidak sepadan"
        );
        return;
      }

      // Check if we're using custom reset tokens or Supabase tokens
      if (resetToken && resetEmail) {
        console.log('Using custom password reset flow');
        
        // Verify the token and reset password using our custom system
        const { error: resetError } = await supabase.functions.invoke('reset-password-with-token', {
          body: {
            token: resetToken,
            email: resetEmail,
            newPassword: password
          }
        });

        if (resetError) {
          console.error('Custom password reset error:', resetError);
          throw new Error(resetError.message || 'Failed to reset password');
        }

        console.log('Custom password reset successful');
      } else {
        console.log('Using Supabase built-in password reset flow');
        
        // Verify session exists before attempting password update
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session check error:', sessionError);
          throw new Error('Failed to verify reset session');
        }
        
        if (!session) {
          console.error('No active session found for password reset');
          throw new Error('Reset session expired. Please request a new password reset link.');
        }
        
        console.log('Updating password for user:', session.user?.email);

        // Update password with active session
        const { error: updateError } = await supabase.auth.updateUser({
          password: password
        });

        if (updateError) {
          console.error('Password update error:', updateError);
          throw updateError;
        }

        console.log('Supabase password updated successfully');
      }
      
      setSuccess(true);
      toast({
        title: language === "en" ? "Password Reset Successful" : "Kata Laluan Berjaya Ditetapkan Semula",
        description: language === "en" 
          ? "Your password has been updated successfully. You can now log in with your new password."
          : "Kata laluan anda telah dikemas kini dengan jayanya. Anda kini boleh log masuk dengan kata laluan baharu anda.",
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (error: any) {
      console.error("Password reset error:", error);
      
      // Provide specific error messages for common issues
      let errorMessage = error.message;
      
      if (error.message?.includes('AuthSessionMissingError') || error.message?.includes('session missing')) {
        errorMessage = language === "en"
          ? "Reset session expired. Please request a new password reset link."
          : "Sesi tetapan semula telah tamat tempoh. Sila minta pautan tetapan semula kata laluan baharu.";
      } else if (error.message?.includes('Token not found') || error.message?.includes('expired')) {
        errorMessage = language === "en"
          ? "Reset link has expired. Please request a new password reset."
          : "Pautan tetapan semula telah tamat tempoh. Sila minta tetapan semula kata laluan baharu.";
      }
      
      setError(
        errorMessage || 
        (language === "en"
          ? "Failed to reset password. Please try again."
          : "Gagal menetapkan semula kata laluan. Sila cuba lagi.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
            <CardTitle className="text-xl font-semibold text-foreground">
              {language === "en" ? "Verifying Reset Link..." : "Mengesahkan Pautan Tetapan Semula..."}
            </CardTitle>
            <CardDescription>
              {language === "en"
                ? "Please wait while we verify your password reset link"
                : "Sila tunggu sementara kami mengesahkan pautan tetapan semula kata laluan anda"}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-foreground">
              {language === "en" ? "Password Reset Successful" : "Kata Laluan Berjaya Ditetapkan Semula"}
            </CardTitle>
            <CardDescription>
              {language === "en"
                ? "Your password has been updated successfully. Redirecting to login..."
                : "Kata laluan anda telah dikemas kini dengan jayanya. Mengalihkan ke log masuk..."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-xl font-semibold text-foreground">
            {language === "en" ? "Reset Your Password" : "Tetapkan Semula Kata Laluan Anda"}
          </CardTitle>
          <CardDescription>
            {language === "en"
              ? "Enter your new password below"
              : "Masukkan kata laluan baharu anda di bawah"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">
                {language === "en" ? "New Password" : "Kata Laluan Baharu"}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  language === "en"
                    ? "Enter new password"
                    : "Masukkan kata laluan baharu"
                }
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {language === "en" ? "Confirm New Password" : "Sahkan Kata Laluan Baharu"}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={
                  language === "en"
                    ? "Confirm new password"
                    : "Sahkan kata laluan baharu"
                }
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !password || !confirmPassword}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === "en" ? "Updating..." : "Mengemas kini..."}
                </>
              ) : (
                language === "en" ? "Update Password" : "Kemas Kini Kata Laluan"
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/login")}
                disabled={isLoading}
              >
                {language === "en" ? "Back to Login" : "Kembali ke Log Masuk"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}