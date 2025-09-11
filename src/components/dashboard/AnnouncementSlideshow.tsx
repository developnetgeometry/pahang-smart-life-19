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
  Star,
  Calendar
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
      <div className="w-full h-64 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4 text-white/80">
          <Megaphone className="h-16 w-16 mx-auto opacity-50" />
          <p className="text-lg">{language === 'en' ? 'No pinned announcements available' : 'Tiada pengumuman yang disematkan'}</p>
        </div>
      </div>
    );
  }

  const currentAnnouncement = announcements[currentSlide];

  return (
    <>
      <div className="w-full overflow-hidden rounded-xl">
        <div className="relative h-64 md:h-72">
          {/* Background Image or Gradient */}
          {currentAnnouncement.image_url && !imageLoadError ? (
            <>
              <img
                src={currentAnnouncement.image_url}
                alt={getLocalizedTitle(currentAnnouncement)}
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => setImageLoadError(currentAnnouncement.id)}
              />
              <div className="absolute inset-0 bg-black/50" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          )}

          {/* Content Overlay */}
          <div className="relative h-full flex flex-col justify-between p-6 md:p-8 pl-12 pr-12 sm:pl-14 sm:pr-14 text-white">
            {/* Top Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                variant="secondary" 
                className="bg-white/20 text-white border-white/30 backdrop-blur-sm"
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                {currentAnnouncement.type.toUpperCase()}
              </Badge>
              <Badge 
                variant="secondary" 
                className="bg-blue-600/80 text-white border-blue-400/50 backdrop-blur-sm"
              >
                {language === 'en' ? 'DISTRICT LEVEL' : 'TAHAP DAERAH'}
              </Badge>
              {currentAnnouncement.is_urgent && (
                <Badge 
                  variant="destructive" 
                  className="bg-red-600/90 text-white border-red-400/50 backdrop-blur-sm"
                >
                  {language === 'en' ? 'URGENT' : 'SEGERA'}
                </Badge>
              )}
              <Badge 
                variant="secondary" 
                className="bg-yellow-600/80 text-white border-yellow-400/50 backdrop-blur-sm"
              >
                <Star className="h-3 w-3 mr-1" />
                {language === 'en' ? 'PINNED' : 'DISEMATKAN'}
              </Badge>
            </div>

            {/* Main Content */}
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              <h2 className="text-2xl md:text-4xl font-bold leading-tight">
                {getLocalizedTitle(currentAnnouncement)}
              </h2>
              <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-3xl">
                {getLocalizedContent(currentAnnouncement).substring(0, 200)}
                {getLocalizedContent(currentAnnouncement).length > 200 && '...'}
              </p>
            </div>

            {/* Bottom Info */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/80">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(currentAnnouncement.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(currentAnnouncement.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => setShowDetailsModal(true)}
                className="bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30 w-full sm:w-auto sm:ml-auto"
              >
                <Eye className="h-4 w-4 mr-2" />
                {language === 'en' ? 'View Details' : 'Lihat Butiran'}
              </Button>
            </div>
          </div>

          {/* Navigation Controls */}
          {announcements.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 border border-white/20 backdrop-blur-sm rounded-full w-9 h-9 sm:w-10 sm:h-10 p-0"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 border border-white/20 backdrop-blur-sm rounded-full w-9 h-9 sm:w-10 sm:h-10 p-0"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </>
          )}

          {/* Slide Indicators */}
          {announcements.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {announcements.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-white w-8' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Auto-play Control */}
          {announcements.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-black/30 text-white hover:bg-black/50 border border-white/20 backdrop-blur-sm w-10 h-10 p-0"
            >
              {isAutoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

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