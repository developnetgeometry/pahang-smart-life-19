import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/lib/translations";
import { NavLink, useLocation } from "react-router-dom";
import { useModuleAccess } from "@/hooks/use-module-access";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  QrCode,
} from "lucide-react";

interface NavigationItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredRoles?: string[];
}

interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export function AppSidebar() {
  const { language, hasRole } = useAuth();
  const { t } = useTranslation(language);
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { isModuleEnabled } = useModuleAccess();

  // Role-based navigation groups - enhanced filtering
  const getNavigationForUser = () => {
    const nav: NavigationGroup[] = [];

    // Dashboard - available to all authenticated users
    nav.push({
      label: t("dashboard"),
      items: [{ title: t("dashboard"), url: "/", icon: LayoutDashboard }],
    });

    // Personal Activities - available to all users (except facility managers get limited access)
    const personalItems = [
      { title: t("myComplaints"), url: "/my-complaints", icon: FileText },
    ];
    
    // Add panic alerts for non-facility managers
    if (!hasRole('facility_manager')) {
      personalItems.push({ title: "Panic Alerts", url: "/panic-alerts", icon: AlertTriangle });
    }
    
    // Add visitor management if module is enabled and not facility manager
    if (isModuleEnabled('visitor_management') && !hasRole('facility_manager')) {
      personalItems.push({ title: "My Visitors", url: "/my-visitors", icon: UserCheck });
    }
    
    nav.push({
      label: t("myActivities"),
      items: personalItems,
    });

    // Community Hub - available to all users except facility managers
    if (!hasRole('facility_manager')) {
      const communityItems = [
        {
          title: t("communication"),
          url: "/communication-hub",
          icon: MessageSquare,
        },
        { title: t("announcements"), url: "/announcements", icon: Megaphone },
      ];
      
      // Add discussions if module is enabled
      if (isModuleEnabled('discussions')) {
        communityItems.push({ title: t("discussions"), url: "/discussions", icon: MessageSquare });
      }
      
      // Add marketplace if module is enabled
      if (isModuleEnabled('marketplace')) {
        communityItems.push({ title: t("marketplace"), url: "/marketplace", icon: ShoppingCart });
      }
      
      nav.push({
        label: t("communityHub"),
        items: communityItems,
      });
    }

    // Services & Facilities - available to all users
    const servicesItems = [];
    
    // Service Provider specific items
    if (hasRole("service_provider") && isModuleEnabled('marketplace')) {
      servicesItems.push({ 
        title: "Advertisement Management", 
        url: "/advertisements", 
        icon: Megaphone,
        requiredRoles: ["service_provider"]
      });
    }
    
    // Add facilities if module is enabled
    if (isModuleEnabled('facilities')) {
      servicesItems.push({ title: "Facilities", url: "/facilities", icon: Building });
    }
    
    // Add bookings if module is enabled (exclude facility managers - they manage facilities, don't book them)
    if (isModuleEnabled('bookings') && !hasRole('facility_manager')) {
      servicesItems.push({ title: "My Bookings", url: "/my-bookings", icon: Calendar });
    }
    
    if (servicesItems.length > 0) {
      nav.push({
        label: t("servicesAndFacilities"),
        items: servicesItems,
      });
    }

    // Role Management & Services - for approval and service provider management roles
    const roleManagementItems = [];
    
    // Role Approval Authority - for approval management roles
    if (hasRole("community_admin") || hasRole("district_coordinator") || hasRole("state_admin")) {
      roleManagementItems.push({
        title: t("roleApprovalAuthority"),
        url: "/role-management",
        icon: UserCheck,
        requiredRoles: ["community_admin", "district_coordinator", "state_admin"],
      });
    }

    // Service Provider Management - for community admins and above
    if (hasRole("community_admin") || hasRole("district_coordinator") || hasRole("state_admin")) {
      roleManagementItems.push({
        title: t("serviceProviders"),
        url: "/admin/service-providers",
        icon: Building,
        requiredRoles: ["community_admin", "district_coordinator", "state_admin"],
      });
    }

    if (roleManagementItems.length > 0) {
      nav.push({
        label: t("roleManagement"),
        items: roleManagementItems,
      });
    }

    // Administration - only for state_admin and community_admin roles
    const adminItems = [];
    if (hasRole("state_admin") || hasRole("community_admin")) {
      adminItems.push(
        {
          title: t("userManagement"),
          url: "/admin/users",
          icon: UserPlus,
          requiredRoles: ["state_admin", "community_admin"],
        },
        {
          title: t("communityManagement"),
          url: "/admin/communities",
          icon: Home,
          requiredRoles: ["state_admin", "community_admin"],
        }
      );
    }

    if (hasRole("community_admin")) {
      adminItems.push({
        title: "Module Management",
        url: "/admin/modules",
        icon: Settings,
        requiredRoles: ["community_admin"],
      });
    }

    if (hasRole("state_admin")) {
      adminItems.push({
        title: t("districtManagement"),
        url: "/admin/districts",
        icon: Settings,
        requiredRoles: ["state_admin"],
      });
    }

    if (adminItems.length > 0) {
      nav.push({
        label: t("administration"),
        items: adminItems,
      });
    }

    // Operations Management - for facility managers and above
    const operationsItems = [];
    
    // Maintenance Staff specific items
    if (hasRole("maintenance_staff")) {
      operationsItems.push(
        {
          title: "Work Orders",
          url: "/work-orders-management",
          icon: Wrench,
          requiredRoles: ["maintenance_staff"],
        },
        {
          title: "Maintenance Complaints",
          url: "/maintenance-complaint-center",
          icon: MessageSquare,
          requiredRoles: ["maintenance_staff"],
        },
        {
          title: "Emergency Response",
          url: "/maintenance-emergency",
          icon: AlertTriangle,
          requiredRoles: ["maintenance_staff"],
        },
        {
          title: "Maintenance Assets",
          url: "/maintenance-assets",
          icon: Package,
          requiredRoles: ["maintenance_staff"],
        },
        {
          title: "Maintenance Scheduler",
          url: "/maintenance-scheduler",
          icon: Calendar,
          requiredRoles: ["maintenance_staff"],
        },
        {
          title: "Maintenance Reports",
          url: "/maintenance-reports",
          icon: FileText,
          requiredRoles: ["maintenance_staff"],
        }
      );
    }
    
    // Facility Manager specific items
    if (hasRole("facility_manager") || hasRole("state_admin") || hasRole("community_admin")) {
      operationsItems.push(
        {
          title: t("facilitiesManagement"),
          url: "/admin/facilities",
          icon: Building,
          requiredRoles: ["facility_manager", "state_admin", "community_admin"],
        },
        {
          title: "Facility Complaints",
          url: "/facility-complaint-center",
          icon: AlertTriangle,
          requiredRoles: ["facility_manager", "state_admin", "community_admin"],
        },
        {
          title: t("maintenanceManagement"),
          url: "/admin/maintenance",
          icon: Wrench,
          requiredRoles: ["facility_manager", "state_admin", "community_admin"],
        }
      );
    }
    
    // Admin and Facility Manager items - removed complaints center from here

    // Asset Management - for facility managers and above
    if (hasRole("facility_manager") || hasRole("community_admin") || hasRole("district_coordinator") || hasRole("state_admin")) {
      operationsItems.push({
        title: "Asset Management",
        url: "/asset-management",
        icon: Package,
        requiredRoles: ["facility_manager", "community_admin", "district_coordinator", "state_admin"],
      });
    }

    // Inventory Management - for facility managers and above
    if (hasRole("facility_manager") || hasRole("maintenance_staff") || hasRole("community_admin") || hasRole("district_coordinator") || hasRole("state_admin")) {
      operationsItems.push({
        title: "Inventory Management",
        url: "/inventory-management",
        icon: BarChart3,
        requiredRoles: ["facility_manager", "maintenance_staff", "community_admin", "district_coordinator", "state_admin"],
      });
    }

    // Financial Management - for community admins and above
    if (hasRole("community_admin") || hasRole("district_coordinator") || hasRole("state_admin")) {
      operationsItems.push({
        title: "Financial Management",
        url: "/financial-management",
        icon: DollarSign,
        requiredRoles: ["community_admin", "district_coordinator", "state_admin"],
      });
    }

    if (operationsItems.length > 0) {
      nav.push({
        label: t("operations"),
        items: operationsItems,
      });
    }

    // Security & Monitoring - for security, state_admin, and community_admin roles
    const securityItems = [];
    if (hasRole("security_officer") || hasRole("state_admin") || hasRole("community_admin")) {
      securityItems.push(
        {
          title: t("panicAlerts"),
          url: "/panic-alerts",
          icon: AlertTriangle,
          requiredRoles: ["security_officer", "state_admin", "community_admin"],
        }
      );

      // Visitor Management modules (require visitor_management module to be enabled)
      if (isModuleEnabled("visitor_management")) {
        securityItems.push(
          {
            title: t("visitorSecurity"),
            url: "/visitor-security", 
            icon: Shield,
            requiredRoles: ["security_officer", "state_admin", "community_admin"],
          },
          {
            title: "Visitor Management",
            url: "/visitor-management",
            icon: UserCheck,
            requiredRoles: ["security_officer", "state_admin", "community_admin"],
          }
        );
      }
    }

    if (hasRole("state_admin") || hasRole("community_admin")) {
      securityItems.push(
        {
          title: t("visitorAnalytics"),
          url: "/visitor-analytics",
          icon: Activity,
          requiredRoles: ["state_admin", "community_admin"],
        }
      );
    }

    if (securityItems.length > 0) {
      nav.push({
        label: t("securityAndMonitoring"),
        items: securityItems,
      });
    }

    // Service Provider Management - moved to Role Management section above

    // Communication Management - for state_admin and community_admin roles
    const commMgmtItems = [];
    if (hasRole("state_admin") || hasRole("community_admin")) {
      commMgmtItems.push(
        {
          title: t("announcementManagement"),
          url: "/admin/announcements",
          icon: Megaphone,
          requiredRoles: ["state_admin", "community_admin"],
        },
        {
          title: t("discussionManagement"),
          url: "/admin/discussions",
          icon: MessageSquare,
          requiredRoles: ["state_admin", "community_admin"],
        }
      );
    }

    if (commMgmtItems.length > 0) {
      nav.push({
        label: t("communicationManagement"),
        items: commMgmtItems,
      });
    }

    return nav;
  };

  const navigation = getNavigationForUser();
  const canSee = (item: NavigationItem) =>
    !item.requiredRoles || item.requiredRoles.some((r) => hasRole?.(r as any));
  const filteredNavigation = navigation
    .map((group) => ({ ...group, items: group.items.filter(canSee) }))
    .filter((group) => group.items.length > 0);

  return (
    <Sidebar collapsible="icon" variant="floating">
      {/* Logo section */}
      <div className="flex h-16 items-center border-b border-border/30 px-4 bg-gradient-to-r from-primary/5 via-accent/5 to-transparent backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow animate-scale-in p-1">
            <img 
              src="/lovable-uploads/8b5530a7-fe2b-4d5c-bcf6-5f679ad0e912.png" 
              alt="Smart Community Logo" 
              className="w-full h-full object-contain rounded-md"
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col animate-fade-in">
              <span className="text-sm font-semibold text-foreground bg-gradient-primary bg-clip-text text-transparent">
                Smart Community
              </span>
              <span className="text-xs text-muted-foreground opacity-75">Pahang</span>
            </div>
          )}
        </div>
      </div>

      <SidebarContent className="px-2">
        {filteredNavigation.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex} className="animate-fade-in">
            {!isCollapsed && (
              <SidebarGroupLabel className="text-muted-foreground font-medium text-xs uppercase tracking-wide bg-gradient-subtle px-3 py-2 rounded-lg mb-2">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isCurrentActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild>
                        {isCollapsed ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <NavLink
                                to={item.url}
                                className={`flex items-center justify-center rounded-xl p-3 transition-all duration-300 group relative overflow-hidden ${
                                  isCurrentActive
                                    ? "bg-gradient-primary text-primary-foreground shadow-glow scale-105"
                                    : "text-muted-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:text-foreground hover:shadow-community hover:scale-105 backdrop-blur-sm"
                                }`}
                              >
                                <item.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                                {isCurrentActive && (
                                  <div className="absolute inset-0 bg-gradient-primary opacity-20 animate-pulse rounded-xl" />
                                )}
                              </NavLink>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="bg-card/90 backdrop-blur-lg border border-border/50 shadow-elegant">
                              <p className="font-medium">{item.title}</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <NavLink
                            to={item.url}
                            className={`flex items-center space-x-3 rounded-xl px-4 py-3 text-sm transition-all duration-300 group relative overflow-hidden ${
                              isCurrentActive
                                ? "bg-gradient-primary text-primary-foreground shadow-glow"
                                : "text-muted-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:text-foreground hover:shadow-community backdrop-blur-sm"
                            }`}
                          >
                            <item.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                            <span className="font-medium">{item.title}</span>
                            {isCurrentActive && (
                              <div className="absolute inset-0 bg-gradient-primary opacity-20 animate-pulse rounded-xl" />
                            )}
                          </NavLink>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
