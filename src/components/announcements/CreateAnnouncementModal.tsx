import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/lib/translations";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Trash2,
  Calendar,
  Users,
  BarChart3,
  PlusCircle,
  Loader2,
  ImagePlus,
  Paperclip,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PollOption {
  id?: string;
  option_text: string;
  option_order: number;
}

interface Poll {
  id?: string;
  title: string;
  description: string;
  expires_at?: string;
  allow_multiple_votes: boolean;
  is_anonymous: boolean;
  options: PollOption[];
}

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAnnouncementCreated: () => void;
}

export default function CreateAnnouncementModal({
  isOpen,
  onOpenChange,
  onAnnouncementCreated,
}: CreateAnnouncementModalProps) {
  const { language, user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    scope: "district",
    type: "general",
    is_urgent: false,
    is_published: true,
    publish_at: new Date().toISOString().slice(0, 16),
    expire_at: "",
  });

  const [images, setImages] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<
    { name: string; url: string; size: number }[]
  >([]);
  const [uploading, setUploading] = useState(false);

  const [includePoll, setIncludePoll] = useState(false);
  const [poll, setPoll] = useState<Poll>({
    title: "",
    description: "",
    expires_at: "",
    allow_multiple_votes: false,
    is_anonymous: false,
    options: [
      { option_text: "", option_order: 0 },
      { option_text: "", option_order: 1 },
    ],
  });

  const [submitting, setSubmitting] = useState(false);

  const text = {
    en: {
      createAnnouncement: "Create Announcement",
      createAnnouncementDesc:
        "Broadcast important information to your community",
      announcementTitle: "Announcement Title",
      content: "Content",
      scope: "Scope",
      stateLevel: "State Level",
      districtLevel: "District Level",
      communityLevel: "Community Level",
      category: "Category",
      general: "General",
      maintenance: "Maintenance",
      emergency: "Emergency",
      event: "Event",
      urgent: "Mark as Urgent",
      published: "Publish Immediately",
      publishAt: "Publish At",
      expireAt: "Expire At (Optional)",
      includePoll: "Include Poll",
      pollTitle: "Poll Title",
      pollDescription: "Poll Description (Optional)",
      pollExpires: "Poll Expires At (Optional)",
      multipleChoices: "Allow Multiple Choices",
      anonymous: "Anonymous Voting",
      pollOptions: "Poll Options",
      addOption: "Add Option",
      removeOption: "Remove Option",
      create: "Create Announcement",
      cancel: "Cancel",
      success: "Announcement created successfully!",
      pushNotification: "Push notification sent to recipients",
      minOptions: "Poll must have at least 2 options",
      fillRequired: "Please fill in all required fields",
      images: "Images",
      attachments: "Attachments",
      addImage: "Add Image",
      addAttachment: "Add Attachment",
      removeImage: "Remove Image",
      removeAttachment: "Remove Attachment",
      uploading: "Uploading...",
      readingTime: "Reading Time",
      minutes: "minutes",
    },
    ms: {
      createAnnouncement: "Cipta Pengumuman",
      createAnnouncementDesc: "Siarkan maklumat penting kepada komuniti anda",
      announcementTitle: "Tajuk Pengumuman",
      content: "Kandungan",
      scope: "Skop",
      stateLevel: "Peringkat Negeri",
      districtLevel: "Peringkat Daerah",
      communityLevel: "Peringkat Komuniti",
      category: "Kategori",
      general: "Umum",
      maintenance: "Penyelenggaraan",
      emergency: "Kecemasan",
      event: "Acara",
      urgent: "Tandakan sebagai Penting",
      published: "Terbitkan Serta-merta",
      publishAt: "Terbit Pada",
      expireAt: "Tamat Pada (Pilihan)",
      includePoll: "Sertakan Undian",
      pollTitle: "Tajuk Undian",
      pollDescription: "Penerangan Undian (Pilihan)",
      pollExpires: "Undian Tamat Pada (Pilihan)",
      multipleChoices: "Benarkan Pilihan Berganda",
      anonymous: "Undian Tanpa Nama",
      pollOptions: "Pilihan Undian",
      addOption: "Tambah Pilihan",
      removeOption: "Buang Pilihan",
      create: "Cipta Pengumuman",
      cancel: "Batal",
      success: "Pengumuman berjaya dicipta!",
      pushNotification: "Notifikasi tolak dihantar kepada penerima",
      minOptions: "Undian mesti mempunyai sekurang-kurangnya 2 pilihan",
      fillRequired: "Sila isi semua medan yang diperlukan",
      images: "Gambar",
      attachments: "Lampiran",
      addImage: "Tambah Gambar",
      addAttachment: "Tambah Lampiran",
      removeImage: "Buang Gambar",
      removeAttachment: "Buang Lampiran",
      uploading: "Memuat naik...",
      readingTime: "Masa Membaca",
      minutes: "minit",
    },
  };

  const t = text[language];

  // Calculate reading time (average 200 words per minute)
  const calculateReadingTime = (content: string): number => {
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      const filePath = `announcements/${fileName}`;

      console.log("Uploading image:", fileName, "to path:", filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("public")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("public").getPublicUrl(filePath);

      console.log("Generated public URL:", publicUrl);

      setImages((prev) => {
        const updated = [...prev, publicUrl];
        console.log("Updated images array:", updated);
        return updated;
      });

      toast({
        title:
          language === "en"
            ? "Image uploaded successfully"
            : "Gambar berjaya dimuat naik",
        variant: "default",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: language === "en" ? "Upload failed" : "Muat naik gagal",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAttachmentUpload = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `announcements/attachments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("public")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("public").getPublicUrl(filePath);

      setAttachments((prev) => [
        ...prev,
        {
          name: file.name,
          url: publicUrl,
          size: file.size,
        },
      ]);
    } catch (error) {
      console.error("Error uploading attachment:", error);
      toast({
        title: language === "en" ? "Upload failed" : "Muat naik gagal",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: t.fillRequired,
        variant: "destructive",
      });
      return;
    }

    if (includePoll) {
      const validOptions = poll.options.filter((opt) => opt.option_text.trim());
      if (validOptions.length < 2) {
        toast({
          title: t.minOptions,
          variant: "destructive",
        });
        return;
      }
    }

    setSubmitting(true);
    try {
      // Get user profile for district/community info
      const { data: profile } = await supabase
        .from("profiles")
        .select("district_id, community_id")
        .eq("user_id", user?.id)
        .single();

      // Create announcement - using only the fields that match the schema
      const announcementData = {
        title: formData.title,
        content: formData.content,
        type: formData.type as
          | "general"
          | "maintenance"
          | "event"
          | "emergency"
          | "security",
        is_urgent: formData.is_urgent,
        is_published: formData.is_published,
        is_pinned: false, // Pin feature moved to details page
        author_id: user?.id,
        district_id: formData.scope !== "state" ? profile?.district_id : null,
        community_id:
          formData.scope === "community" ? profile?.community_id : null,
        publish_at: formData.publish_at || new Date().toISOString(),
        expire_at: formData.expire_at || null,
        scope: formData.scope,
        images: images.length > 0 ? images : null,
        attachments: attachments.length > 0 ? attachments : null,
        reading_time_minutes: calculateReadingTime(formData.content),
      };

      const { data: announcement, error: announcementError } = await supabase
        .from("announcements")
        .insert(announcementData as any)
        .select()
        .single();

      if (announcementError) throw announcementError;

      // Create poll if included
      if (includePoll && poll.title.trim() && announcement.id) {
        const { data: pollData, error: pollError } = await supabase
          .from("announcement_polls")
          .insert({
            announcement_id: announcement.id,
            title: poll.title,
            description: poll.description || null,
            expires_at: poll.expires_at || null,
            is_anonymous: poll.is_anonymous,
            allow_multiple_votes: poll.allow_multiple_votes,
            created_by: user.id,
          })
          .select()
          .single();

        if (pollError) throw pollError;

        // Insert poll options
        if (pollData) {
          const validOptions = poll.options.filter((opt) =>
            opt.option_text.trim()
          );
          const optionsData = validOptions.map((option, index) => ({
            poll_id: pollData.id,
            option_text: option.option_text,
            option_order: index,
          }));

          const { error: optionsError } = await supabase
            .from("poll_options")
            .insert(optionsData);

          if (optionsError) throw optionsError;
        }
      } else if (includePoll && poll.title.trim()) {
        toast({
          title:
            language === "en"
              ? "Poll feature coming soon"
              : "Ciri undian akan datang",
          description:
            language === "en"
              ? "Announcement created without poll"
              : "Pengumuman dicipta tanpa undian",
          variant: "default",
        });
      }

      // Send push notification
      if (formData.is_published) {
        try {
          await supabase.functions.invoke("send-push-notification", {
            body: {
              title: formData.is_urgent
                ? `🔴 URGENT: ${formData.title}`
                : formData.title,
              body:
                formData.content.substring(0, 100) +
                (formData.content.length > 100 ? "..." : ""),
              scope: formData.scope,
              data: {
                type: "announcement",
                announcementId: announcement.id,
                urgent: formData.is_urgent,
              },
            },
          });
        } catch (pushError) {
          console.warn("Push notification failed:", pushError);
          // Don't fail the announcement creation if push notification fails
        }
      }

      toast({
        title: t.success,
        description: formData.is_published ? t.pushNotification : undefined,
      });

      // Reset form
      setFormData({
        title: "",
        content: "",
        scope: "district",
        type: "general",
        is_urgent: false,
        is_published: true,
        publish_at: new Date().toISOString().slice(0, 16),
        expire_at: "",
      });
      setImages([]);
      setAttachments([]);
      setIncludePoll(false);
      setPoll({
        title: "",
        description: "",
        expires_at: "",
        allow_multiple_votes: false,
        is_anonymous: false,
        options: [
          { option_text: "", option_order: 0 },
          { option_text: "", option_order: 1 },
        ],
      });

      onOpenChange(false);
      onAnnouncementCreated();
    } catch (error: any) {
      console.error("Error creating announcement:", error);

      // Check if it's a permission error
      const isPermissionError =
        error?.code === "42501" ||
        error?.message?.includes("policy") ||
        error?.message?.includes("permission");

      toast({
        title:
          language === "en"
            ? "Error creating announcement"
            : "Ralat mencipta pengumuman",
        description: isPermissionError
          ? language === "en"
            ? "You do not have permission to create announcements. Only community administrators and management staff can create announcements."
            : "Anda tidak mempunyai kebenaran untuk mencipta pengumuman. Hanya pentadbir komuniti dan kakitangan pengurusan boleh mencipta pengumuman."
          : language === "en"
          ? "Please try again later"
          : "Sila cuba lagi kemudian",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const addPollOption = () => {
    setPoll((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        { option_text: "", option_order: prev.options.length },
      ],
    }));
  };

  const removePollOption = (index: number) => {
    setPoll((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const updatePollOption = (index: number, text: string) => {
    setPoll((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === index ? { ...opt, option_text: text } : opt
      ),
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            {t.createAnnouncement}
          </DialogTitle>
          <DialogDescription>{t.createAnnouncementDesc}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">{t.announcementTitle}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder={t.announcementTitle}
              />
            </div>

            <div>
              <Label htmlFor="content">{t.content}</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder={t.content}
                rows={4}
              />
              {formData.content.trim() && (
                <p className="text-sm text-muted-foreground mt-1">
                  {t.readingTime}: {calculateReadingTime(formData.content)}{" "}
                  {t.minutes}
                </p>
              )}
            </div>

            {/* Rich Content Section */}
            <div className="space-y-4">
              <div>
                <Label>{t.images}</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md border"
                        onLoad={() =>
                          console.log("Image loaded successfully:", image)
                        }
                        onError={(e) => {
                          console.error("Image failed to load:", image);
                          console.error("Error event:", e);
                        }}
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {uploading && (
                    <div className="border-2 border-dashed border-primary/25 rounded-md h-24 flex items-center justify-center bg-primary/5">
                      <div className="flex flex-col items-center gap-2 text-primary">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="text-xs">{t.uploading}</span>
                      </div>
                    </div>
                  )}
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-md h-24 flex items-center justify-center">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && file.type.startsWith("image/")) {
                          console.log("Selected file:", file.name, file.type);
                          handleImageUpload(file);
                        }
                      }}
                      className="hidden"
                      id="image-upload"
                      disabled={uploading}
                      accept="image/*"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center gap-2 text-muted-foreground cursor-pointer hover:text-foreground disabled:opacity-50"
                    >
                      <ImagePlus className="h-6 w-6" />
                      <span className="text-xs">
                        {uploading ? t.uploading : t.addImage}
                      </span>
                    </label>
                  </div>
                </div>
                {images.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {images.length} image{images.length !== 1 ? "s" : ""}{" "}
                    uploaded
                  </p>
                )}
              </div>

              <div>
                <Label>{t.attachments}</Label>
                <div className="space-y-2 mt-2">
                  {attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4" />
                        <span className="text-sm">{attachment.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(attachment.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-md p-4">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAttachmentUpload(file);
                      }}
                      className="hidden"
                      id="attachment-upload"
                      disabled={uploading}
                      accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                    />
                    <label
                      htmlFor="attachment-upload"
                      className="flex items-center justify-center gap-2 text-muted-foreground cursor-pointer hover:text-foreground"
                    >
                      <Paperclip className="h-4 w-4" />
                      <span className="text-sm">
                        {uploading ? t.uploading : t.addAttachment}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="scope">{t.scope}</Label>
                <Select
                  value={formData.scope}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, scope: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="state">{t.stateLevel}</SelectItem>
                    <SelectItem value="district">{t.districtLevel}</SelectItem>
                    <SelectItem value="community">
                      {t.communityLevel}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type">{t.category}</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">{t.general}</SelectItem>
                    <SelectItem value="maintenance">{t.maintenance}</SelectItem>
                    <SelectItem value="emergency">{t.emergency}</SelectItem>
                    <SelectItem value="event">{t.event}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="urgent"
                  checked={formData.is_urgent}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_urgent: checked }))
                  }
                />
                <Label htmlFor="urgent">{t.urgent}</Label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="publish_at">{t.publishAt}</Label>
                <Input
                  id="publish_at"
                  type="datetime-local"
                  value={formData.publish_at}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      publish_at: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="expire_at">{t.expireAt}</Label>
                <Input
                  id="expire_at"
                  type="datetime-local"
                  value={formData.expire_at}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      expire_at: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Poll Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="includePoll"
                checked={includePoll}
                onCheckedChange={setIncludePoll}
              />
              <Label htmlFor="includePoll" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {t.includePoll}
              </Label>
            </div>

            {includePoll && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Poll Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="pollTitle">{t.pollTitle}</Label>
                    <Input
                      id="pollTitle"
                      value={poll.title}
                      onChange={(e) =>
                        setPoll((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder={t.pollTitle}
                    />
                  </div>

                  <div>
                    <Label htmlFor="pollDescription">{t.pollDescription}</Label>
                    <Textarea
                      id="pollDescription"
                      value={poll.description}
                      onChange={(e) =>
                        setPoll((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder={t.pollDescription}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="pollExpires">{t.pollExpires}</Label>
                    <Input
                      id="pollExpires"
                      type="datetime-local"
                      value={poll.expires_at}
                      onChange={(e) =>
                        setPoll((prev) => ({
                          ...prev,
                          expires_at: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="multipleChoices"
                        checked={poll.allow_multiple_votes}
                        onCheckedChange={(checked) =>
                          setPoll((prev) => ({
                            ...prev,
                            allow_multiple_votes: checked,
                          }))
                        }
                      />
                      <Label htmlFor="multipleChoices">
                        {t.multipleChoices}
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="anonymous"
                        checked={poll.is_anonymous}
                        onCheckedChange={(checked) =>
                          setPoll((prev) => ({
                            ...prev,
                            is_anonymous: checked,
                          }))
                        }
                      />
                      <Label htmlFor="anonymous">{t.anonymous}</Label>
                    </div>
                  </div>

                  <div>
                    <Label>{t.pollOptions}</Label>
                    <div className="space-y-2 mt-2">
                      {poll.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={option.option_text}
                            onChange={(e) =>
                              updatePollOption(index, e.target.value)
                            }
                            placeholder={`Option ${index + 1}`}
                          />
                          {poll.options.length > 2 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removePollOption(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addPollOption}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t.addOption}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={() => onOpenChange(false)} variant="outline">
              {t.cancel}
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || uploading}>
              {(submitting || uploading) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {uploading ? t.uploading : t.create}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
