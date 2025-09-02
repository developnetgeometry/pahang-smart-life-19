import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useModuleAccess } from '@/hooks/use-module-access';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Search, Shield, Users, Car, CheckCircle, XCircle, AlertTriangle, Eye, UserCheck, Scan, QrCode, Camera, CameraOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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
  notes?: string;
  profiles?: {
    full_name: string;
    email: string;
  } | null;
}

export default function VisitorApprovals() {
  const { language, user } = useAuth();
  const { isModuleEnabled } = useModuleAccess();
  const { toast } = useToast();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [approvalAction, setApprovalAction] = useState<'approved' | 'denied'>('approved');
  
  // QR Scanner states
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [showQRDialog, setShowQRDialog] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    fetchVisitors();
    return () => {
      stopCamera();
    };
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVisitors((data as any) || []);
    } catch (error) {
      console.error('Error fetching visitors:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch visitor requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // QR Scanner functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setScanning(false);
  };

  const processVisitorCode = async (code: string) => {
    try {
      // Try to find visitor by QR code or ID
      const { data, error } = await supabase
        .from('visitors')
        .select(`
          *,
          profiles:host_id (
            full_name,
            email
          )
        `)
        .or(`qr_code.eq.${code},id.eq.${code}`)
        .single();

      if (error) {
        toast({
          title: 'Visitor Not Found',
          description: 'No visitor found with this QR code.',
          variant: 'destructive',
        });
        return;
      }

      setSelectedVisitor(data as any);
      setShowApprovalDialog(true);
      setShowQRDialog(false);
    } catch (error) {
      console.error('Error processing visitor code:', error);
      toast({
        title: 'Error',
        description: 'Failed to process visitor code.',
        variant: 'destructive',
      });
    }
  };

  const handleApproval = async () => {
    if (!selectedVisitor) return;

    try {
      const { error } = await supabase
        .from('visitors')
        .update({ 
          status: approvalAction,
          approved_by: user?.id,
          notes: approvalNotes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedVisitor.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: language === 'en' 
          ? `Visitor request ${approvalAction === 'approved' ? 'approved' : 'denied'} successfully` 
          : `Permintaan pelawat berjaya ${approvalAction === 'approved' ? 'diluluskan' : 'ditolak'}`,
      });

      fetchVisitors();
      setShowApprovalDialog(false);
      setApprovalNotes('');
      setSelectedVisitor(null);
    } catch (error) {
      console.error('Error updating visitor status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update visitor status',
        variant: 'destructive',
      });
    }
  };

  const handleCheckIn = async (visitorId: string) => {
    try {
      const { error } = await supabase
        .from('visitors')
        .update({ 
          status: 'checked_in',
          check_in_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', visitorId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: language === 'en' ? 'Visitor checked in successfully' : 'Pelawat berjaya daftar masuk',
      });

      fetchVisitors();
      setShowApprovalDialog(false);
      setSelectedVisitor(null);
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
      const { error } = await supabase
        .from('visitors')
        .update({ 
          status: 'checked_out',
          check_out_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', visitorId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: language === 'en' ? 'Visitor checked out successfully' : 'Pelawat berjaya daftar keluar',
      });

      fetchVisitors();
      setShowApprovalDialog(false);
      setSelectedVisitor(null);
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

  const pendingCount = filteredVisitors.filter(v => v.status === 'pending').length;
  const approvedCount = filteredVisitors.filter(v => v.status === 'approved').length;
  const deniedCount = filteredVisitors.filter(v => v.status === 'denied').length;
  const totalCount = filteredVisitors.length;

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
            {language === 'en' ? 'Visitor Management' : 'Pengurusan Pelawat'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Comprehensive visitor approval and check-in system'
              : 'Sistem kelulusan dan daftar masuk pelawat yang komprehensif'
            }
          </p>
        </div>
        <Button onClick={() => setShowQRDialog(true)} className="bg-primary">
          <QrCode className="w-4 h-4 mr-2" />
          {language === 'en' ? 'QR Scanner' : 'Pengimbas QR'}
        </Button>
      </div>

      <Tabs defaultValue="approvals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="approvals" className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4" />
            <span>{language === 'en' ? 'Visitor Approvals' : 'Kelulusan Pelawat'}</span>
          </TabsTrigger>
          <TabsTrigger value="checkins" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>{language === 'en' ? 'Check-ins' : 'Daftar Masuk'}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="approvals" className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={language === 'en' ? 'Search by visitor or host name...' : 'Cari mengikut nama pelawat atau tuan rumah...'}
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
                      {language === 'en' ? 'Total Requests' : 'Jumlah Permintaan'}
                    </p>
                    <p className="text-2xl font-bold">{totalCount}</p>
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
                    <p className="text-2xl font-bold">{pendingCount}</p>
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
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Denied' : 'Ditolak'}
                    </p>
                    <p className="text-2xl font-bold">{deniedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visitors List for Approvals */}
          <div className="space-y-4">
            {filteredVisitors.filter(v => v.status === 'pending').map((visitor) => (
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
                        </span> {visitor.profiles?.full_name || 'N/A'}
                      </p>
                      {visitor.notes && (
                        <p className="text-sm">
                          <span className="font-medium">
                            {language === 'en' ? 'Notes:' : 'Catatan:'}
                          </span> {visitor.notes}
                        </p>
                      )}
                    </div>
                    <div className="space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedVisitor(visitor);
                          setShowApprovalDialog(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'Review' : 'Semak'}
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => {
                          setSelectedVisitor(visitor);
                          setApprovalAction('approved');
                          setShowApprovalDialog(true);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'Approve' : 'Luluskan'}
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => {
                          setSelectedVisitor(visitor);
                          setApprovalAction('denied');
                          setShowApprovalDialog(true);
                        }}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'Deny' : 'Tolak'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredVisitors.filter(v => v.status === 'pending').length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <UserCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {language === 'en' ? 'No pending approvals' : 'Tiada kelulusan tertunda'}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'en' 
                      ? 'All visitor requests have been processed.'
                      : 'Semua permintaan pelawat telah diproses.'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="checkins" className="space-y-6">
          {/* Approved/Checked-in Visitors */}
          <div className="space-y-4">
            {filteredVisitors.filter(v => ['approved', 'checked_in', 'checked_out'].includes(v.status)).map((visitor) => (
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
                        </span> {visitor.profiles?.full_name || 'N/A'}
                      </p>
                    </div>
                    <div className="space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedVisitor(visitor);
                          setShowApprovalDialog(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'Details' : 'Butiran'}
                      </Button>
                      {visitor.status === 'approved' && (
                        <Button 
                          size="sm"
                          onClick={() => handleCheckIn(visitor.id)}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {language === 'en' ? 'Check In' : 'Daftar Masuk'}
                        </Button>
                      )}
                      {visitor.status === 'checked_in' && (
                        <Button 
                          size="sm"
                          onClick={() => handleCheckOut(visitor.id)}
                          className="bg-gray-600 hover:bg-gray-700"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          {language === 'en' ? 'Check Out' : 'Daftar Keluar'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* QR Scanner Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'QR Code Scanner' : 'Pengimbas Kod QR'}
            </DialogTitle>
            <DialogDescription>
              {language === 'en' 
                ? 'Scan visitor QR codes for quick processing'
                : 'Imbas kod QR pelawat untuk pemprosesan pantas'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Camera View */}
            <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
              {cameraActive ? (
                <video 
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Camera not active' : 'Kamera tidak aktif'}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Scan overlay */}
              {cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-white border-dashed rounded-lg" 
                       style={{ width: '200px', height: '200px' }}>
                    <div className="w-full h-full border-2 border-primary rounded-lg animate-pulse" />
                  </div>
                </div>
              )}
            </div>

            {/* Camera Controls */}
            <div className="flex space-x-2">
              {!cameraActive ? (
                <Button onClick={startCamera} className="flex-1">
                  <Camera className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'Start Camera' : 'Mula Kamera'}
                </Button>
              ) : (
                <Button onClick={stopCamera} variant="outline" className="flex-1">
                  <CameraOff className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'Stop Camera' : 'Henti Kamera'}
                </Button>
              )}
            </div>

            {/* Manual Code Entry */}
            <div className="space-y-2">
              <Label htmlFor="manual-code">
                {language === 'en' ? 'Or enter code manually:' : 'Atau masukkan kod secara manual:'}
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="manual-code"
                  placeholder={language === 'en' ? 'Enter visitor code...' : 'Masukkan kod pelawat...'}
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                />
                <Button 
                  onClick={() => {
                    if (manualCode.trim()) {
                      processVisitorCode(manualCode.trim());
                      setManualCode('');
                    }
                  }}
                  disabled={!manualCode.trim()}
                >
                  <Scan className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'Process' : 'Proses'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Visitor Request Review' : 'Semakan Permintaan Pelawat'}
            </DialogTitle>
            <DialogDescription>
              {language === 'en' 
                ? 'Review the visitor details and provide your decision.'
                : 'Semak butiran pelawat dan berikan keputusan anda.'
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
                <p className="text-sm font-medium">{selectedVisitor.profiles?.full_name || 'N/A'}</p>
              </div>
              
              {selectedVisitor.status === 'pending' && (
                <>
                  <div>
                    <Label htmlFor="notes">
                      {language === 'en' ? 'Notes (Optional)' : 'Catatan (Pilihan)'}
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder={language === 'en' 
                        ? 'Add any notes or reasons for your decision...'
                        : 'Tambah sebarang catatan atau sebab untuk keputusan anda...'
                      }
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex space-x-2 pt-4">
                    <Button 
                      onClick={() => {
                        setApprovalAction('approved');
                        handleApproval();
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'Approve' : 'Luluskan'}
                    </Button>
                    <Button 
                      onClick={() => {
                        setApprovalAction('denied');
                        handleApproval();
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'Deny' : 'Tolak'}
                    </Button>
                  </div>
                </>
              )}

              {/* Action Buttons for Check-in/out */}
              {selectedVisitor.status === 'approved' && (
                <div className="flex space-x-2 pt-4">
                  <Button 
                    onClick={() => handleCheckIn(selectedVisitor.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Check In' : 'Daftar Masuk'}
                  </Button>
                </div>
              )}
              {selectedVisitor.status === 'checked_in' && (
                <div className="flex space-x-2 pt-4">
                  <Button 
                    onClick={() => handleCheckOut(selectedVisitor.id)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Check Out' : 'Daftar Keluar'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}