import { useState } from 'react';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserPlus, Calendar, Clock, Phone, Car, Plus } from 'lucide-react';

export default function MyVisitors() {
  const { user } = useEnhancedAuth();
  const [visitors] = useState([
    {
      id: '1',
      name: 'Ahmad Zakaria',
      phone: '012-3456789',
      vehicle_number: 'ABC 1234',
      visit_date: '2024-01-20',
      visit_time: '2:00 PM',
      purpose: 'Lawatan Keluarga',
      status: 'approved'
    },
    {
      id: '2',
      name: 'Siti Aminah',
      phone: '019-8765432',
      vehicle_number: 'XYZ 5678',
      visit_date: '2024-01-22',
      visit_time: '10:00 AM',
      purpose: 'Mesyuarat Perniagaan',
      status: 'pending'
    }
  ]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pelawat Saya</h1>
          <p className="text-muted-foreground">Daftar dan urus pelawat anda</p>
        </div>
        <Button className="bg-gradient-primary">
          <Plus className="w-4 h-4 mr-2" />
          Daftar Pelawat Baru
        </Button>
      </div>

      <div className="space-y-4">
        {visitors.map((visitor) => (
          <Card key={visitor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">{visitor.name}</CardTitle>
                </div>
                <Badge variant={visitor.status === 'approved' ? 'default' : 'secondary'}>
                  {visitor.status === 'approved' ? 'Diluluskan' : 'Pending'}
                </Badge>
              </div>
              <CardDescription>{visitor.purpose}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{visitor.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Car className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{visitor.vehicle_number}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{visitor.visit_date}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{visitor.visit_time}</span>
              </div>
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button variant="destructive" size="sm">
                  Batal
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}