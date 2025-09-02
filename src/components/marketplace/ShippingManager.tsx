import { useState, useEffect } from 'react';
import { Truck, MapPin, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';

interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  base_rate: number;
  per_kg_rate?: number;
  free_shipping_threshold?: number;
  estimated_days_min?: number;
  estimated_days_max?: number;
  is_active?: boolean;
}

interface ShippingZone {
  id: string;
  name: string;
  districts?: any;
}

export default function ShippingManager() {
  const [loading, setLoading] = useState(true);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);

  useEffect(() => {
    const fetchShippingData = async () => {
      try {
        // Fetch shipping methods
        const { data: methods } = await supabase
          .from('shipping_methods')
          .select('*')
          .order('name');

        // Fetch shipping zones
        const { data: zones } = await supabase
          .from('shipping_zones')
          .select('*')
          .order('name');

        setShippingMethods(methods || []);
        setShippingZones(zones || []);
      } catch (error) {
        console.error('Error fetching shipping data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShippingData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Truck className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Shipping Management</h2>
      </div>

      {shippingMethods.length === 0 && shippingZones.length === 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 font-medium">
            ℹ️ No shipping data configured yet. Please contact an administrator to set up shipping methods and zones.
          </p>
        </div>
      )}

      {/* Shipping Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipping Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Method Name</TableHead>
                <TableHead>Base Rate</TableHead>
                <TableHead>Per KG Rate</TableHead>
                <TableHead>Free Shipping</TableHead>
                <TableHead>Delivery Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shippingMethods.map((method) => (
                <TableRow key={method.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{method.name}</div>
                      {method.description && (
                        <div className="text-sm text-gray-500">{method.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>RM {method.base_rate.toFixed(2)}</TableCell>
                  <TableCell>
                    {method.per_kg_rate ? `RM ${method.per_kg_rate.toFixed(2)}/kg` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {method.free_shipping_threshold ? `Above RM ${method.free_shipping_threshold.toFixed(2)}` : 'No'}
                  </TableCell>
                  <TableCell>
                    {method.estimated_days_min && method.estimated_days_max 
                      ? `${method.estimated_days_min}-${method.estimated_days_max} days`
                      : 'Standard'
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant={method.is_active !== false ? "default" : "secondary"}>
                      {method.is_active !== false ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {shippingMethods.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No shipping methods configured
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Shipping Zones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Shipping Zones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zone Name</TableHead>
                <TableHead>Coverage Area</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shippingZones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-medium">{zone.name}</TableCell>
                  <TableCell>
                    {zone.districts 
                      ? (typeof zone.districts === 'string' 
                          ? zone.districts 
                          : JSON.stringify(zone.districts))
                      : 'Coverage area not specified'
                    }
                  </TableCell>
                </TableRow>
              ))}
              {shippingZones.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                    No shipping zones configured
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}