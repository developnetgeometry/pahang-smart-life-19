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
  Eye
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
}

export function ActivitiesSlideshow() {
  const { language } = useAuth();
  const { t } = useTranslation(language);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoadError, setImageLoadError] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch activities from database
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data, error } = await supabase
          .from('community_activities')
          .select('*')
          .eq('is_published', true)
          .order('date_time', { ascending: true })
          .limit(5);

        if (error) {
          console.error('Error fetching activities:', error);
        } else {
          setActivities(data || []);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Reset image error when slide changes
  useEffect(() => {
    setImageLoadError(null);
  }, [currentSlide]);

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlay) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activities.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay, activities.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activities.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + activities.length) % activities.length);
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'event': return PartyPopper;
      case 'announcement': return Megaphone;
      case 'community': return Users;
      case 'sports': return Calendar;
      default: return Calendar;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'event': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'announcement': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'community': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'sports': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'upcoming': return 'bg-blue-500';
      case 'ongoing': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  if (loading) {
    return (
      <Card className="w-full relative overflow-hidden bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-0">
          <div className="relative h-80 flex items-center justify-center">
            <p className="text-muted-foreground">
              {t('loadingActivities')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="w-full relative overflow-hidden bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-0">
          <div className="relative h-80 flex items-center justify-center">
            <p className="text-muted-foreground">
              {t('noActivitiesAvailable')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentActivity = activities[currentSlide];
  const TypeIcon = getTypeIcon(currentActivity?.activity_type || '');

  return (
    <Card className="w-full relative overflow-hidden bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
      <CardContent className="p-0">
        <div className="relative h-80 overflow-hidden">
          {/* Background Image */}
          {currentActivity.image_url && !imageLoadError ? (
            <>
              <img
                src={currentActivity.image_url}
                alt={currentActivity.title}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: 'brightness(0.3)' }}
                onError={() => setImageLoadError(currentActivity.id)}
                onLoad={() => setImageLoadError(null)}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
            </>
          ) : (
            <div 
              className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/80"
              style={{ filter: 'brightness(0.7)' }}
            />
          )}
          
          {/* Overlay Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="flex-1 p-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Badge className={getTypeColor(currentActivity.activity_type)}>
                  <TypeIcon className="w-3 h-3 mr-1" />
                  {currentActivity.activity_type?.toUpperCase() || ''}
                </Badge>
                <div className={`w-2 h-2 rounded-full ${getStatusColor(currentActivity.status)}`} />
                <span className="text-sm capitalize">{currentActivity.status}</span>
              </div>
              
              <h2 className="text-3xl font-bold mb-3 leading-tight">
                {currentActivity.title}
              </h2>
              
              <p className="text-lg mb-4 text-gray-200 line-clamp-2">
                {currentActivity.description}
              </p>
              
              <div className="flex items-center gap-6 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(currentActivity.date_time).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(currentActivity.date_time).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })}</span>
                </div>
                 <div className="flex items-center gap-1">
                   <MapPin className="w-4 h-4" />
                   <span>{currentActivity.location}</span>
                 </div>
               </div>
               
               <Button
                 variant="secondary"
                 size="sm"
                 className="mt-4 bg-white/20 text-white border-white/30 hover:bg-white/30"
                 onClick={() => setShowDetailsModal(true)}
               >
                 <Eye className="w-4 h-4 mr-2" />
                 {t('viewDetails')}
               </Button>
             </div>
            
            {/* Navigation Controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
                onClick={() => setIsAutoPlay(!isAutoPlay)}
              >
                {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            </div>
            
            {/* Previous/Next Buttons */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-10 w-10 p-0"
              onClick={prevSlide}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-10 w-10 p-0"
              onClick={nextSlide}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {activities.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-6' : 'bg-white/50'
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </CardContent>
      
      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TypeIcon className="w-5 h-5" />
              {currentActivity.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Activity Image */}
            {currentActivity.image_url && !imageLoadError && (
              <img
                src={currentActivity.image_url}
                alt={currentActivity.title}
                className="w-full h-64 object-cover rounded-lg"
                onError={() => setImageLoadError(currentActivity.id)}
              />
            )}
            
            {/* Activity Type and Status */}
            <div className="flex items-center gap-3">
              <Badge className={getTypeColor(currentActivity.activity_type)}>
                <TypeIcon className="w-3 h-3 mr-1" />
                {currentActivity.activity_type?.toUpperCase() || ''}
              </Badge>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(currentActivity.status)}`} />
                <span className="text-sm capitalize">{currentActivity.status}</span>
              </div>
            </div>
            
            {/* Full Description */}
            <div>
              <h3 className="font-semibold mb-2">
                {t('description')}
              </h3>
              <p className="text-muted-foreground whitespace-pre-line">
                {currentActivity.description}
              </p>
            </div>
            
            {/* Activity Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {t('date')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(currentActivity.date_time).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {t('time')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(currentActivity.date_time).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 md:col-span-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {t('location')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentActivity.location}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}