import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Phone, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface QuickServicesWidgetProps {
  language: 'en' | 'ms';
}

interface ServiceItem {
  id: string;
  title: string;
  category: string;
  price?: number;
  currency?: string;
  business_name: string;
  is_active: boolean;
}

export function QuickServicesWidget({ language }: QuickServicesWidgetProps) {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('advertisements')
          .select('id, title, category, price, currency, business_name, is_active')
          .eq('is_active', true)
          .eq('product_type', 'service')
          .limit(3);

        if (error) {
          console.error('Error fetching services:', error);
          return;
        }

        setServices(data || []);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{language === 'en' ? 'Nearby Services' : 'Perkhidmatan Berdekatan'}</span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/marketplace')}
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 bg-muted/30 rounded-lg animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            {language === 'en' ? 'No services available' : 'Tiada perkhidmatan tersedia'}
          </div>
        ) : (
          services.map((service) => (
            <div key={service.id} className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-sm">{service.title}</h4>
                  <p className="text-xs text-muted-foreground">{service.business_name}</p>
                </div>
                {service.price && (
                  <Badge variant="outline" className="text-xs">
                    {service.currency || 'RM'}{service.price}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="capitalize">{service.category}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{language === 'en' ? 'Nearby' : 'Berdekatan'}</span>
                </div>
              </div>
              
              <div className="mt-2">
                <Badge variant="default" className="text-xs">
                  {language === 'en' ? 'Available' : 'Tersedia'}
                </Badge>
              </div>
            </div>
          ))
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-3"
          onClick={() => navigate('/marketplace')}
        >
          {language === 'en' ? 'View All Services' : 'Lihat Semua Perkhidmatan'}
        </Button>
      </CardContent>
    </Card>
  );
}