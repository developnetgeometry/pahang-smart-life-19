import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { WeatherWidget } from "./WeatherWidget";
import { PrayerTimesWidget } from "./PrayerTimesWidget";
import { AnnouncementSlideshow } from "./AnnouncementSlideshow";
import { useState } from "react";
import {
  MapPin,
  Users,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Building2,
  FileText,
  Calendar,
  Star,
  Home,
  Shield,
  Wrench,
  Activity,
  Zap,
} from "lucide-react";

export function StateAdminDashboard() {
  const { language } = useAuth();
  const [selectedDistrict, setSelectedDistrict] = useState<
    (typeof districtPerformance)[0] | null
  >(null);

  const metrics = [
    {
      title: language === "en" ? "Total Districts" : "Jumlah Daerah",
      value: "15",
      icon: MapPin,
      trend: "+2 this year",
    },
    {
      title: language === "en" ? "Active Residents" : "Penduduk Aktif",
      value: "12,450",
      icon: Users,
      trend: "+5.2% this month",
    },
    {
      title: language === "en" ? "System Health" : "Kesihatan Sistem",
      value: "4/5",
      icon: TrendingUp,
      trend: "Systems operational",
    },
  ];

  const criticalAlerts = [
    {
      type: "Reports",
      message:
        language === "en"
          ? "District coordinator reports due"
          : "Laporan penyelaras daerah perlu dikemukakan",
      priority: "medium",
    },
    {
      type: "Budget",
      message:
        language === "en"
          ? "Budget approval needed for Pahang Prima North"
          : "Kelulusan bajet diperlukan untuk Pahang Prima North",
      priority: "high",
    },
  ];

  const districtPerformance = [
    {
      name: "Pahang Prima North",
      residents: 2180,
      satisfaction: 4.2,
      issues: 12,
    },
    {
      name: "Pahang Prima South",
      residents: 1850,
      satisfaction: 4.0,
      issues: 8,
    },
    {
      name: "Pahang Prima East",
      residents: 1920,
      satisfaction: 4.1,
      issues: 15,
    },
    {
      name: "Pahang Prima West",
      residents: 1750,
      satisfaction: 3.8,
      issues: 18,
    },
  ];

  // Enhanced data for detailed views
  const getDistrictDetailedData = (districtName: string) => {
    const monthlyData = [
      {
        month: "Jan",
        residents: 2100,
        satisfaction: 4.0,
        issues: 15,
        revenue: 850000,
      },
      {
        month: "Feb",
        residents: 2120,
        satisfaction: 4.1,
        issues: 13,
        revenue: 880000,
      },
      {
        month: "Mar",
        residents: 2140,
        satisfaction: 4.0,
        issues: 14,
        revenue: 890000,
      },
      {
        month: "Apr",
        residents: 2160,
        satisfaction: 4.2,
        issues: 12,
        revenue: 920000,
      },
      {
        month: "May",
        residents: 2170,
        satisfaction: 4.3,
        issues: 10,
        revenue: 950000,
      },
      {
        month: "Jun",
        residents: 2180,
        satisfaction: 4.2,
        issues: 12,
        revenue: 940000,
      },
    ];

    const facilitiesData = [
      { name: "Community Hall", utilization: 85, bookings: 45 },
      { name: "Swimming Pool", utilization: 92, bookings: 120 },
      { name: "Gym", utilization: 78, bookings: 89 },
      { name: "Tennis Court", utilization: 65, bookings: 32 },
      { name: "BBQ Area", utilization: 88, bookings: 28 },
    ];

    const issueTypes = [
      { name: "Maintenance", value: 40, color: "#8884d8" },
      { name: "Security", value: 25, color: "#82ca9d" },
      { name: "Utilities", value: 20, color: "#ffc658" },
      { name: "Noise", value: 10, color: "#ff7300" },
      { name: "Others", value: 5, color: "#0088fe" },
    ];

    const demographics = [
      { ageGroup: "18-30", count: 580, percentage: 26.6 },
      { ageGroup: "31-45", count: 720, percentage: 33.0 },
      { ageGroup: "46-60", count: 650, percentage: 29.8 },
      { ageGroup: "60+", count: 230, percentage: 10.6 },
    ];

    return { monthlyData, facilitiesData, issueTypes, demographics };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {language === "en"
            ? "State Administration Dashboard"
            : "Papan Pemuka Pentadbiran Negeri"}
        </h1>
        <p className="text-muted-foreground">
          {language === "en"
            ? "Strategic overview of all districts and operations"
            : "Gambaran strategik semua daerah dan operasi"}
        </p>
      </div>

      <AnnouncementSlideshow />

      {/* State Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weather and Prayer Times Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeatherWidget />
        <PrayerTimesWidget />
      </div>


      {/* Critical Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            {language === "en"
              ? "Critical Alerts & Approvals"
              : "Amaran Kritikal & Kelulusan"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {criticalAlerts.map((alert, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Badge
                  variant={
                    alert.priority === "high" ? "destructive" : "secondary"
                  }
                >
                  {alert.type}
                </Badge>
                <span className="text-sm truncate sm:whitespace-normal">
                  {alert.message}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full sm:w-auto shrink-0"
              >
                {language === "en" ? "Review" : "Semak"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>


      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === "en" ? "Quick Actions" : "Tindakan Pantas"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="flex items-center gap-2 h-12">
              <FileText className="h-4 w-4" />
              {language === "en" ? "Review Reports" : "Semak Laporan"}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <Users className="h-4 w-4" />
              {language === "en" ? "Manage Districts" : "Urus Daerah"}
            </Button>
            <Button className="flex items-center gap-2 h-12" variant="outline">
              <Calendar className="h-4 w-4" />
              {language === "en" ? "Schedule Meeting" : "Jadualkan Mesyuarat"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
