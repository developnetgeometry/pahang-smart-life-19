import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Settings
} from 'lucide-react';

export function MaintenanceStaffDashboard() {
  const { language } = useAuth();

  const workMetrics = [
    {
      title: language === 'en' ? 'Open Work Orders' : 'Arahan Kerja Terbuka',
      value: '8',
      icon: Wrench,
      trend: '3 high priority'
    },
    {
      title: language === 'en' ? "Today's Tasks" : 'Tugas Hari Ini',
      value: '3',
      icon: Calendar,
      trend: '2 completed'
    },
    {
      title: language === 'en' ? 'Completion Rate' : 'Kadar Penyelesaian',
      value: '94%',
      icon: CheckCircle,
      trend: 'This month',
      status: 94
    },
    {
      title: language === 'en' ? 'Safety Incidents' : 'Insiden Keselamatan',
      value: '0',
      icon: Shield,
      trend: 'This month ✓'
    }
  ];

  const todaySchedule = [
    {
      time: '9:00 AM',
      task: language === 'en' ? 'Pool pump maintenance' : 'Penyelenggaraan pam kolam',
      location: 'Building A',
      priority: 'high',
      status: 'upcoming',
      estimatedDuration: '2 hours'
    },
    {
      time: '11:00 AM',
      task: language === 'en' ? 'Light fixture replacement' : 'Penggantian lampu',
      location: 'Level 5',
      priority: 'medium',
      status: 'upcoming',
      estimatedDuration: '1 hour'
    },
    {
      time: '2:00 PM',
      task: language === 'en' ? 'AC filter change' : 'Tukar penapis AC',
      location: 'Community Hall',
      priority: 'low',
      status: 'upcoming',
      estimatedDuration: '30 minutes'
    }
  ];

  const inventoryAlerts = [
    {
      item: 'LED Bulbs',
      status: 'low_stock',
      quantity: 8,
      message: language === 'en' ? 'Low stock (8 remaining)' : 'Stok rendah (8 berbaki)'
    },
    {
      item: 'AC Filters',
      status: 'reorder',
      quantity: 2,
      message: language === 'en' ? 'Reorder needed' : 'Perlu tempah semula'
    },
    {
      item: 'Paint (White)',
      status: 'ok',
      quantity: 15,
      message: language === 'en' ? 'Adequate stock' : 'Stok mencukupi'
    }
  ];

  const workOrders = [
    {
      id: 'WO-2024-001',
      title: language === 'en' ? 'Elevator maintenance' : 'Penyelenggaraan lif',
      location: 'Building B',
      priority: 'high',
      status: 'in_progress',
      assignedDate: '2024-02-15',
      dueDate: '2024-02-16'
    },
    {
      id: 'WO-2024-002',
      title: language === 'en' ? 'Plumbing repair' : 'Pembaikan paip',
      location: 'Unit A-12-05',
      priority: 'medium',
      status: 'pending',
      assignedDate: '2024-02-14',
      dueDate: '2024-02-17'
    },
    {
      id: 'WO-2024-003',
      title: language === 'en' ? 'Garden maintenance' : 'Penyelenggaraan taman',
      location: 'Landscape Area',
      priority: 'low',
      status: 'scheduled',
      assignedDate: '2024-02-13',
      dueDate: '2024-02-20'
    }
  ];

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {language === 'en' ? "Today's Schedule" : 'Jadual Hari Ini'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {todaySchedule.map((task, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getPriorityColor(task.priority) as any}>
                      {task.priority}
                    </Badge>
                    <span className="text-sm font-medium">{task.time}</span>
                  </div>
                  <p className="text-sm font-medium">{task.task}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>{task.location}</span>
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                    <span>{task.estimatedDuration}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(task.status)}>
                    {task.status}
                  </Badge>
                  <Button size="sm" variant="outline">
                    {language === 'en' ? 'Start' : 'Mula'}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

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
                    <Button size="sm" variant="outline">
                      {language === 'en' ? 'Request' : 'Minta'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Work Orders */}
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
                  <Button size="sm" variant="outline">
                    {language === 'en' ? 'View' : 'Lihat'}
                  </Button>
                  {order.status === 'pending' && (
                    <Button size="sm">
                      {language === 'en' ? 'Start' : 'Mula'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'en' ? 'Quick Actions' : 'Tindakan Pantas'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="flex items-center gap-2 h-12">
              <FileText className="h-4 w-4" />
              {language === 'en' ? 'Submit Report' : 'Hantar Laporan'}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <Package className="h-4 w-4" />
              {language === 'en' ? 'Request Parts' : 'Minta Alat Ganti'}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <Settings className="h-4 w-4" />
              {language === 'en' ? 'Equipment Check' : 'Semak Peralatan'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}