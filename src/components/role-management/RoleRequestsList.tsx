import React, { useState, useEffect } from 'react';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Calendar,
  User,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";

interface RoleRequest {
  id: string;
  requester_id: string;
  target_user_id: string;
  current_user_role: string;
  requested_user_role: string;
  request_type: string;
  status: string;
  reason: string;
  justification?: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
  approved_at?: string;
  rejection_reason?: string;
  // Join data
  requester_profile?: {
    full_name: string;
    email: string;
  } | null;
}

const STATUS_COLORS = {
  'pending': 'default',
  'under_review': 'secondary', 
  'approved': 'default',
  'rejected': 'destructive',
  'on_probation': 'secondary',
  'active': 'default',
  'expired': 'outline'
} as const;

const STATUS_ICONS = {
  'pending': Clock,
  'under_review': RefreshCw,
  'approved': CheckCircle,
  'rejected': XCircle,
  'on_probation': AlertTriangle,
  'active': CheckCircle,
  'expired': XCircle
};

const ROLE_LABELS = {
  'resident': 'Resident',
  'community_leader': 'Community Leader', 
  'service_provider': 'Service Provider',
  'facility_manager': 'Facility Manager',
  'security': 'Security Officer',
  'community_admin': 'Community Admin',
  'district_coordinator': 'District Coordinator',
  'state_admin': 'State Admin',
  'admin': 'System Admin'
};

export const RoleRequestsList: React.FC = () => {
  const { user, language, hasRole } = useEnhancedAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my-requests' | 'pending-approval'>('my-requests');

  const text = {
    en: {
      title: "Role Change Requests",
      description: "Manage role change requests and approvals",
      myRequests: "My Requests",
      pendingApproval: "Pending Approval",
      noRequests: "No requests found",
      requestedBy: "Requested by",
      currentRole: "Current Role", 
      requestedRole: "Requested Role",
      status: "Status",
      reason: "Reason",
      justification: "Justification",
      attachments: "Attachments",
      submittedOn: "Submitted on",
      lastUpdated: "Last updated",
      approve: "Approve",
      reject: "Reject",
      viewDetails: "View Details"
    },
    ms: {
      title: "Permohonan Perubahan Peranan",
      description: "Uruskan permohonan dan kelulusan perubahan peranan",
      myRequests: "Permohonan Saya",
      pendingApproval: "Menunggu Kelulusan",
      noRequests: "Tiada permohonan dijumpai",
      requestedBy: "Dimohon oleh",
      currentRole: "Peranan Semasa",
      requestedRole: "Peranan Dimohon", 
      status: "Status",
      reason: "Sebab",
      justification: "Justifikasi",
      attachments: "Lampiran",
      submittedOn: "Dihantar pada",
      lastUpdated: "Kemaskini terakhir",
      approve: "Luluskan",
      reject: "Tolak",
      viewDetails: "Lihat Butiran"
    }
  };

  const t = text[language];

  useEffect(() => {
    fetchRequests();
  }, [user, activeTab]);

  const fetchRequests = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      let query = supabase
        .from('role_change_requests')
        .select('*');

      if (activeTab === 'my-requests') {
        // Fetch user's own requests
        query = query.eq('requester_id', user.id);
      } else {
        // Fetch requests that need approval based on user's role
        // This is a simplified approach - you might want to implement more complex logic
        query = query.neq('requester_id', user.id).eq('status', 'pending');
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch profiles separately for simplicity
      const requestsWithProfiles = await Promise.all((data || []).map(async (request) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', request.requester_id)
          .single();
        
        return {
          ...request,
          requester_profile: profile
        } as RoleRequest;
      }));

      setRequests(requestsWithProfiles);
    } catch (error) {
      console.error('Error fetching role requests:', error);
      toast({
        title: "Error", 
        description: "Failed to fetch role requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (requestId: string, approve: boolean) => {
    try {
      const updateData = {
        status: approve ? 'approved' as const : 'rejected' as const,
        approved_by: user?.id,
        approved_at: approve ? new Date().toISOString() : null,
        rejection_reason: approve ? null : 'Rejected by approver'
      };

      const { error } = await supabase
        .from('role_change_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Request ${approve ? 'approved' : 'rejected'} successfully`,
      });

      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: "Failed to update request",
        variant: "destructive",
      });
    }
  };

  const RoleRequestCard: React.FC<{ request: RoleRequest }> = ({ request }) => {
    const StatusIcon = STATUS_ICONS[request.status as keyof typeof STATUS_ICONS];
    
    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <CardTitle className="text-base">
                  {activeTab === 'my-requests' ? 'My Request' : request.requester_profile?.full_name || 'Unknown User'}
                </CardTitle>
                <CardDescription className="text-sm">
                  {request.requester_profile?.email}
                </CardDescription>
              </div>
            </div>
            <Badge variant={STATUS_COLORS[request.status as keyof typeof STATUS_COLORS]}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {request.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline">
              {ROLE_LABELS[request.current_user_role as keyof typeof ROLE_LABELS]}
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="secondary">
              {ROLE_LABELS[request.requested_user_role as keyof typeof ROLE_LABELS]}
            </Badge>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium">{t.reason}: </span>
              <span className="text-sm text-muted-foreground">{request.reason}</span>
            </div>
            
            {request.justification && (
              <div>
                <span className="text-sm font-medium">{t.justification}: </span>
                <span className="text-sm text-muted-foreground">{request.justification}</span>
              </div>
            )}

            {request.attachments && request.attachments.length > 0 && (
              <div>
                <span className="text-sm font-medium">{t.attachments}: </span>
                <div className="flex gap-1 mt-1">
                  {request.attachments.map((url, index) => (
                    <Button key={index} variant="outline" size="sm" asChild>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-3 w-3 mr-1" />
                        Doc {index + 1}
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {t.submittedOn}: {format(new Date(request.created_at), 'MMM dd, yyyy')}
              </div>
              {request.updated_at !== request.created_at && (
                <div className="flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" />
                  {t.lastUpdated}: {format(new Date(request.updated_at), 'MMM dd, yyyy')}
                </div>
              )}
            </div>

            {activeTab === 'pending-approval' && request.status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleApproval(request.id, false)}
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  {t.reject}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleApproval(request.id, true)}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {t.approve}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-requests">{t.myRequests}</TabsTrigger>
            {(hasRole('community_admin') || hasRole('district_coordinator') || hasRole('state_admin')) && (
              <TabsTrigger value="pending-approval">{t.pendingApproval}</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="my-requests">
            <ScrollArea className="h-[600px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t.noRequests}
                </div>
              ) : (
                requests.map((request) => (
                  <RoleRequestCard key={request.id} request={request} />
                ))
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="pending-approval">
            <ScrollArea className="h-[600px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t.noRequests}
                </div>
              ) : (
                requests.map((request) => (
                  <RoleRequestCard key={request.id} request={request} />
                ))
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};