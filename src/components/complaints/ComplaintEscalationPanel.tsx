import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, ArrowUp, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ComplaintEscalationPanelProps {
  complaintId: string;
  currentEscalationLevel: number;
  category: string;
  title: string;
  status: string;
  createdAt: string;
  escalatedAt?: string;
  autoEscalated?: boolean;
  onEscalationChange?: () => void;
}

export default function ComplaintEscalationPanel({
  complaintId,
  currentEscalationLevel,
  category,
  title,
  status,
  createdAt,
  escalatedAt,
  autoEscalated,
  onEscalationChange
}: ComplaintEscalationPanelProps) {
  const { user, language } = useAuth();
  const { toast } = useToast();
  const [isEscalating, setIsEscalating] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const text = {
    en: {
      title: 'Escalation Management',
      currentLevel: 'Current Level',
      escalateButton: 'Escalate Complaint',
      escalateTitle: 'Escalate Complaint',
      escalateDescription: 'Escalating will notify higher-level management and increase priority.',
      reasonLabel: 'Escalation Reason',
      reasonPlaceholder: 'Please provide a reason for escalation...',
      escalate: 'Escalate',
      cancel: 'Cancel',
      maxLevel: 'Maximum escalation level reached',
      autoEscalated: 'Auto-escalated due to timeout',
      escalatedAt: 'Escalated at',
      createdAt: 'Created at',
      levels: {
        0: 'Level 0 - Initial',
        1: 'Level 1 - Supervisor',
        2: 'Level 2 - Management'
      },
      escalationPath: {
        maintenance: {
          0: 'Maintenance Staff → Facility Manager',
          1: 'Facility Manager → Community Admin',
          2: 'Community Admin → District Coordinator'
        },
        security: {
          0: 'Security Officer → Community Admin',
          1: 'Community Admin → District Coordinator',
          2: 'District Coordinator → State Admin'
        },
        facilities: {
          0: 'Facility Manager → Community Admin',
          1: 'Community Admin → District Coordinator',
          2: 'District Coordinator → State Admin'
        },
        general: {
          0: 'Community Admin',
          1: 'District Coordinator',
          2: 'State Admin'
        }
      }
    },
    ms: {
      title: 'Pengurusan Peningkatan',
      currentLevel: 'Tahap Semasa',
      escalateButton: 'Naiktaraf Aduan',
      escalateTitle: 'Naiktaraf Aduan',
      escalateDescription: 'Peningkatan akan memberitahu pengurusan tahap tinggi dan meningkatkan keutamaan.',
      reasonLabel: 'Sebab Peningkatan',
      reasonPlaceholder: 'Sila berikan sebab untuk peningkatan...',
      escalate: 'Naiktaraf',
      cancel: 'Batal',
      maxLevel: 'Tahap peningkatan maksimum dicapai',
      autoEscalated: 'Auto-dinaikraf kerana tamat masa',
      escalatedAt: 'Dinaikraf pada',
      createdAt: 'Dicipta pada',
      levels: {
        0: 'Tahap 0 - Awal',
        1: 'Tahap 1 - Penyelia',
        2: 'Tahap 2 - Pengurusan'
      },
      escalationPath: {
        maintenance: {
          0: 'Kakitangan Penyelenggaraan → Pengurus Kemudahan',
          1: 'Pengurus Kemudahan → Admin Komuniti',
          2: 'Admin Komuniti → Koordinator Daerah'
        },
        security: {
          0: 'Pegawai Keselamatan → Admin Komuniti',
          1: 'Admin Komuniti → Koordinator Daerah',
          2: 'Koordinator Daerah → Admin Negeri'
        },
        facilities: {
          0: 'Pengurus Kemudahan → Admin Komuniti',
          1: 'Admin Komuniti → Koordinator Daerah',
          2: 'Koordinator Daerah → Admin Negeri'
        },
        general: {
          0: 'Admin Komuniti',
          1: 'Koordinator Daerah',
          2: 'Admin Negeri'
        }
      }
    }
  };

  const t = text[language];

  const handleEscalation = async () => {
    if (!user || !escalationReason.trim()) {
      toast({
        title: language === 'en' ? 'Please provide a reason' : 'Sila berikan sebab',
        variant: 'destructive'
      });
      return;
    }

    setIsEscalating(true);
    try {
      const { error } = await supabase
        .from('complaints')
        .update({
          escalation_level: currentEscalationLevel + 1,
          escalated_at: new Date().toISOString(),
          escalated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', complaintId);

      if (error) throw error;

      // Log the escalation reason
      await supabase
        .from('audit_logs')
        .insert({
          table_name: 'complaints',
          action: 'manual_escalate',
          record_id: complaintId,
          user_id: user.id,
          new_values: {
            escalation_level: currentEscalationLevel + 1,
            reason: escalationReason,
            escalated_by: user.id
          }
        });

      toast({
        title: language === 'en' ? 'Complaint escalated successfully' : 'Aduan berjaya dinaikarf',
      });

      setIsDialogOpen(false);
      setEscalationReason('');
      onEscalationChange?.();
    } catch (error) {
      console.error('Error escalating complaint:', error);
      toast({
        title: language === 'en' ? 'Error escalating complaint' : 'Ralat menaikarf aduan',
        variant: 'destructive'
      });
    } finally {
      setIsEscalating(false);
    }
  };

  const getEscalationLevelColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-green-500';
      case 1: return 'bg-yellow-500';
      case 2: return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getNextEscalationPath = () => {
    const categoryPath = t.escalationPath[category as keyof typeof t.escalationPath] || t.escalationPath.general;
    return categoryPath[currentEscalationLevel as keyof typeof categoryPath];
  };

  const canEscalate = currentEscalationLevel < 2 && status !== 'resolved' && status !== 'closed';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          {t.title}
        </CardTitle>
        <CardDescription>
          {t.currentLevel}: <Badge className={`text-white ${getEscalationLevelColor(currentEscalationLevel)}`}>
            {t.levels[currentEscalationLevel as keyof typeof t.levels]}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {t.createdAt}
            </div>
            <p className="font-medium">{new Date(createdAt).toLocaleString()}</p>
          </div>
          {escalatedAt && (
            <div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <ArrowUp className="h-4 w-4" />
                {t.escalatedAt}
              </div>
              <p className="font-medium">{new Date(escalatedAt).toLocaleString()}</p>
              {autoEscalated && (
                <Badge variant="outline" className="mt-1 text-xs">
                  {t.autoEscalated}
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-1">
            {language === 'en' ? 'Current Assignment Path:' : 'Laluan Tugasan Semasa:'}
          </p>
          <p className="text-sm text-muted-foreground">
            {getNextEscalationPath()}
          </p>
        </div>

        {canEscalate ? (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" variant="outline">
                <ArrowUp className="h-4 w-4 mr-2" />
                {t.escalateButton}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.escalateTitle}</DialogTitle>
                <DialogDescription>
                  {t.escalateDescription}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reason">{t.reasonLabel}</Label>
                  <Textarea
                    id="reason"
                    placeholder={t.reasonPlaceholder}
                    value={escalationReason}
                    onChange={(e) => setEscalationReason(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isEscalating}
                  >
                    {t.cancel}
                  </Button>
                  <Button
                    onClick={handleEscalation}
                    disabled={isEscalating || !escalationReason.trim()}
                  >
                    {isEscalating ? 'Processing...' : t.escalate}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <div className="text-center text-muted-foreground text-sm">
            {currentEscalationLevel >= 2 ? t.maxLevel : 'Cannot escalate resolved/closed complaints'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}