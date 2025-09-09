import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeSlot {
  time: string;
  isAvailable: boolean;
  bookedBy?: string;
  bookingId?: string;
  purpose?: string;
}

interface TimeSlotPickerProps {
  facilityId: string;
  selectedDate: string;
  onTimeSlotSelect: (startTime: string, endTime: string) => void;
  selectedStartTime?: string;
  selectedEndTime?: string;
}

export function TimeSlotPicker({ 
  facilityId, 
  selectedDate, 
  onTimeSlotSelect,
  selectedStartTime,
  selectedEndTime 
}: TimeSlotPickerProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<string>('');

  // Generate time slots from 8 AM to 10 PM in 1-hour intervals
  const generateTimeSlots = (): string[] => {
    const slots = [];
    for (let hour = 8; hour <= 22; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      slots.push(timeString);
    }
    return slots;
  };

  useEffect(() => {
    if (facilityId && selectedDate) {
      fetchBookings();
    }
  }, [facilityId, selectedDate]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          id,
          start_time,
          end_time,
          purpose,
          status,
          profiles!bookings_user_id_fkey (
            full_name
          )
        `)
        .eq('facility_id', facilityId)
        .eq('booking_date', selectedDate)
        .in('status', ['confirmed', 'pending']);

      if (error) throw error;

      const allTimeSlots = generateTimeSlots();
      const slotsWithAvailability: TimeSlot[] = allTimeSlots.map(time => {
        // Check if this time slot conflicts with any booking
        const conflictingBooking = bookings?.find(booking => {
          const slotTime = `${time}:00`;
          const bookingStart = booking.start_time;
          const bookingEnd = booking.end_time;
          
          // Check if the slot time falls within the booking time range
          return slotTime >= bookingStart && slotTime < bookingEnd;
        });

        return {
          time,
          isAvailable: !conflictingBooking,
          bookedBy: conflictingBooking?.profiles ? 
            (Array.isArray(conflictingBooking.profiles) 
              ? conflictingBooking.profiles[0]?.full_name 
              : conflictingBooking.profiles.full_name) 
            : undefined,
          bookingId: conflictingBooking?.id,
          purpose: conflictingBooking?.purpose
        };
      });

      setTimeSlots(slotsWithAvailability);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
    return `${displayHour}:${minute} ${ampm}`;
  };

  const handleTimeSlotClick = (time: string) => {
    if (!isSelecting) {
      // Start selection
      setIsSelecting(true);
      setSelectionStart(time);
    } else {
      // Complete selection
      const startIndex = timeSlots.findIndex(slot => slot.time === selectionStart);
      const endIndex = timeSlots.findIndex(slot => slot.time === time);
      
      if (startIndex === -1 || endIndex === -1) return;
      
      const start = Math.min(startIndex, endIndex);
      const end = Math.max(startIndex, endIndex);
      
      // Check if all slots in range are available
      const slotsInRange = timeSlots.slice(start, end + 1);
      const allAvailable = slotsInRange.every(slot => slot.isAvailable);
      
      if (allAvailable) {
        const startTime = timeSlots[start].time;
        const endTime = timeSlots[end + 1]?.time || '23:00'; // Next hour or 11 PM
        onTimeSlotSelect(startTime, endTime);
      }
      
      setIsSelecting(false);
      setSelectionStart('');
    }
  };

  const getSlotStatus = (slot: TimeSlot, index: number) => {
    if (!slot.isAvailable) return 'blocked';
    
    if (selectedStartTime && selectedEndTime) {
      const currentTime = slot.time;
      if (currentTime >= selectedStartTime && currentTime < selectedEndTime) {
        return 'selected';
      }
    }
    
    if (isSelecting && selectionStart) {
      const startIndex = timeSlots.findIndex(s => s.time === selectionStart);
      const currentIndex = index;
      
      if (startIndex !== -1) {
        const start = Math.min(startIndex, currentIndex);
        const end = Math.max(startIndex, currentIndex);
        
        if (currentIndex >= start && currentIndex <= end) {
          // Check if all slots in range are available
          const slotsInRange = timeSlots.slice(start, end + 1);
          const allAvailable = slotsInRange.every(s => s.isAvailable);
          return allAvailable ? 'selecting' : 'invalid';
        }
      }
    }
    
    return 'available';
  };

  const getSlotClassName = (status: string) => {
    switch (status) {
      case 'blocked':
        return 'bg-red-100 text-red-800 border-red-200 cursor-not-allowed';
      case 'selected':
        return 'bg-blue-100 text-blue-800 border-blue-200 ring-2 ring-blue-400';
      case 'selecting':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'invalid':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50 cursor-pointer';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">Loading time slots...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Available Time Slots
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white border border-gray-200 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
            <span>Selected</span>
          </div>
        </div>
        {isSelecting && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <AlertCircle className="h-4 w-4" />
            <span>Click another time slot to complete your selection</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
          {timeSlots.map((slot, index) => {
            const status = getSlotStatus(slot, index);
            const className = getSlotClassName(status);
            
            return (
              <div key={slot.time} className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full h-12 text-xs flex flex-col p-1",
                    className
                  )}
                  disabled={!slot.isAvailable}
                  onClick={() => slot.isAvailable && handleTimeSlotClick(slot.time)}
                >
                  <span className="font-medium">{formatTime(slot.time)}</span>
                  {!slot.isAvailable && (
                    <span className="text-xs text-red-600 truncate w-full">
                      Booked
                    </span>
                  )}
                </Button>
                
                {!slot.isAvailable && slot.bookedBy && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-1 py-0.5 rounded text-center max-w-20 truncate">
                    <User className="h-2 w-2 inline mr-1" />
                    {slot.bookedBy.split(' ')[0]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {selectedStartTime && selectedEndTime && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">
                Selected: {formatTime(selectedStartTime)} - {formatTime(selectedEndTime)}
              </span>
            </div>
          </div>
        )}
        
        {isSelecting && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsSelecting(false);
                setSelectionStart('');
              }}
            >
              Cancel Selection
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}