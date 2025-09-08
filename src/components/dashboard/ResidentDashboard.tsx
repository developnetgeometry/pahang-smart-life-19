import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QuickServicesWidget } from './QuickServicesWidget';
import { UpcomingEventsWidget } from './UpcomingEventsWidget';
import { WeatherWidget } from './WeatherWidget';
import { CommunityDirectoryWidget } from './CommunityDirectoryWidget';
import { PrayerTimesWidget } from './PrayerTimesWidget';
import InteractiveUnitEditor from '@/components/location/InteractiveUnitEditor';
import { CombinedSlideshow } from './CombinedSlideshow';
import PanicButton from '@/components/emergency/PanicButton';

import { useModuleAccess } from '@/hooks/use-module-access';
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

export function ResidentDashboard() {
  const { language, user } = useAuth();
  const navigate = useNavigate();
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  const { isModuleEnabled } = useModuleAccess();

  // Handle quick action clicks
  const handleQuickAction = (action: any) => {
    // Navigate to the appropriate page
    if (action.startsWith('/')) {
      navigate(action);
    } else {
      // Handle other action types if needed
      console.log('Action triggered:', action);
    }
  };

  const personalMetrics = [
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

  const allQuickActions = [
    {
      title: language === 'en' ? 'Submit Complaint' : 'Hantar Aduan',
      description: language === 'en' ? 'Report issues or concerns' : 'Laporkan isu atau masalah',
      icon: FileText,
      action: '/my-complaints',
      module: 'complaints'
    },
    {
      title: language === 'en' ? 'Book Facilities' : 'Tempah Kemudahan',
      description: language === 'en' ? 'Reserve community facilities' : 'Tempah kemudahan komuniti',
      icon: Building,
      action: '/my-bookings',
      module: 'bookings'
    },
    {
      title: language === 'en' ? 'Register Visitor' : 'Daftar Pelawat',
      description: language === 'en' ? 'Pre-register your visitors' : 'Pra-daftar pelawat anda',
      icon: UserPlus,
      action: '/my-visitors',
      module: 'visitor_management'
    },
    {
      title: language === 'en' ? 'Community Chat' : 'Sembang Komuniti',
      description: language === 'en' ? 'Connect with neighbors' : 'Berhubung dengan jiran',
      icon: MessageSquare,
      action: '/communication-hub',
      module: 'discussions'
    }
  ];

  // Filter quick actions based on enabled modules
  const quickActions = allQuickActions.filter(action => isModuleEnabled(action.module));


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
      case 'announcement': return Megaphone;
      case 'complaint': return FileText;
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

      {/* Combined Activities and Announcements Slideshow */}
      <CombinedSlideshow />

      {/* Quick Actions and Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'en' ? 'Quick Actions' : 'Tindakan Pantas'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="min-h-[100px] p-4 flex flex-col items-start gap-2 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleQuickAction(action.action)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <action.icon className="h-5 w-5 text-primary" />
                      <span className="font-medium">{action.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-left">
                      {action.description}
                    </p>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <WeatherWidget />
          <PrayerTimesWidget />
        </div>
      </div>

      {/* Interactive Location Viewer */}
      <InteractiveUnitEditor
        imageUrl="/lovable-uploads/0709b4db-2289-4ac3-a185-7de4c3dce5b0.png"
        title={language === 'en' ? 'Community Map' : 'Peta Komuniti'}
        showSearch={true}
        isAdminMode={false}
      />


      {/* Upcoming Events */}
      <div className="grid grid-cols-1 gap-6">
        <UpcomingEventsWidget language={language} />
      </div>

      {/* Additional Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickServicesWidget language={language} />
        <CommunityDirectoryWidget language={language} />
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

      {/* Floating Round Panic Button */}
      <PanicButton />
    </div>
  );
}