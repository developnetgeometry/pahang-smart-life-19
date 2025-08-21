import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Shield, User, RefreshCw } from 'lucide-react';

export function RoleAssignmentPanel() {
  const { user } = useAuth();
  const [isAssigning, setIsAssigning] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const assignSecurityRole = async () => {
    if (!user) return;
    
    setIsAssigning(true);
    setMessage(null);
    
    try {
      // Remove existing roles first
      const { error: deleteError } = await supabase
        .from('enhanced_user_roles')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Add security officer role
      const { error: insertError } = await supabase
        .from('enhanced_user_roles')
        .insert({
          user_id: user.id,
          role: 'security_officer',
          is_active: true,
          assigned_by: user.id,
          notes: 'Test security officer assignment'
        });

      if (insertError) throw insertError;

      setMessage({ 
        type: 'success', 
        text: 'Security officer role assigned successfully! Please refresh the page to see changes.' 
      });
      
      // Auto-refresh after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error assigning security role:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to assign role: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const assignCommunityAdminRole = async () => {
    if (!user) return;
    
    setIsAssigning(true);
    setMessage(null);
    
    try {
      // Remove existing roles first
      const { error: deleteError } = await supabase
        .from('enhanced_user_roles')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Add community admin role
      const { error: insertError } = await supabase
        .from('enhanced_user_roles')
        .insert({
          user_id: user.id,
          role: 'community_admin',
          is_active: true,
          assigned_by: user.id,
          notes: 'Test community admin assignment'
        });

      if (insertError) throw insertError;

      setMessage({ 
        type: 'success', 
        text: 'Community admin role assigned successfully! Please refresh the page to see changes.' 
      });
      
      // Auto-refresh after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error assigning community admin role:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to assign role: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    } finally {
      setIsAssigning(false);
    }
  };

  if (!user) {
    return (
      <Alert>
        <User className="h-4 w-4" />
        <AlertDescription>
          Please login to assign roles.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Role Assignment Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Current user: {user.email}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Security Officer Role</h4>
            <div className="space-y-2">
              <Badge variant="outline">Level 6 - Security Functions</Badge>
              <Button 
                onClick={assignSecurityRole}
                disabled={isAssigning}
                className="w-full flex items-center gap-2"
              >
                {isAssigning ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4" />
                )}
                Assign Security Officer Role
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Community Admin Role</h4>
            <div className="space-y-2">
              <Badge variant="outline">Level 8 - All Functions</Badge>
              <Button 
                onClick={assignCommunityAdminRole}
                disabled={isAssigning}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                {isAssigning ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                Assign Community Admin Role
              </Button>
            </div>
          </div>
        </div>

        {message && (
          <Alert className={message.type === 'success' ? 'border-green-500' : 'border-red-500'}>
            <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground">
          <p>• Security Officer: Access to CCTV, visitor security, panic alerts</p>
          <p>• Community Admin: Access to all functions including user management</p>
        </div>
      </CardContent>
    </Card>
  );
}