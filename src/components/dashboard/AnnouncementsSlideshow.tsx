import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Megaphone,
  AlertTriangle,
  Info,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Clock,
  Eye,
  User
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  author_id: string;
  district_id: string;
  is_published: boolean;
  is_urgent: boolean;
  publish_at: string;
  expire_at?: string;
  image_url?: string;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

export function AnnouncementsSlideshow() {
  const { language } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoadError, setImageLoadError] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch announcements from database
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select(`
            *,
            profiles:author_id (
              full_name
            )
          `)
          .eq('is_published', true)
          .lte('publish_at', new Date().toISOString())
          .or(`expire_at.is.null,expire_at.gt.${new Date().toISOString()}`)
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

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'urgent': return AlertTriangle;
      case 'general': return Megaphone;
      case 'maintenance': return AlertTriangle;
      case 'event': return Calendar;
      default: return Info;
    }
  };

  const getTypeColor = (type: string, isUrgent: boolean) => {
    if (isUrgent) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
    
    switch (type?.toLowerCase()) {
      case 'general': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'event': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityBackground = (isUrgent: boolean) => {
    return isUrgent 
      ? 'from-red-500/80 to-orange-500/80'
      : 'from-primary/80 to-accent/80';
  };

  if (loading) {
    return (
      <Card className="w-full relative overflow-hidden bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-0">
          <div className="relative h-80 flex items-center justify-center">
            <p className="text-muted-foreground">
              {language === 'en' ? 'Loading announcements...' : 'Memuat pengumuman...'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (announcements.length === 0) {
    return (
      <Card className="w-full relative overflow-hidden bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-0">
          <div className="relative h-80 flex items-center justify-center">
            <p className="text-muted-foreground">
              {language === 'en' ? 'No announcements available' : 'Tiada pengumuman tersedia'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentAnnouncement = announcements[currentSlide];
  const TypeIcon = getTypeIcon(currentAnnouncement?.type || '');

  return (
    <Card className="w-full relative overflow-hidden bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
      <CardContent className="p-0">
        <div className="relative h-80 overflow-hidden">
          {/* Background Image */}
          {currentAnnouncement.image_url && !imageLoadError ? (
            <>
              <img
                src={currentAnnouncement.image_url}
                alt={currentAnnouncement.title}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: 'brightness(0.3)' }}
                onError={() => setImageLoadError(currentAnnouncement.id)}
                onLoad={() => setImageLoadError(null)}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
            </>
          ) : (
            <div 
              className={`absolute inset-0 bg-gradient-to-r ${getPriorityBackground(currentAnnouncement.is_urgent)}`}
              style={{ filter: 'brightness(0.7)' }}
            />
          )}
          
          {/* Overlay Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="flex-1 p-4 sm:p-6 lg:p-8 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Badge className={`${getTypeColor(currentAnnouncement.type, currentAnnouncement.is_urgent)} w-fit`}>
                  <TypeIcon className="w-3 h-3 mr-1" />
                  <span className="text-xs sm:text-sm">
                    {currentAnnouncement.is_urgent 
                      ? (language === 'en' ? 'URGENT' : 'PENTING') 
                      : currentAnnouncement.type?.toUpperCase() || ''
                    }
                  </span>
                </Badge>
                {currentAnnouncement.is_urgent && (
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-xs sm:text-sm text-red-200">
                      {language === 'en' ? 'Important Notice' : 'Notis Penting'}
                    </span>
                  </div>
                )}
              </div>
              
              <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 leading-tight">
                {currentAnnouncement.title}
              </h2>
              
              <p className="text-sm sm:text-base lg:text-lg mb-3 sm:mb-4 text-gray-200 line-clamp-2 sm:line-clamp-3">
                {currentAnnouncement.content}
              </p>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-gray-300 mb-3 sm:mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{new Date(currentAnnouncement.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{new Date(currentAnnouncement.created_at).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })}</span>
                </div>
                {currentAnnouncement.profiles?.full_name && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="truncate">{currentAnnouncement.profiles.full_name}</span>
                  </div>
                )}
              </div>
               
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs sm:text-sm"
                onClick={() => setShowDetailsModal(true)}
              >
                <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {language === 'en' ? 'View Details' : 'Lihat Butiran'}
              </Button>
            </div>
            
            {/* Navigation Controls */}
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 h-6 w-6 sm:h-8 sm:w-8 p-0"
                onClick={() => setIsAutoPlay(!isAutoPlay)}
              >
                {isAutoPlay ? <Pause className="w-3 h-3 sm:w-4 sm:h-4" /> : <Play className="w-3 h-3 sm:w-4 sm:h-4" />}
              </Button>
            </div>
            
            {/* Previous/Next Buttons */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10 p-0"
              onClick={prevSlide}
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10 p-0"
              onClick={nextSlide}
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
        
        {/* Slide Indicators */}
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-2">
          {announcements.map((_, index) => (
            <button
              key={index}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-4 sm:w-6' : 'bg-white/50'
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </CardContent>
      
      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-md sm:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border shadow-elegant">
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <TypeIcon className="w-5 h-5 text-primary" />
              {currentAnnouncement.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 sm:space-y-6">
            {/* Announcement Image */}
            {currentAnnouncement.image_url && !imageLoadError && (
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src={currentAnnouncement.image_url}
                  alt={currentAnnouncement.title}
                  className="w-full h-48 sm:h-64 object-cover"
                  onError={() => setImageLoadError(currentAnnouncement.id)}
                />
              </div>
            )}
            
            {/* Announcement Type and Urgency */}
            <div className="flex flex-wrap items-center gap-3">
              <Badge className={`${getTypeColor(currentAnnouncement.type, currentAnnouncement.is_urgent)} text-xs sm:text-sm`}>
                <TypeIcon className="w-3 h-3 mr-1" />
                {currentAnnouncement.is_urgent 
                  ? (language === 'en' ? 'URGENT' : 'PENTING')
                  : currentAnnouncement.type?.toUpperCase() || ''
                }
              </Badge>
              {currentAnnouncement.is_urgent && (
                <div className="flex items-center gap-2 px-2 py-1 bg-red-100 text-red-800 rounded-full">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="text-xs font-medium">
                    {language === 'en' ? 'High Priority' : 'Keutamaan Tinggi'}
                  </span>
                </div>
              )}
            </div>
            
            {/* Full Content */}
            <div className="space-y-2">
              <h3 className="font-semibold text-base sm:text-lg text-foreground">
                {language === 'en' ? 'Announcement Details' : 'Butiran Pengumuman'}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-line leading-relaxed">
                {currentAnnouncement.content}
              </p>
            </div>
            
            {/* Announcement Details */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {language === 'en' ? 'Published Date' : 'Tarikh Diterbitkan'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(currentAnnouncement.created_at).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Clock className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {language === 'en' ? 'Time' : 'Masa'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(currentAnnouncement.created_at).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </p>
                </div>
              </div>
              
              {currentAnnouncement.profiles?.full_name && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <User className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {language === 'en' ? 'Published By' : 'Diterbitkan Oleh'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {currentAnnouncement.profiles.full_name}
                    </p>
                  </div>
                </div>
              )}

              {currentAnnouncement.expire_at && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <AlertTriangle className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {language === 'en' ? 'Expires On' : 'Tamat Tempoh'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(currentAnnouncement.expire_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}