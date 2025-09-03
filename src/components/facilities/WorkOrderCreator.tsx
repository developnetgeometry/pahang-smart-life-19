import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Wrench, AlertTriangle, Clock, User, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Facility {
  id: string;
  name: string;
  location?: string;
}

interface Equipment {
  id: string;
  name: string;
  equipment_type: string;
  facility_id: string;
}

interface MaintenanceStaff {
  id: string;
  full_name: string;
  email: string;
}

interface WorkOrder {
  id: string;
  title: string;
  description: string;
  work_order_type: string;
  priority: string;
  status: string;
  created_at: string;
  facilities: { name: string };
  facility_equipment?: { name: string };
}

export function WorkOrderCreator() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [maintenanceStaff, setMaintenanceStaff] = useState<MaintenanceStaff[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    facility_id: '',
    equipment_id: '',
    work_order_type: 'maintenance',
    priority: 'medium',
    assigned_to: '',
    estimated_cost: '',
    estimated_duration_hours: '',
    scheduled_start: '',
    safety_requirements: '',
    required_skills: [] as string[],
    parts_needed: [] as Array<{name: string, quantity: number, estimated_cost: number}>
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch facilities
      const { data: facilitiesData } = await supabase
        .from('facilities')
        .select('id, name, location')
        .eq('is_available', true);

      // Fetch equipment
      const { data: equipmentData } = await supabase
        .from('facility_equipment')
        .select('id, name, equipment_type, facility_id')
        .eq('is_active', true);

      // Fetch maintenance staff - simplified approach
      const { data: staffRoles } = await supabase
        .from('enhanced_user_roles')
        .select('user_id')
        .eq('role', 'maintenance_staff')
        .eq('is_active', true);

      if (staffRoles && staffRoles.length > 0) {
        const { data: staffProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', staffRoles.map(s => s.user_id));
        
        setMaintenanceStaff(staffProfiles || []);
      } else {
        setMaintenanceStaff([]);
      }

      // Fetch existing work orders
      const { data: workOrdersData } = await supabase
        .from('facility_work_orders')
        .select(`
          *,
          facilities(name),
          facility_equipment(name)
        `)
        .in('status', ['pending', 'assigned', 'in_progress'])
        .order('created_at', { ascending: false });

      setFacilities(facilitiesData || []);
      setEquipment(equipmentData || []);
      setWorkOrders(workOrdersData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.facility_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      const workOrderData = {
        title: formData.title,
        description: formData.description,
        facility_id: formData.facility_id,
        equipment_id: formData.equipment_id || null,
        work_order_type: formData.work_order_type,
        priority: formData.priority,
        created_by: user?.id,
        assigned_to: formData.assigned_to || null,
        estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
        estimated_duration_hours: formData.estimated_duration_hours ? parseFloat(formData.estimated_duration_hours) : null,
        scheduled_start: formData.scheduled_start || null,
        safety_requirements: formData.safety_requirements || null,
        required_skills: formData.required_skills,
        parts_needed: formData.parts_needed,
        status: formData.assigned_to ? 'assigned' : 'pending'
      };

      const { data, error } = await supabase
        .from('facility_work_orders')
        .insert(workOrderData)
        .select()
        .single();

      if (error) throw error;

      // Send notification to assigned staff if any
      if (formData.assigned_to) {
        await supabase
          .from('notifications')
          .insert({
            recipient_id: formData.assigned_to,
            title: 'New Work Order Assigned',
            message: `You have been assigned a new work order: ${formData.title}`,
            notification_type: 'work_order',
            category: 'maintenance',
            reference_id: data.id,
            reference_table: 'facility_work_orders',
            created_by: user?.id,
            sent_at: new Date().toISOString(),
            priority: formData.priority === 'critical' || formData.priority === 'high' ? 'high' : 'normal'
          });
      }

      toast.success('Work order created successfully');
      setOpen(false);
      resetForm();
      fetchData(); // Refresh the list

    } catch (error) {
      console.error('Error creating work order:', error);
      toast.error('Failed to create work order');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      facility_id: '',
      equipment_id: '',
      work_order_type: 'maintenance',
      priority: 'medium',
      assigned_to: '',
      estimated_cost: '',
      estimated_duration_hours: '',
      scheduled_start: '',
      safety_requirements: '',
      required_skills: [],
      parts_needed: []
    });
  };

  const getFilteredEquipment = () => {
    return equipment.filter(eq => eq.facility_id === formData.facility_id);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Work Orders</h2>
          <p className="text-muted-foreground">Create and manage facility work orders</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Work Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Work Order</DialogTitle>
              <DialogDescription>
                Create a work order for facility maintenance or repairs
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Work Order Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Fix broken air conditioning in gym"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Detailed description of the work needed..."
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="facility">Facility *</Label>
                  <Select value={formData.facility_id} onValueChange={(value) => 
                    setFormData({...formData, facility_id: value, equipment_id: ''})
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select facility" />
                    </SelectTrigger>
                    <SelectContent>
                      {facilities.map((facility) => (
                        <SelectItem key={facility.id} value={facility.id}>
                          {facility.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="equipment">Equipment (Optional)</Label>
                  <Select value={formData.equipment_id} onValueChange={(value) => 
                    setFormData({...formData, equipment_id: value})
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {getFilteredEquipment().map((eq) => (
                        <SelectItem key={eq.id} value={eq.id}>
                          {eq.name} ({eq.equipment_type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type">Work Order Type</Label>
                  <Select value={formData.work_order_type} onValueChange={(value) => 
                    setFormData({...formData, work_order_type: value})
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="upgrade">Upgrade</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => 
                    setFormData({...formData, priority: value})
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="assigned_to">Assign To</Label>
                  <Select value={formData.assigned_to} onValueChange={(value) => 
                    setFormData({...formData, assigned_to: value})
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {maintenanceStaff.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="scheduled_start">Scheduled Start</Label>
                  <Input
                    id="scheduled_start"
                    type="datetime-local"
                    value={formData.scheduled_start}
                    onChange={(e) => setFormData({...formData, scheduled_start: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="estimated_cost">Estimated Cost (MYR)</Label>
                  <Input
                    id="estimated_cost"
                    type="number"
                    step="0.01"
                    value={formData.estimated_cost}
                    onChange={(e) => setFormData({...formData, estimated_cost: e.target.value})}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="estimated_duration">Estimated Duration (Hours)</Label>
                  <Input
                    id="estimated_duration"
                    type="number"
                    step="0.5"
                    value={formData.estimated_duration_hours}
                    onChange={(e) => setFormData({...formData, estimated_duration_hours: e.target.value})}
                    placeholder="0.0"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="safety_requirements">Safety Requirements</Label>
                  <Textarea
                    id="safety_requirements"
                    value={formData.safety_requirements}
                    onChange={(e) => setFormData({...formData, safety_requirements: e.target.value})}
                    placeholder="Special safety considerations or requirements..."
                    rows={2}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  ) : (
                    <Wrench className="h-4 w-4 mr-2" />
                  )}
                  Create Work Order
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Work Orders */}
      <div className="grid gap-4">
        {workOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Active Work Orders</h3>
              <p className="text-muted-foreground">All work orders are completed or none have been created yet.</p>
            </CardContent>
          </Card>
        ) : (
          workOrders.map((workOrder) => (
            <Card key={workOrder.id} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{workOrder.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <Wrench className="h-4 w-4" />
                        {workOrder.facilities.name}
                      </div>
                      {workOrder.facility_equipment && (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          {workOrder.facility_equipment.name}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(workOrder.created_at).toLocaleDateString()}
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(workOrder.priority)}>
                        {workOrder.priority}
                      </Badge>
                      <Badge className={getStatusColor(workOrder.status)}>
                        {workOrder.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {workOrder.work_order_type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{workOrder.description}</p>
                <div className="text-xs text-muted-foreground">
                  Created on {new Date(workOrder.created_at).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}