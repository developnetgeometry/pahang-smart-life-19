import { useState, useEffect, useMemo } from 'react';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PanicAlert {
  id: string;
  location_latitude?: number;
  location_longitude?: number;
  location_address?: string;
  alert_status: string;
  response_time?: string;
  responded_by?: string | null;
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
  user_full_name?: string | null;
  user_phone?: string | null;
  responder_full_name?: string | null;
}

interface PanicAlertHistoryProps {
  language: 'en' | 'ms';
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function PanicAlertHistory({ language }: PanicAlertHistoryProps) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<PanicAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address?: string | null } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'responded' | 'resolved' | 'false_alarm'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [alertsPerPage] = useState(10);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (user) {
      fetchMyAlerts();
    }
  }, [user]);

  const fetchMyAlerts = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from("panic_alerts")
        .select("*")
        .eq("community_id", user.active_community_id)
        .order("created_at", { ascending: false });

      if (user.user_role !== "security_officer" && user.user_role !== "community_admin") {
        query = query.eq("user_id", user.id);
      }

      const { data: alertsData, error } = await query;
      if (error) throw error;

      // Gather all user_ids and responded_by ids
      const userIds = [
        ...new Set([
          ...(alertsData?.map(a => a.user_id) ?? []),
          ...(alertsData?.map(a => a.responded_by).filter(Boolean) ?? [])
        ])
      ];

      // Fetch profiles for all involved users (get phone for user only)
      let profilesMap: Record<string, { full_name: string; phone?: string }> = {};
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("user_id, full_name, phone")
          .in("user_id", userIds);

        if (!profilesError && profiles) {
          profilesMap = Object.fromEntries(
            profiles.map((p: any) => [p.user_id, { full_name: p.full_name, phone: p.phone }])
          );
        }
      }

      // Attach full_name and phone to each alert
      const alertsWithNames = (alertsData || []).map((alert: any) => ({
        ...alert,
        user_full_name: profilesMap[alert.user_id]?.full_name ?? null,
        user_phone: profilesMap[alert.user_id]?.phone ?? null,
        responder_full_name: alert.responded_by ? (profilesMap[alert.responded_by]?.full_name ?? null) : null,
      }));

      setAlerts(alertsWithNames);
    } catch (error) {
      console.error("Error fetching panic alerts:", error);
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

  // Reset to first page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, debouncedSearchTerm]);

  // Filtered alerts (memoized)
  const filteredAlerts = useMemo(() => {
    let filtered = alerts;
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(a => a.alert_status === selectedStatus);
    }
    if (debouncedSearchTerm.trim()) {
      const term = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        (a.location_address?.toLowerCase().includes(term) ?? false) ||
        (a.notes?.toLowerCase().includes(term) ?? false) ||
        (a.user_full_name?.toLowerCase().includes(term) ?? false) ||
        (a.user_phone?.toLowerCase().includes(term) ?? false)
      );
    }
    return filtered;
  }, [alerts, selectedStatus, debouncedSearchTerm]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / alertsPerPage));
  const paginatedAlerts = useMemo(() => {
    const start = (currentPage - 1) * alertsPerPage;
    return filteredAlerts.slice(start, start + alertsPerPage);
  }, [filteredAlerts, currentPage, alertsPerPage]);

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
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="w-full sm:w-4/5">
          <Input
            placeholder={language === 'en' ? 'Search by name, phone, address...' : 'Cari nama, telefon, alamat...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-1/5">
          <Select value={selectedStatus} onValueChange={v => setSelectedStatus(v as any)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={language === 'en' ? 'Status' : 'Status'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'en' ? 'All Statuses' : 'Semua Status'}</SelectItem>
              <SelectItem value="active">{getStatusText('active')}</SelectItem>
              <SelectItem value="responded">{getStatusText('responded')}</SelectItem>
              <SelectItem value="resolved">{getStatusText('resolved')}</SelectItem>
              <SelectItem value="false_alarm">{getStatusText('false_alarm')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-6">
        {filteredAlerts.length === 0 ? (
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
          <>
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>
                {language === 'en'
                  ? `Showing ${filteredAlerts.length === 0 ? 0 : ((currentPage - 1) * alertsPerPage + 1)}-${Math.min(currentPage * alertsPerPage, filteredAlerts.length)} of ${filteredAlerts.length} alerts`
                  : `Menunjukkan ${filteredAlerts.length === 0 ? 0 : ((currentPage - 1) * alertsPerPage + 1)}-${Math.min(currentPage * alertsPerPage, filteredAlerts.length)} daripada ${filteredAlerts.length} amaran`}
              </span>
            </div>
            <div className="space-y-4">
              {paginatedAlerts.map((alert) => (
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

                  {/* User name and phone */}
                  {(alert.user_full_name || alert.user_phone) && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {alert.user_full_name && (
                        <span>
                          <strong>{language === 'en' ? 'Name:' : 'Nama:'}</strong> {alert.user_full_name}
                        </span>
                      )}
                      {alert.user_phone && (
                        <span>
                          <strong>{language === 'en' ? 'Phone:' : 'Telefon:'}</strong> {alert.user_phone}
                        </span>
                      )}
                    </div>
                  )}

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
                            {language === 'en' ? 'Responded by: ' : 'Ditindak balas oleh: '}
                          </strong>
                          {alert.responder_full_name || alert.responded_by}
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
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {language === 'en' ? 'Previous' : 'Sebelumnya'}
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    if (totalPages <= 5) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    }
                    // Smart pagination logic
                    if (currentPage <= 3) {
                      if (page <= 3) {
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        );
                      } else if (page === 4) {
                        return <span key="ellipsis1">...</span>;
                      } else if (page === 5) {
                        return (
                          <Button
                            key={totalPages}
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(totalPages)}
                          >
                            {totalPages}
                          </Button>
                        );
                      }
                    } else if (currentPage >= totalPages - 2) {
                      if (page === 1) {
                        return (
                          <Button
                            key={1}
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(1)}
                          >
                            1
                          </Button>
                        );
                      } else if (page === 2) {
                        return <span key="ellipsis2">...</span>;
                      } else if (page >= 3) {
                        const actualPage = totalPages - 5 + page;
                        return (
                          <Button
                            key={actualPage}
                            variant={currentPage === actualPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(actualPage)}
                          >
                            {actualPage}
                          </Button>
                        );
                      }
                    } else {
                      if (page === 1) {
                        return (
                          <Button
                            key={1}
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(1)}
                          >
                            1
                          </Button>
                        );
                      } else if (page === 2) {
                        return <span key="ellipsis3">...</span>;
                      } else if (page === 3) {
                        return (
                          <Button
                            key={currentPage}
                            variant="default"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage)}
                          >
                            {currentPage}
                          </Button>
                        );
                      } else if (page === 4) {
                        return <span key="ellipsis4">...</span>;
                      } else if (page === 5) {
                        return (
                          <Button
                            key={totalPages}
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(totalPages)}
                          >
                            {totalPages}
                          </Button>
                        );
                      }
                    }
                    return null;
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  {language === 'en' ? 'Next' : 'Seterusnya'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
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