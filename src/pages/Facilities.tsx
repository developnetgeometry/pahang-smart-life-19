import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MapPin, Users, Clock, Plus, Search, Car, Dumbbell, Waves, TreePine } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Facility {
  id: string;
  name: string;
  description: string;
  location: string;
  capacity: number;
  availability: 'available' | 'occupied' | 'maintenance';
  amenities: string[];
  image: string;
  hourlyRate?: number;
}

export default function Facilities() {
  const { language } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  const text = {
    en: {
      title: 'Community Facilities',
      subtitle: 'Book and manage community facilities',
      search: 'Search facilities...',
      type: 'Facility Type',
      allTypes: 'All Types',
      gymFitness: 'Gym & Fitness',
      pools: 'Swimming Pools',
      halls: 'Function Halls',
      parks: 'Parks & Gardens',
      parking: 'Parking',
      book: 'Book Facility',
      available: 'Available',
      occupied: 'Occupied',
      maintenance: 'Under Maintenance',
      capacity: 'Capacity',
      people: 'people',
      location: 'Location',
      amenities: 'Amenities',
      hourlyRate: 'Hourly Rate',
      bookingTitle: 'Book Facility',
      bookingSubtitle: 'Reserve this facility for your event',
      date: 'Date',
      startTime: 'Start Time',
      endTime: 'End Time',
      purpose: 'Purpose',
      notes: 'Additional Notes',
      cancel: 'Cancel',
      confirm: 'Confirm Booking',
      bookingSuccess: 'Facility booked successfully!'
    },
    ms: {
      title: 'Kemudahan Komuniti',
      subtitle: 'Tempah dan urus kemudahan komuniti',
      search: 'Cari kemudahan...',
      type: 'Jenis Kemudahan',
      allTypes: 'Semua Jenis',
      gymFitness: 'Gim & Kecergasan',
      pools: 'Kolam Renang',
      halls: 'Dewan Majlis',
      parks: 'Taman & Landskap',
      parking: 'Tempat Letak Kereta',
      book: 'Tempah Kemudahan',
      available: 'Tersedia',
      occupied: 'Diduduki',
      maintenance: 'Dalam Penyelenggaraan',
      capacity: 'Kapasiti',
      people: 'orang',
      location: 'Lokasi',
      amenities: 'Kemudahan',
      hourlyRate: 'Kadar Sejam',
      bookingTitle: 'Tempah Kemudahan',
      bookingSubtitle: 'Tempah kemudahan ini untuk acara anda',
      date: 'Tarikh',
      startTime: 'Masa Mula',
      endTime: 'Masa Tamat',
      purpose: 'Tujuan',
      notes: 'Nota Tambahan',
      cancel: 'Batal',
      confirm: 'Sahkan Tempahan',
      bookingSuccess: 'Kemudahan berjaya ditempah!'
    }
  };

  const t = text[language];

  const mockFacilities: Facility[] = [
    {
      id: '1',
      name: language === 'en' ? 'Community Gym' : 'Gim Komuniti',
      description: language === 'en' ? 'Fully equipped fitness center with modern equipment' : 'Pusat kecergasan lengkap dengan peralatan moden',
      location: 'Block A, Ground Floor',
      capacity: 20,
      availability: 'available',
      amenities: ['Treadmills', 'Weight Training', 'Air Conditioning', 'Lockers'],
      image: '/gym.jpg',
      hourlyRate: 10
    },
    {
      id: '2',
      name: language === 'en' ? 'Swimming Pool' : 'Kolam Renang',
      description: language === 'en' ? 'Olympic-size swimming pool with children\'s area' : 'Kolam renang saiz olimpik dengan kawasan kanak-kanak',
      location: 'Recreation Area',
      capacity: 50,
      availability: 'available',
      amenities: ['Lifeguard', 'Changing Rooms', 'Pool Equipment', 'Shower'],
      image: '/pool.jpg'
    },
    {
      id: '3',
      name: language === 'en' ? 'Function Hall A' : 'Dewan Majlis A',
      description: language === 'en' ? 'Large multipurpose hall for events and gatherings' : 'Dewan serbaguna besar untuk acara dan perhimpunan',
      location: 'Block B, Level 2',
      capacity: 100,
      availability: 'occupied',
      amenities: ['Sound System', 'Projector', 'Tables & Chairs', 'Kitchen Access'],
      image: '/hall.jpg',
      hourlyRate: 50
    },
    {
      id: '4',
      name: language === 'en' ? 'Garden Park' : 'Taman Landskap',
      description: language === 'en' ? 'Beautiful garden space for outdoor activities' : 'Ruang taman indah untuk aktiviti luar',
      location: 'Central Garden',
      capacity: 200,
      availability: 'available',
      amenities: ['Playground', 'Benches', 'Walking Paths', 'Gazebo'],
      image: '/garden.jpg'
    },
    {
      id: '5',
      name: language === 'en' ? 'Covered Parking' : 'Tempat Letak Kereta Berbumbung',
      description: language === 'en' ? 'Secure covered parking spaces' : 'Tempat letak kereta berbumbung selamat',
      location: 'Basement Level',
      capacity: 50,
      availability: 'maintenance',
      amenities: ['CCTV', 'Security Access', 'Electric Charging'],
      image: '/parking.jpg',
      hourlyRate: 5
    }
  ];

  const facilityTypes = [
    { value: 'all', label: t.allTypes },
    { value: 'gym', label: t.gymFitness },
    { value: 'pool', label: t.pools },
    { value: 'hall', label: t.halls },
    { value: 'garden', label: t.parks },
    { value: 'parking', label: t.parking }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return t.available;
      case 'occupied': return t.occupied;
      case 'maintenance': return t.maintenance;
      default: return status;
    }
  };

  const getIcon = (facilityName: string) => {
    if (facilityName.toLowerCase().includes('gym')) return <Dumbbell className="h-5 w-5" />;
    if (facilityName.toLowerCase().includes('pool')) return <Waves className="h-5 w-5" />;
    if (facilityName.toLowerCase().includes('park') || facilityName.toLowerCase().includes('garden')) return <TreePine className="h-5 w-5" />;
    if (facilityName.toLowerCase().includes('parking')) return <Car className="h-5 w-5" />;
    return <MapPin className="h-5 w-5" />;
  };

  const filteredFacilities = mockFacilities.filter(facility =>
    facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facility.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBookFacility = (facility: Facility) => {
    if (facility.availability === 'available') {
      setSelectedFacility(facility);
      setIsBookingOpen(true);
    }
  };

  const handleConfirmBooking = () => {
    toast({
      title: t.bookingSuccess,
    });
    setIsBookingOpen(false);
    setSelectedFacility(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {facilityTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFacilities.map((facility) => (
          <Card key={facility.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-muted flex items-center justify-center">
              {getIcon(facility.name)}
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{facility.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {facility.description}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(facility.availability)}>
                  {getStatusText(facility.availability)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{t.location}: {facility.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{t.capacity}: {facility.capacity} {t.people}</span>
                </div>
                {facility.hourlyRate && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{t.hourlyRate}: RM{facility.hourlyRate}</span>
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">{t.amenities}:</p>
                <div className="flex flex-wrap gap-1">
                  {facility.amenities.map((amenity, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={() => handleBookFacility(facility)}
                disabled={facility.availability !== 'available'}
              >
                <Calendar className="h-4 w-4 mr-2" />
                {t.book}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{t.bookingTitle}</DialogTitle>
            <DialogDescription>{t.bookingSubtitle}</DialogDescription>
          </DialogHeader>
          {selectedFacility && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium">{selectedFacility.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedFacility.location}</p>
                {selectedFacility.hourlyRate && (
                  <p className="text-sm">{t.hourlyRate}: RM{selectedFacility.hourlyRate}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">{t.date}</Label>
                  <Input id="date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">{t.startTime}</Label>
                  <Input id="startTime" type="time" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">{t.endTime}</Label>
                <Input id="endTime" type="time" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purpose">{t.purpose}</Label>
                <Input id="purpose" placeholder={t.purpose} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">{t.notes}</Label>
                <Textarea id="notes" placeholder={t.notes} rows={3} />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsBookingOpen(false)}>
                  {t.cancel}
                </Button>
                <Button onClick={handleConfirmBooking}>
                  {t.confirm}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}