import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { MessageSquare, Plus, Edit, Trash2, Pin, Users, Eye, MessageCircle, Search, Filter, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

interface Discussion {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  created_date: string;
  last_activity: string;
  replies: number;
  views: number;
  is_pinned: boolean;
  is_locked: boolean;
  status: 'active' | 'locked' | 'archived' | 'hidden';
  tags: string[];
  community_id: string;
  community_name: string;
}

interface Reply {
  id: string;
  discussion_id: string;
  content: string;
  author: string;
  created_date: string;
  parent_reply_id?: string;
  is_approved: boolean;
}

export default function DiscussionManagement() {
  const { language } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([
    {
      id: '1',
      title: 'Community Garden Initiative',
      content: 'I propose we start a community garden in the empty lot next to the playground. This would be a great way to bring residents together and provide fresh produce.',
      category: 'Community Projects',
      author: 'Sarah Chen',
      created_date: '2024-01-15',
      last_activity: '2024-01-20',
      replies: 15,
      views: 234,
      is_pinned: true,
      is_locked: false,
      status: 'active',
      tags: ['gardening', 'community', 'environment'],
      community_id: '1',
      community_name: 'Taman Harmony'
    },
    {
      id: '2',
      title: 'Noise Complaints - Construction Hours',
      content: 'There have been several complaints about construction work starting too early. Can we establish clearer guidelines for construction hours?',
      category: 'Issues & Complaints',
      author: 'Ahmad Rahman',
      created_date: '2024-01-12',
      last_activity: '2024-01-18',
      replies: 28,
      views: 456,
      is_pinned: false,
      is_locked: false,
      status: 'active',
      tags: ['noise', 'construction', 'guidelines'],
      community_id: '1',
      community_name: 'Taman Harmony'
    },
    {
      id: '3',
      title: 'Security Patrol Schedule',
      content: 'Discussion about the new security patrol schedule and feedback from residents.',
      category: 'Security',
      author: 'John Doe',
      created_date: '2024-01-10',
      last_activity: '2024-01-15',
      replies: 12,
      views: 189,
      is_pinned: false,
      is_locked: true,
      status: 'locked',
      tags: ['security', 'patrol', 'schedule'],
      community_id: '1',
      community_name: 'Taman Harmony'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const text = {
    en: {
      title: 'Discussion Management',
      description: 'Manage community discussions and forum moderation',
      createNew: 'Create Discussion',
      search: 'Search discussions...',
      filterCategory: 'Filter by Category',
      filterStatus: 'Filter by Status',
      all: 'All',
      active: 'Active',
      locked: 'Locked',
      archived: 'Archived',
      hidden: 'Hidden',
      pinned: 'Pinned',
      locked_: 'Locked',
      replies: 'Replies',
      views: 'Views',
      edit: 'Edit',
      delete: 'Delete',
      lock: 'Lock',
      unlock: 'Unlock',
      pin: 'Pin',
      unpin: 'Unpin',
      hide: 'Hide',
      approve: 'Approve',
      discussionTitle: 'Title',
      content: 'Content',
      category: 'Category',
      tags: 'Tags',
      community: 'Community',
      pinDiscussion: 'Pin Discussion',
      lockDiscussion: 'Lock Discussion',
      save: 'Save',
      cancel: 'Cancel',
      author: 'Author',
      lastActivity: 'Last Activity',
      statistics: 'Statistics',
      totalDiscussions: 'Total Discussions',
      activeToday: 'Active Today',
      totalReplies: 'Total Replies',
      avgReplies: 'Avg Replies',
      moderationQueue: 'Moderation Queue',
      reportedContent: 'Reported Content',
      pendingApproval: 'Pending Approval'
    },
    ms: {
      title: 'Pengurusan Perbincangan',
      description: 'Urus perbincangan komuniti dan moderasi forum',
      createNew: 'Cipta Perbincangan',
      search: 'Cari perbincangan...',
      filterCategory: 'Tapis mengikut Kategori',
      filterStatus: 'Tapis mengikut Status',
      all: 'Semua',
      active: 'Aktif',
      locked: 'Dikunci',
      archived: 'Diarkibkan',
      hidden: 'Disembunyikan',
      pinned: 'Disematkan',
      locked_: 'Dikunci',
      replies: 'Balasan',
      views: 'Tontonan',
      edit: 'Sunting',
      delete: 'Padam',
      lock: 'Kunci',
      unlock: 'Buka Kunci',
      pin: 'Sematkan',
      unpin: 'Nyah Sematkan',
      hide: 'Sembunyikan',
      approve: 'Luluskan',
      discussionTitle: 'Tajuk',
      content: 'Kandungan',
      category: 'Kategori',
      tags: 'Tag',
      community: 'Komuniti',
      pinDiscussion: 'Sematkan Perbincangan',
      lockDiscussion: 'Kunci Perbincangan',
      save: 'Simpan',
      cancel: 'Batal',
      author: 'Pengarang',
      lastActivity: 'Aktiviti Terakhir',
      statistics: 'Statistik',
      totalDiscussions: 'Jumlah Perbincangan',
      activeToday: 'Aktif Hari Ini',
      totalReplies: 'Jumlah Balasan',
      avgReplies: 'Purata Balasan',
      moderationQueue: 'Baris Gilir Moderasi',
      reportedContent: 'Kandungan Dilaporkan',
      pendingApproval: 'Menunggu Kelulusan'
    }
  };

  const t = text[language] || text.en;

  const categories = ['Community Projects', 'Issues & Complaints', 'Security', 'Facilities', 'Events', 'General'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'locked': return 'bg-yellow-500';
      case 'archived': return 'bg-gray-500';
      case 'hidden': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discussion.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discussion.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || discussion.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || discussion.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleTogglePin = (id: string) => {
    setDiscussions(discussions.map(discussion =>
      discussion.id === id 
        ? { ...discussion, is_pinned: !discussion.is_pinned }
        : discussion
    ));
    toast.success('Discussion pin status updated');
  };

  const handleToggleLock = (id: string) => {
    setDiscussions(discussions.map(discussion =>
      discussion.id === id 
        ? { 
            ...discussion, 
            is_locked: !discussion.is_locked,
            status: discussion.is_locked ? 'active' : 'locked'
          }
        : discussion
    ));
    toast.success('Discussion lock status updated');
  };

  const handleDelete = (id: string) => {
    setDiscussions(discussions.filter(discussion => discussion.id !== id));
    toast.success('Discussion deleted successfully');
  };

  const stats = {
    total: discussions.length,
    activeToday: discussions.filter(d => d.status === 'active' && d.last_activity === new Date().toISOString().split('T')[0]).length,
    totalReplies: discussions.reduce((sum, d) => sum + d.replies, 0),
    avgReplies: Math.round(discussions.reduce((sum, d) => sum + d.replies, 0) / discussions.length)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground">{t.description}</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t.createNew}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t.createNew}</DialogTitle>
              <DialogDescription>Create a new discussion topic</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">{t.discussionTitle}</Label>
                <Input id="title" />
              </div>
              <div>
                <Label htmlFor="content">{t.content}</Label>
                <Textarea id="content" rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t.category}</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t.tags}</Label>
                  <Input placeholder="Enter tags separated by commas" />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch />
                  <Label>{t.pinDiscussion}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch />
                  <Label>{t.lockDiscussion}</Label>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>{t.cancel}</Button>
                <Button>{t.save}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalDiscussions}</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.activeToday}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalReplies}</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReplies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.avgReplies}</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgReplies}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
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
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t.filterCategory} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.all}</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t.filterStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.all}</SelectItem>
            <SelectItem value="active">{t.active}</SelectItem>
            <SelectItem value="locked">{t.locked}</SelectItem>
            <SelectItem value="archived">{t.archived}</SelectItem>
            <SelectItem value="hidden">{t.hidden}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Discussions List */}
      <div className="space-y-4">
        {filteredDiscussions.map((discussion) => (
          <Card key={discussion.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{discussion.title}</CardTitle>
                    {discussion.is_pinned && (
                      <Pin className="w-4 h-4 text-blue-500" />
                    )}
                    {discussion.is_locked && (
                      <Badge variant="outline" className="text-yellow-600">
                        {t.locked_}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>By {discussion.author}</span>
                    <span>•</span>
                    <span>{discussion.created_date}</span>
                    <span>•</span>
                    <span>{discussion.community_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusColor(discussion.status)} text-white`}>
                      {t[discussion.status as keyof typeof t] || discussion.status}
                    </Badge>
                    <Badge variant="outline">{discussion.category}</Badge>
                    {discussion.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePin(discussion.id)}
                  >
                    <Pin className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleLock(discussion.id)}
                  >
                    {discussion.is_locked ? t.unlock : t.lock}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(discussion.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{discussion.content}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{discussion.replies} {t.replies}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{discussion.views} {t.views}</span>
                </div>
                <span>{t.lastActivity}: {discussion.last_activity}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDiscussions.length === 0 && (
        <Card>
          <CardContent className="text-center py-10">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No discussions found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}