import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/translations';
import { supabase } from '@/integrations/supabase/client';
import { 
  PartyPopper,
  Megaphone, 
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  MapPin,
  Clock,
  Eye,
  AlertTriangle,
  Info,
  Star
} from 'lucide-react';

interface Activity {
  id: string;
  activity_type: string;
  title: string;
  description: string;
  date_time: string;
  location: string;
  image_url: string;
  priority: string;
  status: string;
  itemType: 'activity';
}

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
  publish_at: string;
  expire_at: string | null;
  image_url: string | null;
  created_at: string;
  profiles?: {
    display_name: string | null;
  } | null;
  itemType: 'announcement';
}

type SlideItem = Activity | Announcement;

export function CombinedSlideshow() {
  const { language } = useAuth();
  const { t } = useTranslation(language);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [items, setItems] = useState<SlideItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoadError, setImageLoadError] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Helper function to get localized content
  const getLocalizedTitle = (item: Announcement): string => {
    if (language === 'en' && item.title_en && item.title_en.trim() !== '') {
      return item.title_en;
    }
    if (language === 'ms' && item.title_ms && item.title_ms.trim() !== '') {
      return item.title_ms;
    }
    // Fallback to any available translation or original title
    return item.title_en || item.title_ms || item.title;
  };

  const getLocalizedContent = (item: Announcement): string => {
    if (language === 'en' && item.content_en && item.content_en.trim() !== '') {
      return item.content_en;
    }
    if (language === 'ms' && item.content_ms && item.content_ms.trim() !== '') {
      return item.content_ms;
    }
    // Fallback to any available translation or original content
    return item.content_en || item.content_ms || item.content;
  };

  // Fetch both activities and announcements
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch activities
        const { data: activitiesData, error: activitiesError } = await supabase
          .from('community_activities')
          .select('*')
          .eq('is_published', true)
          .order('date_time', { ascending: true })
          .limit(3);

        // Fetch announcements with translation fields
        const { data: announcementsData, error: announcementsError } = await supabase
          .from('announcements')
          .select('id, title, content, title_en, title_ms, content_en, content_ms, type, is_published, is_urgent, publish_at, expire_at, image_url, created_at')
          .eq('is_published', true)
          .or(`expire_at.is.null,expire_at.gt.${new Date().toISOString()}`)
          .order('is_urgent', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(3);

        if (activitiesError || announcementsError) {
          console.error('Error fetching data:', activitiesError || announcementsError);
        } else {
          // Combine and mark types
          const activitiesWithType: SlideItem[] = (activitiesData || []).map(item => ({ ...item, itemType: 'activity' as const }));
          const announcementsWithType: SlideItem[] = (announcementsData || []).map(item => ({ ...item, itemType: 'announcement' as const }));
          
          // Merge and sort by priority/urgency and date
          const combined = [...activitiesWithType, ...announcementsWithType].sort((a, b) => {
            // Prioritize urgent announcements
            if (a.itemType === 'announcement' && b.itemType === 'announcement') {
              if (a.is_urgent && !b.is_urgent) return -1;
              if (!a.is_urgent && b.is_urgent) return 1;
            }
            
            // Sort by creation/date
            const dateA = a.itemType === 'activity' ? new Date(a.date_time) : new Date(a.created_at);
            const dateB = b.itemType === 'activity' ? new Date(b.date_time) : new Date(b.created_at);
            return dateB.getTime() - dateA.getTime();
          });
          
          setItems(combined);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Reset image error when slide changes
  useEffect(() => {
    setImageLoadError(null);
  }, [currentSlide]);

  // Auto-advance slides - pause when modal is open
  useEffect(() => {
    if (!isAutoPlay || showDetailsModal || items.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % items.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlay, items.length, showDetailsModal]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % items.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + items.length) % items.length);
  };

  const getTypeIcon = (item: SlideItem) => {
    if (item.itemType === 'activity') {
      switch (item.activity_type?.toLowerCase()) {
        case 'event': return PartyPopper;
        case 'announcement': return Megaphone;
        case 'community': return Users;
        case 'sports': return Calendar;
        default: return Calendar;
      }
    } else {
      switch (item.type?.toLowerCase()) {
        case 'maintenance': return AlertTriangle;
        case 'event': return PartyPopper;
        case 'security': return Star;
        case 'general': return Info;
        default: return Megaphone;
      }
    }
  };

  const getTypeColor = (item: SlideItem) => {
    if (item.itemType === 'activity') {
      switch (item.activity_type?.toLowerCase()) {
        case 'event': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
        case 'announcement': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case 'community': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'sports': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      }
    } else {
      if (item.is_urgent) {
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      }
      switch (item.type?.toLowerCase()) {
        case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case 'event': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
        case 'security': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case 'general': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      }
    }
  };

  const getPriorityBackground = (item: SlideItem) => {
    if (item.itemType === 'announcement' && item.is_urgent) {
      return 'from-red-600/90 to-red-800/90';
    }
    if (item.itemType === 'activity' && item.priority === 'high') {
      return 'from-orange-600/90 to-red-600/90';
    }
    return 'from-primary/80 to-accent/80';
  };

  if (loading) {
    return (
      <Card className="w-full relative overflow-hidden bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-0">
          <div className="relative h-80 flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="w-full relative overflow-hidden bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-0">
          <div className="relative h-80 flex items-center justify-center">
            <p className="text-muted-foreground">No content available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentItem = items[currentSlide];
  const TypeIcon = getTypeIcon(currentItem);

  return (
    <Card className="w-full relative overflow-hidden bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
      <CardContent className="p-0">
        <div className="relative h-80 overflow-hidden">
          {/* Background Image */}
          {currentItem.image_url && !imageLoadError ? (
            <>
              <img
                src={currentItem.image_url}
                alt={currentItem.title}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: 'brightness(0.3)' }}
                onError={() => setImageLoadError(currentItem.id)}
                onLoad={() => setImageLoadError(null)}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
            </>
          ) : (
            <div 
              className={`absolute inset-0 bg-gradient-to-r ${getPriorityBackground(currentItem)}`}
              style={{ filter: 'brightness(0.7)' }}
            />
          )}
          
          {/* Overlay Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="flex-1 p-4 sm:p-6 lg:p-8 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Badge className={`${getTypeColor(currentItem)} w-fit`}>
                  <TypeIcon className="w-3 h-3 mr-1" />
                  <span className="text-xs sm:text-sm">
                    {currentItem.itemType === 'activity' 
                      ? currentItem.activity_type?.toUpperCase() || 'ACTIVITY'
                      : currentItem.type?.toUpperCase() || 'ANNOUNCEMENT'
                    }
                  </span>
                </Badge>
                
                {currentItem.itemType === 'announcement' && (
                  <Badge className={`w-fit text-xs ${
                    currentItem.type === 'maintenance' || currentItem.type === 'security' 
                      ? 'bg-blue-600/90 text-white' 
                      : currentItem.type === 'event' || currentItem.type === 'general'
                      ? 'bg-green-600/90 text-white'
                      : 'bg-orange-600/90 text-white'
                  }`}>
                    {currentItem.type === 'maintenance' || currentItem.type === 'security' 
                      ? 'DISTRICT LEVEL' 
                      : currentItem.type === 'event' || currentItem.type === 'general'
                      ? 'COMMUNITY LEVEL'
                      : 'STATE LEVEL'
                    }
                  </Badge>
                )}
                
                {currentItem.itemType === 'activity' && (
                  <Badge className="bg-green-600/90 text-white w-fit text-xs">
                    COMMUNITY LEVEL
                  </Badge>
                )}
                
                {currentItem.itemType === 'activity' && (
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      currentItem.status?.toLowerCase() === 'upcoming' ? 'bg-blue-500' :
                      currentItem.status?.toLowerCase() === 'ongoing' ? 'bg-green-500' :
                      'bg-gray-500'
                    }`} />
                    <span className="text-xs sm:text-sm capitalize">{currentItem.status}</span>
                  </div>
                )}
                
                {currentItem.itemType === 'announcement' && currentItem.is_urgent && (
                  <Badge className="bg-red-500 text-white text-xs">URGENT</Badge>
                )}
              </div>
              
              <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 leading-tight">
                {currentItem.itemType === 'announcement' ? getLocalizedTitle(currentItem) : currentItem.title}
              </h2>
              
              <p className="text-sm sm:text-base lg:text-lg mb-3 sm:mb-4 text-gray-200 line-clamp-2 sm:line-clamp-3">
                {currentItem.itemType === 'activity' ? currentItem.description : getLocalizedContent(currentItem)}
              </p>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-gray-300 mb-3 sm:mb-4">
                {currentItem.itemType === 'activity' ? (
                  <>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{new Date(currentItem.date_time).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{new Date(currentItem.date_time).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="truncate">{currentItem.location}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{new Date(currentItem.publish_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{new Date(currentItem.publish_at).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      })}</span>
                    </div>
                  {/* Remove author info for now since profiles relation isn't working */}
                  </>
                )}
              </div>
               
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs sm:text-sm"
                onClick={() => setShowDetailsModal(true)}
              >
                <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                View Details
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
          {items.map((_, index) => (
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
              {currentItem.itemType === 'announcement' ? getLocalizedTitle(currentItem) : currentItem.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 sm:space-y-6">
            {/* Image */}
            {currentItem.image_url && !imageLoadError && (
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src={currentItem.image_url}
                  alt={currentItem.title}
                  className="w-full h-48 sm:h-64 object-cover"
                  onError={() => setImageLoadError(currentItem.id)}
                />
              </div>
            )}
            
            {/* Type and Status/Priority */}
            <div className="flex flex-wrap items-center gap-3">
              <Badge className={`${getTypeColor(currentItem)} text-xs sm:text-sm`}>
                <TypeIcon className="w-3 h-3 mr-1" />
                {currentItem.itemType === 'activity' 
                  ? currentItem.activity_type?.toUpperCase() || 'ACTIVITY'
                  : currentItem.type?.toUpperCase() || 'ANNOUNCEMENT'
                }
              </Badge>
              
              {currentItem.itemType === 'activity' && (
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    currentItem.status?.toLowerCase() === 'upcoming' ? 'bg-blue-500' :
                    currentItem.status?.toLowerCase() === 'ongoing' ? 'bg-green-500' :
                    'bg-gray-500'
                  }`} />
                  <span className="text-sm capitalize font-medium">{currentItem.status}</span>
                </div>
              )}
              
              {currentItem.itemType === 'announcement' && currentItem.is_urgent && (
                <Badge className="bg-red-500 text-white text-xs">URGENT</Badge>
              )}
            </div>
            
            {/* Content */}
            <div className="space-y-2">
              <h3 className="font-semibold text-base sm:text-lg text-foreground">
                {currentItem.itemType === 'activity' ? 'Description' : 'Content'}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-line leading-relaxed">
                {currentItem.itemType === 'activity' ? currentItem.description : getLocalizedContent(currentItem)}
              </p>
            </div>
            
            {/* Details */}
            <div className="space-y-3 sm:space-y-4">
              {currentItem.itemType === 'activity' ? (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Calendar className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">Date</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(currentItem.date_time).toLocaleDateString('en-US', {
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
                      <p className="text-sm font-semibold text-foreground">Time</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(currentItem.date_time).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">Location</p>
                      <p className="text-sm text-muted-foreground">{currentItem.location}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Calendar className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">Published Date</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(currentItem.publish_at).toLocaleDateString('en-US', {
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
                      <p className="text-sm font-semibold text-foreground">Published Time</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(currentItem.publish_at).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {/* Remove author info for now since profiles relation isn't working */}
                  
                  {currentItem.expire_at && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">Expires On</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(currentItem.expire_at).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}