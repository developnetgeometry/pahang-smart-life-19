import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUserRoles } from '@/hooks/use-user-roles';
import { useToast } from '@/hooks/use-toast';
import EmergencyLocationViewer from '@/components/emergency/EmergencyLocationViewer';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  MapPin,
  RefreshCw,
  Search,
  Shield,
  XCircle
} from 'lucide-react';

type PanicStatus = 'active' | 'responded' | 'resolved' | 'false_alarm';

interface PanicAlert {
  id: string;
  user_id: string;
  district_id: string | null;
  alert_status: PanicStatus | string;
  created_at: string;
  updated_at: string;
  response_time?: string | null;
  responded_by?: string | null;
  location_latitude?: number | null;
  location_longitude?: number | null;
  location_address?: string | null;
  notes?: string | null;
}

export default function PanicAlertsAdminView() {
  const { language, user } = useAuth();
  const { hasAnyRole } = useUserRoles();
  const { toast } = useToast();
  const [districtId, setDistrictId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState<PanicAlert[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | PanicStatus>('all');
  const [rangeFilter, setRangeFilter] = useState<'24h' | '7d' | '30d' | 'all'>('24h');
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address?: string | null } | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const canManage = hasAnyRole(['community_admin','district_coordinator','state_admin','security_officer']);

  // Load profile for district scoping
  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!user) return;
        const { data } = await supabase
          .from('profiles')
          .select('district_id')
          .eq('user_id', user.id)
          .single();
        setDistrictId(data?.district_id ?? null);
      } catch {
        setDistrictId(null);
      }
    };
    loadProfile();
  }, [user]);

  // Build time boundary based on range
  const sinceISO = useMemo(() => {
    const now = Date.now();
    switch (rangeFilter) {
      case '24h':
        return new Date(now - 24 * 60 * 60 * 1000).toISOString();
      case '7d':
        return new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return null;
    }
  }, [rangeFilter]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('panic_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (districtId) {
        query = query.eq('district_id', districtId);
      }

      if (statusFilter !== 'all') {
        query = query.eq('alert_status', statusFilter);
      }

      if (sinceISO) {
        query = query.gte('created_at', sinceISO);
      }

      if (search.trim()) {
        const term = search.trim();
        query = query.or(`location_address.ilike.%${term}%,notes.ilike.%${term}%,user_id.ilike.%${term}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAlerts(data || []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error fetching panic alerts:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial and reactive load
  useEffect(() => {
    fetchAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [districtId, statusFilter, rangeFilter, search]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('panic-alerts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'panic_alerts' }, () => {
        setRefreshing(true);
        fetchAlerts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (alert: PanicAlert, newStatus: PanicStatus) => {
    if (!user || !canManage) return;
    setUpdatingId(alert.id);
    try {
      const updates: any = {
        alert_status: newStatus,
        updated_at: new Date().toISOString(),
      };
      if (newStatus === 'responded' && !alert.response_time) {
        updates.response_time = new Date().toISOString();
      }
      if (!alert.responded_by) {
        updates.responded_by = user.id;
      }

      const { error } = await supabase
        .from('panic_alerts')
        .update(updates)
        .eq('id', alert.id);
      if (error) throw error;

      // Optimistic update
      setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, ...updates } : a));
      toast({ title: language === 'en' ? 'Status updated' : 'Status dikemas kini' });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to update status', e);
      toast({ title: language === 'en' ? 'Failed to update status' : 'Gagal mengemas kini status', variant: 'destructive' });
    } finally {
      setUpdatingId(null);
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

  const stats = useMemo(() => {
    const base = { total: alerts.length, active: 0, responded: 0, resolved: 0, false_alarm: 0 } as Record<string, number>;
    alerts.forEach(a => { base[a.alert_status] = (base[a.alert_status] || 0) + 1; });
    return base;
  }, [alerts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {language === 'en' ? 'Panic Alerts' : 'Amaran Panik'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' ? 'View all panic button statuses in your district' : 'Lihat semua status butang panik dalam daerah anda'}
          </p>
        </div>
        <Button variant="outline" onClick={fetchAlerts} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {language === 'en' ? 'Refresh' : 'Muat semula'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">{language === 'en' ? 'Total' : 'Jumlah'}</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">{language === 'en' ? 'Active' : 'Aktif'}</div>
            <div className="text-2xl font-bold text-red-600">{stats.active || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">{language === 'en' ? 'Responded' : 'Ditindak balas'}</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.responded || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">{language === 'en' ? 'Resolved' : 'Diselesaikan'}</div>
            <div className="text-2xl font-bold text-green-600">{stats.resolved || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">{language === 'en' ? 'False Alarm' : 'Amaran Palsu'}</div>
            <div className="text-2xl font-bold">{stats.false_alarm || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{language === 'en' ? 'Filters' : 'Penapis'}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === 'en' ? 'Search address, notes, user ID...' : 'Cari alamat, nota, ID pengguna...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'en' ? 'All Statuses' : 'Semua Status'}</SelectItem>
              <SelectItem value="active">{language === 'en' ? 'Active' : 'Aktif'}</SelectItem>
              <SelectItem value="responded">{language === 'en' ? 'Responded' : 'Ditindak balas'}</SelectItem>
              <SelectItem value="resolved">{language === 'en' ? 'Resolved' : 'Diselesaikan'}</SelectItem>
              <SelectItem value="false_alarm">{language === 'en' ? 'False Alarm' : 'Amaran Palsu'}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={rangeFilter} onValueChange={(v: any) => setRangeFilter(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">{language === 'en' ? 'Last 24 hours' : '24 jam lepas'}</SelectItem>
              <SelectItem value="7d">{language === 'en' ? 'Last 7 days' : '7 hari lepas'}</SelectItem>
              <SelectItem value="30d">{language === 'en' ? 'Last 30 days' : '30 hari lepas'}</SelectItem>
              <SelectItem value="all">{language === 'en' ? 'All time' : 'Sepanjang masa'}</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-6 bg-muted rounded w-1/3"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : alerts.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              {language === 'en' ? 'No alerts found for selected filters' : 'Tiada amaran untuk penapis dipilih'}
            </CardContent>
          </Card>
        ) : (
          alerts.map(alert => (
            <Card key={alert.id}>
              <CardContent className="p-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Badge className={getStatusColor(alert.alert_status)}>
                      {getStatusIcon(alert.alert_status)}
                      <span className="ml-2 capitalize">{alert.alert_status.replace('_', ' ')}</span>
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" /> {formatDateTime(alert.created_at)}
                      <span>•</span>
                      <span>{language === 'en' ? 'User' : 'Pengguna'}: {alert.user_id}</span>
                      {alert.responded_by && (
                        <>
                          <span>•</span>
                          <span>{language === 'en' ? 'Responded by' : 'Ditindak balas oleh'}: {alert.responded_by}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {alert.location_latitude && alert.location_longitude && (
                      <Button variant="outline" size="sm" onClick={() => setSelectedLocation({ lat: alert.location_latitude!, lng: alert.location_longitude!, address: alert.location_address })}>
                        <MapPin className="w-4 h-4 mr-1" /> {language === 'en' ? 'View Location' : 'Lihat Lokasi'}
                      </Button>
                    )}
                    {canManage && (
                      <>
                        {alert.alert_status === 'active' && (
                          <>
                            <Button size="sm" variant="outline" disabled={!!updatingId} onClick={() => updateStatus(alert, 'responded')}>
                              {language === 'en' ? 'Mark Responded' : 'Tanda Ditindak'}
                            </Button>
                            <Button size="sm" variant="outline" disabled={!!updatingId} onClick={() => updateStatus(alert, 'false_alarm')}>
                              {language === 'en' ? 'False Alarm' : 'Amaran Palsu'}
                            </Button>
                          </>
                        )}
                        {alert.alert_status === 'responded' && (
                          <>
                            <Button size="sm" variant="outline" disabled={!!updatingId} onClick={() => updateStatus(alert, 'resolved')}>
                              {language === 'en' ? 'Mark Resolved' : 'Tanda Selesai'}
                            </Button>
                            <Button size="sm" variant="outline" disabled={!!updatingId} onClick={() => updateStatus(alert, 'false_alarm')}>
                              {language === 'en' ? 'False Alarm' : 'Amaran Palsu'}
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {alert.location_address && (
                  <div className="text-sm text-muted-foreground">{alert.location_address}</div>
                )}
                {alert.notes && (
                  <div className="text-sm bg-muted/40 p-3 rounded">{alert.notes}</div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Map dialog */}
      {selectedLocation && (
        <Dialog open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" /> {language === 'en' ? 'Alert Location' : 'Lokasi Amaran'}
              </DialogTitle>
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
    </div>
  );
}
