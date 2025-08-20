import { useState, useEffect } from 'react';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Calendar,
  FileText,
  Shield
} from 'lucide-react';

interface RoleRequest {
  id: string;
  requester_name: string;
  requester_email: string;
  current_user_role: string;
  requested_user_role: string;
  status: string;
  created_at: string;
  approved_at?: string;
  justification: string;
  approver_name?: string;
}

export function ApprovalDashboard() {
  const { user, language } = useEnhancedAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user, activeTab]);

  const fetchRequests = async () => {
    try {
      let query = supabase
        .from('role_change_requests')
        .select(`
          id,
          current_user_role,
          requested_user_role,
          status,
          created_at,
          approved_at,
          justification,
          requester_id,
          approved_by,
          requester:requester_id (full_name, email),
          approver:approved_by (full_name)
        `)
        .order('created_at', { ascending: false });

      if (activeTab !== 'all') {
        query = query.eq('status', activeTab as 'pending' | 'approved' | 'rejected');
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedRequests = data?.map(item => ({
        id: item.id,
        requester_name: (item.requester as any)?.full_name || 'Unknown User',
        requester_email: (item.requester as any)?.email || '',
        current_user_role: item.current_user_role,
        requested_user_role: item.requested_user_role,
        status: item.status,
        created_at: item.created_at,
        approved_at: item.approved_at,
        justification: item.justification,
        approver_name: (item.approver as any)?.full_name
      })) || [];

      setRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (requestId: string, action: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('role_change_requests')
        .update({ 
          status: action,
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: language === 'en' 
          ? (action === 'approved' ? 'Request Approved' : 'Request Rejected')
          : (action === 'approved' ? 'Permohonan Diluluskan' : 'Permohonan Ditolak'),
        description: language === 'en' 
          ? `Role change request has been ${action}.`
          : `Permohonan tukar peranan telah ${action === 'approved' ? 'diluluskan' : 'ditolak'}.`,
      });

      fetchRequests();
    } catch (error) {
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to process request.' : 'Gagal memproses permohonan.',
        variant: 'destructive',
      });
    }
  };

  const formatRole = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRequestCounts = () => {
    return {
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
      total: requests.length
    };
  };

  const counts = getRequestCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{counts.pending}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Pending' : 'Tertunggak'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{counts.approved}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Approved' : 'Diluluskan'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{counts.rejected}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Rejected' : 'Ditolak'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{counts.total}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Total' : 'Jumlah'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>{language === 'en' ? 'Role Change Requests' : 'Permohonan Tukar Peranan'}</span>
          </CardTitle>
          <CardDescription>
            {language === 'en' 
              ? 'Manage role change requests from community members'
              : 'Urus permohonan tukar peranan daripada ahli komuniti'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pending">
                {language === 'en' ? 'Pending' : 'Tertunggak'} ({counts.pending})
              </TabsTrigger>
              <TabsTrigger value="approved">
                {language === 'en' ? 'Approved' : 'Diluluskan'} ({counts.approved})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                {language === 'en' ? 'Rejected' : 'Ditolak'} ({counts.rejected})
              </TabsTrigger>
              <TabsTrigger value="all">
                {language === 'en' ? 'All' : 'Semua'} ({counts.total})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {requests.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {language === 'en' ? 'No requests found' : 'Tiada permohonan dijumpai'}
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <Card key={request.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <div>
                                  <h4 className="font-medium">{request.requester_name}</h4>
                                  <p className="text-sm text-muted-foreground">{request.requester_email}</p>
                                </div>
                                {getStatusBadge(request.status)}
                              </div>

                              <div className="flex items-center space-x-2 mb-3">
                                <Badge variant="outline">{formatRole(request.current_user_role)}</Badge>
                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                <Badge variant="secondary">{formatRole(request.requested_user_role)}</Badge>
                              </div>

                              <p className="text-sm text-muted-foreground mb-3">
                                <strong>{language === 'en' ? 'Justification:' : 'Justifikasi:'}</strong> {request.justification}
                              </p>

                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(request.created_at).toLocaleDateString()}</span>
                                </div>
                                {request.approved_at && (
                                  <div className="flex items-center space-x-1">
                                    <CheckCircle className="w-3 h-3" />
                                    <span>{new Date(request.approved_at).toLocaleDateString()}</span>
                                  </div>
                                )}
                                {request.approver_name && (
                                  <div>
                                    <span>{language === 'en' ? 'by' : 'oleh'} {request.approver_name}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {request.status === 'pending' && (
                              <div className="flex space-x-2 ml-4">
                                <Button
                                  size="sm"
                                  onClick={() => handleApproval(request.id, 'approved')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  {language === 'en' ? 'Approve' : 'Lulus'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleApproval(request.id, 'rejected')}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  {language === 'en' ? 'Reject' : 'Tolak'}
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}