import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MapPin, Clock, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface CommunityDirectoryWidgetProps {
  language: 'en' | 'ms';
}

interface DirectoryContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  hours: string;
  location: string;
  status: string;
  category: string;
  is_active: boolean;
}

export function CommunityDirectoryWidget({ language }: CommunityDirectoryWidgetProps) {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<DirectoryContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const { data, error } = await supabase
          .from('directory_contacts')
          .select('*')
          .eq('is_active', true)
          .limit(4);

        if (error) {
          console.error('Error fetching directory contacts:', error);
          return;
        }

        setContacts(data || []);
      } catch (error) {
        console.error('Error fetching directory contacts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

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
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 bg-muted/30 rounded-lg animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            {language === 'en' ? 'No contacts available' : 'Tiada hubungan tersedia'}
          </div>
        ) : (
          contacts.map((contact) => (
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
          ))
        )}
        
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