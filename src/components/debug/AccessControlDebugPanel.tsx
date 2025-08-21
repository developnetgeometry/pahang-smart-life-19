import { useState } from 'react';
import { useAccessControl } from '@/hooks/use-access-control';
import { useUserRoles } from '@/hooks/use-user-roles';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AccessControlTester, roleTestScenarios, testMarketplaceAccess, testRouteProtection, runRoleCombinationTests } from '@/utils/access-control-tests';
import { RoleAssignmentPanel } from '@/components/debug/RoleAssignmentPanel';
import { 
  Shield, 
  User, 
  MapPin, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Info,
  Play,
  Terminal
} from 'lucide-react';

export function AccessControlDebugPanel() {
  const { user } = useAuth();
  const { userRoles, hasRole } = useUserRoles();
  const {
    userLevel,
    geographicScope,
    functionalAccess,
    canAccessLevel,
    canAccessFunction,
    canAccessGeographicScope,
    getAccessibleRoutes
  } = useAccessControl();

  const [testResults, setTestResults] = useState<any>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const runAccessControlTests = async () => {
    setIsRunningTests(true);
    console.clear();
    
    try {
      // Run comprehensive tests
      const results = await AccessControlTester.runAllTests();
      
      // Run specific feature tests
      AccessControlTester.testHierarchicalAccess();
      AccessControlTester.testGeographicScope();
      AccessControlTester.testFunctionalSpecialization();
      testMarketplaceAccess();
      testRouteProtection();
      runRoleCombinationTests();
      
      setTestResults(results);
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  if (!user) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Please login to test access control functionality.
        </AlertDescription>
      </Alert>
    );
  }

  const accessibleRoutes = getAccessibleRoutes();
  const currentScenario = roleTestScenarios.find(s => hasRole(s.role));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access Control Debug Panel
          </CardTitle>
          <CardDescription>
            Test and validate the hierarchical access control system
          </CardDescription>
        </CardHeader>
      </Card>

      <RoleAssignmentPanel />

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="current">Current User</TabsTrigger>
          <TabsTrigger value="routes">Route Access</TabsTrigger>
          <TabsTrigger value="functions">Functions</TabsTrigger>
          <TabsTrigger value="tests">Run Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Current User Access Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">User Level</h4>
                  <Badge variant="outline" className="text-lg">
                    Level {userLevel}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Geographic Scope</h4>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {geographicScope.type}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Active Roles</h4>
                  <div className="flex flex-wrap gap-1">
                    {userRoles.map(role => (
                      <Badge key={role} variant="secondary">
                        {role.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Functional Access</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(functionalAccess).map(([func, hasAccess]) => (
                    <Badge 
                      key={func} 
                      variant={hasAccess ? "default" : "outline"}
                      className="flex items-center gap-1"
                    >
                      {hasAccess ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      {func}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accessible Routes</CardTitle>
              <CardDescription>
                Routes you can access based on your current role and level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {accessibleRoutes.map(route => (
                  <Badge key={route} variant="outline" className="justify-start">
                    {route}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Total accessible routes: {accessibleRoutes.length}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="functions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Access Level Testing</CardTitle>
              <CardDescription>
                Test access to different levels and functions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Level Access Test</h4>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(level => (
                    <Badge 
                      key={level} 
                      variant={canAccessLevel(level) ? "default" : "outline"}
                      className="flex items-center justify-center"
                    >
                      L{level}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Geographic Scope Test</h4>
                <div className="flex gap-2">
                  {(['community', 'district', 'state'] as const).map(scope => (
                    <Badge 
                      key={scope}
                      variant={canAccessGeographicScope(scope) ? "default" : "outline"}
                      className="flex items-center gap-1"
                    >
                      {canAccessGeographicScope(scope) ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {scope}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Function Access Test</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {(['security', 'facilities', 'services', 'administration', 'maintenance', 'community'] as const).map(func => (
                    <Badge 
                      key={func}
                      variant={canAccessFunction(func) ? "default" : "outline"}
                      className="flex items-center gap-1"
                    >
                      {canAccessFunction(func) ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      {func}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Comprehensive Access Control Tests
              </CardTitle>
              <CardDescription>
                Run automated tests to validate the access control system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Button 
                  onClick={runAccessControlTests} 
                  disabled={isRunningTests}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  {isRunningTests ? 'Running Tests...' : 'Run All Tests'}
                </Button>
                <Badge variant="outline">
                  Check console for detailed output
                </Badge>
              </div>

              {testResults && (
                <Alert className={testResults.failedTests === 0 ? 'border-green-500' : 'border-red-500'}>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Test Results:</span>
                        <Badge variant={testResults.failedTests === 0 ? 'default' : 'destructive'}>
                          {testResults.passedTests}/{testResults.totalTests} Passed
                        </Badge>
                      </div>
                      {testResults.failedTests > 0 && (
                        <div className="text-sm">
                          <p className="font-medium text-red-600">Failed Tests:</p>
                          {Object.entries(testResults.failures).map(([role, failures]: [string, any]) => (
                            <div key={role} className="ml-4">
                              <p className="font-medium">{role}:</p>
                              <ul className="ml-4 list-disc">
                                {failures.map((failure: string, index: number) => (
                                  <li key={index} className="text-red-600">{failure}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {currentScenario && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Expected Access for {currentScenario.role}:</p>
                      <div className="text-sm space-y-1">
                        <p>• Level: {currentScenario.level}</p>
                        <p>• Geographic Scope: {currentScenario.expectedAccess.geographicScope}</p>
                        <p>• Accessible Routes: {currentScenario.expectedAccess.routes.length}</p>
                        <p>• Denied Routes: {currentScenario.expectedAccess.deniedRoutes.length}</p>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}