import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Loader2, FileText, AlertCircle } from "lucide-react";

interface RoleRequestFormProps {
  onSuccess?: () => void;
}

type UserRole = 'resident' | 'community_leader' | 'service_provider' | 'facility_manager' | 'security' | 'community_admin' | 'district_coordinator' | 'state_admin' | 'admin';

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

const APPROVAL_REQUIREMENTS = {
  'community_voting': 'Community Voting Required',
  'business_verification': 'Business Verification Required',
  'interview_process': 'Interview Process Required', 
  'background_check': 'Background Check Required',
  'performance_evaluation': 'Performance Evaluation Required',
  'multi_level_approval': 'Multi-Level Approval Required'
};

export const RoleRequestForm: React.FC<RoleRequestFormProps> = ({ onSuccess }) => {
  const { user, language } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);
  const [selectedRoleInfo, setSelectedRoleInfo] = useState<{
    approver: string;
    requirements: string[];
  } | null>(null);

  const form = useForm({
    defaultValues: {
      requestedRole: '',
      reason: '',
      justification: '',
      attachments: ''
    }
  });

  const text = {
    en: {
      title: "Request Role Change",
      description: "Apply for a new role within your community",
      currentRole: "Current Role",
      requestedRole: "Requested Role",
      reason: "Reason for Request",
      reasonPlaceholder: "Why are you requesting this role change?",
      justification: "Additional Justification",
      justificationPlaceholder: "Provide additional details about your qualifications and experience...",
      attachments: "Supporting Documents",
      attachmentsPlaceholder: "URLs to supporting documents (comma-separated)",
      approvalInfo: "Approval Information",
      approver: "Will be reviewed by",
      requirements: "Requirements",
      submit: "Submit Request",
      submitting: "Submitting...",
      selectRole: "Select a role",
      success: "Role change request submitted successfully!",
      error: "Failed to submit role change request"
    },
    ms: {
      title: "Mohon Perubahan Peranan",
      description: "Memohon peranan baru dalam komuniti anda",
      currentRole: "Peranan Semasa",
      requestedRole: "Peranan Dimohon",
      reason: "Sebab Permohonan",
      reasonPlaceholder: "Mengapa anda memohon perubahan peranan ini?",
      justification: "Justifikasi Tambahan",
      justificationPlaceholder: "Berikan butiran tambahan tentang kelayakan dan pengalaman anda...",
      attachments: "Dokumen Sokongan",
      attachmentsPlaceholder: "URL dokumen sokongan (dipisahkan dengan koma)",
      approvalInfo: "Maklumat Kelulusan",
      approver: "Akan disemak oleh",
      requirements: "Keperluan",
      submit: "Hantar Permohonan",
      submitting: "Menghantar...",
      selectRole: "Pilih peranan",
      success: "Permohonan perubahan peranan berjaya dihantar!",
      error: "Gagal menghantar permohonan perubahan peranan"
    }
  };

  const t = text[language];

  useEffect(() => {
    fetchCurrentUserRole();
  }, [user]);

  useEffect(() => {
    if (currentUserRole) {
      setAvailableRoles(getAvailableRoles(currentUserRole));
    }
  }, [currentUserRole]);

  const fetchCurrentUserRole = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      // If no user role found, set as 'resident' by default
      setCurrentUserRole(data?.role as UserRole || 'resident');
    } catch (error) {
      console.error('Error fetching user role:', error);
      // Fallback to resident role if there's an error
      setCurrentUserRole('resident');
    }
  };

  const getAvailableRoles = (currentRole: UserRole): UserRole[] => {
    const roleHierarchy: Record<UserRole, UserRole[]> = {
      'resident': ['community_leader', 'service_provider', 'facility_manager', 'security'],
      'community_leader': ['community_admin'],
      'service_provider': ['facility_manager'],
      'facility_manager': ['community_admin'],
      'security': ['community_admin'],
      'community_admin': ['district_coordinator'],
      'district_coordinator': ['state_admin'],
      'state_admin': ['admin'],
      'admin': []
    };

    return roleHierarchy[currentRole] || [];
  };

  const handleRoleChange = async (selectedRole: UserRole) => {
    if (!currentUserRole) return;

    try {
      // Get approval info for this role transition
      const { data: approverData, error: approverError } = await supabase
        .rpc('get_required_approver_role', {
          current_user_role: currentUserRole,
          requested_user_role: selectedRole
        });

      const { data: requirementsData, error: requirementsError } = await supabase
        .rpc('get_approval_requirements', {
          current_user_role: currentUserRole,
          requested_user_role: selectedRole
        });

      if (approverError || requirementsError) {
        console.error('Error fetching approval info:', approverError || requirementsError);
        return;
      }

      setSelectedRoleInfo({
        approver: ROLE_LABELS[approverData as UserRole] || 'Admin',
        requirements: requirementsData ? requirementsData.map((req: string) => APPROVAL_REQUIREMENTS[req as keyof typeof APPROVAL_REQUIREMENTS] || req) : []
      });
    } catch (error) {
      console.error('Error getting role approval info:', error);
    }
  };

  const onSubmit = async (values: any) => {
    if (!user || !currentUserRole) return;

    setIsLoading(true);
    try {
      // Get approval requirements for this transition
      const { data: approverRole } = await supabase
        .rpc('get_required_approver_role', {
          current_user_role: currentUserRole,
          requested_user_role: values.requestedRole
        });

      const { data: requirements } = await supabase
        .rpc('get_approval_requirements', {
          current_user_role: currentUserRole,
          requested_user_role: values.requestedRole
        });

      // Create the role change request
      const { error: requestError } = await supabase
        .from('role_change_requests')
        .insert({
          requester_id: user.id,
          target_user_id: user.id,
          current_user_role: currentUserRole,
          requested_user_role: values.requestedRole,
          request_type: 'user_initiated',
          reason: values.reason,
          justification: values.justification || null,
          attachments: values.attachments ? values.attachments.split(',').map((url: string) => url.trim()) : null,
          required_approver_role: approverRole,
          approval_requirements: requirements || [],
          district_id: user.district
        });

      if (requestError) throw requestError;

      // Log the audit trail
      await supabase
        .from('role_audit_logs')
        .insert({
          user_id: user.id,
          action: 'request_created',
          old_role: currentUserRole,
          new_role: values.requestedRole,
          performed_by: user.id,
          reason: values.reason,
          district_id: user.district
        });

      toast({
        title: "Success",
        description: t.success,
      });

      form.reset();
      setSelectedRoleInfo(null);
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting role request:', error);
      toast({
        title: "Error",
        description: t.error,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUserRole) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t.title}
        </CardTitle>
        <CardDescription>
          {t.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.currentRole}</label>
                <Badge variant="secondary" className="w-fit">
                  {ROLE_LABELS[currentUserRole]}
                </Badge>
              </div>

              <FormField
                control={form.control}
                name="requestedRole"
                rules={{ required: "Please select a role" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.requestedRole} *</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleRoleChange(value as UserRole);
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t.selectRole} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {selectedRoleInfo && (
              <Card className="bg-muted/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {t.approvalInfo}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div>
                    <span className="text-sm font-medium">{t.approver}: </span>
                    <Badge variant="outline">{selectedRoleInfo.approver}</Badge>
                  </div>
                  {selectedRoleInfo.requirements.length > 0 && (
                    <div>
                      <span className="text-sm font-medium">{t.requirements}: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedRoleInfo.requirements.map((req, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <FormField
              control={form.control}
              name="reason"
              rules={{ required: "Reason is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.reason} *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t.reasonPlaceholder}
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="justification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.justification}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t.justificationPlaceholder}
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Provide additional details about your qualifications and experience
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="attachments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.attachments}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t.attachmentsPlaceholder}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    URLs to supporting documents, certifications, or portfolios (separate multiple URLs with commas)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.submitting}
                </>
              ) : (
                t.submit
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};