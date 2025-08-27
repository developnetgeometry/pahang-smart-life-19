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
import { Bell, Plus, Edit, Trash2, Pin, Users, MapPin, Building2, Search, Filter, Upload, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  target_audience: 'state' | 'district' | 'community' | 'all';
  target_location?: string;
  created_date: string;
  author: string;
  is_pinned: boolean;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  scheduled_date?: string;
  views: number;
  engagement: number;
  image_url?: string;
}

export default function AnnouncementManagement() {
  const { language } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: '1',
      title: 'Scheduled Maintenance - Water Supply',
      content: 'Water supply will be temporarily disrupted on Saturday from 2 PM to 6 PM for routine maintenance.',
      priority: 'high',
      category: 'Maintenance',
      target_audience: 'community',
      target_location: 'Taman Harmony',
      created_date: '2024-01-15',
      author: 'Maintenance Team',
      is_pinned: true,
      status: 'published',
      views: 342,
      engagement: 28
    },
    {
      id: '2',
      title: 'New Recreational Facilities',
      content: 'New playground and fitness equipment have been installed at the community park.',
      priority: 'medium',
      category: 'Facilities',
      target_audience: 'community',
      target_location: 'Taman Harmony',
      created_date: '2024-01-10',
      author: 'Community Manager',
      is_pinned: false,
      status: 'published',
      views: 567,
      engagement: 45
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    priority: 'medium' as const,
    category: '',
    target_audience: 'community' as const,
    target_location: '',
      is_pinned: false,
      status: 'published' as const,
      scheduled_date: '',
      image_url: ''
  });

  const text = {
    en: {
      title: 'Announcement Management',
      description: 'Manage community announcements and notifications',
      createNew: 'Create Announcement',
      search: 'Search announcements...',
      filterStatus: 'Filter by Status',
      filterPriority: 'Filter by Priority',
      all: 'All',
      draft: 'Draft',
      published: 'Published',
      scheduled: 'Scheduled',
      archived: 'Archived',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent',
      views: 'Views',
      engagement: 'Engagement',
      pinned: 'Pinned',
      edit: 'Edit',
      delete: 'Delete',
      togglePin: 'Toggle Pin',
      announcementTitle: 'Title',
      content: 'Content',
      priority: 'Priority',
      category: 'Category',
      targetAudience: 'Target Audience',
      targetLocation: 'Target Location',
      pinAnnouncement: 'Pin Announcement',
      status: 'Status',
      scheduledDate: 'Scheduled Date',
      save: 'Save',
      cancel: 'Cancel',
      state: 'State',
      district: 'District',
      community: 'Community',
      statistics: 'Statistics',
      totalAnnouncements: 'Total Announcements',
      publishedToday: 'Published Today',
      totalViews: 'Total Views',
      avgEngagement: 'Avg Engagement',
      imageUpload: 'Upload Image',
      selectImage: 'Select Image File'
    },
    ms: {
      title: 'Pengurusan Pengumuman',
      description: 'Urus pengumuman dan notifikasi komuniti',
      createNew: 'Cipta Pengumuman',
      search: 'Cari pengumuman...',
      filterStatus: 'Tapis mengikut Status',
      filterPriority: 'Tapis mengikut Keutamaan',
      all: 'Semua',
      draft: 'Draf',
      published: 'Diterbitkan',
      scheduled: 'Dijadualkan',
      archived: 'Diarkibkan',
      low: 'Rendah',
      medium: 'Sederhana',
      high: 'Tinggi',
      urgent: 'Mendesak',
      views: 'Tontonan',
      engagement: 'Penglibatan',
      pinned: 'Disematkan',
      edit: 'Sunting',
      delete: 'Padam',
      togglePin: 'Tukar Pin',
      announcementTitle: 'Tajuk',
      content: 'Kandungan',
      priority: 'Keutamaan',
      category: 'Kategori',
      targetAudience: 'Sasaran Audiens',
      targetLocation: 'Lokasi Sasaran',
      pinAnnouncement: 'Sematkan Pengumuman',
      status: 'Status',
      scheduledDate: 'Tarikh Dijadualkan',
      save: 'Simpan',
      cancel: 'Batal',
      state: 'Negeri',
      district: 'Daerah',
      community: 'Komuniti',
      statistics: 'Statistik',
      totalAnnouncements: 'Jumlah Pengumuman',
      publishedToday: 'Diterbitkan Hari Ini',
      totalViews: 'Jumlah Tontonan',
      avgEngagement: 'Purata Penglibatan',
      imageUpload: 'Muat Naik Gambar',
      selectImage: 'Pilih Fail Gambar'
    }
  };

  const t = text[language] || text.en;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500';
      case 'draft': return 'bg-gray-500';
      case 'scheduled': return 'bg-blue-500';
      case 'archived': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || announcement.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || announcement.priority === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleCreateAnnouncement = () => {
    const announcement: Announcement = {
      id: Date.now().toString(),
      ...newAnnouncement,
      created_date: new Date().toISOString().split('T')[0],
      author: 'Admin',
      views: 0,
      engagement: 0
    };

    setAnnouncements([...announcements, announcement]);
    setIsCreateDialogOpen(false);
    setNewAnnouncement({
      title: '',
      content: '',
      priority: 'medium',
      category: '',
      target_audience: 'community',
      target_location: '',
      is_pinned: false,
      status: 'published',
      scheduled_date: '',
      image_url: ''
    });
    toast.success('Announcement created successfully');
  };

  const handleTogglePin = (id: string) => {
    setAnnouncements(announcements.map(announcement =>
      announcement.id === id 
        ? { ...announcement, is_pinned: !announcement.is_pinned }
        : announcement
    ));
    toast.success('Announcement pin status updated');
  };

  const handleDelete = (id: string) => {
    setAnnouncements(announcements.filter(announcement => announcement.id !== id));
    toast.success('Announcement deleted successfully');
  };

  const stats = {
    total: announcements.length,
    publishedToday: announcements.filter(a => a.status === 'published' && a.created_date === new Date().toISOString().split('T')[0]).length,
    totalViews: announcements.reduce((sum, a) => sum + a.views, 0),
    avgEngagement: Math.round(announcements.reduce((sum, a) => sum + a.engagement, 0) / announcements.length)
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For demo purposes, create a URL for preview
      const imageUrl = URL.createObjectURL(file);
      setNewAnnouncement({...newAnnouncement, image_url: imageUrl});
      // In production, you would upload to Supabase Storage here
    }
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
              <DialogDescription>Create a new announcement for the community</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">{t.announcementTitle}</Label>
                <Input
                  id="title"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="content">{t.content}</Label>
                <Textarea
                  id="content"
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                  rows={4}
                />
              </div>
              
              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label>{t.imageUpload}</Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Label
                      htmlFor="image-upload"
                      className="flex items-center gap-2 px-4 py-2 border border-input rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground"
                    >
                      <Upload className="w-4 h-4" />
                      {t.selectImage}
                    </Label>
                  </div>
                  {newAnnouncement.image_url && (
                    <div className="relative">
                      <img
                        src={newAnnouncement.image_url}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-md border"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={() => setNewAnnouncement({...newAnnouncement, image_url: ''})}
                      >
                        ×
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t.priority}</Label>
                  <Select value={newAnnouncement.priority} onValueChange={(value: any) => setNewAnnouncement({...newAnnouncement, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t.low}</SelectItem>
                      <SelectItem value="medium">{t.medium}</SelectItem>
                      <SelectItem value="high">{t.high}</SelectItem>
                      <SelectItem value="urgent">{t.urgent}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t.category}</Label>
                  <Input
                    value={newAnnouncement.category}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, category: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t.targetAudience}</Label>
                  <Select value={newAnnouncement.target_audience} onValueChange={(value: any) => setNewAnnouncement({...newAnnouncement, target_audience: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="state">{t.state}</SelectItem>
                      <SelectItem value="district">{t.district}</SelectItem>
                      <SelectItem value="community">{t.community}</SelectItem>
                      <SelectItem value="all">{t.all}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t.targetLocation}</Label>
                  <Input
                    value={newAnnouncement.target_location}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, target_location: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newAnnouncement.is_pinned}
                  onCheckedChange={(checked) => setNewAnnouncement({...newAnnouncement, is_pinned: checked})}
                />
                <Label>{t.pinAnnouncement}</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>{t.cancel}</Button>
                <Button onClick={handleCreateAnnouncement}>{t.save}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalAnnouncements}</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.publishedToday}</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalViews}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.avgEngagement}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgEngagement}%</div>
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
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t.filterStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.all}</SelectItem>
            <SelectItem value="draft">{t.draft}</SelectItem>
            <SelectItem value="published">{t.published}</SelectItem>
            <SelectItem value="scheduled">{t.scheduled}</SelectItem>
            <SelectItem value="archived">{t.archived}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t.filterPriority} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.all}</SelectItem>
            <SelectItem value="low">{t.low}</SelectItem>
            <SelectItem value="medium">{t.medium}</SelectItem>
            <SelectItem value="high">{t.high}</SelectItem>
            <SelectItem value="urgent">{t.urgent}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <Card key={announcement.id}>
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{announcement.title}</CardTitle>
                    {announcement.is_pinned && (
                      <Pin className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>By {announcement.author}</span>
                    <span>•</span>
                    <span>{announcement.created_date}</span>
                    <span>•</span>
                    <MapPin className="w-3 h-3" />
                    <span>{announcement.target_location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getPriorityColor(announcement.priority)} text-white`}>
                      {t[announcement.priority as keyof typeof t] || announcement.priority}
                    </Badge>
                    <Badge className={`${getStatusColor(announcement.status)} text-white`}>
                      {t[announcement.status as keyof typeof t] || announcement.status}
                    </Badge>
                    <Badge variant="outline">{announcement.category}</Badge>
                  </div>
                </div>
                
                {/* Image Preview */}
                {announcement.image_url && (
                  <div className="flex-shrink-0">
                    <img
                      src={announcement.image_url}
                      alt={announcement.title}
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePin(announcement.id)}
                  >
                    <Pin className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(announcement.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{announcement.content}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{announcement.views} {t.views}</span>
                <span>{announcement.engagement}% {t.engagement}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAnnouncements.length === 0 && (
        <Card>
          <CardContent className="text-center py-10">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No announcements found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}