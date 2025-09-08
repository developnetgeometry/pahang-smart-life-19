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
export function UpcomingEventsWidget({
  language
}: UpcomingEventsWidgetProps) {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('events').select('*').gte('start_date', new Date().toISOString().split('T')[0]).eq('status', 'scheduled').order('start_date', {
          ascending: true
        }).limit(3);
        if (error) throw error;
        const transformedEvents = (data || []).map(event => ({
          id: event.id,
          title: event.title,
          date: event.start_date,
          time: event.start_time || '08:00',
          location: event.location || 'Community Hall',
          attendees: 0,
          // Could be enhanced with registration count
          maxAttendees: event.max_participants || 50,
          category: event.event_type || 'General',
          status: 'upcoming'
        }));
        setEvents(transformedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        // Fallback to demo data
        setEvents([{
          id: 1,
          title: language === 'en' ? 'Community Gotong-Royong' : 'Gotong-Royong Komuniti',
          date: '2024-01-25',
          time: '08:00 AM',
          location: language === 'en' ? 'Community Hall' : 'Dewan Komuniti',
          attendees: 45,
          maxAttendees: 60,
          category: language === 'en' ? 'Community Service' : 'Khidmat Komuniti',
          status: 'upcoming'
        }]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [language]);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (language === 'en') {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } else {
      return date.toLocaleDateString('ms-MY', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };
  const getCategoryColor = (category: string) => {
    if (category.includes('Community') || category.includes('Komuniti')) return 'bg-green-500';
    if (category.includes('Celebration') || category.includes('Perasmian')) return 'bg-purple-500';
    if (category.includes('Meeting') || category.includes('Mesyuarat')) return 'bg-blue-500';
    return 'bg-gray-500';
  };
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          {language === 'en' ? 'Upcoming Events' : 'Acara Akan Datang'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {language === 'en' ? 'No upcoming events' : 'Tiada acara akan datang'}
          </p>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="border-l-4 border-primary/20 pl-3 space-y-1">
                <h4 className="font-medium text-sm line-clamp-2">{event.title}</h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatDate(event.date)} • {event.time}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {event.location}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {event.category}
                </Badge>
              </div>
            ))}
          </div>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-4" 
          onClick={() => navigate('/events')}
        >
          {language === 'en' ? 'View All Events' : 'Lihat Semua Acara'}
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}