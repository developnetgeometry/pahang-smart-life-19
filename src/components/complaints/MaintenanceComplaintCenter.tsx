import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Wrench, 
  AlertTriangle,
  Eye,
  CheckCircle,
  Clock,
  User,
  MapPin,
  Search,
  Zap,
  Droplets,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MaintenanceComplaint {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  complainant_id: string;
  location: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
  };
}

type ComplaintStatus = 'pending' | 'in_progress' | 'resolved' | 'closed';

export default function MaintenanceComplaintCenter() {
  const { language } = useAuth();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<MaintenanceComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  useEffect(() => {
    fetchMaintenanceComplaints();
  }, []);

  const fetchMaintenanceComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          profiles!complainant_id (full_name)
        `)
        .in('category', ['maintenance', 'facilities', 'plumbing', 'electrical', 'hvac', 'general'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (error) {
      console.error('Error fetching maintenance complaints:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to fetch maintenance complaints' : 'Gagal mendapatkan aduan penyelenggaraan',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (complaintId: string, newStatus: ComplaintStatus) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', complaintId);

      if (error) throw error;

      toast({
        title: language === 'en' ? 'Status Updated' : 'Status Dikemaskini',
        description: language === 'en' 
          ? `Complaint status updated to ${newStatus}` 
          : `Status aduan dikemaskini kepada ${newStatus}`,
      });

      fetchMaintenanceComplaints(); // Refresh the list
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to update complaint status' : 'Gagal mengemas kini status aduan',
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'maintenance': return Wrench;
      case 'facilities': return Settings;
      case 'plumbing': return Droplets;
      case 'electrical': return Zap;
      case 'hvac': return Settings;
      default: return AlertTriangle;
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || complaint.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || complaint.priority === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    highPriority: complaints.filter(c => c.priority === 'high').length,
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      {language === 'en' ? 'Loading...' : 'Memuatkan...'}
    </div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {language === 'en' ? 'Maintenance Complaint Center' : 'Pusat Aduan Penyelenggaraan'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'en' 
            ? 'Monitor and manage maintenance-related complaints' 
            : 'Pantau dan urus aduan berkaitan penyelenggaraan'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Total' : 'Jumlah'}
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Wrench className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Pending' : 'Menunggu'}
                </p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'In Progress' : 'Dalam Proses'}
                </p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'Resolved' : 'Selesai'}
                </p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {language === 'en' ? 'High Priority' : 'Keutamaan Tinggi'}
                </p>
                <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={language === 'en' ? 'Search complaints...' : 'Cari aduan...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={language === 'en' ? 'All Status' : 'Semua Status'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === 'en' ? 'All Status' : 'Semua Status'}</SelectItem>
            <SelectItem value="pending">{language === 'en' ? 'Pending' : 'Menunggu'}</SelectItem>
            <SelectItem value="in_progress">{language === 'en' ? 'In Progress' : 'Dalam Proses'}</SelectItem>
            <SelectItem value="resolved">{language === 'en' ? 'Resolved' : 'Selesai'}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={language === 'en' ? 'All Priority' : 'Semua Keutamaan'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === 'en' ? 'All Priority' : 'Semua Keutamaan'}</SelectItem>
            <SelectItem value="high">{language === 'en' ? 'High' : 'Tinggi'}</SelectItem>
            <SelectItem value="medium">{language === 'en' ? 'Medium' : 'Sederhana'}</SelectItem>
            <SelectItem value="low">{language === 'en' ? 'Low' : 'Rendah'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {filteredComplaints.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {language === 'en' 
                  ? 'No maintenance complaints found.' 
                  : 'Tiada aduan penyelenggaraan dijumpai.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredComplaints.map((complaint) => {
            const CategoryIcon = getCategoryIcon(complaint.category);
            return (
              <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <CategoryIcon className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <CardTitle className="text-lg">{complaint.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getPriorityColor(complaint.priority)}>
                            {complaint.priority}
                          </Badge>
                          <Badge className={getStatusColor(complaint.status)}>
                            {complaint.status}
                          </Badge>
                          <Badge variant="outline">
                            {complaint.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {complaint.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(complaint.id, 'in_progress')}
                        >
                          {language === 'en' ? 'Take Action' : 'Ambil Tindakan'}
                        </Button>
                      )}
                      {complaint.status === 'in_progress' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(complaint.id, 'resolved')}
                        >
                          {language === 'en' ? 'Mark Resolved' : 'Tandakan Selesai'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">{complaint.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {complaint.profiles?.full_name || 'Anonymous'}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {complaint.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}