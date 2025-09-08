import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building, 
  Calendar, 
  MapPin, 
  User, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Search,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FacilityComplaint {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  complainant_id: string;
  complainant_name?: string;
  complainant_email?: string;
  location: string;
  created_at: string;
  updated_at: string;
}

type ComplaintStatus = 'pending' | 'in_progress' | 'resolved' | 'closed';

export default function FacilityComplaintCenter() {
  const { language } = useAuth();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<FacilityComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  useEffect(() => {
    fetchFacilityComplaints();
  }, []);

  const fetchFacilityComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          complainant:profiles!complainant_id (
            full_name,
            email
          )
        `)
        .in('category', ['facilities', 'maintenance', 'booking', 'amenities'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const facilitiesComplaints = data?.map(complaint => ({
        ...complaint,
        complainant_name: complaint.complainant?.full_name || 'Anonymous',
        complainant_email: complaint.complainant?.email || 'N/A'
      })) || [];

      setComplaints(facilitiesComplaints);
    } catch (error) {
      console.error('Error fetching facility complaints:', error);
      toast({
        title: "Error",
        description: "Failed to fetch complaints. Please try again.",
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
        title: "Success",
        description: `Complaint status updated to ${newStatus}`,
      });

      // Refresh the complaints list
      fetchFacilityComplaints();
    } catch (error) {
      console.error('Error updating complaint status:', error);
      toast({
        title: "Error",
        description: "Failed to update complaint status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'secondary';
      case 'in_progress': return 'default';
      case 'resolved': return 'default';
      case 'closed': return 'outline';
      default: return 'outline';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'facilities': return Building;
      case 'maintenance': return AlertTriangle;
      case 'booking': return Calendar;
      case 'amenities': return MapPin;
      default: return Building;
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    return (
      (searchTerm === '' || 
       complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
       complaint.complainant_name?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedStatus === 'all' || complaint.status === selectedStatus) &&
      (selectedPriority === 'all' || complaint.priority === selectedPriority)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {language === 'en' ? 'Facility Complaint Center' : 'Pusat Aduan Kemudahan'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'en' 
            ? 'Monitor and manage facility-related complaints' 
            : 'Pantau dan urus aduan berkaitan kemudahan'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Complaints</p>
                <p className="text-2xl font-bold">{complaints.length}</p>
              </div>
              <Building className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {complaints.filter(c => c.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {complaints.filter(c => c.status === 'in_progress').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {complaints.filter(c => c.status === 'resolved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-red-600">
                  {complaints.filter(c => c.priority === 'high').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Complaints List */}
      <div className="space-y-4">
        {filteredComplaints.length > 0 ? (
          filteredComplaints.map((complaint) => {
            const CategoryIcon = getCategoryIcon(complaint.category);
            return (
              <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <CategoryIcon className="h-6 w-6 text-primary mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold truncate">{complaint.title}</h3>
                          <Badge variant={getPriorityColor(complaint.priority) as any}>
                            {complaint.priority}
                          </Badge>
                          <Badge variant={getStatusColor(complaint.status) as any}>
                            {complaint.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3 line-clamp-2">{complaint.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{complaint.complainant_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{complaint.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      {complaint.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(complaint.id, 'in_progress')}
                        >
                          Take Action
                        </Button>
                      )}
                      {complaint.status === 'in_progress' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(complaint.id, 'resolved')}
                        >
                          Mark Resolved
                        </Button>
                      )}
                      {complaint.status === 'resolved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(complaint.id, 'closed')}
                        >
                          Close
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No complaints found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedStatus !== 'all' || selectedPriority !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'No facility complaints have been submitted yet.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}