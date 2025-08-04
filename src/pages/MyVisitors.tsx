import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, UserPlus, Users, Car, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface Visitor {
  id: string;
  name: string;
  phone: string;
  vehicle_number?: string;
  visit_date: string;
  visit_time: string;
  purpose: string;
  status: 'registered' | 'checked_in' | 'checked_out' | 'expired';
  qr_code?: string;
}

export default function MyVisitors() {
  const { language } = useAuth();
  const [visitors] = useState<Visitor[]>([
    {
      id: '1',
      name: 'Siti Aminah',
      phone: '+60123456789',
      vehicle_number: 'WJT5678',
      visit_date: '2024-01-15',
      visit_time: '14:00',
      purpose: language === 'en' ? 'Family visit' : 'Lawatan keluarga',
      status: 'registered'
    },
    {
      id: '2',
      name: 'Ahmad Rahman',
      phone: '+60987654321',
      visit_date: '2024-01-12',
      visit_time: '10:00',
      purpose: language === 'en' ? 'Delivery' : 'Penghantaran',
      status: 'checked_out'
    },
    {
      id: '3',
      name: 'Lim Wei Ming',
      phone: '+60111222333',
      vehicle_number: 'KLT9999',
      visit_date: '2024-01-10',
      visit_time: '19:00',
      purpose: language === 'en' ? 'Business meeting' : 'Mesyuarat perniagaan',
      status: 'expired'
    }
  ]);

  const [showRegisterDialog, setShowRegisterDialog] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return 'bg-blue-500';
      case 'checked_in': return 'bg-green-500';
      case 'checked_out': return 'bg-gray-500';
      case 'expired': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    if (language === 'en') {
      switch (status) {
        case 'registered': return 'Registered';
        case 'checked_in': return 'Checked In';
        case 'checked_out': return 'Checked Out';
        case 'expired': return 'Expired';
        default: return 'Unknown';
      }
    } else {
      switch (status) {
        case 'registered': return 'Didaftarkan';
        case 'checked_in': return 'Daftar Masuk';
        case 'checked_out': return 'Daftar Keluar';
        case 'expired': return 'Tamat Tempoh';
        default: return 'Tidak Diketahui';
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'registered': return <Clock className="w-4 h-4" />;
      case 'checked_in': return <CheckCircle className="w-4 h-4" />;
      case 'checked_out': return <XCircle className="w-4 h-4" />;
      case 'expired': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

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
                  {language === 'en' ? 'Visitor Name' : 'Nama Pelawat'}
                </Label>
                <Input id="name" placeholder={language === 'en' ? 'Enter visitor name' : 'Masukkan nama pelawat'} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  {language === 'en' ? 'Phone Number' : 'Nombor Telefon'}
                </Label>
                <Input id="phone" placeholder="+60123456789" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle">
                  {language === 'en' ? 'Vehicle Number (Optional)' : 'Nombor Kenderaan (Pilihan)'}
                </Label>
                <Input id="vehicle" placeholder="ABC1234" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">
                  {language === 'en' ? 'Visit Date' : 'Tarikh Lawatan'}
                </Label>
                <Input id="date" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">
                  {language === 'en' ? 'Visit Time' : 'Masa Lawatan'}
                </Label>
                <Input id="time" type="time" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">
                  {language === 'en' ? 'Purpose of Visit' : 'Tujuan Lawatan'}
                </Label>
                <Input id="purpose" placeholder={language === 'en' ? 'e.g., Family visit' : 'cth: Lawatan keluarga'} />
              </div>
              <Button className="w-full bg-gradient-primary">
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
                <p className="text-2xl font-bold">1</p>
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
                <p className="text-2xl font-bold">0</p>
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
                <p className="text-2xl font-bold">1</p>
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
                <p className="text-2xl font-bold">1</p>
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
                    <span>{visitor.name}</span>
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-4 mt-2">
                    <span>{visitor.phone}</span>
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
                </div>
                <div className="space-x-2">
                  {visitor.status === 'registered' && (
                    <Button variant="outline" size="sm">
                      {language === 'en' ? 'Share QR' : 'Kongsi QR'}
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
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
    </div>
  );
}