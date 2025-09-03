import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Wrench, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  MapPin, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'hvac' | 'general' | 'elevator' | 'security';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  requestedBy: string;
  assignedTo?: string;
  location: string;
  createdDate: string;
  dueDate: string;
  estimatedCost?: number;
}

interface Technician {
  id: string;
  name: string;
  specialization: string[];
  status: 'available' | 'busy' | 'off-duty';
  currentTasks: number;
}

export default function MaintenanceManagement() {
  const { language } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('requests');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [dayDetailOpen, setDayDetailOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const text = {
    en: {
      title: 'Maintenance Management',
      subtitle: 'Manage maintenance requests and technicians',
      requests: 'Requests',
      technicians: 'Technicians',
      schedule: 'Schedule',
      inventory: 'Inventory',
      addRequest: 'Add Request',
      search: 'Search requests...',
      status: 'Status',
      allStatus: 'All Status',
      pending: 'Pending',
      assigned: 'Assigned',
      inProgress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      priority: 'Priority',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent',
      category: 'Category',
      plumbing: 'Plumbing',
      electrical: 'Electrical',
      hvac: 'HVAC',
      general: 'General',
      elevator: 'Elevator',
      security: 'Security',
      requestTitle: 'Request Title',
      description: 'Description',
      location: 'Location',
      requestedBy: 'Requested By',
      assignedTo: 'Assigned To',
      createdDate: 'Created Date',
      dueDate: 'Due Date',
      estimatedCost: 'Estimated Cost',
      createRequest: 'Create New Request',
      createSubtitle: 'Add a new maintenance request',
      selectCategory: 'Select Category',
      selectPriority: 'Select Priority',
      selectTechnician: 'Select Technician',
      create: 'Create Request',
      cancel: 'Cancel',
      assign: 'Assign',
      complete: 'Complete',
      view: 'View',
      edit: 'Edit',
      requestCreated: 'Maintenance request created successfully!',
      totalRequests: 'Total Requests',
      pendingRequests: 'Pending Requests',
      completedToday: 'Completed Today',
      avgResolution: 'Avg Resolution Time',
      available: 'Available',
      busy: 'Busy',
      offDuty: 'Off Duty',
      specialization: 'Specialization',
      currentTasks: 'Current Tasks'
    },
    ms: {
      title: 'Pengurusan Penyelenggaraan',
      subtitle: 'Urus permintaan penyelenggaraan dan juruteknik',
      requests: 'Permintaan',
      technicians: 'Juruteknik',
      schedule: 'Jadual',
      inventory: 'Inventori',
      addRequest: 'Tambah Permintaan',
      search: 'Cari permintaan...',
      status: 'Status',
      allStatus: 'Semua Status',
      pending: 'Menunggu',
      assigned: 'Ditugaskan',
      inProgress: 'Dalam Proses',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
      priority: 'Keutamaan',
      low: 'Rendah',
      medium: 'Sederhana',
      high: 'Tinggi',
      urgent: 'Segera',
      category: 'Kategori',
      plumbing: 'Paip',
      electrical: 'Elektrik',
      hvac: 'Penghawa Dingin',
      general: 'Am',
      elevator: 'Lif',
      security: 'Keselamatan',
      requestTitle: 'Tajuk Permintaan',
      description: 'Penerangan',
      location: 'Lokasi',
      requestedBy: 'Dipinta Oleh',
      assignedTo: 'Ditugaskan Kepada',
      createdDate: 'Tarikh Dicipta',
      dueDate: 'Tarikh Sasaran',
      estimatedCost: 'Anggaran Kos',
      createRequest: 'Cipta Permintaan Baru',
      createSubtitle: 'Tambah permintaan penyelenggaraan baru',
      selectCategory: 'Pilih Kategori',
      selectPriority: 'Pilih Keutamaan',
      selectTechnician: 'Pilih Juruteknik',
      create: 'Cipta Permintaan',
      cancel: 'Batal',
      assign: 'Tugaskan',
      complete: 'Selesaikan',
      view: 'Lihat',
      edit: 'Edit',
      requestCreated: 'Permintaan penyelenggaraan berjaya dicipta!',
      totalRequests: 'Jumlah Permintaan',
      pendingRequests: 'Permintaan Menunggu',
      completedToday: 'Selesai Hari Ini',
      avgResolution: 'Purata Masa Penyelesaian',
      available: 'Tersedia',
      busy: 'Sibuk',
      offDuty: 'Tidak Bertugas',
      specialization: 'Kepakaran',
      currentTasks: 'Tugas Semasa'
    }
  };

  const t = text[language];

  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch maintenance requests from work_orders and maintenance_requests
      const { data: workOrders } = await supabase
        .from('work_orders')
        .select(`
          id,
          title,
          description,
          work_order_type,
          priority,
          status,
          location,
          created_at,
          scheduled_date,
          estimated_cost,
          created_by,
          profiles!work_orders_created_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (workOrders) {
        const formattedRequests: MaintenanceRequest[] = workOrders.map(order => ({
          id: order.id,
          title: order.title,
          description: order.description || '',
          category: order.work_order_type as any,
          priority: order.priority as any,
          status: order.status as any,
          requestedBy: (order as any).profiles?.full_name || 'Unknown',
          assignedTo: 'Unknown', // Will fetch technician info separately
          location: order.location,
          createdDate: new Date(order.created_at).toLocaleDateString(),
          dueDate: order.scheduled_date ? new Date(order.scheduled_date).toLocaleDateString() : '',
          estimatedCost: order.estimated_cost
        }));
        setRequests(formattedRequests);
      }

      // Fetch technicians
      const { data: techData } = await supabase
        .from('maintenance_technicians')
        .select('*')
        .eq('is_active', true);

      if (techData) {
        const formattedTechnicians: Technician[] = techData.map(tech => ({
          id: tech.id,
          name: tech.name,
          specialization: tech.specialization || [],
          status: tech.status as any,
          currentTasks: tech.current_tasks || 0
        }));
        setTechnicians(formattedTechnicians);
      }

      // Fetch schedule data
      await fetchScheduleData();

      
      // Also fetch schedule data for technicians tab
      await fetchScheduleData();

    } catch (error) {
      console.error('Error fetching maintenance data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch schedule data from database
  const [dailyMaintenanceData, setDailyMaintenanceData] = useState<Record<number, Array<{
    id: string;
    title: string;
    time: string;
    technician: string;
    status: 'scheduled' | 'in-progress' | 'completed';
    category: string;
    location: string;
  }>>>({});

  const fetchScheduleData = async () => {
    try {
      const { data: schedules } = await supabase
        .from('maintenance_schedules')
        .select('*')
        .eq('status', 'scheduled');

      if (schedules) {
        const groupedData: Record<number, any[]> = {};
        schedules.forEach(schedule => {
          if (schedule.scheduled_date) {
            const day = new Date(schedule.scheduled_date).getDate();
            if (!groupedData[day]) groupedData[day] = [];
            groupedData[day].push({
              id: schedule.id,
              title: schedule.title,
              time: '09:00 - 11:00', // Default time range
              technician: 'Assigned',
              status: schedule.status,
              category: schedule.maintenance_type,
              location: 'Various'
            });
          }
        });
        setDailyMaintenanceData(groupedData);
      }
    } catch (error) {
      console.error('Error fetching schedule data:', error);
    }
  };

  const categories = [
    { value: 'plumbing', label: t.plumbing },
    { value: 'electrical', label: t.electrical },
    { value: 'hvac', label: t.hvac },
    { value: 'general', label: t.general },
    { value: 'elevator', label: t.elevator },
    { value: 'security', label: t.security }
  ];

  const priorities = [
    { value: 'low', label: t.low },
    { value: 'medium', label: t.medium },
    { value: 'high', label: t.high },
    { value: 'urgent', label: t.urgent }
  ];

  const statuses = [
    { value: 'all', label: t.allStatus },
    { value: 'pending', label: t.pending },
    { value: 'assigned', label: t.assigned },
    { value: 'in-progress', label: t.inProgress },
    { value: 'completed', label: t.completed },
    { value: 'cancelled', label: t.cancelled }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTechStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'off-duty': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return t.pending;
      case 'assigned': return t.assigned;
      case 'in-progress': return t.inProgress;
      case 'completed': return t.completed;
      case 'cancelled': return t.cancelled;
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return t.low;
      case 'medium': return t.medium;
      case 'high': return t.high;
      case 'urgent': return t.urgent;
      default: return priority;
    }
  };

  const getTechStatusText = (status: string) => {
    switch (status) {
      case 'available': return t.available;
      case 'busy': return t.busy;
      case 'off-duty': return t.offDuty;
      default: return status;
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateRequest = () => {
    toast({
      title: t.requestCreated,
    });
    setIsCreateOpen(false);
  };

  const handleAssign = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'assigned', assignedTo: 'Auto-assign' } : r))
    );
    toast({ title: t.assign });
  };

  const handleComplete = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'completed' } : r));
    toast({ title: t.complete });
  };

  const handleView = (req: MaintenanceRequest) => {
    setSelectedRequest(req);
    setViewOpen(true);
  };

  const handleCalendarDayClick = (day: number) => {
    if (day > 0 && day <= 31) {
      setSelectedDate(day);
      setDayDetailOpen(true);
    }
  };

  const getDayStatusColor = (status: 'scheduled' | 'in-progress' | 'completed') => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';  
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t.addRequest}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>{t.createRequest}</DialogTitle>
              <DialogDescription>{t.createSubtitle}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t.requestTitle}</Label>
                <Input id="title" placeholder={t.requestTitle} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">{t.category}</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectCategory} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">{t.priority}</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectPriority} />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t.description}</Label>
                <Textarea id="description" placeholder={t.description} rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">{t.location}</Label>
                <Input id="location" placeholder={t.location} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">{t.dueDate}</Label>
                  <Input id="dueDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedCost">{t.estimatedCost}</Label>
                  <Input id="estimatedCost" type="number" placeholder="0" />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  {t.cancel}
                </Button>
                <Button onClick={handleCreateRequest}>
                  {t.create}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="requests">{t.requests}</TabsTrigger>
          <TabsTrigger value="technicians">{t.technicians}</TabsTrigger>
          <TabsTrigger value="schedule">{t.schedule}</TabsTrigger>
          <TabsTrigger value="inventory">{t.inventory}</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.totalRequests}</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{requests.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.pendingRequests}</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {requests.filter(r => r.status === 'pending').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.completedToday}</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {requests.filter(r => r.status === 'completed').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.avgResolution}</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.5 days</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t.requests}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{request.title}</h4>
                      <p className="text-sm text-muted-foreground">{request.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {request.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {request.requestedBy}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {request.dueDate}
                        </div>
                        {request.estimatedCost && (
                          <span>RM{request.estimatedCost}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(request.priority)}>
                        {getPriorityText(request.priority)}
                      </Badge>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusText(request.status)}
                      </Badge>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => handleView(request)}>
                          {t.view}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleAssign(request.id)}>
                          {t.assign}
                        </Button>
                        {request.status !== 'completed' && (
                          <Button variant="outline" size="sm" onClick={() => handleComplete(request.id)}>
                            {t.complete}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Dialog open={viewOpen} onOpenChange={setViewOpen}>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>{t.view}</DialogTitle>
                <DialogDescription>{selectedRequest?.title}</DialogDescription>
              </DialogHeader>
              {selectedRequest && (
                <div className="space-y-3 text-sm">
                  <div><strong>{t.description}:</strong> {selectedRequest.description}</div>
                  <div className="flex gap-4">
                    <span><strong>{t.category}:</strong> {selectedRequest.category}</span>
                    <span><strong>{t.priority}:</strong> {getPriorityText(selectedRequest.priority)}</span>
                  </div>
                  <div className="flex gap-4">
                    <span><strong>{t.location}:</strong> {selectedRequest.location}</span>
                    <span><strong>{t.dueDate}:</strong> {selectedRequest.dueDate}</span>
                  </div>
                  {selectedRequest.assignedTo && (
                    <div><strong>{t.assignedTo}:</strong> {selectedRequest.assignedTo}</div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="technicians" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.technicians}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {technicians.map((tech) => (
                  <Card key={tech.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{tech.name}</CardTitle>
                        <Badge className={getTechStatusColor(tech.status)}>
                          {getTechStatusText(tech.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-muted-foreground">{t.specialization}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {tech.specialization.map((spec, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {categories.find(c => c.value === spec)?.label || spec}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t.currentTasks}</p>
                          <p className="font-medium">{tech.currentTasks}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>Scheduled maintenance for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Elevator inspection - Block A</p>
                      <p className="text-sm text-muted-foreground">09:00 - 11:00</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">HVAC filter replacement</p>
                      <p className="text-sm text-muted-foreground">14:00 - 16:00</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Scheduled</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Fire safety system check</p>
                      <p className="text-sm text-muted-foreground">16:30 - 17:30</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Scheduled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Maintenance</CardTitle>
                <CardDescription>Next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Generator testing</p>
                      <p className="text-sm text-muted-foreground">Tomorrow - 10:00</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-3 w-3 mr-1" />
                      Reschedule
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Water pump maintenance</p>
                      <p className="text-sm text-muted-foreground">Jan 25 - 09:00</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Security system update</p>
                      <p className="text-sm text-muted-foreground">Jan 27 - 20:00</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Preventive Maintenance Calendar</CardTitle>
              <CardDescription>Monthly scheduled maintenance overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center font-medium p-2 text-sm">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }, (_, i) => {
                  const day = i - 2; // Start from -2 to show previous month days
                  const isCurrentMonth = day > 0 && day <= 31;
                  const hasSchedule = [5, 12, 19, 26].includes(day);
                  
                  return (
                    <div
                      key={i}
                      onClick={() => handleCalendarDayClick(day)}
                      className={`
                        aspect-square flex items-center justify-center text-sm border rounded-lg cursor-pointer
                        ${isCurrentMonth ? 'hover:bg-muted hover:border-primary' : 'text-muted-foreground bg-muted/50'}
                        ${hasSchedule && isCurrentMonth ? 'bg-blue-50 border-blue-200' : ''}
                        ${isCurrentMonth ? 'transition-colors' : ''}
                      `}
                    >
                      {day > 0 && day <= 31 ? day : ''}
                      {hasSchedule && isCurrentMonth && (
                        <div className="absolute w-1 h-1 bg-blue-600 rounded-full mt-4"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">247</div>
                <p className="text-xs text-muted-foreground">+12 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">8</div>
                <p className="text-xs text-muted-foreground">Need restocking</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">RM 45,250</div>
                <p className="text-xs text-muted-foreground">Current inventory value</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Items</CardTitle>
                <CardDescription>Current stock levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">HVAC Filters (24x24)</p>
                      <p className="text-sm text-muted-foreground">Category: HVAC</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">25 units</p>
                      <Badge className="bg-green-100 text-green-800">In Stock</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">Elevator Door Motor</p>
                      <p className="text-sm text-muted-foreground">Category: Elevator</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">2 units</p>
                      <Badge className="bg-orange-100 text-orange-800">Low Stock</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">LED Light Bulbs</p>
                      <p className="text-sm text-muted-foreground">Category: Electrical</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">150 units</p>
                      <Badge className="bg-green-100 text-green-800">In Stock</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">PVC Pipes (3 inch)</p>
                      <p className="text-sm text-muted-foreground">Category: Plumbing</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">8 units</p>
                      <Badge className="bg-orange-100 text-orange-800">Low Stock</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest inventory movements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Used: HVAC Filter</p>
                      <p className="text-sm text-muted-foreground">Jan 20, 2024 - Maintenance Request #1</p>
                    </div>
                    <Badge variant="outline" className="text-red-600">-2</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Received: LED Bulbs</p>
                      <p className="text-sm text-muted-foreground">Jan 19, 2024 - Purchase Order #45</p>
                    </div>
                    <Badge variant="outline" className="text-green-600">+50</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Used: PVC Pipe</p>
                      <p className="text-sm text-muted-foreground">Jan 18, 2024 - Maintenance Request #2</p>
                    </div>
                    <Badge variant="outline" className="text-red-600">-5</Badge>
                  </div>
                </div>
                <div className="pt-4">
                  <Button className="w-full" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Day Details Dialog */}
      <Dialog open={dayDetailOpen} onOpenChange={setDayDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>January {selectedDate}, 2025 - Maintenance Details</DialogTitle>
            <DialogDescription>
              {dailyMaintenanceData[selectedDate || 0] ? 
                `${dailyMaintenanceData[selectedDate || 0].length} scheduled activities` : 
                'No maintenance activities scheduled for this day'
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedDate && dailyMaintenanceData[selectedDate] ? (
            <div className="space-y-4">
              {dailyMaintenanceData[selectedDate].map((activity) => (
                <div key={activity.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{activity.title}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {activity.technician}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {activity.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {activity.category}
                      </Badge>
                      <Badge className={getDayStatusColor(activity.status)}>
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  
                  {activity.status === 'scheduled' && (
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm">
                        <Calendar className="h-3 w-3 mr-1" />
                        Reschedule
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No maintenance activities scheduled for this day.</p>
              <Button variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Maintenance
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
        </>
      )}
    </div>
  );
}