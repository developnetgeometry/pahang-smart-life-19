import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import EmergencyLocationViewer from './EmergencyLocationViewer';
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Shield,
  Eye,
  Navigation
} from 'lucide-react';

interface PanicAlert {
  id: string;
  location_latitude?: number;
  location_longitude?: number;
  location_address?: string;
  alert_status: string;
  response_time?: string;
  responded_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface PanicAlertHistoryProps {
  language: 'en' | 'ms';
}

export default function PanicAlertHistory({ language }: PanicAlertHistoryProps) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<PanicAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address?: string | null } | null>(null);

  useEffect(() => {
    if (user) {
      fetchMyAlerts();
    }
  }, [user]);

  const fetchMyAlerts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('panic_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching panic alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-500 text-white';
      case 'responded': return 'bg-yellow-500 text-white';
      case 'resolved': return 'bg-green-500 text-white';
      case 'false_alarm': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertTriangle className="w-4 h-4" />;
      case 'responded': return <Shield className="w-4 h-4" />;
      case 'resolved': return <CheckCircle2 className="w-4 h-4" />;
      case 'false_alarm': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    if (language === 'en') {
      switch (status) {
        case 'active': return 'Active';
        case 'responded': return 'Responded';
        case 'resolved': return 'Resolved';
        case 'false_alarm': return 'False Alarm';
        default: return status;
      }
    } else {
      switch (status) {
        case 'active': return 'Aktif';
        case 'responded': return 'Ditindak Balas';
        case 'resolved': return 'Diselesaikan';
        case 'false_alarm': return 'Amaran Palsu';
        default: return status;
      }
    }
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString(language === 'en' ? 'en-US' : 'ms-MY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openMaps = (alert: PanicAlert) => {
    if (alert.location_latitude && alert.location_longitude) {
      setSelectedLocation({
        lat: alert.location_latitude,
        lng: alert.location_longitude,
        address: alert.location_address
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse p-6 border rounded-lg">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              {language === 'en' ? 'No panic alerts found' : 'Tiada amaran panik dijumpai'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'en' 
                ? 'Your panic alert history will appear here when you use the panic button.' 
                : 'Sejarah amaran panik anda akan muncul di sini apabila anda menggunakan butang panik.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-6 border rounded-lg bg-card space-y-4">
                {/* Header with status and timestamp */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Badge className={getStatusColor(alert.alert_status)}>
                      {getStatusIcon(alert.alert_status)}
                      <span className="ml-2">{getStatusText(alert.alert_status)}</span>
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {formatDateTime(alert.created_at)}
                    </div>
                  </div>
                  
                  {/* Location button */}
                  {alert.location_latitude && alert.location_longitude && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openMaps(alert)}
                      className="flex items-center gap-1"
                    >
                      <MapPin className="w-4 h-4" />
                      {language === 'en' ? 'View Location' : 'Lihat Lokasi'}
                    </Button>
                  )}
                </div>

                {/* Location details */}
                {alert.location_address && (
                  <div className="flex items-start gap-2 text-sm">
                    <Navigation className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <span className="text-muted-foreground">{alert.location_address}</span>
                  </div>
                )}

                {/* Response details */}
                {(alert.alert_status !== 'active') && (
                  <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      {language === 'en' ? 'Security Response' : 'Tindak Balas Keselamatan'}
                    </h4>
                    
                    {alert.responded_by && (
                      <p className="text-sm text-muted-foreground">
                        <strong>
                          {language === 'en' ? 'Responded by ID: ' : 'Ditindak balas oleh ID: '}
                        </strong>
                        {alert.responded_by}
                      </p>
                    )}
                    
                    {alert.response_time && (
                      <p className="text-sm text-muted-foreground">
                        <strong>
                          {language === 'en' ? 'Response time: ' : 'Masa tindak balas: '}
                        </strong>
                        {formatDateTime(alert.response_time)}
                      </p>
                    )}
                    
                    {alert.notes && (
                      <div className="space-y-1">
                        <strong className="text-sm">
                          {language === 'en' ? 'Comments:' : 'Komen:'}
                        </strong>
                        <p className="text-sm bg-background p-3 rounded border">
                          {alert.notes}
                        </p>
                      </div>
                    )}
                    
                    {alert.updated_at !== alert.created_at && (
                      <p className="text-xs text-muted-foreground">
                        {language === 'en' ? 'Last updated: ' : 'Kemas kini terakhir: '}
                        {formatDateTime(alert.updated_at)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Location viewer dialog */}
      {selectedLocation && (
        <Dialog open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {language === 'en' ? 'Alert Location' : 'Lokasi Amaran'}
              </DialogTitle>
              {selectedLocation.address && (
                <DialogDescription>
                  {selectedLocation.address}
                </DialogDescription>
              )}
            </DialogHeader>
            <div className="h-96">
              <EmergencyLocationViewer
                latitude={selectedLocation.lat}
                longitude={selectedLocation.lng}
                address={selectedLocation.address}
                isOpen={true}
                onClose={() => setSelectedLocation(null)}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}