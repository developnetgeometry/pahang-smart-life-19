import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
import { MessageSquare, Plus, Search, Users, Clock, Pin, ArrowLeft, Reply, ThumbsUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Discussion {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  replies: number;
  lastActivity: string;
  isPinned: boolean;
  tags: string[];
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  replies?: Comment[];
}

export default function Discussions() {
  const { language, user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Record<string, Comment[]>>({});

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

  const mockComments: Record<string, Comment[]> = {
    '1': [
      {
        id: '1',
        author: 'Alex Thompson',
        content: language === 'en' ? 'Great idea! I can help with the grilling setup.' : 'Idea yang bagus! Saya boleh bantu dengan persediaan pemanggang.',
        timestamp: '1 hour ago',
        likes: 5
      },
      {
        id: '2',
        author: 'Maria Garcia',
        content: language === 'en' ? 'Count me in! Should we create a sign-up sheet?' : 'Saya sertai! Haruskah kita buat senarai pendaftaran?',
        timestamp: '30 minutes ago',
        likes: 3
      }
    ],
    '2': [
      {
        id: '3',
        author: 'John Smith',
        content: language === 'en' ? 'Thanks for the update. What time will this happen?' : 'Terima kasih atas kemas kini. Pukul berapa ini akan berlaku?',
        timestamp: '2 hours ago',
        likes: 1
      }
    ],
    '3': [
      {
        id: '4',
        author: 'Lisa Brown',
        content: language === 'en' ? 'These measures are much needed. Good work!' : 'Langkah-langkah ini sangat diperlukan. Kerja yang bagus!',
        timestamp: '8 hours ago',
        likes: 7
      }
    ]
  };

  const mockDiscussions: Discussion[] = [
    {
      id: '1',
      title: language === 'en' ? 'Community BBQ Event Planning' : 'Perancangan Acara BBQ Komuniti',
      content: language === 'en' ? 'Let\'s plan our annual community BBQ event...' : 'Mari kita rancang acara BBQ tahunan komuniti kita...',
      author: 'Sarah Johnson',
      category: 'events',
      replies: 12,
      lastActivity: '2 hours ago',
      isPinned: true,
      tags: ['event', 'planning', 'community']
    },
    {
      id: '2',
      title: language === 'en' ? 'Elevator Maintenance Schedule' : 'Jadual Penyelenggaraan Lif',
      content: language === 'en' ? 'The elevator maintenance will be conducted...' : 'Penyelenggaraan lif akan dijalankan...',
      author: 'Mike Chen',
      category: 'maintenance',
      replies: 5,
      lastActivity: '4 hours ago',
      isPinned: false,
      tags: ['maintenance', 'elevator']
    },
    {
      id: '3',
      title: language === 'en' ? 'New Security Measures' : 'Langkah Keselamatan Baru',
      content: language === 'en' ? 'Discussion about implementing new security protocols...' : 'Perbincangan tentang pelaksanaan protokol keselamatan baru...',
      author: 'David Wong',
      category: 'safety',
      replies: 8,
      lastActivity: '1 day ago',
      isPinned: false,
      tags: ['security', 'safety']
    }
  ];

  const categories = [
    { value: 'all', label: t.allCategories },
    { value: 'general', label: t.general },
    { value: 'maintenance', label: t.maintenance },
    { value: 'events', label: t.events },
    { value: 'safety', label: t.safety },
    { value: 'suggestions', label: t.suggestions }
  ];

  const filteredDiscussions = mockDiscussions.filter(discussion => {
    const matchesSearch = discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discussion.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || discussion.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateDiscussion = () => {
    toast({
      title: t.createSuccess,
    });
    setIsCreateOpen(false);
  };

  const handleDiscussionClick = (discussion: Discussion) => {
    setSelectedDiscussion(discussion);
    // Initialize comments for this discussion if not already loaded
    if (!comments[discussion.id]) {
      setComments(prev => ({
        ...prev,
        [discussion.id]: mockComments[discussion.id] || []
      }));
    }
  };

  const handlePostComment = () => {
    if (newComment.trim() && selectedDiscussion) {
      const newCommentObj: Comment = {
        id: Date.now().toString(),
        author: user?.display_name || user?.email || 'Anonymous User',
        content: newComment,
        timestamp: 'just now',
        likes: 0
      };

      setComments(prev => ({
        ...prev,
        [selectedDiscussion.id]: [...(prev[selectedDiscussion.id] || []), newCommentObj]
      }));

      toast({
        title: language === 'en' ? 'Comment posted successfully!' : 'Komen berjaya dihantar!',
      });
      setNewComment('');
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
                  <Button onClick={handlePostComment} disabled={!newComment.trim()}>
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
                <Input id="title" placeholder={t.discussionTitle} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">{t.category}</Label>
                <Select>
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">{t.tags}</Label>
                <Input id="tags" placeholder="community, event, planning" />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  {t.cancel}
                </Button>
                <Button onClick={handleCreateDiscussion}>
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