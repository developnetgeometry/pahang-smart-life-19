import { useState, useEffect } from 'react';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MapPin, Users, Clock, Plus, Search, Car, Dumbbell, Waves, TreePine, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const { language, user } = useEnhancedAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    notes: ''
  });

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

  // Fetch facilities from Supabase
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const { data, error } = await supabase
          .from('facilities')
          .select('*')
          .eq('is_available', true);

        if (error) throw error;

        // Transform Supabase data to match our interface
        const transformedFacilities: Facility[] = (data || []).map(facility => ({
          id: facility.id,
          name: facility.name,
          description: facility.description || '',
          location: facility.location || '',
          capacity: facility.capacity || 0,
          availability: facility.is_available ? 'available' : 'maintenance',
          amenities: facility.amenities || [],
          image: facility.images?.[0] || '/placeholder.svg',
          hourlyRate: facility.hourly_rate ? Number(facility.hourly_rate) : undefined
        }));

        setFacilities(transformedFacilities);
      } catch (error) {
        console.error('Error fetching facilities:', error);
        // Fallback to demo data
        setFacilities([
          {
            id: '1',
            name: language === 'en' ? 'Community Gym' : 'Gim Komuniti',
            description: language === 'en' ? 'Fully equipped fitness center with modern equipment' : 'Pusat kecergasan lengkap dengan peralatan moden',
            location: 'Block A, Ground Floor',
            capacity: 20,
            availability: 'available',
            amenities: ['Treadmills', 'Weight Training', 'Air Conditioning', 'Lockers'],
            image: '/placeholder.svg',
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
            image: '/placeholder.svg'
          },
          {
            id: '3',
            name: language === 'en' ? 'Function Hall A' : 'Dewan Majlis A',
            description: language === 'en' ? 'Large multipurpose hall for events and gatherings' : 'Dewan serbaguna besar untuk acara dan perhimpunan',
            location: 'Block B, Level 2',
            capacity: 100,
            availability: 'available',
            amenities: ['Sound System', 'Projector', 'Tables & Chairs', 'Kitchen Access'],
            image: '/placeholder.svg',
            hourlyRate: 50
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, [language]);

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

  const filteredFacilities = facilities.filter(facility =>
    facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facility.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBookFacility = (facility: Facility) => {
    if (facility.availability === 'available') {
      setSelectedFacility(facility);
      setIsBookingOpen(true);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedFacility || !user) return;

    // Calculate duration
    const startTime = new Date(`${bookingData.date}T${bookingData.startTime}`);
    const endTime = new Date(`${bookingData.date}T${bookingData.endTime}`);
    const durationHours = Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));
    
    const totalAmount = selectedFacility.hourlyRate ? selectedFacility.hourlyRate * durationHours : 0;

    try {
      const { error } = await supabase
        .from('bookings')
        .insert({
          facility_id: selectedFacility.id,
          user_id: user.id,
          booking_date: bookingData.date,
          start_time: bookingData.startTime,
          end_time: bookingData.endTime,
          duration_hours: durationHours,
          purpose: bookingData.purpose,
          notes: bookingData.notes,
          total_amount: totalAmount,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: t.bookingSuccess,
        description: language === 'en' 
          ? `Your booking for ${selectedFacility.name} has been submitted and is pending approval.`
          : `Tempahan anda untuk ${selectedFacility.name} telah dihantar dan menunggu kelulusan.`
      });

      setIsBookingOpen(false);
      setSelectedFacility(null);
      setBookingData({ date: '', startTime: '', endTime: '', purpose: '', notes: '' });
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        variant: 'destructive',
        title: language === 'en' ? 'Booking Failed' : 'Tempahan Gagal',
        description: language === 'en' 
          ? 'There was an error creating your booking. Please try again.'
          : 'Terdapat ralat semasa mencipta tempahan anda. Sila cuba lagi.'
      });
    }
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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video bg-muted animate-pulse" />
              <CardHeader>
                <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted animate-pulse rounded" />
                  <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
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
      )}

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
                  <Input 
                    id="date" 
                    type="date" 
                    value={bookingData.date}
                    onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">{t.startTime}</Label>
                  <Input 
                    id="startTime" 
                    type="time" 
                    value={bookingData.startTime}
                    onChange={(e) => setBookingData(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">{t.endTime}</Label>
                <Input 
                  id="endTime" 
                  type="time" 
                  value={bookingData.endTime}
                  onChange={(e) => setBookingData(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purpose">{t.purpose}</Label>
                <Input 
                  id="purpose" 
                  placeholder={t.purpose} 
                  value={bookingData.purpose}
                  onChange={(e) => setBookingData(prev => ({ ...prev, purpose: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">{t.notes}</Label>
                <Textarea 
                  id="notes" 
                  placeholder={t.notes} 
                  rows={3} 
                  value={bookingData.notes}
                  onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                />
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