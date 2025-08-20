import { useState } from 'react';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Plus } from 'lucide-react';

export default function MyBookings() {
  const { user } = useEnhancedAuth();
  const [bookings] = useState([
    {
      id: '1',
      facility_name: 'Dewan Komuniti',
      date: '2024-01-25',
      time: '7:00 PM - 11:00 PM',
      purpose: 'Majlis Perkahwinan',
      status: 'confirmed',
      location: 'Blok B, Tingkat Bawah'
    },
    {
      id: '2',
      facility_name: 'Kolam Renang',
      date: '2024-01-20',
      time: '8:00 AM - 10:00 AM',
      purpose: 'Latihan Renang',
      status: 'pending',
      location: 'Blok A, Tingkat 1'
    }
  ]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tempahan Saya</h1>
          <p className="text-muted-foreground">Urus tempahan kemudahan anda</p>
        </div>
        <Button className="bg-gradient-primary">
          <Plus className="w-4 h-4 mr-2" />
          Tempahan Baru
        </Button>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{booking.facility_name}</CardTitle>
                <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                  {booking.status === 'confirmed' ? 'Disahkan' : 'Pending'}
                </Badge>
              </div>
              <CardDescription>{booking.purpose}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{booking.date}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{booking.time}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{booking.location}</span>
              </div>
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm">
                  Lihat Butiran
                </Button>
                {booking.status === 'pending' && (
                  <Button variant="destructive" size="sm">
                    Batal
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}