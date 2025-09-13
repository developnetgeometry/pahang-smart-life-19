import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useModuleAccess } from "@/hooks/use-module-access";
import { supabase } from "@/integrations/supabase/client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  Plus,
  Search,
  Users,
  Clock,
  Pin,
  ArrowLeft,
  Reply,
  ThumbsUp,
  Loader2,
  Shield,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface Discussion {
  id: string;
  title: string;
  content: string;
  author: string;
  author_id: string;
  category: string;
  replies: number;
  lastActivity: string;
  isPinned: boolean;
  tags: string[];
  views_count: number;
  replies_count: number;
  created_at: string;
}

interface Comment {
  id: string;
  author: string;
  author_id: string;
  content: string;
  timestamp: string;
  likes: number;
  created_at: string;
  replies?: Comment[];
}

export default function Discussions() {
  const { language, user } = useAuth();
  const { isModuleEnabled, enabledModules } = useModuleAccess();
  const { toast } = useToast();
  
  // Enhanced state management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSortBy, setSelectedSortBy] = useState("latest");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDiscussions, setTotalDiscussions] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const discussionsPerPage = 15;
  
  // Debounced search
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const [newDiscussion, setNewDiscussion] = useState({
    title: "",
    content: "",
    category: "",
    tags: "",
  });

  const text = {
    en: {
      title: "Community Discussions",
      subtitle: "Connect with your neighbors and discuss community topics",
      newDiscussion: "New Discussion",
      search: "Search discussions...",
      category: "Category",
      allCategories: "All Categories",
      sortBy: "Sort By",
      latest: "Latest",
      oldest: "Oldest",
      mostReplies: "Most Replies",
      mostViews: "Most Views",
      general: "General",
      maintenance: "Maintenance",
      events: "Events",
      safety: "Safety",
      suggestions: "Suggestions",
      pinned: "Pinned",
      replies: "replies",
      views: "views",
      lastActivity: "Last activity",
      createTitle: "Create New Discussion",
      createSubtitle: "Start a conversation with your community",
      discussionTitle: "Discussion Title",
      discussionContent: "Content",
      selectCategory: "Select Category",
      tags: "Tags (comma separated)",
      create: "Create Discussion",
      cancel: "Cancel",
      createSuccess: "Discussion created successfully!",
      backToDiscussions: "Back to Discussions",
      comments: "Comments",
      addComment: "Add Comment",
      postComment: "Post Comment",
      writeComment: "Write your comment...",
      like: "Like",
      reply: "Reply",
      showingResults: "Showing",
      of: "of",
      results: "discussions",
      noResults: "No discussions found",
      noResultsDesc: "Try adjusting your search or filter criteria",
      page: "Page",
      previous: "Previous",
      next: "Next",
      refresh: "Refresh"
    },
    ms: {
      title: "Perbincangan Komuniti",
      subtitle: "Berhubung dengan jiran dan bincangkan topik komuniti",
      newDiscussion: "Perbincangan Baru",
      search: "Cari perbincangan...",
      category: "Kategori",
      allCategories: "Semua Kategori",
      sortBy: "Susun Mengikut",
      latest: "Terkini",
      oldest: "Terlama",
      mostReplies: "Paling Banyak Balasan",
      mostViews: "Paling Banyak Tontonan",
      general: "Umum",
      maintenance: "Penyelenggaraan",
      events: "Acara",
      safety: "Keselamatan",
      suggestions: "Cadangan",
      pinned: "Disematkan",
      replies: "balasan",
      views: "tontonan",
      lastActivity: "Aktiviti terakhir",
      createTitle: "Cipta Perbincangan Baru",
      createSubtitle: "Mulakan perbualan dengan komuniti anda",
      discussionTitle: "Tajuk Perbincangan",
      discussionContent: "Kandungan",
      selectCategory: "Pilih Kategori",
      tags: "Tag (dipisahkan koma)",
      create: "Cipta Perbincangan",
      cancel: "Batal",
      createSuccess: "Perbincangan berjaya dicipta!",
      backToDiscussions: "Kembali ke Perbincangan",
      comments: "Komen",
      addComment: "Tambah Komen",
      postComment: "Hantar Komen",
      writeComment: "Tulis komen anda...",
      like: "Suka",
      reply: "Balas",
      showingResults: "Menunjukkan",
      of: "daripada",
      results: "perbincangan",
      noResults: "Tiada perbincangan dijumpai",
      noResultsDesc: "Cuba laraskan kriteria carian atau penapis anda",
      page: "Halaman",
      previous: "Sebelumnya",
      next: "Seterusnya",
      refresh: "Muat Semula"
    },
  };

  const t = text[language];

  // Compute stable discussionsEnabled boolean
  const discussionsEnabled = enabledModules.some(module => module.module_name === 'discussions');

  // Enhanced fetch function with server-side pagination and filtering
  const fetchDiscussions = useCallback(async (page = 1, search = '', category = 'all', sortBy = 'latest') => {
    console.log('fetchDiscussions called with:', { page, search, category, sortBy });
    
    if (!discussionsEnabled) {
      console.log('Discussions module not enabled, skipping fetch');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(page === 1);
      
      // Save scroll position before fetch
      setScrollPosition(window.scrollY);
      
      // Build query
      let query = supabase
        .from('discussions')
        .select(`
          *,
          author_profile:profiles!discussions_author_id_fkey (
            full_name,
            email
          ),
          reply_count:discussion_replies(count)
        `, { count: 'exact' });

      // Apply search filter
      if (search.trim()) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,category.ilike.%${search}%`);
      }

      // Apply category filter
      if (category !== 'all') {
        query = query.eq('category', category);
      }

      // Apply sorting
      switch (sortBy) {
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'mostReplies':
          query = query.order('replies_count', { ascending: false });
          break;
        case 'mostViews':
          query = query.order('views_count', { ascending: false });
          break;
        case 'latest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Apply pagination
      const from = (page - 1) * discussionsPerPage;
      const to = from + discussionsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Transform Supabase data to match our interface
      let transformedDiscussions: Discussion[] = (data || []).map((discussion) => ({
        id: discussion.id,
        title: discussion.title,
        content: discussion.content,
        author: discussion.author_profile?.full_name || 
                discussion.author_profile?.email || 
                "Anonymous",
        author_id: discussion.author_id,
        category: discussion.category,
        replies: discussion.reply_count?.[0]?.count || 0,
        lastActivity: discussion.last_reply_at
          ? new Date(discussion.last_reply_at).toLocaleDateString()
          : new Date(discussion.created_at).toLocaleDateString(),
        isPinned: discussion.is_pinned || false,
        tags: (discussion as any).tags || [], // Safe fallback for tags
        views_count: discussion.views_count || 0,
        replies_count: discussion.reply_count?.[0]?.count || 0,
        created_at: discussion.created_at,
      }));

      // Use database data or demo data if database is empty
      if (transformedDiscussions.length === 0 && page === 1 && !search && category === 'all') {
        const demoDiscussions = [
          {
            id: '1',
            title: language === 'en' ? 'Welcome to Community Discussions' : 'Selamat Datang ke Perbincangan Komuniti',
            content: language === 'en' 
              ? 'This is a space for residents to connect, share ideas, and discuss community matters. Feel free to start new discussions!'
              : 'Ini adalah ruang untuk penduduk berhubung, berkongsi idea, dan membincangkan hal komuniti. Sila mulakan perbincangan baru!',
            author: 'Community Admin',
            author_id: 'admin',
            category: 'general',
            replies: 5,
            lastActivity: new Date().toLocaleDateString(),
            isPinned: true,
            tags: ['welcome', 'community'],
            views_count: 125,
            replies_count: 5,
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            title: language === 'en' ? 'Pool Maintenance Schedule' : 'Jadual Penyelenggaraan Kolam',
            content: language === 'en'
              ? 'The swimming pool will be under maintenance from 8 AM to 12 PM tomorrow. Please plan accordingly.'
              : 'Kolam renang akan menjalani penyelenggaraan dari 8 pagi hingga 12 tengah hari esok. Sila merancang dengan sewajarnya.',
            author: 'Maintenance Team',
            author_id: 'maintenance',
            category: 'maintenance',
            replies: 3,
            lastActivity: new Date(Date.now() - 86400000).toLocaleDateString(),
            isPinned: false,
            tags: ['pool', 'maintenance'],
            views_count: 87,
            replies_count: 3,
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: '3',
            title: language === 'en' ? 'Community BBQ Event Planning' : 'Perancangan Acara BBQ Komuniti',
            content: language === 'en'
              ? 'Would anyone be interested in organizing a community BBQ event next month? Let\'s discuss ideas and volunteers!'
              : 'Adakah sesiapa berminat menganjurkan acara BBQ komuniti bulan depan? Mari bincangkan idea dan sukarelawan!',
            author: 'Sarah Johnson',
            author_id: 'user1',
            category: 'events',
            replies: 12,
            lastActivity: new Date(Date.now() - 172800000).toLocaleDateString(),
            isPinned: false,
            tags: ['bbq', 'events', 'community'],
            views_count: 156,
            replies_count: 12,
            created_at: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            id: '4',
            title: language === 'en' ? 'Security Concern - Gate Access' : 'Kebimbangan Keselamatan - Akses Pintu Pagar',
            content: language === 'en'
              ? 'I\'ve noticed the main gate has been left open several times recently. This could be a security issue.'
              : 'Saya perasan pintu pagar utama telah dibiarkan terbuka beberapa kali baru-baru ini. Ini boleh menjadi isu keselamatan.',
            author: 'Ahmad Rahman',
            author_id: 'user2',
            category: 'safety',
            replies: 8,
            lastActivity: new Date(Date.now() - 259200000).toLocaleDateString(),
            isPinned: false,
            tags: ['security', 'gate', 'safety'],
            views_count: 203,
            replies_count: 8,
            created_at: new Date(Date.now() - 259200000).toISOString(),
          }
        ];
        
        // Apply filters to demo data
        let filteredDemo = demoDiscussions;
        if (search.trim()) {
          filteredDemo = filteredDemo.filter(discussion =>
            discussion.title.toLowerCase().includes(search.toLowerCase()) ||
            discussion.content.toLowerCase().includes(search.toLowerCase()) ||
            discussion.category.toLowerCase().includes(search.toLowerCase())
          );
        }
        if (category !== 'all') {
          filteredDemo = filteredDemo.filter(discussion => discussion.category === category);
        }
        
        // Apply sorting to demo data
        switch (sortBy) {
          case 'oldest':
            filteredDemo.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            break;
          case 'mostReplies':
            filteredDemo.sort((a, b) => b.replies_count - a.replies_count);
            break;
          case 'mostViews':
            filteredDemo.sort((a, b) => b.views_count - a.views_count);
            break;
          case 'latest':
          default:
            filteredDemo.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            break;
        }
        
        setDiscussions(filteredDemo);
        setTotalDiscussions(filteredDemo.length);
        setTotalPages(Math.ceil(filteredDemo.length / discussionsPerPage));
      } else {
        setDiscussions(transformedDiscussions);
        setTotalDiscussions(count || 0);
        setTotalPages(Math.ceil((count || 0) / discussionsPerPage));
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load discussions. Please try again.'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
      
      // Restore scroll position after a short delay
      setTimeout(() => {
        window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
      }, 100);
    }
  }, [discussionsEnabled, language, toast, scrollPosition]);

  // Enhanced search and filter handlers - MOVED BEFORE CONDITIONAL LOGIC
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSelectedSortBy(value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleRefresh = useCallback(() => {
    setCurrentPage(1);
    fetchDiscussions(1, debouncedSearchTerm, selectedCategory, selectedSortBy);
  }, [fetchDiscussions, debouncedSearchTerm, selectedCategory, selectedSortBy]);

  // Computed values for display
  const displayedDiscussions = useMemo(() => discussions, [discussions]);

  // Enhanced effect to handle debounced search and pagination
  useEffect(() => {
    fetchDiscussions(currentPage, debouncedSearchTerm, selectedCategory, selectedSortBy);
  }, [fetchDiscussions, currentPage, debouncedSearchTerm, selectedCategory, selectedSortBy]);

  const categories = [
    { value: 'all', label: t.allCategories },
    { value: 'general', label: t.general },
    { value: 'maintenance', label: t.maintenance },
    { value: 'events', label: t.events },
    { value: 'safety', label: t.safety },
    { value: 'suggestions', label: t.suggestions }
  ];

  const sortOptions = [
    { value: 'latest', label: t.latest },
    { value: 'oldest', label: t.oldest },
    { value: 'mostReplies', label: t.mostReplies },
    { value: 'mostViews', label: t.mostViews }
  ];

  // Check if discussions module is enabled - CONDITIONAL RENDERING INSTEAD OF EARLY RETURN
  if (!discussionsEnabled) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Module Disabled</h3>
            <p className="text-sm text-muted-foreground">
              The Discussions module is not enabled for this community.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return language === 'en' ? 'Yesterday' : 'Semalam';
    } else if (diffDays < 7) {
      return language === 'en' ? `${diffDays} days ago` : `${diffDays} hari lalu`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'events': return 'bg-green-100 text-green-800';
      case 'safety': return 'bg-red-100 text-red-800';
      case 'suggestions': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateDiscussion = async () => {
    if (!user) return;

    if (!newDiscussion.title.trim() || !newDiscussion.content.trim() || !newDiscussion.category) {
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Missing Information' : 'Maklumat Kurang',
        description: language === 'en' 
          ? 'Please fill in all required fields.'
          : 'Sila isikan semua medan yang diperlukan.'
      });
      return;
    }

    setSubmitting(true);
    try {
      const tagsArray = newDiscussion.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const { error } = await supabase
        .from('discussions')
        .insert({
          title: newDiscussion.title.trim(),
          content: newDiscussion.content.trim(),
          category: newDiscussion.category,
          tags: tagsArray,
          author_id: user.id,
          views_count: 0,
          replies_count: 0
        });

      if (error) throw error;

      toast({
        title: t.createSuccess,
        description: language === 'en' 
          ? 'Your discussion has been created and is now visible to the community.'
          : 'Perbincangan anda telah dicipta dan kini boleh dilihat oleh komuniti.'
      });

      setIsCreateOpen(false);
      setNewDiscussion({ title: '', content: '', category: '', tags: '' });
      handleRefresh();
    } catch (error) {
      console.error('Error creating discussion:', error);
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Creation Failed' : 'Gagal Mencipta',
        description: language === 'en' 
          ? 'Failed to create discussion. Please try again.'
          : 'Gagal mencipta perbincangan. Sila cuba lagi.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // If viewing a specific discussion, show the discussion detail view
  if (selectedDiscussion) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => setSelectedDiscussion(null)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.backToDiscussions}
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {selectedDiscussion.isPinned && (
                  <div className="flex items-center gap-2 mb-2">
                    <Pin className="h-4 w-4 text-yellow-600" />
                    <Badge variant="secondary">{t.pinned}</Badge>
                  </div>
                )}
                <CardTitle className="text-2xl">{selectedDiscussion.title}</CardTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>By {selectedDiscussion.author}</span>
                  <span>{formatDate(selectedDiscussion.created_at)}</span>
                  <Badge className={getCategoryColor(selectedDiscussion.category)}>
                    {categories.find(cat => cat.value === selectedDiscussion.category)?.label}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none mb-6">
              <p className="whitespace-pre-wrap">{selectedDiscussion.content}</p>
            </div>
            
            {selectedDiscussion.tags.length > 0 && (
              <div className="flex items-center gap-2 mb-6">
                {selectedDiscussion.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{selectedDiscussion.replies} {t.replies}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{selectedDiscussion.views_count} {t.views}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments section would go here */}
        <Card>
          <CardHeader>
            <CardTitle>{t.comments}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder={t.writeComment}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button onClick={() => {}} disabled={!newComment.trim()}>
                {t.postComment}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {refreshing ? 'Refreshing...' : t.refresh}
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t.newDiscussion}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{t.createTitle}</DialogTitle>
                <DialogDescription>{t.createSubtitle}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">{t.discussionTitle}</Label>
                  <Input
                    id="title"
                    placeholder={t.discussionTitle}
                    value={newDiscussion.title}
                    onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">{t.category}</Label>
                  <Select
                    value={newDiscussion.category}
                    onValueChange={(value) => setNewDiscussion(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectCategory} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(cat => cat.value !== 'all').map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">{t.discussionContent}</Label>
                  <Textarea
                    id="content"
                    placeholder={t.discussionContent}
                    rows={4}
                    value={newDiscussion.content}
                    onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">{t.tags}</Label>
                  <Input
                    id="tags"
                    placeholder={t.tags}
                    value={newDiscussion.tags}
                    onChange={(e) => setNewDiscussion(prev => ({ ...prev, tags: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    {t.cancel}
                  </Button>
                  <Button onClick={handleCreateDiscussion} disabled={submitting}>
                    {submitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    {t.create}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedSortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t.sortBy} />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted animate-pulse rounded" />
                  <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : displayedDiscussions.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground mb-2">{t.noResults}</h3>
          <p className="text-sm text-muted-foreground">{t.noResultsDesc}</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <span>
              {t.showingResults} {((currentPage - 1) * discussionsPerPage) + 1}-{Math.min(currentPage * discussionsPerPage, totalDiscussions)} {t.of} {totalDiscussions} {t.results}
            </span>
          </div>
          
          <div className="space-y-4">
            {displayedDiscussions.map((discussion) => (
              <Card 
                key={discussion.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedDiscussion(discussion)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {discussion.isPinned && (
                          <Pin className="h-4 w-4 text-yellow-600" />
                        )}
                        <Badge className={getCategoryColor(discussion.category)}>
                          {categories.find(cat => cat.value === discussion.category)?.label}
                        </Badge>
                        {discussion.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      <CardTitle className="text-lg hover:text-primary transition-colors">
                        {discussion.title}
                      </CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {discussion.content}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>By {discussion.author}</span>
                      <span>{formatDate(discussion.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{discussion.replies} {t.replies}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{discussion.views_count} {t.views}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t.previous}
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  if (totalPages <= 5) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  }
                  // Smart pagination logic (same as Facilities)
                  if (currentPage <= 3) {
                    if (page <= 3) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === 4) {
                      return <span key="ellipsis1">...</span>;
                    } else if (page === 5) {
                      return (
                        <Button
                          key={totalPages}
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(totalPages)}
                        >
                          {totalPages}
                        </Button>
                      );
                    }
                  } else if (currentPage >= totalPages - 2) {
                    if (page === 1) {
                      return (
                        <Button
                          key={1}
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(1)}
                        >
                          1
                        </Button>
                      );
                    } else if (page === 2) {
                      return <span key="ellipsis2">...</span>;
                    } else if (page >= 3) {
                      const actualPage = totalPages - 5 + page;
                      return (
                        <Button
                          key={actualPage}
                          variant={currentPage === actualPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(actualPage)}
                        >
                          {actualPage}
                        </Button>
                      );
                    }
                  } else {
                    if (page === 1) {
                      return (
                        <Button
                          key={1}
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(1)}
                        >
                          1
                        </Button>
                      );
                    } else if (page === 2) {
                      return <span key="ellipsis3">...</span>;
                    } else if (page === 3) {
                      return (
                        <Button
                          key={currentPage}
                          variant="default"
                          size="sm"
                          onClick={() => handlePageChange(currentPage)}
                        >
                          {currentPage}
                        </Button>
                      );
                    } else if (page === 4) {
                      return <span key="ellipsis4">...</span>;
                    } else if (page === 5) {
                      return (
                        <Button
                          key={totalPages}
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(totalPages)}
                        >
                          {totalPages}
                        </Button>
                      );
                    }
                  }
                  return null;
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                {t.next}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
