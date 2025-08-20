import { useState, useEffect } from 'react';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Bell, CheckCircle, Clock, XCircle, Users, ArrowRight } from 'lucide-react';

interface RoleRequestNotification {
  id: string;
  requester_name: string;
  current_user_role: string;
  requested_user_role: string;
  status: string;
  created_at: string;
  justification: string;
}

export function NotificationSystem() {
  const { user, language } = useEnhancedAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<RoleRequestNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Subscribe to real-time updates
      const subscription = supabase
        .channel('role_requests')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'role_change_requests' 
          }, 
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('role_change_requests')
        .select(`
          id,
          current_user_role,
          requested_user_role,
          status,
          created_at,
          justification,
          requester_id,
          profiles:requester_id (full_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedNotifications = data?.map(item => ({
        id: item.id,
        requester_name: (item.profiles as any)?.full_name || 'Unknown User',
        current_user_role: item.current_user_role,
        requested_user_role: item.requested_user_role,
        status: item.status,
        created_at: item.created_at,
        justification: item.justification
      })) || [];

      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('role_change_requests')
        .update({ 
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: language === 'en' ? 'Request Approved' : 'Permohonan Diluluskan',
        description: language === 'en' ? 'Role change request has been approved.' : 'Permohonan tukar peranan telah diluluskan.',
      });

      fetchNotifications();
    } catch (error) {
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to approve request.' : 'Gagal meluluskan permohonan.',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('role_change_requests')
        .update({ 
          status: 'rejected',
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: language === 'en' ? 'Request Rejected' : 'Permohonan Ditolak',
        description: language === 'en' ? 'Role change request has been rejected.' : 'Permohonan tukar peranan telah ditolak.',
      });

      fetchNotifications();
    } catch (error) {
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to reject request.' : 'Gagal menolak permohonan.',
        variant: 'destructive',
      });
    }
  };

  const formatRole = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>{language === 'en' ? 'Role Request Notifications' : 'Notifikasi Permohonan Peranan'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="w-5 h-5" />
          <span>{language === 'en' ? 'Role Request Notifications' : 'Notifikasi Permohonan Peranan'}</span>
          {notifications.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {notifications.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {language === 'en' 
            ? 'Pending role change requests requiring your approval'
            : 'Permohonan tukar peranan yang menunggu kelulusan anda'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {language === 'en' ? 'No pending notifications' : 'Tiada notifikasi tertunggak'}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card key={notification.id} className="border-l-4 border-l-yellow-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{notification.requester_name}</span>
                          <Badge variant="outline">{getStatusIcon(notification.status)}</Badge>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-3 text-sm text-muted-foreground">
                          <span>{formatRole(notification.current_user_role)}</span>
                          <ArrowRight className="w-4 h-4" />
                          <span className="font-medium text-foreground">
                            {formatRole(notification.requested_user_role)}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          {notification.justification}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {language === 'en' ? 'Requested on' : 'Dimohon pada'} {' '}
                          {new Date(notification.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(notification.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {language === 'en' ? 'Approve' : 'Lulus'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(notification.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          {language === 'en' ? 'Reject' : 'Tolak'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}