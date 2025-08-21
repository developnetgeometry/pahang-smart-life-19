import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface UpcomingEventsWidgetProps {
  language: 'en' | 'ms';
}

export function UpcomingEventsWidget({ language }: UpcomingEventsWidgetProps) {
  const navigate = useNavigate();

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .gte('start_date', new Date().toISOString().split('T')[0])
          .eq('status', 'scheduled')
          .order('start_date', { ascending: true })
          .limit(3);

        if (error) throw error;

        const transformedEvents = (data || []).map(event => ({
          id: event.id,
          title: event.title,
          date: event.start_date,
          time: event.start_time || '08:00',
          location: event.location || 'Community Hall',
          attendees: 0, // Could be enhanced with registration count
          maxAttendees: event.max_participants || 50,
          category: event.event_type || 'General',
          status: 'upcoming'
        }));

        setEvents(transformedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        // Fallback to demo data
        setEvents([
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
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [language]);

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
          onClick={() => navigate('/events')}
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 bg-muted/30 rounded-lg animate-pulse">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          events.map((event) => (
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
        ))
        )}
        
        <Button
          variant="outline" 
          size="sm" 
          className="w-full mt-3"
          onClick={() => navigate('/events')}
        >
          {language === 'en' ? 'View All Events' : 'Lihat Semua Acara'}
        </Button>
      </CardContent>
    </Card>
  );
}