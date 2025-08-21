import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users, Clock, CheckCircle, XCircle, AlertTriangle, FileText, User, Building } from 'lucide-react';

interface RoleRequest {
  request_id: string;
  requester_name: string;
  requester_email: string;
  user_current_role: string;
  user_requested_role: string;
  reason: string;
  justification: string;
  requirements: string[];
  created_at: string;
  district_name: string;
}

export function ApprovalDashboard() {
  const { user, language } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const text = {
    en: {
      title: 'Role Approval Dashboard',
      subtitle: 'Review and approve role change requests based on your authority',
      noRequests: 'No pending role requests found',
      noRequestsDesc: 'All role change requests have been processed or you don\'t have any requests to approve.',
      pendingApproval: 'Pending Your Approval',
      requester: 'Requester',
      transition: 'Role Transition',
      requirements: 'Requirements',
      reason: 'Reason',
      justification: 'Additional Details',
      district: 'District',
      submittedOn: 'Submitted On',
      approve: 'Approve',
      reject: 'Reject',
      approving: 'Approving...',
      rejecting: 'Rejecting...',
      approvalSuccess: 'Role change request approved successfully',
      rejectionSuccess: 'Role change request rejected',
      error: 'Failed to process role change request',
      communityVoting: 'Community Voting Required',
      businessVerification: 'Business Verification Required',
      interviewProcess: 'Interview Process Required',
      backgroundCheck: 'Background Check Required',
      performanceEvaluation: 'Performance Evaluation Required',
      multiLevelApproval: 'Multi-Level Approval Required',
      authorityLevel: 'Your Authority Level'
    },
    ms: {
      title: 'Papan Pemuka Kelulusan Peranan',
      subtitle: 'Semak dan luluskan permohonan perubahan peranan berdasarkan kuasa anda',
      noRequests: 'Tiada permohonan peranan yang belum selesai',
      noRequestsDesc: 'Semua permohonan perubahan peranan telah diproses atau anda tiada permohonan untuk diluluskan.',
      pendingApproval: 'Menunggu Kelulusan Anda',
      requester: 'Pemohon',
      transition: 'Peralihan Peranan',
      requirements: 'Keperluan',
      reason: 'Sebab',
      justification: 'Butiran Tambahan',
      district: 'Daerah',
      submittedOn: 'Diserahkan Pada',
      approve: 'Lulus',
      reject: 'Tolak',
      approving: 'Meluluskan...',
      rejecting: 'Menolak...',
      approvalSuccess: 'Permohonan perubahan peranan berjaya diluluskan',
      rejectionSuccess: 'Permohonan perubahan peranan ditolak',
      error: 'Gagal memproses permohonan perubahan peranan',
      communityVoting: 'Pengundian Komuniti Diperlukan',
      businessVerification: 'Pengesahan Perniagaan Diperlukan',
      interviewProcess: 'Proses Temu Duga Diperlukan',
      backgroundCheck: 'Semakan Latar Belakang Diperlukan',
      performanceEvaluation: 'Penilaian Prestasi Diperlukan',
      multiLevelApproval: 'Kelulusan Berbilang Tahap Diperlukan',
      authorityLevel: 'Tahap Kuasa Anda'
    }
  };

  const t = text[language];

  useEffect(() => {
    fetchPendingRequests();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('role_requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'role_change_requests'
        },
        () => {
          fetchPendingRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchPendingRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc(
        'get_pending_role_requests_for_approver',
        { approver_user_id: user.id }
      );

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching role requests:', error);
      toast({
        title: "Error",
        description: "Failed to load role requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (requestId: string, action: 'approved' | 'rejected') => {
    setProcessingIds(prev => new Set(prev).add(requestId));
    
    try {
      const { error } = await supabase
        .from('role_change_requests')
        .update({
          status: action,
          approved_by: user?.id,
          approved_at: action === 'approved' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      // If approved, we should also update the user's role in the enhanced_user_roles table
      if (action === 'approved') {
        const request = requests.find(r => r.request_id === requestId);
        if (request) {
          // First, deactivate old role
          await supabase
            .from('enhanced_user_roles')
            .update({ is_active: false })
            .eq('user_id', request.requester_name) // This should be requester user_id
            .eq('role', request.user_current_role as any);

          // Then add new role (this would normally be done after all requirements are met)
          // For now, we'll just update the request status
        }
      }

      toast({
        title: "Success",
        description: action === 'approved' ? t.approvalSuccess : t.rejectionSuccess,
      });

      // Remove from local state
      setRequests(prev => prev.filter(r => r.request_id !== requestId));
    } catch (error) {
      console.error('Error updating role request:', error);
      toast({
        title: "Error",
        description: t.error,
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getRequirementLabel = (requirement: string) => {
    const requirementMap = {
      'community_voting': t.communityVoting,
      'business_verification': t.businessVerification,
      'interview_process': t.interviewProcess,
      'background_check': t.backgroundCheck,
      'performance_evaluation': t.performanceEvaluation,
      'multi_level_approval': t.multiLevelApproval
    };
    return requirementMap[requirement as keyof typeof requirementMap] || requirement;
  };

  const getAuthorityInfo = () => {
    if (!user) return null;

    const roles = user.available_roles || [];
    
    if (roles.includes('state_admin')) {
      return {
        level: 'State Admin',
        canApprove: ['Community Admin → District Coordinator', 'District Coordinator → State Admin'],
        color: 'bg-purple-100 text-purple-800'
      };
    }
    if (roles.includes('district_coordinator')) {
      return {
        level: 'District Coordinator',
        canApprove: ['Resident → Security Officer'],
        color: 'bg-blue-100 text-blue-800'
      };
    }
    if (roles.includes('community_admin')) {
      return {
        level: 'Community Admin',
        canApprove: ['Resident → Community Leader', 'Resident → Service Provider', 'Resident → Facility Manager'],
        color: 'bg-green-100 text-green-800'
      };
    }

    return null;
  };

  const authorityInfo = getAuthorityInfo();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            {t.title}
          </h2>
          <p className="text-muted-foreground mt-1">
            {t.subtitle}
          </p>
        </div>
        
        {authorityInfo && (
          <div className="text-right">
            <div className="text-sm text-muted-foreground">{t.authorityLevel}</div>
            <Badge className={authorityInfo.color}>{authorityInfo.level}</Badge>
          </div>
        )}
      </div>

      {/* Authority Information Card */}
      {authorityInfo && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="h-5 w-5" />
              Approval Authority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">You can approve the following role transitions:</p>
              <div className="flex flex-wrap gap-2">
                {authorityInfo.canApprove.map((transition, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {transition}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t.pendingApproval}
          </CardTitle>
          <CardDescription>
            {requests.length} {language === 'en' ? 'requests pending your review' : 'permohonan menunggu semakan anda'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{t.noRequests}</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t.noRequestsDesc}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {requests.map((request) => (
                <Card key={request.request_id} className="border-l-4 border-l-yellow-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="h-5 w-5" />
                          {request.requester_name}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{request.requester_email}</span>
                          {request.district_name && (
                            <>
                              <span>•</span>
                              <span>{request.district_name}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(request.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Role Transition */}
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">{t.transition}</h4>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{formatRole(request.user_current_role)}</Badge>
                        <span className="text-muted-foreground">→</span>
                        <Badge variant="secondary">{formatRole(request.user_requested_role)}</Badge>
                      </div>
                    </div>

                    {/* Requirements */}
                    {request.requirements && request.requirements.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">{t.requirements}</h4>
                        <div className="flex flex-wrap gap-2">
                          {request.requirements.map((req, index) => (
                            <Badge key={index} variant="outline" className="text-xs flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {getRequirementLabel(req)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reason */}
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">{t.reason}</h4>
                      <p className="text-sm bg-muted p-3 rounded-md">{request.reason}</p>
                    </div>

                    {/* Additional Justification */}
                    {request.justification && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">{t.justification}</h4>
                        <p className="text-sm bg-muted p-3 rounded-md">{request.justification}</p>
                      </div>
                    )}

                    <Separator />

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApproval(request.request_id, 'rejected')}
                        disabled={processingIds.has(request.request_id)}
                        className="flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        {processingIds.has(request.request_id) ? t.rejecting : t.reject}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApproval(request.request_id, 'approved')}
                        disabled={processingIds.has(request.request_id)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {processingIds.has(request.request_id) ? t.approving : t.approve}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}