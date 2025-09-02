import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Truck, MapPin, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  base_cost: number;
  cost_per_kg?: number;
  estimated_days_min: number;
  estimated_days_max: number;
  is_active: boolean;
  service_type: string;
  tracking_available: boolean;
  insurance_available: boolean;
}

interface ShippingZone {
  id: string;
  name: string;
  description?: string;
  states: string[];
  is_active: boolean;
}

interface ShippingRate {
  id: string;
  method_id: string;
  zone_id: string;
  base_rate: number;
  per_kg_rate?: number;
  min_weight?: number;
  max_weight?: number;
  method_name?: string;
  zone_name?: string;
}

export default function ShippingManager() {
  const { toast } = useToast();
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [editingRate, setEditingRate] = useState<ShippingRate | null>(null);
  const [isMethodDialogOpen, setIsMethodDialogOpen] = useState(false);
  const [isZoneDialogOpen, setIsZoneDialogOpen] = useState(false);
  const [isRateDialogOpen, setIsRateDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [methodsRes, zonesRes, ratesRes] = await Promise.all([
        supabase.from('shipping_methods').select('*').order('name'),
        supabase.from('shipping_zones').select('*').order('name'),
        supabase
          .from('shipping_rates')
          .select(`
            *,
            shipping_methods!inner(name),
            shipping_zones!inner(name)
          `)
          .order('base_rate')
      ]);

      if (methodsRes.error) throw methodsRes.error;
      if (zonesRes.error) throw zonesRes.error;
      if (ratesRes.error) throw ratesRes.error;

      setMethods(methodsRes.data || []);
      setZones(zonesRes.data || []);
      
      const processedRates = ratesRes.data?.map(rate => ({
        ...rate,
        method_name: rate.shipping_methods?.name,
        zone_name: rate.shipping_zones?.name
      })) || [];
      
      setRates(processedRates);
    } catch (error) {
      console.error('Error fetching shipping data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch shipping data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMethod = async (method: Partial<ShippingMethod>) => {
    try {
      if (editingMethod?.id) {
        const { error } = await supabase
          .from('shipping_methods')
          .update(method)
          .eq('id', editingMethod.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Shipping method updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('shipping_methods')
          .insert(method);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Shipping method created successfully",
        });
      }
      
      fetchData();
      setIsMethodDialogOpen(false);
      setEditingMethod(null);
    } catch (error) {
      console.error('Error saving method:', error);
      toast({
        title: "Error",
        description: "Failed to save shipping method",
        variant: "destructive",
      });
    }
  };

  const handleSaveZone = async (zone: Partial<ShippingZone>) => {
    try {
      if (editingZone?.id) {
        const { error } = await supabase
          .from('shipping_zones')
          .update(zone)
          .eq('id', editingZone.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Shipping zone updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('shipping_zones')
          .insert(zone);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Shipping zone created successfully",
        });
      }
      
      fetchData();
      setIsZoneDialogOpen(false);
      setEditingZone(null);
    } catch (error) {
      console.error('Error saving zone:', error);
      toast({
        title: "Error",
        description: "Failed to save shipping zone",
        variant: "destructive",
      });
    }
  };

  const handleSaveRate = async (rate: Partial<ShippingRate>) => {
    try {
      if (editingRate?.id) {
        const { error } = await supabase
          .from('shipping_rates')
          .update(rate)
          .eq('id', editingRate.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Shipping rate updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('shipping_rates')
          .insert(rate);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Shipping rate created successfully",
        });
      }
      
      fetchData();
      setIsRateDialogOpen(false);
      setEditingRate(null);
    } catch (error) {
      console.error('Error saving rate:', error);
      toast({
        title: "Error",
        description: "Failed to save shipping rate",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMethod = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shipping_methods')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Shipping method deleted successfully",
      });
      
      fetchData();
    } catch (error) {
      console.error('Error deleting method:', error);
      toast({
        title: "Error",
        description: "Failed to delete shipping method",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading shipping data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Shipping Management</h2>
      </div>

      {/* Shipping Methods */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipping Methods
          </CardTitle>
          <Dialog open={isMethodDialogOpen} onOpenChange={setIsMethodDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingMethod(null); setIsMethodDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Method
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingMethod ? 'Edit' : 'Add'} Shipping Method</DialogTitle>
              </DialogHeader>
              <MethodForm
                method={editingMethod}
                onSave={handleSaveMethod}
                onCancel={() => setIsMethodDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {methods.map((method) => (
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
                  <TableCell className="space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingMethod(method);
                        setIsMethodDialogOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMethod(method.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Shipping Zones */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Shipping Zones
          </CardTitle>
          <Dialog open={isZoneDialogOpen} onOpenChange={setIsZoneDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingZone(null); setIsZoneDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Zone
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingZone ? 'Edit' : 'Add'} Shipping Zone</DialogTitle>
              </DialogHeader>
              <ZoneForm
                zone={editingZone}
                onSave={handleSaveZone}
                onCancel={() => setIsZoneDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>States</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones.map((zone) => (
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
                  <TableCell className="space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingZone(zone);
                        setIsZoneDialogOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Shipping Rates */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Shipping Rates
          </CardTitle>
          <Dialog open={isRateDialogOpen} onOpenChange={setIsRateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingRate(null); setIsRateDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Rate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingRate ? 'Edit' : 'Add'} Shipping Rate</DialogTitle>
              </DialogHeader>
              <RateForm
                rate={editingRate}
                methods={methods}
                zones={zones}
                onSave={handleSaveRate}
                onCancel={() => setIsRateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Method</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Base Rate</TableHead>
                <TableHead>Per Kg Rate</TableHead>
                <TableHead>Weight Range</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell>{rate.method_name}</TableCell>
                  <TableCell>{rate.zone_name}</TableCell>
                  <TableCell>RM{rate.base_rate.toFixed(2)}</TableCell>
                  <TableCell>{rate.per_kg_rate ? `RM${rate.per_kg_rate.toFixed(2)}` : 'N/A'}</TableCell>
                  <TableCell>
                    {rate.min_weight || 0}kg - {rate.max_weight || '∞'}kg
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingRate(rate);
                        setIsRateDialogOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Method Form Component
function MethodForm({ 
  method, 
  onSave, 
  onCancel 
}: { 
  method: ShippingMethod | null; 
  onSave: (method: Partial<ShippingMethod>) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    name: method?.name || '',
    description: method?.description || '',
    service_type: method?.service_type || 'standard',
    base_cost: method?.base_cost || 0,
    cost_per_kg: method?.cost_per_kg || 0,
    estimated_days_min: method?.estimated_days_min || 1,
    estimated_days_max: method?.estimated_days_max || 3,
    tracking_available: method?.tracking_available || false,
    insurance_available: method?.insurance_available || false,
    is_active: method?.is_active ?? true
  });

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Method Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      
      <div>
        <Label htmlFor="service_type">Service Type</Label>
        <Select value={formData.service_type} onValueChange={(value) => setFormData({ ...formData, service_type: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="express">Express</SelectItem>
            <SelectItem value="overnight">Overnight</SelectItem>
            <SelectItem value="economy">Economy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="base_cost">Base Cost (RM)</Label>
          <Input
            id="base_cost"
            type="number"
            step="0.01"
            value={formData.base_cost}
            onChange={(e) => setFormData({ ...formData, base_cost: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label htmlFor="cost_per_kg">Cost per Kg (RM)</Label>
          <Input
            id="cost_per_kg"
            type="number"
            step="0.01"
            value={formData.cost_per_kg}
            onChange={(e) => setFormData({ ...formData, cost_per_kg: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="min_days">Min Days</Label>
          <Input
            id="min_days"
            type="number"
            value={formData.estimated_days_min}
            onChange={(e) => setFormData({ ...formData, estimated_days_min: parseInt(e.target.value) || 1 })}
          />
        </div>
        <div>
          <Label htmlFor="max_days">Max Days</Label>
          <Input
            id="max_days"
            type="number"
            value={formData.estimated_days_max}
            onChange={(e) => setFormData({ ...formData, estimated_days_max: parseInt(e.target.value) || 3 })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.tracking_available}
            onChange={(e) => setFormData({ ...formData, tracking_available: e.target.checked })}
          />
          Tracking Available
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.insurance_available}
            onChange={(e) => setFormData({ ...formData, insurance_available: e.target.checked })}
          />
          Insurance Available
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          />
          Active
        </label>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => onSave(formData)}>Save</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

// Zone Form Component
function ZoneForm({ 
  zone, 
  onSave, 
  onCancel 
}: { 
  zone: ShippingZone | null; 
  onSave: (zone: Partial<ShippingZone>) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    name: zone?.name || '',
    description: zone?.description || '',
    states: zone?.states || [],
    is_active: zone?.is_active ?? true
  });

  const malaysianStates = [
    'Johor', 'Kedah', 'Kelantan', 'Kuala Lumpur', 'Labuan', 'Malacca', 'Negeri Sembilan',
    'Pahang', 'Penang', 'Perak', 'Perlis', 'Putrajaya', 'Sabah', 'Sarawak', 'Selangor', 'Terengganu'
  ];

  const handleStateToggle = (state: string) => {
    const newStates = formData.states.includes(state)
      ? formData.states.filter(s => s !== state)
      : [...formData.states, state];
    setFormData({ ...formData, states: newStates });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Zone Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div>
        <Label>States</Label>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-2">
          {malaysianStates.map((state) => (
            <label key={state} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.states.includes(state)}
                onChange={() => handleStateToggle(state)}
              />
              {state}
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
        />
        <Label>Active</Label>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => onSave(formData)}>Save</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

// Rate Form Component
function RateForm({ 
  rate, 
  methods, 
  zones, 
  onSave, 
  onCancel 
}: { 
  rate: ShippingRate | null; 
  methods: ShippingMethod[]; 
  zones: ShippingZone[]; 
  onSave: (rate: Partial<ShippingRate>) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    method_id: rate?.method_id || '',
    zone_id: rate?.zone_id || '',
    base_rate: rate?.base_rate || 0,
    per_kg_rate: rate?.per_kg_rate || 0,
    min_weight: rate?.min_weight || 0,
    max_weight: rate?.max_weight || 100
  });

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="method_id">Shipping Method</Label>
        <Select value={formData.method_id} onValueChange={(value) => setFormData({ ...formData, method_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            {methods.map((method) => (
              <SelectItem key={method.id} value={method.id}>
                {method.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="zone_id">Shipping Zone</Label>
        <Select value={formData.zone_id} onValueChange={(value) => setFormData({ ...formData, zone_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select zone" />
          </SelectTrigger>
          <SelectContent>
            {zones.map((zone) => (
              <SelectItem key={zone.id} value={zone.id}>
                {zone.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="base_rate">Base Rate (RM)</Label>
          <Input
            id="base_rate"
            type="number"
            step="0.01"
            value={formData.base_rate}
            onChange={(e) => setFormData({ ...formData, base_rate: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label htmlFor="per_kg_rate">Per Kg Rate (RM)</Label>
          <Input
            id="per_kg_rate"
            type="number"
            step="0.01"
            value={formData.per_kg_rate}
            onChange={(e) => setFormData({ ...formData, per_kg_rate: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="min_weight">Min Weight (kg)</Label>
          <Input
            id="min_weight"
            type="number"
            step="0.1"
            value={formData.min_weight}
            onChange={(e) => setFormData({ ...formData, min_weight: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label htmlFor="max_weight">Max Weight (kg)</Label>
          <Input
            id="max_weight"
            type="number"
            step="0.1"
            value={formData.max_weight}
            onChange={(e) => setFormData({ ...formData, max_weight: parseFloat(e.target.value) || 100 })}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => onSave(formData)}>Save</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}