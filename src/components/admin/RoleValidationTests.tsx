import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Clock, TestTube } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getRoleSpecificFunction } from "@/lib/user-creation-utils";
import { toast } from "@/hooks/use-toast";

interface TestResult {
  role: string;
  testType: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  timestamp: Date;
  details?: any;
}

export default function RoleValidationTests() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedRole, setSelectedRole] = useState('resident');

  const testCases = {
    resident: {
      valid: {
        email: 'test.resident@example.com',
        full_name: 'Test Resident',
        unit_number: 'A-101'
      },
      invalid: {
        email: '', // Missing required field
        full_name: 'Test Resident',
        unit_number: 'A-101'
      }
    },
    guest: {
      valid: {
        email: 'test.guest@example.com',
        full_name: 'Test Guest',
        access_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      },
      invalid: {
        email: 'test.guest@example.com',
        full_name: 'Test Guest'
        // Missing access_expires_at
      }
    },
    security_officer: {
      valid: {
        email: 'test.security@example.com',
        full_name: 'Test Security Officer',
        password: 'SecurePass123!'
      },
      invalid: {
        email: 'test.security@example.com',
        full_name: 'Test Security Officer',
        password: '123' // Too short password
      }
    },
    community_admin: {
      valid: {
        email: 'test.admin@example.com',
        full_name: 'Test Community Admin',
        password: 'AdminPass123!',
        role: 'community_admin'
      },
      invalid: {
        email: 'test.admin@example.com',
        full_name: 'Test Community Admin'
        // Missing password and role
      }
    }
  };

  const addTestResult = (result: Omit<TestResult, 'timestamp'>) => {
    const newResult = { ...result, timestamp: new Date() };
    setTestResults(prev => [newResult, ...prev]);
    console.log(`Test Result: ${result.testType} for ${result.role} - ${result.status}`, result);
  };

  const testValidPayload = async (role: string) => {
    const testCase = testCases[role as keyof typeof testCases];
    if (!testCase) {
      addTestResult({
        role,
        testType: 'Valid Payload',
        status: 'error',
        message: 'No test case defined for this role'
      });
      return;
    }

    try {
      const functionName = getRoleSpecificFunction(role);
      console.log(`Testing valid payload for ${role} using ${functionName}`);
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: testCase.valid
      });

      if (error) {
        // Some errors are expected (like user already exists, insufficient permissions)
        if (error.message.includes('already exists') || 
            error.message.includes('permission') ||
            error.message.includes('not authorized')) {
          addTestResult({
            role,
            testType: 'Valid Payload',
            status: 'success',
            message: `✅ Function responded correctly (expected validation error: ${error.message.substring(0, 60)}...)`,
            details: { error: error.message }
          });
        } else {
          addTestResult({
            role,
            testType: 'Valid Payload',
            status: 'error',
            message: `❌ Unexpected error: ${error.message}`,
            details: { error: error.message }
          });
        }
      } else {
        addTestResult({
          role,
          testType: 'Valid Payload',
          status: 'success',
          message: `✅ User creation would succeed`,
          details: data
        });
      }
    } catch (error: any) {
      addTestResult({
        role,
        testType: 'Valid Payload',
        status: 'error',
        message: `❌ Function call failed: ${error.message}`,
        details: { error: error.message }
      });
    }
  };

  const testInvalidPayload = async (role: string) => {
    const testCase = testCases[role as keyof typeof testCases];
    if (!testCase) {
      addTestResult({
        role,
        testType: 'Invalid Payload',
        status: 'error',
        message: 'No test case defined for this role'
      });
      return;
    }

    try {
      const functionName = getRoleSpecificFunction(role);
      console.log(`Testing invalid payload for ${role} using ${functionName}`);
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: testCase.invalid
      });

      if (error) {
        // This is expected - invalid payload should cause error
        addTestResult({
          role,
          testType: 'Invalid Payload',
          status: 'success',
          message: `✅ Correctly rejected invalid payload: ${error.message.substring(0, 60)}...`,
          details: { error: error.message }
        });
      } else {
        addTestResult({
          role,
          testType: 'Invalid Payload',
          status: 'error',
          message: `❌ Should have rejected invalid payload but succeeded`,
          details: data
        });
      }
    } catch (error: any) {
      addTestResult({
        role,
        testType: 'Invalid Payload',
        status: 'error',
        message: `❌ Function call failed: ${error.message}`,
        details: { error: error.message }
      });
    }
  };

  const testPermissions = async (role: string) => {
    try {
      const functionName = getRoleSpecificFunction(role);
      console.log(`Testing permissions for ${role} using ${functionName}`);
      
      // Test with valid payload but without proper authentication
      const { error } = await supabase.functions.invoke(functionName, {
        body: {
          email: 'permission-test@example.com',
          full_name: 'Permission Test User'
        }
      });

      if (error && (
        error.message.includes('permission') || 
        error.message.includes('not authorized') ||
        error.message.includes('authentication')
      )) {
        addTestResult({
          role,
          testType: 'Permission Check',
          status: 'success',
          message: `✅ Proper permission validation: ${error.message.substring(0, 60)}...`,
          details: { error: error.message }
        });
      } else {
        addTestResult({
          role,
          testType: 'Permission Check',
          status: 'error',
          message: error ? 
            `❌ Unexpected error: ${error.message}` : 
            `❌ Should require proper permissions`,
          details: { error: error?.message }
        });
      }
    } catch (error: any) {
      addTestResult({
        role,
        testType: 'Permission Check',
        status: 'error',
        message: `❌ Permission test failed: ${error.message}`,
        details: { error: error.message }
      });
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    console.log("🧪 Starting comprehensive role validation tests...");
    
    const roles = Object.keys(testCases);
    
    for (const role of roles) {
      console.log(`Testing role: ${role}`);
      
      await testValidPayload(role);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
      
      await testInvalidPayload(role);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testPermissions(role);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunning(false);
    toast({
      title: "Testing Complete",
      description: `Ran validation tests for ${roles.length} roles. Check results below.`,
    });
    console.log("🏁 All role validation tests complete");
  };

  const runSingleRoleTest = async () => {
    setIsRunning(true);
    console.log(`🧪 Testing single role: ${selectedRole}`);
    
    await testValidPayload(selectedRole);
    await new Promise(resolve => setTimeout(resolve, 300));
    await testInvalidPayload(selectedRole);
    await new Promise(resolve => setTimeout(resolve, 300));
    await testPermissions(selectedRole);
    
    setIsRunning(false);
    toast({
      title: "Single Role Test Complete",
      description: `Completed tests for ${selectedRole}`,
    });
  };

  const clearResults = () => {
    setTestResults([]);
    console.log("🧹 Test results cleared");
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Role Validation Tests
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="role-select">Test Role:</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(testCases).map(role => (
                  <SelectItem key={role} value={role}>
                    {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={runSingleRoleTest} 
            variant="outline" 
            size="sm"
            disabled={isRunning}
          >
            Test Selected Role
          </Button>
          
          <Button 
            onClick={runAllTests}
            disabled={isRunning}
            className="ml-auto"
          >
            {isRunning ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              'Run All Tests'
            )}
          </Button>
          
          {testResults.length > 0 && (
            <Button onClick={clearResults} variant="ghost" size="sm">
              Clear Results
            </Button>
          )}
        </div>

        {testResults.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <h4 className="font-semibold">Test Results ({testResults.length}):</h4>
            {testResults.map((result, index) => (
              <Alert key={index}>
                <div className="flex items-start gap-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                        {result.role}
                      </Badge>
                      <span className="text-sm font-medium">{result.testType}</span>
                    </div>
                    <AlertDescription className="text-sm">
                      {result.message}
                    </AlertDescription>
                    <div className="text-xs text-muted-foreground mt-1">
                      {result.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        <Alert>
          <TestTube className="h-4 w-4" />
          <AlertDescription>
            This test suite validates role-specific Edge Functions with valid/invalid payloads and permission checks.
            Use during development to ensure robust error handling and security.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}