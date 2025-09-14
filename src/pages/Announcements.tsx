import { useState, useEffect, useMemo, useCallback, memo } from "react";
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
  Paperclip,
  Send,
  Reply,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ArrowUpDown,
  Filter,
  SlidersHorizontal
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CreateAnnouncementModal from "@/components/announcements/CreateAnnouncementModal";
import PollComponent from "@/components/announcements/PollComponent";
import { useUserRoles } from "@/hooks/use-user-roles";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

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

// Memoized components for better performance
const AnnouncementCard = memo(({ 
  announcement, 
  onClick, 
  onPin, 
  canPin, 
  t, 
  language,
  getScopeColor,
  getScopeText,
  getPriorityColor,
  getPriorityText 
}: any) => (
  <Card
    className={`cursor-pointer hover:shadow-md transition-all duration-200 ${
      announcement.is_pinned ? 'border-l-4 border-l-yellow-400 shadow-sm' : ''
    }`}
    onClick={() => onClick(announcement)}
  >
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <CardTitle className="text-lg flex items-center gap-2">
            {announcement.is_pinned && (
              <Pin className="w-4 h-4 text-yellow-600 fill-current" />
            )}
            {announcement.title}
            {announcement.has_poll && (
              <Badge variant="outline" className="text-xs">
                <BarChart3 className="w-3 h-3 mr-1" />
                {t.poll}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={getPriorityColor(announcement.priority)} className="text-xs">
              {getPriorityText(announcement.priority)}
            </Badge>
            <Badge className={`text-xs ${getScopeColor(announcement.scope)}`}>
              {getScopeText(announcement.scope)}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {t[announcement.category as keyof typeof t] || announcement.category}
            </Badge>
          </div>
        </div>
        {canPin && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onPin(announcement.id, announcement.is_pinned);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {announcement.is_pinned ? (
              <PinOff className="w-4 h-4" />
            ) : (
              <Pin className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <CardDescription className="mb-3 line-clamp-3">
        {announcement.content}
      </CardDescription>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {announcement.created_date}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {announcement.author}
          </span>
          {announcement.view_count !== undefined && (
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {announcement.view_count} {t.viewCount}
            </span>
          )}
          {announcement.reading_time_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {announcement.reading_time_minutes} {t.readingTime}
            </span>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
));

const PaginationControls = memo(({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  loading 
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading: boolean;
}) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta);
         i <= Math.min(totalPages - 1, currentPage + delta);
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {getVisiblePages().map((page, index) => (
        <Button
          key={index}
          variant={page === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...' || loading}
          className={page === '...' ? 'cursor-default' : ''}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || loading}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
});

export default function Announcements() {
  const { language, user } = useAuth();
  const { toast } = useToast();
  const { hasRole } = useUserRoles();

  // Enhanced state management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedScope, setSelectedScope] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAnnouncements, setTotalAnnouncements] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const announcementsPerPage = 15;

  // User profile context for scoping
  const [profileDistrictId, setProfileDistrictId] = useState<string | null>(null);
  const [profileCommunityId, setProfileCommunityId] = useState<string | null>(null);
  
  // Debounced search
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    type: "general",
    is_urgent: false,
    is_published: true,
    publish_at: "",
    expire_at: "",
    attachments: [] as Array<{ name: string; url: string; size?: number }>,
    newAttachments: [] as File[],
    images: [] as string[],
    newImages: [] as File[],
  });
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [replyToComment, setReplyToComment] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

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
      priority: "Priority",
      sortBy: "Sort By",
      allScopes: "All Scopes",
      allCategories: "All Categories",
      allPriorities: "All Priorities",
      state: "State",
      district: "District",
      community: "Community",
      general: "General",
      maintenance: "Maintenance",
      emergency: "Emergency",
      event: "Event",
      urgent: "Urgent",
      high: "High",
      medium: "Medium",
      low: "Low",
      latest: "Latest",
      oldest: "Oldest",
      mostViewed: "Most Viewed",
      mostReacted: "Most Reacted",
      createAnnouncement: "Create Announcement",
      pinned: "Pinned",
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
      poll: "Poll",
      hasPoll: "This announcement includes a poll",
      showingResults: "Showing",
      of: "of",
      results: "results",
      refresh: "Refresh",
      filters: "Filters",
      clearFilters: "Clear Filters",
      applyFilters: "Apply Filters",
      content: "Content"
    },
    ms: {
      title: "Pengumuman Komuniti",
      subtitle: "Kekal dikemas kini dengan maklumat penting komuniti",
      search: "Cari pengumuman...",
      scope: "Skop",
      category: "Kategori",
      priority: "Keutamaan",
      sortBy: "Susun Mengikut",
      allScopes: "Semua Skop",
      allCategories: "Semua Kategori",
      allPriorities: "Semua Keutamaan",
      state: "Negeri",
      district: "Daerah",
      community: "Komuniti",
      general: "Umum",
      maintenance: "Penyelenggaraan",
      emergency: "Kecemasan",
      event: "Acara",
      urgent: "Penting",
      high: "Tinggi",
      medium: "Sederhana",
      low: "Rendah",
      latest: "Terkini",
      oldest: "Terlama",
      mostViewed: "Paling Dilihat",
      mostReacted: "Paling Bereaksi",
      createAnnouncement: "Cipta Pengumuman",
      pinned: "Disematkan",
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
      poll: "Undian",
      hasPoll: "Pengumuman ini mengandungi undian",
      showingResults: "Menunjukkan",
      of: "daripada",
      results: "hasil",
      refresh: "Muat Semula",
      filters: "Penapis",
      clearFilters: "Kosongkan Penapis",
      applyFilters: "Gunakan Penapis",
      content: "Kandungan"
    },
  };

  const t = text[language];

  // Load profile once for scoping
  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!user) return;
        const { data, error } = await supabase
          .from("profiles")
          .select("district_id, community_id")
          .eq("user_id", user.id)
          .single();
        if (error) return;
        setProfileDistrictId(data?.district_id ?? null);
        setProfileCommunityId(data?.community_id ?? null);
      } catch (e) {
        // non-blocking
      }
    };
    loadProfile();
  }, [user]);

  // Enhanced fetch announcements with server-side pagination and filtering
  const fetchAnnouncements = useCallback(async (page = 1, preserveScroll = false) => {
    try {
      if (!preserveScroll) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      // Build query parameters
      const offset = (page - 1) * announcementsPerPage;
      let query = supabase
        .from("announcements")
        .select(`
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
          district_id,
          community_id,
          images,
          attachments,
          reading_time_minutes
        `, { count: 'exact' })
        .eq("is_published", true)
        .lte("publish_at", new Date().toISOString())
        .or("expire_at.is.null,expire_at.gt." + new Date().toISOString());

      // Apply user scoping: state OR (district & user district) OR (community & user community)
      // If user selects a specific scope, further narrow it.
      const filters: string[] = [];
      const canSeeState = true; // all users see state-level
      if (selectedScope === 'all') {
        if (canSeeState) filters.push('scope.eq.state');
        if (profileDistrictId) filters.push(`and(scope.eq.district,district_id.eq.${profileDistrictId})`);
        if (profileCommunityId) filters.push(`and(scope.eq.community,community_id.eq.${profileCommunityId})`);
        if (filters.length > 0) {
          query = query.or(filters.join(','));
        }
      } else if (selectedScope === 'state') {
        query = query.eq('scope', 'state');
      } else if (selectedScope === 'district') {
        query = query.eq('scope', 'district');
        if (profileDistrictId) query = query.eq('district_id', profileDistrictId);
        else query = query.eq('district_id', ''); // ensure none if unknown
      } else if (selectedScope === 'community') {
        query = query.eq('scope', 'community');
        if (profileCommunityId) query = query.eq('community_id', profileCommunityId);
        else query = query.eq('community_id', '');
      }

      // Apply search filter
      if (debouncedSearchTerm) {
        query = query.or(`title.ilike.%${debouncedSearchTerm}%,content.ilike.%${debouncedSearchTerm}%,type.ilike.%${debouncedSearchTerm}%`);
      }

      // Apply category filter
      if (selectedCategory !== 'all') {
        query = query.eq('type', selectedCategory as any);
      }

      // Apply priority filter (based on is_urgent)
      if (selectedPriority !== 'all') {
        if (selectedPriority === 'urgent') {
          query = query.eq('is_urgent', true);
        } else if (selectedPriority === 'medium' || selectedPriority === 'low' || selectedPriority === 'high') {
          query = query.eq('is_urgent', false);
        }
      }

      // Apply sorting
      switch (sortBy) {
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'mostViewed':
          // For now, sort by created_at desc as view_count needs separate table
          query = query.order('created_at', { ascending: false });
          break;
        case 'mostReacted':
          // For now, sort by created_at desc as reactions need separate table
          query = query.order('created_at', { ascending: false });
          break;
        case 'latest':
        default:
          query = query.order('is_pinned', { ascending: false })
                       .order('created_at', { ascending: false });
          break;
      }

      // Apply pagination
      query = query.range(offset, offset + announcementsPerPage - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      // Transform data with defaults for missing fields
      const transformedAnnouncements: Announcement[] = (data || []).map((announcement) => ({
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        priority: announcement.is_urgent ? "urgent" : "medium",
        category: announcement.type || "general",
        created_date: new Date(announcement.created_at).toLocaleDateString(),
        author: "Management Office",
        is_pinned: announcement.is_pinned || false,
        read_status: false,
        target_audience: ["residents"],
        scope: announcement.scope || "district",
        type: announcement.type || "general",
        is_urgent: announcement.is_urgent || false,
        publish_at: announcement.publish_at,
        expire_at: announcement.expire_at,
        has_poll: false,
        images: Array.isArray(announcement.images) ? 
                (announcement.images as string[]) : 
                announcement.images ? [String(announcement.images)] : [],
        attachments: Array.isArray(announcement.attachments) ? 
                    (announcement.attachments as Array<{ name: string; url: string; size?: number }>) : 
                    announcement.attachments ? [announcement.attachments as any] : [],
        reading_time_minutes: announcement.reading_time_minutes || Math.max(1, Math.ceil(announcement.content.length / 200)),
        view_count: 0,
        reactions: { like: 0, helpful: 0, important: 0 },
        user_reactions: [],
        is_bookmarked: false
      }));

      setAnnouncements(transformedAnnouncements);
      setTotalAnnouncements(count || 0);
      setTotalPages(Math.ceil((count || 0) / announcementsPerPage));
      setCurrentPage(page);

      // Preserve scroll position if requested
      if (preserveScroll && scrollPosition > 0) {
        setTimeout(() => {
          window.scrollTo(0, scrollPosition);
        }, 100);
      }

    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast({
        title: language === "en" ? "Error loading announcements" : "Ralat memuatkan pengumuman",
        variant: "destructive",
      });
      
      // Set fallback demo data
      setAnnouncements([
        {
          id: "demo-1",
          title: "Community Maintenance Notice",
          content: "Scheduled maintenance work will be conducted in the community facilities from 9 AM to 5 PM.",
          priority: "high",
          category: "maintenance",
          created_date: new Date().toLocaleDateString(),
          author: "Facility Management",
          is_pinned: true,
          read_status: false,
          target_audience: ["residents"],
          scope: "community",
          type: "maintenance",
          is_urgent: false,
          publish_at: new Date().toISOString(),
          has_poll: false,
          images: [],
          attachments: [],
          reading_time_minutes: 2,
          view_count: 45,
          reactions: { like: 8, helpful: 12, important: 5 },
          user_reactions: [],
          is_bookmarked: false
        }
      ]);
      setTotalAnnouncements(1);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [debouncedSearchTerm, selectedScope, selectedCategory, selectedPriority, sortBy, language, scrollPosition, profileDistrictId, profileCommunityId]);

  // Effects for data fetching
  useEffect(() => {
    if (user) {
      fetchAnnouncements(1);
    }
  }, [user, fetchAnnouncements]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
      fetchAnnouncements(1);
    } else {
      fetchAnnouncements(1);
    }
  }, [debouncedSearchTerm, selectedScope, selectedCategory, selectedPriority, sortBy, profileDistrictId, profileCommunityId]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

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
          setScrollPosition(window.scrollY);
          fetchAnnouncements(currentPage, true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentPage, fetchAnnouncements]);

  // Event handlers
  const handlePageChange = useCallback((page: number) => {
    setScrollPosition(0);
    fetchAnnouncements(page);
    window.scrollTo(0, 0);
  }, [fetchAnnouncements]);

  const handleRefresh = useCallback(() => {
    setScrollPosition(window.scrollY);
    fetchAnnouncements(currentPage, true);
  }, [currentPage, fetchAnnouncements]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedScope("all");
    setSelectedCategory("all");
    setSelectedPriority("all");
    setSortBy("latest");
  }, []);

  const handleAnnouncementClick = useCallback((announcement: Announcement) => {
    console.log('Clicking announcement:', announcement.id, announcement.title);
    setSelectedAnnouncement(announcement);
    console.log('Setting details modal open...');
    setDetailsModalOpen(true);
    console.log('Details modal should be open now');
    // View tracking removed to avoid 409 error
  }, []);

  // trackAnnouncementView function removed to prevent 409 errors

  const handleTogglePin = async (announcementId: string, currentPinStatus: boolean) => {
    if (!canCreateAnnouncements) {
      toast({
        title: language === "en" ? "Permission denied" : "Kebenaran ditolak",
        description: language === "en"
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

      toast({
        title: !currentPinStatus ? t.pinnedSuccess : t.unpinnedSuccess,
      });
    } catch (error) {
      console.error("Error toggling pin status:", error);
      toast({
        title: language === "en"
          ? "Error updating pin status"
          : "Ralat mengemas kini status pin",
        variant: "destructive",
      });
    }
  };

  // Utility functions
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

  // Helper function to upload attachments
  const uploadAttachments = async (files: File[]): Promise<Array<{ name: string; url: string; size: number }>> => {
    const uploadedAttachments = [];
    
    for (const file of files) {
      try {
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: language === 'en' ? 'File too large' : 'Fail terlalu besar',
            description: `${file.name} exceeds 10MB limit`,
            variant: 'destructive'
          });
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `announcements/attachments/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('announcements')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from('announcements')
          .getPublicUrl(filePath);

        uploadedAttachments.push({
          name: file.name,
          url: urlData.publicUrl,
          size: file.size
        });

        console.log(`Successfully uploaded: ${file.name}`);
      } catch (error) {
        console.error('Error uploading attachment:', error);
        toast({
          title: language === 'en' ? 'Upload failed' : 'Gagal muat naik',
          description: `Failed to upload ${file.name}: ${error.message || 'Unknown error'}`,
          variant: 'destructive'
        });
      }
    }
    
    return uploadedAttachments;
  };

  // Helper function to upload images
  const uploadImages = async (files: File[]): Promise<string[]> => {
    const uploadedImages = [];
    
    for (const file of files) {
      try {
        // Check file size (5MB limit for images)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: language === 'en' ? 'Image too large' : 'Gambar terlalu besar',
            description: `${file.name} exceeds 5MB limit`,
            variant: 'destructive'
          });
          continue;
        }

        // Validate image type
        if (!file.type.startsWith('image/')) {
          toast({
            title: language === 'en' ? 'Invalid file type' : 'Jenis fail tidak sah',
            description: `${file.name} is not an image file`,
            variant: 'destructive'
          });
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `announcements/images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('announcements')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from('announcements')
          .getPublicUrl(filePath);

        uploadedImages.push(urlData.publicUrl);
        console.log(`Successfully uploaded image: ${file.name}`);
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: language === 'en' ? 'Image upload failed' : 'Gagal muat naik gambar',
          description: `Failed to upload ${file.name}: ${error.message || 'Unknown error'}`,
          variant: 'destructive'
        });
      }
    }
    
    return uploadedImages;
  };

  // Helper function to delete attachments from storage
  const deleteAttachmentsFromStorage = async (urls: string[]) => {
    for (const url of urls) {
      try {
        // Extract file path from URL
        const urlParts = url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        // Check if this is a valid attachment URL from our storage
        if (url.includes('announcements/attachments/')) {
          const filePath = `announcements/attachments/${fileName}`;
          
          const { error } = await supabase.storage
            .from('announcements')
            .remove([filePath]);
            
          if (error) {
            console.error('Error deleting attachment from storage:', error);
          } else {
            console.log(`Successfully deleted: ${fileName}`);
          }
        }
      } catch (error) {
        console.error('Error deleting attachment from storage:', error);
      }
    }
  };

  // Helper function to delete images from storage
  const deleteImagesFromStorage = async (urls: string[]) => {
    for (const url of urls) {
      try {
        // Extract file path from URL
        const urlParts = url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        // Check if this is a valid image URL from our storage
        if (url.includes('announcements/images/')) {
          const filePath = `announcements/images/${fileName}`;
          
          const { error } = await supabase.storage
            .from('announcements')
            .remove([filePath]);
            
          if (error) {
            console.error('Error deleting image from storage:', error);
          } else {
            console.log(`Successfully deleted image: ${fileName}`);
          }
        }
      } catch (error) {
        console.error('Error deleting image from storage:', error);
      }
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

  // Memoized calculations
  const stats = useMemo(() => ({
    total: totalAnnouncements,
    pinned: announcements.filter(a => a.is_pinned).length,
    unread: announcements.filter(a => !a.read_status).length,
    thisWeek: announcements.filter(a => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(a.created_date) >= weekAgo;
    }).length,
  }), [totalAnnouncements, announcements]);

  const resultText = useMemo(() => {
    const start = (currentPage - 1) * announcementsPerPage + 1;
    const end = Math.min(currentPage * announcementsPerPage, totalAnnouncements);
    return `${t.showingResults} ${start}-${end} ${t.of} ${totalAnnouncements} ${t.results}`;
  }, [currentPage, totalAnnouncements, t]);

  if (loading && announcements.length === 0) {
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
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Megaphone className="w-6 h-6 sm:w-8 sm:h-8" />
            {t.title}
          </h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {t.refresh}
          </Button>
          
          {canCreateAnnouncements && (
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t.createAnnouncement}
            </Button>
          )}
        </div>
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

      {/* Enhanced Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" />
              {t.filters}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs"
            >
              {t.clearFilters}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Select value={selectedScope} onValueChange={setSelectedScope}>
              <SelectTrigger>
                <SelectValue placeholder={t.scope} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allScopes}</SelectItem>
                <SelectItem value="state">{t.state}</SelectItem>
                <SelectItem value="district">{t.district}</SelectItem>
                <SelectItem value="community">{t.community}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
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

            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger>
                <SelectValue placeholder={t.priority} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allPriorities}</SelectItem>
                <SelectItem value="urgent">{t.urgent}</SelectItem>
                <SelectItem value="high">{t.high}</SelectItem>
                <SelectItem value="medium">{t.medium}</SelectItem>
                <SelectItem value="low">{t.low}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder={t.sortBy} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">{t.latest}</SelectItem>
                <SelectItem value="oldest">{t.oldest}</SelectItem>
                <SelectItem value="mostViewed">{t.mostViewed}</SelectItem>
                <SelectItem value="mostReacted">{t.mostReacted}</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              {resultText}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeleton
          [...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : announcements.length > 0 ? (
          <>
            {announcements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                onClick={handleAnnouncementClick}
                onPin={handleTogglePin}
                canPin={canCreateAnnouncements}
                t={t}
                language={language}
                getScopeColor={getScopeColor}
                getScopeText={getScopeText}
                getPriorityColor={getPriorityColor}
                getPriorityText={getPriorityText}
              />
            ))}

            {/* Pagination */}
            <div className="flex justify-center pt-6">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                loading={loading}
              />
            </div>
          </>
        ) : (
          // No results state
          <Card>
            <CardContent className="p-12 text-center">
              <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t.noAnnouncements}</h3>
              <p className="text-muted-foreground mb-4">{t.noAnnouncementsDesc}</p>
              <Button onClick={handleClearFilters} variant="outline">
                {t.clearFilters}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Announcement Modal */}
      <CreateAnnouncementModal
        isOpen={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onAnnouncementCreated={() => {
          setCreateModalOpen(false);
          handleRefresh();
        }}
      />

      {/* Announcement Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5" />
              {t.announcementDetails}
            </DialogTitle>
          </DialogHeader>
          {selectedAnnouncement && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{selectedAnnouncement.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={getPriorityColor(selectedAnnouncement.priority)}>
                      {getPriorityText(selectedAnnouncement.priority)}
                    </Badge>
                    <Badge className={getScopeColor(selectedAnnouncement.scope)}>
                      {getScopeText(selectedAnnouncement.scope)}
                    </Badge>
                    <Badge variant="secondary">
                      {t[selectedAnnouncement.category as keyof typeof t] || selectedAnnouncement.category}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-4">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {t.publishedOn}: {selectedAnnouncement.created_date}</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {t.author}: {selectedAnnouncement.author}</span>
                  </div>
                </div>
                {canCreateAnnouncements && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      if (selectedAnnouncement) {
                        setEditForm({
                          title: selectedAnnouncement.title,
                          content: selectedAnnouncement.content,
                          type: selectedAnnouncement.type,
                          is_urgent: selectedAnnouncement.is_urgent,
                          is_published: true,
                          publish_at: selectedAnnouncement.publish_at || new Date().toISOString().slice(0, 16),
                          expire_at: selectedAnnouncement.expire_at || "",
                          attachments: selectedAnnouncement.attachments || [],
                          newAttachments: [],
                          images: selectedAnnouncement.images || [],
                          newImages: [],
                        });
                        setAttachmentToDelete([]);
                        setImagesToDelete([]);
                      }
                      setEditModalOpen(true);
                    }}>
                      <FileText className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        if (!selectedAnnouncement) return;
                        if (!confirm(language === 'en' ? 'Delete this announcement?' : 'Padam pengumuman ini?')) return;
                        try {
                          const { error } = await supabase
                            .from('announcements')
                            .delete()
                            .eq('id', selectedAnnouncement.id);
                          if (error) throw error;
                          setDetailsModalOpen(false);
                          setSelectedAnnouncement(null);
                          handleRefresh();
                        } catch (e) {
                          toast({ title: language === 'en' ? 'Delete failed' : 'Gagal memadam', variant: 'destructive' });
                        }
                      }}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePin(selectedAnnouncement.id, selectedAnnouncement.is_pinned)}
                    >
                      {selectedAnnouncement.is_pinned ? <PinOff className="w-4 h-4 mr-1" /> : <Pin className="w-4 h-4 mr-1" />}
                      {selectedAnnouncement.is_pinned ? t.unpinAnnouncement : t.pinAnnouncement}
                    </Button>
                  </div>
                )}
              </div>

              {/* Images */}
              {selectedAnnouncement.images && selectedAnnouncement.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedAnnouncement.images.map((img, idx) => (
                    <img key={idx} src={img} alt={`image-${idx}`} className="w-full h-32 object-cover rounded-md border" />
                  ))}
                </div>
              )}

              {/* Content */}
              <div className="prose dark:prose-invert max-w-none">
                <p>{selectedAnnouncement.content}</p>
              </div>

              {/* Attachments */}
              {selectedAnnouncement.attachments && selectedAnnouncement.attachments.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2"><Paperclip className="w-4 h-4" /> {t.attachments}</h4>
                  <div className="space-y-2">
                    {selectedAnnouncement.attachments.map((att, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 border rounded-md">
                        <span className="text-sm">{att.name || `Attachment ${idx + 1}`}</span>
                        <Button asChild variant="outline" size="sm">
                          <a href={att.url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-1" /> {t.download}
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Edit Announcement
              {selectedAnnouncement && (
                <span className="text-sm font-normal text-muted-foreground">
                  • {selectedAnnouncement.title}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedAnnouncement && (
            <div className="space-y-4">
              <Input
                placeholder={t.title}
                value={editForm.title}
                onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
              />
              <Textarea
                rows={5}
                placeholder={t.content}
                value={editForm.content}
                onChange={(e) => setEditForm((p) => ({ ...p, content: e.target.value }))}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Select
                  value={editForm.type}
                  onValueChange={(v) => setEditForm((p) => ({ ...p, type: v }))}
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
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editForm.is_urgent}
                    onCheckedChange={(c) => setEditForm((p) => ({ ...p, is_urgent: c }))}
                  />
                  <span className="text-sm">{t.urgent}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editForm.is_published}
                    onCheckedChange={(c) => setEditForm((p) => ({ ...p, is_published: c }))}
                  />
                  <span className="text-sm">Published</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Publish At</Label>
                  <Input
                    type="datetime-local"
                    value={editForm.publish_at}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) => setEditForm((p) => ({ ...p, publish_at: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Expire At</Label>
                  <Input
                    type="datetime-local"
                    value={editForm.expire_at}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) => setEditForm((p) => ({ ...p, expire_at: e.target.value }))}
                  />
                </div>
              </div>
              
              {/* Images Management */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <ImageIcon className="w-5 h-5" />
                  {t.images}
                </Label>
                
                {/* Existing Images */}
                {editForm.images && editForm.images.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-muted-foreground">Existing Images:</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {editForm.images.map((imageUrl, index) => (
                        <div key={`existing-img-${index}`} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border-2 border-muted">
                            <img 
                              src={imageUrl} 
                              alt={`Image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const newImages = editForm.images.filter((_, i) => i !== index);
                                setEditForm(prev => ({ ...prev, images: newImages }));
                                setImagesToDelete(prev => [...prev, imageUrl]);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* New Images Upload */}
                <div className="space-y-3">
                  <div className="text-sm font-medium text-muted-foreground">Add New Images:</div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('image-upload')?.click()}
                        className="h-10"
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Choose Images
                      </Button>
                      <input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          const maxSize = 5 * 1024 * 1024; // 5MB
                          const validFiles = files.filter(file => {
                            if (file.size > maxSize) {
                              toast({
                                title: language === 'en' ? 'Image too large' : 'Gambar terlalu besar',
                                description: `${file.name} is larger than 5MB`,
                                variant: 'destructive'
                              });
                              return false;
                            }
                            if (!file.type.startsWith('image/')) {
                              toast({
                                title: language === 'en' ? 'Invalid file type' : 'Jenis fail tidak sah',
                                description: `${file.name} is not an image`,
                                variant: 'destructive'
                              });
                              return false;
                            }
                            return true;
                          });
                          setEditForm(prev => ({ ...prev, newImages: validFiles }));
                        }}
                        className="hidden"
                      />
                      <div className="text-xs text-muted-foreground">
                        JPG, PNG, GIF, WebP (Max 5MB each)
                      </div>
                    </div>
                  </div>
                  
                  {/* Preview New Images */}
                  {editForm.newImages && editForm.newImages.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-green-700 dark:text-green-400">New Images to Upload:</div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {editForm.newImages.map((file, index) => (
                          <div key={`new-img-${index}`} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border-2 border-green-300 dark:border-green-700">
                              <img 
                                src={URL.createObjectURL(file)} 
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  const newFiles = editForm.newImages.filter((_, i) => i !== index);
                                  setEditForm(prev => ({ ...prev, newImages: newFiles }));
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 truncate">
                              {file.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Attachments Management */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <Paperclip className="w-5 h-5" />
                  {t.attachments}
                </Label>
                
                {/* Existing Attachments */}
                {editForm.attachments && editForm.attachments.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-muted-foreground">Existing Attachments:</div>
                    <div className="space-y-2">
                      {editForm.attachments.map((attachment, index) => (
                        <div key={`existing-${index}`} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-md">
                              <Paperclip className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{attachment.name}</div>
                              {attachment.size && (
                                <div className="text-xs text-muted-foreground">
                                  {(attachment.size / 1024 / 1024).toFixed(2)} MB
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-3">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              title="Preview attachment"
                            >
                              <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                                <Eye className="w-4 h-4" />
                              </a>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const newAttachments = editForm.attachments.filter((_, i) => i !== index);
                                setEditForm(prev => ({ ...prev, attachments: newAttachments }));
                                setAttachmentToDelete(prev => [...prev, attachment.url]);
                              }}
                              title="Remove attachment"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* New Attachments Upload */}
                <div className="space-y-3">
                  <div className="text-sm font-medium text-muted-foreground">Add New Attachments:</div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('attachment-upload')?.click()}
                        className="h-10"
                      >
                        <Paperclip className="w-4 h-4 mr-2" />
                        Choose Files
                      </Button>
                      <input
                        id="attachment-upload"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.zip,.rar"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          const maxSize = 10 * 1024 * 1024; // 10MB
                          const validFiles = files.filter(file => {
                            if (file.size > maxSize) {
                              toast({
                                title: language === 'en' ? 'File too large' : 'Fail terlalu besar',
                                description: `${file.name} is larger than 10MB`,
                                variant: 'destructive'
                              });
                              return false;
                            }
                            return true;
                          });
                          setEditForm(prev => ({ ...prev, newAttachments: validFiles }));
                        }}
                        className="hidden"
                      />
                      <div className="text-xs text-muted-foreground">
                        PDF, DOC, TXT, Excel, ZIP files (Max 10MB each)
                      </div>
                    </div>
                  </div>
                  
                  {/* Preview New Attachments */}
                  {editForm.newAttachments && editForm.newAttachments.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-green-700 dark:text-green-400">New Attachments to Upload:</div>
                      {editForm.newAttachments.map((file, index) => (
                        <div key={`new-${index}`} className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-md">
                              <Paperclip className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{file.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newFiles = editForm.newAttachments.filter((_, i) => i !== index);
                              setEditForm(prev => ({ ...prev, newAttachments: newFiles }));
                            }}
                            title="Remove file"
                            className="ml-3 text-green-600 hover:text-green-700 hover:bg-green-100"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Summary */}
                {(editForm.images.length > 0 || editForm.newImages.length > 0 || editForm.attachments.length > 0 || editForm.newAttachments.length > 0) && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Summary:</strong> 
                      {editForm.images.length > 0 && ` ${editForm.images.length} existing image(s)`}
                      {editForm.newImages.length > 0 && `, ${editForm.newImages.length} new image(s) to upload`}
                      {editForm.attachments.length > 0 && `, ${editForm.attachments.length} existing attachment(s)`}
                      {editForm.newAttachments.length > 0 && `, ${editForm.newAttachments.length} new attachment(s) to upload`}
                      {(imagesToDelete.length > 0 || attachmentToDelete.length > 0) && (
                        <span className="text-red-600 dark:text-red-400">
                          {imagesToDelete.length > 0 && ` • ${imagesToDelete.length} image(s) will be removed`}
                          {attachmentToDelete.length > 0 && ` • ${attachmentToDelete.length} attachment(s) will be removed`}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setEditModalOpen(false);
                  setAttachmentToDelete([]);
                  setEditForm({
                    title: "",
                    content: "",
                    type: "general",
                    is_urgent: false,
                    is_published: true,
                    publish_at: "",
                    expire_at: "",
                    attachments: [],
                    newAttachments: [],
                  });
                }}>Cancel</Button>
                <Button
                  onClick={async () => {
                    if (!selectedAnnouncement) return;
                    setEditSubmitting(true);
                    try {
                      // Handle image uploads
                      let newUploadedImages: string[] = [];
                      if (editForm.newImages.length > 0) {
                        setUploadingAttachments(true);
                        newUploadedImages = await uploadImages(editForm.newImages);
                      }

                      // Handle attachment uploads
                      let newUploadedAttachments: Array<{ name: string; url: string; size: number }> = [];
                      if (editForm.newAttachments.length > 0) {
                        setUploadingAttachments(true);
                        newUploadedAttachments = await uploadAttachments(editForm.newAttachments);
                        setUploadingAttachments(false);
                      }

                      // Combine existing with new uploads
                      const finalImages = [
                        ...editForm.images,
                        ...newUploadedImages
                      ];
                      
                      const finalAttachments = [
                        ...editForm.attachments,
                        ...newUploadedAttachments
                      ];

                      const updates: any = {
                        title: editForm.title,
                        content: editForm.content,
                        type: editForm.type,
                        is_urgent: editForm.is_urgent,
                        is_published: editForm.is_published,
                        publish_at: editForm.publish_at,
                        expire_at: editForm.expire_at || null,
                        images: finalImages,
                        attachments: finalAttachments,
                      };

                      const { error } = await supabase
                        .from('announcements')
                        .update(updates)
                        .eq('id', selectedAnnouncement.id);

                      if (error) throw error;

                      // Delete removed files from storage
                      if (imagesToDelete.length > 0) {
                        await deleteImagesFromStorage(imagesToDelete);
                      }
                      if (attachmentToDelete.length > 0) {
                        await deleteAttachmentsFromStorage(attachmentToDelete);
                      }

                      // Reflect changes locally
                      setAnnouncements((prev) => prev.map((a) => a.id === selectedAnnouncement.id ? {
                        ...a,
                        title: updates.title,
                        content: updates.content,
                        category: updates.type,
                        is_urgent: updates.is_urgent,
                        priority: updates.is_urgent ? 'urgent' : a.priority,
                        publish_at: updates.publish_at,
                        expire_at: updates.expire_at,
                        type: updates.type,
                        images: finalImages,
                        attachments: finalAttachments,
                      } : a));

                      // Update selected announcement for the detail view
                      setSelectedAnnouncement(prev => prev ? {
                        ...prev,
                        title: updates.title,
                        content: updates.content,
                        category: updates.type,
                        is_urgent: updates.is_urgent,
                        priority: updates.is_urgent ? 'urgent' : prev.priority,
                        publish_at: updates.publish_at,
                        expire_at: updates.expire_at,
                        type: updates.type,
                        images: finalImages,
                        attachments: finalAttachments,
                      } : null);

                      setEditModalOpen(false);
                      setAttachmentToDelete([]);
                      setImagesToDelete([]);
                      toast({ title: language === 'en' ? 'Updated successfully' : 'Berjaya dikemaskini' });
                    } catch (e) {
                      console.error('Update error:', e);
                      toast({ title: language === 'en' ? 'Update failed' : 'Gagal kemaskini', variant: 'destructive' });
                    } finally {
                      setEditSubmitting(false);
                      setUploadingAttachments(false);
                    }
                  }}
                  disabled={editSubmitting || uploadingAttachments}
                >
                  {(editSubmitting || uploadingAttachments) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {uploadingAttachments ? 'Uploading...' : 'Save'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
