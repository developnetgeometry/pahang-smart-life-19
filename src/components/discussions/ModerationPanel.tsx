import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Flag, Eye, EyeOff, Lock, Unlock, Pin, PinOff, Trash2, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ModerationReport {
  id: string;
  discussion_id?: string | null;
  reply_id?: string | null;
  reported_by: string;
  report_reason: string;
  report_details?: string | null;
  status: string;
  created_at: string | null;
  discussion_title?: string | null;
  reporter_name?: string | null;
}

interface ModerationAction {
  id: string;
  discussion_id?: string;
  reply_id?: string;
  moderator_id: string;
  action_type: string;
  reason?: string;
  notes?: string;
  created_at: string;
  moderator_name?: string;
}

interface DiscussionItem {
  id: string;
  title: string;
  content: string;
  author: string | null;
  moderation_status: string | null;
  is_pinned: boolean | null;
  is_locked: boolean | null;
  is_reported: boolean | null;
  report_count: number | null;
  created_at: string | null;
}

export default function ModerationPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'reports' | 'actions' | 'discussions'>('reports');
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [actionNotes, setActionNotes] = useState('');

  useEffect(() => {
    fetchModerationData();
  }, [selectedTab]);

  const fetchModerationData = async () => {
    setLoading(true);
    try {
      if (selectedTab === 'reports') {
        await fetchReports();
      } else if (selectedTab === 'actions') {
        await fetchActions();
      } else {
        await fetchDiscussions();
      }
    } catch (error) {
      console.error('Error fetching moderation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from('discussion_reports')
      .select(`
        *,
        discussions!discussion_reports_discussion_id_fkey (title),
        profiles!discussion_reports_reported_by_fkey (full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const processedReports = (data || []).map((report: any) => ({
      ...report,
      discussion_title: report.discussions?.title || null,
      reporter_name: report.profiles?.full_name || null
    }));

    setReports(processedReports);
  };

  const fetchActions = async () => {
    const { data, error } = await supabase
      .from('discussion_moderation_actions')
      .select(`
        *,
        profiles!discussion_moderation_actions_moderator_id_fkey (full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const processedActions = (data || []).map(action => ({
      ...action,
      moderator_name: action.profiles?.full_name
    }));

    setActions(processedActions);
  };

  const fetchDiscussions = async () => {
    const { data, error } = await supabase
      .from('discussions')
      .select(`
        *,
        profiles!discussions_author_id_fkey (full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const processedDiscussions = (data || []).map((discussion: any) => ({
      ...discussion,
      author: discussion.profiles?.full_name || null
    }));

    setDiscussions(processedDiscussions);
  };

  const takeAction = async () => {
    if (!selectedItem || !actionType) return;

    try {
      // Insert moderation action
      const { error: actionError } = await supabase
        .from('discussion_moderation_actions')
        .insert({
          discussion_id: selectedItem.discussion_id || selectedItem.id,
          reply_id: selectedItem.reply_id,
          moderator_id: user?.id,
          action_type: actionType,
          reason: actionReason,
          notes: actionNotes
        });

      if (actionError) throw actionError;

      // Update discussion based on action type
      if (selectedItem.discussion_id || selectedItem.id) {
        const discussionId = selectedItem.discussion_id || selectedItem.id;
        let updateData: any = {};

        switch (actionType) {
          case 'approve':
            updateData = { 
              moderation_status: 'approved',
              moderated_by: user?.id,
              moderated_at: new Date().toISOString()
            };
            break;
          case 'flag':
            updateData = { 
              moderation_status: 'flagged',
              moderated_by: user?.id,
              moderated_at: new Date().toISOString(),
              moderation_reason: actionReason
            };
            break;
          case 'remove':
            updateData = { 
              moderation_status: 'removed',
              moderated_by: user?.id,
              moderated_at: new Date().toISOString(),
              moderation_reason: actionReason
            };
            break;
          case 'pin':
            updateData = { is_pinned: true };
            break;
          case 'unpin':
            updateData = { is_pinned: false };
            break;
          case 'lock':
            updateData = { is_locked: true };
            break;
          case 'unlock':
            updateData = { is_locked: false };
            break;
        }

        if (Object.keys(updateData).length > 0) {
          const { error: updateError } = await supabase
            .from('discussions')
            .update(updateData)
            .eq('id', discussionId);

          if (updateError) throw updateError;
        }
      }

      // Update report status if this was from a report
      if (selectedItem.report_id) {
        const { error: reportError } = await supabase
          .from('discussion_reports')
          .update({
            status: 'reviewed',
            reviewed_by: user?.id,
            reviewed_at: new Date().toISOString(),
            resolution_notes: actionNotes
          })
          .eq('id', selectedItem.report_id);

        if (reportError) throw reportError;
      }

      toast({
        title: "Success",
        description: `Action ${actionType} completed successfully`
      });

      setActionModalOpen(false);
      setActionType('');
      setActionReason('');
      setActionNotes('');
      fetchModerationData();

    } catch (error) {
      console.error('Error taking moderation action:', error);
      toast({
        title: "Error",
        description: "Failed to complete moderation action",
        variant: "destructive"
      });
    }
  };

  const openActionModal = (item: any, type?: string) => {
    setSelectedItem(item);
    if (type) setActionType(type);
    setActionModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'flagged': return 'bg-orange-500';
      case 'removed': return 'bg-red-500';
      case 'resolved': return 'bg-blue-500';
      case 'dismissed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getReportReasonColor = (reason: string) => {
    switch (reason) {
      case 'spam': return 'bg-orange-500';
      case 'harassment': return 'bg-red-500';
      case 'inappropriate': return 'bg-purple-500';
      case 'misinformation': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Discussion Moderation</h1>
        <p className="text-muted-foreground">Manage community discussions and reports</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={selectedTab === 'reports' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('reports')}
          className="px-4 py-2"
        >
          <Flag className="w-4 h-4 mr-2" />
          Reports ({reports.length})
        </Button>
        <Button
          variant={selectedTab === 'discussions' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('discussions')}
          className="px-4 py-2"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Discussions ({discussions.length})
        </Button>
        <Button
          variant={selectedTab === 'actions' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('actions')}
          className="px-4 py-2"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Actions ({actions.length})
        </Button>
      </div>

      {/* Reports Tab */}
      {selectedTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <Card>
              <CardContent className="text-center py-10">
                <Flag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No reports to review</p>
              </CardContent>
            </Card>
          ) : (
            reports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">
                        {report.discussion_title || 'Discussion Report'}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getReportReasonColor(report.report_reason)} text-white`}>
                          {report.report_reason}
                        </Badge>
                        <Badge className={`${getStatusColor(report.status)} text-white`}>
                          {report.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          by {report.reporter_name} • {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {report.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openActionModal({ ...report, report_id: report.id }, 'flag')}
                        >
                          <Flag className="w-4 h-4 mr-2" />
                          Flag
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openActionModal({ ...report, report_id: report.id }, 'approve')}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                {report.report_details && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{report.report_details}</p>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* Discussions Tab */}
      {selectedTab === 'discussions' && (
        <div className="space-y-4">
          {discussions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-10">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No discussions found</p>
              </CardContent>
            </Card>
          ) : (
            discussions.map((discussion) => (
              <Card key={discussion.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="text-lg">{discussion.title}</CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`${getStatusColor(discussion.moderation_status)} text-white`}>
                          {discussion.moderation_status}
                        </Badge>
                        {discussion.is_pinned && (
                          <Badge variant="outline">
                            <Pin className="w-3 h-3 mr-1" />
                            Pinned
                          </Badge>
                        )}
                        {discussion.is_locked && (
                          <Badge variant="outline">
                            <Lock className="w-3 h-3 mr-1" />
                            Locked
                          </Badge>
                        )}
                        {discussion.is_reported && (
                          <Badge variant="destructive">
                            <Flag className="w-3 h-3 mr-1" />
                            {discussion.report_count} reports
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          by {discussion.author} • {new Date(discussion.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openActionModal(discussion, discussion.is_pinned ? 'unpin' : 'pin')}
                      >
                        {discussion.is_pinned ? (
                          <PinOff className="w-4 h-4 mr-2" />
                        ) : (
                          <Pin className="w-4 h-4 mr-2" />
                        )}
                        {discussion.is_pinned ? 'Unpin' : 'Pin'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openActionModal(discussion, discussion.is_locked ? 'unlock' : 'lock')}
                      >
                        {discussion.is_locked ? (
                          <Unlock className="w-4 h-4 mr-2" />
                        ) : (
                          <Lock className="w-4 h-4 mr-2" />
                        )}
                        {discussion.is_locked ? 'Unlock' : 'Lock'}
                      </Button>
                      {discussion.moderation_status !== 'removed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openActionModal(discussion, 'remove')}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {discussion.content}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Actions Tab */}
      {selectedTab === 'actions' && (
        <div className="space-y-4">
          {actions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-10">
                <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No moderation actions recorded</p>
              </CardContent>
            </Card>
          ) : (
            actions.map((action) => (
              <Card key={action.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{action.action_type}</Badge>
                        <span className="text-sm text-muted-foreground">
                          by {action.moderator_name} • {new Date(action.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {action.reason && (
                        <p className="text-sm font-medium">Reason: {action.reason}</p>
                      )}
                      {action.notes && (
                        <p className="text-sm text-muted-foreground">{action.notes}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Action Modal */}
      <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Take Moderation Action</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Action Type</Label>
              <Select value={actionType} onValueChange={setActionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">Approve</SelectItem>
                  <SelectItem value="flag">Flag</SelectItem>
                  <SelectItem value="remove">Remove</SelectItem>
                  <SelectItem value="pin">Pin</SelectItem>
                  <SelectItem value="unpin">Unpin</SelectItem>
                  <SelectItem value="lock">Lock</SelectItem>
                  <SelectItem value="unlock">Unlock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reason (Optional)</Label>
              <Textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Reason for this action..."
              />
            </div>

            <div className="space-y-2">
              <Label>Additional Notes (Optional)</Label>
              <Textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Any additional notes..."
              />
            </div>

            <div className="flex gap-4">
              <Button onClick={takeAction} className="flex-1">
                Take Action
              </Button>
              <Button variant="outline" onClick={() => setActionModalOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}