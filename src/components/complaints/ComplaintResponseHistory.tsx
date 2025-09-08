import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Clock, 
  User, 
  Info, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ComplaintResponse {
  id: string;
  complaint_id: string;
  responder_id: string;
  response_text: string;
  response_type: string;
  is_internal: boolean;
  internal_comments?: string;
  attachments?: string[];
  status_update: string | null;
  created_at: string;
  updated_at: string;
  responder_profile?: {
    full_name: string;
    avatar_url?: string;
  } | null;
}

interface ComplaintResponseHistoryProps {
  complaintId: string;
  refreshKey: number;
}

export default function ComplaintResponseHistory({ complaintId, refreshKey }: ComplaintResponseHistoryProps) {
  const { language, user } = useAuth();
  const { toast } = useToast();
  const [responses, setResponses] = useState<ComplaintResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResponses();
  }, [complaintId, refreshKey]);

  const fetchResponses = async () => {
    try {
      console.log('Fetching responses for complaint:', complaintId);
      // First get the complaint responses
      const { data: responsesData, error: responsesError } = await supabase
        .from('complaint_responses')
        .select('*')
        .eq('complaint_id', complaintId)
        .order('created_at', { ascending: true });

      if (responsesError) throw responsesError;

      // Then get the responder profiles separately
      const responderIds = [...new Set(responsesData?.map(r => r.responder_id).filter(Boolean) || [])];
      
      let profilesData: any[] = [];
      if (responderIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', responderIds);
        
        if (!profilesError) {
          profilesData = profiles || [];
        }
      }

      // Combine the data
      const typedResponses: ComplaintResponse[] = (responsesData || []).map(item => {
        const responderProfile = profilesData.find(p => p.id === item.responder_id);
        return {
          id: item.id,
          complaint_id: item.complaint_id,
          responder_id: item.responder_id,
          response_text: item.response_text,
          response_type: item.response_type,
          is_internal: item.is_internal,
          internal_comments: item.internal_comments,
          attachments: item.attachments || [],
          status_update: item.status_update,
          created_at: item.created_at,
          updated_at: item.updated_at,
          responder_profile: responderProfile ? {
            full_name: responderProfile.full_name,
            avatar_url: responderProfile.avatar_url
          } : null
         };
      });
      
      setResponses(typedResponses);
    } catch (error) {
      console.error('Error fetching complaint responses:', error);
      toast({
        title: language === 'en' ? 'Error loading responses' : 'Ralat memuatkan respons',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getResponseTypeIcon = (type: string) => {
    switch (type) {
      case 'update':
        return <Info className="h-4 w-4" />;
      case 'request_info':
        return <AlertTriangle className="h-4 w-4" />;
      case 'resolution':
        return <CheckCircle className="h-4 w-4" />;
      case 'status_change':
        return <Clock className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getResponseTypeBadge = (type: string) => {
    const types = {
      update: { 
        label: language === 'en' ? 'Update' : 'Kemaskini', 
        variant: 'secondary' as const 
      },
      request_info: { 
        label: language === 'en' ? 'Info Request' : 'Minta Info', 
        variant: 'outline' as const 
      },
      resolution: { 
        label: language === 'en' ? 'Resolution' : 'Penyelesaian', 
        variant: 'default' as const 
      },
      status_change: { 
        label: language === 'en' ? 'Status Change' : 'Ubah Status', 
        variant: 'destructive' as const 
      }
    };

    const typeInfo = types[type as keyof typeof types] || types.update;
    return <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>;
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {language === 'en' ? 'Response History' : 'Sejarah Respons'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-8 h-8 bg-muted animate-pulse rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-1/4"></div>
                  <div className="h-12 bg-muted animate-pulse rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (responses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {language === 'en' ? 'Response History' : 'Sejarah Respons'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {language === 'en' ? 'No responses yet' : 'Tiada respons lagi'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {language === 'en' ? 'Response History' : 'Sejarah Respons'}
          <Badge variant="outline">{responses.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {responses.map((response, index) => (
            <div key={response.id}>
              <div className="flex space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={response.responder_profile?.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {response.responder_profile?.full_name 
                      ? getUserInitials(response.responder_profile.full_name)
                      : <User className="h-3 w-3" />
                    }
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {response.responder_profile?.full_name || 'Staff Member'}
                      </span>
                      {getResponseTypeBadge(response.response_type)}
                      {response.is_internal && (
                        <Badge variant="outline" className="text-xs">
                          <EyeOff className="h-3 w-3 mr-1" />
                          {language === 'en' ? 'Internal' : 'Dalaman'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(new Date(response.created_at), 'dd/MM/yyyy HH:mm')}
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-3 mb-2">
                    <div className="flex items-start space-x-2">
                      {getResponseTypeIcon(response.response_type)}
                      <p className="text-sm leading-relaxed flex-1">
                        {response.response_text}
                      </p>
                    </div>
                    
                    {response.status_update && (
                      <div className="mt-2 pt-2 border-t border-muted">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {language === 'en' ? 'Status changed to:' : 'Status ditukar kepada:'} 
                          <Badge variant="outline" className="ml-1 text-xs">
                            {response.status_update}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>

                  {response.internal_comments && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <EyeOff className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-yellow-700 dark:text-yellow-300 mb-1">
                            {language === 'en' ? 'Internal Comments (Staff Only)' : 'Komen Dalaman (Kakitangan Sahaja)'}
                          </p>
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            {response.internal_comments}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {index < responses.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}