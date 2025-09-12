import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

interface GuestPermission {
  feature_name: string;
  is_enabled: boolean;
}

const AVAILABLE_FEATURES = [
  { name: 'marketplace', label: 'Marketplace', description: 'Allow guests to buy and sell items' },
  { name: 'bookings', label: 'Facility Bookings', description: 'Allow guests to book community facilities' },
  { name: 'announcements', label: 'Announcements', description: 'Allow guests to view community announcements' },
  { name: 'complaints', label: 'Complaints', description: 'Allow guests to submit complaints' },
  { name: 'discussions', label: 'Discussions', description: 'Allow guests to participate in community discussions' },
  { name: 'facilities', label: 'Facilities Info', description: 'Allow guests to view facility information' },
  { name: 'events', label: 'Events', description: 'Allow guests to view and join community events' },
  { name: 'directory', label: 'Directory', description: 'Allow guests to access community directory' },
];

export default function GuestPermissionsManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<GuestPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPermissions();
  }, [user]);

  const fetchPermissions = async () => {
    if (!user) return;

    try {
      // Get user's community
      const { data: profile } = await supabase
        .from('profiles')
        .select('community_id')
        .eq('id', user.id)
        .single();

      if (!profile?.community_id) {
        setLoading(false);
        return;
      }

      // Get existing permissions
      const { data, error } = await supabase
        .rpc('get_guest_permissions_for_community', {
          p_community_id: profile.community_id
        });

      if (error) throw error;

      setPermissions(data || []);
    } catch (error) {
      console.error('Error fetching guest permissions:', error);
      toast({
        title: "Error",
        description: "Failed to load guest permissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (featureName: string, enabled: boolean) => {
    setPermissions(prev =>
      prev.map(p =>
        p.feature_name === featureName
          ? { ...p, is_enabled: enabled }
          : p
      )
    );
  };

  const savePermissions = async () => {
    setSaving(true);
    
    try {
      // Get user's community
      const { data: profile } = await supabase
        .from('profiles')
        .select('community_id')
        .eq('id', user.id)
        .single();

      if (!profile?.community_id) {
        throw new Error('Community not found');
      }

      // Update permissions
      for (const permission of permissions) {
        const { error } = await supabase
          .from('guest_permissions')
          .upsert({
            community_id: profile.community_id,
            feature_name: permission.feature_name,
            is_enabled: permission.is_enabled,
            created_by: user.id,
          }, {
            onConflict: 'community_id,feature_name'
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Guest permissions updated successfully",
      });
    } catch (error) {
      console.error('Error saving guest permissions:', error);
      toast({
        title: "Error",
        description: "Failed to save guest permissions",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Guest Permissions</CardTitle>
        <CardDescription>
          Control what features guest users can access in your community
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {AVAILABLE_FEATURES.map((feature) => {
            const permission = permissions.find(p => p.feature_name === feature.name);
            const isEnabled = permission?.is_enabled || false;

            return (
              <div key={feature.name} className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                <div className="flex-1 space-y-1">
                  <Label htmlFor={feature.name} className="text-base font-medium">
                    {feature.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
                <Switch
                  id={feature.name}
                  checked={isEnabled}
                  onCheckedChange={(checked) => handlePermissionChange(feature.name, checked)}
                />
              </div>
            );
          })}
        </div>

        <div className="flex justify-end">
          <Button onClick={savePermissions} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Permissions
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}