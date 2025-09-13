import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/lib/translations";
import { NavLink, useLocation } from "react-router-dom";
import { useModuleAccessOptimized as useModuleAccess } from "@/hooks/use-module-access-optimized";
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
  Activity,
  Bell,
  UserCheck,
  Package,
  DollarSign,
  Clipboard,
  BarChart3,
  QrCode,
} from "lucide-react";

export interface NavigationItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredRoles?: string[];
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export function AppSidebar() {
  const { language, hasRole } = useAuth();
  const { t } = useTranslation(language);
  const location = useLocation();
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;
  const { isModuleEnabled } = useModuleAccess();

  // Role-based navigation groups - enhanced filtering
  const getNavigationForUser = () => {
    const nav: NavigationGroup[] = [];

    // Service providers get minimal navigation (no community features)
    if (hasRole("service_provider")) {
      // Dashboard
      nav.push({
        label: t("dashboard"),
        items: [{ title: t("dashboard"), url: "/", icon: LayoutDashboard }],
      });

      // Service Provider specific items
      const serviceProviderItems = [];
      
      if (isModuleEnabled("marketplace")) {
        serviceProviderItems.push(
          {
            title: t("sellerDashboard"),
            url: "/seller-dashboard",
            icon: BarChart3,
          },
          {
            title: t("advertisementManagement"),
            url: "/advertisements",
            icon: Megaphone,
          },
          {
            title: t("marketplace"),
            url: "/marketplace",
            icon: ShoppingCart,
          },
          {
            title: t("myOrders"),
            url: "/my-orders",
            icon: Package,
          }
        );
      }

      if (serviceProviderItems.length > 0) {
        nav.push({
          label: t("businessManagement"),
          items: serviceProviderItems,
        });
      }

      return nav;
    }

    // Dashboard - available to all authenticated users
    nav.push({
      label: t("dashboard"),
      items: [{ title: t("dashboard"), url: "/", icon: LayoutDashboard }],
    });

    // Personal Activities - available to all users
    const personalItems = [
      { title: t("myComplaints"), url: "/my-complaints", icon: FileText },
    ];

    // Add panic alerts if security module is enabled
    if (isModuleEnabled("security") && !hasRole("security_officer")) {
      personalItems.push({
        title: t("panicAlerts"),
        url: "/panic-alerts",
        icon: AlertTriangle,
      });
    }

    // Add visitor management if module is enabled
    if (isModuleEnabled("visitor_management")) {
      personalItems.push({
        title: t("myVisitors"),
        url: "/my-visitors",
        icon: UserCheck,
      });
    }

    nav.push({
      label: t("myActivities"),
      items: personalItems,
    });

    // Community Hub - available to all users
    const communityItems = [
      {
        title: t("communication"),
        url: "/communication-hub",
        icon: MessageSquare,
      },
      { title: t("announcements"), url: "/announcements", icon: Megaphone },
    ];

    // Add discussions if module is enabled
    if (isModuleEnabled("discussions")) {
      communityItems.push({
        title: t("discussions"),
        url: "/discussions",
        icon: MessageSquare,
      });
    }

    nav.push({
      label: t("communityHub"),
      items: communityItems,
    });

    // Services & Facilities - available to all users
    const servicesItems = [];

    // Add marketplace if module is enabled (exclude security officers)
    if (isModuleEnabled("marketplace") && !hasRole("security_officer")) {
      servicesItems.push({
        title: t("marketplace"),
        url: "/marketplace",
        icon: ShoppingCart,
      });
      // Hide services from residents
      if (!hasRole("resident")) {
        servicesItems.push({
          title: t("services"),
          url: "/services",
          icon: Building,
        });
      }
      servicesItems.push({
        title: t("myListings"),
        url: "/my-listings",
        icon: Package,
      });
    }

    // Add facilities if module is enabled (exclude security officers)
    if (isModuleEnabled("facilities") && !hasRole("security_officer")) {
      servicesItems.push({
        title: t("facilities"),
        url: "/facilities",
        icon: Building,
      });
    }

    // Add bookings if module is enabled (exclude facility managers and security officers)
    if (isModuleEnabled("bookings") && !hasRole("facility_manager") && !hasRole("security_officer")) {
      servicesItems.push({
        title: t("myBookings"),
        url: "/my-bookings",
        icon: Calendar,
      });
    }

    // Add service requests if module is enabled
    if (isModuleEnabled("service_requests")) {
      servicesItems.push({
        title: t("serviceRequests"),
        url: "/service-requests",
        icon: Clipboard,
      });
    }

    // Add CCTV if module is enabled
    if (isModuleEnabled("cctv")) {
      servicesItems.push({
        title: t("cctvManagement"),
        url: "/cctv",
        icon: Camera,
      });
    }

    if (servicesItems.length > 0) {
      nav.push({
        label: t("servicesAndFacilities"),
        items: servicesItems,
      });
    }

    // Service Provider Management - for community admins and above
    const serviceProviderItems = [];
    
    if (
      hasRole("community_admin") ||
      hasRole("district_coordinator") ||
      hasRole("state_admin")
    ) {
      serviceProviderItems.push({
        title: t("serviceProviders"),
        url: "/admin/service-providers",
        icon: Building,
        requiredRoles: [
          "community_admin",
          "district_coordinator",
          "state_admin",
        ],
      });
    }

    if (serviceProviderItems.length > 0) {
      nav.push({
        label: t("serviceProviders"),
        items: serviceProviderItems,
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
        }
      );
    }

    if (hasRole("community_admin")) {
      adminItems.push({
        title: t("moduleManagement"),
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
          title: t("workOrders"),
          url: "/work-orders-management",
          icon: Wrench,
          requiredRoles: ["maintenance_staff"],
        },
        {
          title: t("maintenanceComplaints"),
          url: "/maintenance-complaint-center",
          icon: MessageSquare,
          requiredRoles: ["maintenance_staff"],
        },
        {
          title: t("emergencyResponse"),
          url: "/maintenance-emergency",
          icon: AlertTriangle,
          requiredRoles: ["maintenance_staff"],
        },
        {
          title: t("maintenanceAssets"),
          url: "/maintenance-assets",
          icon: Package,
          requiredRoles: ["maintenance_staff"],
        },
        {
          title: t("maintenanceScheduler"),
          url: "/maintenance-scheduler",
          icon: Calendar,
          requiredRoles: ["maintenance_staff"],
        },
        {
          title: t("maintenanceReports"),
          url: "/maintenance-reports",
          icon: FileText,
          requiredRoles: ["maintenance_staff"],
        }
      );
    }

    // Facility Manager specific items
    if (
      hasRole("facility_manager") ||
      hasRole("state_admin") ||
      hasRole("community_admin")
    ) {
      operationsItems.push(
        {
          title: t("floorPlanManagement"),
          url: "/admin/floor-plans",
          icon: Monitor,
          requiredRoles: ["facility_manager", "state_admin", "community_admin"],
        }
      );
    }

    // Admin and Facility Manager items - removed complaints center from here

    // Asset Management and Inventory Management modules are hidden

    // Financial Management module is hidden

    if (operationsItems.length > 0) {
      nav.push({
        label: t("operations"),
        items: operationsItems,
      });
    }

    // Security & Monitoring - for security, state_admin, and community_admin roles
    const securityItems = [];
    if (
      hasRole("security_officer") ||
      hasRole("state_admin") ||
      hasRole("community_admin")
    ) {
      securityItems.push(
        {
          title: t("facilityComplaints"),
          url: "/facility-complaint-center",
          icon: AlertTriangle,
          requiredRoles: ["facility_manager"],
        },
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
            requiredRoles: [
              "security_officer",
              "state_admin",
              "community_admin",
            ],
          },
          {
            title: t("visitorManagement"),
            url: "/visitor-management",
            icon: UserCheck,
            requiredRoles: [
              "security_officer",
              "state_admin",
              "community_admin",
            ],
          }
        );
      }
    }

    // Visitor Analytics module is hidden

    if (securityItems.length > 0) {
      nav.push({
        label: t("securityAndMonitoring"),
        items: securityItems,
      });
    }

    // Service Provider Management - moved to Role Management section above


    return nav;
  };

  const navigation = getNavigationForUser();
  const canSee = (item: NavigationItem) =>
    !item.requiredRoles || item.requiredRoles.some((r) => hasRole?.(r as any));

  // State admin specific filtering - hide specific modules
  const stateAdminHiddenUrls = hasRole("state_admin") ? [
    "/communication-hub",
    "/panic-alerts", 
    "/marketplace",
    "/my-listings",
    "/my-bookings",
    "/role-management",
    "/services",
    "/admin/facilities",
    "/admin/floor-plans", 
    "/admin/maintenance",
    "/asset-management",
    "/inventory-management",
    "/financial-management",
    "/visitor-analytics",
    "/facility-complaint-center"
  ] : [];

  const filteredNavigation = navigation
    .map((group) => ({ 
      ...group, 
      items: group.items.filter(item => 
        canSee(item) && !stateAdminHiddenUrls.includes(item.url)
      ) 
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
              <span className="text-sm font-semibold text-sidebar-foreground">
                {t("smartCommunity")}
              </span>
              <span className="text-xs text-sidebar-accent-foreground opacity-75">
                {t("pahangState")}
              </span>
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
                        {!isCollapsed && <span>{item.title}</span>}
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
