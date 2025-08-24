import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
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
  Clock
} from 'lucide-react';
import communityGym from '@/assets/community-gym.jpg';
import gardenFacility from '@/assets/garden-facility.jpg';
import swimmingPool from '@/assets/swimming-pool.jpg';
import functionHall from '@/assets/function-hall.jpg';

interface Activity {
  id: string;
  type: 'event' | 'announcement' | 'community' | 'sports';
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  priority: 'high' | 'medium' | 'low';
  status: 'upcoming' | 'ongoing' | 'completed';
}

export function ActivitiesSlideshow() {
  const { language } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Sample activities data - in real app, this would come from Supabase
  const activities: Activity[] = [
    {
      id: '1',
      type: 'event',
      title: language === 'en' ? 'Chinese New Year Celebration' : 'Sambutan Tahun Baru Cina',
      description: language === 'en' 
        ? 'Join us for a spectacular celebration with lion dance, traditional performances, and delicious food!'
        : 'Sertai kami untuk sambutan yang spektakular dengan tarian singa, persembahan tradisional, dan makanan lazat!',
      date: '2024-02-12',
      time: '7:00 PM - 10:00 PM',
      location: language === 'en' ? 'Community Hall, Level G' : 'Dewan Komuniti, Aras G',
      image: functionHall,
      priority: 'high',
      status: 'upcoming'
    },
    {
      id: '2', 
      type: 'sports',
      title: language === 'en' ? 'Community Badminton Tournament' : 'Kejohanan Badminton Komuniti',
      description: language === 'en'
        ? 'Annual badminton championship open to all residents. Prizes for winners!'
        : 'Kejohanan badminton tahunan terbuka untuk semua penduduk. Hadiah untuk pemenang!',
      date: '2024-02-18',
      time: '9:00 AM - 6:00 PM', 
      location: language === 'en' ? 'Sports Hall' : 'Dewan Sukan',
      image: communityGym,
      priority: 'medium',
      status: 'upcoming'
    },
    {
      id: '3',
      type: 'community',
      title: language === 'en' ? 'Gotong-Royong Day' : 'Hari Gotong-Royong',
      description: language === 'en'
        ? 'Community cleaning and beautification day. Let\'s work together to keep our neighborhood beautiful!'
        : 'Hari pembersihan dan percantikan komuniti. Mari bekerjasama untuk mengekalkan kawasan kita cantik!',
      date: '2024-02-25',
      time: '8:00 AM - 12:00 PM',
      location: language === 'en' ? 'Various Areas' : 'Pelbagai Kawasan',
      image: gardenFacility,
      priority: 'high',
      status: 'upcoming'
    },
    {
      id: '4',
      type: 'announcement',
      title: language === 'en' ? 'New Swimming Pool Hours' : 'Waktu Baharu Kolam Renang',
      description: language === 'en'
        ? 'Extended swimming pool hours during weekends. New facilities and equipment available!'
        : 'Waktu kolam renang dipanjangkan pada hujung minggu. Kemudahan dan peralatan baharu tersedia!',
      date: '2024-02-15',
      time: language === 'en' ? 'All Day' : 'Sepanjang Hari',
      location: language === 'en' ? 'Swimming Pool Area' : 'Kawasan Kolam Renang',
      image: swimmingPool,
      priority: 'medium',
      status: 'ongoing'
    }
  ];

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
    switch (type) {
      case 'event': return PartyPopper;
      case 'announcement': return Megaphone;
      case 'community': return Users;
      case 'sports': return Calendar;
      default: return Calendar;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'event': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'announcement': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'community': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'sports': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500';
      case 'ongoing': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const currentActivity = activities[currentSlide];
  const TypeIcon = getTypeIcon(currentActivity?.type);

  return (
    <Card className="w-full relative overflow-hidden bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
      <CardContent className="p-0">
        <div className="relative h-80 overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url(${currentActivity?.image})`,
              filter: 'brightness(0.3)'
            }}
          />
          
          {/* Overlay Content */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 flex items-center">
            <div className="flex-1 p-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Badge className={getTypeColor(currentActivity?.type)}>
                  <TypeIcon className="w-3 h-3 mr-1" />
                  {currentActivity?.type.toUpperCase()}
                </Badge>
                <div className={`w-2 h-2 rounded-full ${getStatusColor(currentActivity?.status)}`} />
                <span className="text-sm capitalize">{currentActivity?.status}</span>
              </div>
              
              <h2 className="text-3xl font-bold mb-3 leading-tight">
                {currentActivity?.title}
              </h2>
              
              <p className="text-lg mb-4 text-gray-200 line-clamp-2">
                {currentActivity?.description}
              </p>
              
              <div className="flex items-center gap-6 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(currentActivity?.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{currentActivity?.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{currentActivity?.location}</span>
                </div>
              </div>
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
    </Card>
  );
}