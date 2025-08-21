import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ServiceManagement } from '@/components/services/ServiceManagement';
import { QuickServicesWidget } from './QuickServicesWidget';
import { UpcomingEventsWidget } from './UpcomingEventsWidget';
import { WeatherWidget } from './WeatherWidget';
import { CommunityDirectoryWidget } from './CommunityDirectoryWidget';
import { MaintenanceTrackerWidget } from './MaintenanceTrackerWidget';
import { MapPin } from 'lucide-react';
import { 
  Calendar, 
  Users, 
  Package,
  Megaphone,
  PartyPopper,
  UserPlus,
  FileText,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building,
  Shield,
  Activity
} from 'lucide-react';

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export function ResidentDashboard() {
  const { language, user } = useAuth();
  const { toast } = useToast();
  const [isPressed, setIsPressed] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [progress, setProgress] = useState(0);
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  const HOLD_DURATION = 3000; // 3 seconds

  useEffect(() => {
    // Get user's current location on component mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          
          // Reverse geocoding to get address
          reverseGeocode(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();
      
      if (data.display_name || data.locality) {
        setLocation(prev => prev ? {
          ...prev,
          address: data.display_name || `${data.locality}, ${data.countryName}`
        } : null);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const startHold = () => {
    if (isTriggering) return;

    setIsPressed(true);
    setProgress(0);

    // Start progress animation
    progressRef.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (HOLD_DURATION / 100));
        if (newProgress >= 100) {
          if (progressRef.current) {
            clearInterval(progressRef.current);
          }
          return 100;
        }
        return newProgress;
      });
    }, 100);

    // Start hold timer
    timerRef.current = setTimeout(() => {
      triggerPanicAlert();
    }, HOLD_DURATION);
  };

  const endHold = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
    setIsPressed(false);
    setProgress(0);
  };

  const triggerPanicAlert = async () => {
    setIsTriggering(true);
    setIsPressed(false);
    setProgress(0);

    try {
      // Get current location if not already available
      let currentLocation = location;
      if (!currentLocation && navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          
          currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
        } catch (error) {
          console.error('Error getting current location:', error);
        }
      }

      // Create panic alert in database
      const { data: panicAlert, error } = await supabase
        .from('panic_alerts')
        .insert({
          user_id: user?.id,
          location_latitude: currentLocation?.latitude,
          location_longitude: currentLocation?.longitude,
          location_address: currentLocation?.address,
          alert_status: 'active',
          district_id: '00000000-0000-0000-0000-000000000001'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Call edge function to notify security
      const { error: notifyError } = await supabase.functions.invoke('notify-panic-alert', {
        body: {
          panicAlertId: panicAlert.id,
          userLocation: currentLocation,
          userName: user?.email
        }
      });

      if (notifyError) {
        console.error('Error notifying security:', notifyError);
      }

      toast({
        title: language === 'en' ? 'Emergency Alert Sent!' : 'Amaran Kecemasan Dihantar!',
        description: language === 'en' 
          ? 'Security has been notified of your emergency. Help is on the way.' 
          : 'Keselamatan telah dimaklumkan tentang kecemasan anda. Bantuan sedang dalam perjalanan.',
      });

      setShowConfirm(true);

    } catch (error) {
      console.error('Error triggering panic alert:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' 
          ? 'Failed to send emergency alert. Please try again or contact security directly.' 
          : 'Gagal menghantar amaran kecemasan. Sila cuba lagi atau hubungi keselamatan secara langsung.',
        variant: 'destructive',
      });
    } finally {
      setIsTriggering(false);
    }
  };

  const personalMetrics = [
    {
      title: language === 'en' ? 'My Bookings' : 'Tempahan Saya',
      value: '1',
      icon: Calendar,
      trend: 'Pool - 8PM today',
      status: 'active'
    },
    {
      title: language === 'en' ? 'Visitors Today' : 'Pelawat Hari Ini',
      value: '2',
      icon: Users,
      trend: 'Expected arrivals'
    },
    {
      title: language === 'en' ? 'Active Complaints' : 'Aduan Aktif',
      value: '0',
      icon: FileText,
      trend: 'All resolved',
      status: 'positive'
    },
    {
      title: language === 'en' ? 'Upcoming Events' : 'Acara Akan Datang',
      value: '3',
      icon: PartyPopper,
      trend: 'This month',
      status: 'active'
    }
  ];

  const communityUpdates = [
    {
      type: 'maintenance',
      title: language === 'en' ? 'Pool Maintenance Scheduled' : 'Penyelenggaraan Kolam Dijadualkan',
      message: language === 'en' ? 'Pool maintenance scheduled for tomorrow 9AM-12PM' : 'Penyelenggaraan kolam dijadualkan esok 9AM-12PM',
      time: '2 hours ago',
      priority: 'medium',
      details: {
        description: language === 'en' ? 'The swimming pool will undergo routine maintenance and cleaning. The pool area will be closed to ensure safety during the maintenance period.' : 'Kolam renang akan menjalani penyelenggaraan rutin dan pembersihan. Kawasan kolam akan ditutup untuk memastikan keselamatan semasa tempoh penyelenggaraan.',
        duration: language === 'en' ? '3 hours (9:00 AM - 12:00 PM)' : '3 jam (9:00 AM - 12:00 PM)',
        affectedAreas: language === 'en' ? 'Swimming pool, Pool deck, Changing rooms' : 'Kolam renang, Geladak kolam, Bilik tukar pakaian',
        contact: language === 'en' ? 'Management Office: +60 3-1234 5678' : 'Pejabat Pengurusan: +60 3-1234 5678'
      }
    },
    {
      type: 'event',
      title: language === 'en' ? 'Chinese New Year Celebration' : 'Sambutan Tahun Baru Cina',
      message: language === 'en' ? 'Join us for Chinese New Year celebration - Feb 12, Community Hall' : 'Sertai kami untuk sambutan Tahun Baru Cina - 12 Feb, Dewan Komuniti',
      time: '1 day ago',
      priority: 'low',
      details: {
        description: language === 'en' ? 'Join our community in celebrating Chinese New Year! We will have traditional performances, delicious food, and fun activities for the whole family.' : 'Sertai komuniti kami dalam meraikan Tahun Baru Cina! Kami akan mengadakan persembahan tradisional, makanan lazat, dan aktiviti menyeronokkan untuk seluruh keluarga.',
        dateTime: language === 'en' ? 'February 12, 2024 - 7:00 PM to 10:00 PM' : '12 Februari 2024 - 7:00 PM hingga 10:00 PM',
        location: language === 'en' ? 'Community Hall, Level G' : 'Dewan Komuniti, Aras G',
        activities: language === 'en' ? 'Lion dance, Traditional music, Food stalls, Games for children' : 'Tarian singa, Muzik tradisional, Gerai makanan, Permainan untuk kanak-kanak',
        contact: language === 'en' ? 'Event Coordinator: Sarah +60 12-345 6789' : 'Penyelaras Acara: Sarah +60 12-345 6789'
      }
    },
    {
      type: 'announcement',
      title: language === 'en' ? 'Security Update' : 'Kemaskini Keselamatan',
      message: language === 'en' ? 'New security protocols implemented for visitor access' : 'Protokol keselamatan baharu dilaksanakan untuk akses pelawat',
      time: '3 days ago',
      priority: 'high',
      details: {
        description: language === 'en' ? 'Enhanced security measures have been implemented to improve the safety and security of our community. All visitors must now follow the new registration process.' : 'Langkah keselamatan yang dipertingkatkan telah dilaksanakan untuk meningkatkan keselamatan komuniti kami. Semua pelawat kini mesti mengikut proses pendaftaran baharu.',
        effectiveDate: language === 'en' ? 'Effective immediately' : 'Berkuat kuasa serta-merta',
        newRequirements: language === 'en' ? 'Photo ID required, Pre-registration via app/phone, Security escort for contractors' : 'ID foto diperlukan, Pra-pendaftaran melalui aplikasi/telefon, Pengiring keselamatan untuk kontraktor',
        officeHours: language === 'en' ? 'Security Office: 24/7 available' : 'Pejabat Keselamatan: Tersedia 24/7',
        contact: language === 'en' ? 'Security Hotline: +60 3-9876 5432' : 'Talian Hotline Keselamatan: +60 3-9876 5432'
      }
    }
  ];

  const quickActions = [
    {
      title: language === 'en' ? 'Book Facility' : 'Tempah Kemudahan',
      description: language === 'en' ? 'Reserve community facilities' : 'Tempah kemudahan komuniti',
      icon: Building,
      action: '/facilities'
    },
    {
      title: language === 'en' ? 'Register Visitor' : 'Daftar Pelawat',
      description: language === 'en' ? 'Pre-register your visitors' : 'Pra-daftar pelawat anda',
      icon: UserPlus,
      action: '/my-visitors'
    },
    {
      title: language === 'en' ? 'Submit Complaint' : 'Hantar Aduan',
      description: language === 'en' ? 'Report issues or concerns' : 'Laporkan isu atau masalah',
      icon: FileText,
      action: '/my-complaints'
    },
    {
      title: language === 'en' ? 'Emergency Alert' : 'Amaran Kecemasan',
      description: language === 'en' ? 'Send emergency alert to security' : 'Hantar amaran kecemasan kepada keselamatan',
      icon: Shield,
      action: 'panic',
      isPanic: true
    }
  ];

  const recentActivities = [
    {
      type: 'booking',
      title: language === 'en' ? 'Pool booking confirmed' : 'Tempahan kolam disahkan',
      time: 'Today 2:30 PM',
      status: 'confirmed'
    },
    {
      type: 'visitor',
      title: language === 'en' ? 'Visitor registered: John Doe' : 'Pelawat didaftarkan: John Doe',
      time: 'Yesterday 4:15 PM',
      status: 'approved'
    },
    {
      type: 'announcement',
      title: language === 'en' ? 'New facility booking confirmed' : 'Tempahan kemudahan baru disahkan',
      time: '3 days ago',
      status: 'completed'
    }
  ];

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'maintenance': return AlertTriangle;
      case 'event': return PartyPopper;
      case 'announcement': return Megaphone;
      default: return Megaphone;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'positive': return 'text-green-600';
      case 'pending': return 'text-orange-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return Calendar;
      case 'visitor': return Users;
      case 'announcement': return Megaphone;
      default: return CheckCircle;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {language === 'en' ? `Welcome back, ${user?.display_name || 'Resident'}` : `Selamat kembali, ${user?.display_name || 'Penduduk'}`}
        </h1>
        <p className="text-muted-foreground">
          {language === 'en' ? `${user?.district || 'Your Community'} - Unit A-5-12` : `${user?.district || 'Komuniti Anda'} - Unit A-5-12`}
        </p>
      </div>

      {/* Personal Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {personalMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(metric.status || '')}`}>
                {metric.value}
              </div>
              <p className="text-xs text-muted-foreground">{metric.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions and Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'en' ? 'Quick Actions' : 'Tindakan Pantas'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  action.isPanic ? (
                    <div key={index} className="relative">
                      {/* Progress Circle */}
                      {isPressed && (
                        <div className="absolute inset-0 -m-1 pointer-events-none">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                              className="text-red-200"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 45}`}
                              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                              className="text-red-500 transition-all duration-100 ease-linear"
                            />
                          </svg>
                        </div>
                      )}
                      
                      <Button
                        variant="destructive"
                        className={`
                          h-auto p-4 flex flex-col items-start gap-2 hover:shadow-md transition-all duration-150 w-full relative
                          ${isPressed ? 'scale-95 bg-red-700' : ''}
                          ${isTriggering ? 'animate-pulse' : ''}
                        `}
                        onMouseDown={startHold}
                        onMouseUp={endHold}
                        onMouseLeave={endHold}
                        onTouchStart={startHold}
                        onTouchEnd={endHold}
                        disabled={isTriggering}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <action.icon className="h-5 w-5" />
                          <span className="font-medium">{action.title}</span>
                        </div>
                        <p className="text-xs text-white/80 text-left">
                          {isPressed 
                            ? (language === 'en' ? 'Hold to confirm...' : 'Tahan untuk mengesahkan...')
                            : action.description
                          }
                        </p>
                      </Button>
                    </div>
                  ) : (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start gap-2 hover:shadow-md transition-shadow"
                      asChild
                    >
                      <a href={action.action}>
                        <div className="flex items-center gap-2 w-full">
                          <action.icon className="h-5 w-5 text-primary" />
                          <span className="font-medium">{action.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground text-left">
                          {action.description}
                        </p>
                      </a>
                    </Button>
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <WeatherWidget />
        </div>
      </div>

      {/* Community Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            {language === 'en' ? 'Community Updates' : 'Kemaskini Komuniti'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {communityUpdates.map((update, index) => {
            const IconComponent = getUpdateIcon(update.type);
            return (
              <Alert key={index} variant={update.priority === 'high' ? 'destructive' : 'default'}>
                <IconComponent className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{update.title}</p>
                      <p className="text-sm mt-1">{update.message}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                        <Clock className="h-3 w-3" />
                        {update.time}
                        <Badge variant={getPriorityColor(update.priority) as any} className="text-xs">
                          {update.priority}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedUpdate(update)}
                    >
                      {language === 'en' ? 'View' : 'Lihat'}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            );
          })}
        </CardContent>
      </Card>

      {/* Additional Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <QuickServicesWidget language={language} />
        <UpcomingEventsWidget language={language} />
        <CommunityDirectoryWidget language={language} />
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {language === 'en' ? 'Recent Activities' : 'Aktiviti Terkini'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => {
              const IconComponent = getActivityIcon(activity.type);
              return (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Badge className={getStatusColor(activity.status)}>
                    {activity.status}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* My Services */}
        <div>
          <ServiceManagement />
        </div>
      </div>

      {/* Community Update Details Dialog */}
      <Dialog open={!!selectedUpdate} onOpenChange={() => setSelectedUpdate(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedUpdate && (() => {
                const IconComponent = getUpdateIcon(selectedUpdate.type);
                return <IconComponent className="w-5 h-5" />;
              })()}
              {selectedUpdate?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedUpdate && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {selectedUpdate.time}
                <Badge variant={getPriorityColor(selectedUpdate.priority) as any}>
                  {selectedUpdate.priority}
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-2">
                    {language === 'en' ? 'Description' : 'Keterangan'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedUpdate.details?.description}
                  </p>
                </div>

                {selectedUpdate.details?.duration && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">
                      {language === 'en' ? 'Duration' : 'Tempoh'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedUpdate.details.duration}
                    </p>
                  </div>
                )}

                {selectedUpdate.details?.dateTime && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">
                      {language === 'en' ? 'Date & Time' : 'Tarikh & Masa'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedUpdate.details.dateTime}
                    </p>
                  </div>
                )}

                {selectedUpdate.details?.location && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">
                      {language === 'en' ? 'Location' : 'Lokasi'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedUpdate.details.location}
                    </p>
                  </div>
                )}

                {selectedUpdate.details?.affectedAreas && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">
                      {language === 'en' ? 'Affected Areas' : 'Kawasan Terjejas'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedUpdate.details.affectedAreas}
                    </p>
                  </div>
                )}

                {selectedUpdate.details?.activities && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">
                      {language === 'en' ? 'Activities' : 'Aktiviti'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedUpdate.details.activities}
                    </p>
                  </div>
                )}

                {selectedUpdate.details?.newRequirements && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">
                      {language === 'en' ? 'New Requirements' : 'Keperluan Baru'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedUpdate.details.newRequirements}
                    </p>
                  </div>
                )}

                {selectedUpdate.details?.effectiveDate && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">
                      {language === 'en' ? 'Effective Date' : 'Tarikh Berkuat Kuasa'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedUpdate.details.effectiveDate}
                    </p>
                  </div>
                )}

                {selectedUpdate.details?.officeHours && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">
                      {language === 'en' ? 'Office Hours' : 'Waktu Pejabat'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedUpdate.details.officeHours}
                    </p>
                  </div>
                )}

                {selectedUpdate.details?.contact && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <h4 className="font-medium text-sm mb-1">
                      {language === 'en' ? 'Contact Information' : 'Maklumat Hubungan'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedUpdate.details.contact}
                    </p>
                  </div>
                )}
              </div>

              <Button 
                onClick={() => setSelectedUpdate(null)}
                className="w-full"
              >
                {language === 'en' ? 'Close' : 'Tutup'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Shield className="w-5 h-5" />
              {language === 'en' ? 'Emergency Alert Activated' : 'Amaran Kecemasan Diaktifkan'}
            </DialogTitle>
            <DialogDescription>
              {language === 'en' 
                ? 'Your emergency alert has been sent to security personnel.' 
                : 'Amaran kecemasan anda telah dihantar kepada petugas keselamatan.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <strong>{language === 'en' ? 'Time:' : 'Masa:'}</strong>{' '}
                {new Date().toLocaleString(language === 'en' ? 'en-US' : 'ms-MY')}
              </AlertDescription>
            </Alert>

            {location && (
              <Alert>
                <MapPin className="h-4 w-4" />
                <AlertDescription>
                  <strong>{language === 'en' ? 'Location:' : 'Lokasi:'}</strong>{' '}
                  {location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200 whitespace-pre-line">
                {language === 'en' 
                  ? '✓ Security has been notified\n✓ Your location has been shared\n✓ Help is on the way'
                  : '✓ Keselamatan telah dimaklumkan\n✓ Lokasi anda telah dikongsi\n✓ Bantuan sedang dalam perjalanan'}
              </p>
            </div>

            <Button 
              onClick={() => setShowConfirm(false)}
              className="w-full"
            >
              {language === 'en' ? 'Close' : 'Tutup'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}