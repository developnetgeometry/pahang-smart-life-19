import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, UserPlus, Users, Car, CheckCircle, XCircle, AlertTriangle, QrCode, Edit3, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Visitor {
  id: string;
  visitor_name: string;
  visitor_phone: string;
  visitor_ic?: string;
  vehicle_plate?: string;
  visit_date: string;
  visit_time?: string;
  purpose?: string;
  notes?: string;
  status: "pending" | "approved" | "denied" | "checked_in" | "checked_out";
  created_at?: string;
}

export default function MyVisitors() {
  const { language, user } = useAuth();
  const { toast } = useToast();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  
  // Form refs for register dialog
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const icRef = useRef<HTMLInputElement>(null);
  const vehicleRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);
  const purposeRef = useRef<HTMLInputElement>(null);
  
  // Form refs for edit dialog
  const editNameRef = useRef<HTMLInputElement>(null);
  const editPhoneRef = useRef<HTMLInputElement>(null);
  const editIcRef = useRef<HTMLInputElement>(null);
  const editVehicleRef = useRef<HTMLInputElement>(null);
  const editDateRef = useRef<HTMLInputElement>(null);
  const editTimeRef = useRef<HTMLInputElement>(null);
  const editPurposeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchVisitors();
    }
  }, [user]);

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

  const handleRegisterVisitor = async () => {
    try {
      const formData = {
        name: nameRef.current?.value || '',
        phone: phoneRef.current?.value || '',
        ic: icRef.current?.value || '',
        vehicle: vehicleRef.current?.value || '',
        date: dateRef.current?.value || '',
        time: timeRef.current?.value || '',
        purpose: purposeRef.current?.value || ''
      };

      if (!formData.name || !formData.phone || !formData.date) {
        toast({
          title: 'Error',
          description: language === 'en' ? 'Please fill in required fields' : 'Sila lengkapkan medan yang diperlukan',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('visitors')
        .insert([{
          host_id: user?.id,
          visitor_name: formData.name,
          visitor_phone: formData.phone,
          visitor_ic: formData.ic,
          vehicle_plate: formData.vehicle,
          visit_date: formData.date,
          visit_time: formData.time,
          purpose: formData.purpose,
          status: 'pending'
        }]);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: language === 'en' ? 'Visitor registered successfully' : 'Pelawat berjaya didaftarkan',
      });

      // Clear form
      if (nameRef.current) nameRef.current.value = '';
      if (phoneRef.current) phoneRef.current.value = '';
      if (icRef.current) icRef.current.value = '';
      if (vehicleRef.current) vehicleRef.current.value = '';
      if (dateRef.current) dateRef.current.value = '';
      if (timeRef.current) timeRef.current.value = '';
      if (purposeRef.current) purposeRef.current.value = '';

      fetchVisitors();
      setShowRegisterDialog(false);
    } catch (error) {
      console.error('Error registering visitor:', error);
      toast({
        title: 'Error',
        description: 'Failed to register visitor',
        variant: 'destructive',
      });
    }
  };

  const handleShareQR = async (visitor: Visitor) => {
    try {
      // Generate QR code data with visitor information
      const qrData = {
        id: visitor.id,
        name: visitor.visitor_name,
        phone: visitor.visitor_phone,
        date: visitor.visit_date,
        time: visitor.visit_time,
        host: user?.email
      };
      
      // Create QR code URL (using qr-server.com as a simple QR generator)
      const qrCodeData = encodeURIComponent(JSON.stringify(qrData));
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrCodeData}`;
      
      setQrCodeUrl(qrUrl);
      setSelectedVisitor(visitor);
      setShowQRDialog(true);
      
      toast({
        title: 'Success',
        description: language === 'en' ? 'QR code generated successfully' : 'Kod QR berjaya dijana',
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate QR code',
        variant: 'destructive',
      });
    }
  };

  const handleEditVisitor = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setShowEditDialog(true);
    
    // Populate edit form with current data
    setTimeout(() => {
      if (editNameRef.current) editNameRef.current.value = visitor.visitor_name;
      if (editPhoneRef.current) editPhoneRef.current.value = visitor.visitor_phone;
      if (editIcRef.current) editIcRef.current.value = visitor.visitor_ic || '';
      if (editVehicleRef.current) editVehicleRef.current.value = visitor.vehicle_plate || '';
      if (editDateRef.current) editDateRef.current.value = visitor.visit_date;
      if (editTimeRef.current) editTimeRef.current.value = visitor.visit_time || '';
      if (editPurposeRef.current) editPurposeRef.current.value = visitor.purpose || '';
    }, 100);
  };

  const handleUpdateVisitor = async () => {
    if (!selectedVisitor) return;

    try {
      const formData = {
        name: editNameRef.current?.value || '',
        phone: editPhoneRef.current?.value || '',
        ic: editIcRef.current?.value || '',
        vehicle: editVehicleRef.current?.value || '',
        date: editDateRef.current?.value || '',
        time: editTimeRef.current?.value || '',
        purpose: editPurposeRef.current?.value || ''
      };

      if (!formData.name || !formData.phone || !formData.date) {
        toast({
          title: 'Error',
          description: language === 'en' ? 'Please fill in required fields' : 'Sila lengkapkan medan yang diperlukan',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('visitors')
        .update({
          visitor_name: formData.name,
          visitor_phone: formData.phone,
          visitor_ic: formData.ic,
          vehicle_plate: formData.vehicle,
          visit_date: formData.date,
          visit_time: formData.time,
          purpose: formData.purpose
        })
        .eq('id', selectedVisitor.id);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: language === 'en' ? 'Visitor updated successfully' : 'Pelawat berjaya dikemaskini',
      });

      fetchVisitors();
      setShowEditDialog(false);
      setSelectedVisitor(null);
    } catch (error) {
      console.error('Error updating visitor:', error);
      toast({
        title: 'Error',
        description: 'Failed to update visitor',
        variant: 'destructive',
      });
    }
  };

  const handleShareQRCode = async () => {
    if (!qrCodeUrl || !selectedVisitor) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: language === 'en' ? 'Visitor QR Code' : 'Kod QR Pelawat',
          text: language === 'en' 
            ? `QR Code for ${selectedVisitor.visitor_name}'s visit on ${selectedVisitor.visit_date}`
            : `Kod QR untuk lawatan ${selectedVisitor.visitor_name} pada ${selectedVisitor.visit_date}`,
          url: qrCodeUrl
        });
      } else {
        // Fallback - copy to clipboard
        await navigator.clipboard.writeText(qrCodeUrl);
        toast({
          title: 'Success',
          description: language === 'en' ? 'QR code URL copied to clipboard' : 'URL kod QR disalin ke papan keratan',
        });
      }
    } catch (error) {
      console.error('Error sharing QR code:', error);
      // Fallback - copy to clipboard
      try {
        await navigator.clipboard.writeText(qrCodeUrl);
        toast({
          title: 'Success',
          description: language === 'en' ? 'QR code URL copied to clipboard' : 'URL kod QR disalin ke papan keratan',
        });
      } catch (clipboardError) {
        toast({
          title: 'Error',
          description: 'Failed to share QR code',
          variant: 'destructive',
        });
      }
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
      case 'checked_in': return <CheckCircle className="w-4 h-4" />;
      case 'checked_out': return <XCircle className="w-4 h-4" />;
      case 'denied': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Calculate stats
  const stats = {
    pending: visitors.filter(v => v.status === 'pending').length,
    approved: visitors.filter(v => v.status === 'approved').length,
    checkedIn: visitors.filter(v => v.status === 'checked_in').length,
    completed: visitors.filter(v => v.status === 'checked_out').length,
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'en' ? 'My Visitors' : 'Pelawat Saya'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Manage visitor registrations and access'
              : 'Urus pendaftaran dan akses pelawat'
            }
          </p>
        </div>
        <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <UserPlus className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Register Visitor' : 'Daftar Pelawat'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {language === 'en' ? 'Register New Visitor' : 'Daftar Pelawat Baru'}
              </DialogTitle>
              <DialogDescription>
                {language === 'en' 
                  ? 'Pre-register your visitors for faster entry'
                  : 'Pra-daftar pelawat anda untuk kemasukan yang lebih pantas'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  {language === 'en' ? 'Visitor Name' : 'Nama Pelawat'} *
                </Label>
                <Input 
                  ref={nameRef} 
                  id="name" 
                  placeholder={language === 'en' ? 'Enter visitor name' : 'Masukkan nama pelawat'} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  {language === 'en' ? 'Phone Number' : 'Nombor Telefon'} *
                </Label>
                <Input 
                  ref={phoneRef} 
                  id="phone" 
                  placeholder="+60123456789" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ic">
                  {language === 'en' ? 'IC Number (Optional)' : 'Nombor IC (Pilihan)'}
                </Label>
                <Input 
                  ref={icRef} 
                  id="ic" 
                  placeholder="880515051234" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle">
                  {language === 'en' ? 'Vehicle Number (Optional)' : 'Nombor Kenderaan (Pilihan)'}
                </Label>
                <Input 
                  ref={vehicleRef} 
                  id="vehicle" 
                  placeholder="ABC1234" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">
                  {language === 'en' ? 'Visit Date' : 'Tarikh Lawatan'} *
                </Label>
                <Input 
                  ref={dateRef} 
                  id="date" 
                  type="date" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">
                  {language === 'en' ? 'Visit Time' : 'Masa Lawatan'}
                </Label>
                <Input 
                  ref={timeRef} 
                  id="time" 
                  type="time" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">
                  {language === 'en' ? 'Purpose of Visit' : 'Tujuan Lawatan'}
                </Label>
                <Input 
                  ref={purposeRef} 
                  id="purpose" 
                  placeholder={language === 'en' ? 'e.g., Family visit' : 'cth: Lawatan keluarga'} 
                />
              </div>
              <Button 
                className="w-full bg-gradient-primary" 
                onClick={handleRegisterVisitor}
              >
                {language === 'en' ? 'Register Visitor' : 'Daftar Pelawat'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Registered' : 'Didaftarkan'}
                </p>
                <p className="text-2xl font-bold">{stats.pending}</p>
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
              <div className="p-2 bg-gray-500/10 rounded-lg">
                <XCircle className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Completed' : 'Selesai'}
                </p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Expired' : 'Tamat Tempoh'}
                </p>
                <p className="text-2xl font-bold">{visitors.filter(v => v.status === 'denied').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visitors List */}
      <div className="space-y-4">
        {visitors.map((visitor) => (
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
                    {visitor.vehicle_plate && (
                      <span className="flex items-center">
                        <Car className="w-4 h-4 mr-1" />
                        {visitor.vehicle_plate}
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
                </div>
                <div className="space-x-2">
                  {visitor.status === 'pending' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleShareQR(visitor)}
                    >
                      <QrCode className="w-3 h-3 mr-1" />
                      {language === 'en' ? 'Share QR' : 'Kongsi QR'}
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditVisitor(visitor)}
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    {language === 'en' ? 'Edit' : 'Edit'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {visitors.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {language === 'en' ? 'No visitors registered' : 'Tiada pelawat didaftarkan'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {language === 'en' 
                ? 'Register your visitors in advance for a smoother entry experience.'
                : 'Daftarkan pelawat anda terlebih dahulu untuk pengalaman kemasukan yang lebih lancar.'
              }
            </p>
            <Button className="bg-gradient-primary" onClick={() => setShowRegisterDialog(true)}>
              {language === 'en' ? 'Register first visitor' : 'Daftar pelawat pertama'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Visitor QR Code' : 'Kod QR Pelawat'}
            </DialogTitle>
            <DialogDescription>
              {language === 'en' 
                ? 'Share this QR code with your visitor for faster entry'
                : 'Kongsi kod QR ini dengan pelawat anda untuk kemasukan yang lebih pantas'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            {selectedVisitor && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium">{selectedVisitor.visitor_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedVisitor.visitor_phone}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedVisitor.visit_date} at {selectedVisitor.visit_time}
                  </p>
                </div>
                {qrCodeUrl && (
                  <div className="flex justify-center">
                    <img 
                      src={qrCodeUrl} 
                      alt="Visitor QR Code" 
                      className="border rounded-lg"
                    />
                  </div>
                )}
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={handleShareQRCode}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Share QR' : 'Kongsi QR'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => window.open(qrCodeUrl, '_blank')}
                  >
                    {language === 'en' ? 'Download' : 'Muat Turun'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Visitor Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Edit Visitor' : 'Edit Pelawat'}
            </DialogTitle>
            <DialogDescription>
              {language === 'en' 
                ? 'Update visitor information'
                : 'Kemaskini maklumat pelawat'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">
                {language === 'en' ? 'Visitor Name' : 'Nama Pelawat'} *
              </Label>
              <Input 
                ref={editNameRef} 
                id="edit-name" 
                placeholder={language === 'en' ? 'Enter visitor name' : 'Masukkan nama pelawat'} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">
                {language === 'en' ? 'Phone Number' : 'Nombor Telefon'} *
              </Label>
              <Input 
                ref={editPhoneRef} 
                id="edit-phone" 
                placeholder="+60123456789" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ic">
                {language === 'en' ? 'IC Number (Optional)' : 'Nombor IC (Pilihan)'}
              </Label>
              <Input 
                ref={editIcRef} 
                id="edit-ic" 
                placeholder="880515051234" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-vehicle">
                {language === 'en' ? 'Vehicle Number (Optional)' : 'Nombor Kenderaan (Pilihan)'}
              </Label>
              <Input 
                ref={editVehicleRef} 
                id="edit-vehicle" 
                placeholder="ABC1234" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">
                {language === 'en' ? 'Visit Date' : 'Tarikh Lawatan'} *
              </Label>
              <Input 
                ref={editDateRef} 
                id="edit-date" 
                type="date" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-time">
                {language === 'en' ? 'Visit Time' : 'Masa Lawatan'}
              </Label>
              <Input 
                ref={editTimeRef} 
                id="edit-time" 
                type="time" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-purpose">
                {language === 'en' ? 'Purpose of Visit' : 'Tujuan Lawatan'}
              </Label>
              <Input 
                ref={editPurposeRef} 
                id="edit-purpose" 
                placeholder={language === 'en' ? 'e.g., Family visit' : 'cth: Lawatan keluarga'} 
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowEditDialog(false)}
              >
                {language === 'en' ? 'Cancel' : 'Batal'}
              </Button>
              <Button 
                className="flex-1 bg-gradient-primary" 
                onClick={handleUpdateVisitor}
              >
                {language === 'en' ? 'Update Visitor' : 'Kemaskini Pelawat'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}