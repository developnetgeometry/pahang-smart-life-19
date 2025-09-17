import { useState, useEffect, useMemo } from "react";
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
import {
  Loader2,
  MapPin,
  Shield,
  Users,
  FileText,
  Check,
  X,
  CheckCircle,
  Mail,
  Send,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { createTestUsers } from "@/utils/createTestUsers";
import { DocumentUpload } from "@/components/ui/document-upload";
import { AccountStatusAlert } from "@/components/ui/account-status-alert";

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
  const [uploadedDocuments, setUploadedDocuments] = useState<
    Record<string, Array<{ url: string; path: string; name: string }>>
  >({});
  const [pendingDocuments, setPendingDocuments] = useState<
    Record<string, File[]>
  >({});
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
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [fieldTouched, setFieldTouched] = useState<Record<string, boolean>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [accountStatusError, setAccountStatusError] = useState<
    "inactive" | "pending" | "rejected" | "suspended" | "not_approved" | null
  >(null);
  const { login, language, switchLanguage } = useAuth();
  const { t } = useTranslation(language || "en"); // Ensure we always have a language
  const { toast } = useToast();

  // Show test tools only in development or if explicitly enabled
  const showTestTools =
    import.meta.env.DEV || import.meta.env.VITE_SHOW_TEST_TOOLS === "true";

  // Business type options for searchable dropdown
  const businessTypeOptions = useMemo(
    () => [
      {
        value: "plumbing",
        label:
          (language || "en") === "en"
            ? "Plumbing Services"
            : "Perkhidmatan Paip",
      },
      {
        value: "electrical",
        label:
          (language || "en") === "en"
            ? "Electrical Services"
            : "Perkhidmatan Elektrik",
      },
      {
        value: "cleaning",
        label:
          (language || "en") === "en"
            ? "Cleaning Services"
            : "Perkhidmatan Pembersihan",
      },
      {
        value: "maintenance",
        label:
          (language || "en") === "en"
            ? "Maintenance Services"
            : "Perkhidmatan Penyelenggaraan",
      },
      {
        value: "landscaping",
        label:
          (language || "en") === "en"
            ? "Landscaping Services"
            : "Perkhidmatan Landskap",
      },
      {
        value: "security",
        label:
          (language || "en") === "en"
            ? "Security Services"
            : "Perkhidmatan Keselamatan",
      },
      {
        value: "other",
        label:
          (language || "en") === "en" ? "Other Services" : "Perkhidmatan Lain",
      },
    ],
    [language]
  );

  // Business type field mapping
  const businessTypeFieldMap: Record<
    string,
    {
      requiresExperience: boolean;
      requiredDocuments: Array<{ type: string; name: string; nameMs: string }>;
    }
  > = {
    electrical: {
      requiresExperience: true,
      requiredDocuments: [
        {
          type: "license",
          name: "Electrical License",
          nameMs: "Lesen Elektrik",
        },
        {
          type: "certificate",
          name: "Safety Certificate",
          nameMs: "Sijil Keselamatan",
        },
        {
          type: "insurance",
          name: "Insurance Certificate",
          nameMs: "Sijil Insurans",
        },
      ],
    },
    plumbing: {
      requiresExperience: true,
      requiredDocuments: [
        { type: "license", name: "Plumbing License", nameMs: "Lesen Paip" },
        {
          type: "certificate",
          name: "Trade Certificate",
          nameMs: "Sijil Perdagangan",
        },
        {
          type: "insurance",
          name: "Insurance Certificate",
          nameMs: "Sijil Insurans",
        },
      ],
    },
    security: {
      requiresExperience: true,
      requiredDocuments: [
        {
          type: "license",
          name: "Security License",
          nameMs: "Lesen Keselamatan",
        },
        {
          type: "background_check",
          name: "Background Check",
          nameMs: "Pemeriksaan Latar Belakang",
        },
        {
          type: "training",
          name: "Security Training Certificate",
          nameMs: "Sijil Latihan Keselamatan",
        },
      ],
    },
    cleaning: {
      requiresExperience: false,
      requiredDocuments: [
        {
          type: "certificate",
          name: "Health Certificate",
          nameMs: "Sijil Kesihatan",
        },
        {
          type: "insurance",
          name: "Insurance Certificate",
          nameMs: "Sijil Insurans",
        },
      ],
    },
    landscaping: {
      requiresExperience: false,
      requiredDocuments: [
        {
          type: "portfolio",
          name: "Work Portfolio",
          nameMs: "Portfolio Kerja",
        },
        {
          type: "insurance",
          name: "Insurance Certificate",
          nameMs: "Sijil Insurans",
        },
      ],
    },
    maintenance: {
      requiresExperience: true,
      requiredDocuments: [
        {
          type: "certificate",
          name: "Technical Certificate",
          nameMs: "Sijil Teknikal",
        },
        {
          type: "insurance",
          name: "Insurance Certificate",
          nameMs: "Sijil Insurans",
        },
      ],
    },
    other: {
      requiresExperience: false,
      requiredDocuments: [
        {
          type: "business_profile",
          name: "Business Profile",
          nameMs: "Profil Perniagaan",
        },
        {
          type: "portfolio",
          name: "Work Portfolio",
          nameMs: "Portfolio Kerja",
        },
      ],
    },
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

  // Real-time field validation
  const validateField = (fieldName: string, value: string) => {
    let error = "";

    switch (fieldName) {
      case "phone":
        if (/[A-Za-z]/.test(value)) {
          error = language === "en" ? "Phone cannot contain letters" : "Telefon tidak boleh mengandungi huruf";
        } else if (value && !/^0\d*$/.test(value)) {
          error = language === "en" ? "Phone must start with 0 and contain digits only" : "Telefon mesti bermula dengan 0 dan mengandungi nombor sahaja";
        }
        break;
      case "businessName":
        if (value && !validateBusinessName(value)) {
          error =
            language === "en"
              ? "Business name must include entity indicator (Sdn Bhd, Bhd, Enterprise, etc.)"
              : "Nama perniagaan mesti mengandungi penunjuk entiti (Sdn Bhd, Bhd, Enterprise, dll.)";
        }
        break;
      case "email":
        if (value && !validateEmail(value)) {
          error =
            language === "en"
              ? "Invalid email format. Plus signs (+) are not allowed."
              : "Format emel tidak sah. Tanda tambah (+) tidak dibenarkan.";
        }
        break;
      case "password":
        if (value && value.length < 6) {
          error =
            language === "en"
              ? "Password must be at least 6 characters long"
              : "Kata laluan mesti sekurang-kurangnya 6 aksara";
        }
        break;
    }

    setValidationErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));
  };

  const handleFieldBlur = (fieldName: string, value: string) => {
    setFieldTouched((prev) => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, value);
  };

  // Enhanced validation functions
  const validateMalaysianPhoneNumber = (input: string): boolean => {
    // New simple rule: digits only and must start with 0
    return /^0\d+$/.test(input);
  };

  const validateBusinessName = (name: string): boolean => {
    // Business name must contain business entity indicators
    const businessSuffixes = [
      "sdn bhd",
      "sdn. bhd.",
      "sendirian berhad",
      "bhd",
      "berhad",
      "enterprise",
      "ent",
      "ent.",
      "company",
      "co",
      "co.",
      "corporation",
      "corp",
      "corp.",
      "incorporated",
      "inc",
      "inc.",
      "limited",
      "ltd",
      "ltd.",
      "trading",
      "trading co",
      "services",
      "service",
      "group",
      "holdings",
    ];

    const lowerCaseName = name.toLowerCase();
    return businessSuffixes.some((suffix) => lowerCaseName.includes(suffix));
  };

  const validateEmail = (email: string): boolean => {
    // Email validation that rejects + signs and validates proper format
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Check if email contains + sign (not allowed)
    if (email.includes("+")) {
      return false;
    }

    return emailPattern.test(email);
  };

  const checkExistingEmailAndPhone = async (email: string, phone: string) => {
    // Check if phone number already exists in profiles
    if (phone.trim()) {
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
      const { data: existingPhoneUser, error: phoneError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("mobile_no", cleanPhone)
        .single();

      if (!phoneError && existingPhoneUser) {
        throw new Error(
          language === "en"
            ? "This phone number is already registered. Please use a different phone number."
            : "Nombor telefon ini telah didaftarkan. Sila gunakan nombor telefon yang berbeza."
        );
      }
    }

    // For email, we'll rely on Supabase's built-in validation during signup
    // since checking existing emails requires admin privileges
  };

  const validateStep1 = async () => {
    // Required field validation
    if (!fullName.trim()) {
      throw new Error(
        language === "en" ? "Full name is required" : "Nama penuh diperlukan"
      );
    }

    // Phone number validation (required for service providers)
    if (!phone.trim()) {
      throw new Error(
        language === "en"
          ? "Phone number is required for service providers"
          : "Nombor telefon diperlukan untuk penyedia perkhidmatan"
      );
    }

    // Digits only and must start with 0
    if (/[A-Za-z]/.test(phone) || !/^0\d+$/.test(phone)) {
      throw new Error(
        language === "en"
          ? "Phone must start with 0 and contain digits only"
          : "Telefon mesti bermula dengan 0 dan mengandungi nombor sahaja"
      );
    }

    if (!districtId) {
      throw new Error(
        language === "en" ? "Please select a district" : "Sila pilih daerah"
      );
    }
    if (!communityId) {
      throw new Error(
        language === "en" ? "Please select a community" : "Sila pilih komuniti"
      );
    }
    if (!location.trim()) {
      throw new Error(
        language === "en" ? "Location is required" : "Lokasi diperlukan"
      );
    }

    // Business name validation
    if (!businessName.trim()) {
      throw new Error(
        language === "en"
          ? "Business name is required"
          : "Nama perniagaan diperlukan"
      );
    }

    if (!validateBusinessName(businessName)) {
      throw new Error(
        language === "en"
          ? "Business name must include a business entity indicator (e.g., Sdn Bhd, Bhd, Enterprise, Ent., Services, etc.)"
          : "Nama perniagaan mesti mengandungi penunjuk entiti perniagaan (cth: Sdn Bhd, Bhd, Enterprise, Ent., Services, dll.)"
      );
    }

    if (!businessType.trim()) {
      throw new Error(
        language === "en"
          ? "Business type is required"
          : "Jenis perniagaan diperlukan"
      );
    }

    // Email validation
    if (!email.trim()) {
      throw new Error(
        language === "en" ? "Email is required" : "Emel diperlukan"
      );
    }

    if (!validateEmail(email)) {
      throw new Error(
        language === "en"
          ? "Please enter a valid email address. Plus signs (+) are not allowed in email addresses."
          : "Sila masukkan alamat emel yang sah. Tanda tambah (+) tidak dibenarkan dalam alamat emel."
      );
    }

    if (!password.trim()) {
      throw new Error(
        language === "en" ? "Password is required" : "Kata laluan diperlukan"
      );
    }

    if (password.length < 6) {
      throw new Error(
        language === "en"
          ? "Password must be at least 6 characters long"
          : "Kata laluan mesti sekurang-kurangnya 6 aksara"
      );
    }

    // Check for existing email and phone
    await checkExistingEmailAndPhone(email, phone);
  };

  const validateStep2 = () => {
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
  };

  const handleNextStep = async () => {
    setIsLoading(true);
    setError("");

    try {
      await validateStep1();

      // Add transition animation
      setIsTransitioning(true);

      // Wait for transition to complete
      setTimeout(() => {
        setSignupStep(2);
        setIsTransitioning(false);
      }, 300);
    } catch (err: any) {
      setError(err?.message || "Please fill in all required fields");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousStep = () => {
    setSignupStep(1);
    setError("");
  };

  const handlePendingDocumentUpload = (documentType: string, files: File[]) => {
    setPendingDocuments((prev) => ({
      ...prev,
      [documentType]: files,
    }));
  };

  const handlePendingDocumentRemove = (
    documentType: string,
    fileName: string
  ) => {
    setPendingDocuments((prev) => ({
      ...prev,
      [documentType]: (prev[documentType] || []).filter(
        (file) => file.name !== fileName
      ),
    }));
  };

  const handleDocumentUpload = (
    documentType: string,
    url: string,
    path: string,
    fileName: string
  ) => {
    setUploadedDocuments((prev) => ({
      ...prev,
      [documentType]: [
        ...(prev[documentType] || []),
        { url, path, name: fileName },
      ],
    }));
  };

  const handleDocumentRemove = (documentType: string, url: string) => {
    setUploadedDocuments((prev) => ({
      ...prev,
      [documentType]: (prev[documentType] || []).filter(
        (doc) => doc.url !== url
      ),
    }));
  };

  const getCurrentBusinessTypeConfig = () => {
    return businessTypeFieldMap[businessType] || businessTypeFieldMap.other;
  };

  const handleContactAdmin = () => {
    // You can implement this to open a contact modal or redirect to help
    toast({
      title: language === "en" ? "Contact Information" : "Maklumat Hubungan",
      description:
        language === "en"
          ? "Please contact your community administrator for assistance."
          : "Sila hubungi pentadbir komuniti anda untuk bantuan.",
    });
  };

  const handleRetryLogin = () => {
    setAccountStatusError(null);
    setError("");
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
          setIsSubmitting(true);
          setError("");

          try {
            // Validate step 2
            validateStep2();

            const redirectUrl = `${window.location.origin}/`;

            // Pass all signup data as metadata for the trigger to handle
            const cleanPhoneMeta = phone.trim()
              ? phone.replace(/[\s\-\(\)]/g, "")
              : null;
            const metadata: Record<string, any> = {
              full_name: fullName.trim(),
              mobile_no: cleanPhoneMeta,
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
            metadata.business_description =
              "Service provider registered via signup";
            metadata.experience_years = yearsOfExperience.trim();
            metadata.contact_phone = cleanPhoneMeta;

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

              // Handle specific error cases
              if (
                signUpError.message.includes("already registered") ||
                signUpError.message.includes("User already registered")
              ) {
                throw new Error(
                  language === "en"
                    ? "This email is already registered. Please use a different email address or try logging in."
                    : "Emel ini telah didaftarkan. Sila gunakan alamat emel yang berbeza atau cuba log masuk."
                );
              }

              throw signUpError;
            }

            if (authData.user) {
              // Now upload pending documents to storage
              const uploadedDocumentsMap: Record<
                string,
                Array<{ url: string; path: string; name: string }>
              > = {};

              for (const [docType, files] of Object.entries(pendingDocuments)) {
                uploadedDocumentsMap[docType] = [];

                for (const file of files) {
                  const timestamp = Date.now();
                  const filePath = `${authData.user.id}/${docType}/${timestamp}-${file.name}`;

                  const { data: uploadData, error: uploadError } =
                    await supabase.storage
                      .from("service-provider-documents")
                      .upload(filePath, file);

                  if (uploadError) {
                    console.error(
                      `Error uploading ${docType} document:`,
                      uploadError
                    );
                    throw new Error(`Failed to upload ${docType} document`);
                  }

                  if (uploadData) {
                    const { data: publicUrlData } = supabase.storage
                      .from("service-provider-documents")
                      .getPublicUrl(uploadData.path);

                    uploadedDocumentsMap[docType].push({
                      url: publicUrlData.publicUrl,
                      path: uploadData.path,
                      name: file.name,
                    });
                  }
                }
              }

              // Wait for the trigger to create the basic profile, then update it
              await new Promise((resolve) => setTimeout(resolve, 1000)); // Brief delay for trigger

              // Update the profile with registration details
              const cleanPhone = phone.trim()
                ? phone.replace(/[\s\-\(\)]/g, "")
                : null;
              const profileUpdate: any = {
                mobile_no: cleanPhone,
                district_id: districtId?.replace("district-", "") || districtId,
                community_id:
                  communityId?.replace("community-", "") || communityId,
                address: location.trim(),
                language: language,
                pdpa_declare: pdpaAccepted,
                account_status: "pending",
                is_active: true,
              };

              // Add service provider specific data (always added now)
              // profileUpdate.business_name = businessName.trim();
              // profileUpdate.business_type = businessType.trim();
              // profileUpdate.license_number = licenseNumber.trim() || null;
              // profileUpdate.years_of_experience =
              //   parseInt(yearsOfExperience) || null;
              // profileUpdate.uploaded_documents = uploadedDocumentsMap;

              const { error: profileError } = await supabase
                .from("profiles")
                .update(profileUpdate)
                .eq("user_id", authData.user.id);

              if (profileError) {
                console.error("Profile update error:", profileError);
                throw new Error(
                  `Profile update failed: ${profileError.message}`
                );
              }

              console.log(
                "Profile updated successfully for user:",
                authData.user.id
              );

              if (selectedRole === 'service_provider') {
                const { error: applicationError } = await supabase
                  .from('service_provider_applications')
                  .insert({
                    applicant_id: authData.user.id,
                    district_id: districtId?.replace('district-', '') || districtId,
                    business_name: businessName.trim(),
                    business_type: businessType.trim(),
                    business_description: `Service provider registered via signup`,
                    contact_person: fullName.trim(),
                    contact_phone: phone.trim(),
                    contact_email: email.trim(),
                    business_address: location.trim(),
                    experience_years: parseInt(yearsOfExperience) || 0,
                    status: 'pending'
                  });

                if (applicationError) {
                  console.error('Service provider application error:', applicationError);
                  throw new Error(`Service provider application failed: ${applicationError.message}`);
                }
              }

              // Assign selected role using enhanced_user_roles table
              const roleData = {
                user_id: authData.user.id,
                role: selectedRole as any,
                district_id: districtId?.replace("district-", "") || districtId,
                assigned_by: authData.user.id, // Self-assigned during registration
                is_active: true,
              };

              // Check if role already exists for this user, role, and district combination
              const { data: existingRole, error: checkError } = await supabase
                .from("enhanced_user_roles")
                .select("id")
                .eq("user_id", authData.user.id)
                .eq("role", selectedRole as any)
                .eq(
                  "district_id",
                  districtId?.replace("district-", "") || districtId
                )
                .single();

              if (checkError && checkError.code !== "PGRST116") {
                // PGRST116 means no rows returned, which is expected if role doesn't exist
                console.error("Error checking existing role:", checkError);
                throw new Error(`Role check failed: ${checkError.message}`);
              }

              if (existingRole) {
                // Role already exists, update it to ensure it's active
                const { error: updateError } = await supabase
                  .from("enhanced_user_roles")
                  .update({
                    is_active: true,
                    assigned_by: authData.user.id,
                  })
                  .eq("id", existingRole.id);

                if (updateError) {
                  console.error("Role update error:", updateError);
                  throw new Error(`Role update failed: ${updateError.message}`);
                }
              } else {
                // Role doesn't exist, create it
                const { error: roleError } = await supabase
                  .from("enhanced_user_roles")
                  .insert(roleData);

                if (roleError) {
                  console.error("Role assignment error:", roleError);
                  throw new Error(
                    `Role assignment failed: ${roleError.message}`
                  );
                }
              }

              // Sign out the user immediately since account is pending approval
              await supabase.auth.signOut();

              // Show success message
              toast({
                title:
                  language === "en" ? "Account Created!" : "Akaun Dicipta!",
                description:
                  language === "en"
                    ? "Your account has been created and is pending approval. You will be able to sign in once approved by the community admin."
                    : "Akaun anda telah dicipta dan sedang menunggu kelulusan. Anda boleh log masuk setelah diluluskan oleh pentadbir komuniti.",
              });

              // Show success animation
              setSubmissionSuccess(true);

              // Navigate to pending approval page after animation
              setTimeout(() => {
                window.location.href = "/pending-approval";
              }, 2000);

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
          } catch (submitError: any) {
            setError(
              submitError?.message ||
                "Failed to create account. Please try again."
            );
          } finally {
            setIsSubmitting(false);
          }
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);

      // Reset previous account status error
      setAccountStatusError(null);

      // Handle specific account status errors with better UX
      if (err?.message === "ACCOUNT_INACTIVE") {
        setAccountStatusError("inactive");
        setError(""); // Clear generic error since we're showing status alert
      } else if (err?.message === "ACCOUNT_PENDING") {
        setAccountStatusError("pending");
        setError("");
      } else if (err?.message === "ACCOUNT_REJECTED") {
        setAccountStatusError("rejected");
        setError("");
      } else if (err?.message === "ACCOUNT_SUSPENDED") {
        setAccountStatusError("suspended");
        setError("");
      } else if (err?.message === "ACCOUNT_NOT_APPROVED") {
        setAccountStatusError("not_approved");
        setError("");
      } else if (err?.message?.includes("Invalid login credentials")) {
        setError(
          language === "en"
            ? "Invalid email or password. Please check your credentials and try again."
            : "Emel atau kata laluan tidak sah. Sila semak bukti kelayakan anda dan cuba lagi."
        );
      } else {
        setError(err?.message || "Something went wrong. Please try again.");
      }
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
        description:
          "Test user creation is only available in development mode.",
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
    setPasswordResetSent(false);
    setError("");

    try {
      // Call our custom reset email edge function
      const { error } = await supabase.functions.invoke('send-reset-email', {
        body: {
          email: resetEmail
        }
      });

      if (error) {
        console.error('Custom reset email error:', error);
        throw new Error(error.message || 'Failed to send reset email');
      }

      // Show success animation
      setPasswordResetSent(true);

      toast({
        title: language === "en" ? "Success" : "Berjaya",
        description:
          language === "en"
            ? "Password reset instructions sent to your email"
            : "Arahan tetapan semula kata laluan telah dihantar ke emel anda",
      });

      // Auto close dialog after animation
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmail("");
        setPasswordResetSent(false);
      }, 3000);
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
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 xl:gap-16 items-center min-h-[80vh]">
          {/* Left side - Hero content */}
          <div className="text-center lg:text-left space-y-8 text-white lg:pr-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                {t("smartCommunity")}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-2xl">
                {language === "en"
                  ? "Connecting communities nationwide with modern digital solutions for residents, administrators, and security personnel."
                  : "Menghubungkan komuniti di seluruh negara dengan penyelesaian digital moden untuk penduduk, pentadbir, dan kakitangan keselamatan."}
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300">
                <Users className="w-10 h-10 mx-auto mb-3" />
                <p className="font-semibold text-lg">
                  {language === "en"
                    ? "Multi-Role System"
                    : "Sistem Pelbagai Peranan"}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300">
                <Shield className="w-10 h-10 mx-auto mb-3" />
                <p className="font-semibold text-lg">
                  {language === "en" ? "Smart Security" : "Keselamatan Pintar"}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300">
                <MapPin className="w-10 h-10 mx-auto mb-3" />
                <p className="font-semibold text-lg">
                  {language === "en" ? "Community Hub" : "Hub Komuniti"}
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Login form */}
          <div className="w-full flex justify-center lg:justify-start">
            <div className="w-full max-w-lg">
              <Card className="shadow-elegant border-white/20 bg-card/95 backdrop-blur max-h-[85vh] overflow-y-auto">
            <CardHeader className="text-center pb-4">
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
                  {language === "en"
                    ? "Service Provider Sign Up"
                    : "Daftar Penyedia Perkhidmatan"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Account Status Alert */}
                {accountStatusError && (
                  <AccountStatusAlert
                    status={accountStatusError}
                    language={language || "en"}
                    onRetry={handleRetryLogin}
                    onContactAdmin={handleContactAdmin}
                  />
                )}

                {/* General Error Alert */}
                {error && !accountStatusError && (
                  <Alert
                    variant="destructive"
                    className="animate-in slide-in-from-top-2 duration-300"
                  >
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

                      {/* Account Status Alert */}
                      {accountStatusError && (
                        <AccountStatusAlert
                          status={accountStatusError}
                          language={language || "en"}
                          onRetry={accountStatusError === "not_approved" ? () => setAccountStatusError(null) : undefined}
                          onContactAdmin={() => {
                            // Contact admin functionality
                            window.open("mailto:admin@primapahang.com", "_blank");
                          }}
                        />
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full gradient-primary transition-all duration-200 hover:scale-105 active:scale-95 relative overflow-hidden"
                      disabled={isLoading}
                    >
                      {isLoading && (
                        <div className="absolute inset-0 shimmer"></div>
                      )}
                      <div className="relative z-10 flex items-center justify-center">
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {language === "en"
                              ? "Signing In..."
                              : "Log Masuk..."}
                          </>
                        ) : (
                          t("signIn")
                        )}
                      </div>
                    </Button>

                    <div className="text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-primary hover:text-primary/80 transition-all duration-200 hover:scale-105 hover:bg-primary/10"
                      >
                        {language === "en"
                          ? "Forgot Password?"
                          : "Lupa Kata Laluan?"}
                      </Button>
                    </div>

                    {/* Forgot Password Dialog */}
                    <Dialog
                      open={showForgotPassword}
                      onOpenChange={(open) => {
                        setShowForgotPassword(open);
                        if (!open) {
                          setPasswordResetSent(false);
                          setResetEmail("");
                          setError("");
                        }
                      }}
                    >
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <div
                              className={`transition-all duration-500 ${
                                passwordResetSent ? "text-green-600" : ""
                              }`}
                            >
                              {passwordResetSent ? (
                                <CheckCircle className="h-5 w-5 animate-bounce" />
                              ) : (
                                <Mail className="h-5 w-5" />
                              )}
                            </div>
                            {passwordResetSent
                              ? language === "en"
                                ? "Email Sent!"
                                : "Emel Dihantar!"
                              : language === "en"
                              ? "Reset Password"
                              : "Tetapan Semula Kata Laluan"}
                          </DialogTitle>
                          <DialogDescription
                            className={`transition-all duration-300 ${
                              passwordResetSent ? "text-green-600" : ""
                            }`}
                          >
                            {passwordResetSent
                              ? language === "en"
                                ? "Password reset instructions have been sent to your email address. Please check your inbox."
                                : "Arahan tetapan semula kata laluan telah dihantar ke alamat emel anda. Sila semak peti masuk anda."
                              : language === "en"
                              ? "Enter your email address and we'll send you instructions to reset your password."
                              : "Masukkan alamat emel anda dan kami akan menghantar arahan untuk menetapkan semula kata laluan anda."}
                          </DialogDescription>
                        </DialogHeader>

                        <div
                          className={`space-y-4 transition-all duration-500 ${
                            passwordResetSent
                              ? "opacity-0 pointer-events-none h-0 overflow-hidden"
                              : "opacity-100"
                          }`}
                        >
                          <div className="space-y-2">
                            <Label htmlFor="resetEmail">
                              {language === "en"
                                ? "Email Address"
                                : "Alamat Emel"}
                            </Label>
                            <Input
                              id="resetEmail"
                              type="email"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              placeholder={t("emailPlaceholder")}
                              disabled={isResettingPassword}
                            />
                          </div>

                          {error && (
                            <Alert
                              variant="destructive"
                              className="animate-in slide-in-from-top-2 duration-300"
                            >
                              <AlertDescription>{error}</AlertDescription>
                            </Alert>
                          )}

                          <Button
                            onClick={handleForgotPassword}
                            className="w-full transition-all duration-200 hover:scale-105"
                            disabled={isResettingPassword || !resetEmail.trim()}
                          >
                            {isResettingPassword ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {language === "en"
                                  ? "Sending..."
                                  : "Menghantar..."}
                              </>
                            ) : (
                              <>
                                <Send className="mr-2 h-4 w-4" />
                                {language === "en"
                                  ? "Send Reset Instructions"
                                  : "Hantar Arahan Tetapan Semula"}
                              </>
                            )}
                          </Button>
                        </div>

                        {passwordResetSent && (
                          <div className="animate-in slide-in-from-bottom-4 duration-500 text-center py-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                              <Mail className="h-8 w-8 text-green-600 animate-pulse" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {language === "en"
                                ? "This dialog will close automatically in a few seconds."
                                : "Dialog ini akan ditutup secara automatik dalam beberapa saat."}
                            </p>
                          </div>
                        )}
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
                          : "Penduduk: Sila hubungi Pentadbir Komuniti anda untuk membuat akaun. Hanya Penyedia Perkhidmatan boleh mendaftar secara langsung."}
                      </AlertDescription>
                    </Alert>

                    {/* Step Progress Indicator */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {language === "en"
                            ? `Step ${signupStep} of 2`
                            : `Langkah ${signupStep} dari 2`}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {signupStep === 1
                            ? language === "en"
                              ? "Basic Information"
                              : "Maklumat Asas"
                            : language === "en"
                            ? "Business Details"
                            : "Maklumat Perniagaan"}
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
                      <div
                        className={`transition-all duration-300 ${
                          isTransitioning
                            ? "opacity-0 transform translate-x-4"
                            : "opacity-100 transform translate-x-0"
                        }`}
                      >
                        {error && (
                          <Alert className="mb-4" variant="destructive">
                            <X className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="role">
                            {language === "en" ? "Account Type" : "Jenis Akaun"}
                          </Label>
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Shield className="h-4 w-4 text-primary" />
                              <span className="font-medium">
                                {language === "en"
                                  ? "Service Provider"
                                  : "Penyedia Perkhidmatan"}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {language === "en"
                                ? "Register your business to provide services to the community"
                                : "Daftarkan perniagaan anda untuk menyediakan perkhidmatan kepada komuniti"}
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
                              ? "Phone Number"
                              : "Nombor Telefon"}{" "}
                            *
                          </Label>
                          <div className="relative">
                            <Input
                              id="phone"
                              type="tel"
                              value={phone}
                              onChange={(e) => {
                                // Allow digits only
                                const value = e.target.value.replace(/[^0-9]/g, "");
                                setPhone(value);
                                if (fieldTouched.phone) {
                                  validateField("phone", value);
                                }
                              }}
                              onBlur={() => handleFieldBlur("phone", phone)}
                              placeholder="0123456789"
                              required
                              className={`transition-smooth pr-10 ${
                                fieldTouched.phone && validationErrors.phone
                                  ? "border-destructive focus:border-destructive"
                                  : fieldTouched.phone &&
                                    phone &&
                                    !validationErrors.phone
                                  ? "border-green-500 focus:border-green-500"
                                  : ""
                              }`}
                            />
                            {fieldTouched.phone && phone && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                {validationErrors.phone ? (
                                  <X className="w-4 h-4 text-destructive" />
                                ) : (
                                  <Check className="w-4 h-4 text-green-500" />
                                )}
                              </div>
                            )}
                          </div>
                          {fieldTouched.phone && validationErrors.phone && (
                            <p className="text-xs text-destructive">
                              {validationErrors.phone}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {language === "en"
                              ? "Digits only; must start with 0 (e.g., 0123456789)"
                              : "Nombor sahaja; mesti bermula dengan 0 (cth: 0123456789)"}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="district">
                            {language === "en"
                              ? "Select District"
                              : "Pilih Daerah"}{" "}
                            *
                          </Label>
                          <Select
                            value={districtId}
                            onValueChange={(value) => {
                              setDistrictId(value);
                              setCommunityId(""); // Reset community when district changes
                            }}
                          >
                            <SelectTrigger className="transition-smooth">
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
                                <SelectItem
                                  key={district.id}
                                  value={district.id}
                                >
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
                              : "Pilih Komuniti"}{" "}
                            *
                          </Label>
                          <Select
                            value={communityId}
                            onValueChange={setCommunityId}
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
                                <SelectItem
                                  key={community.id}
                                  value={community.id}
                                >
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
                              : "Lokasi/Alamat Khusus"}{" "}
                            *
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
                              : "Nama Perniagaan"}{" "}
                            *
                          </Label>
                          <div className="relative">
                            <Input
                              id="businessName"
                              type="text"
                              value={businessName}
                              onChange={(e) => {
                                setBusinessName(e.target.value);
                                if (fieldTouched.businessName) {
                                  validateField("businessName", e.target.value);
                                }
                              }}
                              onBlur={() =>
                                handleFieldBlur("businessName", businessName)
                              }
                              placeholder={
                                language === "en"
                                  ? "e.g., ABC Plumbing Services Sdn Bhd"
                                  : "cth: Perkhidmatan Paip ABC Sdn Bhd"
                              }
                              required
                              className={`transition-smooth pr-10 ${
                                fieldTouched.businessName &&
                                validationErrors.businessName
                                  ? "border-destructive focus:border-destructive"
                                  : fieldTouched.businessName &&
                                    businessName &&
                                    !validationErrors.businessName
                                  ? "border-green-500 focus:border-green-500"
                                  : ""
                              }`}
                            />
                            {fieldTouched.businessName && businessName && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                {validationErrors.businessName ? (
                                  <X className="w-4 h-4 text-destructive" />
                                ) : (
                                  <Check className="w-4 h-4 text-green-500" />
                                )}
                              </div>
                            )}
                          </div>
                          {fieldTouched.businessName &&
                            validationErrors.businessName && (
                              <p className="text-xs text-destructive">
                                {validationErrors.businessName}
                              </p>
                            )}
                          <p className="text-xs text-muted-foreground">
                            {language === "en"
                              ? "Must include business entity (e.g., Sdn Bhd, Bhd, Enterprise, Ent., Services)"
                              : "Mesti mengandungi entiti perniagaan (cth: Sdn Bhd, Bhd, Enterprise, Ent., Services)"}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="businessType">
                            {language === "en"
                              ? "Business Type"
                              : "Jenis Perniagaan"}{" "}
                            *
                          </Label>
                          <Select
                            value={businessType}
                            onValueChange={setBusinessType}
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
                              {businessTypeOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">{t("email")} *</Label>
                          <div className="relative">
                            <Input
                              id="email"
                              type="email"
                              value={email}
                              onChange={(e) => {
                                setEmail(e.target.value);
                                if (fieldTouched.email) {
                                  validateField("email", e.target.value);
                                }
                              }}
                              onBlur={() => handleFieldBlur("email", email)}
                              placeholder={t("emailPlaceholder")}
                              required
                              className={`transition-smooth pr-10 ${
                                fieldTouched.email && validationErrors.email
                                  ? "border-destructive focus:border-destructive"
                                  : fieldTouched.email &&
                                    email &&
                                    !validationErrors.email
                                  ? "border-green-500 focus:border-green-500"
                                  : ""
                              }`}
                            />
                            {fieldTouched.email && email && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                {validationErrors.email ? (
                                  <X className="w-4 h-4 text-destructive" />
                                ) : (
                                  <Check className="w-4 h-4 text-green-500" />
                                )}
                              </div>
                            )}
                          </div>
                          {fieldTouched.email && validationErrors.email && (
                            <p className="text-xs text-destructive">
                              {validationErrors.email}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {language === "en"
                              ? "Valid email format required. Plus signs (+) are not allowed."
                              : "Format emel yang sah diperlukan. Tanda tambah (+) tidak dibenarkan."}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="password">{t("password")} *</Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type="password"
                              value={password}
                              onChange={(e) => {
                                setPassword(e.target.value);
                                if (fieldTouched.password) {
                                  validateField("password", e.target.value);
                                }
                              }}
                              onBlur={() =>
                                handleFieldBlur("password", password)
                              }
                              placeholder={t("passwordPlaceholder")}
                              required
                              className={`transition-smooth pr-10 ${
                                fieldTouched.password &&
                                validationErrors.password
                                  ? "border-destructive focus:border-destructive"
                                  : fieldTouched.password &&
                                    password &&
                                    !validationErrors.password
                                  ? "border-green-500 focus:border-green-500"
                                  : ""
                              }`}
                            />
                            {fieldTouched.password && password && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                {validationErrors.password ? (
                                  <X className="w-4 h-4 text-destructive" />
                                ) : (
                                  <Check className="w-4 h-4 text-green-500" />
                                )}
                              </div>
                            )}
                          </div>
                          {fieldTouched.password &&
                            validationErrors.password && (
                              <p className="text-xs text-destructive">
                                {validationErrors.password}
                              </p>
                            )}
                          <p className="text-xs text-muted-foreground">
                            {language === "en"
                              ? "Minimum 6 characters required"
                              : "Minimum 6 aksara diperlukan"}
                          </p>
                        </div>

                        <Button
                          type="button"
                          onClick={handleNextStep}
                          className="w-full gradient-primary"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              {language === "en"
                                ? "Validating..."
                                : "Mengesahkan..."}
                            </>
                          ) : language === "en" ? (
                            "Next"
                          ) : (
                            "Seterusnya"
                          )}
                        </Button>
                      </div>
                    ) : (
                      // Step 2: Business Specific Details + Documents + PDPA
                      <div
                        className={`transition-all duration-300 ${
                          isTransitioning
                            ? "opacity-0 transform -translate-x-4"
                            : "opacity-100 transform translate-x-0"
                        }`}
                      >
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
                        {businessType &&
                          getCurrentBusinessTypeConfig().requiresExperience && (
                            <div className="space-y-2">
                              <Label htmlFor="yearsOfExperience">
                                {language === "en"
                                  ? "Years of Experience"
                                  : "Tahun Pengalaman"}{" "}
                                *
                              </Label>
                              <Input
                                id="yearsOfExperience"
                                type="number"
                                min="0"
                                max="50"
                                value={yearsOfExperience}
                                onChange={(e) =>
                                  setYearsOfExperience(e.target.value)
                                }
                                placeholder={
                                  language === "en" ? "e.g., 5" : "cth: 5"
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
                                {language === "en"
                                  ? "Required Documents"
                                  : "Dokumen Diperlukan"}
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                {language === "en"
                                  ? "Select files for each required document type. Files will be uploaded after account creation."
                                  : "Pilih fail untuk setiap jenis dokumen yang diperlukan. Fail akan dimuat naik selepas akaun dicipta."}
                              </p>
                            </div>

                            {getCurrentBusinessTypeConfig().requiredDocuments.map(
                              (docType) => (
                                <div key={docType.type} className="space-y-2">
                                  <Label>
                                    {language === "en"
                                      ? docType.name
                                      : docType.nameMs}
                                    <span className="text-destructive ml-1">
                                      *
                                    </span>
                                  </Label>
                                  <div className="border-2 border-dashed border-border rounded-lg p-4">
                                    <input
                                      type="file"
                                      multiple
                                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                      onChange={(e) => {
                                        const files = Array.from(
                                          e.target.files || []
                                        );
                                        handlePendingDocumentUpload(
                                          docType.type,
                                          files
                                        );
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
                                        {language === "en"
                                          ? "Click to select files"
                                          : "Klik untuk pilih fail"}
                                      </p>
                                    </label>

                                    {/* Show selected files */}
                                    {pendingDocuments[docType.type] &&
                                      pendingDocuments[docType.type].length >
                                        0 && (
                                        <div className="mt-3 space-y-1">
                                          {pendingDocuments[docType.type].map(
                                            (file, index) => (
                                              <div
                                                key={index}
                                                className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded"
                                              >
                                                <span className="truncate">
                                                  {file.name}
                                                </span>
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() =>
                                                    handlePendingDocumentRemove(
                                                      docType.type,
                                                      file.name
                                                    )
                                                  }
                                                >
                                                  ×
                                                </Button>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}

                        {/* PDPA Agreement */}
                        <div className="space-y-2">
                          <div
                            className={`flex items-start space-x-2 p-3 rounded-lg border ${
                              error && error.includes("PDPA")
                                ? "border-destructive bg-destructive/5"
                                : "border-muted"
                            }`}
                          >
                            <Checkbox
                              id="pdpa"
                              checked={pdpaAccepted}
                              onCheckedChange={(checked) =>
                                setPdpaAccepted(!!checked)
                              }
                              required
                              className={`${
                                error && error.includes("PDPA")
                                  ? "border-destructive data-[state=checked]:bg-destructive"
                                  : ""
                              }`}
                            />
                            <Label
                              htmlFor="pdpa"
                              className="text-sm leading-relaxed"
                            >
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
                                          <h3 className="font-semibold">
                                            1. Data Collection
                                          </h3>
                                          <p>
                                            We collect personal data that you
                                            provide to us during registration
                                            and use of our services, including
                                            but not limited to your name, email,
                                            phone number, address, and business
                                            information.
                                          </p>

                                          <h3 className="font-semibold">
                                            2. Purpose of Data Collection
                                          </h3>
                                          <p>
                                            Your personal data is collected for
                                            the purpose of providing community
                                            management services, facilitating
                                            communication between residents and
                                            service providers, and improving our
                                            platform.
                                          </p>

                                          <h3 className="font-semibold">
                                            3. Data Security
                                          </h3>
                                          <p>
                                            We implement appropriate security
                                            measures to protect your personal
                                            data against unauthorized access,
                                            alteration, disclosure, or
                                            destruction.
                                          </p>

                                          <h3 className="font-semibold">
                                            4. Data Sharing
                                          </h3>
                                          <p>
                                            Your personal data may be shared
                                            with community administrators and
                                            relevant service providers within
                                            the platform for service delivery
                                            purposes.
                                          </p>

                                          <h3 className="font-semibold">
                                            5. Your Rights
                                          </h3>
                                          <p>
                                            You have the right to access,
                                            correct, or delete your personal
                                            data. You may contact us to exercise
                                            these rights.
                                          </p>

                                          <h3 className="font-semibold">
                                            6. Contact Information
                                          </h3>
                                          <p>
                                            If you have any questions about this
                                            policy or our data practices, please
                                            contact our Data Protection Officer.
                                          </p>
                                        </>
                                      ) : (
                                        <>
                                          <h3 className="font-semibold">
                                            1. Pengumpulan Data
                                          </h3>
                                          <p>
                                            Kami mengumpul data peribadi yang
                                            anda berikan kepada kami semasa
                                            pendaftaran dan penggunaan
                                            perkhidmatan kami, termasuk tetapi
                                            tidak terhad kepada nama, emel,
                                            nombor telefon, alamat, dan maklumat
                                            perniagaan anda.
                                          </p>

                                          <h3 className="font-semibold">
                                            2. Tujuan Pengumpulan Data
                                          </h3>
                                          <p>
                                            Data peribadi anda dikumpul untuk
                                            tujuan menyediakan perkhidmatan
                                            pengurusan komuniti, memudahkan
                                            komunikasi antara penduduk dan
                                            penyedia perkhidmatan, dan menambah
                                            baik platform kami.
                                          </p>

                                          <h3 className="font-semibold">
                                            3. Keselamatan Data
                                          </h3>
                                          <p>
                                            Kami melaksanakan langkah
                                            keselamatan yang sesuai untuk
                                            melindungi data peribadi anda
                                            daripada akses tanpa kebenaran,
                                            pengubahan, pendedahan, atau
                                            pemusnahan.
                                          </p>

                                          <h3 className="font-semibold">
                                            4. Perkongsian Data
                                          </h3>
                                          <p>
                                            Data peribadi anda mungkin dikongsi
                                            dengan pentadbir komuniti dan
                                            penyedia perkhidmatan yang berkaitan
                                            dalam platform untuk tujuan
                                            penyampaian perkhidmatan.
                                          </p>

                                          <h3 className="font-semibold">
                                            5. Hak Anda
                                          </h3>
                                          <p>
                                            Anda mempunyai hak untuk mengakses,
                                            membetulkan, atau memadamkan data
                                            peribadi anda. Anda boleh
                                            menghubungi kami untuk melaksanakan
                                            hak-hak ini.
                                          </p>

                                          <h3 className="font-semibold">
                                            6. Maklumat Hubungan
                                          </h3>
                                          <p>
                                            Jika anda mempunyai sebarang soalan
                                            tentang dasar ini atau amalan data
                                            kami, sila hubungi Pegawai
                                            Perlindungan Data kami.
                                          </p>
                                        </>
                                      )}
                                    </div>
                                  </ScrollArea>
                                </DialogContent>
                              </Dialog>
                              {" *"}
                            </Label>
                          </div>
                          {error && error.includes("PDPA") && (
                            <p className="text-xs text-destructive mt-1 ml-7">
                              {language === "en"
                                ? "You must accept the PDPA to continue"
                                : "Anda mesti menerima PDPA untuk meneruskan"}
                            </p>
                          )}
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
                            className="flex-1 gradient-primary relative"
                            disabled={isLoading || isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {language === "en"
                                  ? "Validating & Creating Account..."
                                  : "Mengesahkan & Mencipta Akaun..."}
                              </>
                            ) : isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {language === "en"
                                  ? "Creating Account..."
                                  : "Mencipta Akaun..."}
                              </>
                            ) : language === "en" ? (
                              "Create Account"
                            ) : (
                              "Buat Akaun"
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </form>

              {/* Success Animation Overlay */}
              {submissionSuccess && (
                <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
                  <div className="text-center space-y-4 animate-in fade-in duration-500">
                    <div className="relative">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto animate-in zoom-in duration-700" />
                      <div className="absolute inset-0 h-16 w-16 mx-auto border-4 border-green-500/20 rounded-full animate-ping" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-green-600">
                        {language === "en"
                          ? "Registration Successful!"
                          : "Pendaftaran Berjaya!"}
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        {language === "en"
                          ? "Your registration has been submitted. We will email you once your account registration has been approved. Thank you for your patience."
                          : "Pendaftaran anda telah dihantar. Kami akan menghantar emel kepada anda setelah pendaftaran akaun anda diluluskan. Terima kasih atas kesabaran anda."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
                      <strong>Community Admin:</strong> communityadmin@test.com
                      / password123
                    </p>
                    <p>
                      <strong>Facility Manager:</strong>{" "}
                      facilitymanager@test.com / password123
                    </p>
                    <p>
                      <strong>Security Officer:</strong> securitynorth@test.com
                      / password123
                    </p>
                    <p>
                      <strong>Maintenance Staff:</strong>{" "}
                      maintenancestaff@test.com / password123
                    </p>
                    <p>
                      <strong>Resident:</strong> resident@test.com / password123
                    </p>
                    <p>
                      <strong>Service Provider:</strong>{" "}
                      serviceprovider@test.com / password123
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
      </div>
    </div>
  );
}
