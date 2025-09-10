import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Megaphone,
  Calendar,
  Clock,
  Search,
  Pin,
  Bell,
  Loader2,
  Plus,
  BarChart3,
  Users,
  X,
  PinOff,
  Heart,
  ThumbsUp,
  Star,
  Bookmark,
  BookmarkCheck,
  MessageSquare,
  Share2,
  Eye,
  FileText,
  Download,
  Send,
  Reply,
  Image as ImageIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CreateAnnouncementModal from "@/components/announcements/CreateAnnouncementModal";
import PollComponent from "@/components/announcements/PollComponent";
import { useUserRoles } from "@/hooks/use-user-roles";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  created_date: string;
  author: string;
  is_pinned: boolean;
  read_status: boolean;
  target_audience: string[];
  scope: string;
  type: string;
  is_urgent: boolean;
  publish_at: string;
  expire_at?: string;
  has_poll?: boolean;
  poll_id?: string;
  images?: string[];
  attachments?: Array<{ name: string; url: string; size?: number }>;
  reading_time_minutes?: number;
  view_count?: number;
  reactions?: {
    like: number;
    helpful: number;
    important: number;
  };
  user_reactions?: string[];
  is_bookmarked?: boolean;
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  created_at: string;
  is_edited: boolean;
  parent_comment_id?: string;
  replies?: Comment[];
}

export default function Announcements() {
  const { language, user } = useAuth();
  const { toast } = useToast();
  const { hasRole } = useUserRoles();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedScope, setSelectedScope] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [replyToComment, setReplyToComment] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const canCreateAnnouncements =
    hasRole("community_admin") ||
    hasRole("district_coordinator") ||
    hasRole("state_admin");

  const text = {
    en: {
      title: "Community Announcements",
      subtitle: "Stay updated with important community information",
      search: "Search announcements...",
      scope: "Scope",
      category: "Category",
      allScopes: "All Scopes",
      allCategories: "All Categories",
      state: "State",
      district: "District",
      community: "Community",
      general: "General",
      maintenance: "Maintenance",
      emergency: "Emergency",
      event: "Event",
      createAnnouncement: "Create Announcement",
      pinned: "Pinned",
      urgent: "Urgent",
      high: "High",
      medium: "Medium",
      low: "Low",
      readMore: "Read More",
      showLess: "Show Less",
      totalAnnouncements: "Total Announcements",
      pinnedAnnouncements: "Pinned",
      unreadAnnouncements: "Unread",
      thisWeek: "This Week",
      viewDetails: "Click to view details",
      announcementDetails: "Announcement Details",
      publishedOn: "Published on",
      author: "Author",
      pinAnnouncement: "Pin Announcement",
      unpinAnnouncement: "Unpin Announcement",
      bookmark: "Bookmark",
      bookmarked: "Bookmarked",
      share: "Share via Communication Hub",
      comments: "Comments",
      addComment: "Add a comment...",
      postComment: "Post Comment",
      reply: "Reply",
      viewCount: "views",
      readingTime: "min read",
      reactions: "Reactions",
      like: "Like",
      helpful: "Helpful",
      important: "Important",
      images: "Images",
      attachments: "Attachments",
      download: "Download",
      pinnedSuccess: "Pinned successfully",
      unpinnedSuccess: "Unpinned successfully",
      noAnnouncements: "No announcements found",
      noAnnouncementsDesc: "Try adjusting your search or filters",
      poll: "Poll Available",
      hasPoll: "This announcement includes a poll",
    },
    ms: {
      title: "Pengumuman Komuniti",
      subtitle: "Kekal dikemas kini dengan maklumat penting komuniti",
      search: "Cari pengumuman...",
      scope: "Skop",
      category: "Kategori",
      allScopes: "Semua Skop",
      allCategories: "Semua Kategori",
      state: "Negeri",
      district: "Daerah",
      community: "Komuniti",
      general: "Umum",
      maintenance: "Penyelenggaraan",
      emergency: "Kecemasan",
      event: "Acara",
      createAnnouncement: "Cipta Pengumuman",
      pinned: "Disematkan",
      urgent: "Penting",
      high: "Tinggi",
      medium: "Sederhana",
      low: "Rendah",
      readMore: "Baca Lagi",
      showLess: "Kurangkan",
      totalAnnouncements: "Jumlah Pengumuman",
      pinnedAnnouncements: "Disematkan",
      unreadAnnouncements: "Belum Dibaca",
      thisWeek: "Minggu Ini",
      viewDetails: "Klik untuk lihat butiran",
      announcementDetails: "Butiran Pengumuman",
      publishedOn: "Diterbitkan pada",
      author: "Penulis",
      pinAnnouncement: "Sematkan Pengumuman",
      unpinAnnouncement: "Nyahsematkan Pengumuman",
      bookmark: "Tandabuku",
      bookmarked: "Ditandabuku",
      share: "Kongsi melalui Hub Komunikasi",
      comments: "Komen",
      addComment: "Tambah komen...",
      postComment: "Pos Komen",
      reply: "Balas",
      viewCount: "tontonan",
      readingTime: "min bacaan",
      reactions: "Reaksi",
      like: "Suka",
      helpful: "Membantu",
      important: "Penting",
      images: "Gambar",
      attachments: "Lampiran",
      download: "Muat Turun",
      pinnedSuccess: "Berjaya disematkan",
      unpinnedSuccess: "Berjaya dinyahsematkan",
      noAnnouncements: "Tiada pengumuman dijumpai",
      noAnnouncementsDesc: "Cuba laraskan carian atau penapis anda",
      poll: "Undian Tersedia",
      hasPoll: "Pengumuman ini mengandungi undian",
    },
  };

  const t = text[language];

  // Fetch announcements from Supabase
  useEffect(() => {
    fetchAnnouncements();

    // Set up real-time subscription
    const channel = supabase
      .channel("announcements-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "announcements",
        },
        () => {
          fetchAnnouncements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleAnnouncementClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setDetailsModalOpen(true);
    trackAnnouncementView(announcement.id);
  };

  const trackAnnouncementView = async (announcementId: string) => {
    if (!user) return;

    try {
      await supabase.from("announcement_views").upsert({
        announcement_id: announcementId,
        user_id: user.id,
        viewed_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  };

  const handleReaction = async (
    announcementId: string,
    reactionType: "like" | "helpful" | "important"
  ) => {
    if (!user) return;

    try {
      const { data: existing } = await supabase
        .from("announcement_reactions")
        .select("id")
        .eq("announcement_id", announcementId)
        .eq("user_id", user.id)
        .eq("reaction_type", reactionType)
        .single();

      if (existing) {
        // Remove reaction
        await supabase
          .from("announcement_reactions")
          .delete()
          .eq("id", existing.id);
      } else {
        // Add reaction
        await supabase.from("announcement_reactions").insert({
          announcement_id: announcementId,
          user_id: user.id,
          reaction_type: reactionType,
        });
      }

      // Refresh announcement data
      fetchAnnouncementDetails(announcementId);
    } catch (error) {
      console.error("Error handling reaction:", error);
      toast({
        title:
          language === "en"
            ? "Error updating reaction"
            : "Ralat mengemas kini reaksi",
        variant: "destructive",
      });
    }
  };

  const handleBookmark = async (announcementId: string) => {
    if (!user) return;

    try {
      const { data: existing } = await supabase
        .from("announcement_bookmarks")
        .select("id")
        .eq("announcement_id", announcementId)
        .eq("user_id", user.id)
        .single();

      if (existing) {
        // Remove bookmark
        await supabase
          .from("announcement_bookmarks")
          .delete()
          .eq("id", existing.id);
      } else {
        // Add bookmark
        await supabase.from("announcement_bookmarks").insert({
          announcement_id: announcementId,
          user_id: user.id,
        });
      }

      // Update local state
      setSelectedAnnouncement((prev) =>
        prev ? { ...prev, is_bookmarked: !prev.is_bookmarked } : null
      );

      toast({
        title: existing
          ? language === "en"
            ? "Bookmark removed"
            : "Tandabuku dibuang"
          : language === "en"
          ? "Bookmarked successfully"
          : "Berjaya ditandabuku",
      });
    } catch (error) {
      console.error("Error handling bookmark:", error);
      toast({
        title:
          language === "en"
            ? "Error updating bookmark"
            : "Ralat mengemas kini tandabuku",
        variant: "destructive",
      });
    }
  };

  const fetchAnnouncementDetails = async (announcementId: string) => {
    if (!user) return;

    try {
      // Fetch reactions
      const { data: reactions } = await supabase
        .from("announcement_reactions")
        .select("reaction_type, user_id")
        .eq("announcement_id", announcementId);

      // Fetch user's bookmark status
      const { data: bookmark } = await supabase
        .from("announcement_bookmarks")
        .select("id")
        .eq("announcement_id", announcementId)
        .eq("user_id", user.id)
        .single();

      // Fetch view count
      const { count: viewCount } = await supabase
        .from("announcement_views")
        .select("*", { count: "exact" })
        .eq("announcement_id", announcementId);

      // Process reactions
      const reactionCounts = {
        like: reactions?.filter((r) => r.reaction_type === "like").length || 0,
        helpful:
          reactions?.filter((r) => r.reaction_type === "helpful").length || 0,
        important:
          reactions?.filter((r) => r.reaction_type === "important").length || 0,
      };

      const userReactions =
        reactions
          ?.filter((r) => r.user_id === user.id)
          .map((r) => r.reaction_type) || [];

      // Update selected announcement
      setSelectedAnnouncement((prev) =>
        prev
          ? {
              ...prev,
              reactions: reactionCounts,
              user_reactions: userReactions,
              is_bookmarked: !!bookmark,
              view_count: viewCount || 0,
              reading_time_minutes: Math.max(
                1,
                Math.ceil(prev.content.length / 200)
              ),
            }
          : null
      );

      // Fetch comments
      fetchComments(announcementId);
    } catch (error) {
      console.error("Error fetching announcement details:", error);
    }
  };

  const fetchComments = async (announcementId: string) => {
    try {
      setCommentsLoading(true);

      // First, get the comments
      const { data: commentsData, error: commentsError } = await supabase
        .from("announcement_comments")
        .select("*")
        .eq("announcement_id", announcementId)
        .is("parent_comment_id", null)
        .order("created_at", { ascending: false });

      if (commentsError) {
        console.error("Error fetching comments:", commentsError);
        setComments([]);
        return;
      }

      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        return;
      }

      // Get unique user IDs
      const userIds = [
        ...new Set(commentsData.map((comment) => comment.user_id)),
      ];

      // Fetch user profiles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("user_id", userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      }

      // Create a map of user profiles
      const profilesMap = new Map();
      profilesData?.forEach((profile) => {
        profilesMap.set(profile.id, profile);
      });

      const transformedComments: Comment[] = commentsData.map((comment) => {
        const profile = profilesMap.get(comment.user_id);
        return {
          id: comment.id,
          content: comment.content,
          user_id: comment.user_id,
          user_name: profile?.full_name || "Anonymous",
          user_avatar: profile?.avatar_url,
          created_at: comment.created_at,
          is_edited: comment.is_edited,
          parent_comment_id: comment.parent_comment_id,
          replies: [],
        };
      });

      setComments(transformedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim() || !selectedAnnouncement) return;

    try {
      const { error } = await supabase.from("announcement_comments").insert({
        announcement_id: selectedAnnouncement.id,
        user_id: user.id,
        content: newComment.trim(),
        parent_comment_id: replyToComment,
      });

      if (error) throw error;

      setNewComment("");
      setReplyToComment(null);
      fetchComments(selectedAnnouncement.id);

      toast({
        title: language === "en" ? "Comment posted" : "Komen telah dipos",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title:
          language === "en" ? "Error posting comment" : "Ralat mempos komen",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    setShareModalOpen(true);
  };

  // Load announcement details when modal opens - with proper error handling
  useEffect(() => {
    if (selectedAnnouncement && detailsModalOpen) {
      let mounted = true;

      const loadDetails = async () => {
        try {
          await fetchAnnouncementDetails(selectedAnnouncement.id);
        } catch (error) {
          if (mounted) {
            console.error("Failed to load announcement details:", error);
            // Don't retry on error to prevent flickering
          }
        }
      };

      loadDetails();

      return () => {
        mounted = false;
      };
    }
  }, [selectedAnnouncement?.id, detailsModalOpen, user?.id]);

  const handleTogglePin = async (
    announcementId: string,
    currentPinStatus: boolean
  ) => {
    if (!canCreateAnnouncements) {
      toast({
        title: language === "en" ? "Permission denied" : "Kebenaran ditolak",
        description:
          language === "en"
            ? "Only community administrators can pin announcements"
            : "Hanya pentadbir komuniti boleh menyematkan pengumuman",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("announcements")
        .update({ is_pinned: !currentPinStatus })
        .eq("id", announcementId);

      if (error) throw error;

      // Update local state
      setAnnouncements((prev) =>
        prev.map((ann) =>
          ann.id === announcementId
            ? { ...ann, is_pinned: !currentPinStatus }
            : ann
        )
      );

      // Update selected announcement if it's the same one
      if (selectedAnnouncement?.id === announcementId) {
        setSelectedAnnouncement((prev) =>
          prev ? { ...prev, is_pinned: !currentPinStatus } : null
        );
      }

      toast({
        title: !currentPinStatus ? t.pinnedSuccess : t.unpinnedSuccess,
      });
    } catch (error) {
      console.error("Error toggling pin status:", error);
      toast({
        title:
          language === "en"
            ? "Error updating pin status"
            : "Ralat mengemas kini status pin",
        variant: "destructive",
      });
    }
  };

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);

      // Select all necessary columns including images and attachments
      const { data, error } = await supabase
        .from("announcements")
        .select(
          `
          id,
          title,
          content,
          type,
          is_urgent,
          is_published,
          is_pinned,
          publish_at,
          expire_at,
          created_at,
          author_id,
          scope,
          images,
          attachments,
          reading_time_minutes
        `
        )
        .eq("is_published", true)
        .lte("publish_at", new Date().toISOString())
        .or("expire_at.is.null,expire_at.gt." + new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data with defaults for missing fields
      const allAnnouncements = data
        ? data.map((a) => ({
            id: a.id,
            title: a.title,
            content: a.content,
            type: a.type || "general",
            scope: a.scope || "district",
            is_urgent: a.is_urgent || false,
            is_published: a.is_published,
            is_pinned: a.is_pinned || false,
            publish_at: a.publish_at,
            expire_at: a.expire_at,
            created_at: a.created_at,
            author_id: a.author_id,
            images: a.images || [],
            attachments: a.attachments || [],
            reading_time_minutes: a.reading_time_minutes || 1,
            has_poll: false,
          }))
        : [];

      const transformedAnnouncements: Announcement[] = allAnnouncements.map(
        (announcement) => ({
          id: announcement.id,
          title: announcement.title,
          content: announcement.content,
          priority: announcement.is_urgent
            ? "urgent"
            : ("medium" as "low" | "medium" | "high" | "urgent"),
          category: announcement.type || "general",
          created_date: new Date(announcement.created_at).toLocaleDateString(),
          author: "Management Office",
          is_pinned: announcement.is_pinned,
          read_status: false,
          target_audience: ["residents"],
          scope: announcement.scope,
          type: announcement.type,
          is_urgent: announcement.is_urgent,
          publish_at: announcement.publish_at,
          expire_at: announcement.expire_at,
          has_poll: announcement.has_poll,
          images: Array.isArray(announcement.images)
            ? (announcement.images as string[])
            : announcement.images
            ? [announcement.images as string]
            : [],
          attachments: Array.isArray(announcement.attachments)
            ? (announcement.attachments as Array<{
                name: string;
                url: string;
                size?: number;
              }>)
            : announcement.attachments
            ? [
                announcement.attachments as {
                  name: string;
                  url: string;
                  size?: number;
                },
              ]
            : [],
          reading_time_minutes: announcement.reading_time_minutes,
        })
      );

      console.log(
        "Fetched announcements with images:",
        transformedAnnouncements
      );
      setAnnouncements(transformedAnnouncements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast({
        title:
          language === "en"
            ? "Error loading announcements"
            : "Ralat memuatkan pengumuman",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesScope =
      selectedScope === "all" || announcement.scope === selectedScope;
    const matchesCategory =
      selectedCategory === "all" || announcement.category === selectedCategory;

    return matchesSearch && matchesScope && matchesCategory;
  });

  const pinnedAnnouncements = filteredAnnouncements.filter((a) => a.is_pinned);
  const regularAnnouncements = filteredAnnouncements.filter(
    (a) => !a.is_pinned
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getPriorityText = (priority: string) => {
    return t[priority as keyof typeof t] || priority;
  };

  const getScopeColor = (scope: string) => {
    switch (scope) {
      case "state":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "district":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "community":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getScopeText = (scope: string) => {
    return t[scope as keyof typeof t] || scope;
  };

  const stats = {
    total: announcements.length,
    pinned: pinnedAnnouncements.length,
    unread: announcements.filter((a) => !a.read_status).length,
    thisWeek: announcements.filter((a) => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(a.created_date) >= weekAgo;
    }).length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Megaphone className="w-8 h-8" />
            {t.title}
          </h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </div>

        {canCreateAnnouncements && (
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t.createAnnouncement}
          </Button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Megaphone className="w-6 h-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {t.totalAnnouncements}
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Pin className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {t.pinnedAnnouncements}
                </p>
                <p className="text-2xl font-bold">{stats.pinned}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {t.unreadAnnouncements}
                </p>
                <p className="text-2xl font-bold">{stats.unread}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">{t.thisWeek}</p>
                <p className="text-2xl font-bold">{stats.thisWeek}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedScope} onValueChange={setSelectedScope}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder={t.scope} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allScopes}</SelectItem>
                <SelectItem value="state">{t.state}</SelectItem>
                <SelectItem value="district">{t.district}</SelectItem>
                <SelectItem value="community">{t.community}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder={t.category} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allCategories}</SelectItem>
                <SelectItem value="general">{t.general}</SelectItem>
                <SelectItem value="maintenance">{t.maintenance}</SelectItem>
                <SelectItem value="emergency">{t.emergency}</SelectItem>
                <SelectItem value="event">{t.event}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Announcements */}
      <div className="space-y-6">
        {/* Pinned Announcements */}
        {pinnedAnnouncements.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Pin className="w-5 h-5" />
              {t.pinned}
            </h2>
            {pinnedAnnouncements.map((announcement) => (
              <div key={announcement.id} className="space-y-4">
                <Card
                  className="border-l-4 border-l-yellow-400 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleAnnouncementClick(announcement)}
                  title={t.viewDetails}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {announcement.is_urgent && (
                            <span className="text-red-500">🔴</span>
                          )}
                          {announcement.title}
                          {announcement.has_poll && (
                            <Badge variant="outline" className="ml-2">
                              <BarChart3 className="w-3 h-3 mr-1" />
                              {t.poll}
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant={getPriorityColor(announcement.priority)}
                          >
                            {getPriorityText(announcement.priority)}
                          </Badge>
                          <Badge variant="secondary">
                            {announcement.category}
                          </Badge>
                          <Badge className={getScopeColor(announcement.scope)}>
                            {getScopeText(announcement.scope)}
                          </Badge>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-1" />
                            {announcement.created_date}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground leading-relaxed">
                      {announcement.content}
                    </p>
                  </CardContent>
                </Card>

                {/* Render poll if exists - temporarily disabled */}
                {announcement.has_poll && (
                  <PollComponent announcementId={announcement.id} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Regular Announcements */}
        {regularAnnouncements.length > 0 && (
          <div className="space-y-4">
            {pinnedAnnouncements.length > 0 && (
              <h2 className="text-xl font-semibold">Recent Announcements</h2>
            )}
            {regularAnnouncements.map((announcement) => (
              <div key={announcement.id} className="space-y-4">
                <Card
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    !announcement.read_status
                      ? "bg-blue-50/50 dark:bg-blue-950/20"
                      : ""
                  }`}
                  onClick={() => handleAnnouncementClick(announcement)}
                  title={t.viewDetails}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {announcement.is_urgent && (
                            <span className="text-red-500">🔴</span>
                          )}
                          {announcement.title}
                          {announcement.has_poll && (
                            <Badge variant="outline" className="ml-2">
                              <BarChart3 className="w-3 h-3 mr-1" />
                              {t.poll}
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant={getPriorityColor(announcement.priority)}
                          >
                            {getPriorityText(announcement.priority)}
                          </Badge>
                          <Badge variant="secondary">
                            {announcement.category}
                          </Badge>
                          <Badge className={getScopeColor(announcement.scope)}>
                            {getScopeText(announcement.scope)}
                          </Badge>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-1" />
                            {announcement.created_date}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground leading-relaxed">
                      {announcement.content}
                    </p>
                  </CardContent>
                </Card>

                {/* Render poll if exists - temporarily disabled */}
                {announcement.has_poll && (
                  <PollComponent announcementId={announcement.id} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* No announcements */}
        {filteredAnnouncements.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Megaphone className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t.noAnnouncements}
              </h3>
              <p className="text-muted-foreground">{t.noAnnouncementsDesc}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Announcement Modal */}
      <CreateAnnouncementModal
        isOpen={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onAnnouncementCreated={fetchAnnouncements}
      />

      {/* Announcement Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Megaphone className="w-5 h-5" />
                {t.announcementDetails}
              </DialogTitle>
              {canCreateAnnouncements && selectedAnnouncement && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleTogglePin(
                      selectedAnnouncement.id,
                      selectedAnnouncement.is_pinned
                    )
                  }
                  className="flex items-center gap-2"
                >
                  {selectedAnnouncement.is_pinned ? (
                    <>
                      <PinOff className="w-4 h-4" />
                      {t.unpinAnnouncement}
                    </>
                  ) : (
                    <>
                      <Pin className="w-4 h-4" />
                      {t.pinAnnouncement}
                    </>
                  )}
                </Button>
              )}
            </div>
          </DialogHeader>

          {selectedAnnouncement && (
            <div className="space-y-6">
              {/* Title and Actions Bar */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  {selectedAnnouncement.is_urgent && (
                    <span className="text-red-500">🔴</span>
                  )}
                  {selectedAnnouncement.title}
                  {selectedAnnouncement.is_pinned && (
                    <Pin className="w-5 h-5 text-yellow-500" />
                  )}
                </h2>

                {/* Engagement Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {selectedAnnouncement.view_count !== undefined && (
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>
                        {selectedAnnouncement.view_count} {t.viewCount}
                      </span>
                    </div>
                  )}
                  {selectedAnnouncement.reading_time_minutes && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {selectedAnnouncement.reading_time_minutes}{" "}
                        {t.readingTime}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {t.publishedOn} {selectedAnnouncement.created_date}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>
                      {t.author}: {selectedAnnouncement.author}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBookmark(selectedAnnouncement.id)}
                    className="flex items-center gap-2"
                  >
                    {selectedAnnouncement.is_bookmarked ? (
                      <BookmarkCheck className="w-4 h-4" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                    {selectedAnnouncement.is_bookmarked
                      ? t.bookmarked
                      : t.bookmark}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    {t.share}
                  </Button>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={getPriorityColor(selectedAnnouncement.priority)}
                  >
                    {getPriorityText(selectedAnnouncement.priority)}
                  </Badge>
                  <Badge variant="secondary">
                    {selectedAnnouncement.category}
                  </Badge>
                  <Badge className={getScopeColor(selectedAnnouncement.scope)}>
                    {getScopeText(selectedAnnouncement.scope)}
                  </Badge>
                  {selectedAnnouncement.has_poll && (
                    <Badge variant="outline">
                      <BarChart3 className="w-3 h-3 mr-1" />
                      {t.poll}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="border-t pt-4">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap mb-4">
                    {selectedAnnouncement.content}
                  </p>
                </div>

                {/* Rich Content: Images */}
                {selectedAnnouncement.images &&
                  selectedAnnouncement.images.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        {t.images} ({selectedAnnouncement.images.length})
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedAnnouncement.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Announcement image ${index + 1}`}
                            className="rounded-lg border object-cover aspect-square cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(image, "_blank")}
                            onLoad={() =>
                              console.log("Image loaded successfully:", image)
                            }
                            onError={(e) => {
                              console.error("Image failed to load:", image);
                              console.error("Error event:", e);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                {/* Rich Content: Attachments */}
                {selectedAnnouncement.attachments &&
                  selectedAnnouncement.attachments.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {t.attachments}
                      </h4>
                      <div className="space-y-2">
                        {selectedAnnouncement.attachments.map(
                          (attachment, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                <span className="font-medium">
                                  {attachment.name}
                                </span>
                                {attachment.size && (
                                  <span className="text-sm text-muted-foreground">
                                    (
                                    {(attachment.size / 1024 / 1024).toFixed(1)}{" "}
                                    MB)
                                  </span>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  window.open(attachment.url, "_blank")
                                }
                              >
                                <Download className="w-4 h-4" />
                                {t.download}
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>

              {/* Reactions */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">{t.reactions}</h4>
                <div className="flex items-center gap-3">
                  <Button
                    variant={
                      selectedAnnouncement.user_reactions?.includes("like")
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      handleReaction(selectedAnnouncement.id, "like")
                    }
                    className="flex items-center gap-2"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {t.like}
                    {selectedAnnouncement.reactions?.like ? (
                      <span className="ml-1 text-xs">
                        ({selectedAnnouncement.reactions.like})
                      </span>
                    ) : null}
                  </Button>

                  <Button
                    variant={
                      selectedAnnouncement.user_reactions?.includes("helpful")
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      handleReaction(selectedAnnouncement.id, "helpful")
                    }
                    className="flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4" />
                    {t.helpful}
                    {selectedAnnouncement.reactions?.helpful ? (
                      <span className="ml-1 text-xs">
                        ({selectedAnnouncement.reactions.helpful})
                      </span>
                    ) : null}
                  </Button>

                  <Button
                    variant={
                      selectedAnnouncement.user_reactions?.includes("important")
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      handleReaction(selectedAnnouncement.id, "important")
                    }
                    className="flex items-center gap-2"
                  >
                    <Star className="w-4 h-4" />
                    {t.important}
                    {selectedAnnouncement.reactions?.important ? (
                      <span className="ml-1 text-xs">
                        ({selectedAnnouncement.reactions.important})
                      </span>
                    ) : null}
                  </Button>
                </div>
              </div>

              {/* Poll Section */}
              {selectedAnnouncement.has_poll && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    {t.poll}
                  </h3>
                  <PollComponent announcementId={selectedAnnouncement.id} />
                </div>
              )}

              {/* Comments Section */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  {t.comments} ({comments.length})
                </h4>

                {/* Add Comment */}
                <div className="space-y-3 mb-4">
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {user?.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder={t.addComment}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[60px] resize-none"
                      />
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                          className="flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          {t.postComment}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                <ScrollArea className="max-h-[400px]">
                  <div className="space-y-4">
                    {commentsLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    ) : comments.length > 0 ? (
                      comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="flex gap-3 p-3 rounded-lg bg-muted/30"
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={comment.user_avatar} />
                            <AvatarFallback>
                              {comment.user_name[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {comment.user_name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(
                                  comment.created_at
                                ).toLocaleDateString()}
                              </span>
                              {comment.is_edited && (
                                <span className="text-xs text-muted-foreground">
                                  (edited)
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-foreground">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No comments yet. Be the first to comment!
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Share this announcement via the Communication Hub by creating a
              new chat or sending it to existing contacts.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShareModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Navigate to communication hub with the announcement
                  setShareModalOpen(false);
                  toast({
                    title:
                      language === "en"
                        ? "Redirecting to Communication Hub"
                        : "Mengalih ke Hub Komunikasi",
                    description:
                      language === "en"
                        ? "Opening Communication Hub to share announcement"
                        : "Membuka Hub Komunikasi untuk berkongsi pengumuman",
                  });
                }}
              >
                Open Communication Hub
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
