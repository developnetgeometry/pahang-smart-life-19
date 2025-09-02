import { useState, useEffect } from 'react';
import { Truck, MapPin, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Mock data until database migration is executed
const mockShippingMethods = [
  {
    id: '1',
    name: 'Standard Delivery',
    service_type: 'standard',
    base_cost: 5.00,
    estimated_days_min: 3,
    estimated_days_max: 5,
    is_active: true,
    tracking_available: true,
    insurance_available: false
  },
  {
    id: '2',
    name: 'Express Delivery',
    service_type: 'express', 
    base_cost: 12.00,
    estimated_days_min: 1,
    estimated_days_max: 2,
    is_active: true,
    tracking_available: true,
    insurance_available: true
  },
  {
    id: '3',
    name: 'Economy Shipping',
    service_type: 'economy',
    base_cost: 2.50,
    estimated_days_min: 5,
    estimated_days_max: 10,
    is_active: true,
    tracking_available: false,
    insurance_available: false
  }
];

const mockShippingZones = [
  {
    id: '1',
    name: 'Klang Valley',
    states: ['Kuala Lumpur', 'Selangor', 'Putrajaya'],
    is_active: true
  },
  {
    id: '2',
    name: 'Northern Region',
    states: ['Penang', 'Kedah', 'Perlis', 'Perak'],
    is_active: true
  },
  {
    id: '3',
    name: 'Southern Region',
    states: ['Johor', 'Melaka', 'Negeri Sembilan'],
    is_active: true
  }
];

const mockShippingRates = [
  { id: '1', method_name: 'Standard Delivery', zone_name: 'Klang Valley', base_rate: 5.00, per_kg_rate: 1.50 },
  { id: '2', method_name: 'Express Delivery', zone_name: 'Klang Valley', base_rate: 12.00, per_kg_rate: 2.00 },
  { id: '3', method_name: 'Standard Delivery', zone_name: 'Northern Region', base_rate: 8.00, per_kg_rate: 2.00 },
  { id: '4', method_name: 'Express Delivery', zone_name: 'Northern Region', base_rate: 15.00, per_kg_rate: 3.00 }
];

export default function ShippingManager() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div>Loading shipping data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Shipping Management</h2>
        <Badge variant="outline" className="text-yellow-600">
          Mock Data - Migration Pending
        </Badge>
      </div>

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
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Base Cost</TableHead>
                <TableHead>Delivery Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Features</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockShippingMethods.map((method) => (
                <TableRow key={method.id}>
                  <TableCell className="font-medium">{method.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{method.service_type}</Badge>
                  </TableCell>
                  <TableCell>RM{method.base_cost.toFixed(2)}</TableCell>
                  <TableCell>
                    {method.estimated_days_min}-{method.estimated_days_max} days
                  </TableCell>
                  <TableCell>
                    <Badge variant={method.is_active ? 'default' : 'secondary'}>
                      {method.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {method.tracking_available && <Badge variant="outline">Tracking</Badge>}
                      {method.insurance_available && <Badge variant="outline">Insurance</Badge>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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
                <TableHead>Name</TableHead>
                <TableHead>States</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockShippingZones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-medium">{zone.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {zone.states.slice(0, 3).map((state, index) => (
                        <Badge key={index} variant="outline">{state}</Badge>
                      ))}
                      {zone.states.length > 3 && (
                        <Badge variant="secondary">+{zone.states.length - 3} more</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={zone.is_active ? 'default' : 'secondary'}>
                      {zone.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Shipping Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Shipping Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Method</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Base Rate</TableHead>
                <TableHead>Per Kg Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockShippingRates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell>{rate.method_name}</TableCell>
                  <TableCell>{rate.zone_name}</TableCell>
                  <TableCell>RM{rate.base_rate.toFixed(2)}</TableCell>
                  <TableCell>{rate.per_kg_rate ? `RM${rate.per_kg_rate.toFixed(2)}` : 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground mt-6 p-4 bg-muted rounded-lg">
        ⚠️ This is displaying mock data. Full shipping management will be available after the database migration is executed.
      </div>
    </div>
  );
}