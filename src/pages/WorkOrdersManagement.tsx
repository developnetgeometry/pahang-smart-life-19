import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Wrench, Clock, AlertTriangle, CheckCircle, MapPin, User } from 'lucide-react';

interface WorkOrder {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'assigned';
  priority: string;
  work_order_type: string;
  location: string;
  created_at: string;
  updated_at: string;
  assigned_to: string;
  created_by: string;
  complaint_id?: string;
  profiles?: {
    full_name: string;
    email: string;
  } | null;
  complaints?: {
    title: string;
    category: string;
  } | null;
}

export default function WorkOrdersManagement() {
  const { user, language } = useAuth();
  const { toast } = useToast();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [progressNotes, setProgressNotes] = useState('');

  useEffect(() => {
    fetchWorkOrders();
  }, [user]);

  const fetchWorkOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          profiles:created_by(full_name, email),
          complaints(title, category)
        `)
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedWorkOrders: WorkOrder[] = (data || []).map((order: any) => ({
        ...order,
        profiles: null,
        complaints: null
      }));
      
      setWorkOrders(formattedWorkOrders);
    } catch (error) {
      console.error('Error fetching work orders:', error);
      toast({
        title: language === 'ms' ? 'Ralat' : 'Error',
        description: language === 'ms' ? 'Gagal memuat pesanan kerja' : 'Failed to load work orders',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateWorkOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const validStatuses: WorkOrder['status'][] = ['pending', 'in_progress', 'completed', 'cancelled', 'assigned'];
      if (!validStatuses.includes(newStatus as WorkOrder['status'])) {
        console.error('Invalid status:', newStatus);
        return;
      }

      const { error } = await supabase
        .from('work_orders')
        .update({ 
          status: newStatus as WorkOrder['status'],
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
      
      // Log activity
      await supabase
        .from('work_order_activities')
        .insert({
          work_order_id: orderId,
          activity_type: 'status_changed',
          description: `Status updated to ${newStatus}`,
          performed_by: user?.id,
          metadata: { 
            old_status: selectedOrder?.status, 
            new_status: newStatus,
            notes: progressNotes
          }
        });

      toast({
        title: language === 'ms' ? 'Berjaya' : 'Success',
        description: language === 'ms' ? 'Status pesanan kerja dikemas kini' : 'Work order status updated'
      });

      setSelectedOrder(null);
      setProgressNotes('');
      fetchWorkOrders();
    } catch (error) {
      console.error('Error updating work order:', error);
      toast({
        title: language === 'ms' ? 'Ralat' : 'Error',
        description: language === 'ms' ? 'Gagal mengemas kini status' : 'Failed to update status',
        variant: 'destructive'
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'in_progress':
        return 'bg-primary text-primary-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Wrench className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">
          {language === 'ms' ? 'Pengurusan Pesanan Kerja' : 'Work Orders Management'}
        </h1>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            title: language === 'ms' ? 'Jumlah' : 'Total',
            value: workOrders.length,
            icon: Wrench,
            color: 'text-primary'
          },
          {
            title: language === 'ms' ? 'Menunggu' : 'Pending',
            value: workOrders.filter(w => w.status === 'pending').length,
            icon: Clock,
            color: 'text-warning'
          },
          {
            title: language === 'ms' ? 'Sedang Berjalan' : 'In Progress',
            value: workOrders.filter(w => w.status === 'in_progress').length,
            icon: AlertTriangle,
            color: 'text-primary'
          },
          {
            title: language === 'ms' ? 'Selesai' : 'Completed',
            value: workOrders.filter(w => w.status === 'completed').length,
            icon: CheckCircle,
            color: 'text-success'
          }
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Work Orders List */}
      <div className="grid gap-4">
        {workOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{order.title}</CardTitle>
                  <CardDescription>{order.description}</CardDescription>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {order.location}
                    {order.complaints && (
                      <>
                        <span>•</span>
                        <span>From complaint: {order.complaints.title}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className={getPriorityColor(order.priority)}>
                    {order.priority.toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <p>Created: {new Date(order.created_at).toLocaleDateString()}</p>
                  <p>Type: {order.work_order_type}</p>
                </div>
                <Button 
                  onClick={() => setSelectedOrder(order)}
                  disabled={order.status === 'completed'}
                >
                  {language === 'ms' ? 'Kemas Kini' : 'Update Status'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Update Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {language === 'ms' ? 'Kemas Kini Status' : 'Update Status'}
              </CardTitle>
              <CardDescription>{selectedOrder.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === 'ms' ? 'Status Baru' : 'New Status'}
                </label>
                <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === 'ms' ? 'Nota Kemajuan' : 'Progress Notes'}
                </label>
                <Textarea
                  placeholder={language === 'ms' ? 'Masukkan nota kemajuan...' : 'Enter progress notes...'}
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => updateWorkOrderStatus(selectedOrder.id, statusUpdate)}
                  disabled={!statusUpdate}
                  className="flex-1"
                >
                  {language === 'ms' ? 'Kemas Kini' : 'Update'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedOrder(null);
                    setStatusUpdate('');
                    setProgressNotes('');
                  }}
                  className="flex-1"
                >
                  {language === 'ms' ? 'Batal' : 'Cancel'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {workOrders.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {language === 'ms' ? 'Tiada Pesanan Kerja' : 'No Work Orders'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'ms' 
                ? 'Anda tidak mempunyai pesanan kerja yang diberikan pada masa ini.'
                : 'You have no assigned work orders at this time.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}