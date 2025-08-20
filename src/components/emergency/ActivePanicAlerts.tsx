import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle,
  Eye,
  Navigation,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PanicAlert {
  id: string;
  user_id: string;
  location_latitude?: number;
  location_longitude?: number;
  location_address?: string;
  alert_status: 'active' | 'responded' | 'resolved' | 'false_alarm';
  response_time?: string;
  responded_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  district_id?: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export default function ActivePanicAlerts() {
  const { language, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<PanicAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<PanicAlert | null>(null);
  const [responseNotes, setResponseNotes] = useState('');

  useEffect(() => {
    fetchActiveAlerts();
    
    // Set up real-time subscription for new panic alerts
    const channel = supabase
      .channel('panic-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'panic_alerts'
        },
        (payload) => {
          console.log('New panic alert received:', payload);
          fetchActiveAlerts(); // Refresh the list
          
          // Show urgent notification
          toast({
            title: '🚨 NEW PANIC ALERT',
            description: language === 'en' 
              ? 'A resident has triggered a panic alert. Immediate attention required!'
              : 'Seorang penduduk telah mencetuskan amaran panik. Perhatian segera diperlukan!',
            variant: 'destructive',
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [language, toast]);

  const fetchActiveAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('panic_alerts')
        .select(`*`)
        .eq('alert_status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching active panic alerts:', error);
        return;
      }

      // Fetch profiles separately for each user_id
      const userIds = [...new Set(data?.map(alert => alert.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      // Create a map of user profiles
      const profileMap = new Map(
        profiles?.map(profile => [profile.id, profile]) || []
      );

      const alertsWithProfiles: PanicAlert[] = (data || []).map(alert => ({
        ...alert,
        alert_status: alert.alert_status as 'active' | 'responded' | 'resolved' | 'false_alarm',
        profiles: profileMap.get(alert.user_id)
      }));

      setAlerts(alertsWithProfiles);
    } catch (error) {
      console.error('Error fetching active panic alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAlertStatus = async (alertId: string, status: PanicAlert['alert_status'], notes?: string) => {
    try {
      const { error } = await supabase
        .from('panic_alerts')
        .update({
          alert_status: status,
          response_time: new Date().toISOString(),
          responded_by: user?.id,
          notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) {
        console.error('Error updating alert:', error);
        toast({
          title: 'Error',
          description: 'Failed to update alert status',
          variant: 'destructive',
        });
        return;
      }

      // Refresh alerts
      fetchActiveAlerts();
      setSelectedAlert(null);
      setResponseNotes('');

      toast({
        title: 'Success',
        description: language === 'en' 
          ? `Alert marked as ${status}`
          : `Amaran ditandakan sebagai ${status}`,
      });

    } catch (error) {
      console.error('Error updating alert status:', error);
    }
  };

  const openMaps = (alert: PanicAlert) => {
    if (alert.location_latitude && alert.location_longitude) {
      const url = `https://www.google.com/maps?q=${alert.location_latitude},${alert.location_longitude}`;
      window.open(url, '_blank');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return language === 'en' ? 'Just now' : 'Baru sahaja';
    if (diffInMinutes < 60) return `${diffInMinutes}${language === 'en' ? 'm ago' : 'm lalu'}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}${language === 'en' ? 'h ago' : 'j lalu'}`;
    
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'ms-MY');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-32">Loading...</div>;
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">
          {language === 'en' ? 'No active panic alerts' : 'Tiada amaran panik aktif'}
        </p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/panic-alerts')}
          className="mt-2"
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          {language === 'en' ? 'View All Alerts' : 'Lihat Semua Amaran'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="text-lg px-3 py-1">
            {alerts.length} {language === 'en' ? 'Active' : 'Aktif'}
          </Badge>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate('/panic-alerts')}
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          {language === 'en' ? 'Manage All' : 'Urus Semua'}
        </Button>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-semibold text-sm">
                    {alert.profiles?.full_name || alert.profiles?.email || 'Unknown User'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(alert.created_at)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {alert.location_latitude && alert.location_longitude && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openMaps(alert)}
                  >
                    <Navigation className="w-3 h-3 mr-1" />
                    {language === 'en' ? 'Location' : 'Lokasi'}
                  </Button>
                )}
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => {
                        setSelectedAlert(alert);
                        setResponseNotes('');
                      }}
                    >
                      {language === 'en' ? 'RESPOND' : 'RESPON'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        {language === 'en' ? 'Emergency Response' : 'Respon Kecemasan'}
                      </DialogTitle>
                      <DialogDescription>
                        {language === 'en' ? 'Respond to panic alert' : 'Respon kepada amaran panik'}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4" />
                          <span className="font-semibold">
                            {alert.profiles?.full_name || alert.profiles?.email}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">
                            {new Date(alert.created_at).toLocaleString(language === 'en' ? 'en-US' : 'ms-MY')}
                          </span>
                        </div>
                        
                        {alert.location_address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{alert.location_address}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium">
                          {language === 'en' ? 'Response Notes' : 'Nota Respon'}
                        </label>
                        <Textarea
                          value={responseNotes}
                          onChange={(e) => setResponseNotes(e.target.value)}
                          placeholder={
                            language === 'en' 
                              ? 'Add notes about your response...'
                              : 'Tambah nota tentang respon anda...'
                          }
                          className="mt-2"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => updateAlertStatus(alert.id, 'responded', responseNotes)}
                          className="flex-1"
                          variant="default"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {language === 'en' ? 'Mark as Responded' : 'Tandakan sebagai Direspon'}
                        </Button>
                        
                        <Button
                          onClick={() => updateAlertStatus(alert.id, 'resolved', responseNotes)}
                          className="flex-1"
                          variant="default"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {language === 'en' ? 'Mark as Resolved' : 'Tandakan sebagai Selesai'}
                        </Button>
                      </div>

                      <Button
                        onClick={() => updateAlertStatus(alert.id, 'false_alarm', responseNotes)}
                        variant="outline"
                        className="w-full"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'Mark as False Alarm' : 'Tandakan sebagai Amaran Palsu'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}