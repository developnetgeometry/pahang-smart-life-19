import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useModuleAccess } from '@/hooks/use-module-access';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, MapPin, Users, Plus, Shield } from 'lucide-react';

interface Booking {
  id: string;
  facility_name: string;
  date: string;
  time: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  location: string;
  capacity: number;
}

export default function MyBookings() {
  const { language, user } = useAuth();
  const { isModuleEnabled } = useModuleAccess();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isModuleEnabled('bookings')) {
      setLoading(false);
      return;
    }
    
    fetchBookings();
  }, [user, isModuleEnabled]);

  const fetchBookings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          facilities!facility_id (
            name,
            location,
            capacity
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedBookings: Booking[] = (data || []).map(booking => ({
        id: booking.id,
        facility_name: booking.facilities?.name || 'Unknown Facility',
        date: booking.booking_date,
        time: booking.start_time,
        duration: booking.duration_hours,
        status: booking.status === 'confirmed' ? 'confirmed' : booking.status === 'pending' ? 'pending' : 'cancelled',
        location: booking.facilities?.location || '',
        capacity: booking.facilities?.capacity || 0
      }));

      setBookings(transformedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to fetch bookings' : 'Gagal mendapatkan tempahan'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    if (language === 'en') {
      switch (status) {
        case 'confirmed': return 'Confirmed';
        case 'pending': return 'Pending';
        case 'cancelled': return 'Cancelled';
        default: return 'Unknown';
      }
    } else {
      switch (status) {
        case 'confirmed': return 'Disahkan';
        case 'pending': return 'Menunggu';
        case 'cancelled': return 'Dibatalkan';
        default: return 'Tidak Diketahui';
      }
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .eq('user_id', user.id);

      if (error) throw error;

      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' }
          : booking
      ));

      toast({
        title: language === 'en' ? 'Booking Cancelled' : 'Tempahan Dibatalkan',
        description: language === 'en' 
          ? 'Your booking has been cancelled successfully' 
          : 'Tempahan anda telah berjaya dibatalkan'
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to cancel booking' : 'Gagal membatalkan tempahan'
      });
    }
  };

  // Check if bookings module is enabled
  if (!isModuleEnabled('bookings')) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Module Disabled</h3>
            <p className="text-sm text-muted-foreground">
              The Bookings module is not enabled for this community.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'en' ? 'My Bookings' : 'Tempahan Saya'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Manage your facility reservations'
              : 'Urus tempahan kemudahan anda'
            }
          </p>
        </div>
        <Button className="bg-gradient-primary" onClick={() => navigate('/facilities')}>
          <Plus className="w-4 h-4 mr-2" />
          {language === 'en' ? 'New Booking' : 'Tempahan Baru'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Active Bookings' : 'Tempahan Aktif'}
                </p>
                <p className="text-2xl font-bold">
                  {bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'This Month' : 'Bulan Ini'}
                </p>
                <p className="text-2xl font-bold">
                  {bookings.filter(b => {
                    const bookingDate = new Date(b.date);
                    const now = new Date();
                    return bookingDate.getMonth() === now.getMonth() && 
                           bookingDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Total Hours' : 'Jumlah Jam'}
                </p>
                <p className="text-2xl font-bold">
                  {bookings.reduce((total, booking) => total + booking.duration, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{booking.facility_name}</CardTitle>
                  <CardDescription className="flex items-center space-x-4 mt-2">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {booking.date}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {booking.time} ({booking.duration}h)
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {booking.location}
                    </span>
                  </CardDescription>
                </div>
                <Badge className={`${getStatusColor(booking.status)} text-white`}>
                  {getStatusText(booking.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {language === 'en' ? 'Capacity' : 'Kapasiti'}: {booking.capacity}
                  </span>
                </div>
                <div className="space-x-2">
                  {booking.status === 'confirmed' && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          {language === 'en' ? 'Modify' : 'Ubah'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>
                            {language === 'en' ? 'Modify Booking' : 'Ubah Tempahan'}
                          </DialogTitle>
                          <DialogDescription>
                            {language === 'en' 
                              ? 'Update your booking details below.'
                              : 'Kemas kini butiran tempahan anda di bawah.'
                            }
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right">
                              {language === 'en' ? 'Date' : 'Tarikh'}
                            </Label>
                            <Input
                              id="date"
                              type="date"
                              defaultValue={booking.date}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="time" className="text-right">
                              {language === 'en' ? 'Time' : 'Masa'}
                            </Label>
                            <Input
                              id="time"
                              type="time"
                              defaultValue={booking.time}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="duration" className="text-right">
                              {language === 'en' ? 'Duration' : 'Tempoh'}
                            </Label>
                            <Input
                              id="duration"
                              type="number"
                              defaultValue={booking.duration}
                              min="1"
                              max="8"
                              className="col-span-3"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline">
                            {language === 'en' ? 'Cancel' : 'Batal'}
                          </Button>
                          <Button type="submit">
                            {language === 'en' ? 'Save Changes' : 'Simpan Perubahan'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  {booking.status !== 'cancelled' && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      {language === 'en' ? 'Cancel' : 'Batal'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {bookings.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {language === 'en' ? 'No bookings yet' : 'Tiada tempahan lagi'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {language === 'en' 
                ? 'Start by booking a facility for your community activities.'
                : 'Mulakan dengan menempah kemudahan untuk aktiviti komuniti anda.'
              }
            </p>
            <Button className="bg-gradient-primary" onClick={() => navigate('/facilities')}>
              {language === 'en' ? 'Make a booking' : 'Buat tempahan'}
            </Button>
          </CardContent>
        </Card>
      )}
      </div>
  );
}