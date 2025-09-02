import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useModuleAccess } from '@/hooks/use-module-access';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QrCode, Camera, CameraOff, Shield, Users, CheckCircle, XCircle, AlertTriangle, Eye, Scan } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
  check_in_time?: string;
  check_out_time?: string;
  notes?: string;
  profiles?: {
    full_name: string;
    email: string;
  } | null;
}

export default function QRScanner() {
  const { language, user } = useAuth();
  const { isModuleEnabled } = useModuleAccess();
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [showVisitorDialog, setShowVisitorDialog] = useState(false);
  const [recentScans, setRecentScans] = useState<Visitor[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    fetchRecentScans();
    return () => {
      stopCamera();
    };
  }, []);

  const fetchRecentScans = async () => {
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
        .in('status', ['checked_in', 'checked_out'])
        .order('updated_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentScans(data as any || []);
    } catch (error) {
      console.error('Error fetching recent scans:', error);
    }
  };

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
      setShowVisitorDialog(true);
    } catch (error) {
      console.error('Error processing visitor code:', error);
      toast({
        title: 'Error',
        description: 'Failed to process visitor code.',
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

      fetchRecentScans();
      setShowVisitorDialog(false);
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

      fetchRecentScans();
      setShowVisitorDialog(false);
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
      case 'pending': return <AlertTriangle className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'checked_in': return <Shield className="w-4 h-4" />;
      case 'checked_out': return <XCircle className="w-4 h-4" />;
      case 'denied': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'en' ? 'QR Scanner' : 'Pengimbas QR'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Scan visitor QR codes for quick check-in and check-out'
              : 'Imbas kod QR pelawat untuk daftar masuk dan keluar dengan pantas'
            }
          </p>
        </div>
      </div>

      {/* Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="w-5 h-5" />
              <span>{language === 'en' ? 'QR Code Scanner' : 'Pengimbas Kod QR'}</span>
            </CardTitle>
            <CardDescription>
              {language === 'en' 
                ? 'Position the QR code within the camera frame to scan'
                : 'Letakkan kod QR dalam bingkai kamera untuk mengimbas'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Recent Scans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>{language === 'en' ? 'Recent Activity' : 'Aktiviti Terkini'}</span>
            </CardTitle>
            <CardDescription>
              {language === 'en' 
                ? 'Latest visitor check-ins and check-outs'
                : 'Daftar masuk dan keluar pelawat terkini'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentScans.length > 0 ? (
                recentScans.map((visitor) => (
                  <div key={visitor.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{visitor.visitor_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {visitor.profiles?.full_name || 'N/A'}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(visitor.status)} text-white flex items-center space-x-1`}>
                      {getStatusIcon(visitor.status)}
                      <span>{getStatusText(visitor.status)}</span>
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'No recent activity' : 'Tiada aktiviti terkini'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visitor Details Dialog */}
      <Dialog open={showVisitorDialog} onOpenChange={setShowVisitorDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Visitor Details' : 'Butiran Pelawat'}
            </DialogTitle>
            <DialogDescription>
              {language === 'en' 
                ? 'Review visitor information and perform check-in/out'
                : 'Semak maklumat pelawat dan lakukan daftar masuk/keluar'
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
              <div>
                <Label>{language === 'en' ? 'Current Status' : 'Status Semasa'}</Label>
                <Badge className={`${getStatusColor(selectedVisitor.status)} text-white w-fit`}>
                  {getStatusIcon(selectedVisitor.status)}
                  <span className="ml-1">{getStatusText(selectedVisitor.status)}</span>
                </Badge>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-2 pt-4">
                {selectedVisitor.status === 'approved' && (
                  <Button 
                    onClick={() => handleCheckIn(selectedVisitor.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Check In' : 'Daftar Masuk'}
                  </Button>
                )}
                {selectedVisitor.status === 'checked_in' && (
                  <Button 
                    onClick={() => handleCheckOut(selectedVisitor.id)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Check Out' : 'Daftar Keluar'}
                  </Button>
                )}
                {selectedVisitor.status === 'pending' && (
                  <div className="flex-1 text-center">
                    <Badge className="bg-orange-500 text-white">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      {language === 'en' ? 'Pending Approval' : 'Menunggu Kelulusan'}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}