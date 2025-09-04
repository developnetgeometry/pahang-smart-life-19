import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { WeatherWidget } from './WeatherWidget';
import { PrayerTimesWidget } from './PrayerTimesWidget';
import PanicButton from '@/components/emergency/PanicButton';
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Package,
  Activity,
  Calendar,
  FileText,
  Shield,
  Settings,
  Send
} from 'lucide-react';

export function MaintenanceStaffDashboard() {
  const { language, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // State for modals and forms
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [partsRequestOpen, setPartsRequestOpen] = useState(false);
  const [workOrderDetailOpen, setWorkOrderDetailOpen] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [reportForm, setReportForm] = useState({
    title: '',
    description: '',
    category: 'maintenance',
    priority: 'medium',
    location: ''
  });

  const [partsForm, setPartsForm] = useState({
    itemName: '',
    quantity: '',
    urgency: 'medium',
    justification: '',
    estimatedCost: ''
  });

  // Handler functions
  const handleSupplyRequest = async (item: any) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Get user's district for the request
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('district_id')
        .eq('id', user.id)
        .single();

      // Create a work order for supply request
      const { error } = await supabase
        .from('work_orders')
        .insert({
          title: `Supply Request: ${item.item}`,
          description: `Request for ${item.quantity} units of ${item.item}. Current stock: ${item.quantity}. ${item.message}`,
          work_order_type: 'general',
          priority: item.status === 'reorder' ? 'high' : 'medium',
          location: 'Supply Room',
          created_by: user.id,
          district_id: userProfile?.district_id,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: language === 'en' ? 'Success' : 'Berjaya',
        description: language === 'en' ? 'Supply request submitted successfully' : 'Permintaan bekalan berjaya dihantar'
      });
    } catch (error) {
      console.error('Error submitting supply request:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to submit request' : 'Gagal menghantar permintaan',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartWorkOrder = async (order: any) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // For demo purposes, just show success message since these are sample work orders
      toast({
        title: language === 'en' ? 'Work Order Started' : 'Arahan Kerja Dimulakan',
        description: language === 'en' ? `Started work on: ${order.title}` : `Mula kerja: ${order.title}`
      });

      // Navigate to work orders management page
      setTimeout(() => {
        navigate('/work-orders-management');
      }, 1000);
    } catch (error) {
      console.error('Error starting work order:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to start work order' : 'Gagal memulakan arahan kerja',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewWorkOrder = (order: any) => {
    setSelectedWorkOrder(order);
    setWorkOrderDetailOpen(true);
  };

  const handleSubmitReport = async () => {
    if (!user || !reportForm.title || !reportForm.description) return;

    setIsSubmitting(true);
    try {
      // Get user's district for the request
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('district_id')
        .eq('id', user.id)
        .single();

      // Create a work order for the report
      const { error } = await supabase
        .from('work_orders')
        .insert({
          title: reportForm.title,
          description: reportForm.description,
          work_order_type: 'general',
          priority: reportForm.priority as any,
          location: reportForm.location || 'Various',
          created_by: user.id,
          district_id: userProfile?.district_id,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: language === 'en' ? 'Report Submitted' : 'Laporan Dihantar',
        description: language === 'en' ? 'Maintenance report submitted successfully' : 'Laporan penyelenggaraan berjaya dihantar'
      });

      setReportModalOpen(false);
      setReportForm({
        title: '',
        description: '',
        category: 'maintenance',
        priority: 'medium',
        location: ''
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to submit report' : 'Gagal menghantar laporan',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestParts = async () => {
    if (!user || !partsForm.itemName || !partsForm.quantity) return;

    setIsSubmitting(true);
    try {
      // Get user's district for the request
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('district_id')
        .eq('id', user.id)
        .single();

      // Create a work order for parts request
      const { error } = await supabase
        .from('work_orders')
        .insert({
          title: `Parts Request: ${partsForm.itemName}`,
          description: `Request for ${partsForm.quantity} units of ${partsForm.itemName}. Justification: ${partsForm.justification}`,
          work_order_type: 'general',
          priority: partsForm.urgency as any,
          location: 'Parts Storage',
          created_by: user.id,
          district_id: userProfile?.district_id,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: language === 'en' ? 'Parts Request Submitted' : 'Permintaan Alat Ganti Dihantar',
        description: language === 'en' ? 'Parts request submitted successfully' : 'Permintaan alat ganti berjaya dihantar'
      });

      setPartsRequestOpen(false);
      setPartsForm({
        itemName: '',
        quantity: '',
        urgency: 'medium',
        justification: '',
        estimatedCost: ''
      });
    } catch (error) {
      console.error('Error submitting parts request:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to submit request' : 'Gagal menghantar permintaan',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEquipmentCheck = () => {
    navigate('/facilities-management');
  };

  // State for fetched data
  const [workMetrics, setWorkMetrics] = useState([
    {
      title: language === 'en' ? 'Open Work Orders' : 'Arahan Kerja Terbuka',
      value: '0',
      icon: Wrench,
      trend: '0 high priority'
    },
    {
      title: language === 'en' ? "Today's Tasks" : 'Tugas Hari Ini',
      value: '0',
      icon: Calendar,
      trend: '0 completed'
    },
    {
      title: language === 'en' ? 'Completion Rate' : 'Kadar Penyelesaian',
      value: '0%',
      icon: CheckCircle,
      trend: 'This month',
      status: 0
    },
    {
      title: language === 'en' ? 'Safety Incidents' : 'Insiden Keselamatan',
      value: '0',
      icon: Shield,
      trend: 'This month ✓'
    }
  ]);

  const [inventoryAlerts, setInventoryAlerts] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, language]);

  const fetchDashboardData = async () => {
    try {
      setDataLoading(true);
      
      // Fetch work orders assigned to current user or in their district
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('district_id')
        .eq('id', user?.id)
        .single();

      // Fetch work orders
      const { data: orders } = await supabase
        .from('work_orders')
        .select('*')
        .or(`assigned_to.eq.${user?.id},district_id.eq.${userProfile?.district_id}`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (orders) {
        const formattedOrders = orders.map(order => ({
          id: order.id.slice(-8),
          title: order.title,
          location: order.location,
          priority: order.priority,
          status: order.status,
          assignedDate: new Date(order.created_at).toLocaleDateString(),
          dueDate: order.scheduled_date ? new Date(order.scheduled_date).toLocaleDateString() : 'TBD'
        }));
        setWorkOrders(formattedOrders);

        // Update metrics
        const openOrders = orders.filter(o => o.status !== 'completed').length;
        const todayTasks = orders.filter(o => {
          const today = new Date().toDateString();
          return o.scheduled_date && new Date(o.scheduled_date).toDateString() === today;
        }).length;
        const completedToday = orders.filter(o => {
          const today = new Date().toDateString();
          return o.completed_at && new Date(o.completed_at).toDateString() === today;
        }).length;
        const highPriority = orders.filter(o => o.priority === 'high' || o.priority === 'urgent').length;
        
        setWorkMetrics([
          {
            title: language === 'en' ? 'Open Work Orders' : 'Arahan Kerja Terbuka',
            value: openOrders.toString(),
            icon: Wrench,
            trend: `${highPriority} high priority`
          },
          {
            title: language === 'en' ? "Today's Tasks" : 'Tugas Hari Ini',
            value: todayTasks.toString(),
            icon: Calendar,
            trend: `${completedToday} completed`
          },
          {
            title: language === 'en' ? 'Completion Rate' : 'Kadar Penyelesaian',
            value: orders.length > 0 ? `${Math.round((orders.filter(o => o.status === 'completed').length / orders.length) * 100)}%` : '0%',
            icon: CheckCircle,
            trend: 'This month',
            status: orders.length > 0 ? Math.round((orders.filter(o => o.status === 'completed').length / orders.length) * 100) : 0
          },
          {
            title: language === 'en' ? 'Safety Incidents' : 'Insiden Keselamatan',
            value: '0',
            icon: Shield,
            trend: 'This month ✓'
          }
        ]);
      }

      // Fetch all inventory items and filter for low stock
      const { data: inventory } = await supabase
        .from('inventory_items')
        .select('*');

      if (inventory) {
        // Filter items where current_stock <= minimum_stock
        const lowStockItems = inventory.filter(item => 
          item.current_stock <= item.minimum_stock
        );
        
        const alerts = lowStockItems.slice(0, 3).map((item: any) => ({
          item: item.name,
          status: item.current_stock === 0 ? 'reorder' : 'low_stock',
          quantity: item.current_stock,
          message: item.current_stock === 0 
            ? (language === 'en' ? 'Out of stock - reorder needed' : 'Kehabisan stok - perlu tempah semula')
            : (language === 'en' ? `Low stock (${item.current_stock} remaining)` : `Stok rendah (${item.current_stock} berbaki)`)
        }));
        setInventoryAlerts(alerts);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'reorder': return 'bg-red-100 text-red-800';
      case 'ok': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {language === 'en' ? 'Maintenance Staff Dashboard' : 'Papan Pemuka Staf Penyelenggaraan'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'en' ? 'Work orders and asset maintenance management' : 'Arahan kerja dan pengurusan penyelenggaraan aset'}
        </p>
      </div>

      {/* Work Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {workMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.trend}</p>
              {metric.status && (
                <Progress value={metric.status} className="mt-2" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weather and Prayer Times Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeatherWidget />
        <PrayerTimesWidget />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {language === 'en' ? 'Inventory Alerts' : 'Amaran Inventori'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {inventoryAlerts.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.item}</p>
                  <p className="text-xs text-muted-foreground">{item.message}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Package className="h-3 w-3" />
                    {item.quantity} {language === 'en' ? 'units' : 'unit'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(item.status)}>
                    {item.status === 'low_stock' ? 'Low' : item.status === 'reorder' ? 'Reorder' : 'OK'}
                  </Badge>
                  {item.status !== 'ok' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleSupplyRequest(item)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Clock className="h-3 w-3 animate-spin mr-1" />
                      ) : null}
                      {language === 'en' ? 'Request' : 'Minta'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* My Work Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              {language === 'en' ? 'My Work Orders' : 'Arahan Kerja Saya'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workOrders.map((order, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{order.id}</Badge>
                      <Badge variant={getPriorityColor(order.priority) as any}>
                        {order.priority}
                      </Badge>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{order.title}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span>{order.location}</span>
                      <span>Assigned: {order.assignedDate}</span>
                      <span>Due: {order.dueDate}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewWorkOrder(order)}
                    >
                      {language === 'en' ? 'View' : 'Lihat'}
                    </Button>
                    {order.status === 'pending' && (
                      <Button 
                        size="sm"
                        onClick={() => handleStartWorkOrder(order)}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Clock className="h-3 w-3 animate-spin mr-1" />
                        ) : null}
                        {language === 'en' ? 'Start' : 'Mula'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'en' ? 'Quick Actions' : 'Tindakan Pantas'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Submit Report */}
            <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 h-12">
                  <FileText className="h-4 w-4" />
                  {language === 'en' ? 'Submit Report' : 'Hantar Laporan'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {language === 'en' ? 'Submit Maintenance Report' : 'Hantar Laporan Penyelenggaraan'}
                  </DialogTitle>
                  <DialogDescription>
                    {language === 'en' ? 'Report issues or completed maintenance tasks' : 'Laporkan isu atau tugas penyelenggaraan yang selesai'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">{language === 'en' ? 'Title' : 'Tajuk'}</Label>
                    <Input
                      id="title"
                      value={reportForm.title}
                      onChange={(e) => setReportForm({...reportForm, title: e.target.value})}
                      placeholder={language === 'en' ? 'Report title' : 'Tajuk laporan'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">{language === 'en' ? 'Description' : 'Penerangan'}</Label>
                    <Textarea
                      id="description"
                      value={reportForm.description}
                      onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                      placeholder={language === 'en' ? 'Describe the issue or work completed' : 'Terangkan isu atau kerja yang selesai'}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority">{language === 'en' ? 'Priority' : 'Keutamaan'}</Label>
                      <Select value={reportForm.priority} onValueChange={(value) => setReportForm({...reportForm, priority: value})}>
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
                        value={reportForm.location}
                        onChange={(e) => setReportForm({...reportForm, location: e.target.value})}
                        placeholder={language === 'en' ? 'Location' : 'Lokasi'}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSubmitReport}
                      disabled={isSubmitting || !reportForm.title || !reportForm.description}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <Clock className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      {language === 'en' ? 'Submit' : 'Hantar'}
                    </Button>
                    <Button variant="outline" onClick={() => setReportModalOpen(false)} className="flex-1">
                      {language === 'en' ? 'Cancel' : 'Batal'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Request Parts */}
            <Dialog open={partsRequestOpen} onOpenChange={setPartsRequestOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 h-12" variant="outline">
                  <Package className="h-4 w-4" />
                  {language === 'en' ? 'Request Parts' : 'Minta Alat Ganti'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {language === 'en' ? 'Request Parts/Supplies' : 'Minta Alat Ganti/Bekalan'}
                  </DialogTitle>
                  <DialogDescription>
                    {language === 'en' ? 'Request parts or supplies for maintenance work' : 'Minta alat ganti atau bekalan untuk kerja penyelenggaraan'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="itemName">{language === 'en' ? 'Item Name' : 'Nama Item'}</Label>
                    <Input
                      id="itemName"
                      value={partsForm.itemName}
                      onChange={(e) => setPartsForm({...partsForm, itemName: e.target.value})}
                      placeholder={language === 'en' ? 'e.g., LED Bulbs, AC Filter' : 'cth: Mentol LED, Penapis AC'}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity">{language === 'en' ? 'Quantity' : 'Kuantiti'}</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={partsForm.quantity}
                        onChange={(e) => setPartsForm({...partsForm, quantity: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="urgency">{language === 'en' ? 'Urgency' : 'Kecemasan'}</Label>
                      <Select value={partsForm.urgency} onValueChange={(value) => setPartsForm({...partsForm, urgency: value})}>
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
                  </div>
                  <div>
                    <Label htmlFor="justification">{language === 'en' ? 'Justification' : 'Justifikasi'}</Label>
                    <Textarea
                      id="justification"
                      value={partsForm.justification}
                      onChange={(e) => setPartsForm({...partsForm, justification: e.target.value})}
                      placeholder={language === 'en' ? 'Why is this item needed?' : 'Mengapa item ini diperlukan?'}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleRequestParts}
                      disabled={isSubmitting || !partsForm.itemName || !partsForm.quantity}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <Clock className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      {language === 'en' ? 'Submit Request' : 'Hantar Permintaan'}
                    </Button>
                    <Button variant="outline" onClick={() => setPartsRequestOpen(false)} className="flex-1">
                      {language === 'en' ? 'Cancel' : 'Batal'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Equipment Check */}
            <Button 
              className="flex items-center gap-2 h-12" 
              variant="outline"
              onClick={handleEquipmentCheck}
            >
              <Settings className="h-4 w-4" />
              {language === 'en' ? 'Equipment Check' : 'Semak Peralatan'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Work Order Detail Modal */}
      <Dialog open={workOrderDetailOpen} onOpenChange={setWorkOrderDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              {language === 'en' ? 'Work Order Details' : 'Butiran Arahan Kerja'}
            </DialogTitle>
            <DialogDescription>
              {selectedWorkOrder && `${selectedWorkOrder.id} - ${selectedWorkOrder.title}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedWorkOrder && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    {language === 'en' ? 'Work Order ID' : 'ID Arahan Kerja'}
                  </Label>
                  <p className="text-sm">{selectedWorkOrder.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    {language === 'en' ? 'Status' : 'Status'}
                  </Label>
                  <Badge className={getStatusColor(selectedWorkOrder.status)}>
                    {selectedWorkOrder.status}
                  </Badge>
                </div>
              </div>

              {/* Title and Description */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Title' : 'Tajuk'}
                </Label>
                <p className="text-sm font-medium">{selectedWorkOrder.title}</p>
              </div>

              {/* Location and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    {language === 'en' ? 'Location' : 'Lokasi'}
                  </Label>
                  <p className="text-sm">{selectedWorkOrder.location}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    {language === 'en' ? 'Priority' : 'Keutamaan'}
                  </Label>
                  <Badge variant={getPriorityColor(selectedWorkOrder.priority) as any}>
                    {selectedWorkOrder.priority}
                  </Badge>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    {language === 'en' ? 'Assigned Date' : 'Tarikh Diberikan'}
                  </Label>
                  <p className="text-sm">{selectedWorkOrder.assignedDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    {language === 'en' ? 'Due Date' : 'Tarikh Akhir'}
                  </Label>
                  <p className="text-sm">{selectedWorkOrder.dueDate}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Description' : 'Penerangan'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' 
                    ? 'Detailed maintenance work as per schedule and requirements.'
                    : 'Kerja penyelenggaraan terperinci mengikut jadual dan keperluan.'
                  }
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                {selectedWorkOrder.status === 'pending' && (
                  <Button 
                    onClick={() => {
                      handleStartWorkOrder(selectedWorkOrder);
                      setWorkOrderDetailOpen(false);
                    }}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <Clock className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {language === 'en' ? 'Start Work' : 'Mula Kerja'}
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => setWorkOrderDetailOpen(false)}
                  className="flex-1"
                >
                  {language === 'en' ? 'Close' : 'Tutup'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Floating Panic Button */}
      <PanicButton />
    </div>
  );
}