import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MapPin, Shield, Users, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { createTestUsers } from "@/utils/createTestUsers";
import { DocumentUpload } from "@/components/ui/document-upload";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [location, setLocation] = useState("");
  const [selectedRole, setSelectedRole] = useState("service_provider");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, Array<{ url: string; path: string; name: string }>>>({});
  const [pendingDocuments, setPendingDocuments] = useState<Record<string, File[]>>({});
  const [pdpaAccepted, setPdpaAccepted] = useState(false);
  const [showPdpaDialog, setShowPdpaDialog] = useState(false);
  const [signupStep, setSignupStep] = useState(1);
  const [districts, setDistricts] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [communities, setCommunities] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [isCreatingUsers, setIsCreatingUsers] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const { login, language, switchLanguage } = useAuth();
  const { t } = useTranslation(language || "ms"); // Ensure we always have a language
  const { toast } = useToast();

  // Show test tools only in development or if explicitly enabled
  const showTestTools = import.meta.env.DEV || import.meta.env.VITE_SHOW_TEST_TOOLS === 'true';

  // Business type field mapping
  const businessTypeFieldMap: Record<string, {
    requiresExperience: boolean;
    requiredDocuments: Array<{ type: string; name: string; nameMs: string }>;
  }> = {
    electrical: {
      requiresExperience: true,
      requiredDocuments: [
        { type: 'license', name: 'Electrical License', nameMs: 'Lesen Elektrik' },
        { type: 'certificate', name: 'Safety Certificate', nameMs: 'Sijil Keselamatan' },
        { type: 'insurance', name: 'Insurance Certificate', nameMs: 'Sijil Insurans' }
      ]
    },
    plumbing: {
      requiresExperience: true,
      requiredDocuments: [
        { type: 'license', name: 'Plumbing License', nameMs: 'Lesen Paip' },
        { type: 'certificate', name: 'Trade Certificate', nameMs: 'Sijil Perdagangan' },
        { type: 'insurance', name: 'Insurance Certificate', nameMs: 'Sijil Insurans' }
      ]
    },
    security: {
      requiresExperience: true,
      requiredDocuments: [
        { type: 'license', name: 'Security License', nameMs: 'Lesen Keselamatan' },
        { type: 'background_check', name: 'Background Check', nameMs: 'Pemeriksaan Latar Belakang' },
        { type: 'training', name: 'Security Training Certificate', nameMs: 'Sijil Latihan Keselamatan' }
      ]
    },
    cleaning: {
      requiresExperience: false,
      requiredDocuments: [
        { type: 'certificate', name: 'Health Certificate', nameMs: 'Sijil Kesihatan' },
        { type: 'insurance', name: 'Insurance Certificate', nameMs: 'Sijil Insurans' }
      ]
    },
    landscaping: {
      requiresExperience: false,
      requiredDocuments: [
        { type: 'portfolio', name: 'Work Portfolio', nameMs: 'Portfolio Kerja' },
        { type: 'insurance', name: 'Insurance Certificate', nameMs: 'Sijil Insurans' }
      ]
    },
    maintenance: {
      requiresExperience: true,
      requiredDocuments: [
        { type: 'certificate', name: 'Technical Certificate', nameMs: 'Sijil Teknikal' },
        { type: 'insurance', name: 'Insurance Certificate', nameMs: 'Sijil Insurans' }
      ]
    },
    other: {
      requiresExperience: false,
      requiredDocuments: [
        { type: 'business_profile', name: 'Business Profile', nameMs: 'Profil Perniagaan' },
        { type: 'portfolio', name: 'Work Portfolio', nameMs: 'Portfolio Kerja' }
      ]
    }
  };

  // Load districts for registration
  useEffect(() => {
    const loadDistricts = async () => {
      const { data, error } = await supabase
        .from("districts")
        .select("id, name")
        .order("name");

      if (!error && data) {
        setDistricts(data);
      }
    };

    if (mode === "signUp") {
      loadDistricts();
    }
  }, [mode]);

  // Load communities based on selected district
  useEffect(() => {
    const loadCommunities = async () => {
      if (!districtId) {
        setCommunities([]);
        setCommunityId("");
        return;
      }

      const { data, error } = await supabase
        .from("communities")
        .select("id, name")
        .eq("district_id", districtId)
        .order("name");

      if (!error && data) {
        setCommunities(data);
      }
    };

    if (mode === "signUp" && districtId) {
      loadCommunities();
    }
  }, [mode, districtId]);

  // Reset uploaded documents when business type changes
  useEffect(() => {
    if (businessType) {
      setUploadedDocuments({});
      setPendingDocuments({});
    }
  }, [businessType]);

  // Reset to step 1 when mode changes
  useEffect(() => {
    if (mode === "signUp") {
      setSignupStep(1);
    }
  }, [mode]);

  const validateStep1 = () => {
    if (!fullName.trim()) {
      throw new Error(
        language === "en"
          ? "Full name is required"
          : "Nama penuh diperlukan"
      );
    }
    if (!districtId) {
      throw new Error(
        language === "en" ? "Please select a district" : "Sila pilih daerah"
      );
    }
    if (!communityId) {
      throw new Error(
        language === "en"
          ? "Please select a community"
          : "Sila pilih komuniti"
      );
    }
    if (!location.trim()) {
      throw new Error(
        language === "en" ? "Location is required" : "Lokasi diperlukan"
      );
    }
    if (!businessName.trim()) {
      throw new Error(
        language === "en"
          ? "Business name is required"
          : "Nama perniagaan diperlukan"
      );
    }
    if (!businessType.trim()) {
      throw new Error(
        language === "en"
          ? "Business type is required"
          : "Jenis perniagaan diperlukan"
      );
    }
    if (!email.trim()) {
      throw new Error(
        language === "en" ? "Email is required" : "Emel diperlukan"
      );
    }
    if (!password.trim()) {
      throw new Error(
        language === "en" ? "Password is required" : "Kata laluan diperlukan"
      );
    }
  };

  const handleNextStep = () => {
    try {
      validateStep1();
      setSignupStep(2);
      setError("");
    } catch (err: any) {
      setError(err?.message || "Please fill in all required fields");
    }
  };

  const handlePreviousStep = () => {
    setSignupStep(1);
    setError("");
  };

  const handlePendingDocumentUpload = (documentType: string, files: File[]) => {
    setPendingDocuments(prev => ({
      ...prev,
      [documentType]: files
    }));
  };

  const handlePendingDocumentRemove = (documentType: string, fileName: string) => {
    setPendingDocuments(prev => ({
      ...prev,
      [documentType]: (prev[documentType] || []).filter(file => file.name !== fileName)
    }));
  };

  const handleDocumentUpload = (documentType: string, url: string, path: string, fileName: string) => {
    setUploadedDocuments(prev => ({
      ...prev,
      [documentType]: [
        ...(prev[documentType] || []),
        { url, path, name: fileName }
      ]
    }));
  };

  const handleDocumentRemove = (documentType: string, url: string) => {
    setUploadedDocuments(prev => ({
      ...prev,
      [documentType]: (prev[documentType] || []).filter(doc => doc.url !== url)
    }));
  };

  const getCurrentBusinessTypeConfig = () => {
    return businessTypeFieldMap[businessType] || businessTypeFieldMap.other;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (mode === "signIn") {
        await login(email, password);
        
        // Check if user has pending approval after login attempt
        // This will be handled by the AuthContext and app routing
      } else {
        // Step 2 validation for signup
        if (signupStep === 2) {
          // Validate years of experience only if required for business type
          const businessConfig = getCurrentBusinessTypeConfig();
          if (businessConfig.requiresExperience && !yearsOfExperience.trim()) {
            throw new Error(
              language === "en"
                ? "Years of experience is required for this business type"
                : "Tahun pengalaman diperlukan untuk jenis perniagaan ini"
            );
          }

          // Validate required documents from pending documents
          for (const doc of businessConfig.requiredDocuments) {
            const docsForType = pendingDocuments[doc.type] || [];
            if (docsForType.length === 0) {
              throw new Error(
                language === "en"
                  ? `${doc.name} is required`
                  : `${doc.nameMs} diperlukan`
              );
            }
          }

          // Validate PDPA acceptance
          if (!pdpaAccepted) {
            throw new Error(
              language === "en"
                ? "You must read and accept the PDPA to register"
                : "Anda mesti membaca dan menerima PDPA untuk mendaftar"
            );
          }

          const redirectUrl = `${window.location.origin}/`;

          // Pass all signup data as metadata for the trigger to handle
          const metadata: Record<string, any> = {
            full_name: fullName.trim(),
            mobile_no: phone.trim() || null,
            district_id: districtId,
            community_id: communityId,
            address: location.trim(),
            language: language,
            pdpa_declare: pdpaAccepted,
            signup_flow: selectedRole, // This tells the trigger which role to assign
          };

          // Add service provider specific metadata (always added now)
          metadata.business_name = businessName.trim();
          metadata.business_type = businessType.trim();
          metadata.business_description = "Service provider registered via signup";
          metadata.experience_years = yearsOfExperience.trim();
          metadata.contact_phone = phone.trim();

          const { data: authData, error: signUpError } =
            await supabase.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo: redirectUrl,
                data: metadata,
              },
            });

          if (signUpError) {
            console.error("Signup error:", signUpError);
            console.error("Metadata sent:", metadata);
            throw signUpError;
          }

          if (authData.user) {
            // Now upload pending documents to storage
            const uploadedDocumentsMap: Record<string, Array<{ url: string; path: string; name: string }>> = {};
            
            for (const [docType, files] of Object.entries(pendingDocuments)) {
              uploadedDocumentsMap[docType] = [];
              
              for (const file of files) {
                const timestamp = Date.now();
                const filePath = `${authData.user.id}/${docType}/${timestamp}-${file.name}`;
                
                const { data: uploadData, error: uploadError } = await supabase.storage
                  .from('service-provider-documents')
                  .upload(filePath, file);

                if (uploadError) {
                  console.error(`Error uploading ${docType} document:`, uploadError);
                  throw new Error(`Failed to upload ${docType} document`);
                }

                if (uploadData) {
                  const { data: publicUrlData } = supabase.storage
                    .from('service-provider-documents')
                    .getPublicUrl(uploadData.path);

                  uploadedDocumentsMap[docType].push({
                    url: publicUrlData.publicUrl,
                    path: uploadData.path,
                    name: file.name
                  });
                }
              }
            }

            // Wait for the trigger to create the basic profile, then update it
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Brief delay for trigger

            // Update the profile with registration details
            const profileUpdate: any = {
              mobile_no: phone.trim() || null,
              district_id: districtId?.replace("district-", "") || districtId,
              community_id: communityId?.replace("community-", "") || communityId,
              address: location.trim(),
              language: language,
              pdpa_declare: pdpaAccepted,
              account_status: "pending",
              is_active: true,
            };

            // Add service provider specific data (always added now)
            profileUpdate.business_name = businessName.trim();
            profileUpdate.business_type = businessType.trim();
            profileUpdate.license_number = licenseNumber.trim() || null;
            profileUpdate.years_of_experience =
              parseInt(yearsOfExperience) || null;
            profileUpdate.uploaded_documents = uploadedDocumentsMap;

            const { error: profileError } = await supabase
              .from("profiles")
              .update(profileUpdate)
              .eq("user_id", authData.user.id);

            if (profileError) {
              console.error("Profile update error:", profileError);
              throw new Error(`Profile update failed: ${profileError.message}`);
            }

            console.log(
              "Profile updated successfully for user:",
              authData.user.id
            );

            // Assign selected role using enhanced_user_roles table
            const roleData = {
              user_id: authData.user.id,
              role: selectedRole as any,
              district_id: districtId?.replace("district-", "") || districtId,
              assigned_by: authData.user.id, // Self-assigned during registration
              is_active: true,
            };

            const { error: roleError } = await supabase
              .from("enhanced_user_roles")
              .insert(roleData);

            if (roleError) {
              console.error("Role assignment error:", roleError);
              throw new Error(`Role assignment failed: ${roleError.message}`);
            }

            // Sign out the user immediately since account is pending approval
            await supabase.auth.signOut();
            
            // Show success message
            toast({
              title: language === "en" ? "Account Created!" : "Akaun Dicipta!",
              description:
                language === "en"
                  ? "Your account has been created and is pending approval. You will be able to sign in once approved by the community admin."
                  : "Akaun anda telah dicipta dan sedang menunggu kelulusan. Anda boleh log masuk setelah diluluskan oleh pentadbir komuniti.",
            });

            // Navigate to pending approval page
            window.location.href = '/pending-approval';

            // Reset form
            setMode("signIn");
            setSignupStep(1);
            setFullName("");
            setPhone("");
            setDistrictId("");
            setCommunityId("");
            setLocation("");
            setSelectedRole("service_provider");
            setBusinessName("");
            setBusinessType("");
            setLicenseNumber("");
            setYearsOfExperience("");
            setUploadedDocuments({});
            setPendingDocuments({});
            setPdpaAccepted(false);
            setPassword("");
          }
        }
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTestUsers = async () => {
    // Safety check to prevent accidental use in production
    if (!showTestTools) {
      toast({
        variant: "destructive",
        title: "Not Available",
        description: "Test user creation is only available in development mode.",
      });
      return;
    }

    console.log("🚀 Starting user creation process...");
    setIsCreatingUsers(true);
    try {
      console.log("📞 Calling createTestUsers function...");
      const results = await createTestUsers();
      console.log("📊 User creation results:", results);

      const successful = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      console.log(
        `✅ Successful: ${successful.length}, ❌ Failed: ${failed.length}`
      );

      if (successful.length > 0) {
        console.log("✅ Showing success toast");
        toast({
          title:
            language === "en" ? "Test Users Created" : "Pengguna Ujian Dicipta",
          description: `${
            successful.length
          } accounts created successfully: ${successful
            .map((r) => `${r.email} (${r.role})`)
            .join(", ")}`,
        });
      }

      if (failed.length > 0) {
        console.log("❌ Showing failure toast", failed);
        toast({
          variant: "destructive",
          title:
            language === "en"
              ? "Some Users Failed"
              : "Sesetengah Pengguna Gagal",
          description: `${failed.length} accounts failed: ${failed
            .map((r) => r.email)
            .join(", ")}`,
        });
      }
    } catch (error) {
      console.error("💥 Unexpected error in handleCreateTestUsers:", error);
      toast({
        variant: "destructive",
        title:
          language === "en"
            ? "Error Creating Users"
            : "Ralat Mencipta Pengguna",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      console.log("🏁 User creation process completed");
      setIsCreatingUsers(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      setError(
        language === "en"
          ? "Please enter your email address"
          : "Sila masukkan alamat emel anda"
      );
      return;
    }

    setIsResettingPassword(true);
    setError("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: language === "en" ? "Success" : "Berjaya",
        description:
          language === "en"
            ? "Password reset instructions sent to your email"
            : "Arahan tetapan semula kata laluan telah dihantar ke emel anda",
      });
      
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
      console.error("Password reset error:", error);
      setError(
        language === "en"
          ? "Failed to send reset email. Please try again."
          : "Gagal menghantar emel tetapan semula. Sila cuba lagi."
      );
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full max-w-full overflow-x-hidden relative flex items-center justify-center p-4"
      style={{
        backgroundImage: `url('/lovable-uploads/7687f368-63da-4bc0-a610-d88851aebf13.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <Button
          variant={language === "en" ? "default" : "outline"}
          size="sm"
          onClick={() => switchLanguage("en")}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          EN
        </Button>
        <Button
          variant={language === "ms" ? "default" : "outline"}
          size="sm"
          onClick={() => switchLanguage("ms")}
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
              <span className="font-medium">{t("pahangState")}</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              {t("smartCommunity")}
            </h1>
            <p className="text-xl text-white/90 max-w-lg">
              {language === "en"
                ? "Connecting communities across Pahang state with modern digital solutions for residents, administrators, and security personnel."
                : "Menghubungkan komuniti di seluruh negeri Pahang dengan penyelesaian digital moden untuk penduduk, pentadbir, dan kakitangan keselamatan."}
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">
                {language === "en"
                  ? "Multi-Role System"
                  : "Sistem Pelbagai Peranan"}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <Shield className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">
                {language === "en" ? "Smart Security" : "Keselamatan Pintar"}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">
                {language === "en" ? "Community Hub" : "Hub Komuniti"}
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-elegant border-white/20 bg-card/95 backdrop-blur">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                {mode === "signIn"
                  ? t("signIn")
                  : language === "en"
                  ? "Create Account"
                  : "Buat Akaun"}
              </CardTitle>
              <CardDescription>
                {mode === "signIn"
                  ? language === "en"
                    ? "Access your smart community platform"
                    : "Akses platform komuniti pintar anda"
                  : language === "en"
                  ? "Register as a Service Provider"
                  : "Daftar sebagai Penyedia Perkhidmatan"}
              </CardDescription>
              <div className="mt-2 flex justify-center gap-2">
                <Button
                  type="button"
                  variant={mode === "signIn" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("signIn")}
                >
                  {t("signIn")}
                </Button>
                <Button
                  type="button"
                  variant={mode === "signUp" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("signUp")}
                >
                  {language === "en" ? "Service Provider Sign Up" : "Daftar Penyedia Perkhidmatan"}
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

                {mode === "signIn" ? (
                  // Sign In Form
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("email")} *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t("emailPlaceholder")}
                        required
                        className="transition-smooth"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">{t("password")} *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t("passwordPlaceholder")}
                        required
                        className="transition-smooth"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full gradient-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {language === "en" ? "Signing In..." : "Log Masuk..."}
                        </>
                      ) : (
                        t("signIn")
                      )}
                    </Button>

                    <div className="text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-primary hover:text-primary/80"
                      >
                        {language === "en"
                          ? "Forgot Password?"
                          : "Lupa Kata Laluan?"}
                      </Button>
                    </div>

                    {/* Forgot Password Dialog */}
                    <Dialog
                      open={showForgotPassword}
                      onOpenChange={setShowForgotPassword}
                    >
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {language === "en"
                              ? "Reset Password"
                              : "Tetapan Semula Kata Laluan"}
                          </DialogTitle>
                          <DialogDescription>
                            {language === "en"
                              ? "Enter your email address and we'll send you instructions to reset your password."
                              : "Masukkan alamat emel anda dan kami akan menghantar arahan untuk menetapkan semula kata laluan anda."}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="resetEmail">
                              {language === "en" ? "Email Address" : "Alamat Emel"}
                            </Label>
                            <Input
                              id="resetEmail"
                              type="email"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              placeholder={t("emailPlaceholder")}
                            />
                          </div>
                          <Button
                            onClick={handleForgotPassword}
                            className="w-full"
                            disabled={isResettingPassword}
                          >
                            {isResettingPassword ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {language === "en" ? "Sending..." : "Menghantar..."}
                              </>
                            ) : (
                              language === "en" ? "Send Reset Instructions" : "Hantar Arahan Tetapan Semula"
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </>
                ) : (
                  // Sign Up Form with 2-Step Wizard
                  <>
                    {/* Notice for residents */}
                    <Alert className="mb-4">
                      <Users className="h-4 w-4" />
                      <AlertDescription>
                        {language === "en" 
                          ? "Residents: Please contact your Community Admin to create your account. Only Service Providers can register directly."
                          : "Penduduk: Sila hubungi Pentadbir Komuniti anda untuk membuat akaun. Hanya Penyedia Perkhidmatan boleh mendaftar secara langsung."
                        }
                      </AlertDescription>
                    </Alert>

                    {/* Step Progress Indicator */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {language === "en" ? `Step ${signupStep} of 2` : `Langkah ${signupStep} dari 2`}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {signupStep === 1 ? (
                            language === "en" ? "Basic Information" : "Maklumat Asas"
                          ) : (
                            language === "en" ? "Business Details" : "Maklumat Perniagaan"
                          )}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${(signupStep / 2) * 100}%` }}
                        />
                      </div>
                    </div>

                    {signupStep === 1 ? (
                      // Step 1: Basic Information + Email/Password
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="role">
                            {language === "en" ? "Account Type" : "Jenis Akaun"}
                          </Label>
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Shield className="h-4 w-4 text-primary" />
                              <span className="font-medium">
                                {language === "en" ? "Service Provider" : "Penyedia Perkhidmatan"}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {language === "en" 
                                ? "Register your business to provide services to the community"
                                : "Daftarkan perniagaan anda untuk menyediakan perkhidmatan kepada komuniti"
                              }
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="fullName">
                            {language === "en" ? "Full Name" : "Nama Penuh"} *
                          </Label>
                          <Input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder={
                              language === "en"
                                ? "Ahmad Razak bin Abdullah"
                                : "Ahmad Razak bin Abdullah"
                            }
                            required
                            className="transition-smooth"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">
                            {language === "en"
                              ? "Phone Number (Optional)"
                              : "Nombor Telefon (Pilihan)"}
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
                            {language === "en" ? "Select District" : "Pilih Daerah"} *
                          </Label>
                          <Select
                            value={districtId}
                            onValueChange={(value) => {
                              setDistrictId(value);
                            }}
                            required
                          >
                            <SelectTrigger className="transition-smooth bg-background border-2">
                              <SelectValue
                                placeholder={
                                  language === "en"
                                    ? "Choose your district"
                                    : "Pilih daerah anda"
                                }
                              />
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
                            {language === "en"
                              ? "Select Community"
                              : "Pilih Komuniti"} *
                          </Label>
                          <Select
                            value={communityId}
                            onValueChange={setCommunityId}
                            required
                            disabled={!districtId}
                          >
                            <SelectTrigger className="transition-smooth">
                              <SelectValue
                                placeholder={
                                  !districtId
                                    ? language === "en"
                                      ? "Please select district first"
                                      : "Sila pilih daerah dahulu"
                                    : language === "en"
                                    ? "Choose your community"
                                    : "Pilih komuniti anda"
                                }
                              />
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
                            {language === "en"
                              ? "Specific Location/Address"
                              : "Lokasi/Alamat Khusus"} *
                          </Label>
                          <Input
                            id="location"
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder={
                              language === "en"
                                ? "e.g., Taman Sejahtera, Block A"
                                : "cth: Taman Sejahtera, Blok A"
                            }
                            required
                            className="transition-smooth"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="businessName">
                            {language === "en"
                              ? "Business Name"
                              : "Nama Perniagaan"} *
                          </Label>
                          <Input
                            id="businessName"
                            type="text"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            placeholder={
                              language === "en"
                                ? "e.g., ABC Plumbing Services"
                                : "cth: Perkhidmatan Paip ABC"
                            }
                            required
                            className="transition-smooth"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="businessType">
                            {language === "en"
                              ? "Business Type"
                              : "Jenis Perniagaan"} *
                          </Label>
                          <Select
                            value={businessType}
                            onValueChange={setBusinessType}
                            required
                          >
                            <SelectTrigger className="transition-smooth">
                              <SelectValue
                                placeholder={
                                  language === "en"
                                    ? "Select business type"
                                    : "Pilih jenis perniagaan"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="plumbing">
                                {language === "en"
                                  ? "Plumbing Services"
                                  : "Perkhidmatan Paip"}
                              </SelectItem>
                              <SelectItem value="electrical">
                                {language === "en"
                                  ? "Electrical Services"
                                  : "Perkhidmatan Elektrik"}
                              </SelectItem>
                              <SelectItem value="cleaning">
                                {language === "en"
                                  ? "Cleaning Services"
                                  : "Perkhidmatan Pembersihan"}
                              </SelectItem>
                              <SelectItem value="maintenance">
                                {language === "en"
                                  ? "Maintenance Services"
                                  : "Perkhidmatan Penyelenggaraan"}
                              </SelectItem>
                              <SelectItem value="landscaping">
                                {language === "en"
                                  ? "Landscaping Services"
                                  : "Perkhidmatan Landskap"}
                              </SelectItem>
                              <SelectItem value="security">
                                {language === "en"
                                  ? "Security Services"
                                  : "Perkhidmatan Keselamatan"}
                              </SelectItem>
                              <SelectItem value="other">
                                {language === "en"
                                  ? "Other Services"
                                  : "Perkhidmatan Lain"}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">{t("email")} *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t("emailPlaceholder")}
                            required
                            className="transition-smooth"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="password">{t("password")} *</Label>
                          <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t("passwordPlaceholder")}
                            required
                            className="transition-smooth"
                          />
                        </div>

                        <Button
                          type="button"
                          onClick={handleNextStep}
                          className="w-full gradient-primary"
                          disabled={isLoading}
                        >
                          {language === "en" ? "Next" : "Seterusnya"}
                        </Button>
                      </>
                    ) : (
                      // Step 2: Business Specific Details + Documents + PDPA
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="licenseNumber">
                            {language === "en"
                              ? "License Number (Optional)"
                              : "Nombor Lesen (Pilihan)"}
                          </Label>
                          <Input
                            id="licenseNumber"
                            type="text"
                            value={licenseNumber}
                            onChange={(e) => setLicenseNumber(e.target.value)}
                            placeholder={
                              language === "en"
                                ? "e.g., LIC123456"
                                : "cth: LIC123456"
                            }
                            className="transition-smooth"
                          />
                        </div>

                        {/* Conditional Years of Experience field */}
                        {businessType && getCurrentBusinessTypeConfig().requiresExperience && (
                          <div className="space-y-2">
                            <Label htmlFor="yearsOfExperience">
                              {language === "en"
                                ? "Years of Experience"
                                : "Tahun Pengalaman"} *
                            </Label>
                            <Input
                              id="yearsOfExperience"
                              type="number"
                              min="0"
                              max="50"
                              value={yearsOfExperience}
                              onChange={(e) => setYearsOfExperience(e.target.value)}
                              placeholder={
                                language === "en"
                                  ? "e.g., 5"
                                  : "cth: 5"
                              }
                              required
                              className="transition-smooth"
                            />
                          </div>
                        )}

                        {/* Document Upload Section - Simplified for Pending Upload */}
                        {businessType && (
                          <div className="space-y-4">
                            <div>
                              <Label className="text-base font-medium">
                                {language === "en" ? "Required Documents" : "Dokumen Diperlukan"}
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                {language === "en" 
                                  ? "Select files for each required document type. Files will be uploaded after account creation."
                                  : "Pilih fail untuk setiap jenis dokumen yang diperlukan. Fail akan dimuat naik selepas akaun dicipta."
                                }
                              </p>
                            </div>
                            
                            {getCurrentBusinessTypeConfig().requiredDocuments.map((docType) => (
                              <div key={docType.type} className="space-y-2">
                                <Label>
                                  {language === "en" ? docType.name : docType.nameMs}
                                  <span className="text-destructive ml-1">*</span>
                                </Label>
                                <div className="border-2 border-dashed border-border rounded-lg p-4">
                                  <input
                                    type="file"
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    onChange={(e) => {
                                      const files = Array.from(e.target.files || []);
                                      handlePendingDocumentUpload(docType.type, files);
                                    }}
                                    className="hidden"
                                    id={`file-input-${docType.type}`}
                                  />
                                  <label
                                    htmlFor={`file-input-${docType.type}`}
                                    className="cursor-pointer flex flex-col items-center justify-center text-center"
                                  >
                                    <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground">
                                      {language === "en" ? "Click to select files" : "Klik untuk pilih fail"}
                                    </p>
                                  </label>
                                  
                                  {/* Show selected files */}
                                  {pendingDocuments[docType.type] && pendingDocuments[docType.type].length > 0 && (
                                    <div className="mt-3 space-y-1">
                                      {pendingDocuments[docType.type].map((file, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded">
                                          <span className="truncate">{file.name}</span>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handlePendingDocumentRemove(docType.type, file.name)}
                                          >
                                            ×
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* PDPA Agreement */}
                        <div className="space-y-2">
                          <div className="flex items-start space-x-2">
                            <Checkbox
                              id="pdpa"
                              checked={pdpaAccepted}
                              onCheckedChange={(checked) => setPdpaAccepted(!!checked)}
                              required
                            />
                            <Label htmlFor="pdpa" className="text-sm leading-relaxed">
                              {language === "en"
                                ? "I have read and agree to the "
                                : "Saya telah membaca dan bersetuju dengan "}
                              <Dialog
                                open={showPdpaDialog}
                                onOpenChange={setShowPdpaDialog}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="link"
                                    className="p-0 h-auto text-primary underline"
                                  >
                                    {language === "en"
                                      ? "Personal Data Protection Act (PDPA)"
                                      : "Akta Perlindungan Data Peribadi (PDPA)"}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>
                                      {language === "en"
                                        ? "Personal Data Protection Act (PDPA)"
                                        : "Akta Perlindungan Data Peribadi (PDPA)"}
                                    </DialogTitle>
                                    <DialogDescription>
                                      {language === "en"
                                        ? "Please read and understand our data protection policy"
                                        : "Sila baca dan fahami dasar perlindungan data kami"}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <ScrollArea className="h-96 w-full">
                                    <div className="text-sm space-y-3 pr-4">
                                      {language === "en" ? (
                                        <>
                                          <h3 className="font-semibold">1. Data Collection</h3>
                                          <p>We collect personal data that you provide to us during registration and use of our services, including but not limited to your name, email, phone number, address, and business information.</p>
                                          
                                          <h3 className="font-semibold">2. Purpose of Data Collection</h3>
                                          <p>Your personal data is collected for the purpose of providing community management services, facilitating communication between residents and service providers, and improving our platform.</p>
                                          
                                          <h3 className="font-semibold">3. Data Security</h3>
                                          <p>We implement appropriate security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>
                                          
                                          <h3 className="font-semibold">4. Data Sharing</h3>
                                          <p>Your personal data may be shared with community administrators and relevant service providers within the platform for service delivery purposes.</p>
                                          
                                          <h3 className="font-semibold">5. Your Rights</h3>
                                          <p>You have the right to access, correct, or delete your personal data. You may contact us to exercise these rights.</p>
                                          
                                          <h3 className="font-semibold">6. Contact Information</h3>
                                          <p>If you have any questions about this policy or our data practices, please contact our Data Protection Officer.</p>
                                        </>
                                      ) : (
                                        <>
                                          <h3 className="font-semibold">1. Pengumpulan Data</h3>
                                          <p>Kami mengumpul data peribadi yang anda berikan kepada kami semasa pendaftaran dan penggunaan perkhidmatan kami, termasuk tetapi tidak terhad kepada nama, emel, nombor telefon, alamat, dan maklumat perniagaan anda.</p>
                                          
                                          <h3 className="font-semibold">2. Tujuan Pengumpulan Data</h3>
                                          <p>Data peribadi anda dikumpul untuk tujuan menyediakan perkhidmatan pengurusan komuniti, memudahkan komunikasi antara penduduk dan penyedia perkhidmatan, dan menambah baik platform kami.</p>
                                          
                                          <h3 className="font-semibold">3. Keselamatan Data</h3>
                                          <p>Kami melaksanakan langkah keselamatan yang sesuai untuk melindungi data peribadi anda daripada akses tanpa kebenaran, pengubahan, pendedahan, atau pemusnahan.</p>
                                          
                                          <h3 className="font-semibold">4. Perkongsian Data</h3>
                                          <p>Data peribadi anda mungkin dikongsi dengan pentadbir komuniti dan penyedia perkhidmatan yang berkaitan dalam platform untuk tujuan penyampaian perkhidmatan.</p>
                                          
                                          <h3 className="font-semibold">5. Hak Anda</h3>
                                          <p>Anda mempunyai hak untuk mengakses, membetulkan, atau memadamkan data peribadi anda. Anda boleh menghubungi kami untuk melaksanakan hak-hak ini.</p>
                                          
                                          <h3 className="font-semibold">6. Maklumat Hubungan</h3>
                                          <p>Jika anda mempunyai sebarang soalan tentang dasar ini atau amalan data kami, sila hubungi Pegawai Perlindungan Data kami.</p>
                                        </>
                                      )}
                                    </div>
                                  </ScrollArea>
                                </DialogContent>
                              </Dialog>
                              {" *"}
                            </Label>
                          </div>
                        </div>

                        {/* Step 2 Buttons */}
                        <div className="flex gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handlePreviousStep}
                            className="flex-1"
                          >
                            {language === "en" ? "Back" : "Kembali"}
                          </Button>
                          <Button
                            type="submit"
                            className="flex-1 gradient-primary"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {language === "en" ? "Creating Account..." : "Mencipta Akaun..."}
                              </>
                            ) : (
                              language === "en" ? "Create Account" : "Buat Akaun"
                            )}
                          </Button>
                        </div>
                      </>
                    )}
                  </>
                )}

                {mode === "signIn" && showTestTools && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleCreateTestUsers}
                      disabled={isCreatingUsers}
                    >
                      {isCreatingUsers ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {language === "en"
                            ? "Creating Test Users..."
                            : "Mencipta Pengguna Ujian..."}
                        </>
                      ) : (
                        <>
                          {language === "en"
                            ? "Create All Test Users"
                            : "Cipta Semua Pengguna Ujian"}
                        </>
                      )}
                    </Button>
                  </>
                )}
              </form>

              {/* Test Users Section - Only shown in development */}
              {showTestTools && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">
                    {language === "en"
                      ? "Test Credentials (10 Users - Various Roles):"
                      : "Kredensi Ujian (10 Pengguna - Pelbagai Peranan):"}
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1 max-h-40 overflow-y-auto">
                    <p>
                      <strong>State Admin:</strong> stateadmin@test.com /
                      password123
                    </p>
                    <p>
                      <strong>District Coordinator:</strong>{" "}
                      districtcoord@test.com / password123
                    </p>
                    <p>
                      <strong>Community Admin:</strong> communityadmin@test.com /
                      password123
                    </p>
                    <p>
                      <strong>Facility Manager:</strong> facilitymanager@test.com
                      / password123
                    </p>
                    <p>
                      <strong>Security Officer:</strong> securitynorth@test.com /
                      password123
                    </p>
                    <p>
                      <strong>Maintenance Staff:</strong>{" "}
                      maintenancestaff@test.com / password123
                    </p>
                    <p>
                      <strong>Resident:</strong> resident@test.com / password123
                    </p>
                    <p>
                      <strong>Service Provider:</strong> serviceprovider@test.com
                      / password123
                    </p>
                    <p>
                      <strong>Community Leader:</strong> communityleader@test.com
                      / password123
                    </p>
                    <p>
                      <strong>State Service Manager:</strong>{" "}
                      stateservicemgr@test.com / password123
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-white/70 text-sm mt-6">
            {t("poweredBy")}
          </p>
        </div>
      </div>
    </div>
  );
}
