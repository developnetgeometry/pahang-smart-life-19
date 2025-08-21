import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Megaphone, Calendar, Clock, Search, Pin, Bell, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
}

export default function Announcements() {
  const { language, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch announcements from Supabase
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select(`
            id,
            title,
            content,
            type,
            is_urgent,
            is_published,
            publish_at,
            expire_at,
            created_at,
            author_id
          `)
          .eq('is_published', true)
          .lte('publish_at', new Date().toISOString())
          .or('expire_at.is.null,expire_at.gt.' + new Date().toISOString())
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform Supabase data to match our interface
        const transformedAnnouncements: Announcement[] = (data || []).map(announcement => ({
          id: announcement.id,
          title: announcement.title,
          content: announcement.content,
          priority: announcement.is_urgent ? 'urgent' : 'medium' as 'low' | 'medium' | 'high' | 'urgent',
          category: announcement.type || 'General',
          created_date: new Date(announcement.created_at).toISOString().split('T')[0],
          author: 'Management Office', // Could be enhanced with profile lookup
          is_pinned: announcement.is_urgent,
          read_status: false, // Could be enhanced with read tracking
          target_audience: ['residents']
        }));

        setAnnouncements(transformedAnnouncements);
      } catch (error) {
        console.error('Error fetching announcements:', error);
        // Fallback to demo data
        setAnnouncements([
          {
            id: '1',
            title: language === 'en' ? 'Scheduled Maintenance - Water Supply' : 'Penyelenggaraan Berjadual - Bekalan Air',
            content: language === 'en' 
              ? 'Water supply will be temporarily disrupted on January 20, 2024, from 9:00 AM to 3:00 PM for maintenance work. Please store water in advance.'
              : 'Bekalan air akan terganggu sementara pada 20 Januari 2024, dari 9:00 AM hingga 3:00 PM untuk kerja penyelenggaraan. Sila simpan air terlebih dahulu.',
            priority: 'high',
            category: language === 'en' ? 'Maintenance' : 'Penyelenggaraan',
            created_date: '2024-01-15',
            author: 'Management Office',
            is_pinned: true,
            read_status: false,
            target_audience: ['residents']
          },
          {
            id: '2',
            title: language === 'en' ? 'Chinese New Year Celebration' : 'Perayaan Tahun Baru Cina',
            content: language === 'en'
              ? 'Join us for Chinese New Year celebration at the community hall on February 10, 2024, at 7:00 PM. Lion dance performance and dinner will be provided.'
              : 'Sertai kami untuk perayaan Tahun Baru Cina di dewan komuniti pada 10 Februari 2024, pada 7:00 PM. Persembahan tarian singa dan makan malam akan disediakan.',
            priority: 'medium',
            category: language === 'en' ? 'Community Events' : 'Acara Komuniti',
            created_date: '2024-01-14',
            author: 'Resident Committee',
            is_pinned: false,
            read_status: true,
            target_audience: ['residents']
          },
          {
            id: '3',
            title: language === 'en' ? 'New Security Measures' : 'Langkah Keselamatan Baru',
            content: language === 'en'
              ? 'New CCTV cameras have been installed at main entrances. Access cards will be required for all common areas starting February 1, 2024.'
              : 'Kamera CCTV baru telah dipasang di pintu masuk utama. Kad akses akan diperlukan untuk semua kawasan umum bermula 1 Februari 2024.',
            priority: 'high',
            category: language === 'en' ? 'Security' : 'Keselamatan',
            created_date: '2024-01-13',
            author: 'Security Department',
            is_pinned: true,
            read_status: false,
            target_audience: ['residents']
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();

    // Set up real-time subscription for new announcements
    const channel = supabase
      .channel('announcements-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'announcements'
      }, (payload) => {
        console.log('New announcement:', payload);
        // Add new announcement instead of refetching all
        if (payload.new && payload.new.is_published) {
          const newAnnouncement: Announcement = {
            id: payload.new.id,
            title: payload.new.title,
            content: payload.new.content,
            priority: payload.new.is_urgent ? 'urgent' : 'medium',
            category: payload.new.type || 'General',
            created_date: new Date(payload.new.created_at).toISOString().split('T')[0],
            author: 'Management Office',
            is_pinned: payload.new.is_urgent,
            read_status: false,
            target_audience: ['residents']
          };
          setAnnouncements(prev => [newAnnouncement, ...prev]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [language]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'urgent': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityText = (priority: string) => {
    if (language === 'en') {
      switch (priority) {
        case 'low': return 'Low';
        case 'medium': return 'Medium';
        case 'high': return 'High';
        case 'urgent': return 'Urgent';
        default: return 'Unknown';
      }
    } else {
      switch (priority) {
        case 'low': return 'Rendah';
        case 'medium': return 'Sederhana';
        case 'high': return 'Tinggi';
        case 'urgent': return 'Mendesak';
        default: return 'Tidak Diketahui';
      }
    }
  };

  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pinnedAnnouncements = filteredAnnouncements.filter(a => a.is_pinned);
  const regularAnnouncements = filteredAnnouncements.filter(a => !a.is_pinned);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {language === 'en' ? 'Announcements' : 'Pengumuman'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'Stay updated with community news and important notices'
                : 'Kekal terkini dengan berita komuniti dan notis penting'
              }
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-muted animate-pulse rounded-lg w-10 h-10" />
                  <div className="ml-4 flex-1">
                    <div className="h-3 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-6 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="space-y-2">
                  <div className="h-6 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
                  <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
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
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'en' ? 'Announcements' : 'Pengumuman'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Stay updated with community news and important notices'
              : 'Kekal terkini dengan berita komuniti dan notis penting'
            }
          </p>
        </div>
        <Button variant="outline">
          <Bell className="w-4 h-4 mr-2" />
          {language === 'en' ? 'Mark All Read' : 'Tandakan Semua Dibaca'}
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={language === 'en' ? 'Search announcements...' : 'Cari pengumuman...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Megaphone className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Total' : 'Jumlah'}
                </p>
                <p className="text-2xl font-bold">{announcements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Pin className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Pinned' : 'Disematkan'}
                </p>
                <p className="text-2xl font-bold">{pinnedAnnouncements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Bell className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Unread' : 'Belum Dibaca'}
                </p>
                <p className="text-2xl font-bold">
                  {announcements.filter(a => !a.read_status).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'This Week' : 'Minggu Ini'}
                </p>
                <p className="text-2xl font-bold">
                  {announcements.filter(a => {
                    const created = new Date(a.created_date);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return created >= weekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pinned Announcements */}
      {pinnedAnnouncements.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Pin className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-semibold">
              {language === 'en' ? 'Pinned Announcements' : 'Pengumuman Disematkan'}
            </h2>
          </div>
          {pinnedAnnouncements.map((announcement) => (
            <Card key={announcement.id} className={`hover:shadow-lg transition-shadow ${!announcement.read_status ? 'border-l-4 border-l-blue-500' : ''}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Pin className="w-4 h-4 text-red-500" />
                      {!announcement.read_status && (
                        <Badge variant="secondary" className="bg-blue-500 text-white">
                          {language === 'en' ? 'New' : 'Baru'}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{announcement.title}</CardTitle>
                    <CardDescription className="flex items-center space-x-4 mt-2">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {announcement.created_date}
                      </span>
                      <span>{announcement.author}</span>
                      <Badge variant="outline">{announcement.category}</Badge>
                    </CardDescription>
                  </div>
                  <Badge className={`${getPriorityColor(announcement.priority)} text-white`}>
                    {getPriorityText(announcement.priority)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {announcement.content}
                </p>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    {language === 'en' ? 'Target:' : 'Sasaran:'} {announcement.target_audience.join(', ')}
                  </div>
                  <Button variant="ghost" size="sm">
                    {language === 'en' ? 'Read More' : 'Baca Lagi'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Regular Announcements */}
      <div className="space-y-4">
        {pinnedAnnouncements.length > 0 && (
          <h2 className="text-xl font-semibold">
            {language === 'en' ? 'Recent Announcements' : 'Pengumuman Terkini'}
          </h2>
        )}
        {regularAnnouncements.map((announcement) => (
          <Card key={announcement.id} className={`hover:shadow-lg transition-shadow ${!announcement.read_status ? 'border-l-4 border-l-blue-500' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {!announcement.read_status && (
                      <Badge variant="secondary" className="bg-blue-500 text-white">
                        {language === 'en' ? 'New' : 'Baru'}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{announcement.title}</CardTitle>
                  <CardDescription className="flex items-center space-x-4 mt-2">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {announcement.created_date}
                    </span>
                    <span>{announcement.author}</span>
                    <Badge variant="outline">{announcement.category}</Badge>
                  </CardDescription>
                </div>
                <Badge className={`${getPriorityColor(announcement.priority)} text-white`}>
                  {getPriorityText(announcement.priority)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {announcement.content}
              </p>
              <div className="flex justify-between items-center">
                <div className="text-xs text-muted-foreground">
                  {language === 'en' ? 'Target:' : 'Sasaran:'} {announcement.target_audience.join(', ')}
                </div>
                <Button variant="ghost" size="sm">
                  {language === 'en' ? 'Read More' : 'Baca Lagi'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAnnouncements.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Megaphone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {language === 'en' ? 'No announcements found' : 'Tiada pengumuman dijumpai'}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? (language === 'en' ? 'Try adjusting your search terms' : 'Cuba laraskan terma carian anda')
                : (language === 'en' ? 'Check back later for community updates' : 'Semak semula nanti untuk kemas kini komuniti')
              }
            </p>
          </CardContent>
        </Card>
      )}
      </div>
  );
}