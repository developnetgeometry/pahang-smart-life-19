import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Phone, MapPin, Clock, Users, Search, Mail, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Contact {
  id: number;
  name: string;
  role: string;
  phone: string;
  email?: string;
  hours: string;
  location: string;
  status: 'available' | 'busy' | 'offline';
  category: 'management' | 'security' | 'maintenance' | 'community' | 'services';
}

export default function Directory() {
  const { language } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleMessageContact = (contact: Contact) => {
    navigate('/communication-hub', { 
      state: { 
        directoryChat: {
          contactId: contact.id.toString(),
          contactName: contact.name,
          contactTitle: contact.role
        }
      }
    });
  };

  const handleCallContact = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const allContacts: Contact[] = [
    // Management
    {
      id: 1,
      name: language === 'en' ? 'Management Office' : 'Pejabat Pengurusan',
      role: language === 'en' ? 'General Inquiries' : 'Pertanyaan Umum',
      phone: '+60 3-2345-6789',
      email: 'management@community.com',
      hours: language === 'en' ? 'Mon-Fri 9AM-5PM' : 'Isnin-Jumaat 9AM-5PM',
      location: language === 'en' ? 'Ground Floor, Block A' : 'Tingkat Bawah, Blok A',
      status: 'available',
      category: 'management'
    },
    {
      id: 2,
      name: language === 'en' ? 'Property Manager' : 'Pengurus Hartanah',
      role: language === 'en' ? 'John Smith' : 'John Smith',
      phone: '+60 3-2345-6790',
      email: 'john.smith@community.com',
      hours: language === 'en' ? 'Mon-Fri 9AM-5PM' : 'Isnin-Jumaat 9AM-5PM',
      location: language === 'en' ? 'Ground Floor, Block A' : 'Tingkat Bawah, Blok A',
      status: 'available',
      category: 'management'
    },

    // Security
    {
      id: 3,
      name: language === 'en' ? 'Security Office' : 'Pejabat Keselamatan',
      role: language === 'en' ? '24/7 Security' : 'Keselamatan 24/7',
      phone: '+60 3-2345-6700',
      email: 'security@community.com',
      hours: language === 'en' ? '24 Hours' : '24 Jam',
      location: language === 'en' ? 'Main Gate' : 'Pintu Utama',
      status: 'available',
      category: 'security'
    },
    {
      id: 4,
      name: language === 'en' ? 'Security Supervisor' : 'Penyelia Keselamatan',
      role: language === 'en' ? 'Ahmad Rahman' : 'Ahmad Rahman',
      phone: '+60 12-345-6701',
      hours: language === 'en' ? 'Mon-Fri 7AM-7PM' : 'Isnin-Jumaat 7AM-7PM',
      location: language === 'en' ? 'Main Gate' : 'Pintu Utama',
      status: 'available',
      category: 'security'
    },

    // Maintenance
    {
      id: 5,
      name: language === 'en' ? 'Maintenance Team' : 'Pasukan Penyelenggaraan',
      role: language === 'en' ? 'Repairs & Maintenance' : 'Pembaikan & Penyelenggaraan',
      phone: '+60 3-2345-6701',
      email: 'maintenance@community.com',
      hours: language === 'en' ? 'Mon-Sat 8AM-6PM' : 'Isnin-Sabtu 8AM-6PM',
      location: language === 'en' ? 'Basement, Block B' : 'Ruang Bawah Tanah, Blok B',
      status: 'busy',
      category: 'maintenance'
    },
    {
      id: 6,
      name: language === 'en' ? 'Facilities Manager' : 'Pengurus Kemudahan',
      role: language === 'en' ? 'David Lee' : 'David Lee',
      phone: '+60 12-345-6702',
      hours: language === 'en' ? 'Mon-Fri 8AM-5PM' : 'Isnin-Jumaat 8AM-5PM',
      location: language === 'en' ? 'Basement, Block B' : 'Ruang Bawah Tanah, Blok B',
      status: 'available',
      category: 'maintenance'
    },

    // Community Leaders
    {
      id: 7,
      name: language === 'en' ? 'Community Leader' : 'Ketua Komuniti',
      role: language === 'en' ? 'Mrs. Siti Rahman' : 'Puan Siti Rahman',
      phone: '+60 12-345-6789',
      hours: language === 'en' ? 'By Appointment' : 'Mengikut Temujanji',
      location: language === 'en' ? 'Unit A-12-05' : 'Unit A-12-05',
      status: 'available',
      category: 'community'
    },
    {
      id: 8,
      name: language === 'en' ? 'Residents Committee' : 'Jawatankuasa Penduduk',
      role: language === 'en' ? 'Committee Members' : 'Ahli Jawatankuasa',
      phone: '+60 12-345-6790',
      hours: language === 'en' ? 'Weekends 10AM-12PM' : 'Hujung Minggu 10AM-12PM',
      location: language === 'en' ? 'Community Hall' : 'Dewan Komuniti',
      status: 'available',
      category: 'community'
    },

    // Services
    {
      id: 9,
      name: language === 'en' ? 'Cleaning Services' : 'Perkhidmatan Pembersihan',
      role: language === 'en' ? 'Daily Cleaning' : 'Pembersihan Harian',
      phone: '+60 3-2345-6702',
      hours: language === 'en' ? 'Daily 6AM-10AM' : 'Harian 6AM-10AM',
      location: language === 'en' ? 'Various Locations' : 'Pelbagai Lokasi',
      status: 'available',
      category: 'services'
    },
    {
      id: 10,
      name: language === 'en' ? 'Landscaping Team' : 'Pasukan Landskap',
      role: language === 'en' ? 'Garden Maintenance' : 'Penyelenggaraan Taman',
      phone: '+60 12-345-6703',
      hours: language === 'en' ? 'Mon-Fri 7AM-3PM' : 'Isnin-Jumaat 7AM-3PM',
      location: language === 'en' ? 'Garden Areas' : 'Kawasan Taman',
      status: 'available',
      category: 'services'
    }
  ];

  const filteredContacts = allContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'busy': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'offline': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
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

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'management': return language === 'en' ? 'Management' : 'Pengurusan';
      case 'security': return language === 'en' ? 'Security' : 'Keselamatan';
      case 'maintenance': return language === 'en' ? 'Maintenance' : 'Penyelenggaraan';
      case 'community': return language === 'en' ? 'Community' : 'Komuniti';
      case 'services': return language === 'en' ? 'Services' : 'Perkhidmatan';
      default: return category;
    }
  };

  const categories = ['management', 'security', 'maintenance', 'community', 'services'] as const;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'en' ? 'Community Directory' : 'Direktori Komuniti'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Find contact information for all community services and personnel'
              : 'Cari maklumat hubungan untuk semua perkhidmatan dan kakitangan komuniti'}
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={language === 'en' ? 'Search contacts...' : 'Cari kenalan...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-8">
          {categories.map(category => {
            const categoryContacts = filteredContacts.filter(contact => contact.category === category);
            
            if (categoryContacts.length === 0) return null;

            return (
              <div key={category}>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {getCategoryTitle(category)}
                </h2>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryContacts.map((contact) => (
                    <Card key={contact.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{contact.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{contact.role}</p>
                          </div>
                          <Badge className={getStatusColor(contact.status)}>
                            {getStatusText(contact.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{contact.phone}</span>
                          </div>
                          
                          {contact.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span className="truncate">{contact.email}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{contact.hours}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="line-clamp-2">{contact.location}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => handleCallContact(contact.phone)}>
                            <Phone className="w-3 h-3 mr-1" />
                            {language === 'en' ? 'Call' : 'Panggil'}
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => handleMessageContact(contact)}>
                            <MessageCircle className="w-3 h-3 mr-1" />
                            {language === 'en' ? 'Message' : 'Mesej'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {filteredContacts.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {language === 'en' 
                  ? 'No contacts found matching your search.'
                  : 'Tiada kenalan ditemui yang sepadan dengan carian anda.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}