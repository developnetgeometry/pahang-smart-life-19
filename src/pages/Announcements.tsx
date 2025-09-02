import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Megaphone, Calendar, Clock, Search, Pin, Bell, Loader2, Plus, BarChart3, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CreateAnnouncementModal from '@/components/announcements/CreateAnnouncementModal';
import PollComponent from '@/components/announcements/PollComponent';
import { useUserRoles } from '@/hooks/use-user-roles';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
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
}

export default function Announcements() {
  const { language, user } = useAuth();
  const { toast } = useToast();
  const { hasRole } = useUserRoles();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScope, setSelectedScope] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const canCreateAnnouncements = hasRole('community_admin') || hasRole('district_coordinator') || hasRole('state_admin');

  const text = {
    en: {
      title: 'Community Announcements',
      subtitle: 'Stay updated with important community information',
      search: 'Search announcements...',
      scope: 'Scope',
      category: 'Category',
      allScopes: 'All Scopes',
      allCategories: 'All Categories',
      state: 'State',
      district: 'District', 
      community: 'Community',
      general: 'General',
      maintenance: 'Maintenance',
      emergency: 'Emergency',
      event: 'Event',
      createAnnouncement: 'Create Announcement',
      pinned: 'Pinned',
      urgent: 'Urgent',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      readMore: 'Read More',
      showLess: 'Show Less',
      totalAnnouncements: 'Total Announcements',
      pinnedAnnouncements: 'Pinned',
      unreadAnnouncements: 'Unread',
      thisWeek: 'This Week',
      noAnnouncements: 'No announcements found',
      noAnnouncementsDesc: 'Try adjusting your search or filters',
      poll: 'Poll Available',
      hasPoll: 'This announcement includes a poll'
    },
    ms: {
      title: 'Pengumuman Komuniti',
      subtitle: 'Kekal dikemas kini dengan maklumat penting komuniti',
      search: 'Cari pengumuman...',
      scope: 'Skop',
      category: 'Kategori',
      allScopes: 'Semua Skop',
      allCategories: 'Semua Kategori',
      state: 'Negeri',
      district: 'Daerah',
      community: 'Komuniti',
      general: 'Umum',
      maintenance: 'Penyelenggaraan',
      emergency: 'Kecemasan',
      event: 'Acara',
      createAnnouncement: 'Cipta Pengumuman',
      pinned: 'Disematkan',
      urgent: 'Penting',
      high: 'Tinggi',
      medium: 'Sederhana',
      low: 'Rendah',
      readMore: 'Baca Lagi',
      showLess: 'Kurangkan',
      totalAnnouncements: 'Jumlah Pengumuman',
      pinnedAnnouncements: 'Disematkan',
      unreadAnnouncements: 'Belum Dibaca',
      thisWeek: 'Minggu Ini',
      noAnnouncements: 'Tiada pengumuman dijumpai',
      noAnnouncementsDesc: 'Cuba laraskan carian atau penapis anda',
      poll: 'Undian Tersedia',
      hasPoll: 'Pengumuman ini mengandungi undian'
    }
  };

  const t = text[language];

  // Fetch announcements from Supabase
  useEffect(() => {
    fetchAnnouncements();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('announcements-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'announcements'
      }, () => {
        fetchAnnouncements();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          id,
          title,
          content,
          type,
          scope,
          is_urgent,
          is_published,
          is_pinned,
          publish_at,
          expire_at,
          created_at,
          author_id,
          polls!inner(
            id
          )
        `)
        .eq('is_published', true)
        .lte('publish_at', new Date().toISOString())
        .or('expire_at.is.null,expire_at.gt.' + new Date().toISOString())
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Also fetch announcements without polls
      const { data: announcementsWithoutPolls, error: error2 } = await supabase
        .from('announcements')
        .select(`
          id,
          title,
          content,
          type,
          scope,
          is_urgent,
          is_published,
          is_pinned,
          publish_at,
          expire_at,
          created_at,
          author_id
        `)
        .eq('is_published', true)
        .lte('publish_at', new Date().toISOString())
        .or('expire_at.is.null,expire_at.gt.' + new Date().toISOString())
        .not('id', 'in', `(${(data || []).map(a => a.id).join(',') || 'null'})`)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error2) throw error2;

      // Combine and transform data
      const allAnnouncements = [
        ...(data || []).map(a => ({ ...a, has_poll: true, poll_id: a.polls?.[0]?.id })),
        ...(announcementsWithoutPolls || []).map(a => ({ ...a, has_poll: false }))
      ];

      const transformedAnnouncements: Announcement[] = allAnnouncements.map(announcement => ({
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        priority: announcement.is_urgent ? 'urgent' : 'medium' as 'low' | 'medium' | 'high' | 'urgent',
        category: announcement.type || 'general',
        created_date: new Date(announcement.created_at).toLocaleDateString(),
        author: 'Management Office',
        is_pinned: announcement.is_pinned || announcement.is_urgent,
        read_status: false,
        target_audience: ['residents'],
        scope: announcement.scope || 'district',
        type: announcement.type || 'general',
        is_urgent: announcement.is_urgent,
        publish_at: announcement.publish_at,
        expire_at: announcement.expire_at,
        has_poll: announcement.has_poll,
        poll_id: announcement.poll_id
      }));

      setAnnouncements(transformedAnnouncements);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast({
        title: language === 'en' ? 'Error loading announcements' : 'Ralat memuatkan pengumuman',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesScope = selectedScope === 'all' || announcement.scope === selectedScope;
    const matchesCategory = selectedCategory === 'all' || announcement.category === selectedCategory;
    
    return matchesSearch && matchesScope && matchesCategory;
  });

  const pinnedAnnouncements = filteredAnnouncements.filter(a => a.is_pinned);
  const regularAnnouncements = filteredAnnouncements.filter(a => !a.is_pinned);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPriorityText = (priority: string) => {
    return t[priority as keyof typeof t] || priority;
  };

  const getScopeColor = (scope: string) => {
    switch (scope) {
      case 'state': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'district': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'community': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getScopeText = (scope: string) => {
    return t[scope as keyof typeof t] || scope;
  };

  const stats = {
    total: announcements.length,
    pinned: pinnedAnnouncements.length,
    unread: announcements.filter(a => !a.read_status).length,
    thisWeek: announcements.filter(a => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(a.created_date) >= weekAgo;
    }).length
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
                <p className="text-sm text-muted-foreground">{t.totalAnnouncements}</p>
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
                <p className="text-sm text-muted-foreground">{t.pinnedAnnouncements}</p>
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
                <p className="text-sm text-muted-foreground">{t.unreadAnnouncements}</p>
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

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
                <Card className="border-l-4 border-l-yellow-400">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {announcement.is_urgent && <span className="text-red-500">🔴</span>}
                          {announcement.title}
                          {announcement.has_poll && (
                            <Badge variant="outline" className="ml-2">
                              <BarChart3 className="w-3 h-3 mr-1" />
                              {t.poll}
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={getPriorityColor(announcement.priority)}>
                            {getPriorityText(announcement.priority)}
                          </Badge>
                          <Badge variant="secondary">{announcement.category}</Badge>
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
                
                {/* Render poll if exists */}
                {announcement.has_poll && announcement.poll_id && (
                  <PollComponent pollId={announcement.poll_id} />
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
                <Card className={`${!announcement.read_status ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {announcement.is_urgent && <span className="text-red-500">🔴</span>}
                          {announcement.title}
                          {announcement.has_poll && (
                            <Badge variant="outline" className="ml-2">
                              <BarChart3 className="w-3 h-3 mr-1" />
                              {t.poll}
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={getPriorityColor(announcement.priority)}>
                            {getPriorityText(announcement.priority)}
                          </Badge>
                          <Badge variant="secondary">{announcement.category}</Badge>
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
                
                {/* Render poll if exists */}
                {announcement.has_poll && announcement.poll_id && (
                  <PollComponent pollId={announcement.poll_id} />
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
              <h3 className="text-lg font-semibold mb-2">{t.noAnnouncements}</h3>
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
    </div>
  );
}