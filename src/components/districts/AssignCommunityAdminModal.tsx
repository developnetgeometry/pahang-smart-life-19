import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, User, UserCheck, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Community {
  id: string;
  name: string;
  community_type?: string;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  community_id?: string;
}

interface AssignCommunityAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  community: Community | null;
  districtId: string;
  onSuccess: () => void;
}

export default function AssignCommunityAdminModal({
  open,
  onOpenChange,
  community,
  districtId,
  onSuccess,
}: AssignCommunityAdminModalProps) {
  const { language } = useAuth();
  const [activeTab, setActiveTab] = useState("create");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [initialUsers, setInitialUsers] = useState<Profile[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(false);

  // Create new user form
  const [createData, setCreateData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
  });

  // Form validation errors
  const [validationErrors, setValidationErrors] = useState({
    phone: "",
  });

  // Malaysian phone validation (local format with 0 or international format with 60)
  const validatePhoneNumber = (phone: string, language: 'en' | 'ms' = 'en'): { isValid: boolean; error?: string } => {
    if (!phone || phone.trim() === '') {
      return { isValid: true }; // Phone is optional
    }

    // Remove all spaces, hyphens and other formatting characters
    const cleanPhone = phone.replace(/[\s\-\+]/g, '');
    
    // Check if contains only numbers
    if (!/^\d+$/.test(cleanPhone)) {
      return {
        isValid: false,
        error: language === 'en'
          ? 'Phone number can only contain numbers'
          : 'Nombor telefon hanya boleh mengandungi nombor'
      };
    }
    
    // Check if starts with 0 (local Malaysian format) or 60 (international format)
    if (cleanPhone.startsWith('0')) {
      // Local Malaysian format: 0123456789 (10-11 digits)
      if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        return {
          isValid: false,
          error: language === 'en'
            ? 'Malaysian phone number must be 10-11 digits (0123456789)'
            : 'Nombor telefon Malaysia mestilah 10-11 digit (0123456789)'
        };
      }
    } else if (cleanPhone.startsWith('60')) {
      // International Malaysian format: 60123456789 (11-12 digits)
      if (cleanPhone.length < 11 || cleanPhone.length > 12) {
        return {
          isValid: false,
          error: language === 'en'
            ? 'Malaysian phone number must be 11-12 digits (60123456789)'
            : 'Nombor telefon Malaysia mestilah 11-12 digit (60123456789)'
        };
      }
    } else {
      // Not starting with 0 or 60 - invalid
      return {
        isValid: false,
        error: language === 'en'
          ? 'Phone number must start with 0 (local) or 60 (international) for Malaysia'
          : 'Nombor telefon mesti bermula dengan 0 (tempatan) atau 60 (antarabangsa) untuk Malaysia'
      };
    }

    return { isValid: true };
  };

  const text = {
    en: {
      assignAdminTitle: "Assign Community Admin",
      assignSubtitle: "Create new admin or assign existing user",
      createNew: "Create New User",
      assignExisting: "Assign Existing User",
      fullName: "Full Name",
      email: "Email",
      password: "Temporary Password",
      phone: "Phone (Optional)",
      searchUsers: "Search users by name or email...",
      noResults: "No users found",
      selectUser: "Select User",
      selected: "Selected",
      createAdminBtn: "Create Admin",
      assignAdminBtn: "Assign Admin",
      cancel: "Cancel",
      creating: "Creating...",
      assigning: "Assigning...",
      communityAdmin: "Community Admin",
      onlyAdminNote: "Only users with Community Admin role are shown",
    },
    ms: {
      assignAdminTitle: "Tetapkan Pentadbir Komuniti",
      assignSubtitle: "Cipta pentadbir baharu atau tetapkan pengguna sedia ada",
      createNew: "Cipta Pengguna Baharu",
      assignExisting: "Tetapkan Pengguna Sedia Ada",
      fullName: "Nama Penuh",
      email: "E-mel",
      password: "Kata Laluan Sementara",
      phone: "Telefon (Pilihan)",
      searchUsers: "Cari pengguna mengikut nama atau e-mel...",
      noResults: "Tiada pengguna dijumpai",
      selectUser: "Pilih Pengguna",
      selected: "Dipilih",
      createAdminBtn: "Cipta Pentadbir",
      assignAdminBtn: "Tetapkan Pentadbir",
      cancel: "Batal",
      creating: "Mencipta...",
      assigning: "Menetapkan...",
      communityAdmin: "Pentadbir Komuniti",
      onlyAdminNote: "Hanya pengguna dengan peranan Pentadbir Komuniti ditunjukkan",
    },
  };

  const t = text[language];

  // Function to load initial community admin users
  const loadInitialUsers = async () => {
    setLoadingInitial(true);
    try {
      // First get user IDs with community_admin role
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'community_admin');

      if (rolesError) throw rolesError;

      const userIds = userRoles?.map(role => role.user_id) || [];

      if (userIds.length === 0) {
        setInitialUsers([]);
        return;
      }

      // Then get profiles for those users
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, email, phone, community_id")
        .in('user_id', userIds)
        .limit(5);

      if (error) throw error;
      setInitialUsers(data || []);
    } catch (error) {
      console.error("Error loading initial users:", error);
    } finally {
      setLoadingInitial(false);
    }
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setCreateData({
        full_name: "",
        email: "",
        password: "",
        phone: "",
      });
      setValidationErrors({ phone: "" });
      setSearchTerm("");
      setSearchResults([]);
      setInitialUsers([]);
      setSelectedUser(null);
      setActiveTab("create");
    } else {
      // Load initial users when modal opens
      loadInitialUsers();
    }
  }, [open]);

  // Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        // First get user IDs with community_admin role
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'community_admin');

        if (rolesError) throw rolesError;

        const userIds = userRoles?.map(role => role.user_id) || [];

        if (userIds.length === 0) {
          setSearchResults([]);
          return;
        }

        // Then get profiles for those users
        const { data, error } = await supabase
          .from("profiles")
          .select("id, user_id, full_name, email, phone, community_id")
          .in('user_id', userIds)
          .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
          .limit(10);

        if (error) throw error;
        setSearchResults(data || []);
      } catch (error) {
        console.error("Error searching users:", error);
        toast.error("Error searching users");
      } finally {
        setSearching(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleCreateAdmin = async () => {
    // Clear previous validation errors
    setValidationErrors({ phone: "" });

    // Validate required fields
    if (
      !community ||
      !createData.full_name ||
      !createData.email ||
      !createData.password
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate phone number if provided
    if (createData.phone && createData.phone.trim() !== '') {
      const phoneValidation = validatePhoneNumber(createData.phone, language);
      if (!phoneValidation.isValid) {
        setValidationErrors({ phone: phoneValidation.error || "" });
        toast.error(phoneValidation.error);
        return;
      }
    }

    setLoading(true);
    try {
      // Get the current session token
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session found. Please log in again.");
      }

      const { data, error } = await supabase.functions.invoke(
        "admin-create-admin",
        {
          body: {
            email: createData.email,
            password: createData.password,
            full_name: createData.full_name,
            phone: createData.phone || null,
            role: "community_admin",
            district_id: districtId,
            community_id: community.id,
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) {
        console.error("Function error:", error);
        throw new Error(error.message || "Failed to create admin");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast.success("Community admin created successfully");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error creating admin:", error);
      toast.error(error.message || "Failed to create community admin");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignExisting = async () => {
    if (!selectedUser || !community) {
      toast.error("Please select a user");
      return;
    }

    setLoading(true);
    try {
      // Get the current session token
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session found. Please log in again.");
      }

      const { data, error } = await supabase.functions.invoke(
        "assign-community-admin",
        {
          body: {
            user_id: selectedUser.id,
            community_id: community.id,
            district_id: districtId,
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) {
        console.error("Function error:", error);
        throw new Error(error.message || "Failed to assign admin");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast.success("Community admin assigned successfully");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error assigning admin:", error);
      toast.error(error.message || "Failed to assign community admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t.assignAdminTitle}</DialogTitle>
          <DialogDescription>
            {t.assignSubtitle} - {community?.name}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full overflow-x-hidden">
            <TabsTrigger value="create" className="flex-1">
              <User className="w-4 h-4 mr-2" />
              {t.createNew}
            </TabsTrigger>
            <TabsTrigger value="assign" className="flex-1">
              <UserCheck className="w-4 h-4 mr-2" />
              {t.assignExisting}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">{t.fullName} *</Label>
                <Input
                  id="create-name"
                  value={createData.full_name}
                  onChange={(e) =>
                    setCreateData((prev) => ({
                      ...prev,
                      full_name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-email">{t.email} *</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={createData.email}
                  onChange={(e) =>
                    setCreateData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-password">{t.password} *</Label>
                <Input
                  id="create-password"
                  type="password"
                  value={createData.password}
                  onChange={(e) =>
                    setCreateData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-phone">{t.phone}</Label>
                <Input
                  id="create-phone"
                  type="tel"
                  value={createData.phone}
                  className={validationErrors.phone ? "border-red-500 focus:ring-red-500" : ""}
                  placeholder={language === 'en' ? "e.g., 0123456789 or 60123456789" : "cth: 0123456789 atau 60123456789"}
                  onChange={(e) => {
                    const newPhone = e.target.value;
                    setCreateData((prev) => ({
                      ...prev,
                      phone: newPhone,
                    }));
                    
                    // Clear validation error when user starts typing
                    if (validationErrors.phone) {
                      setValidationErrors({ phone: "" });
                    }
                    
                    // Real-time validation for phone number
                    if (newPhone && newPhone.trim() !== '') {
                      const phoneValidation = validatePhoneNumber(newPhone, language);
                      if (!phoneValidation.isValid) {
                        setValidationErrors({ phone: phoneValidation.error || "" });
                      }
                    }
                  }}
                />
                {validationErrors.phone && (
                  <div className="flex items-center space-x-1 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationErrors.phone}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  {language === 'en' 
                    ? "Malaysian format only: 0123456789 (local) or 60123456789 (international)" 
                    : "Format Malaysia sahaja: 0123456789 (tempatan) atau 60123456789 (antarabangsa)"}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                {t.cancel}
              </Button>
              <Button
                onClick={handleCreateAdmin}
                disabled={
                  loading ||
                  !createData.full_name ||
                  !createData.email ||
                  !createData.password
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.creating}
                  </>
                ) : (
                  t.createAdminBtn
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="assign" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>{t.searchUsers}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t.searchUsers}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t.onlyAdminNote}
              </p>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(searching || loadingInitial) && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}

              {!searching && !loadingInitial && searchTerm && searchResults.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  {t.noResults}
                </div>
              )}

              {!searching && !loadingInitial && !searchTerm && initialUsers.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No community admins found
                </div>
              )}

              {/* Show search results when searching, or initial users when not searching */}
              {(searchTerm ? searchResults : initialUsers).map((user) => (
                <Card
                  key={user.id}
                  className={`cursor-pointer transition-colors ${
                    selectedUser?.id === user.id
                      ? "ring-2 ring-primary"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() =>
                    setSelectedUser(selectedUser?.id === user.id ? null : user)
                  }
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                        {user.phone && (
                          <p className="text-sm text-muted-foreground">
                            {user.phone}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {user.community_id && (
                          <Badge variant="secondary">{t.communityAdmin}</Badge>
                        )}
                        {selectedUser?.id === user.id && (
                          <Badge>{t.selected}</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                {t.cancel}
              </Button>
              <Button
                onClick={handleAssignExisting}
                disabled={loading || !selectedUser}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.assigning}
                  </>
                ) : (
                  t.assignAdminBtn
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
