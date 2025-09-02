import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useModuleAccess } from '@/hooks/use-module-access';
import { supabase } from '@/integrations/supabase/client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Plus, Search, Users, Clock, Pin, ArrowLeft, Reply, ThumbsUp, Loader2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const { isModuleEnabled } = useModuleAccess();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    category: '',
    tags: ''
  });

  const text = {
    en: {
      title: 'Community Discussions',
      subtitle: 'Connect with your neighbors and discuss community topics',
      newDiscussion: 'New Discussion',
      search: 'Search discussions...',
      category: 'Category',
      allCategories: 'All Categories',
      general: 'General',
      maintenance: 'Maintenance',
      events: 'Events',
      safety: 'Safety',
      suggestions: 'Suggestions',
      pinned: 'Pinned',
      replies: 'replies',
      lastActivity: 'Last activity',
      createTitle: 'Create New Discussion',
      createSubtitle: 'Start a conversation with your community',
      discussionTitle: 'Discussion Title',
      discussionContent: 'Content',
      selectCategory: 'Select Category',
      tags: 'Tags (comma separated)',
      create: 'Create Discussion',
      cancel: 'Cancel',
      createSuccess: 'Discussion created successfully!',
      backToDiscussions: 'Back to Discussions',
      comments: 'Comments',
      addComment: 'Add Comment',
      postComment: 'Post Comment',
      writeComment: 'Write your comment...',
      like: 'Like',
      reply: 'Reply'
    },
    ms: {
      title: 'Perbincangan Komuniti',
      subtitle: 'Berhubung dengan jiran dan bincangkan topik komuniti',
      newDiscussion: 'Perbincangan Baru',
      search: 'Cari perbincangan...',
      category: 'Kategori',
      allCategories: 'Semua Kategori',
      general: 'Umum',
      maintenance: 'Penyelenggaraan',
      events: 'Acara',
      safety: 'Keselamatan',
      suggestions: 'Cadangan',
      pinned: 'Disematkan',
      replies: 'balasan',
      lastActivity: 'Aktiviti terakhir',
      createTitle: 'Cipta Perbincangan Baru',
      createSubtitle: 'Mulakan perbualan dengan komuniti anda',
      discussionTitle: 'Tajuk Perbincangan',
      discussionContent: 'Kandungan',
      selectCategory: 'Pilih Kategori',
      tags: 'Tag (dipisahkan koma)',
      create: 'Cipta Perbincangan',
      cancel: 'Batal',
      createSuccess: 'Perbincangan berjaya dicipta!',
      backToDiscussions: 'Kembali ke Perbincangan',
      comments: 'Komen',
      addComment: 'Tambah Komen',
      postComment: 'Hantar Komen',
      writeComment: 'Tulis komen anda...',
      like: 'Suka',
      reply: 'Balas'
    }
  };

  const t = text[language];

  // Check if discussions module is enabled
  if (!isModuleEnabled('discussions')) {
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

  // Fetch discussions from database
  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const { data, error } = await supabase
          .from('discussions')
          .select(`
            *,
            author_profile:profiles!discussions_author_id_fkey (
              full_name,
              email
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const transformedDiscussions: Discussion[] = (data || []).map(discussion => ({
          id: discussion.id,
          title: discussion.title,
          content: discussion.content,
          author: discussion.author_profile?.full_name || discussion.author_profile?.email || 'Anonymous',
          author_id: discussion.author_id,
          category: discussion.category,
          replies: discussion.replies_count || 0,
          lastActivity: discussion.last_reply_at 
            ? new Date(discussion.last_reply_at).toLocaleDateString()
            : new Date(discussion.created_at).toLocaleDateString(),
          isPinned: discussion.is_pinned,
          tags: [], // Could be enhanced
          views_count: discussion.views_count || 0,
          replies_count: discussion.replies_count || 0,
          created_at: discussion.created_at
        }));

        setDiscussions(transformedDiscussions);
      } catch (error) {
        console.error('Error fetching discussions:', error);
        toast({
          title: language === 'en' ? 'Error loading discussions' : 'Ralat memuatkan perbincangan',
          description: language === 'en' ? 'Please try again later' : 'Sila cuba lagi kemudian',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();

    // Set up real-time subscription
    const channel = supabase
      .channel('discussions-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'discussions'
      }, (payload) => {
        console.log('New discussion:', payload);
        // Add new discussion to the list
        if (payload.new) {
          const newDiscussion: Discussion = {
            id: payload.new.id,
            title: payload.new.title,
            content: payload.new.content,
            author: 'Loading...',
            author_id: payload.new.author_id,
            category: payload.new.category,
            replies: 0,
            lastActivity: new Date(payload.new.created_at).toLocaleDateString(),
            isPinned: payload.new.is_pinned,
            tags: [],
            views_count: 0,
            replies_count: 0,
            created_at: payload.new.created_at
          };
          setDiscussions(prev => [newDiscussion, ...prev]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [language, toast]);

  // Fetch comments for a discussion
  const fetchComments = async (discussionId: string) => {
    try {
      const { data, error } = await supabase
        .from('discussion_replies')
        .select(`
          *,
          profiles:author_id (
            full_name,
            email
          )
        `)
        .eq('discussion_id', discussionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const transformedComments: Comment[] = (data || []).map(reply => ({
        id: reply.id,
        author: reply.profiles?.full_name || reply.profiles?.email || 'Anonymous',
        author_id: reply.author_id,
        content: reply.content,
        timestamp: new Date(reply.created_at).toLocaleDateString(),
        likes: 0, // Could be enhanced with likes tracking
        created_at: reply.created_at
      }));

      setComments(prev => ({
        ...prev,
        [discussionId]: transformedComments
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };



  const categories = [
    { value: 'all', label: t.allCategories },
    { value: 'general', label: t.general },
    { value: 'maintenance', label: t.maintenance },
    { value: 'events', label: t.events },
    { value: 'safety', label: t.safety },
    { value: 'suggestions', label: t.suggestions }
  ];

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discussion.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || discussion.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateDiscussion = async () => {
    if (!user || !newDiscussion.title.trim() || !newDiscussion.content.trim() || !newDiscussion.category) {
      toast({
        title: language === 'en' ? 'Please fill in all required fields' : 'Sila isi semua medan yang diperlukan',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      // Get user's district_id from their profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('district_id')
        .eq('id', user.id)
        .single();

      const { data, error } = await supabase
        .from('discussions')
        .insert({
          title: newDiscussion.title,
          content: newDiscussion.content,
          category: newDiscussion.category,
          author_id: user.id,
          district_id: profile?.district_id
        })
        .select()
        .single();

      if (error) throw error;

      // Add the new discussion to the local state immediately
      const newDiscussionWithProfile: Discussion = {
        id: data.id,
        title: data.title,
        content: data.content,
        author: user.display_name || user.email || 'Anonymous',
        author_id: data.author_id,
        category: data.category,
        replies: 0,
        lastActivity: new Date(data.created_at).toLocaleDateString(),
        isPinned: data.is_pinned,
        tags: [],
        views_count: 0,
        replies_count: 0,
        created_at: data.created_at
      };

      // Add to the beginning of the discussions list
      setDiscussions(prev => [newDiscussionWithProfile, ...prev]);

      toast({
        title: t.createSuccess,
      });
      
      setIsCreateOpen(false);
      setNewDiscussion({ title: '', content: '', category: '', tags: '' });
    } catch (error) {
      console.error('Error creating discussion:', error);
      toast({
        title: language === 'en' ? 'Error creating discussion' : 'Ralat mencipta perbincangan',
        description: language === 'en' ? 'Please try again later' : 'Sila cuba lagi kemudian',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDiscussionClick = (discussion: Discussion) => {
    setSelectedDiscussion(discussion);
    // Load comments for this discussion if not already loaded
    if (!comments[discussion.id]) {
      fetchComments(discussion.id);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !selectedDiscussion || !user) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('discussion_replies')
        .insert({
          discussion_id: selectedDiscussion.id,
          content: newComment,
          author_id: user.id
        })
        .select(`
          *,
          profiles:author_id (
            full_name,
            email
          )
        `)
        .single();

      if (error) throw error;

      const newCommentObj: Comment = {
        id: data.id,
        author: data.profiles?.full_name || data.profiles?.email || 'Anonymous User',
        author_id: data.author_id,
        content: data.content,
        timestamp: 'just now',
        likes: 0,
        created_at: data.created_at
      };

      setComments(prev => ({
        ...prev,
        [selectedDiscussion.id]: [...(prev[selectedDiscussion.id] || []), newCommentObj]
      }));

      toast({
        title: language === 'en' ? 'Comment posted successfully!' : 'Komen berjaya dihantar!',
      });
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: language === 'en' ? 'Error posting comment' : 'Ralat menghantar komen',
        description: language === 'en' ? 'Please try again later' : 'Sila cuba lagi kemudian',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToDiscussions = () => {
    setSelectedDiscussion(null);
  };

  // If a discussion is selected, show the discussion details view
  if (selectedDiscussion) {
    const discussionComments = comments[selectedDiscussion.id] || [];
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBackToDiscussions}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.backToDiscussions}
          </Button>
        </div>

        {/* Discussion Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              {selectedDiscussion.isPinned && (
                <Pin className="h-4 w-4 text-primary" />
              )}
              <CardTitle className="text-2xl">{selectedDiscussion.title}</CardTitle>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-xs">
                    {selectedDiscussion.author.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span>{selectedDiscussion.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{t.lastActivity}: {selectedDiscussion.lastActivity}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-3">
              {selectedDiscussion.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed">{selectedDiscussion.content}</p>
          </CardContent>
        </Card>

        <Separator />

        {/* Comments Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {t.comments} ({discussionComments.length})
          </h2>

          {/* Add Comment */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Textarea
                  placeholder={t.writeComment}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button onClick={handlePostComment} disabled={!newComment.trim() || submitting}>
                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {t.postComment}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments List */}
          <div className="space-y-4">
            {discussionComments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-xs">
                        {comment.author.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.author}</span>
                        <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                      </div>
                      <p className="text-sm leading-relaxed mb-3">{comment.content}</p>
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          {t.like} ({comment.likes})
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                          <Reply className="h-3 w-3 mr-1" />
                          {t.reply}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {discussionComments.length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {language === 'en' ? 'No comments yet. Be the first to comment!' : 'Belum ada komen. Jadilah yang pertama berkomen!'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-8 bg-muted animate-pulse rounded mb-2 w-64"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-96"></div>
          </div>
          <div className="h-10 bg-muted animate-pulse rounded w-40"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 border rounded-lg">
              <div className="space-y-3">
                <div className="h-6 bg-muted animate-pulse rounded w-3/4"></div>
                <div className="h-4 bg-muted animate-pulse rounded w-full"></div>
                <div className="h-4 bg-muted animate-pulse rounded w-2/3"></div>
                <div className="flex gap-4">
                  <div className="h-3 bg-muted animate-pulse rounded w-20"></div>
                  <div className="h-3 bg-muted animate-pulse rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Main discussions list view
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t.newDiscussion}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
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
                <Select value={newDiscussion.category} onValueChange={(value) => setNewDiscussion(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectCategory} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map((category) => (
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
                  placeholder="community, event, planning"
                  value={newDiscussion.tags}
                  onChange={(e) => setNewDiscussion(prev => ({ ...prev, tags: e.target.value }))}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={submitting}>
                  {t.cancel}
                </Button>
                <Button onClick={handleCreateDiscussion} disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {t.create}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
      </div>

      <div className="space-y-4">
        {filteredDiscussions.map((discussion) => (
          <Card 
            key={discussion.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleDiscussionClick(discussion)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {discussion.isPinned && (
                      <Pin className="h-4 w-4 text-primary" />
                    )}
                    <CardTitle className="text-lg hover:text-primary">
                      {discussion.title}
                    </CardTitle>
                  </div>
                  <CardDescription>{discussion.content}</CardDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {discussion.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-xs">
                        {discussion.author.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span>{discussion.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{discussion.replies} {t.replies}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{t.lastActivity}: {discussion.lastActivity}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDiscussions.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {language === 'en' ? 'No discussions found' : 'Tiada perbincangan dijumpai'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
  );
}