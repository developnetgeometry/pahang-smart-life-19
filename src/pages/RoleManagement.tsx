import React, { useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RoleRequestForm } from "@/components/role-management/RoleRequestForm";
import { RoleRequestsList } from "@/components/role-management/RoleRequestsList";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Shield, 
  FileText, 
  History, 
  Plus,
  UserCog,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

const RoleManagement: React.FC = () => {
  const { language, user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'request' | 'manage'>('overview');
  const [showRequestForm, setShowRequestForm] = useState(false);

  const text = {
    en: {
      title: "Role Management",
      description: "Manage roles and permissions within your community",
      overview: "Overview",
      requestRole: "Request Role",
      manageRequests: "Manage Requests",
      currentRole: "Current Role",
      availableActions: "Available Actions",
      requestNewRole: "Request New Role",
      viewMyRequests: "View My Requests",
      approveRequests: "Approve Requests",
      auditTrail: "Audit Trail",
      securityNotice: "Security Notice",
      securityText: "Role changes are audited and require appropriate approvals. Ensure you understand the responsibilities that come with each role.",
      roleHierarchy: "Role Hierarchy",
      hierarchyDescription: "Understanding the approval chain for role changes"
    },
    ms: {
      title: "Pengurusan Peranan",
      description: "Uruskan peranan dan kebenaran dalam komuniti anda",
      overview: "Gambaran Keseluruhan",
      requestRole: "Mohon Peranan",
      manageRequests: "Urus Permohonan",
      currentRole: "Peranan Semasa", 
      availableActions: "Tindakan Yang Tersedia",
      requestNewRole: "Mohon Peranan Baru",
      viewMyRequests: "Lihat Permohonan Saya",
      approveRequests: "Luluskan Permohonan",
      auditTrail: "Jejak Audit",
      securityNotice: "Notis Keselamatan",
      securityText: "Perubahan peranan diaudit dan memerlukan kelulusan yang sewajarnya. Pastikan anda memahami tanggungjawab yang datang dengan setiap peranan.",
      roleHierarchy: "Hierarki Peranan",
      hierarchyDescription: "Memahami rantaian kelulusan untuk perubahan peranan"
    }
  };

  const t = text[language];

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

  const getCurrentUserRole = () => {
    if (hasRole('admin')) return 'admin';
    if (hasRole('state_admin')) return 'state_admin';
    if (hasRole('district_coordinator')) return 'district_coordinator';
    if (hasRole('community_admin')) return 'community_admin';
    if (hasRole('security')) return 'security';
    if (hasRole('facility_manager')) return 'facility_manager';
    if (hasRole('service_provider')) return 'service_provider';
    if (hasRole('community_leader')) return 'community_leader';
    return 'resident';
  };

  const currentUserRole = getCurrentUserRole();

  const RoleHierarchyCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t.roleHierarchy}
        </CardTitle>
        <CardDescription>{t.hierarchyDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[
            { role: 'admin', approver: 'Executive Committee', level: 'highest' },
            { role: 'state_admin', approver: 'System Admin', level: 'high' },
            { role: 'district_coordinator', approver: 'State Admin', level: 'high' },
            { role: 'community_admin', approver: 'District Coordinator', level: 'medium' },
            { role: 'security', approver: 'District Coordinator', level: 'medium' },
            { role: 'facility_manager', approver: 'Community Admin', level: 'medium' },
            { role: 'service_provider', approver: 'Community Admin', level: 'basic' },
            { role: 'community_leader', approver: 'Community Admin', level: 'basic' },
            { role: 'resident', approver: 'Self Registration', level: 'basic' }
          ].map((item, index) => (
            <div key={item.role} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge 
                  variant={item.level === 'highest' ? 'default' : 
                          item.level === 'high' ? 'secondary' : 
                          item.level === 'medium' ? 'outline' : 'default'}
                >
                  {ROLE_LABELS[item.role as keyof typeof ROLE_LABELS]}
                </Badge>
                {currentUserRole === item.role && (
                  <Badge variant="default">Your Role</Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Approved by: {item.approver}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              {t.currentRole}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Badge variant="default" className="text-sm px-3 py-1">
                {ROLE_LABELS[currentUserRole as keyof typeof ROLE_LABELS]}
              </Badge>
              
              <div className="pt-2">
                <h4 className="font-medium mb-2">{t.availableActions}</h4>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('request')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t.requestNewRole}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('manage')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {t.viewMyRequests}
                  </Button>

                  {(hasRole('community_admin') || hasRole('district_coordinator') || hasRole('state_admin') || hasRole('admin')) && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('manage')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {t.approveRequests}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {t.securityNotice}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t.securityText}
            </p>
            
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="font-medium">All role changes are logged and audited</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <RoleHierarchyCard />
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
          <p className="text-muted-foreground">{t.description}</p>
        </div>

        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">{t.overview}</TabsTrigger>
            <TabsTrigger value="request">{t.requestRole}</TabsTrigger>
            <TabsTrigger value="manage">{t.manageRequests}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="request" className="mt-6">
            <RoleRequestForm onSuccess={() => {
              setActiveTab('manage');
              setShowRequestForm(false);
            }} />
          </TabsContent>

          <TabsContent value="manage" className="mt-6">
            <RoleRequestsList />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default RoleManagement;