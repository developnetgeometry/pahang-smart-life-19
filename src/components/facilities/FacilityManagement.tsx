import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/use-user-roles';
import { toast } from 'sonner';
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
  Wrench,
  Package,
  TrendingUp,
  CheckSquare,
  Repeat
} from 'lucide-react';

// Import enhanced components
import { EnhancedFacilityDashboard } from './EnhancedFacilityDashboard';
import { BookingApprovalSystem } from './BookingApprovalSystem';
import { WorkOrderCreator } from './WorkOrderCreator';
import { InventoryManagement } from './InventoryManagement';
import { FacilityAnalyticsDashboard } from './FacilityAnalyticsDashboard';
import { RecurringBookingManager } from './RecurringBookingManager';
import { FacilityBookingCalendar } from './FacilityBookingCalendar';
import { FacilityUsageReports } from './FacilityUsageReports';
import { FacilityConfigModal } from './FacilityConfigModal';

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
  const { user } = useAuth();
  const { hasRole } = useUserRoles();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Check user permissions - using correct role names
  const isFacilityManager = hasRole('maintenance_staff'); // Closest role to facility manager
  const canManageBookings = hasRole('maintenance_staff') || hasRole('community_admin') || 
                           hasRole('district_coordinator') || hasRole('state_admin');
  const canManageFacilities = hasRole('community_admin') || hasRole('district_coordinator') || 
                             hasRole('state_admin');

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
      toast.error('Failed to load facilities');
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

      toast.success(`Facility ${isAvailable ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Error updating facility availability:', error);
      toast.error('Failed to update facility availability');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading facility management system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Facility Management System</h1>
          <p className="text-muted-foreground">
            {isFacilityManager 
              ? "Comprehensive facility operations and management"
              : "Community facility overview and booking management"
            }
          </p>
        </div>
        {canManageFacilities && (
          <Button onClick={() => setShowConfigModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Facility
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Approvals
          </TabsTrigger>
          <TabsTrigger value="work-orders" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Work Orders
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="recurring" className="flex items-center gap-2">
            <Repeat className="h-4 w-4" />
            Recurring
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="facilities" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Facilities
          </TabsTrigger>
        </TabsList>

        {/* Enhanced Dashboard - Default view for facility managers */}
        <TabsContent value="dashboard" className="space-y-6">
          <EnhancedFacilityDashboard />
        </TabsContent>

        {/* Booking Approval System */}
        <TabsContent value="approvals" className="space-y-6">
          {canManageBookings ? (
            <BookingApprovalSystem />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
                <p className="text-muted-foreground">You don't have permission to manage booking approvals.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Work Order Management */}
        <TabsContent value="work-orders" className="space-y-6">
          {isFacilityManager || canManageBookings ? (
            <WorkOrderCreator />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
                <p className="text-muted-foreground">You don't have permission to manage work orders.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Inventory Management */}
        <TabsContent value="inventory" className="space-y-6">
          {isFacilityManager || canManageBookings ? (
            <InventoryManagement />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
                <p className="text-muted-foreground">You don't have permission to manage inventory.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Dashboard */}
        <TabsContent value="analytics" className="space-y-6">
          {isFacilityManager || canManageBookings ? (
            <FacilityAnalyticsDashboard />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
                <p className="text-muted-foreground">You don't have permission to view detailed analytics.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Recurring Bookings */}
        <TabsContent value="recurring" className="space-y-6">
          {canManageBookings ? (
            <RecurringBookingManager />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Repeat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
                <p className="text-muted-foreground">You don't have permission to manage recurring bookings.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Booking Calendar */}
        <TabsContent value="calendar" className="space-y-6">
          <FacilityBookingCalendar facilities={facilities} />
        </TabsContent>

        {/* Facilities Overview */}
        <TabsContent value="facilities" className="space-y-6">
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

                  {(isFacilityManager || canManageFacilities) && (
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
                      {canManageFacilities && (
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
                      )}
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
                {canManageFacilities && (
                  <Button onClick={() => setShowConfigModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Facility
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Facility Configuration Modal */}
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