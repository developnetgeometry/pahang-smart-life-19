import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Clock, 
  Calendar, 
  MapPin, 
  User, 
  Send,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BookingReminder {
  id: string;
  booking_id: string;
  reminder_type: string;
  scheduled_for: string;
  sent_at?: string;
  is_active: boolean;
  notification_method: string;
  booking?: {
    id: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    purpose?: string;
    user_id: string;
    profiles?: {
      full_name: string;
      email: string;
    };
    facilities?: {
      name: string;
    };
  };
}

export default function BookingReminderManager() {
  const { language } = useAuth();
  const { toast } = useToast();

  const [reminders, setReminders] = useState<BookingReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent'>('all');

  const t = {
    title: language === 'en' ? 'Booking Reminders' : 'Peringatan Tempahan',
    description: language === 'en' 
      ? 'Manage automated booking reminders and notifications' 
      : 'Urus peringatan dan notifikasi tempahan automatik',
    pending: language === 'en' ? 'Pending' : 'Menunggu',
    sent: language === 'en' ? 'Sent' : 'Telah Dihantar',
    sendNow: language === 'en' ? 'Send Now' : 'Hantar Sekarang',
    scheduledFor: language === 'en' ? 'Scheduled for' : 'Dijadualkan untuk',
    sentAt: language === 'en' ? 'Sent at' : 'Dihantar pada',
    reminderType: {
      booking_upcoming_24h: language === 'en' ? '24 Hour Reminder' : 'Peringatan 24 Jam',
      booking_upcoming_2h: language === 'en' ? '2 Hour Reminder' : 'Peringatan 2 Jam',
      booking_starting_soon: language === 'en' ? 'Starting Soon' : 'Akan Bermula',
      booking_cancelled: language === 'en' ? 'Booking Cancelled' : 'Tempahan Dibatalkan'
    },
    notificationMethod: {
      in_app: language === 'en' ? 'In-App' : 'Dalam Aplikasi',
      email: language === 'en' ? 'Email' : 'Emel',
      sms: language === 'en' ? 'SMS' : 'SMS',
      push: language === 'en' ? 'Push' : 'Tolak'
    },
    filter: language === 'en' ? 'Filter' : 'Penapis',
    all: language === 'en' ? 'All' : 'Semua',
    noReminders: language === 'en' ? 'No reminders found' : 'Tiada peringatan dijumpai',
    loadingError: language === 'en' ? 'Error loading reminders' : 'Ralat memuatkan peringatan',
    sendSuccess: language === 'en' ? 'Reminder sent successfully' : 'Peringatan berjaya dihantar',
    sendError: language === 'en' ? 'Error sending reminder' : 'Ralat menghantar peringatan',
    upcoming: language === 'en' ? 'Upcoming' : 'Akan Datang',
    overdue: language === 'en' ? 'Overdue' : 'Tertunggak'
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('booking_reminders')
        .select(`
          *,
          booking:bookings!booking_reminders_booking_id_fkey(
            id,
            booking_date,
            start_time,
            end_time,
            purpose,
            user_id,
            profiles!bookings_user_id_fkey(
              full_name,
              email
            ),
            facilities!bookings_facility_id_fkey(
              name
            )
          )
        `)
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      toast({
        title: t.loadingError,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (reminderId: string) => {
    try {
      setSending(reminderId);

      const reminder = reminders.find(r => r.id === reminderId);
      if (!reminder || !reminder.booking) return;

      // Create notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          recipient_id: reminder.booking.user_id,
          title: getNotificationTitle(reminder),
          message: getNotificationMessage(reminder),
          notification_type: 'booking_reminder',
          category: 'booking',
          reference_id: reminder.booking_id,
          reference_table: 'bookings'
        });

      if (notificationError) throw notificationError;

      // Mark reminder as sent
      const { error: updateError } = await supabase
        .from('booking_reminders')
        .update({
          sent_at: new Date().toISOString()
        })
        .eq('id', reminderId);

      if (updateError) throw updateError;

      // Update local state
      setReminders(prev => prev.map(reminder => 
        reminder.id === reminderId 
          ? { ...reminder, sent_at: new Date().toISOString() }
          : reminder
      ));

      toast({
        title: t.sendSuccess
      });
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast({
        title: t.sendError,
        variant: 'destructive'
      });
    } finally {
      setSending(null);
    }
  };

  const getNotificationTitle = (reminder: BookingReminder): string => {
    const facilityName = reminder.booking?.facilities?.name || '';
    
    switch (reminder.reminder_type) {
      case 'booking_upcoming_24h':
        return language === 'en' 
          ? `Reminder: ${facilityName} booking tomorrow`
          : `Peringatan: Tempahan ${facilityName} esok`;
      case 'booking_upcoming_2h':
        return language === 'en'
          ? `Starting soon: ${facilityName} booking in 2 hours`
          : `Bermula tidak lama lagi: Tempahan ${facilityName} dalam 2 jam`;
      default:
        return language === 'en' 
          ? `Booking reminder: ${facilityName}`
          : `Peringatan tempahan: ${facilityName}`;
    }
  };

  const getNotificationMessage = (reminder: BookingReminder): string => {
    const booking = reminder.booking;
    if (!booking) return '';

    const date = new Date(booking.booking_date).toLocaleDateString();
    const startTime = formatTime(booking.start_time);
    const endTime = formatTime(booking.end_time);
    const facilityName = booking.facilities?.name || '';

    return language === 'en'
      ? `Your booking for ${facilityName} is scheduled for ${date} from ${startTime} to ${endTime}.`
      : `Tempahan anda untuk ${facilityName} dijadualkan pada ${date} dari ${startTime} hingga ${endTime}.`;
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusBadge = (reminder: BookingReminder) => {
    const now = new Date();
    const scheduledDate = new Date(reminder.scheduled_for);
    
    if (reminder.sent_at) {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          {t.sent}
        </Badge>
      );
    } else if (scheduledDate < now) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {t.overdue}
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {t.pending}
        </Badge>
      );
    }
  };

  const filteredReminders = reminders.filter(reminder => {
    if (filter === 'all') return true;
    if (filter === 'sent') return !!reminder.sent_at;
    if (filter === 'pending') return !reminder.sent_at;
    return true;
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.description}</CardDescription>
        
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t.filter} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.all}</SelectItem>
              <SelectItem value="pending">{t.pending}</SelectItem>
              <SelectItem value="sent">{t.sent}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredReminders.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t.noReminders}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReminders.map((reminder) => (
              <Card key={reminder.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(reminder)}
                    <Badge variant="outline">
                      {t.reminderType[reminder.reminder_type as keyof typeof t.reminderType] || reminder.reminder_type}
                    </Badge>
                    <Badge variant="secondary">
                      {t.notificationMethod[reminder.notification_method as keyof typeof t.notificationMethod] || reminder.notification_method}
                    </Badge>
                  </div>
                  
                  {!reminder.sent_at && (
                    <Button
                      size="sm"
                      onClick={() => handleSendReminder(reminder.id)}
                      disabled={sending === reminder.id}
                      className="flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {sending === reminder.id ? 'Sending...' : t.sendNow}
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{reminder.booking?.facilities?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{reminder.booking?.profiles?.full_name}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(reminder.booking?.booking_date || '').toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatTime(reminder.booking?.start_time || '')} - {formatTime(reminder.booking?.end_time || '')}
                      </span>
                    </div>
                  </div>

                  {reminder.booking?.purpose && (
                    <div className="text-sm">
                      <strong>Purpose:</strong> {reminder.booking.purpose}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t">
                    <span>
                      {t.scheduledFor}: {new Date(reminder.scheduled_for).toLocaleString()}
                    </span>
                    {reminder.sent_at && (
                      <span>
                        {t.sentAt}: {new Date(reminder.sent_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}