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
        // Clear any existing session first to avoid conflicts
        await supabase.auth.signOut();
        
        // Wait a bit for cleanup
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const currentUrl = window.location.href;
        const urlObj = new URL(currentUrl);
        
        console.log('=== DETAILED RESET PASSWORD DEBUG ===');
        console.log('Current timestamp:', new Date().toISOString());
        console.log('Full URL:', currentUrl);
        console.log('Pathname:', urlObj.pathname);
        console.log('Hash raw:', window.location.hash);
        console.log('Hash length:', window.location.hash.length);
        console.log('Search raw:', window.location.search);
        console.log('Search length:', window.location.search.length);
        console.log('Document referrer:', document.referrer);
        console.log('History length:', history.length);
        
        // Parse tokens from URL hash (Supabase password reset format)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        // Also check search params as fallback
        const searchAccessToken = searchParams.get('access_token');
        const searchRefreshToken = searchParams.get('refresh_token');
        const searchType = searchParams.get('type');
        
        console.log('Hash parameters found:');
        for (const [key, value] of hashParams) {
          console.log(`  ${key}: ${value ? '***PRESENT***' : 'null'}`);
        }
        
        console.log('Search parameters found:');
        for (const [key, value] of new URLSearchParams(window.location.search)) {
          console.log(`  ${key}: ${value ? '***PRESENT***' : 'null'}`);
        }
        
        console.log('Token extraction results:');
        console.log('  Hash access token:', accessToken ? 'FOUND' : 'MISSING');
        console.log('  Hash refresh token:', refreshToken ? 'FOUND' : 'MISSING');
        console.log('  Hash type:', type || 'MISSING');
        console.log('  Search access token:', searchAccessToken ? 'FOUND' : 'MISSING');
        console.log('  Search refresh token:', searchRefreshToken ? 'FOUND' : 'MISSING');
        console.log('  Search type:', searchType || 'MISSING');
        
        // Try hash tokens first (standard Supabase redirect format)
        let finalAccessToken = accessToken;
        let finalRefreshToken = refreshToken;
        let finalType = type;
        
        // Fallback to search params if hash tokens not found
        if (!finalAccessToken && searchAccessToken) {
          finalAccessToken = searchAccessToken;
          finalRefreshToken = searchRefreshToken;
          finalType = searchType;
          console.log('Using search params as fallback');
        }
        
        if (finalAccessToken && finalRefreshToken) {
          console.log('✅ Valid tokens found, attempting session setup...');
          console.log('Token source:', finalAccessToken === accessToken ? 'hash' : 'search');
          console.log('Token type:', finalType || 'no type specified');
          
          // Establish session using tokens (don't require specific type for flexibility)
          const { data, error } = await supabase.auth.setSession({
            access_token: finalAccessToken,
            refresh_token: finalRefreshToken
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
          
          console.log('✅ Password reset session established successfully');
          console.log('User ID:', session.user?.id);
          console.log('User email:', session.user?.email);
          
          setIsVerifying(false);
          return;
        }
        
        // Check for error parameters that might indicate token issues
        const errorParam = hashParams.get('error') || searchParams.get('error');
        const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');
        
        if (errorParam) {
          console.error('❌ URL contains error parameters:', errorParam, errorDescription);
          throw new Error(`Authentication error: ${errorDescription || errorParam}`);
        }
        
        // No valid reset tokens found - this is the main issue!
        console.error('❌ NO TOKENS FOUND IN URL');
        console.error('This usually means:');
        console.error('1. You\'re using an OLD email (sent before Supabase config changes)');
        console.error('2. Supabase Auth redirect URLs are still incorrect');
        console.error('3. There\'s a redirect loop removing the tokens');
        console.error('');
        console.error('SOLUTION: Request a NEW password reset email and use that link');
        
        throw new Error(
          language === "en"
            ? "This page can only be accessed through a fresh password reset link. Please request a NEW password reset from the login page (the old email won't work after configuration changes)."
            : "Halaman ini hanya boleh diakses melalui pautan tetapan semula kata laluan yang baharu. Sila minta tetapan semula kata laluan BAHARU dari halaman log masuk (emel lama tidak akan berfungsi selepas perubahan konfigurasi)."
        );
        
      } catch (error: any) {
        console.error('❌ Reset session setup error:', error);
        setError(
          error.message.includes('tokens found') || error.message.includes('Authentication error') || error.message.includes('fresh password reset')
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

      console.log('Password updated successfully');
      
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