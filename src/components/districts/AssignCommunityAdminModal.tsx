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
import { Loader2, Search, User, UserCheck } from "lucide-react";
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

  // Create new user form
  const [createData, setCreateData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
  });

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
    },
  };

  const t = text[language];

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setCreateData({
        full_name: "",
        email: "",
        password: "",
        phone: "",
      });
      setSearchTerm("");
      setSearchResults([]);
      setSelectedUser(null);
      setActiveTab("create");
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
        const { data, error } = await supabase
          .from("profiles")
          .select("id,user_id, full_name, email, phone, community_id")
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
    if (
      !community ||
      !createData.full_name ||
      !createData.email ||
      !createData.password
    ) {
      toast.error("Please fill in all required fields");
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
                  onChange={(e) =>
                    setCreateData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                />
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
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searching && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}

              {!searching && searchResults.length === 0 && searchTerm && (
                <div className="text-center py-4 text-muted-foreground">
                  {t.noResults}
                </div>
              )}

              {searchResults.map((user) => (
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
