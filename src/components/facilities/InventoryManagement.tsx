import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Package, Plus, AlertTriangle, TrendingDown, Wrench, QrCode, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface Supply {
  id: string;
  facility_id: string;
  item_name: string;
  category: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  unit_cost: number;
  supplier: string;
  last_restocked_date: string;
  expiry_date: string;
  is_active: boolean;
  facilities: { name: string };
}

interface Equipment {
  id: string;
  facility_id: string;
  name: string;
  equipment_type: string;
  model: string;
  serial_number: string;
  qr_code: string;
  condition_status: string;
  last_maintenance_date: string;
  next_maintenance_date: string;
  warranty_expiry: string;
  is_active: boolean;
  facilities: { name: string };
}

interface Facility {
  id: string;
  name: string;
}

export function InventoryManagement() {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('supplies');
  
  // Supply form state
  const [supplyForm, setSupplyForm] = useState({
    facility_id: '',
    item_name: '',
    category: 'cleaning',
    current_stock: 0,
    minimum_stock: 5,
    maximum_stock: 100,
    unit_cost: 0,
    supplier: '',
    expiry_date: ''
  });

  // Equipment form state
  const [equipmentForm, setEquipmentForm] = useState({
    facility_id: '',
    name: '',
    equipment_type: '',
    model: '',
    serial_number: '',
    condition_status: 'good',
    warranty_expiry: '',
    maintenance_interval_days: 90
  });

  const [openSupplyDialog, setOpenSupplyDialog] = useState(false);
  const [openEquipmentDialog, setOpenEquipmentDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch facilities
      const { data: facilitiesData } = await supabase
        .from('facilities')
        .select('id, name')
        .eq('is_available', true);

      // Fetch supplies
      const { data: suppliesData } = await supabase
        .from('facility_supplies')
        .select(`
          *,
          facilities(name)
        `)
        .eq('is_active', true)
        .order('item_name');

      // Fetch equipment
      const { data: equipmentData } = await supabase
        .from('facility_equipment')
        .select(`
          *,
          facilities(name)
        `)
        .eq('is_active', true)
        .order('name');

      setFacilities(facilitiesData || []);
      setSupplies(suppliesData || []);
      setEquipment(equipmentData || []);

    } catch (error) {
      console.error('Error fetching inventory data:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupply = async () => {
    try {
      const { error } = await supabase
        .from('facility_supplies')
        .insert({
          ...supplyForm,
          last_restocked_date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      toast.success('Supply item added successfully');
      setOpenSupplyDialog(false);
      resetSupplyForm();
      fetchData();

    } catch (error) {
      console.error('Error adding supply:', error);
      toast.error('Failed to add supply item');
    }
  };

  const handleAddEquipment = async () => {
    try {
      // Generate QR code
      const qrCode = `EQ-${Date.now()}`;
      
      const nextMaintenanceDate = new Date();
      nextMaintenanceDate.setDate(nextMaintenanceDate.getDate() + equipmentForm.maintenance_interval_days);

      const { error } = await supabase
        .from('facility_equipment')
        .insert({
          ...equipmentForm,
          qr_code: qrCode,
          next_maintenance_date: nextMaintenanceDate.toISOString().split('T')[0]
        });

      if (error) throw error;

      toast.success('Equipment added successfully');
      setOpenEquipmentDialog(false);
      resetEquipmentForm();
      fetchData();

    } catch (error) {
      console.error('Error adding equipment:', error);
      toast.error('Failed to add equipment');
    }
  };

  const updateStock = async (supplyId: string, newStock: number, operation: 'restock' | 'consume') => {
    try {
      const updateData: any = { current_stock: newStock };
      
      if (operation === 'restock') {
        updateData.last_restocked_date = new Date().toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('facility_supplies')
        .update(updateData)
        .eq('id', supplyId);

      if (error) throw error;

      toast.success(`Stock ${operation === 'restock' ? 'restocked' : 'updated'} successfully`);
      fetchData();

    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    }
  };

  const resetSupplyForm = () => {
    setSupplyForm({
      facility_id: '',
      item_name: '',
      category: 'cleaning',
      current_stock: 0,
      minimum_stock: 5,
      maximum_stock: 100,
      unit_cost: 0,
      supplier: '',
      expiry_date: ''
    });
  };

  const resetEquipmentForm = () => {
    setEquipmentForm({
      facility_id: '',
      name: '',
      equipment_type: '',
      model: '',
      serial_number: '',
      condition_status: 'good',
      warranty_expiry: '',
      maintenance_interval_days: 90
    });
  };

  const getStockLevel = (current: number, minimum: number, maximum: number) => {
    const percentage = (current / maximum) * 100;
    if (current <= minimum) return { level: 'critical', color: 'bg-red-500', percentage };
    if (current <= minimum * 2) return { level: 'low', color: 'bg-orange-500', percentage };
    if (current >= maximum * 0.8) return { level: 'high', color: 'bg-green-500', percentage };
    return { level: 'normal', color: 'bg-blue-500', percentage };
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-orange-100 text-orange-800';
      case 'out_of_service': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const lowStockSupplies = supplies.filter(s => s.current_stock <= s.minimum_stock);
  const upcomingMaintenance = equipment.filter(e => {
    const nextMaintenance = new Date(e.next_maintenance_date);
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    return nextMaintenance <= oneWeekFromNow;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Inventory Management</h2>
        <p className="text-muted-foreground">Manage facility supplies and equipment</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Supplies</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supplies.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockSupplies.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipment</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{equipment.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Maintenance</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{upcomingMaintenance.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="supplies">Supplies</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="supplies" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Supply Inventory</h3>
            <Dialog open={openSupplyDialog} onOpenChange={setOpenSupplyDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Supply
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Supply Item</DialogTitle>
                  <DialogDescription>Add a new item to the supply inventory</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div>
                    <Label>Facility</Label>
                    <Select value={supplyForm.facility_id} onValueChange={(value) => 
                      setSupplyForm({...supplyForm, facility_id: value})
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select facility" />
                      </SelectTrigger>
                      <SelectContent>
                        {facilities.map(facility => (
                          <SelectItem key={facility.id} value={facility.id}>
                            {facility.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Item Name</Label>
                    <Input
                      value={supplyForm.item_name}
                      onChange={(e) => setSupplyForm({...supplyForm, item_name: e.target.value})}
                      placeholder="e.g. Toilet Paper, Cleaning Spray"
                    />
                  </div>

                  <div>
                    <Label>Category</Label>
                    <Select value={supplyForm.category} onValueChange={(value) => 
                      setSupplyForm({...supplyForm, category: value})
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cleaning">Cleaning</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="safety">Safety</SelectItem>
                        <SelectItem value="consumables">Consumables</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label>Current Stock</Label>
                      <Input
                        type="number"
                        value={supplyForm.current_stock}
                        onChange={(e) => setSupplyForm({...supplyForm, current_stock: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label>Min Stock</Label>
                      <Input
                        type="number"
                        value={supplyForm.minimum_stock}
                        onChange={(e) => setSupplyForm({...supplyForm, minimum_stock: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label>Max Stock</Label>
                      <Input
                        type="number"
                        value={supplyForm.maximum_stock}
                        onChange={(e) => setSupplyForm({...supplyForm, maximum_stock: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Unit Cost (MYR)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={supplyForm.unit_cost}
                        onChange={(e) => setSupplyForm({...supplyForm, unit_cost: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label>Supplier</Label>
                      <Input
                        value={supplyForm.supplier}
                        onChange={(e) => setSupplyForm({...supplyForm, supplier: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Expiry Date (Optional)</Label>
                    <Input
                      type="date"
                      value={supplyForm.expiry_date}
                      onChange={(e) => setSupplyForm({...supplyForm, expiry_date: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenSupplyDialog(false)}>Cancel</Button>
                  <Button onClick={handleAddSupply}>Add Supply</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {supplies.map((supply) => {
              const stockInfo = getStockLevel(supply.current_stock, supply.minimum_stock, supply.maximum_stock);
              return (
                <Card key={supply.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{supply.item_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {supply.facilities.name} • {supply.category}
                        </p>
                      </div>
                      <Badge variant="outline" className={getConditionColor(stockInfo.level)}>
                        {stockInfo.level}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Stock Level</span>
                        <span>{supply.current_stock} / {supply.maximum_stock}</span>
                      </div>
                      <Progress value={stockInfo.percentage} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        Min: {supply.minimum_stock} • Last restocked: {new Date(supply.last_restocked_date).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateStock(supply.id, supply.current_stock + 10, 'restock')}
                      >
                        +10
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateStock(supply.id, Math.max(0, supply.current_stock - 1), 'consume')}
                      >
                        -1
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Equipment Registry</h3>
            <Dialog open={openEquipmentDialog} onOpenChange={setOpenEquipmentDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Equipment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Equipment</DialogTitle>
                  <DialogDescription>Register new equipment to the inventory</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div>
                    <Label>Facility</Label>
                    <Select value={equipmentForm.facility_id} onValueChange={(value) => 
                      setEquipmentForm({...equipmentForm, facility_id: value})
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select facility" />
                      </SelectTrigger>
                      <SelectContent>
                        {facilities.map(facility => (
                          <SelectItem key={facility.id} value={facility.id}>
                            {facility.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Equipment Name</Label>
                      <Input
                        value={equipmentForm.name}
                        onChange={(e) => setEquipmentForm({...equipmentForm, name: e.target.value})}
                        placeholder="e.g. Treadmill 01"
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Input
                        value={equipmentForm.equipment_type}
                        onChange={(e) => setEquipmentForm({...equipmentForm, equipment_type: e.target.value})}
                        placeholder="e.g. Cardio Equipment"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Model</Label>
                      <Input
                        value={equipmentForm.model}
                        onChange={(e) => setEquipmentForm({...equipmentForm, model: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Serial Number</Label>
                      <Input
                        value={equipmentForm.serial_number}
                        onChange={(e) => setEquipmentForm({...equipmentForm, serial_number: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Condition</Label>
                      <Select value={equipmentForm.condition_status} onValueChange={(value) => 
                        setEquipmentForm({...equipmentForm, condition_status: value})
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Maintenance Interval (Days)</Label>
                      <Input
                        type="number"
                        value={equipmentForm.maintenance_interval_days}
                        onChange={(e) => setEquipmentForm({...equipmentForm, maintenance_interval_days: parseInt(e.target.value) || 90})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Warranty Expiry</Label>
                    <Input
                      type="date"
                      value={equipmentForm.warranty_expiry}
                      onChange={(e) => setEquipmentForm({...equipmentForm, warranty_expiry: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenEquipmentDialog(false)}>Cancel</Button>
                  <Button onClick={handleAddEquipment}>Add Equipment</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {equipment.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.facilities.name} • {item.equipment_type}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getConditionColor(item.condition_status)}>
                        {item.condition_status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Model:</span> {item.model || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Serial:</span> {item.serial_number || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Last Maintenance:</span> 
                      {item.last_maintenance_date ? new Date(item.last_maintenance_date).toLocaleDateString() : 'Never'}
                    </div>
                    <div>
                      <span className="font-medium">Next Maintenance:</span> 
                      {new Date(item.next_maintenance_date).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <h3 className="text-lg font-semibold">Inventory Alerts</h3>
          
          {/* Low Stock Alerts */}
          {lowStockSupplies.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Low Stock Alert ({lowStockSupplies.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lowStockSupplies.map(supply => (
                  <div key={supply.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <span className="font-medium">{supply.item_name}</span>
                      <p className="text-sm text-muted-foreground">{supply.facilities.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-red-600 font-bold">{supply.current_stock}</span>
                      <span className="text-sm text-muted-foreground"> / {supply.minimum_stock} min</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Upcoming Maintenance */}
          {upcomingMaintenance.length > 0 && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-700 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Maintenance ({upcomingMaintenance.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingMaintenance.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <p className="text-sm text-muted-foreground">{item.facilities.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-orange-600 font-bold">
                        {new Date(item.next_maintenance_date).toLocaleDateString()}
                      </span>
                      <p className="text-sm text-muted-foreground">Due</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {lowStockSupplies.length === 0 && upcomingMaintenance.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">All Good!</h3>
                <p className="text-muted-foreground">No inventory alerts at this time.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}