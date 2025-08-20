import { useState, useEffect } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Clock, Users, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function Facilities() {
  const { user } = useSimpleAuth();
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        if (user?.id === '11111111-1111-1111-1111-111111111111') {
          // Demo data
          setFacilities([
            {
              id: '1',
              name: 'Kolam Renang',
              description: 'Kolam renang komuniti dengan kemudahan lengkap',
              capacity: '50 orang',
              operating_hours: '6:00 AM - 10:00 PM',
              location: 'Blok A, Tingkat 1',
              status: 'available',
              booking_required: true
            },
            {
              id: '2',
              name: 'Dewan Komuniti',
              description: 'Dewan serbaguna untuk acara dan majlis',
              capacity: '200 orang',
              operating_hours: '8:00 AM - 11:00 PM',
              location: 'Blok B, Tingkat Bawah',
              status: 'available',
              booking_required: true
            },
            {
              id: '3',
              name: 'Gimnasium',
              description: 'Kemudahan senaman dengan peralatan moden',
              capacity: '30 orang',
              operating_hours: '5:00 AM - 11:00 PM',
              location: 'Blok C, Tingkat 2',
              status: 'maintenance',
              booking_required: false
            }
          ]);
        } else {
          const { data } = await supabase
            .from('facilities')
            .select('*')
            .order('name', { ascending: true });
          
          setFacilities(data || []);
        }
      } catch (error) {
        console.error('Error fetching facilities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Kemudahan</h1>
          <p className="text-muted-foreground">Tempah dan urus kemudahan komuniti</p>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((facility) => (
            <Card key={facility.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <Building className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">{facility.name}</CardTitle>
                  </div>
                  <Badge variant={facility.status === 'available' ? 'default' : 'destructive'}>
                    {facility.status === 'available' ? 'Tersedia' : 'Penyelenggaraan'}
                  </Badge>
                </div>
                <CardDescription>{facility.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Kapasiti: {facility.capacity}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{facility.operating_hours}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{facility.location}</span>
                </div>
                <Button 
                  className="w-full"
                  disabled={facility.status !== 'available'}
                >
                  {facility.booking_required ? 'Tempah Sekarang' : 'Maklumat Lanjut'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}