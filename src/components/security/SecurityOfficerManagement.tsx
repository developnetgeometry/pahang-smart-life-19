import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, Edit2, Trash2, Shield, Phone, Mail, User } from 'lucide-react';

interface SecurityOfficer {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  created_at: string;
  is_active: boolean;
}

interface SecurityOfficerForm {
  email: string;
  full_name: string;
  phone: string;
  password: string;
}

export default function SecurityOfficerManagement() {
  const { user } = useAuth();
  const [officers, setOfficers] = useState<SecurityOfficer[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<SecurityOfficer | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState<SecurityOfficerForm>({
    email: '',
    full_name: '',
    phone: '',
    password: ''
  });

  useEffect(() => {
    fetchSecurityOfficers();
  }, []);

  const fetchSecurityOfficers = async () => {
    try {
      // Get user's community first
      const { data: profile } = await supabase
        .from('profiles')
        .select('community_id')
        .eq('id', user?.id)
        .single();

      if (!profile?.community_id) {
        toast.error('Community not found');
        return;
      }

      // Get security officer role assignments
      const { data: roleAssignments, error: roleError } = await supabase
        .from('enhanced_user_roles')
        .select('user_id, is_active')
        .eq('role', 'security_officer');

      if (roleError) throw roleError;

      if (!roleAssignments || roleAssignments.length === 0) {
        setOfficers([]);
        return;
      }

      // Get profiles for these users in the same community
      const userIds = roleAssignments.map(r => r.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone, created_at')
        .eq('community_id', profile.community_id)
        .in('id', userIds);

      if (profileError) throw profileError;

      // Combine the data
      const officers = profiles?.map(profile => {
        const roleData = roleAssignments.find(r => r.user_id === profile.id);
        return {
          id: profile.id,
          email: profile.email || '',
          full_name: profile.full_name || '',
          phone: profile.phone || '',
          created_at: profile.created_at || '',
          is_active: roleData?.is_active || false
        };
      }) || [];

      setOfficers(officers);
    } catch (error) {
      console.error('Error fetching security officers:', error);
      toast.error('Failed to load security officers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOfficer = async () => {
    if (!formData.email || !formData.full_name || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      const { error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          phone: formData.phone,
          role: 'security_officer'
        }
      });

      if (error) throw error;

      toast.success('Security officer created successfully');
      setShowCreateDialog(false);
      setFormData({ email: '', full_name: '', phone: '', password: '' });
      fetchSecurityOfficers();
    } catch (error) {
      console.error('Error creating security officer:', error);
      toast.error('Failed to create security officer');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateOfficer = async () => {
    if (!editing || !editing.full_name) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editing.full_name,
          phone: editing.phone
        })
        .eq('id', editing.id);

      if (error) throw error;

      toast.success('Security officer updated successfully');
      setEditing(null);
      fetchSecurityOfficers();
    } catch (error) {
      console.error('Error updating security officer:', error);
      toast.error('Failed to update security officer');
    }
  };

  const handleDeactivateOfficer = async (officerId: string) => {
    try {
      const { error } = await supabase
        .from('enhanced_user_roles')
        .update({ is_active: false })
        .eq('user_id', officerId)
        .eq('role', 'security_officer');

      if (error) throw error;

      toast.success('Security officer deactivated successfully');
      fetchSecurityOfficers();
    } catch (error) {
      console.error('Error deactivating security officer:', error);
      toast.error('Failed to deactivate security officer');
    }
  };

  const handleReactivateOfficer = async (officerId: string) => {
    try {
      const { error } = await supabase
        .from('enhanced_user_roles')
        .update({ is_active: true })
        .eq('user_id', officerId)
        .eq('role', 'security_officer');

      if (error) throw error;

      toast.success('Security officer reactivated successfully');
      fetchSecurityOfficers();
    } catch (error) {
      console.error('Error reactivating security officer:', error);
      toast.error('Failed to reactivate security officer');
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Security Officers</CardTitle>
              <CardDescription>
                Manage security officers for this community
              </CardDescription>
            </div>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Security Officer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register New Security Officer</DialogTitle>
                <DialogDescription>
                  Create a new security officer account for this community.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="officer@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Officer Name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+60123456789"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Secure password"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateOfficer} disabled={creating}>
                  {creating ? 'Creating...' : 'Create Officer'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading security officers...</div>
        ) : officers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No security officers registered yet</p>
            <p className="text-sm">Click "Add Security Officer" to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {officers.map((officer) => (
              <div key={officer.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{officer.full_name}</h4>
                      <Badge variant={officer.is_active ? 'default' : 'secondary'}>
                        {officer.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {officer.email}
                      </div>
                      {officer.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {officer.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog open={editing?.id === officer.id} onOpenChange={(open) => !open && setEditing(null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setEditing(officer)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Security Officer</DialogTitle>
                        <DialogDescription>
                          Update security officer information.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="edit_full_name">Full Name *</Label>
                          <Input
                            id="edit_full_name"
                            value={editing?.full_name || ''}
                            onChange={(e) => setEditing(prev => prev ? ({ ...prev, full_name: e.target.value }) : null)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="edit_phone">Phone</Label>
                          <Input
                            id="edit_phone"
                            value={editing?.phone || ''}
                            onChange={(e) => setEditing(prev => prev ? ({ ...prev, phone: e.target.value }) : null)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setEditing(null)}>
                          Cancel
                        </Button>
                        <Button onClick={handleUpdateOfficer}>
                          Update Officer
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {officer.is_active ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Deactivate Security Officer</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to deactivate {officer.full_name}? They will lose access to security features but can be reactivated later.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeactivateOfficer(officer.id)}>
                            Deactivate
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => handleReactivateOfficer(officer.id)}>
                      Reactivate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}