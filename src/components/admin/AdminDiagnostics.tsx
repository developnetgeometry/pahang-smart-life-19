import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/use-user-roles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Settings,
  User,
  Shield,
  MapPin
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminDiagnosticsProps {
  onScopeFixed?: () => void;
}

export function AdminDiagnostics({ onScopeFixed }: AdminDiagnosticsProps) {
  const { user, initializing } = useAuth();
  const { userRoles, loading: rolesLoading, hasRole } = useUserRoles();
  const { toast } = useToast();
  const [fixing, setFixing] = useState(false);

  // Check authentication status
  const isAuthenticated = !initializing && !!user?.id;
  
  // Check if user has admin roles
  const isAdmin = hasRole('community_admin') || hasRole('district_coordinator') || hasRole('state_admin');
  
  // Check scope requirements
  const hasRequiredScope = user?.active_community_id || user?.district;
  
  // Check if profile is complete
  const hasCompleteProfile = user?.display_name && user?.email;

  const diagnostics = [
    {
      label: "Authentication",
      status: isAuthenticated ? "success" : "error",
      message: isAuthenticated ? `Logged in as ${user?.email}` : "Not authenticated",
      icon: isAuthenticated ? CheckCircle : XCircle,
    },
    {
      label: "Profile Data", 
      status: hasCompleteProfile ? "success" : "warning",
      message: hasCompleteProfile ? "Profile complete" : "Missing profile information",
      icon: hasCompleteProfile ? CheckCircle : AlertTriangle,
    },
    {
      label: "Admin Role",
      status: isAdmin ? "success" : "error", 
      message: isAdmin ? `Roles: ${userRoles.join(', ')}` : "No admin roles found",
      icon: isAdmin ? Shield : XCircle,
    },
    {
      label: "Scope Access",
      status: hasRequiredScope ? "success" : "error",
      message: hasRequiredScope 
        ? `Community: ${user?.active_community_id || 'N/A'}, District: ${user?.district || 'N/A'}` 
        : "Missing community/district assignment",
      icon: hasRequiredScope ? MapPin : XCircle,
    }
  ];

  const handleAssignMyScope = async () => {
    try {
      setFixing(true);
      
      // Get user's profile data to find their community_id and district_id
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('community_id, district_id, full_name')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (!profile?.community_id || !profile?.district_id) {
        throw new Error("Your profile doesn't have community/district assignments. Contact system administrator.");
      }

      toast({
        title: "Profile Found", 
        description: `Found assignments: Community ${profile.community_id}, District ${profile.district_id}. Please refresh to apply changes.`,
      });

      if (onScopeFixed) {
        onScopeFixed();
      }

      // Refresh the page to reload auth context
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error: any) {
      console.error('Error fixing scope:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fix scope assignment",
        variant: "destructive",
      });
    } finally {
      setFixing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const hasErrors = diagnostics.some(d => d.status === 'error');
  const canCreateUsers = isAuthenticated && isAdmin && hasRequiredScope;

  return (
    <Card className="border-2 border-dashed border-gray-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Admin Diagnostics
            </CardTitle>
            <CardDescription>
              Check your authentication and permissions for user creation
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Grid */}
        <div className="grid grid-cols-2 gap-3">
          {diagnostics.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Icon className={`h-5 w-5 ${getStatusColor(item.status)}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.label}</span>
                    <Badge className={getStatusBadgeColor(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Current User Info */}
        {user && (
          <Alert>
            <User className="h-4 w-4" />
            <AlertDescription>
              <strong>Current User:</strong> {user.display_name || user.email}<br />
              <strong>User ID:</strong> {user.id}<br />
              <strong>Roles:</strong> {userRoles.length > 0 ? userRoles.join(', ') : 'None'}<br />
              <strong>Community ID:</strong> {user.active_community_id || 'Not set'}<br />
              <strong>District:</strong> {user.district || 'Not set'}
            </AlertDescription>
          </Alert>
        )}

        {/* Status Summary */}
        {canCreateUsers ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Ready:</strong> You can create new users. All requirements are met.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Issues detected:</strong> User creation may fail. Please address the issues above.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Fix Actions */}
        {!hasRequiredScope && isAdmin && (
          <div className="flex gap-2">
            <Button 
              onClick={handleAssignMyScope}
              disabled={fixing}
              className="flex-1"
            >
              {fixing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Fixing...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Check My Profile
                </>
              )}
            </Button>
          </div>
        )}

        {!isAuthenticated && (
          <Button 
            onClick={() => window.location.href = '/login'}
            className="w-full"
          >
            <User className="h-4 w-4 mr-2" />
            Go to Login
          </Button>
        )}
      </CardContent>
    </Card>
  );
}