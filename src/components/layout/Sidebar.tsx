import { useAuth } from "@/contexts/AuthContext";
import { useAccessControl } from "@/hooks/use-access-control";
import { useTranslation } from "@/lib/translations";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Calendar,
  Users,
  MessageSquare,
  Building,
  ShoppingCart,
  Camera,
  Shield,
  Settings,
  UserPlus,
  Wrench,
  AlertTriangle,
  Monitor,
  Radio,
  Megaphone,
  FileText,
  Home,
  Activity,
  Bell,
  UserCheck,
  Package,
  DollarSign,
  Clipboard,
  BarChart3,
} from "lucide-react";

interface NavigationItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredLevel?: number;
  requiredFunction?: string;
}

interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export function AppSidebar() {
  const { language } = useAuth();
  const { t } = useTranslation(language);
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  const {
    canAccessLevel,
    canAccessFunction,
    functionalAccess,
    userLevel,
    geographicScope
  } = useAccessControl();

  // Enhanced role-based navigation with hierarchical access
  const getNavigationForUser = (): NavigationGroup[] => {
    const nav: NavigationGroup[] = [];

    // Dashboard - available to all authenticated users
    nav.push({
      label: t("dashboard"),
      items: [{ title: t("dashboard"), url: "/", icon: LayoutDashboard }],
    });

    // Personal Activities - available to all users
    nav.push({
      label: t("myActivities"),
      items: [
        { title: t("myBookings"), url: "/my-bookings", icon: Calendar },
        { title: t("myVisitors"), url: "/my-visitors", icon: Users },
        { title: t("myComplaints"), url: "/my-complaints", icon: FileText },
      ],
    });

    // Community Functions
    const communityItems = [];
    if (functionalAccess.community) {
      communityItems.push(
        { title: t("announcements"), url: "/announcements", icon: Megaphone },
        { title: t("discussions"), url: "/discussions", icon: MessageSquare },
        { title: t("directory"), url: "/directory", icon: Users }
      );
    }
    communityItems.push({
      title: t("communication"),
      url: "/communication-hub",
      icon: MessageSquare,
    });

    if (communityItems.length > 0) {
      nav.push({
        label: t("communityHub"),
        items: communityItems,
      });
    }

    // Services & Facilities
    const serviceItems = [];
    if (functionalAccess.facilities) {
      serviceItems.push(
        { title: t("facilities"), url: "/facilities", icon: Building }
      );
    }
    if (functionalAccess.services) {
      serviceItems.push(
        { title: t("marketplace"), url: "/marketplace", icon: ShoppingCart },
        { title: "Service Requests", url: "/service-requests", icon: Clipboard }
      );
    }

    if (serviceItems.length > 0) {
      nav.push({
        label: t("servicesAndFacilities"),
        items: serviceItems,
      });
    }

    // Security Functions
    const securityItems = [];
    console.log('Security access check:', {
      hasSecurity: functionalAccess.security,
      userLevel,
      functionalAccess,
      geographicScope
    });
    
    if (functionalAccess.security) {
      securityItems.push(
        { title: t("cctvLiveFeed"), url: "/cctv-live", icon: Camera },
        { title: t("visitorSecurity"), url: "/visitor-security", icon: Shield },
        { title: t("panicAlerts"), url: "/panic-alerts", icon: AlertTriangle }
      );
    }

    if (securityItems.length > 0) {
      nav.push({
        label: t("securityAndMonitoring"),
        items: securityItems,
      });
    }

    // Maintenance Functions
    const maintenanceItems = [];
    if (functionalAccess.maintenance && canAccessLevel(5)) {
      maintenanceItems.push(
        { title: "Asset Management", url: "/asset-management", icon: Package, requiredLevel: 5 },
        { title: "Inventory Management", url: "/inventory-management", icon: BarChart3, requiredLevel: 5 }
      );
    }

    if (maintenanceItems.length > 0) {
      nav.push({
        label: "Maintenance",
        items: maintenanceItems,
      });
    }

    // Administration - Level 7+ (Facility Manager and above)
    const adminItems = [];
    if (canAccessLevel(7)) {
      adminItems.push(
        { title: t("facilitiesManagement"), url: "/admin/facilities", icon: Building, requiredLevel: 7 },
        { title: t("maintenanceManagement"), url: "/admin/maintenance", icon: Wrench, requiredLevel: 7 }
      );
    }

    // Level 8+ (Community Admin and above)
    if (functionalAccess.administration && canAccessLevel(8)) {
      adminItems.push(
        { title: t("userManagement"), url: "/admin/users", icon: UserPlus, requiredLevel: 8 },
        { title: t("roleApprovalAuthority"), url: "/role-management", icon: UserCheck, requiredLevel: 8 },
        { title: t("announcementManagement"), url: "/admin/announcements", icon: Megaphone, requiredLevel: 8 },
        { title: t("complaintsManagement"), url: "/admin/complaints", icon: AlertTriangle, requiredLevel: 8 },
        { title: t("discussionManagement"), url: "/admin/discussions", icon: MessageSquare, requiredLevel: 8 },
        { title: t("serviceProviders"), url: "/admin/service-providers", icon: Building, requiredLevel: 8 },
        { title: "Financial Management", url: "/financial-management", icon: DollarSign, requiredLevel: 8 },
        { title: t("communityManagement"), url: "/admin/communities", icon: Home, requiredLevel: 8 }
      );
    }

    // Security Admin - Level 6+ with security function
    console.log('CCTV Management access check:', {
      hasSecurity: functionalAccess.security,
      canAccessLevel6: canAccessLevel(6),
      userLevel
    });
    
    if (functionalAccess.security && canAccessLevel(6)) {
      adminItems.push(
        { title: t("cctvManagement"), url: "/admin/cctv", icon: Camera, requiredLevel: 6 }
      );
    }

    // Level 9+ (District Coordinator and above)
    if (canAccessLevel(9)) {
      adminItems.push(
        { title: t("districtManagement"), url: "/admin/districts", icon: Settings, requiredLevel: 9 },
        { title: t("visitorAnalytics"), url: "/visitor-analytics", icon: Activity, requiredLevel: 9 }
      );
    }

    // Level 10 (State Admin only)
    if (canAccessLevel(10)) {
      adminItems.push(
        { title: t("smartMonitoring"), url: "/admin/smart-monitoring", icon: Monitor, requiredLevel: 10 },
        { title: t("sensorManagement"), url: "/admin/sensors", icon: Radio, requiredLevel: 10 }
      );
    }

    if (adminItems.length > 0) {
      nav.push({
        label: t("administration"),
        items: adminItems,
      });
    }

    // Debug Page (temporary)
    nav.push({
      label: "Debug",
      items: [
        { title: "Access Control Test", url: "/access-control-test", icon: Settings }
      ]
    });

    return nav;
  };

  const navigation = getNavigationForUser();
  
  // Filter navigation items based on access control
  const filteredNavigation = navigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        // Check level access
        if (item.requiredLevel && !canAccessLevel(item.requiredLevel)) {
          return false;
        }
        // Check functional access
        if (item.requiredFunction && !canAccessFunction(item.requiredFunction as any)) {
          return false;
        }
        return true;
      })
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Sidebar collapsible="icon">
      {/* Logo section */}
      <div className="flex h-16 items-center border-b border-border px-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">
              SC
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                Smart Community
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {geographicScope.type === 'state' ? 'State' : 
                   geographicScope.type === 'district' ? 'District' : 'Community'} Level
                </span>
                <Badge variant="outline" className="text-xs px-1 py-0">
                  L{userLevel}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>

      <SidebarContent>
        {filteredNavigation.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex}>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-muted-foreground">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          }`
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && (
                          <div className="flex items-center justify-between w-full">
                            <span>{item.title}</span>
                            {item.requiredLevel && (
                              <Badge variant="secondary" className="text-xs ml-2">
                                L{item.requiredLevel}+
                              </Badge>
                            )}
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
