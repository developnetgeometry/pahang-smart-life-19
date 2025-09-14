import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/use-user-roles";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye,
  EyeOff
} from "lucide-react";

interface FormData {
  name: string;
  email: string;
  phone: string;
  unit: string;
  role: string;
  status: string;
  district_id?: string;
  community_id?: string;
  // For role-specific validation
  password?: string;
  confirmPassword?: string;
  access_expires_at?: string;
}

interface CreateUserValidatorProps {
  formData: FormData;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

export function CreateUserValidator({ 
  formData, 
  isVisible = false, 
  onToggleVisibility 
}: CreateUserValidatorProps) {
  const { user } = useAuth();
  const { userRoles } = useUserRoles();
  const [validationResults, setValidationResults] = useState<any[]>([]);

  useEffect(() => {
    validateForm();
    // Only re-run when form data changes, user changes, or role list changes
    // Avoid depending on function references to prevent render loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, user?.id, JSON.stringify(userRoles)]);

  const validateForm = () => {
    const results = [];

    // Check authentication
    results.push({
      check: "Authentication",
      status: user?.id ? "success" : "error",
      message: user?.id ? "User authenticated" : "Not authenticated",
    });

    // Check admin permissions
    const isAdmin = userRoles?.some(r => (
      r === 'community_admin' || r === 'district_coordinator' || r === 'state_admin')
    );
    results.push({
      check: "Admin Role",
      status: isAdmin ? "success" : "error", 
      message: isAdmin ? "Has admin role" : "Missing admin permissions",
    });

    // Check scope
    const hasScope = user?.active_community_id || user?.district;
    results.push({
      check: "Community/District Scope",
      status: hasScope ? "success" : "error",
      message: hasScope ? "Scope assigned" : "Missing community/district assignment",
    });

    // Check required fields
    const requiredFields = ['name', 'email', 'role'];
    if (formData.role === 'resident') {
      requiredFields.push('unit');
    }

    const missingFields = requiredFields.filter(field => !formData[field]);
    results.push({
      check: "Required Fields",
      status: missingFields.length === 0 ? "success" : "warning",
      message: missingFields.length === 0 
        ? "All required fields filled" 
        : `Missing: ${missingFields.join(', ')}`,
    });

    // Check email format
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    results.push({
      check: "Email Format",
      status: formData.email ? (emailValid ? "success" : "error") : "warning",
      message: !formData.email 
        ? "Email not provided" 
        : emailValid 
        ? "Email format valid" 
        : "Invalid email format",
    });

    // Tenant (guest role) specific requirement: access expiry
    if (formData.role === 'guest') {
      if (!formData.access_expires_at) {
        results.push({
          check: "Tenant Access Expiry",
          status: "warning",
          message: "Expiration date required for tenants",
        });
      } else {
        const inFuture = new Date(formData.access_expires_at) > new Date();
        results.push({
          check: "Tenant Access Expiry",
          status: inFuture ? "success" : "error",
          message: inFuture ? "Expiry date set" : "Expiration must be in the future",
        });
      }
    }

    // Staff/admin roles: password checks
    if (formData.role && formData.role !== 'resident' && formData.role !== 'guest') {
      if (!formData.password) {
        results.push({
          check: "Password",
          status: "error",
          message: "Password required for staff roles",
        });
      } else if (formData.password.length < 8) {
        results.push({
          check: "Password",
          status: "warning",
          message: "Password should be at least 8 characters",
        });
      } else if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
        results.push({
          check: "Password",
          status: "error",
          message: "Passwords do not match",
        });
      } else {
        results.push({
          check: "Password",
          status: "success",
          message: "Password set",
        });
      }
    }

    setValidationResults(results);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const hasErrors = validationResults.some(r => r.status === 'error');
  const canCreate = !hasErrors && validationResults.some(r => r.check === "Required Fields" && r.status === "success");

  if (!isVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleVisibility}
        className="text-xs"
      >
        <Eye className="h-3 w-3 mr-1" />
        Show Validation
      </Button>
    );
  }

  return (
    <div className="space-y-3 p-4 bg-muted/20 rounded-lg border">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Creation Validation</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleVisibility}
        >
          <EyeOff className="h-3 w-3" />
        </Button>
      </div>

      <div className="space-y-2">
        {validationResults.map((result, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {getStatusIcon(result.status)}
              <span>{result.check}:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{result.message}</span>
              <Badge className={`text-xs ${getStatusColor(result.status)}`}>
                {result.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <Alert className={hasErrors ? "bg-red-50 border-red-200" : canCreate ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}>
        <AlertTriangle className={`h-4 w-4 ${hasErrors ? "text-red-600" : canCreate ? "text-green-600" : "text-yellow-600"}`} />
        <AlertDescription className={hasErrors ? "text-red-800" : canCreate ? "text-green-800" : "text-yellow-800"}>
          {hasErrors 
            ? "❌ Cannot create user - fix errors above"
            : canCreate 
            ? "✅ Ready to create user"
            : "⚠️ Complete required fields to enable creation"
          }
        </AlertDescription>
      </Alert>

      {/* Payload Preview for debugging */}
      <details className="text-xs">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
          Show Request Payload
        </summary>
        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
          {JSON.stringify({
            email: formData.email,
            full_name: formData.name,
            phone: formData.phone,
            role: formData.role,
            unit_number: formData.unit,
            district_id: formData.district_id,
            community_id: formData.community_id,
            status: formData.status,
            access_expires_at: formData.access_expires_at
          }, null, 2)}
        </pre>
      </details>
    </div>
  );
}
