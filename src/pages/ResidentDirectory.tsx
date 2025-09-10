import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Users,
  MessageCircle,
  Mail,
  Phone,
  Shield,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ResidentProfile {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  profile_bio?: string;
  interests?: string[];
  skills?: string[];
  avatar_url?: string;
  can_message: boolean;
  can_invite: boolean;
  unit_number?: string;
  house_number?: string;
}

interface PrivacySettings {
  show_full_name: boolean;
  show_phone: boolean;
  show_email: boolean;
  show_address: boolean;
  allow_messages: boolean;
  allow_event_invites: boolean;
  profile_visibility: "public" | "community" | "friends" | "private";
}

export default function ResidentDirectory() {
  const { language, user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("all");
  const [residents, setResidents] = useState<ResidentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    show_full_name: true,
    show_phone: false,
    show_email: false,
    show_address: false,
    allow_messages: true,
    allow_event_invites: true,
    profile_visibility: "community",
  });
  const [profileData, setProfileData] = useState({
    profile_bio: "",
    interests: [] as string[],
    skills: [] as string[],
  });
  const [settingsOpen, setSettingsOpen] = useState(false);

  const text = {
    en: {
      title: "Resident Directory",
      description: "Connect with your community members",
      search: "Search residents...",
      filterBySkill: "Filter by Skill",
      all: "All Skills",
      message: "Message",
      contact: "Contact",
      skills: "Skills",
      interests: "Interests",
      bio: "Bio",
      privacySettings: "Privacy Settings",
      profileSettings: "Profile Settings",
      visibility: "Profile Visibility",
      showFullName: "Show Full Name",
      showPhone: "Show Phone Number",
      showEmail: "Show Email",
      showAddress: "Show Address",
      allowMessages: "Allow Messages",
      allowEventInvites: "Allow Event Invites",
      public: "Public",
      community: "Community Only",
      friends: "Friends Only",
      private: "Private",
      updateProfile: "Update Profile",
      addSkill: "Add Skill",
      addInterest: "Add Interest",
      saveSettings: "Save Settings",
      noResidents: "No residents found",
      cannotMessage: "Messages not allowed",
      cannotInvite: "Invites not allowed",
    },
    ms: {
      title: "Direktori Penduduk",
      description: "Berhubung dengan ahli komuniti anda",
      search: "Cari penduduk...",
      filterBySkill: "Tapis mengikut Kemahiran",
      all: "Semua Kemahiran",
      message: "Mesej",
      contact: "Hubungi",
      skills: "Kemahiran",
      interests: "Minat",
      bio: "Biografi",
      privacySettings: "Tetapan Privasi",
      profileSettings: "Tetapan Profil",
      visibility: "Keterlihatan Profil",
      showFullName: "Tunjukkan Nama Penuh",
      showPhone: "Tunjukkan Nombor Telefon",
      showEmail: "Tunjukkan E-mel",
      showAddress: "Tunjukkan Alamat",
      allowMessages: "Benarkan Mesej",
      allowEventInvites: "Benarkan Jemputan Acara",
      public: "Awam",
      community: "Komuniti Sahaja",
      friends: "Rakan Sahaja",
      private: "Peribadi",
      updateProfile: "Kemaskini Profil",
      addSkill: "Tambah Kemahiran",
      addInterest: "Tambah Minat",
      saveSettings: "Simpan Tetapan",
      noResidents: "Tiada penduduk ditemui",
      cannotMessage: "Mesej tidak dibenarkan",
      cannotInvite: "Jemputan tidak dibenarkan",
    },
  };

  const t = text[language as keyof typeof text] || text.en;

  useEffect(() => {
    fetchResidents();
    fetchUserPrivacySettings();
    fetchUserProfile();
  }, []);

  const fetchResidents = async () => {
    try {
      // For now, let's fetch from profiles directly since the function might not work yet
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_searchable", true)
        .limit(50);

      if (error) throw error;

      const mappedData = (data || []).map((profile) => ({
        ...profile,
        can_message: true,
        can_invite: true,
      }));

      setResidents(mappedData);
    } catch (error) {
      console.error("Error fetching residents:", error);
      toast({
        title: "Error",
        description: "Failed to fetch resident directory",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPrivacySettings = async () => {
    try {
      const { data, error } = await supabase
        .from("profile_privacy_settings")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (data) {
        setPrivacySettings({
          show_full_name: data.show_full_name,
          show_phone: data.show_phone,
          show_email: data.show_email,
          show_address: data.show_address,
          allow_messages: data.allow_messages,
          allow_event_invites: data.allow_event_invites,
          profile_visibility: data.profile_visibility as
            | "public"
            | "community"
            | "friends"
            | "private",
        });
      }
    } catch (error) {
      console.error("Error fetching privacy settings:", error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("profile_bio, interests, skills")
        .eq("user_id", user?.id)
        .single();

      if (data) {
        setProfileData({
          profile_bio: data.profile_bio || "",
          interests: data.interests || [],
          skills: data.skills || [],
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const updatePrivacySettings = async () => {
    try {
      const { error } = await supabase.from("profile_privacy_settings").upsert({
        user_id: user?.id,
        ...privacySettings,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Privacy settings updated successfully",
      });
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      toast({
        title: "Error",
        description: "Failed to update privacy settings",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          profile_bio: profileData.profile_bio,
          interests: profileData.interests,
          skills: profileData.skills,
        })
        .eq("user_id", user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      await updatePrivacySettings();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const initiateChat = async (residentId: string) => {
    try {
      const { data, error } = await supabase.rpc("create_direct_chat", {
        other_user_id: residentId,
      });

      if (error) throw error;

      // Navigate to chat room
      window.location.href = `/communication?room=${data}`;
    } catch (error) {
      console.error("Error creating chat:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      });
    }
  };

  const filteredResidents = residents.filter((resident) => {
    const matchesSearch =
      resident.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.profile_bio?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSkill =
      selectedSkill === "all" ||
      resident.skills?.some((skill) =>
        skill.toLowerCase().includes(selectedSkill.toLowerCase())
      );

    return matchesSearch && matchesSkill;
  });

  const allSkills = [...new Set(residents.flatMap((r) => r.skills || []))];

  const addSkill = (skill: string) => {
    if (skill && !profileData.skills.includes(skill)) {
      setProfileData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
    }
  };

  const addInterest = (interest: string) => {
    if (interest && !profileData.interests.includes(interest)) {
      setProfileData((prev) => ({
        ...prev,
        interests: [...prev.interests, interest],
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setProfileData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const removeInterest = (interest: string) => {
    setProfileData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground">{t.description}</p>
        </div>

        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              {t.profileSettings}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t.profileSettings}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Profile Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">Profile Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="bio">{t.bio}</Label>
                  <Textarea
                    id="bio"
                    value={profileData.profile_bio}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        profile_bio: e.target.value,
                      }))
                    }
                    placeholder="Tell others about yourself..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t.skills}</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profileData.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeSkill(skill)}
                      >
                        {skill} ×
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder={t.addSkill}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        addSkill(e.currentTarget.value);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t.interests}</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profileData.interests.map((interest) => (
                      <Badge
                        key={interest}
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => removeInterest(interest)}
                      >
                        {interest} ×
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder={t.addInterest}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        addInterest(e.currentTarget.value);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {t.privacySettings}
                </h3>

                <div className="space-y-2">
                  <Label>{t.visibility}</Label>
                  <Select
                    value={privacySettings.profile_visibility}
                    onValueChange={(value: any) =>
                      setPrivacySettings((prev) => ({
                        ...prev,
                        profile_visibility: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">{t.public}</SelectItem>
                      <SelectItem value="community">{t.community}</SelectItem>
                      <SelectItem value="friends">{t.friends}</SelectItem>
                      <SelectItem value="private">{t.private}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label>{t.showFullName}</Label>
                    <Switch
                      checked={privacySettings.show_full_name}
                      onCheckedChange={(checked) =>
                        setPrivacySettings((prev) => ({
                          ...prev,
                          show_full_name: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>{t.showPhone}</Label>
                    <Switch
                      checked={privacySettings.show_phone}
                      onCheckedChange={(checked) =>
                        setPrivacySettings((prev) => ({
                          ...prev,
                          show_phone: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>{t.showEmail}</Label>
                    <Switch
                      checked={privacySettings.show_email}
                      onCheckedChange={(checked) =>
                        setPrivacySettings((prev) => ({
                          ...prev,
                          show_email: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>{t.allowMessages}</Label>
                    <Switch
                      checked={privacySettings.allow_messages}
                      onCheckedChange={(checked) =>
                        setPrivacySettings((prev) => ({
                          ...prev,
                          allow_messages: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between col-span-2">
                    <Label>{t.allowEventInvites}</Label>
                    <Switch
                      checked={privacySettings.allow_event_invites}
                      onCheckedChange={(checked) =>
                        setPrivacySettings((prev) => ({
                          ...prev,
                          allow_event_invites: checked,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Button onClick={updateProfile} className="w-full">
                {t.saveSettings}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedSkill} onValueChange={setSelectedSkill}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t.filterBySkill} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.all}</SelectItem>
            {allSkills.map((skill) => (
              <SelectItem key={skill} value={skill}>
                {skill}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Residents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResidents.map((resident) => (
          <Card key={resident.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={resident.avatar_url} />
                  <AvatarFallback>
                    {resident.full_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {resident.full_name}
                  </CardTitle>
                  {resident.unit_number && (
                    <p className="text-sm text-muted-foreground">
                      Unit {resident.unit_number}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {resident.profile_bio && (
                <p className="text-sm text-muted-foreground">
                  {resident.profile_bio}
                </p>
              )}

              {resident.skills && resident.skills.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">{t.skills}</p>
                  <div className="flex flex-wrap gap-1">
                    {resident.skills.slice(0, 3).map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {resident.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{resident.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {resident.interests && resident.interests.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">{t.interests}</p>
                  <div className="flex flex-wrap gap-1">
                    {resident.interests.slice(0, 3).map((interest) => (
                      <Badge
                        key={interest}
                        variant="outline"
                        className="text-xs"
                      >
                        {interest}
                      </Badge>
                    ))}
                    {resident.interests.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{resident.interests.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {resident.can_message ? (
                  <Button
                    size="sm"
                    onClick={() => initiateChat(resident.id)}
                    className="flex-1"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {t.message}
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" disabled className="flex-1">
                    <EyeOff className="w-4 h-4 mr-2" />
                    {t.cannotMessage}
                  </Button>
                )}

                <div className="flex gap-1">
                  {resident.email && (
                    <Button size="sm" variant="outline">
                      <Mail className="w-4 h-4" />
                    </Button>
                  )}
                  {resident.phone && (
                    <Button size="sm" variant="outline">
                      <Phone className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResidents.length === 0 && (
        <Card>
          <CardContent className="text-center py-10">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{t.noResidents}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
