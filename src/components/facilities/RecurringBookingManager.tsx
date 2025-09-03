import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, Repeat, Pause, Play, Trash2, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';

interface RecurringBooking {
  id: string;
  facility_id: string;
  user_id: string;
  title: string;
  purpose: string;
  recurrence_pattern: string;
  recurrence_interval: number;
  days_of_week: number[];
  start_time: string;
  end_time: string;
  start_date: string;
  end_date: string;
  status: string;
  next_booking_date: string;
  created_at: string;
  facilities: { name: string };
  profiles: { full_name: string };
}

interface Facility {
  id: string;
  name: string;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
  { value: 0, label: 'Sunday', short: 'Sun' }
];

export function RecurringBookingManager() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<RecurringBooking[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    facility_id: '',
    title: '',
    purpose: '',
    recurrence_pattern: 'weekly',
    recurrence_interval: 1,
    days_of_week: [] as number[],
    start_time: '',
    end_time: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch facilities
      const { data: facilitiesData } = await supabase
        .from('facilities')
        .select('id, name')
        .eq('is_available', true);

      // Fetch recurring bookings
      const { data: bookingsData } = await supabase
        .from('recurring_bookings')
        .select(`
          *,
          facilities(name)
        `)
        .in('status', ['active', 'paused'])
        .order('created_at', { ascending: false });

      // Fetch user profiles for the bookings
      const bookingsWithProfiles = await Promise.all(
        (bookingsData || []).map(async (booking) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', booking.user_id)
            .single();
          
          return {
            ...booking,
            profiles: profile || { full_name: 'Unknown User' }
          };
        })
      );

      setFacilities(facilitiesData || []);
      setBookings(bookingsWithProfiles);

    } catch (error) {
      console.error('Error fetching recurring bookings:', error);
      toast.error('Failed to load recurring bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.facility_id || !formData.title || !formData.start_time || !formData.end_time || !formData.start_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.recurrence_pattern === 'weekly' && formData.days_of_week.length === 0) {
      toast.error('Please select at least one day of the week for weekly recurrence');
      return;
    }

    try {
      const { error } = await supabase
        .from('recurring_bookings')
        .insert({
          facility_id: formData.facility_id,
          user_id: user?.id,
          title: formData.title,
          purpose: formData.purpose,
          recurrence_pattern: formData.recurrence_pattern,
          recurrence_interval: formData.recurrence_interval,
          days_of_week: formData.recurrence_pattern === 'weekly' ? formData.days_of_week : null,
          start_time: formData.start_time,
          end_time: formData.end_time,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          status: 'active'
        });

      if (error) throw error;

      toast.success('Recurring booking created successfully');
      setOpen(false);
      resetForm();
      fetchData();

    } catch (error) {
      console.error('Error creating recurring booking:', error);
      toast.error('Failed to create recurring booking');
    }
  };

  const toggleBookingStatus = async (bookingId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      
      const { error } = await supabase
        .from('recurring_bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      toast.success(`Recurring booking ${newStatus === 'active' ? 'activated' : 'paused'}`);
      fetchData();

    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  const deleteBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('recurring_bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;

      toast.success('Recurring booking cancelled');
      fetchData();

    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const generateNextBookings = async (bookingId: string) => {
    try {
      // This would trigger the automatic booking generation
      // For now, we'll just show a success message
      toast.success('Next bookings will be generated automatically');

    } catch (error) {
      console.error('Error generating bookings:', error);
      toast.error('Failed to generate bookings');
    }
  };

  const resetForm = () => {
    setFormData({
      facility_id: '',
      title: '',
      purpose: '',
      recurrence_pattern: 'weekly',
      recurrence_interval: 1,
      days_of_week: [],
      start_time: '',
      end_time: '',
      start_date: '',
      end_date: ''
    });
  };

  const handleDayToggle = (day: number, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        days_of_week: [...formData.days_of_week, day].sort()
      });
    } else {
      setFormData({
        ...formData,
        days_of_week: formData.days_of_week.filter(d => d !== day)
      });
    }
  };

  const getRecurrenceDescription = (booking: RecurringBooking) => {
    const { recurrence_pattern, recurrence_interval, days_of_week } = booking;
    
    if (recurrence_pattern === 'daily') {
      return recurrence_interval === 1 ? 'Every day' : `Every ${recurrence_interval} days`;
    }
    
    if (recurrence_pattern === 'weekly') {
      const dayNames = days_of_week?.map(day => 
        DAYS_OF_WEEK.find(d => d.value === day)?.short
      ).join(', ') || '';
      
      const intervalText = recurrence_interval === 1 ? 'Every week' : `Every ${recurrence_interval} weeks`;
      return `${intervalText} on ${dayNames}`;
    }
    
    if (recurrence_pattern === 'monthly') {
      return recurrence_interval === 1 ? 'Every month' : `Every ${recurrence_interval} months`;
    }
    
    return 'Custom recurrence';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recurring Bookings</h2>
          <p className="text-muted-foreground">Manage automated recurring facility bookings</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Recurring Booking
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Recurring Booking</DialogTitle>
              <DialogDescription>
                Set up an automatic recurring booking for regular facility usage
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Booking Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Weekly Team Training"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="facility">Facility *</Label>
                  <Select value={formData.facility_id} onValueChange={(value) => 
                    setFormData({...formData, facility_id: value})
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select facility" />
                    </SelectTrigger>
                    <SelectContent>
                      {facilities.map((facility) => (
                        <SelectItem key={facility.id} value={facility.id}>
                          {facility.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="pattern">Recurrence Pattern</Label>
                  <Select value={formData.recurrence_pattern} onValueChange={(value) => 
                    setFormData({...formData, recurrence_pattern: value, days_of_week: []})
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="interval">Repeat Every</Label>
                  <Select value={formData.recurrence_interval.toString()} onValueChange={(value) => 
                    setFormData({...formData, recurrence_interval: parseInt(value)})
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.recurrence_pattern === 'weekly' && (
                  <div className="md:col-span-2">
                    <Label>Days of Week *</Label>
                    <div className="grid grid-cols-7 gap-2 mt-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <div key={day.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`day-${day.value}`}
                            checked={formData.days_of_week.includes(day.value)}
                            onCheckedChange={(checked) => handleDayToggle(day.value, checked as boolean)}
                          />
                          <Label htmlFor={`day-${day.value}`} className="text-sm">
                            {day.short}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="start_time">Start Time *</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="end_time">End Time *</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">End Date (Optional)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Textarea
                    id="purpose"
                    value={formData.purpose}
                    onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                    placeholder="Describe the purpose of these recurring bookings..."
                    rows={2}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Repeat className="h-4 w-4 mr-2" />
                  Create Recurring Booking
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recurring Bookings List */}
      <div className="grid gap-4">
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Repeat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Recurring Bookings</h3>
              <p className="text-muted-foreground">Create your first recurring booking to get started.</p>
            </CardContent>
          </Card>
        ) : (
          bookings.map((booking) => (
            <Card key={booking.id} className={`border-l-4 ${
              booking.status === 'active' ? 'border-l-green-500' : 
              booking.status === 'paused' ? 'border-l-yellow-500' : 'border-l-red-500'
            }`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{booking.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {booking.profiles.full_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {booking.facilities.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {booking.start_time} - {booking.end_time}
                      </div>
                      <div className="flex items-center gap-1">
                        <Repeat className="h-4 w-4" />
                        {getRecurrenceDescription(booking)}
                      </div>
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {booking.purpose && (
                  <p className="text-sm text-muted-foreground mb-4">{booking.purpose}</p>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <span className="font-medium">Start Date:</span>
                    <div>{new Date(booking.start_date).toLocaleDateString()}</div>
                  </div>
                  {booking.end_date && (
                    <div>
                      <span className="font-medium">End Date:</span>
                      <div>{new Date(booking.end_date).toLocaleDateString()}</div>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Next Booking:</span>
                    <div>{new Date(booking.next_booking_date).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>
                    <div>{new Date(booking.created_at).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={booking.status === 'active'}
                      onCheckedChange={() => toggleBookingStatus(booking.id, booking.status)}
                    />
                    <span className="text-sm">
                      {booking.status === 'active' ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => generateNextBookings(booking.id)}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Generate Next
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => deleteBooking(booking.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}