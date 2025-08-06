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
import { MessageSquare, Plus, Search, Users, Clock, Pin } from 'lucide-react';
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

export default function Discussions() {
  const { language } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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
      createSuccess: 'Discussion created successfully!'
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
      createSuccess: 'Perbincangan berjaya dicipta!'
    }
  };

  const t = text[language];

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
          <Card key={discussion.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {discussion.isPinned && (
                      <Pin className="h-4 w-4 text-primary" />
                    )}
                    <CardTitle className="text-lg hover:text-primary cursor-pointer">
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