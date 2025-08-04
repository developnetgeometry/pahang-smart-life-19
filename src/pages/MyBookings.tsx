import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Plus } from 'lucide-react';

interface Booking {
  id: string;
  facility_name: string;
  date: string;
  time: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  location: string;
  capacity: number;
}

export default function MyBookings() {
  const { language } = useAuth();
  const [bookings] = useState<Booking[]>([
    {
      id: '1',
      facility_name: language === 'en' ? 'Swimming Pool' : 'Kolam Renang',
      date: '2024-01-15',
      time: '14:00',
      duration: 2,
      status: 'confirmed',
      location: language === 'en' ? 'Recreation Center' : 'Pusat Rekreasi',
      capacity: 50
    },
    {
      id: '2',
      facility_name: language === 'en' ? 'Function Hall' : 'Dewan Serbaguna',
      date: '2024-01-20',
      time: '19:00',
      duration: 4,
      status: 'pending',
      location: language === 'en' ? 'Community Center' : 'Pusat Komuniti',
      capacity: 100
    },
    {
      id: '3',
      facility_name: language === 'en' ? 'Tennis Court' : 'Gelanggang Tenis',
      date: '2024-01-10',
      time: '08:00',
      duration: 1,
      status: 'cancelled',
      location: language === 'en' ? 'Sports Complex' : 'Kompleks Sukan',
      capacity: 4
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    if (language === 'en') {
      switch (status) {
        case 'confirmed': return 'Confirmed';
        case 'pending': return 'Pending';
        case 'cancelled': return 'Cancelled';
        default: return 'Unknown';
      }
    } else {
      switch (status) {
        case 'confirmed': return 'Disahkan';
        case 'pending': return 'Menunggu';
        case 'cancelled': return 'Dibatalkan';
        default: return 'Tidak Diketahui';
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'en' ? 'My Bookings' : 'Tempahan Saya'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Manage your facility reservations'
              : 'Urus tempahan kemudahan anda'
            }
          </p>
        </div>
        <Button className="bg-gradient-primary">
          <Plus className="w-4 h-4 mr-2" />
          {language === 'en' ? 'New Booking' : 'Tempahan Baru'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Active Bookings' : 'Tempahan Aktif'}
                </p>
                <p className="text-2xl font-bold">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'This Month' : 'Bulan Ini'}
                </p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Total Hours' : 'Jumlah Jam'}
                </p>
                <p className="text-2xl font-bold">24</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{booking.facility_name}</CardTitle>
                  <CardDescription className="flex items-center space-x-4 mt-2">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {booking.date}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {booking.time} ({booking.duration}h)
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {booking.location}
                    </span>
                  </CardDescription>
                </div>
                <Badge className={`${getStatusColor(booking.status)} text-white`}>
                  {getStatusText(booking.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {language === 'en' ? 'Capacity' : 'Kapasiti'}: {booking.capacity}
                  </span>
                </div>
                <div className="space-x-2">
                  {booking.status === 'confirmed' && (
                    <Button variant="outline" size="sm">
                      {language === 'en' ? 'Modify' : 'Ubah'}
                    </Button>
                  )}
                  {booking.status !== 'cancelled' && (
                    <Button variant="destructive" size="sm">
                      {language === 'en' ? 'Cancel' : 'Batal'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {bookings.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {language === 'en' ? 'No bookings yet' : 'Tiada tempahan lagi'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {language === 'en' 
                ? 'Start by booking a facility for your community activities.'
                : 'Mulakan dengan menempah kemudahan untuk aktiviti komuniti anda.'
              }
            </p>
            <Button className="bg-gradient-primary">
              {language === 'en' ? 'Make a booking' : 'Buat tempahan'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}