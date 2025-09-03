import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowUpRight, AlertTriangle } from 'lucide-react';

interface ComplaintEscalationDialogProps {
  complaintId: string;
  currentCategory: string;
  onEscalationCreated?: () => void;
  trigger?: React.ReactNode;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
}

const DEPARTMENT_ROLES = {
  maintenance: 'maintenance_staff',
  security: 'security_officer', 
  facilities: 'facility_manager',
  general: 'community_admin',
  noise: 'community_admin'
};

export default function ComplaintEscalationDialog({ 
  complaintId, 
  currentCategory, 
  onEscalationCreated,
  trigger 
}: ComplaintEscalationDialogProps) {
  const { language, user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);

  const [formData, setFormData] = useState({
    to_department: '',
    escalated_to: '',
    escalation_reason: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen && formData.to_department) {
      fetchStaffForDepartment(formData.to_department);
    }
  }, [isOpen, formData.to_department]);

  const fetchStaffForDepartment = async (department: string) => {
    const role = DEPARTMENT_ROLES[department as keyof typeof DEPARTMENT_ROLES];
    if (!role) return;

    try {
      const { data, error } = await supabase
        .from('enhanced_user_roles')
        .select(`
          user_id,
          profiles(full_name, email)
        `)
        .eq('role', role as any)
        .eq('is_active', true);

      if (error) throw error;

      const staff = (data || []).map((item: any) => ({
        id: item.user_id,
        name: item.profiles?.full_name || item.profiles?.email || 'Unknown',
        role: role
      }));

      setStaffMembers(staff);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const handleEscalateComplaint = async () => {
    if (!user) return;

    setSubmitting(true);
    try {
      // Create escalation record
      const { error: escalationError } = await supabase
        .from('complaint_escalations')
        .insert({
          complaint_id: complaintId,
          from_department: currentCategory,
          to_department: formData.to_department,
          escalation_reason: formData.escalation_reason,
          escalated_by: user.id,
          escalated_to: formData.escalated_to || null,
          notes: formData.notes || null,
          status: 'pending'
        });

      if (escalationError) throw escalationError;

      // Update complaint category and escalation info
      const { error: updateError } = await supabase
        .from('complaints')
        .update({
          category: formData.to_department,
          escalation_level: 1, // Could be incremented if already escalated
          escalated_at: new Date().toISOString(),
          escalated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', complaintId);

      if (updateError) throw updateError;

      toast({
        title: language === 'en' ? 'Complaint escalated successfully' : 'Aduan berjaya dinaikkan',
        description: language === 'en' 
          ? `Complaint has been escalated to ${formData.to_department} department`
          : `Aduan telah dinaikkan kepada jabatan ${formData.to_department}`
      });

      // Reset form
      setFormData({
        to_department: '',
        escalated_to: '',
        escalation_reason: '',
        notes: ''
      });

      setIsOpen(false);
      onEscalationCreated?.();
    } catch (error) {
      console.error('Error escalating complaint:', error);
      toast({
        title: language === 'en' ? 'Error escalating complaint' : 'Ralat menaikkan aduan',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const departmentOptions = [
    { value: 'maintenance', label: language === 'en' ? 'Maintenance' : 'Penyelenggaraan' },
    { value: 'security', label: language === 'en' ? 'Security' : 'Keselamatan' },
    { value: 'facilities', label: language === 'en' ? 'Facilities' : 'Kemudahan' },
    { value: 'general', label: language === 'en' ? 'General/Admin' : 'Umum/Pentadbir' },
    { value: 'noise', label: language === 'en' ? 'Noise Control' : 'Kawalan Bunyi' },
  ].filter(dept => dept.value !== currentCategory);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            {language === 'en' ? 'Escalate' : 'Naikkan'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            {language === 'en' ? 'Escalate Complaint' : 'Naikkan Aduan'}
          </DialogTitle>
          <DialogDescription>
            {language === 'en' 
              ? 'Transfer this complaint to a different department for specialized handling'
              : 'Pindahkan aduan ini kepada jabatan lain untuk pengendalian khusus'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>
              {language === 'en' ? 'Escalate To Department' : 'Naikkan Kepada Jabatan'}
            </Label>
            <Select 
              value={formData.to_department} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, to_department: value, escalated_to: '' }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={language === 'en' ? 'Select department' : 'Pilih jabatan'} />
              </SelectTrigger>
              <SelectContent>
                {departmentOptions.map((dept) => (
                  <SelectItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.to_department && staffMembers.length > 0 && (
            <div className="space-y-2">
              <Label>
                {language === 'en' ? 'Assign To Specific Staff (Optional)' : 'Tugaskan Kepada Kakitangan Tertentu (Pilihan)'}
              </Label>
              <Select 
                value={formData.escalated_to} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, escalated_to: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === 'en' ? 'Select staff member' : 'Pilih ahli kakitangan'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{language === 'en' ? 'Department (unassigned)' : 'Jabatan (tidak ditugaskan)'}</SelectItem>
                  {staffMembers.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="escalation_reason">
              {language === 'en' ? 'Reason for Escalation' : 'Sebab Naikkan'}
            </Label>
            <Textarea 
              id="escalation_reason" 
              value={formData.escalation_reason}
              onChange={(e) => setFormData(prev => ({ ...prev, escalation_reason: e.target.value }))}
              placeholder={language === 'en' 
                ? 'Why is this complaint being escalated? (e.g., requires specialized expertise, outside our scope)'
                : 'Mengapa aduan ini dinaikkan? (cth: memerlukan kepakaran khusus, di luar skop kami)'
              } 
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">
              {language === 'en' ? 'Additional Notes (Optional)' : 'Nota Tambahan (Pilihan)'}
            </Label>
            <Textarea 
              id="notes" 
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder={language === 'en' 
                ? 'Any additional context or information for the receiving department'
                : 'Sebarang konteks atau maklumat tambahan untuk jabatan penerima'
              } 
              rows={2}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={submitting}
            >
              {language === 'en' ? 'Cancel' : 'Batal'}
            </Button>
            <Button 
              onClick={handleEscalateComplaint}
              disabled={submitting || !formData.to_department || !formData.escalation_reason}
            >
              {language === 'en' ? 'Escalate Complaint' : 'Naikkan Aduan'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}