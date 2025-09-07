import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ComplaintResponseDialogProps {
  complaintId: string;
  currentStatus: string;
  onResponseAdded: () => void;
  trigger?: React.ReactNode;
}

export default function ComplaintResponseDialog({ 
  complaintId, 
  currentStatus, 
  onResponseAdded,
  trigger 
}: ComplaintResponseDialogProps) {
  const { language, user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [responseType, setResponseType] = useState('update');
  const [statusUpdate, setStatusUpdate] = useState<'pending' | 'in_progress' | 'resolved' | 'closed'>(currentStatus as any);
  const [isInternal, setIsInternal] = useState(false);
  const [internalComments, setInternalComments] = useState('');

  const handleSubmitResponse = async () => {
    if (!responseText.trim() || !user) return;

    setSubmitting(true);
    try {
      // Insert the response
      const { error: responseError } = await supabase
        .from('complaint_responses')
        .insert({
          complaint_id: complaintId,
          responder_id: user.id,
          response_text: responseText.trim(),
          response_type: responseType,
          is_internal: isInternal,
          status_update: responseType === 'status_change' ? statusUpdate : null,
          internal_comments: isInternal && internalComments.trim() ? internalComments.trim() : null
        });

      if (responseError) throw responseError;

      // If status is being updated, update the complaint status
      if (responseType === 'status_change' && statusUpdate !== currentStatus) {
        const { error: statusError } = await supabase
          .from('complaints')
          .update({ 
            status: statusUpdate,
            updated_at: new Date().toISOString(),
            ...(statusUpdate === 'resolved' ? { resolved_at: new Date().toISOString() } : {})
          })
          .eq('id', complaintId);

        if (statusError) throw statusError;
      }

      toast({
        title: language === 'en' ? 'Response sent successfully' : 'Respons berjaya dihantar',
        description: language === 'en' ? 'Your response has been recorded' : 'Respons anda telah direkodkan',
      });

      // Reset form and close dialog
      setResponseText('');
      setResponseType('update');
      setStatusUpdate(currentStatus as any);
      setIsInternal(false);
      setInternalComments('');
      setOpen(false);
      onResponseAdded();

    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        title: language === 'en' ? 'Error sending response' : 'Ralat menghantar respons',
        description: language === 'en' ? 'Failed to send response. Please try again.' : 'Gagal menghantar respons. Sila cuba lagi.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <MessageSquare className="h-4 w-4 mr-2" />
      {language === 'en' ? 'Respond' : 'Balas'}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {language === 'en' ? 'Respond to Complaint' : 'Balas Aduan'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{language === 'en' ? 'Response Type' : 'Jenis Respons'}</Label>
            <Select value={responseType} onValueChange={setResponseType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="update">
                  {language === 'en' ? 'General Update' : 'Kemaskini Umum'}
                </SelectItem>
                <SelectItem value="request_info">
                  {language === 'en' ? 'Request Information' : 'Minta Maklumat'}
                </SelectItem>
                <SelectItem value="status_change">
                  {language === 'en' ? 'Status Update' : 'Kemaskini Status'}
                </SelectItem>
                <SelectItem value="resolution">
                  {language === 'en' ? 'Resolution' : 'Penyelesaian'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {responseType === 'status_change' && (
            <div className="space-y-2">
              <Label>{language === 'en' ? 'New Status' : 'Status Baru'}</Label>
              <Select value={statusUpdate} onValueChange={(value) => setStatusUpdate(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    {language === 'en' ? 'Pending' : 'Menunggu'}
                  </SelectItem>
                  <SelectItem value="in_progress">
                    {language === 'en' ? 'In Progress' : 'Dalam Proses'}
                  </SelectItem>
                  <SelectItem value="resolved">
                    {language === 'en' ? 'Resolved' : 'Diselesaikan'}
                  </SelectItem>
                  <SelectItem value="closed">
                    {language === 'en' ? 'Closed' : 'Ditutup'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="response">
              {language === 'en' ? 'Response Message' : 'Mesej Respons'}
            </Label>
            <Textarea
              id="response"
              placeholder={language === 'en' 
                ? 'Enter your response to the complainant...'
                : 'Masukkan respons anda kepada pengadu...'
              }
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="internal"
              checked={isInternal}
              onCheckedChange={setIsInternal}
            />
            <Label htmlFor="internal" className="text-sm">
              {language === 'en' 
                ? 'Add internal comments (visible only to staff)'
                : 'Tambah komen dalaman (hanya kelihatan kepada kakitangan)'
              }
            </Label>
          </div>

          {isInternal && (
            <div className="space-y-2">
              <Label htmlFor="internal-comments">
                {language === 'en' ? 'Internal Comments' : 'Komen Dalaman'}
              </Label>
              <Textarea
                id="internal-comments"
                placeholder={language === 'en' 
                  ? 'Add internal notes for staff only...'
                  : 'Tambah nota dalaman untuk kakitangan sahaja...'
                }
                value={internalComments}
                onChange={(e) => setInternalComments(e.target.value)}
                rows={3}
                className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
              />
              <p className="text-xs text-muted-foreground">
                {language === 'en'
                  ? 'This field is only visible to staff members and will not be shown to the complainant.'
                  : 'Medan ini hanya kelihatan kepada kakitangan dan tidak akan ditunjukkan kepada pengadu.'
                }
              </p>
            </div>
          )}

          {responseType === 'resolution' && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <p className="text-sm text-green-700 dark:text-green-300">
                {language === 'en'
                  ? 'This response will mark the complaint as resolved. Please provide a detailed resolution summary.'
                  : 'Respons ini akan menandakan aduan sebagai selesai. Sila berikan ringkasan penyelesaian yang terperinci.'
                }
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              {language === 'en' ? 'Cancel' : 'Batal'}
            </Button>
            <Button 
              onClick={handleSubmitResponse}
              disabled={submitting || !responseText.trim()}
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Send className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Send Response' : 'Hantar Respons'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}