import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MapPin, Clock, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CommunityDirectoryWidgetProps {
  language: 'en' | 'ms';
}

export function CommunityDirectoryWidget({ language }: CommunityDirectoryWidgetProps) {
  const navigate = useNavigate();

  const importantContacts = [
    {
      id: 1,
      name: language === 'en' ? 'Management Office' : 'Pejabat Pengurusan',
      role: language === 'en' ? 'General Inquiries' : 'Pertanyaan Umum',
      phone: '+60 3-2345-6789',
      hours: language === 'en' ? 'Mon-Fri 9AM-5PM' : 'Isnin-Jumaat 9AM-5PM',
      location: language === 'en' ? 'Ground Floor, Block A' : 'Tingkat Bawah, Blok A',
      status: 'available'
    },
    {
      id: 2,
      name: language === 'en' ? 'Security Office' : 'Pejabat Keselamatan',
      role: language === 'en' ? '24/7 Security' : 'Keselamatan 24/7',
      phone: '+60 3-2345-6700',
      hours: language === 'en' ? '24 Hours' : '24 Jam',
      location: language === 'en' ? 'Main Gate' : 'Pintu Utama',
      status: 'available'
    },
    {
      id: 3,
      name: language === 'en' ? 'Maintenance Team' : 'Pasukan Penyelenggaraan',
      role: language === 'en' ? 'Repairs & Maintenance' : 'Pembaikan & Penyelenggaraan',
      phone: '+60 3-2345-6701',
      hours: language === 'en' ? 'Mon-Sat 8AM-6PM' : 'Isnin-Sabtu 8AM-6PM',
      location: language === 'en' ? 'Basement, Block B' : 'Ruang Bawah Tanah, Blok B',
      status: 'busy'
    },
    {
      id: 4,
      name: language === 'en' ? 'Community Leader' : 'Ketua Komuniti',
      role: language === 'en' ? 'Mrs. Siti Rahman' : 'Puan Siti Rahman',
      phone: '+60 12-345-6789',
      hours: language === 'en' ? 'By Appointment' : 'Mengikut Temujanji',
      location: language === 'en' ? 'Unit A-12-05' : 'Unit A-12-05',
      status: 'available'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return language === 'en' ? 'Available' : 'Tersedia';
      case 'busy': return language === 'en' ? 'Busy' : 'Sibuk';
      case 'offline': return language === 'en' ? 'Offline' : 'Tidak Dalam Talian';
      default: return status;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span>{language === 'en' ? 'Community Directory' : 'Direktori Komuniti'}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/contacts')}
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {importantContacts.map((contact) => (
          <div key={contact.id} className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium text-sm">{contact.name}</h4>
                <p className="text-xs text-muted-foreground">{contact.role}</p>
              </div>
              <Badge className={getStatusColor(contact.status)}>
                {getStatusText(contact.status)}
              </Badge>
            </div>
            
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>{contact.phone}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{contact.hours}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="line-clamp-1">{contact.location}</span>
              </div>
            </div>
          </div>
        ))}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-3"
          onClick={() => navigate('/directory')}
        >
          {language === 'en' ? 'View Full Directory' : 'Lihat Direktori Penuh'}
        </Button>
      </CardContent>
    </Card>
  );
}