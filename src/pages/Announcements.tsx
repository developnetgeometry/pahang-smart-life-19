import { useState, useEffect } from 'react';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Megaphone, Calendar, Clock, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function Announcements() {
  const { user } = useEnhancedAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        if (user?.id === '11111111-1111-1111-1111-111111111111') {
          // Demo data
          setAnnouncements([
            {
              id: '1',
              title: 'Jadual Penyelenggaraan Kolam Renang',
              content: 'Kolam renang akan ditutup untuk penyelenggaraan rutin pada 25 Ogos 2025.',
              type: 'maintenance',
              priority: 'high',
              created_at: '2024-01-15',
              author: 'Pengurusan Komuniti'
            },
            {
              id: '2', 
              title: 'Sambutan Hari Kemerdekaan',
              content: 'Jemputan untuk menyertai sambutan Hari Kemerdekaan di dewan komuniti.',
              type: 'event',
              priority: 'medium',
              created_at: '2024-01-10',
              author: 'Jawatankuasa Komuniti'
            }
          ]);
        } else {
          const { data } = await supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false });
          
          setAnnouncements(data || []);
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pengumuman</h1>
          <p className="text-muted-foreground">Kemas kini dan berita terkini komuniti</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Tapis
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <Megaphone className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">{announcement.title}</CardTitle>
                  </div>
                  <Badge variant={announcement.priority === 'high' ? 'destructive' : 'secondary'}>
                    {announcement.type}
                  </Badge>
                </div>
                <CardDescription className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{announcement.created_at}</span>
                  </span>
                  <span>oleh {announcement.author}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {announcement.content}
                </p>
                <Button variant="outline" size="sm">
                  Baca Selengkapnya
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}