import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useModuleAccess } from '@/hooks/use-module-access';
import { useUserRoles } from '@/hooks/use-user-roles';
import AdvancedSearch from '@/components/marketplace/AdvancedSearch';
import StarRating from '@/components/marketplace/StarRating';
import { ServicesMap } from '@/components/services/ServicesMap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MapPin, Phone, Mail, ExternalLink, Shield, Building2, Map, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SmartImage } from '@/components/ui/dynamic-image';

interface ServiceAdvertisement {
  id: string;
  title: string;
  description: string;
  business_name: string;
  category: string;
  price?: number;
  service_areas: string[];
  contact_phone?: string;
  contact_email?: string;
  website_url?: string;
  image_url?: string;
  advertiser_id: string;
  is_featured: boolean;
  click_count: number;
  created_at: string;
  advertiser_profile?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export default function Services() {
  const { language } = useAuth();
  const { isModuleEnabled } = useModuleAccess();
  const { hasRole } = useUserRoles();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [services, setServices] = useState<ServiceAdvertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbCategories, setDbCategories] = useState<{name: string}[]>([]);
  const [activeTab, setActiveTab] = useState(() => {
    const view = searchParams.get('view');
    return view === 'map' ? 'map' : 'list';
  });
  const [creatingDemo, setCreatingDemo] = useState(false);

  const isServiceProvider = hasRole('service_provider');

  const text = {
    en: {
      title: 'Community Services',
      subtitle: 'Professional services from verified local providers',
      search: 'Search services...',
      category: 'Category',
      allCategories: 'All Categories',
      featured: 'Featured',
      contactProvider: 'Contact Provider',
      viewDetails: 'View Details',
      manageServices: 'Manage My Services',
      createService: 'Create Service',
      serviceAreas: 'Service Areas',
      website: 'Visit Website',
      verified: 'Verified Provider',
      noServices: 'No services found',
      noServicesDesc: 'Try adjusting your search or category filters',
      clickCount: 'views',
      listView: 'List View',
      mapView: 'Map View',
      viewOnMap: 'View on Map'
    },
    ms: {
      title: 'Perkhidmatan Komuniti',
      subtitle: 'Perkhidmatan profesional dari penyedia tempatan yang disahkan',
      search: 'Cari perkhidmatan...',
      category: 'Kategori',
      allCategories: 'Semua Kategori',
      featured: 'Pilihan',
      contactProvider: 'Hubungi Penyedia',
      viewDetails: 'Lihat Butiran',
      manageServices: 'Urus Perkhidmatan Saya',
      createService: 'Cipta Perkhidmatan',
      serviceAreas: 'Kawasan Perkhidmatan',
      website: 'Lawati Laman Web',
      verified: 'Penyedia Disahkan',
      noServices: 'Tiada perkhidmatan dijumpai',
      noServicesDesc: 'Cuba laraskan carian atau penapis kategori anda',
      clickCount: 'paparan',
      listView: 'Paparan Senarai',
      mapView: 'Paparan Peta',
      viewOnMap: 'Lihat di Peta'
    }
  };

  const t = text[language];

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      // Use hardcoded categories for services since advertisement_categories table might not exist
      setDbCategories([
        { name: 'plumbing' },
        { name: 'electrical' },
        { name: 'cleaning' },
        { name: 'maintenance' },
        { name: 'landscaping' },
        { name: 'security' },
        { name: 'services' }
      ]);
    };
    fetchCategories();
  }, []);

  // Fetch service advertisements from Supabase
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('advertisements')
          .select(`
            *
          `)
          .eq('is_active', true)
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch advertiser profiles separately
        const advertiserIds = [...new Set((data || []).map(item => item.advertiser_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', advertiserIds);

        const profilesMap = (profilesData || []).reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, any>);

        const transformedServices: ServiceAdvertisement[] = (data || []).map(item => ({
          id: item.id,
          title: item.title,
          description: item.description || '',
          business_name: item.business_name,
          category: item.category,
          price: item.price,
          service_areas: item.service_areas || [],
          contact_phone: item.contact_phone,
          contact_email: item.contact_email,
          website_url: item.website_url,
          image_url: item.image_url,
          advertiser_id: item.advertiser_id,
          is_featured: item.is_featured,
          click_count: item.click_count || 0,
          created_at: item.created_at,
          advertiser_profile: profilesMap[item.advertiser_id]
        }));

        setServices(transformedServices);
      } catch (error) {
        console.error('Error fetching services:', error);
        toast({
          title: language === 'en' ? 'Error' : 'Ralat',
          description: language === 'en' ? 'Failed to load services' : 'Gagal memuat perkhidmatan',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [language, toast]);

  // Compute categories with useMemo
  const categories = useMemo(() => [
    { value: 'all', label: t.allCategories },
    ...dbCategories.map(cat => ({ value: cat.name, label: cat.name }))
  ], [dbCategories, t.allCategories]);

  // Check if marketplace module is enabled
  if (!isModuleEnabled('marketplace')) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Module Disabled</h3>
            <p className="text-sm text-muted-foreground">
              The Services module is not enabled for this community.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.business_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleServiceClick = async (serviceId: string) => {
    // Update click count
    await supabase
      .from('advertisements')
      .update({ click_count: services.find(s => s.id === serviceId)?.click_count + 1 })
      .eq('id', serviceId);

    navigate(`/advertisement/${serviceId}`);
  };

  const handleContactProvider = async (service: ServiceAdvertisement) => {
    // Track contact attempt
    await supabase.from('communication_analytics').insert({
      user_id: service.advertiser_id,
      event_type: 'service_contact',
      event_data: { service_id: service.id, contact_method: 'platform' }
    });

    // Navigate to seller profile or show contact modal
    navigate(`/seller/${service.advertiser_id}`);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const newSearchParams = new URLSearchParams(searchParams);
    if (value === 'map') {
      newSearchParams.set('view', 'map');
    } else {
      newSearchParams.delete('view');
    }
    setSearchParams(newSearchParams);
  };

  const createDemoProvider = async () => {
    setCreatingDemo(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: language === 'en' ? 'Error' : 'Ralat',
          description: language === 'en' ? 'Please login to create demo data' : 'Sila log masuk untuk mencipta data demo',
          variant: 'destructive'
        });
        return;
      }

      // Create a demo advertisement directly
      await supabase
        .from('advertisements')
        .insert({
          advertiser_id: user.id,
          title: 'Professional Plumbing Services',
          description: 'Expert plumbing services for residential and commercial properties. Quick response time and affordable rates.',
          business_name: 'Demo Service Provider',
          category: 'plumbing',
          price: 150.00,
          service_areas: ['Kuala Lumpur', 'Selangor'],
          contact_phone: '+60123456789',
          contact_email: 'demo@example.com',
          is_active: true,
          is_featured: true
        });

      toast({
        title: language === 'en' ? 'Demo Created!' : 'Demo Dicipta!',
        description: language === 'en' ? 'Demo service advertisement created successfully.' : 'Iklan perkhidmatan demo berjaya dicipta.'
      });

      // Refresh services
      window.location.reload();
    } catch (error) {
      console.error('Error creating demo provider:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to create demo advertisement' : 'Gagal mencipta iklan demo',
        variant: 'destructive'
      });
    } finally {
      setCreatingDemo(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-muted animate-pulse rounded w-1/2 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted animate-pulse rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted animate-pulse rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted animate-pulse rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted animate-pulse rounded"></div>
                  <div className="h-3 bg-muted animate-pulse rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground mt-2">{t.subtitle}</p>
        </div>
        {isServiceProvider && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/advertisements')} className="w-full sm:w-auto">
              {t.manageServices}
            </Button>
            <Button onClick={() => navigate('/advertisements')} className="w-full sm:w-auto">
              {t.createService}
            </Button>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {/* Demo Provider Button (only show if no services) */}
      {services.length === 0 && !loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Service Providers Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create a demo service provider to test the map functionality
              </p>
              <Button 
                onClick={createDemoProvider}
                disabled={creatingDemo}
                className="w-auto"
              >
                {creatingDemo ? 'Creating...' : 'Create Demo Provider Near Me'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Toggle and Content */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            {t.listView}
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="w-4 h-4" />
            {t.mapView}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          {/* Services Grid */}
          {filteredServices.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">{t.noServices}</h3>
                  <p className="text-sm text-muted-foreground">{t.noServicesDesc}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <Card key={service.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{service.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{service.business_name}</span>
                        </div>
                      </div>
                      {service.is_featured && (
                        <Badge variant="secondary" className="ml-2">{t.featured}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {service.image_url && (
                      <SmartImage
                        src={service.image_url}
                        alt={service.title}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    )}
                    
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {service.description}
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="outline">{service.category}</Badge>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span>{service.click_count}</span>
                        <span>{t.clickCount}</span>
                      </div>
                    </div>

                    {service.service_areas.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="line-clamp-1">{service.service_areas.join(', ')}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={service.advertiser_profile?.avatar_url} />
                          <AvatarFallback>
                            {service.advertiser_profile?.full_name?.charAt(0) || 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {service.advertiser_profile?.full_name || 'Service Provider'}
                        </span>
                      </div>
                      {service.price && (
                        <span className="font-semibold text-primary">
                          RM{service.price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleServiceClick(service.id)}
                        className="flex-1"
                      >
                        {t.viewDetails}
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleContactProvider(service)}
                        className="flex-1"
                      >
                        {t.contactProvider}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="map" className="mt-6">
          <ServicesMap 
            language={language}
            selectedCategory={selectedCategory}
            searchTerm={searchTerm}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}