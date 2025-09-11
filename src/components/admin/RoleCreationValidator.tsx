import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getRoleSpecificFunction, isRoleSupported } from "@/lib/user-creation-utils";
import { toast } from "@/hooks/use-toast";

interface ValidationResult {
  role: string;
  functionName: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  timestamp?: Date;
}

export default function RoleCreationValidator() {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const testRoles = [
    'resident',
    'guest', 
    'security_officer',
    'facility_manager',
    'maintenance_staff',
    'community_admin',
    'district_coordinator',
    'state_admin'
  ];

  const validateRoleSupport = () => {
    console.log("🔍 Starting role support validation...");
    const results: ValidationResult[] = [];
    
    testRoles.forEach(role => {
      try {
        const isSupported = isRoleSupported(role);
        const functionName = getRoleSpecificFunction(role);
        
        results.push({
          role,
          functionName,
          status: isSupported ? 'success' : 'error',
          message: isSupported 
            ? `✅ Role supported → ${functionName}`
            : `❌ Role not supported`,
          timestamp: new Date()
        });
        
        console.log(`Role: ${role} | Supported: ${isSupported} | Function: ${functionName}`);
      } catch (error) {
        results.push({
          role,
          functionName: 'N/A',
          status: 'error',
          message: `❌ Error: ${error.message}`,
          timestamp: new Date()
        });
        console.error(`Role validation error for ${role}:`, error);
      }
    });
    
    setValidationResults(results);
    console.log("✅ Role support validation complete");
  };

  const testEdgeFunctionAvailability = async () => {
    console.log("🔍 Testing Edge Function availability...");
    setIsValidating(true);
    
    const newResults = [...validationResults];
    
    for (const result of newResults) {
      if (result.status === 'success') {
        try {
          console.log(`Testing function: ${result.functionName}`);
          
          // Test with minimal invalid payload to check if function exists and responds
          const { error } = await supabase.functions.invoke(result.functionName, {
            body: { test: true }
          });
          
          // We expect an error due to invalid payload, but function should exist
          if (error) {
            if (error.message.includes('Module not found') || error.message.includes('not found')) {
              result.status = 'error';
              result.message = `❌ Function not deployed: ${error.message}`;
              console.error(`Function not found: ${result.functionName}`, error);
            } else {
              result.status = 'warning';
              result.message = `⚠️ Function exists but validation failed (expected): ${error.message.substring(0, 50)}...`;
              console.log(`Function exists: ${result.functionName} (got expected validation error)`);
            }
          } else {
            result.status = 'warning';
            result.message = `⚠️ Function responded unexpectedly to test payload`;
            console.warn(`Unexpected response from: ${result.functionName}`);
          }
        } catch (error) {
          result.status = 'error';
          result.message = `❌ Function test failed: ${error.message}`;
          console.error(`Function test error for ${result.functionName}:`, error);
        }
        
        result.timestamp = new Date();
      }
    }
    
    setValidationResults([...newResults]);
    setIsValidating(false);
    console.log("✅ Edge Function availability test complete");
  };

  const validateFieldRequirements = () => {
    console.log("🔍 Validating role-specific field requirements...");
    
    const fieldRequirements = {
      resident: ['email', 'full_name', 'unit_number'],
      guest: ['email', 'full_name', 'access_expires_at'],
      security_officer: ['email', 'full_name', 'password'],
      facility_manager: ['email', 'full_name', 'password', 'status'],
      maintenance_staff: ['email', 'full_name', 'password', 'status'],
      community_admin: ['email', 'full_name', 'password', 'district_id', 'community_id'],
      district_coordinator: ['email', 'full_name', 'password', 'district_id'],
      state_admin: ['email', 'full_name', 'password']
    };

    const results: ValidationResult[] = validationResults.map(result => {
      const requirements = fieldRequirements[result.role as keyof typeof fieldRequirements];
      if (requirements) {
        return {
          ...result,
          status: 'success',
          message: `✅ Required fields: ${requirements.join(', ')}`,
          timestamp: new Date()
        };
      }
      return {
        ...result,
        status: 'warning', 
        message: `⚠️ No field requirements defined`,
        timestamp: new Date()
      };
    });

    setValidationResults(results);
    console.log("✅ Field requirements validation complete");
  };

  const runFullValidation = async () => {
    console.log("🚀 Starting full role creation validation suite...");
    validateRoleSupport();
    
    // Wait a moment for UI update
    setTimeout(async () => {
      await testEdgeFunctionAvailability();
      validateFieldRequirements();
      
      toast({
        title: "Validation Complete",
        description: "Role creation validation suite finished. Check results below.",
      });
      console.log("🏁 Full validation suite complete");
    }, 500);
  };

  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ValidationResult['status']) => {
    switch (status) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'pending':
        return 'outline';
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Role Creation Validation Suite
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={validateRoleSupport} variant="outline" size="sm">
            Test Role Support
          </Button>
          <Button 
            onClick={testEdgeFunctionAvailability} 
            variant="outline" 
            size="sm"
            disabled={validationResults.length === 0 || isValidating}
          >
            Test Functions {isValidating && <Clock className="ml-2 h-4 w-4 animate-spin" />}
          </Button>
          <Button onClick={validateFieldRequirements} variant="outline" size="sm">
            Test Field Requirements
          </Button>
          <Button onClick={runFullValidation} className="ml-auto">
            Run Full Validation
          </Button>
        </div>

        {validationResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Validation Results:</h4>
            {validationResults.map((result, index) => (
              <Alert key={index}>
                <div className="flex items-start gap-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getStatusColor(result.status)}>
                        {result.role}
                      </Badge>
                      {result.functionName !== 'N/A' && (
                        <code className="text-xs bg-muted px-1 rounded">
                          {result.functionName}
                        </code>
                      )}
                    </div>
                    <AlertDescription className="text-sm">
                      {result.message}
                    </AlertDescription>
                    {result.timestamp && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {result.timestamp.toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This validation suite tests role mapping, Edge Function availability, and field requirements.
            Use this during development to ensure all role creation paths work correctly.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}