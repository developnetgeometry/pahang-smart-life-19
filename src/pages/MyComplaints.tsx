import { useState } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, Plus } from 'lucide-react';

export default function MyComplaints() {
  const { user } = useSimpleAuth();
  const [complaints] = useState([
    {
      id: '1',
      title: 'Lif rosak',
      description: 'Lif di Blok A mengeluarkan bunyi pelik.',
      category: 'Penyelenggaraan',
      priority: 'high',
      status: 'in_progress',
      created_date: '2024-01-10',
      location: 'Block A, Level 1'
    }
  ]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Aduan Saya</h1>
          <p className="text-muted-foreground">Jejak dan urus permintaan penyelenggaraan anda</p>
        </div>
        <Button className="bg-gradient-primary">
          <Plus className="w-4 h-4 mr-2" />
          Aduan Baru
        </Button>
      </div>

      <div className="space-y-4">
        {complaints.map((complaint) => (
          <Card key={complaint.id}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{complaint.title}</span>
              </CardTitle>
              <CardDescription className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{complaint.created_date}</span>
                <span>{complaint.location}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{complaint.description}</p>
              <div className="flex justify-between items-center">
                <Badge variant="outline">{complaint.category}</Badge>
                <Button variant="outline" size="sm">
                  Lihat Butiran
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}