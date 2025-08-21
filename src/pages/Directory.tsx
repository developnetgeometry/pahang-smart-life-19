import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Phone, MapPin, Clock, Users, Search, Mail, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Contact {
  id: string;
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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('directory_contacts')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching contacts:', error);
        return;
      }

      // Map database data to our Contact interface with proper type casting
      const mappedContacts: Contact[] = (data || []).map(contact => ({
        id: contact.id,
        name: contact.name,
        role: contact.role,
        phone: contact.phone,
        email: contact.email,
        hours: contact.hours,
        location: contact.location,
        status: contact.status as Contact['status'],
        category: contact.category as Contact['category']
      }));

      setContacts(mappedContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageContact = (contact: Contact) => {
    navigate('/communication-hub', { 
      state: { 
        directoryChat: {
          contactId: contact.id,
          contactName: contact.name,
          contactTitle: contact.role
        }
      }
    });
  };

  const handleCallContact = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const filteredContacts = contacts.filter(contact =>
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

        {loading ? (
          <div className="space-y-8">
            {categories.map(category => (
              <div key={category}>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {getCategoryTitle(category)}
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader className="pb-3">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <div className="h-3 bg-muted rounded"></div>
                          <div className="h-3 bg-muted rounded"></div>
                          <div className="h-3 bg-muted rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
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
        )}

        {!loading && filteredContacts.length === 0 && (
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