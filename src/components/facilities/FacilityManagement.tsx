import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Settings, 
  Calendar, 
  BarChart3, 
  AlertTriangle,
  Clock,
  Users,
  DollarSign,
  Plus,
  Edit3,
  Power,
  Wrench
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FacilityConfigModal } from './FacilityConfigModal';
import { FacilityBookingCalendar } from './FacilityBookingCalendar';
import { FacilityUsageReports } from './FacilityUsageReports';

interface Facility {
  id: string;
  name: string;
  description?: string;
  location?: string;
  capacity: number;
  hourly_rate: number;
  is_available: boolean;
  amenities: string[];
  rules: string[];
  operating_hours: any;
  image?: string;
  images: string[];
  created_at: string;
  updated_at: string;
  district_id?: string;
}

export function FacilityManagement() {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const canManage = hasRole('facility_manager') || hasRole('community_admin') || 
                   hasRole('district_coordinator') || hasRole('state_admin');

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .order('name');

      if (error) throw error;
      setFacilities(data || []);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      toast({
        title: "Error",
        description: "Failed to load facilities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFacilityAvailability = async (facilityId: string, isAvailable: boolean) => {
    try {
      const { error } = await supabase
        .from('facilities')
        .update({ is_available: isAvailable })
        .eq('id', facilityId);

      if (error) throw error;

      setFacilities(prev => 
        prev.map(f => f.id === facilityId ? { ...f, is_available: isAvailable } : f)
      );

      toast({
        title: "Success",
        description: `Facility ${isAvailable ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error) {
      console.error('Error updating facility availability:', error);
      toast({
        title: "Error",
        description: "Failed to update facility availability",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading facilities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Facility Management</h1>
          <p className="text-muted-foreground">Configure and manage community facilities</p>
        </div>
        {canManage && (
          <Button onClick={() => setShowConfigModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Facility
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="usage">Usage Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {facilities.map((facility) => (
              <Card key={facility.id} className="relative">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{facility.name}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={facility.is_available ? "default" : "secondary"}>
                        {facility.is_available ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {facility.description || "No description available"}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{facility.capacity} people</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>RM {facility.hourly_rate}/hour</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{facility.location || 'Location not set'}</span>
                    </div>
                  </div>

                  {facility.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {facility.amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {canManage && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={facility.is_available}
                            onCheckedChange={(checked) => toggleFacilityAvailability(facility.id, checked)}
                          />
                          <span className="text-sm">Available</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFacility(facility);
                          setShowConfigModal(true);
                        }}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {facilities.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Facilities Found</h3>
                <p className="text-muted-foreground mb-4">
                  Start by adding facilities for your community to manage.
                </p>
                {canManage && (
                  <Button onClick={() => setShowConfigModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Facility
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bookings">
          <FacilityBookingCalendar facilities={facilities} />
        </TabsContent>

        <TabsContent value="usage">
          <FacilityUsageReports facilities={facilities} />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Additional facility management settings will be available here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <FacilityConfigModal
        open={showConfigModal}
        onOpenChange={setShowConfigModal}
        facility={selectedFacility}
        onSave={() => {
          fetchFacilities();
          setSelectedFacility(null);
        }}
      />
    </div>
  );
}