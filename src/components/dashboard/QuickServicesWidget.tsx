import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Phone, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuickServicesWidgetProps {
  language: 'en' | 'ms';
}

export function QuickServicesWidget({ language }: QuickServicesWidgetProps) {
  const navigate = useNavigate();

  const nearbyServices = [
    {
      id: 1,
      name: language === 'en' ? 'Ahmad\'s Handyman' : 'Tukang Ahmad',
      category: language === 'en' ? 'Home Repair' : 'Pembaikan Rumah',
      rating: 4.8,
      distance: '0.2km',
      availability: language === 'en' ? 'Available Now' : 'Tersedia Sekarang',
      price: 'RM50/hr'
    },
    {
      id: 2,
      name: language === 'en' ? 'Siti\'s Catering' : 'Katering Siti',
      category: language === 'en' ? 'Food & Catering' : 'Makanan & Katering',
      rating: 4.9,
      distance: '0.1km',
      availability: language === 'en' ? 'Book Ahead' : 'Perlu Tempahan',
      price: 'RM8/pax'
    },
    {
      id: 3,
      name: language === 'en' ? 'Lee\'s Tutoring' : 'Tuisyen Lee',
      category: language === 'en' ? 'Education' : 'Pendidikan',
      rating: 4.7,
      distance: '0.3km',
      availability: language === 'en' ? 'Weekends Only' : 'Hujung Minggu Sahaja',
      price: 'RM30/hr'
    }
  ];

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
        {nearbyServices.map((service) => (
          <div key={service.id} className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium text-sm">{service.name}</h4>
                <p className="text-xs text-muted-foreground">{service.category}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {service.price}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{service.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{service.distance}</span>
              </div>
            </div>
            
            <div className="mt-2">
              <Badge 
                variant={service.availability.includes('Available') || service.availability.includes('Tersedia') ? 'default' : 'secondary'}
                className="text-xs"
              >
                {service.availability}
              </Badge>
            </div>
          </div>
        ))}
        
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