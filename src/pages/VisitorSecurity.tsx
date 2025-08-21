import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, Search, Shield, Users, Car, CheckCircle, XCircle, AlertTriangle, Eye, Ban } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Visitor {
  id: string;
  visitor_name: string;
  visitor_phone: string;
  visitor_ic?: string;
  vehicle_number?: string;
  visit_date: string;
  visit_time: string;
  purpose: string;
  status: "pending" | "approved" | "denied" | "checked_in" | "checked_out";
  host_id: string;
  approved_by?: string;
  qr_code?: string;
  created_at: string;
  updated_at: string;
  check_in_time?: string;
  check_out_time?: string;
  notes?: string;
  profiles?: any;
}

export default function VisitorSecurity() {
  const { language, user } = useAuth();
  const { toast } = useToast();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .eq('host_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVisitors(data || []);
    } catch (error) {
      console.error('Error fetching visitors:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch visitors',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (visitorId: string) => {
    try {
      // Update visitor status
      const { error: updateError } = await supabase
        .from('visitors')
        .update({ 
          status: 'checked_in',
          approved_by: user?.id,
          check_in_time: new Date().toISOString()
        })
        .eq('id', visitorId);

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: language === 'en' ? 'Visitor checked in successfully' : 'Pelawat berjaya daftar masuk',
      });

      fetchVisitors();
      setShowCheckInDialog(false);
    } catch (error) {
      console.error('Error checking in visitor:', error);
      toast({
        title: 'Error',
        description: 'Failed to check in visitor',
        variant: 'destructive',
      });
    }
  };

  const handleCheckOut = async (visitorId: string) => {
    try {
      // Update visitor status
      const { error: updateError } = await supabase
        .from('visitors')
        .update({ 
          status: 'checked_out',
          check_out_time: new Date().toISOString()
        })
        .eq('id', visitorId);

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: language === 'en' ? 'Visitor checked out successfully' : 'Pelawat berjaya daftar keluar',
      });

      fetchVisitors();
    } catch (error) {
      console.error('Error checking out visitor:', error);
      toast({
        title: 'Error',
        description: 'Failed to check out visitor',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-500';
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
      case 'denied': return <Ban className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredVisitors = visitors.filter(visitor =>
    visitor.visitor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.visitor_phone.includes(searchTerm) ||
    (visitor.visitor_ic && visitor.visitor_ic.includes(searchTerm))
  );

  const todayVisitors = filteredVisitors.filter(v => {
    const today = new Date().toISOString().split('T')[0];
    return v.visit_date === today;
  });

  const checkedInCount = todayVisitors.filter(v => v.status === 'checked_in').length;
  const approvedCount = todayVisitors.filter(v => v.status === 'approved').length;

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'en' ? 'Visitor Security' : 'Keselamatan Pelawat'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Manage visitor check-ins and security screening'
              : 'Urus daftar masuk dan saringan keselamatan pelawat'
            }
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder={language === 'en' ? 'Search by name, phone, or IC...' : 'Cari mengikut nama, telefon, atau IC...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? "Today's Visitors" : 'Pelawat Hari Ini'}
                </p>
                <p className="text-2xl font-bold">{todayVisitors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Approved' : 'Diluluskan'}
                </p>
                <p className="text-2xl font-bold">{approvedCount}</p>
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
                <p className="text-2xl font-bold">{checkedInCount}</p>
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
                <p className="text-2xl font-bold">
                  {filteredVisitors.filter(v => v.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visitors List */}
      <div className="space-y-4">
        {filteredVisitors.map((visitor) => (
          <Card key={visitor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>{visitor.visitor_name}</span>
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-4 mt-2">
                    <span>{visitor.visitor_phone}</span>
                    {visitor.visitor_ic && (
                      <span>IC: {visitor.visitor_ic}</span>
                    )}
                    {visitor.vehicle_number && (
                      <span className="flex items-center">
                        <Car className="w-4 h-4 mr-1" />
                        {visitor.vehicle_number}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <Badge className={`${getStatusColor(visitor.status)} text-white flex items-center space-x-1`}>
                  {getStatusIcon(visitor.status)}
                  <span>{getStatusText(visitor.status)}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {visitor.visit_date} at {visitor.visit_time}
                    </span>
                  </div>
                  <p className="text-sm">
                    <span className="font-medium">
                      {language === 'en' ? 'Purpose:' : 'Tujuan:'}
                    </span> {visitor.purpose}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">
                      {language === 'en' ? 'Host:' : 'Tuan Rumah:'}
                    </span> N/A
                  </p>
                </div>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedVisitor(visitor);
                      setShowCheckInDialog(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Details' : 'Butiran'}
                  </Button>
                  {visitor.status === 'approved' && (
                    <Button 
                      size="sm"
                      onClick={() => handleCheckIn(visitor.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {language === 'en' ? 'Check In' : 'Daftar Masuk'}
                    </Button>
                  )}
                  {visitor.status === 'checked_in' && (
                    <Button 
                      size="sm"
                      onClick={() => handleCheckOut(visitor.id)}
                      className="bg-gray-600 hover:bg-gray-700"
                    >
                      {language === 'en' ? 'Check Out' : 'Daftar Keluar'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVisitors.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {language === 'en' ? 'No visitors found' : 'Tiada pelawat ditemui'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'Try adjusting your search criteria or check back later.'
                : 'Cuba laraskan kriteria carian anda atau semak semula kemudian.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Visitor Details Dialog */}
      <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Visitor Details' : 'Butiran Pelawat'}
            </DialogTitle>
          </DialogHeader>
          {selectedVisitor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{language === 'en' ? 'Name' : 'Nama'}</Label>
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
                {selectedVisitor.vehicle_number && (
                  <div>
                    <Label>{language === 'en' ? 'Vehicle' : 'Kenderaan'}</Label>
                    <p className="text-sm font-medium">{selectedVisitor.vehicle_number}</p>
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
                <p className="text-sm font-medium">N/A</p>
              </div>
              <div>
                <Label>{language === 'en' ? 'Status' : 'Status'}</Label>
                <Badge className={`${getStatusColor(selectedVisitor.status)} text-white w-fit`}>
                  {getStatusIcon(selectedVisitor.status)}
                  <span className="ml-1">{getStatusText(selectedVisitor.status)}</span>
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}