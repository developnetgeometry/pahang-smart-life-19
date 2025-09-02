import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Facility {
  id: string;
  name: string;
  capacity: number;
}

interface Booking {
  id: string;
  facility_id: string;
  user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  purpose?: string;
  duration_hours: number;
  profiles?: {
    full_name: string;
  } | null;
}

interface FacilityBookingCalendarProps {
  facilities: Facility[];
}

export function FacilityBookingCalendar({ facilities }: FacilityBookingCalendarProps) {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFacility, setSelectedFacility] = useState<string>('all');

  useEffect(() => {
    fetchBookings();
  }, [selectedDate, selectedFacility]);

  const fetchBookings = async () => {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          id,
          facility_id,
          user_id,
          booking_date,
          start_time,
          end_time,
          status,
          purpose,
          duration_hours,
          profiles!inner (
            full_name
          )
        `)
        .eq('booking_date', selectedDate);

      if (selectedFacility !== 'all') {
        query = query.eq('facility_id', selectedFacility);
      }

      const { data, error } = await query.order('start_time');

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData: Booking[] = (data || []).map(item => ({
        id: item.id,
        facility_id: item.facility_id,
        user_id: item.user_id,
        booking_date: item.booking_date,
        start_time: item.start_time,
        end_time: item.end_time,
        status: item.status,
        purpose: item.purpose,
        duration_hours: item.duration_hours,
        profiles: Array.isArray(item.profiles) && item.profiles.length > 0 
          ? item.profiles[0] 
          : item.profiles
      }));
      
      setBookings(transformedData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFacilityName = (facilityId: string) => {
    const facility = facilities.find(f => f.id === facilityId);
    return facility?.name || 'Unknown Facility';
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Group bookings by facility for better organization
  const groupedBookings = bookings.reduce((acc, booking) => {
    const facilityId = booking.facility_id;
    if (!acc[facilityId]) {
      acc[facilityId] = [];
    }
    acc[facilityId].push(booking);
    return acc;
  }, {} as Record<string, Booking[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Booking Calendar</h2>
        <div className="flex gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          <select
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Facilities</option>
            {facilities.map(facility => (
              <option key={facility.id} value={facility.id}>
                {facility.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6">
        {Object.keys(groupedBookings).length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Bookings Found</h3>
              <p className="text-muted-foreground">
                No bookings scheduled for {new Date(selectedDate).toLocaleDateString()}.
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedBookings).map(([facilityId, facilityBookings]) => (
            <Card key={facilityId}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {getFacilityName(facilityId)}
                  <Badge variant="outline">
                    {facilityBookings.length} booking{facilityBookings.length !== 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {facilityBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-card"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                          </span>
                        </div>
                        
                        <div>
                          <p className="font-medium">
                            {booking.profiles?.full_name || 'Unknown User'}
                          </p>
                          {booking.purpose && (
                            <p className="text-sm text-muted-foreground">
                              Purpose: {booking.purpose}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                        
                        <span className="text-sm text-muted-foreground">
                          {booking.duration_hours}h
                        </span>
                        
                        {booking.status === 'pending' && (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}