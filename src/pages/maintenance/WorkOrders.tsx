import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Wrench, Plus, Search, Calendar, Clock, User, MapPin, 
  AlertTriangle, CheckCircle, Settings, Filter 
} from 'lucide-react';

interface WorkOrder {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  location: string;
  requested_by: string;
  assigned_to: string | null;
  created_at: string;
  scheduled_date: string | null;
  estimated_cost: number | null;
  actual_cost: number | null;
}

export default function WorkOrders() {
  const { user, language } = useAuth();
  const { toast } = useToast();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newWorkOrder, setNewWorkOrder] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    location: '',
    scheduled_date: ''
  });

  useEffect(() => {
    if (user) {
      fetchWorkOrders();
    }
  }, [user]);

  const fetchWorkOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform maintenance_requests to work orders format
      const transformedData = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        priority: item.priority,
        status: item.status,
        location: item.location || 'Not specified',
        requested_by: item.requested_by || 'System',
        assigned_to: item.assigned_to,
        created_at: item.created_at,
        scheduled_date: item.scheduled_date,
        estimated_cost: item.estimated_cost,
        actual_cost: item.actual_cost
      }));

      setWorkOrders(transformedData);
    } catch (error) {
      console.error('Error fetching work orders:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to load work orders' : 'Gagal memuatkan pesanan kerja',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkOrder = async () => {
    if (!user || !newWorkOrder.title || !newWorkOrder.description) return;

    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .insert([{
          title: newWorkOrder.title,
          description: newWorkOrder.description,
          category: newWorkOrder.category,
          priority: newWorkOrder.priority as 'low' | 'medium' | 'high' | 'urgent',
          location: newWorkOrder.location,
          scheduled_date: newWorkOrder.scheduled_date || null,
          requested_by: user.id,
          status: 'pending' as 'pending' | 'in_progress' | 'resolved' | 'closed'
        }]);

      if (error) throw error;

      toast({
        title: language === 'en' ? 'Success' : 'Berjaya',
        description: language === 'en' ? 'Work order created successfully' : 'Pesanan kerja berjaya dicipta'
      });

      setNewWorkOrder({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        location: '',
        scheduled_date: ''
      });

      fetchWorkOrders();
    } catch (error) {
      console.error('Error creating work order:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to create work order' : 'Gagal mencipta pesanan kerja',
        variant: 'destructive'
      });
    }
  };

  const updateWorkOrderStatus = async (workOrderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ status: newStatus as 'pending' | 'in_progress' | 'resolved' | 'closed' })
        .eq('id', workOrderId);

      if (error) throw error;

      toast({
        title: language === 'en' ? 'Success' : 'Berjaya',
        description: language === 'en' ? 'Work order status updated' : 'Status pesanan kerja dikemaskini'
      });

      fetchWorkOrders();
    } catch (error) {
      console.error('Error updating work order:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to update work order' : 'Gagal mengemaskini pesanan kerja',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const filteredWorkOrders = workOrders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const workOrderStats = {
    total: workOrders.length,
    pending: workOrders.filter(wo => wo.status === 'pending').length,
    inProgress: workOrders.filter(wo => wo.status === 'in_progress').length,
    completed: workOrders.filter(wo => wo.status === 'completed').length
  };

  if (loading) {
    return <div className="p-6">Loading work orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wrench className="h-8 w-8" />
            {language === 'en' ? 'Work Orders' : 'Pesanan Kerja'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' ? 'Manage maintenance requests and work orders' : 'Urus permintaan penyelenggaraan dan pesanan kerja'}
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {language === 'en' ? 'New Work Order' : 'Pesanan Kerja Baru'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{language === 'en' ? 'Create New Work Order' : 'Cipta Pesanan Kerja Baru'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">{language === 'en' ? 'Title' : 'Tajuk'}</Label>
                <Input
                  id="title"
                  value={newWorkOrder.title}
                  onChange={(e) => setNewWorkOrder({ ...newWorkOrder, title: e.target.value })}
                  placeholder={language === 'en' ? 'Work order title' : 'Tajuk pesanan kerja'}
                />
              </div>
              <div>
                <Label htmlFor="description">{language === 'en' ? 'Description' : 'Penerangan'}</Label>
                <Textarea
                  id="description"
                  value={newWorkOrder.description}
                  onChange={(e) => setNewWorkOrder({ ...newWorkOrder, description: e.target.value })}
                  placeholder={language === 'en' ? 'Detailed description' : 'Penerangan terperinci'}
                />
              </div>
              <div>
                <Label htmlFor="category">{language === 'en' ? 'Category' : 'Kategori'}</Label>
                <Select 
                  value={newWorkOrder.category} 
                  onValueChange={(value) => setNewWorkOrder({ ...newWorkOrder, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'en' ? 'Select category' : 'Pilih kategori'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="hvac">HVAC</SelectItem>
                    <SelectItem value="general">General Maintenance</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">{language === 'en' ? 'Priority' : 'Keutamaan'}</Label>
                <Select 
                  value={newWorkOrder.priority} 
                  onValueChange={(value) => setNewWorkOrder({ ...newWorkOrder, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">{language === 'en' ? 'Location' : 'Lokasi'}</Label>
                <Input
                  id="location"
                  value={newWorkOrder.location}
                  onChange={(e) => setNewWorkOrder({ ...newWorkOrder, location: e.target.value })}
                  placeholder={language === 'en' ? 'Work location' : 'Lokasi kerja'}
                />
              </div>
              <div>
                <Label htmlFor="scheduled_date">{language === 'en' ? 'Scheduled Date' : 'Tarikh Dijadualkan'}</Label>
                <Input
                  id="scheduled_date"
                  type="date"
                  value={newWorkOrder.scheduled_date}
                  onChange={(e) => setNewWorkOrder({ ...newWorkOrder, scheduled_date: e.target.value })}
                />
              </div>
              <Button onClick={handleCreateWorkOrder} className="w-full">
                {language === 'en' ? 'Create Work Order' : 'Cipta Pesanan Kerja'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {language === 'en' ? 'Total Orders' : 'Jumlah Pesanan'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workOrderStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {language === 'en' ? 'Pending' : 'Menunggu'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{workOrderStats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {language === 'en' ? 'In Progress' : 'Dalam Proses'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{workOrderStats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {language === 'en' ? 'Completed' : 'Selesai'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{workOrderStats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={language === 'en' ? 'Search work orders...' : 'Cari pesanan kerja...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Work Orders List */}
      <div className="space-y-4">
        {filteredWorkOrders.map((workOrder) => (
          <Card key={workOrder.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{workOrder.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {workOrder.description}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getPriorityBadge(workOrder.priority)}
                  {getStatusBadge(workOrder.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{workOrder.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(workOrder.created_at).toLocaleDateString()}</span>
                </div>
                {workOrder.scheduled_date && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(workOrder.scheduled_date).toLocaleDateString()}</span>
                  </div>
                )}
                {workOrder.estimated_cost && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Est. Cost:</span>
                    <span>RM {workOrder.estimated_cost.toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Category: <span className="font-medium">{workOrder.category}</span>
                </div>
                <div className="flex gap-2">
                  {workOrder.status === 'pending' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateWorkOrderStatus(workOrder.id, 'in_progress')}
                    >
                      {language === 'en' ? 'Start Work' : 'Mula Kerja'}
                    </Button>
                  )}
                  {workOrder.status === 'in_progress' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateWorkOrderStatus(workOrder.id, 'completed')}
                    >
                      {language === 'en' ? 'Mark Complete' : 'Tanda Selesai'}
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    {language === 'en' ? 'View Details' : 'Lihat Butiran'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredWorkOrders.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Wrench className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {language === 'en' ? 'No work orders found' : 'Tiada pesanan kerja ditemui'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'en' 
                  ? 'Create your first work order to get started.'
                  : 'Cipta pesanan kerja pertama anda untuk bermula.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}