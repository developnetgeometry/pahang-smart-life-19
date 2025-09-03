import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Clock, 
  User,
  CheckCircle,
  Wrench,
  Siren
} from 'lucide-react';

interface EmergencyAlert {
  id: string;
  type: string;
  title: string;
  description: string;
  location: string;
  priority: string;
  status: string;
  reported_by: string;
  assigned_to: string;
  created_at: string;
  resolved_at: string;
  metadata: any;
  profiles?: {
    full_name: string;
    phone: string;
    email: string;
  } | null;
}

interface EmergencyContact {
  name: string;
  role: string;
  phone: string;
  email: string;
  available24h: boolean;
}

export default function MaintenanceEmergency() {
  const { user, language } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);

  const emergencyContacts: EmergencyContact[] = [
    {
      name: "Emergency Maintenance",
      role: "Primary Response Team",
      phone: "+60123456789",
      email: "emergency@maintenance.com",
      available24h: true
    },
    {
      name: "Facility Manager",
      role: "Facility Management",
      phone: "+60123456790",
      email: "facility@maintenance.com",
      available24h: false
    },
    {
      name: "Security Office",
      role: "Security Control",
      phone: "+60123456791",
      email: "security@maintenance.com",
      available24h: true
    }
  ];

  useEffect(() => {
    fetchEmergencyAlerts();
    setupRealtimeSubscription();
  }, [user]);

  const fetchEmergencyAlerts = async () => {
    if (!user) return;

    try {
      // Fetch from complaints with high priority or emergency type
      const { data: emergencyComplaints, error } = await supabase
        .from('complaints')
        .select(`
          id,
          title,
          description,
          category,
          priority,
          status,
          location,
          complainant_id,
          assigned_to,
          created_at,
          resolved_at,
          escalation_level,
          profiles:complainant_id(full_name, phone, email)
        `)
        .or('priority.eq.high,category.eq.emergency')
        .neq('status', 'resolved')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedAlerts: EmergencyAlert[] = (emergencyComplaints || []).map((complaint: any) => ({
        id: complaint.id,
        type: complaint.category,
        title: complaint.title,
        description: complaint.description,
        location: complaint.location || 'Unknown location',
        priority: complaint.priority,
        status: complaint.status,
        reported_by: complaint.complainant_id,
        assigned_to: complaint.assigned_to || '',
        created_at: complaint.created_at,
        resolved_at: complaint.resolved_at,
        metadata: { escalation_level: complaint.escalation_level },
        profiles: complaint.profiles && 
                  typeof complaint.profiles === 'object' && 
                  !Array.isArray(complaint.profiles) &&
                  'full_name' in complaint.profiles
          ? {
              full_name: complaint.profiles.full_name || 'Unknown',
              phone: complaint.profiles.phone || '',
              email: complaint.profiles.email || ''
            }
          : null
      }));

      setAlerts(formattedAlerts);
    } catch (error) {
      console.error('Error fetching emergency alerts:', error);
      toast({
        title: language === 'ms' ? 'Ralat' : 'Error',
        description: language === 'ms' ? 'Gagal memuat amaran kecemasan' : 'Failed to load emergency alerts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('emergency-alerts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaints',
          filter: 'priority=eq.high'
        },
        () => {
          fetchEmergencyAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const respondToAlert = async (alertId: string) => {
    if (!user) return;

    setResponding(alertId);
    try {
      const { error } = await supabase
        .from('complaints')
        .update({
          assigned_to: user.id,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: language === 'ms' ? 'Berjaya' : 'Success',
        description: language === 'ms' ? 'Anda telah menerima amaran ini' : 'You have accepted this alert'
      });

      fetchEmergencyAlerts();
    } catch (error) {
      console.error('Error responding to alert:', error);
      toast({
        title: language === 'ms' ? 'Ralat' : 'Error',
        description: language === 'ms' ? 'Gagal menerima amaran' : 'Failed to accept alert',
        variant: 'destructive'
      });
    } finally {
      setResponding(null);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: language === 'ms' ? 'Berjaya' : 'Success',
        description: language === 'ms' ? 'Amaran telah diselesaikan' : 'Alert has been resolved'
      });

      fetchEmergencyAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast({
        title: language === 'ms' ? 'Ralat' : 'Error',
        description: language === 'ms' ? 'Gagal menyelesaikan amaran' : 'Failed to resolve alert',
        variant: 'destructive'
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive text-destructive-foreground animate-pulse';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-success text-success-foreground';
      case 'in_progress':
        return 'bg-primary text-primary-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return language === 'ms' ? 'Baru sahaja' : 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} ${language === 'ms' ? 'minit yang lalu' : 'minutes ago'}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ${language === 'ms' ? 'jam yang lalu' : 'hours ago'}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ${language === 'ms' ? 'hari yang lalu' : 'days ago'}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Siren className="h-6 w-6 text-destructive animate-pulse" />
        <h1 className="text-2xl font-bold text-foreground">
          {language === 'ms' ? 'Tindak Balas Kecemasan' : 'Emergency Response'}
        </h1>
      </div>

      {/* Emergency Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: language === 'ms' ? 'Amaran Aktif' : 'Active Alerts',
            value: alerts.filter(a => a.status !== 'resolved').length,
            icon: AlertTriangle,
            color: 'text-destructive'
          },
          {
            title: language === 'ms' ? 'Sedang Dikendalikan' : 'In Progress',
            value: alerts.filter(a => a.status === 'in_progress').length,
            icon: Wrench,
            color: 'text-warning'
          },
          {
            title: language === 'ms' ? 'Diselesaikan Hari Ini' : 'Resolved Today',
            value: alerts.filter(a => {
              if (!a.resolved_at) return false;
              const today = new Date().toDateString();
              const resolvedDate = new Date(a.resolved_at).toDateString();
              return today === resolvedDate;
            }).length,
            icon: CheckCircle,
            color: 'text-success'
          }
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            {language === 'ms' ? 'Hubungan Kecemasan' : 'Emergency Contacts'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{contact.name}</h4>
                    <p className="text-sm text-muted-foreground">{contact.role}</p>
                  </div>
                  {contact.available24h && (
                    <Badge variant="secondary">24/7</Badge>
                  )}
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                      {contact.phone}
                    </a>
                  </div>
                  <div className="text-muted-foreground">{contact.email}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <div className="space-y-4">
        {alerts.filter(alert => alert.status !== 'resolved' && alert.priority === 'high').length > 0 && (
          <Alert className="border-destructive bg-destructive/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="font-medium">
              {language === 'ms' 
                ? `${alerts.filter(a => a.status !== 'resolved' && a.priority === 'high').length} amaran kecemasan aktif memerlukan perhatian segera!`
                : `${alerts.filter(a => a.status !== 'resolved' && a.priority === 'high').length} active emergency alerts require immediate attention!`
              }
            </AlertDescription>
          </Alert>
        )}

        {alerts.map((alert) => (
          <Card key={alert.id} className={`hover:shadow-md transition-shadow ${
            alert.priority === 'high' ? 'border-destructive shadow-lg' : ''
          }`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{alert.title}</CardTitle>
                    {alert.priority === 'high' && (
                      <Siren className="h-5 w-5 text-destructive animate-pulse" />
                    )}
                  </div>
                  <CardDescription>{alert.description}</CardDescription>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {alert.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {getTimeAgo(alert.created_at)}
                    </div>
                    {alert.profiles && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {alert.profiles.full_name}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className={getPriorityColor(alert.priority)}>
                    {alert.priority.toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor(alert.status)}>
                    {alert.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Type: {alert.type}
                  </p>
                  {alert.profiles && (
                    <p className="text-sm text-muted-foreground">
                      Contact: {alert.profiles.phone || alert.profiles.email}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {alert.status === 'pending' && alert.assigned_to !== user?.id && (
                    <Button 
                      onClick={() => respondToAlert(alert.id)}
                      disabled={responding === alert.id}
                      variant={alert.priority === 'high' ? 'destructive' : 'default'}
                    >
                      {responding === alert.id 
                        ? (language === 'ms' ? 'Memproses...' : 'Responding...')
                        : (language === 'ms' ? 'Terima' : 'Respond')
                      }
                    </Button>
                  )}
                  {alert.status === 'in_progress' && alert.assigned_to === user?.id && (
                    <Button 
                      onClick={() => resolveAlert(alert.id)}
                      variant="outline"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {language === 'ms' ? 'Selesaikan' : 'Resolve'}
                    </Button>
                  )}
                  {alert.profiles?.phone && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`tel:${alert.profiles.phone}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        {language === 'ms' ? 'Hubungi' : 'Call'}
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {alerts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {language === 'ms' ? 'Tiada Amaran Kecemasan' : 'No Emergency Alerts'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'ms' 
                ? 'Semua amaran kecemasan telah diselesaikan. Sistem berfungsi dengan normal.'
                : 'All emergency alerts have been resolved. System is operating normally.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}