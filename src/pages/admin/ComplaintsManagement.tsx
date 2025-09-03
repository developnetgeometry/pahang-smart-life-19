import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Search, 
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  MapPin,
  TrendingUp,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import WorkOrderManager from '@/components/complaints/WorkOrderManager';
import ComplaintEscalationDialog from '@/components/complaints/ComplaintEscalationDialog';
import FacilityManagerComplaintForm from '@/components/complaints/FacilityManagerComplaintForm';
import { useUserRoles } from '@/hooks/use-user-roles';

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  complainant_id: string;
  assigned_to?: string;
  location: string;
  created_at: string;
  updated_at: string;
  resolution?: string;
  escalation_level: number;
  profiles?: {
    full_name: string;
  };
}

interface ComplaintStats {
  total: number;
  pending: number;
  resolvedToday: number;
  avgResolutionTime: string;
}

export default function ComplaintsManagement() {
  const { language, user } = useAuth();
  const { hasRole } = useUserRoles();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<ComplaintStats>({
    total: 0,
    pending: 0,
    resolvedToday: 0,
    avgResolutionTime: '0 days'
  });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const isFacilityManager = hasRole('facility_manager' as any);
  const isSecurityOfficer = hasRole('security_officer' as any);
  const canManageWorkOrders = isFacilityManager || hasRole('community_admin' as any);

  useEffect(() => {
    fetchComplaints();
    fetchStats();
  }, [refreshKey]);

  const fetchComplaints = async () => {
    try {
      console.log('=== DEBUGGING COMPLAINTS FETCH ===');
      console.log('User object:', user);
      console.log('User district:', user?.district);
      
      let query = supabase
        .from('complaints')
        .select(`
          *,
          profiles!complainant_id (full_name)
        `);

      // TEMPORARILY REMOVE DISTRICT FILTERING TO DEBUG
      // const userDistrict = user?.district;
      // if (userDistrict) {
      //   // Handle both UUID format and "district-{uuid}" format
      //   const districtId = userDistrict.startsWith('district-') 
      //     ? userDistrict.replace('district-', '') 
      //     : userDistrict;
      //   console.log('Filtering by district:', districtId);
      //   query = query.eq('district_id', districtId);
      // }

      // Filter complaints based on user role
      if (isFacilityManager && !hasRole('community_admin' as any) && !hasRole('state_admin' as any)) {
        // Facility managers should only see facilities and maintenance related complaints
        query = query.in('category', ['facilities', 'maintenance']);
        } else if (hasRole('community_admin' as any) && !hasRole('district_coordinator' as any) && !hasRole('state_admin' as any)) {
          // Community admins should see: noise and general complaints
          query = query.in('category', ['noise', 'general']);
        }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Fetched complaints from database:', data);
      setComplaints(data || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast({
        title: 'Error',
        description: 'Failed to load complaints from database.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      let query = supabase
        .from('complaints')
        .select('*');

      // Apply same role-based filtering for stats
      if (isFacilityManager && !hasRole('community_admin' as any) && !hasRole('state_admin' as any)) {
        query = query.in('category', ['facilities', 'maintenance', 'infrastructure']);
        } else if (hasRole('community_admin' as any) && !hasRole('district_coordinator' as any) && !hasRole('state_admin' as any)) {
          query = query.in('category', ['noise', 'general']);
        }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      const today = new Date().toDateString();
      const resolvedToday = data?.filter(c => 
        c.status === 'resolved' && 
        new Date(c.updated_at).toDateString() === today
      ).length || 0;

      const pendingCount = data?.filter(c => c.status === 'pending').length || 0;

      const statsData = {
        total: data?.length || 0,
        pending: pendingCount,
        resolvedToday,
        avgResolutionTime: '2.5 days'
      };

      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load complaint statistics.',
        variant: 'destructive'
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'default';
      case 'in_progress': return 'secondary';
      case 'investigating': return 'outline';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  const getCategoryDisplay = (category: string) => {
    const categories = {
      maintenance: 'Maintenance',
      noise: 'Noise',
      security: 'Security', 
      facilities: 'Facilities',
      parking: 'Parking',
      general: 'General'
    };
    return categories[category as keyof typeof categories] || category;
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesTab = true;
    if (activeTab === 'pending') matchesTab = complaint.status === 'pending';
    if (activeTab === 'investigating') matchesTab = complaint.status === 'in_progress';
    if (activeTab === 'resolved') matchesTab = complaint.status === 'resolved';
    
    const matchesStatus = selectedStatus === 'all' || complaint.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || complaint.category === selectedCategory;
    
    return matchesSearch && matchesTab && matchesStatus && matchesCategory;
  });

  const handleAssign = async (complaintId: string) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ 
          status: 'in_progress',
          assigned_to: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', complaintId);

      if (error) throw error;

      toast({
        title: 'Complaint Assigned',
        description: 'Complaint has been assigned to you for investigation.',
      });

      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error assigning complaint:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign complaint.',
        variant: 'destructive'
      });
    }
  };

  const handleResolve = async (complaintId: string) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ 
          status: 'resolved',
          updated_at: new Date().toISOString()
        })
        .eq('id', complaintId);

      if (error) throw error;

      toast({
        title: 'Complaint Resolved',
        description: 'Complaint has been marked as resolved.',
      });

      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error resolving complaint:', error);
      toast({
        title: 'Error',
        description: 'Failed to resolve complaint.',
        variant: 'destructive'
      });
    }
  };

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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Complaints Management</h1>
        <p className="text-muted-foreground">Manage resident complaints and feedback</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Complaints</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
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
                <p className="text-sm font-medium text-muted-foreground">Resolved Today</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolvedToday}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Resolution Time</p>
                <p className="text-2xl font-bold text-blue-600">{stats.avgResolutionTime}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Filters */}
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Complaints</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="investigating">In Progress</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 py-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(isFacilityManager && !hasRole('community_admin' as any) && !hasRole('state_admin' as any)) ? (
                  // Show only relevant categories for facility managers
                  <>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="facilities">Facilities</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  </>
                ) : (hasRole('community_admin' as any) && !hasRole('district_coordinator' as any) && !hasRole('state_admin' as any)) ? (
                  // Show noise and general categories for community admins
                  <>
                    <SelectItem value="noise">Noise</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </>
                ) : (
                  // Show all categories for higher level admins
                  <>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="noise">Noise</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="facilities">Facilities</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="parking">Parking</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <TabsContent value={activeTab} className="space-y-4">
            {/* Complaints Management Section */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Complaints Management</h2>
                
                {filteredComplaints.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No complaints found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredComplaints.map((complaint) => (
                      <div key={complaint.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <h3 className="font-semibold text-lg">{complaint.title}</h3>
                            <p className="text-muted-foreground">{complaint.description}</p>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>{complaint.profiles?.full_name || 'Unknown'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{complaint.location}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
                              </div>
                              <Badge variant="outline">
                                {getCategoryDisplay(complaint.category)}
                              </Badge>
                            </div>

                            {complaint.resolution && (
                              <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-sm"><strong>Resolution:</strong> {complaint.resolution}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Badge variant={getPriorityColor(complaint.priority)}>
                              {complaint.priority}
                            </Badge>
                            <Badge variant={getStatusColor(complaint.status)}>
                              {complaint.status === 'in_progress' ? 'In Progress' : complaint.status}
                            </Badge>
                            
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleAssign(complaint.id)}
                                disabled={complaint.status !== 'pending'}
                              >
                                Assign
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleResolve(complaint.id)}
                                disabled={complaint.status === 'resolved'}
                              >
                                Resolve
                              </Button>
                              {complaint.status === 'resolved' && (
                                <Button variant="outline" size="sm">
                                  Close
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Work Order Management Section */}
      {canManageWorkOrders && (
        <div className="mt-8 space-y-6">
          <WorkOrderManager onWorkOrderCreated={() => setRefreshKey(prev => prev + 1)} />
        </div>
      )}

      {/* Facility Manager Tools */}
      {isFacilityManager && (
        <div className="mt-8">
          <FacilityManagerComplaintForm 
            onComplaintSubmitted={() => setRefreshKey(prev => prev + 1)}
          />
        </div>
      )}
    </div>
  );
}