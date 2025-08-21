import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpcomingEventsWidgetProps {
  language: 'en' | 'ms';
}

export function UpcomingEventsWidget({ language }: UpcomingEventsWidgetProps) {
  const navigate = useNavigate();

  const upcomingEvents = [
    {
      id: 1,
      title: language === 'en' ? 'Community Gotong-Royong' : 'Gotong-Royong Komuniti',
      date: '2024-01-25',
      time: '08:00 AM',
      location: language === 'en' ? 'Community Hall' : 'Dewan Komuniti',
      attendees: 45,
      maxAttendees: 60,
      category: language === 'en' ? 'Community Service' : 'Khidmat Komuniti',
      status: 'upcoming'
    },
    {
      id: 2,
      title: language === 'en' ? 'Children\'s Playground Opening' : 'Pembukaan Taman Permainan Kanak-kanak',
      date: '2024-01-28',
      time: '10:00 AM',
      location: language === 'en' ? 'Block A Playground' : 'Taman Permainan Blok A',
      attendees: 23,
      maxAttendees: 40,
      category: language === 'en' ? 'Celebration' : 'Perasmian',
      status: 'upcoming'
    },
    {
      id: 3,
      title: language === 'en' ? 'Monthly Residents Meeting' : 'Mesyuarat Bulanan Penduduk',
      date: '2024-01-30',
      time: '07:30 PM',
      location: language === 'en' ? 'Management Office' : 'Pejabat Pengurusan',
      attendees: 12,
      maxAttendees: 30,
      category: language === 'en' ? 'Meeting' : 'Mesyuarat',
      status: 'upcoming'
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (language === 'en') {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('ms-MY', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  const getCategoryColor = (category: string) => {
    if (category.includes('Community') || category.includes('Komuniti')) return 'bg-green-500';
    if (category.includes('Celebration') || category.includes('Perasmian')) return 'bg-purple-500';
    if (category.includes('Meeting') || category.includes('Mesyuarat')) return 'bg-blue-500';
    return 'bg-gray-500';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <span>{language === 'en' ? 'Upcoming Events' : 'Acara Akan Datang'}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/announcements')}
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingEvents.map((event) => (
          <div key={event.id} className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium text-sm line-clamp-1">{event.title}</h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{event.time}</span>
                  </div>
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${getCategoryColor(event.category)}`} />
            </div>
            
            <div className="flex items-center gap-1 mb-2 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>{event.attendees}/{event.maxAttendees} {language === 'en' ? 'attending' : 'hadir'}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {event.category}
              </Badge>
            </div>
          </div>
        ))}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-3"
          onClick={() => navigate('/announcements')}
        >
          {language === 'en' ? 'View All Events' : 'Lihat Semua Acara'}
        </Button>
      </CardContent>
    </Card>
  );
}