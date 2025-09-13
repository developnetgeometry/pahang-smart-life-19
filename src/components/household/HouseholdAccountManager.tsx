import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useHouseholdAccounts } from "@/hooks/use-household-accounts";
import {
  Users,
  Trash2,
  Settings,
  Heart,
  Home,
  UserPlus,
  Info,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SpouseFormData {
  email: string;
  password: string;
  full_name: string;
  mobile_no: string;
}

interface HouseholdAccountManagerProps {
  isEditing?: boolean;
  onFormDataChange?: (householdData: {
    spouse?: {
      full_name: string;
      identity_no?: string;
      mobile_no: string;
      email: string;
    };
  }) => void;
  spouseData?: {
    full_name: string;
    identity_no: string;
    mobile_no: string;
    email: string;
  };
}

export function HouseholdAccountManager({
  isEditing = false,
  onFormDataChange,
  spouseData,
}: HouseholdAccountManagerProps) {
  const {
    accounts,
    loading,
    createSpouseAccount,
    removeAccount,
    updatePermissions,
    canAddSpouse,
    refetch,
  } = useHouseholdAccounts();
  const { toast } = useToast();

  const [spouseDialogOpen, setSpouseDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const spouseForm = useForm<SpouseFormData>();

  // Sync household data with parent form
  useEffect(() => {
    if (onFormDataChange && accounts.length > 0) {
      const spouseAccount = accounts.find(
        (acc) => acc.relationship_type === "spouse"
      );
      if (spouseAccount?.linked_profile) {
        onFormDataChange({
          spouse: {
            full_name: spouseAccount.linked_profile.full_name,
            mobile_no: spouseAccount.linked_profile.mobile_no || "",
            email: spouseAccount.linked_profile.email || "",
          },
        });
      }
    }
  }, [accounts, onFormDataChange]);

  // Pre-populate form with existing spouse data when editing
  useEffect(() => {
    if (spouseData && isEditing) {
      spouseForm.setValue("full_name", spouseData.full_name);
      spouseForm.setValue("mobile_no", spouseData.mobile_no);
    }
  }, [spouseData, isEditing, spouseForm]);

  const handleRefresh = async () => {
    await refetch();
    toast({
      title: "Refreshed",
      description: "Household accounts updated",
    });
  };

  const handleCreateSpouse = async (data: SpouseFormData) => {
    try {
      await createSpouseAccount(data);
      toast({
        title: "Spouse Account Created",
        description:
          "Spouse account has been successfully created and linked to your account.",
      });
      setSpouseDialogOpen(false);
      spouseForm.reset();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create spouse account",
        variant: "destructive",
      });
    }
  };

  const handleRemoveAccount = async (accountId: string) => {
    if (
      window.confirm(
        "Are you sure you want to remove this account? This action cannot be undone."
      )
    ) {
      try {
        await removeAccount(accountId);
        toast({
          title: "Account Removed",
          description: "The linked account has been successfully removed.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to remove account",
          variant: "destructive",
        });
      }
    }
  };

  const getRelationshipIcon = (type: string) => {
    return type === "spouse" ? (
      <Heart className="h-4 w-4" />
    ) : (
      <Home className="h-4 w-4" />
    );
  };

  const getRelationshipColor = (type: string) => {
    return type === "spouse"
      ? "bg-purple-100 text-purple-800"
      : "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return <div className="animate-pulse">Loading household accounts...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Pengurusan Akaun Isi Rumah
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="ml-auto"
            >
              Muat Semula
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Urus akaun pasangan yang dipautkan kepada akaun utama anda. Khusus
          untuk penduduk.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Information Alert for Residents */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Sebagai penduduk, anda boleh menambah akaun pasangan dengan akses
            penuh kepada ciri komuniti. Maklumat pasangan akan disegerakkan
            dengan profil utama anda.
          </AlertDescription>
        </Alert>

        {/* Add Account Buttons - Only show when editing or no spouse exists */}
        {(isEditing || canAddSpouse()) && (
          <div className="flex gap-2">
            {canAddSpouse() && (
              <Dialog
                open={spouseDialogOpen}
                onOpenChange={setSpouseDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    className="flex items-center gap-2"
                    disabled={
                      !isEditing &&
                      accounts.some((acc) => acc.relationship_type === "spouse")
                    }
                  >
                    <Heart className="h-4 w-4" />
                    {isEditing
                      ? "Kemaskini Akaun Pasangan"
                      : "Tambah Akaun Pasangan"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {canAddSpouse()
                        ? "Cipta Akaun Pasangan"
                        : "Kemaskini Akaun Pasangan"}
                    </DialogTitle>
                    <DialogDescription>
                      Cipta akaun untuk pasangan anda dengan akses penuh kepada
                      ciri komuniti. Maklumat ini akan disegerakkan dengan
                      profil utama anda.
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={spouseForm.handleSubmit(handleCreateSpouse)}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor="spouse-name">Nama Penuh Pasangan *</Label>
                      <Input
                        id="spouse-name"
                        {...spouseForm.register("full_name", {
                          required: true,
                        })}
                        placeholder="Masukkan nama penuh pasangan"
                        defaultValue={spouseData?.full_name || ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="spouse-email">Alamat Emel *</Label>
                      <Input
                        id="spouse-email"
                        type="email"
                        {...spouseForm.register("email", { required: true })}
                        placeholder="Masukkan alamat emel pasangan"
                        defaultValue={spouseData?.email || ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="spouse-password">Kata Laluan *</Label>
                      <Input
                        id="spouse-password"
                        type="password"
                        {...spouseForm.register("password", {
                          required: true,
                          minLength: 6,
                        })}
                        placeholder="Cipta kata laluan yang selamat (minimum 6 aksara)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="spouse-mobile">Nombor Telefon</Label>
                      <Input
                        id="spouse-mobile"
                        {...spouseForm.register("mobile_no")}
                        placeholder="Masukkan nombor telefon"
                        defaultValue={spouseData?.mobile_no || ""}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        {canAddSpouse()
                          ? "Cipta Akaun Pasangan"
                          : "Kemaskini Akaun"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSpouseDialogOpen(false)}
                      >
                        Batal
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}

        {/* Existing Accounts List */}
        {accounts.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-medium">Akaun Yang Dipautkan</h4>
            {accounts.map((account) => (
              <Card key={account.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getRelationshipIcon(account.relationship_type)}
                    <div>
                      <p className="font-medium">
                        {account.linked_profile?.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {account.linked_profile?.email}
                      </p>
                      {account.linked_profile?.mobile_no && (
                        <p className="text-xs text-muted-foreground">
                          {account.linked_profile.mobile_no}
                        </p>
                      )}
                    </div>
                    <Badge
                      className={getRelationshipColor(
                        account.relationship_type
                      )}
                    >
                      {account.relationship_type === "spouse"
                        ? "Pasangan"
                        : "Penyewa"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {account.relationship_type === "tenant" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAccount(account.id);
                          setPermissionsDialogOpen(true);
                        }}
                        disabled={!isEditing}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAccount(account.id)}
                      disabled={!isEditing}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Tiada akaun yang dipautkan lagi</p>
            <p className="text-sm">
              {isEditing
                ? "Klik butang di atas untuk menambah akaun pasangan"
                : "Aktifkan mod edit untuk menguruskan akaun isi rumah"}
            </p>
          </div>
        )}

        {/* Show editing note when in edit mode */}
        {isEditing && accounts.length > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Anda sedang dalam mod edit. Sebarang perubahan pada akaun isi
              rumah akan disegerakkan dengan profil utama anda.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
