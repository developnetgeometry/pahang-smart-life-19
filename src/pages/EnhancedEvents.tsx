import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, Users, Plus, Search, CalendarPlus, UserCheck, UserX, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRoles } from '@/hooks/use-user-roles';

interface Event {
  id: string;
  title: string;
  description: string;
  date_time: string;
  end_time: string;
  location: string;
  activity_type: string;
  max_participants: number;
  current_participants: number;
  registration_required: boolean;
  registration_deadline?: string;
  status: string;
  priority: string;
  created_by: string;
  image_url?: string;
  is_published: boolean;
  user_registered?: boolean;
  registration_status?: string;
}

interface EventRegistration {
  id: string;
  user_id: string;
  status: string;
  registration_date: string;
  notes?: string;
  user_name?: string;
  user_email?: string;
}

export default function EnhancedEvents() {
  const { language, user } = useAuth();
  const { hasRole } = useUserRoles();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date_time: '',
    end_time: '',
    location: '',
    activity_type: '',
    max_participants: 50,
    registration_required: true,
    registration_deadline: '',
    priority: 'medium'
  });

  const canManageEvents = hasRole('community_admin') || hasRole('district_coordinator') || hasRole('state_admin');

  const text = {
    en: {
      title: 'Community Events',
      description: 'Discover and join community activities',
      search: 'Search events...',
      filterByType: 'Filter by Type',
      all: 'All Types',
      createEvent: 'Create Event',
      register: 'Register',
      unregister: 'Cancel Registration',
      registered: 'Registered',
      waitlisted: 'Waitlisted',
      full: 'Event Full',
      registrations: 'View Registrations',
      eventTitle: 'Event Title',
      eventDescription: 'Description',
      dateTime: 'Date & Time',
      endTime: 'End Time',
      location: 'Location',
      eventType: 'Event Type',
      maxParticipants: 'Max Participants',
      registrationRequired: 'Registration Required',
      registrationDeadline: 'Registration Deadline',
      priority: 'Priority',
      createNewEvent: 'Create New Event',
      save: 'Save Event',
      cancel: 'Cancel',
      noEvents: 'No events found',
      registrationSuccess: 'Successfully registered for event',
      registrationError: 'Failed to register for event',
      eventCreated: 'Event created successfully',
      eventCreateError: 'Failed to create event',
      participants: 'participants',
      deadline: 'Deadline',
      community: 'Community',
      sports: 'Sports',
      education: 'Education',
      social: 'Social',
      maintenance: 'Maintenance',
      meeting: 'Meeting',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent',
      upcoming: 'Upcoming',
      ongoing: 'Ongoing',
      completed: 'Completed',
      cancelled: 'Cancelled'
    },
    ms: {
      title: 'Acara Komuniti',
      description: 'Temui dan sertai aktiviti komuniti',
      search: 'Cari acara...',
      filterByType: 'Tapis mengikut Jenis',
      all: 'Semua Jenis',
      createEvent: 'Cipta Acara',
      register: 'Daftar',
      unregister: 'Batal Pendaftaran',
      registered: 'Berdaftar',
      waitlisted: 'Dalam Senarai Menunggu',
      full: 'Acara Penuh',
      registrations: 'Lihat Pendaftaran',
      eventTitle: 'Tajuk Acara',
      eventDescription: 'Penerangan',
      dateTime: 'Tarikh & Masa',
      endTime: 'Masa Tamat',
      location: 'Lokasi',
      eventType: 'Jenis Acara',
      maxParticipants: 'Peserta Maksimum',
      registrationRequired: 'Pendaftaran Diperlukan',
      registrationDeadline: 'Tarikh Akhir Pendaftaran',
      priority: 'Keutamaan',
      createNewEvent: 'Cipta Acara Baru',
      save: 'Simpan Acara',
      cancel: 'Batal',
      noEvents: 'Tiada acara ditemui',
      registrationSuccess: 'Berjaya mendaftar untuk acara',
      registrationError: 'Gagal mendaftar untuk acara',
      eventCreated: 'Acara berjaya dicipta',
      eventCreateError: 'Gagal mencipta acara',
      participants: 'peserta',
      deadline: 'Tarikh Akhir',
      community: 'Komuniti',
      sports: 'Sukan',
      education: 'Pendidikan',
      social: 'Sosial',
      maintenance: 'Penyelenggaraan',
      meeting: 'Mesyuarat',
      low: 'Rendah',
      medium: 'Sederhana',
      high: 'Tinggi',
      urgent: 'Mendesak',
      upcoming: 'Akan Datang',
      ongoing: 'Berlangsung',
      completed: 'Selesai',
      cancelled: 'Dibatalkan'
    }
  };

  const t = text[language as keyof typeof text] || text.en;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('community_activities')
        .select('*')
        .eq('is_published', true)
        .order('date_time', { ascending: true });

      if (error) throw error;

      // Fetch user registration status for each event
      const eventsWithRegistration = await Promise.all(
        (data || []).map(async (event) => {
          if (!user) {
            return {
              ...event,
              user_registered: false,
              registration_status: undefined
            };
          }

          const { data: registrationData } = await supabase
            .from('event_registrations')
            .select('id')
            .eq('event_id', event.id)
            .eq('user_id', user.id)
            .single();

          return {
            ...event,
            user_registered: !!registrationData,
            registration_status: 'registered'
          };
        })
      );

      setEvents(eventsWithRegistration);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEventRegistrations = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          profiles!event_registrations_user_id_fkey (
            full_name,
            email
          )
        `)
        .eq('event_id', eventId)
        .order('registration_date', { ascending: true });

      if (error) throw error;

      const processedRegistrations = (data || []).map((reg: any) => ({
        ...reg,
        user_name: reg.profiles?.full_name || 'User',
        user_email: reg.profiles?.email || 'user@example.com'
      }));

      setRegistrations(processedRegistrations);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const registerForEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: user?.id,
          status: 'registered'
        });

      if (error) throw error;

      // Update local state
      setEvents(prev => prev.map(event => {
        if (event.id === eventId) {
          return {
            ...event,
            user_registered: true,
            registration_status: 'registered',
            current_participants: event.current_participants + 1
          };
        }
        return event;
      }));

      toast({
        title: "Success",
        description: t.registrationSuccess
      });
    } catch (error) {
      console.error('Error registering for event:', error);
      toast({
        title: "Error",
        description: t.registrationError,
        variant: "destructive"
      });
    }
  };

  const unregisterFromEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Update local state
      setEvents(prev => prev.map(event => {
        if (event.id === eventId) {
          return {
            ...event,
            user_registered: false,
            registration_status: undefined,
            current_participants: Math.max(0, event.current_participants - 1)
          };
        }
        return event;
      }));

      toast({
        title: "Success",
        description: "Successfully cancelled registration"
      });
    } catch (error) {
      console.error('Error unregistering from event:', error);
      toast({
        title: "Error",
        description: "Failed to cancel registration",
        variant: "destructive"
      });
    }
  };

  const createEvent = async () => {
    try {
      const { error } = await supabase
        .from('community_activities')
        .insert({
          ...newEvent,
          created_by: user?.id,
          district_id: user?.district,
          status: 'upcoming',
          is_published: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: t.eventCreated
      });

      setCreateModalOpen(false);
      setNewEvent({
        title: '',
        description: '',
        date_time: '',
        end_time: '',
        location: '',
        activity_type: '',
        max_participants: 50,
        registration_required: true,
        registration_deadline: '',
        priority: 'medium'
      });

      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: t.eventCreateError,
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500';
      case 'ongoing': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || event.activity_type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const eventTypes = ['community', 'sports', 'education', 'social', 'maintenance', 'meeting'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground">{t.description}</p>
        </div>
        
        {canManageEvents && (
          <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t.createEvent}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t.createNewEvent}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">{t.eventTitle}</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter event title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t.eventDescription}</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the event"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date_time">{t.dateTime}</Label>
                    <Input
                      id="date_time"
                      type="datetime-local"
                      value={newEvent.date_time}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, date_time: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_time">{t.endTime}</Label>
                    <Input
                      id="end_time"
                      type="datetime-local"
                      value={newEvent.end_time}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, end_time: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">{t.location}</Label>
                  <Input
                    id="location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Event location"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t.eventType}</Label>
                    <Select
                      value={newEvent.activity_type}
                      onValueChange={(value) => setNewEvent(prev => ({ ...prev, activity_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {t[type as keyof typeof t] as string}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_participants">{t.maxParticipants}</Label>
                    <Input
                      id="max_participants"
                      type="number"
                      value={newEvent.max_participants}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, max_participants: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t.priority}</Label>
                  <Select
                    value={newEvent.priority}
                    onValueChange={(value) => setNewEvent(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t.low}</SelectItem>
                      <SelectItem value="medium">{t.medium}</SelectItem>
                      <SelectItem value="high">{t.high}</SelectItem>
                      <SelectItem value="urgent">{t.urgent}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4">
                  <Button onClick={createEvent} className="flex-1">
                    {t.save}
                  </Button>
                  <Button variant="outline" onClick={() => setCreateModalOpen(false)} className="flex-1">
                    {t.cancel}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t.filterByType} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.all}</SelectItem>
            {eventTypes.map(type => (
              <SelectItem key={type} value={type}>
                {t[type as keyof typeof t] as string}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            {event.image_url && (
              <div className="h-48 bg-cover bg-center rounded-t-lg" 
                   style={{ backgroundImage: `url(${event.image_url})` }} />
            )}
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <div className="flex gap-1">
                  <Badge className={`${getPriorityColor(event.priority)} text-white`}>
                    {t[event.priority as keyof typeof t] as string}
                  </Badge>
                  <Badge className={`${getStatusColor(event.status)} text-white`}>
                    {t[event.status as keyof typeof t] as string}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(event.date_time).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {new Date(event.date_time).toLocaleTimeString()} - {new Date(event.end_time).toLocaleTimeString()}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {event.location}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {event.current_participants}/{event.max_participants} {t.participants}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {event.description}
              </p>

              {event.registration_deadline && (
                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <AlertCircle className="w-4 h-4" />
                  {t.deadline}: {new Date(event.registration_deadline).toLocaleDateString()}
                </div>
              )}

              <div className="flex gap-2">
                {event.registration_required && !event.user_registered && (
                  <Button
                    size="sm"
                    onClick={() => registerForEvent(event.id)}
                    disabled={event.current_participants >= event.max_participants}
                    className="flex-1"
                  >
                    {event.current_participants >= event.max_participants ? (
                      <>
                        <UserX className="w-4 h-4 mr-2" />
                        {t.full}
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4 mr-2" />
                        {t.register}
                      </>
                    )}
                  </Button>
                )}

                {event.user_registered && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => unregisterFromEvent(event.id)}
                    className="flex-1"
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    {t.unregister}
                  </Button>
                )}

                {canManageEvents && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedEvent(event);
                      fetchEventRegistrations(event.id);
                      setRegistrationModalOpen(true);
                    }}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {t.registrations}
                  </Button>
                )}
              </div>

              {event.user_registered && (
                <Badge variant="secondary" className="w-full justify-center">
                  <UserCheck className="w-4 h-4 mr-2" />
                  {t.registered}
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <Card>
          <CardContent className="text-center py-10">
            <CalendarPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{t.noEvents}</p>
          </CardContent>
        </Card>
      )}

      {/* Event Registrations Modal */}
      <Dialog open={registrationModalOpen} onOpenChange={setRegistrationModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t.registrations} - {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {registrations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No registrations yet
              </p>
            ) : (
              <div className="space-y-3">
                {registrations.map((registration) => (
                  <div key={registration.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{registration.user_name}</p>
                      <p className="text-sm text-muted-foreground">{registration.user_email}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={registration.status === 'registered' ? 'default' : 'secondary'}>
                        {registration.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(registration.registration_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}