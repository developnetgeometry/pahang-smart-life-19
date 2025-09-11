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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useAuth();
  const { t } = useTranslation(language || "en");
  const { toast } = useToast();

  // Check for valid reset session on component mount
  useEffect(() => {
    const checkResetSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        setError(
          language === "en"
            ? "Invalid or expired reset link. Please request a new password reset."
            : "Pautan tetapan semula tidak sah atau telah tamat tempoh. Sila minta tetapan semula kata laluan baharu."
        );
        return;
      }

      // Check if this is actually a password reset session
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      
      if (!accessToken && !refreshToken && !session.user?.email) {
        setError(
          language === "en"
            ? "Invalid reset link. Please request a new password reset."
            : "Pautan tetapan semula tidak sah. Sila minta tetapan semula kata laluan baharu."
        );
      }
    };

    checkResetSession();
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

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        throw updateError;
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
      setError(
        error.message || 
        (language === "en"
          ? "Failed to reset password. Please try again."
          : "Gagal menetapkan semula kata laluan. Sila cuba lagi.")
      );
    } finally {
      setIsLoading(false);
    }
  };

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