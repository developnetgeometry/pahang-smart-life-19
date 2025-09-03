import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  MapPin,
  Package,
  Wrench
} from 'lucide-react';

interface MaintenanceTask {
  id: string;
  asset_id: string;
  asset_name: string;
  asset_type: string;
  location: string;
  next_maintenance_date: string;
  maintenance_schedule: string;
  condition_status: string;
  last_maintenance_date: string;
  description: string;
}

export default function MaintenanceScheduler() {
  const { user, language } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'calendar' | 'list'>('list');

  useEffect(() => {
    fetchMaintenanceTasks();
  }, [user]);

  const fetchMaintenanceTasks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('assets')
        .select(`
          id,
          name,
          asset_type,
          location,
          next_maintenance_date,
          maintenance_schedule,
          condition_status,
          last_maintenance_date,
          description
        `)
        .eq('is_active', true)
        .not('next_maintenance_date', 'is', null)
        .order('next_maintenance_date');

      if (error) throw error;
      
      const formattedTasks = data?.map(asset => ({
        id: asset.id,
        asset_id: asset.id,
        asset_name: asset.name,
        asset_type: asset.asset_type,
        location: asset.location,
        next_maintenance_date: asset.next_maintenance_date,
        maintenance_schedule: asset.maintenance_schedule || 'As needed',
        condition_status: asset.condition_status,
        last_maintenance_date: asset.last_maintenance_date,
        description: asset.description || ''
      })) || [];

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching maintenance tasks:', error);
      toast({
        title: language === 'ms' ? 'Ralat' : 'Error',
        description: language === 'ms' ? 'Gagal memuat jadual penyelenggaraan' : 'Failed to load maintenance schedule',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const markTaskComplete = async (taskId: string) => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const nextMaintenanceDate = nextMonth.toISOString().split('T')[0];

      const { error } = await supabase
        .from('assets')
        .update({
          last_maintenance_date: today,
          next_maintenance_date: nextMaintenanceDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      // Update local state immediately for better UX
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId 
          ? {
              ...task,
              last_maintenance_date: today,
              next_maintenance_date: nextMaintenanceDate
            }
          : task
      ));

      toast({
        title: language === 'ms' ? 'Berjaya' : 'Success',
        description: language === 'ms' ? 'Tugas penyelenggaraan ditandakan selesai' : 'Maintenance task marked as complete'
      });

      // Refresh data from server to ensure consistency
      await fetchMaintenanceTasks();
    } catch (error) {
      console.error('Error updating maintenance task:', error);
      toast({
        title: language === 'ms' ? 'Ralat' : 'Error',
        description: language === 'ms' ? 'Gagal mengemas kini tugas' : 'Failed to update task',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getTaskStatus = (date: string) => {
    const today = new Date();
    const taskDate = new Date(date);
    const daysDiff = Math.ceil((taskDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysDiff < 0) {
      return { status: 'overdue', color: 'bg-destructive text-destructive-foreground', days: Math.abs(daysDiff) };
    } else if (daysDiff <= 7) {
      return { status: 'due soon', color: 'bg-warning text-warning-foreground', days: daysDiff };
    } else {
      return { status: 'scheduled', color: 'bg-success text-success-foreground', days: daysDiff };
    }
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => task.next_maintenance_date === dateStr);
  };

  const getUpcomingTasks = () => {
    const now = new Date();
    const upcoming = new Date();
    upcoming.setDate(upcoming.getDate() + 30);
    
    return tasks.filter(task => {
      const taskDate = new Date(task.next_maintenance_date);
      return taskDate >= now && taskDate <= upcoming;
    }).slice(0, 10);
  };

  const getOverdueTasks = () => {
    const now = new Date();
    return tasks.filter(task => {
      const taskDate = new Date(task.next_maintenance_date);
      return taskDate < now;
    });
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            {language === 'ms' ? 'Jadual Penyelenggaraan' : 'Maintenance Scheduler'}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={view === 'list' ? 'default' : 'outline'}
            onClick={() => setView('list')}
          >
            {language === 'ms' ? 'Senarai' : 'List'}
          </Button>
          <Button 
            variant={view === 'calendar' ? 'default' : 'outline'}
            onClick={() => setView('calendar')}
          >
            {language === 'ms' ? 'Kalendar' : 'Calendar'}
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            title: language === 'ms' ? 'Jumlah Tugas' : 'Total Tasks',
            value: tasks.length,
            icon: Wrench,
            color: 'text-primary'
          },
          {
            title: language === 'ms' ? 'Tertunggak' : 'Overdue',
            value: getOverdueTasks().length,
            icon: AlertTriangle,
            color: 'text-destructive'
          },
          {
            title: language === 'ms' ? 'Minggu Ini' : 'This Week',
            value: tasks.filter(task => {
              const taskDate = new Date(task.next_maintenance_date);
              const today = new Date();
              const weekFromNow = new Date();
              weekFromNow.setDate(today.getDate() + 7);
              return taskDate >= today && taskDate <= weekFromNow;
            }).length,
            icon: Clock,
            color: 'text-warning'
          },
          {
            title: language === 'ms' ? 'Bulan Hadapan' : 'Next Month',
            value: getUpcomingTasks().length,
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

      {view === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                {language === 'ms' ? 'Kalendar Penyelenggaraan' : 'Maintenance Calendar'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                modifiers={{
                  hasTask: (date) => getTasksForDate(date).length > 0,
                  overdue: (date) => {
                    const tasksForDate = getTasksForDate(date);
                    return tasksForDate.some(task => getTaskStatus(task.next_maintenance_date).status === 'overdue');
                  }
                }}
                modifiersStyles={{
                  hasTask: { backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' },
                  overdue: { backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate ? (
                  <>
                    {language === 'ms' ? 'Tugas untuk' : 'Tasks for'}{' '}
                    {selectedDate.toLocaleDateString()}
                  </>
                ) : (
                  language === 'ms' ? 'Pilih Tarikh' : 'Select Date'
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate && (
                <div className="space-y-3">
                  {getTasksForDate(selectedDate).map((task) => {
                    const status = getTaskStatus(task.next_maintenance_date);
                    return (
                      <div key={task.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{task.asset_name}</h4>
                          <Badge className={status.color}>
                            {status.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {task.location} • {task.asset_type}
                        </p>
                        <Button 
                          size="sm" 
                          onClick={() => markTaskComplete(task.id)}
                        >
                          {language === 'ms' ? 'Tandakan Selesai' : 'Mark Complete'}
                        </Button>
                      </div>
                    );
                  })}
                  
                  {getTasksForDate(selectedDate).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      {language === 'ms' ? 'Tiada tugas untuk tarikh ini' : 'No tasks for this date'}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overdue Tasks */}
          {getOverdueTasks().length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  {language === 'ms' ? 'Tugas Tertunggak' : 'Overdue Tasks'}
                </CardTitle>
                <CardDescription>
                  {language === 'ms' 
                    ? 'Tugas penyelenggaraan yang telah melepasi tarikh yang ditetapkan'
                    : 'Maintenance tasks that are past their scheduled date'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getOverdueTasks().map((task) => {
                    const status = getTaskStatus(task.next_maintenance_date);
                    return (
                      <div key={task.id} className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{task.asset_name}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {task.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Package className="h-4 w-4" />
                                {task.asset_type}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="destructive">
                              {status.days} {language === 'ms' ? 'hari tertunggak' : 'days overdue'}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              Due: {new Date(task.next_maintenance_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button 
                            variant="destructive"
                            size="sm"
                            onClick={() => markTaskComplete(task.id)}
                          >
                            {language === 'ms' ? 'Tandakan Selesai' : 'Mark Complete'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                {language === 'ms' ? 'Tugas Akan Datang' : 'Upcoming Tasks'}
              </CardTitle>
              <CardDescription>
                {language === 'ms' 
                  ? 'Tugas penyelenggaraan untuk 30 hari akan datang'
                  : 'Maintenance tasks for the next 30 days'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getUpcomingTasks().map((task) => {
                  const status = getTaskStatus(task.next_maintenance_date);
                  return (
                    <div key={task.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{task.asset_name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {task.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Package className="h-4 w-4" />
                              {task.asset_type}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={status.color}>
                            {status.days === 0 
                              ? (language === 'ms' ? 'Hari ini' : 'Today')
                              : `${status.days} ${language === 'ms' ? 'hari' : 'days'}`
                            }
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(task.next_maintenance_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => markTaskComplete(task.id)}
                        >
                          {language === 'ms' ? 'Tandakan Selesai' : 'Mark Complete'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
                
                {getUpcomingTasks().length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    {language === 'ms' 
                      ? 'Tiada tugas penyelenggaraan yang akan datang'
                      : 'No upcoming maintenance tasks'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}