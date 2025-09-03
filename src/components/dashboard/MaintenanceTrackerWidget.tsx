import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Wrench, Calendar, Clock, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';

interface MaintenanceTrackerWidgetProps {
  language: 'en' | 'ms';
}

interface MaintenanceRequest {
  id: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  assigned_to?: string;
  technician_name?: string;
}

export function MaintenanceTrackerWidget({ language }: MaintenanceTrackerWidgetProps) {
  const navigate = useNavigate();
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaintenanceRequests();
  }, []);

  const fetchMaintenanceRequests = async () => {
    try {
      const { data: workOrders, error } = await supabase
        .from('work_orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;

      const formattedRequests = workOrders?.map(order => ({
        id: order.id.slice(-8),
        title: order.title,
        category: order.work_order_type || 'General',
        status: order.status,
        priority: order.priority,
        created_at: order.created_at,
        assigned_to: order.assigned_to,
        technician_name: 'Loading...'
      })) || [];

      setMaintenanceRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      completed: language === 'en' ? 'Completed' : 'Selesai',
      in_progress: language === 'en' ? 'In Progress' : 'Dalam Proses',
      scheduled: language === 'en' ? 'Scheduled' : 'Dijadualkan',
      pending: language === 'en' ? 'Pending' : 'Menunggu',
      cancelled: language === 'en' ? 'Cancelled' : 'Dibatalkan'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getPriorityText = (priority: string) => {
    const priorityMap = {
      high: language === 'en' ? 'High' : 'Tinggi',
      medium: language === 'en' ? 'Medium' : 'Sederhana',
      low: language === 'en' ? 'Low' : 'Rendah'
    };
    return priorityMap[priority as keyof typeof priorityMap] || priority;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (language === 'en') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('ms-MY', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            <span>{language === 'en' ? 'Maintenance Tracker' : 'Penjejak Penyelenggaraan'}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/my-complaints')}
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : maintenanceRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Wrench className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>{language === 'en' ? 'No maintenance requests found' : 'Tiada permintaan penyelenggaraan'}</p>
          </div>
        ) : (
          maintenanceRequests.map((request) => {
            const progress = request.status === 'completed' ? 100 : 
                           request.status === 'in_progress' ? 60 : 
                           request.status === 'assigned' ? 25 : 0;
                           
            return (
              <div key={request.id} className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-sm line-clamp-1">{request.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {request.category === 'maintenance' ? (language === 'en' ? 'Maintenance' : 'Penyelenggaraan') :
                       request.category === 'repair' ? (language === 'en' ? 'Repair' : 'Pembaikan') :
                       request.category === 'emergency' ? (language === 'en' ? 'Emergency' : 'Kecemasan') :
                       request.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {request.status === 'completed' && <CheckCircle className="w-3 h-3 text-green-600" />}
                    {request.status === 'in_progress' && <Clock className="w-3 h-3 text-blue-600" />}
                    {(request.priority === 'high' || request.priority === 'urgent') && <AlertCircle className={`w-3 h-3 ${getPriorityColor(request.priority)}`} />}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getStatusColor(request.status)}>
                    {getStatusText(request.status)}
                  </Badge>
                  <Badge variant="outline" className={getPriorityColor(request.priority)}>
                    {getPriorityText(request.priority)}
                  </Badge>
                </div>
                
                {request.status !== 'completed' && progress > 0 && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>{language === 'en' ? 'Progress' : 'Kemajuan'}</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1" />
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(request.created_at)}</span>
                  </div>
                  <span className="line-clamp-1">
                    {request.technician_name || (language === 'en' ? 'Unassigned' : 'Belum ditugaskan')}
                  </span>
                </div>
              </div>
            );
          })
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-3"
          onClick={() => navigate('/my-complaints')}
        >
          {language === 'en' ? 'View All Requests' : 'Lihat Semua Permintaan'}
        </Button>
      </CardContent>
    </Card>
  );
}