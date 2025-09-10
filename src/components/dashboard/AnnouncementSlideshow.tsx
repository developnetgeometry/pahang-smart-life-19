import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Megaphone, 
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Clock,
  Eye,
  AlertTriangle,
  Info,
  Star
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  title_en?: string | null;
  title_ms?: string | null;
  content_en?: string | null;
  content_ms?: string | null;
  type: string;
  is_published: boolean;
  is_urgent: boolean;
  is_pinned: boolean;
  publish_at: string;
  expire_at: string | null;
  image_url: string | null;
  created_at: string;
  author_id?: string | null;
}

export function AnnouncementSlideshow() {
  const { language } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoadError, setImageLoadError] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Helper function to get localized content
  const getLocalizedTitle = (announcement: Announcement): string => {
    if (language === 'en' && announcement.title_en && announcement.title_en.trim() !== '') {
      return announcement.title_en;
    }
    if (language === 'ms' && announcement.title_ms && announcement.title_ms.trim() !== '') {
      return announcement.title_ms;
    }
    // Fallback to any available translation or original title
    return announcement.title_en || announcement.title_ms || announcement.title;
  };

  const getLocalizedContent = (announcement: Announcement): string => {
    if (language === 'en' && announcement.content_en && announcement.content_en.trim() !== '') {
      return announcement.content_en;
    }
    if (language === 'ms' && announcement.content_ms && announcement.content_ms.trim() !== '') {
      return announcement.content_ms;
    }
    // Fallback to any available translation or original content
    return announcement.content_en || announcement.content_ms || announcement.content;
  };

  // Fetch only pinned announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select(`
            id, 
            title, 
            content, 
            title_en, 
            title_ms, 
            content_en, 
            content_ms, 
            type, 
            is_published, 
            is_urgent, 
            is_pinned,
            publish_at, 
            expire_at, 
            image_url, 
            created_at,
            scope,
            district_id,
            community_id,
            author_id
          `)
          .eq('is_published', true)
          .eq('is_pinned', true)
          .lte('publish_at', new Date().toISOString())
          .or('expire_at.is.null,expire_at.gt.' + new Date().toISOString())
          .order('is_urgent', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error fetching announcements:', error);
        } else {
          setAnnouncements(data || []);
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Reset image error when slide changes
  useEffect(() => {
    setImageLoadError(null);
  }, [currentSlide]);

  // Auto-advance slides - pause when modal is open
  useEffect(() => {
    if (!isAutoPlay || showDetailsModal || announcements.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % announcements.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlay, announcements.length, showDetailsModal]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % announcements.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  const getTypeIcon = () => {
    return Megaphone;
  };

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'maintenance': return 'orange';
      case 'event': return 'blue';
      case 'emergency': return 'red';
      case 'general': return 'gray';
      default: return 'gray';
    }
  };

  const getPriorityBackground = (isUrgent: boolean) => {
    return isUrgent ? 'bg-red-500/10' : 'bg-blue-500/5';
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (announcements.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center space-y-2">
              <Megaphone className="h-12 w-12 mx-auto opacity-50" />
              <p>{language === 'en' ? 'No pinned announcements available' : 'Tiada pengumuman yang disematkan'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentAnnouncement = announcements[currentSlide];

  return (
    <>
      <Card className="w-full overflow-hidden">
        <CardContent className="p-0">
          <div className="relative">
            {/* Main Content */}
            <div className={`relative p-6 ${getPriorityBackground(currentAnnouncement.is_urgent)}`}>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Image Section */}
                <div className="md:w-1/3">
                  {currentAnnouncement.image_url && !imageLoadError ? (
                    <img
                      src={currentAnnouncement.image_url}
                      alt={getLocalizedTitle(currentAnnouncement)}
                      className="w-full h-48 md:h-32 object-cover rounded-lg"
                      onError={() => setImageLoadError(currentAnnouncement.id)}
                    />
                  ) : (
                    <div className="w-full h-48 md:h-32 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                      <Megaphone className="h-12 w-12 text-primary/60" />
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="md:w-2/3 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <Badge variant={getTypeColor(currentAnnouncement.type) as any}>
                          {currentAnnouncement.type}
                        </Badge>
                        {currentAnnouncement.is_urgent && (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {language === 'en' ? 'Urgent' : 'Segera'}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-foreground leading-tight">
                        {getLocalizedTitle(currentAnnouncement)}
                      </h3>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {getLocalizedContent(currentAnnouncement).substring(0, 150)}
                    {getLocalizedContent(currentAnnouncement).length > 150 && '...'}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(currentAnnouncement.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDetailsModal(true)}
                      className="text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      {language === 'en' ? 'View Details' : 'Lihat Butiran'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            {announcements.length > 1 && (
              <div className="absolute inset-y-0 left-2 right-2 flex items-center justify-between pointer-events-none">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevSlide}
                  className="pointer-events-auto bg-background/80 hover:bg-background shadow-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextSlide}
                  className="pointer-events-auto bg-background/80 hover:bg-background shadow-sm"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Bottom Bar */}
          {announcements.length > 1 && (
            <div className="bg-muted/30 px-6 py-3 flex items-center justify-between">
              {/* Slide Indicators */}
              <div className="flex items-center gap-2">
                {announcements.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentSlide ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  className="h-7 w-7 p-0"
                >
                  {isAutoPlay ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {currentSlide + 1} / {announcements.length}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              {getLocalizedTitle(currentAnnouncement)}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Badges */}
            <div className="flex items-center gap-2">
              <Badge variant={getTypeColor(currentAnnouncement.type) as any}>
                {currentAnnouncement.type}
              </Badge>
              {currentAnnouncement.is_urgent && (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {language === 'en' ? 'Urgent' : 'Segera'}
                </Badge>
              )}
              <Badge variant="outline">
                <Star className="h-3 w-3 mr-1" />
                {language === 'en' ? 'Pinned' : 'Disematkan'}
              </Badge>
            </div>

            {/* Image */}
            {currentAnnouncement.image_url && !imageLoadError && (
              <img
                src={currentAnnouncement.image_url}
                alt={getLocalizedTitle(currentAnnouncement)}
                className="w-full h-64 object-cover rounded-lg"
                onError={() => setImageLoadError(currentAnnouncement.id)}
              />
            )}

            {/* Content */}
            <div className="prose prose-sm max-w-none">
              <p className="text-foreground whitespace-pre-wrap">
                {getLocalizedContent(currentAnnouncement)}
              </p>
            </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(currentAnnouncement.created_at).toLocaleDateString()}
                </div>
              </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}