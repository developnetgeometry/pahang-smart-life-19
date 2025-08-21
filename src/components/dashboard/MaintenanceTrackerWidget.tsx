import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Wrench, Calendar, Clock, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MaintenanceTrackerWidgetProps {
  language: 'en' | 'ms';
}

export function MaintenanceTrackerWidget({ language }: MaintenanceTrackerWidgetProps) {
  const navigate = useNavigate();

  const maintenanceRequests = [
    {
      id: 'MR-2024-001',
      title: language === 'en' ? 'Kitchen sink leak repair' : 'Pembaikan kebocoran sink dapur',
      category: language === 'en' ? 'Plumbing' : 'Paip',
      status: 'in_progress',
      priority: 'high',
      submitDate: '2024-01-15',
      estimatedCompletion: '2024-01-18',
      progress: 60,
      assignedTo: language === 'en' ? 'Ahmad (Plumber)' : 'Ahmad (Tukang Paip)'
    },
    {
      id: 'MR-2024-002',
      title: language === 'en' ? 'Air conditioning service' : 'Servis penghawa dingin',
      category: language === 'en' ? 'HVAC' : 'Penghawa Dingin',
      status: 'scheduled',
      priority: 'medium',
      submitDate: '2024-01-16',
      estimatedCompletion: '2024-01-20',
      progress: 25,
      assignedTo: language === 'en' ? 'Lim (HVAC Technician)' : 'Lim (Jurutera HVAC)'
    },
    {
      id: 'MR-2024-003',
      title: language === 'en' ? 'Light fixture replacement' : 'Penggantian lampu',
      category: language === 'en' ? 'Electrical' : 'Elektrik',
      status: 'completed',
      priority: 'low',
      submitDate: '2024-01-10',
      estimatedCompletion: '2024-01-14',
      progress: 100,
      assignedTo: language === 'en' ? 'Rahman (Electrician)' : 'Rahman (Jurutera Elektrik)'
    }
  ];

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
        {maintenanceRequests.map((request) => (
          <div key={request.id} className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium text-sm line-clamp-1">{request.title}</h4>
                <p className="text-xs text-muted-foreground">{request.category}</p>
              </div>
              <div className="flex items-center gap-1">
                {request.status === 'completed' && <CheckCircle className="w-3 h-3 text-green-600" />}
                {request.status === 'in_progress' && <Clock className="w-3 h-3 text-blue-600" />}
                {request.priority === 'high' && <AlertCircle className={`w-3 h-3 ${getPriorityColor(request.priority)}`} />}
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
            
            {request.status !== 'completed' && (
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>{language === 'en' ? 'Progress' : 'Kemajuan'}</span>
                  <span>{request.progress}%</span>
                </div>
                <Progress value={request.progress} className="h-1" />
              </div>
            )}
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(request.submitDate)}</span>
              </div>
              <span className="line-clamp-1">
                {request.assignedTo}
              </span>
            </div>
          </div>
        ))}
        
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