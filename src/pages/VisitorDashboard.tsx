import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useModuleAccess } from '@/hooks/use-module-access';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, Search, Shield, Users, Car, CheckCircle, XCircle, AlertTriangle, Eye, Activity, TrendingUp, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

interface Visitor {
  id: string;
  visitor_name: string;
  visitor_phone: string;
  visitor_ic?: string;
  vehicle_plate?: string;
  visit_date: string;
  visit_time: string;
  purpose: string;
  status: "pending" | "approved" | "denied" | "checked_in" | "checked_out";
  host_id: string;
  approved_by?: string;
  qr_code_data?: any;
  created_at: string;
  updated_at: string;
  check_in_time?: string;
  check_out_time?: string;
  notes?: string;
  profiles?: {
    full_name: string;
    email: string;
  } | null;
}

interface DashboardStats {
  totalVisitors: number;
  pendingApprovals: number;
  checkedIn: number;
  todayVisitors: number;
  thisWeekVisitors: number;
}

export default function VisitorDashboard() {
  const { language, user } = useAuth();
  const { isModuleEnabled } = useModuleAccess();
  const { toast } = useToast();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalVisitors: 0,
    pendingApprovals: 0,
    checkedIn: 0,
    todayVisitors: 0,
    thisWeekVisitors: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [showVisitorDialog, setShowVisitorDialog] = useState(false);

  useEffect(() => {
    fetchVisitors();
    calculateStats();
  }, []);

  const fetchVisitors = async () => {
    try {
      const { data, error } = await supabase
        .from('visitors')
        .select(`
          *,
          profiles:host_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setVisitors(data as any || []);
    } catch (error) {
      console.error('Error fetching visitors:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch visitors data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Get all visitors for stats calculation
      const { data: allVisitors, error } = await supabase
        .from('visitors')
        .select('*');

      if (error) throw error;

      const totalVisitors = allVisitors?.length || 0;
      const pendingApprovals = allVisitors?.filter(v => v.status === 'pending').length || 0;
      const checkedIn = allVisitors?.filter(v => v.status === 'checked_in').length || 0;
      const todayVisitors = allVisitors?.filter(v => v.visit_date === today).length || 0;
      const thisWeekVisitors = allVisitors?.filter(v => v.visit_date >= weekAgo).length || 0;

      setStats({
        totalVisitors,
        pendingApprovals,
        checkedIn,
        todayVisitors,
        thisWeekVisitors,
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  // Dashboard is read-only - redirect to management for actions

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-500';
      case 'approved': return 'bg-green-500';
      case 'checked_in': return 'bg-emerald-500';
      case 'checked_out': return 'bg-gray-500';
      case 'denied': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    if (language === 'en') {
      switch (status) {
        case 'pending': return 'Pending';
        case 'approved': return 'Approved';
        case 'checked_in': return 'Checked In';
        case 'checked_out': return 'Checked Out';
        case 'denied': return 'Denied';
        default: return 'Unknown';
      }
    } else {
      switch (status) {
        case 'pending': return 'Menunggu';
        case 'approved': return 'Diluluskan';
        case 'checked_in': return 'Daftar Masuk';
        case 'checked_out': return 'Daftar Keluar';
        case 'denied': return 'Ditolak';
        default: return 'Tidak Diketahui';
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'checked_in': return <Shield className="w-4 h-4" />;
      case 'checked_out': return <XCircle className="w-4 h-4" />;
      case 'denied': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredVisitors = visitors.filter(visitor =>
    visitor.visitor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.visitor_phone.includes(searchTerm) ||
    (visitor.visitor_ic && visitor.visitor_ic.includes(searchTerm)) ||
    (visitor.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Check if visitor management module is enabled
  if (!isModuleEnabled('visitor_management')) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Module Disabled</h3>
            <p className="text-sm text-muted-foreground">
              The Visitor Management module is not enabled for this community.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'en' ? 'Visitor Dashboard' : 'Papan Pemuka Pelawat'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Real-time overview and analytics of visitor activity'
              : 'Gambaran keseluruhan dan analitik masa nyata aktiviti pelawat'
            }
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Total Visitors' : 'Jumlah Pelawat'}
                </p>
                <p className="text-2xl font-bold">{stats.totalVisitors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Pending' : 'Menunggu'}
                </p>
                <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Checked In' : 'Daftar Masuk'}
                </p>
                <p className="text-2xl font-bold">{stats.checkedIn}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Today' : 'Hari Ini'}
                </p>
                <p className="text-2xl font-bold">{stats.todayVisitors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'This Week' : 'Minggu Ini'}
                </p>
                <p className="text-2xl font-bold">{stats.thisWeekVisitors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder={language === 'en' ? 'Search visitors, hosts, or phone numbers...' : 'Cari pelawat, tuan rumah, atau nombor telefon...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Recent Visitors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>{language === 'en' ? 'Recent Visitors' : 'Pelawat Terkini'}</span>
          </CardTitle>
          <CardDescription>
            {language === 'en' 
              ? 'Latest visitor registrations and their current status'
              : 'Pendaftaran pelawat terkini dan status semasa mereka'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredVisitors.length > 0 ? (
              filteredVisitors.map((visitor) => (
                <Card key={visitor.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{visitor.visitor_name}</span>
                          <Badge className={`${getStatusColor(visitor.status)} text-white flex items-center space-x-1`}>
                            {getStatusIcon(visitor.status)}
                            <span>{getStatusText(visitor.status)}</span>
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                          <span>{visitor.visitor_phone}</span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {visitor.visit_date} {visitor.visit_time}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {visitor.profiles?.full_name || 'N/A'}
                          </span>
                          {visitor.vehicle_plate && (
                            <span className="flex items-center">
                              <Car className="w-3 h-3 mr-1" />
                              {visitor.vehicle_plate}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="font-medium">Purpose:</span> {visitor.purpose}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedVisitor(visitor);
                            setShowVisitorDialog(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {language === 'en' ? 'View' : 'Lihat'}
                        </Button>
                        {(visitor.status === 'pending' || visitor.status === 'approved') && (
                          <Button 
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              window.location.href = '/visitor-management';
                            }}
                          >
                            {language === 'en' ? 'Manage' : 'Urus'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {language === 'en' ? 'No visitors found' : 'Tiada pelawat ditemui'}
                </h3>
                <p className="text-muted-foreground">
                  {language === 'en' 
                    ? 'Try adjusting your search criteria or check back later.'
                    : 'Cuba laraskan kriteria carian anda atau semak semula kemudian.'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Visitor Details Dialog */}
      <Dialog open={showVisitorDialog} onOpenChange={setShowVisitorDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Visitor Details' : 'Butiran Pelawat'}
            </DialogTitle>
            <DialogDescription>
              {language === 'en' 
                ? 'Complete visitor information and status'
                : 'Maklumat pelawat lengkap dan status'
              }
            </DialogDescription>
          </DialogHeader>
          {selectedVisitor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{language === 'en' ? 'Visitor Name' : 'Nama Pelawat'}</Label>
                  <p className="text-sm font-medium">{selectedVisitor.visitor_name}</p>
                </div>
                <div>
                <Label>{language === 'en' ? 'Phone' : 'Telefon'}</Label>
                <p className="text-sm font-medium">{selectedVisitor.visitor_phone}</p>
                </div>
                {selectedVisitor.visitor_ic && (
                  <div>
                    <Label>IC Number</Label>
                    <p className="text-sm font-medium">{selectedVisitor.visitor_ic}</p>
                  </div>
                )}
                {selectedVisitor.vehicle_plate && (
                  <div>
                    <Label>{language === 'en' ? 'Vehicle' : 'Kenderaan'}</Label>
                    <p className="text-sm font-medium">{selectedVisitor.vehicle_plate}</p>
                  </div>
                )}
                <div>
                  <Label>{language === 'en' ? 'Visit Date' : 'Tarikh Lawatan'}</Label>
                  <p className="text-sm font-medium">{selectedVisitor.visit_date}</p>
                </div>
                <div>
                  <Label>{language === 'en' ? 'Visit Time' : 'Masa Lawatan'}</Label>
                  <p className="text-sm font-medium">{selectedVisitor.visit_time}</p>
                </div>
              </div>
              <div>
                <Label>{language === 'en' ? 'Purpose' : 'Tujuan'}</Label>
                <p className="text-sm font-medium">{selectedVisitor.purpose}</p>
              </div>
              <div>
                <Label>{language === 'en' ? 'Host' : 'Tuan Rumah'}</Label>
                <p className="text-sm font-medium">{selectedVisitor.profiles?.full_name || 'N/A'}</p>
              </div>
              <div>
                <Label>{language === 'en' ? 'Current Status' : 'Status Semasa'}</Label>
                <Badge className={`${getStatusColor(selectedVisitor.status)} text-white w-fit`}>
                  {getStatusIcon(selectedVisitor.status)}
                  <span className="ml-1">{getStatusText(selectedVisitor.status)}</span>
                </Badge>
              </div>
              {selectedVisitor.check_in_time && (
                <div>
                  <Label>{language === 'en' ? 'Check-in Time' : 'Masa Daftar Masuk'}</Label>
                  <p className="text-sm font-medium">
                    {new Date(selectedVisitor.check_in_time).toLocaleString()}
                  </p>
                </div>
              )}
              {selectedVisitor.check_out_time && (
                <div>
                  <Label>{language === 'en' ? 'Check-out Time' : 'Masa Daftar Keluar'}</Label>
                  <p className="text-sm font-medium">
                    {new Date(selectedVisitor.check_out_time).toLocaleString()}
                  </p>
                </div>
              )}
              {selectedVisitor.notes && (
                <div>
                  <Label>{language === 'en' ? 'Notes' : 'Catatan'}</Label>
                  <p className="text-sm font-medium">{selectedVisitor.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
