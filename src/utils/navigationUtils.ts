import { 
  LayoutDashboard, 
  MessageSquare, 
  Calendar, 
  Users, 
  User,
  TrendingUp,
  Package,
  Megaphone,
  ClipboardList
} from "lucide-react";
import { NavigationGroup, NavigationItem } from '@/components/layout/Sidebar';

export function getSharedNavigationForUser(
  hasRole: (role: string) => boolean,
  t: (key: string) => string,
  isModuleEnabled: (module: string) => boolean
): NavigationGroup[] {
  const nav: NavigationGroup[] = [];

  // Service providers get minimal navigation (no community features)
  if (hasRole("service_provider")) {
    // Dashboard
    nav.push({
      label: t("dashboard"),
      items: [{ title: t("dashboard"), url: "/", icon: LayoutDashboard }],
    });

    // Personal Services
    nav.push({
      label: t("services"),
      items: [
        { title: t("seller_dashboard"), url: "/seller-dashboard", icon: TrendingUp },
        { title: t("my_listings"), url: "/my-listings", icon: Package },
        { title: "Iklan", url: "/advertisements", icon: Megaphone },
        { title: t("service_requests"), url: "/service-requests", icon: ClipboardList },
      ],
    });

    return nav;
  }

  // Dashboard - always visible for non-service providers
  nav.push({
    label: t("dashboard"),
    items: [{ title: t("dashboard"), url: "/", icon: LayoutDashboard }],
  });

  // Personal Activities
  const personalItems: NavigationItem[] = [
    { title: t("my_profile"), url: "/my-profile", icon: User },
  ];

  if (isModuleEnabled('complaints')) {
    personalItems.push({ title: t("my_complaints"), url: "/my-complaints", icon: MessageSquare });
  }

  if (isModuleEnabled('facilities')) {
    personalItems.push({ title: t("my_bookings"), url: "/my-bookings", icon: Calendar });
  }

  if (isModuleEnabled('visitor_management')) {
    personalItems.push({ title: t("my_visitors"), url: "/my-visitors", icon: Users });
  }

  nav.push({
    label: t("personal"),
    items: personalItems,
  });

  return nav;
}