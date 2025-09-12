import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ActivePanicAlerts from "@/components/emergency/ActivePanicAlerts";
import { WeatherWidget } from "./WeatherWidget";
import { PrayerTimesWidget } from "./PrayerTimesWidget";
import {
  Camera,
  Shield,
  Users,
  AlertTriangle,
  Activity,
  Clock,
  Eye,
  Ban,
  FileText,
  CheckCircle,
} from "lucide-react";
import { AnnouncementSlideshow } from "./AnnouncementSlideshow";

interface CCTVCamera {
  id: string;
  name: string;
  location: string;
  is_active: boolean;
  stream_url?: string;
}

export function SecurityOfficerDashboard() {
  const { language, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cameras, setCameras] = useState<CCTVCamera[]>([]);
  const [loadingCameras, setLoadingCameras] = useState(true);

  // Fetch CCTV cameras data
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        let query = supabase
          .from("cctv_cameras")
          .select("id, name, location, is_active, stream_url");

        // Filter by user's community if available
        if (user?.active_community_id) {
          query = query.eq("community_id", user.active_community_id);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching cameras:", error);
          toast({
            title: language === "en" ? "Error" : "Ralat",
            description:
              language === "en"
                ? "Failed to load camera data"
                : "Gagal memuatkan data kamera",
            variant: "destructive",
          });
        } else {
          setCameras(data || []);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoadingCameras(false);
      }
    };

    fetchCameras();

    // Set up realtime subscription for camera updates
    const channel = supabase
      .channel("cctv-cameras-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cctv_cameras",
        },
        () => {
          // Refetch data when changes occur
          fetchCameras();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.active_community_id, language, toast]);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "cameras":
        navigate("/cctv-live");
        break;
      case "visitors":
        navigate("/visitor-security");
        break;
      case "complaints_center":
        navigate("/admin/complaints");
        break;
      default:
        break;
    }
  };

  const handleCameraView = (cameraId: string, cameraName: string) => {
    toast({
      title: language === "en" ? "Camera View" : "Paparan Kamera",
      description:
        language === "en"
          ? `Opening ${cameraName} camera feed...`
          : `Membuka paparan kamera ${cameraName}...`,
    });
    navigate(`/cctv-live?cameraId=${cameraId}`);
  };

  const handleIncidentReview = (incidentType: string) => {
    toast({
      title: language === "en" ? "Incident Review" : "Semakan Insiden",
      description:
        language === "en"
          ? `Reviewing ${incidentType} incident...`
          : `Menyemak insiden ${incidentType}...`,
    });
    navigate("/admin/security-dashboard");
  };

  const handlePatrolStart = (area: string, time: string) => {
    // Navigate to patrol interface
    navigate("/patrol-interface", {
      state: {
        patrolArea: area,
        patrolTime: time,
      },
    });
  };

  // Calculate camera metrics from live data
  const totalCameras = cameras.length;
  const onlineCameras = cameras.filter(camera => camera.is_active).length;
  const offlineCameras = totalCameras - onlineCameras;
  const cameraUptime = totalCameras > 0 ? Math.round((onlineCameras / totalCameras) * 100) : 0;

  const securityMetrics = [
    {
      title: language === "en" ? "CCTV Cameras" : "Kamera CCTV",
      value: loadingCameras ? "—" : totalCameras.toString(),
      icon: Camera,
      trend: loadingCameras 
        ? (language === "en" ? "Loading..." : "Memuatkan...") 
        : `${onlineCameras} ${language === "en" ? "online" : "dalam talian"}`,
      status: cameraUptime,
    },
    {
      title: language === "en" ? "Access Points" : "Titik Akses",
      value: "12",
      icon: Shield,
      trend: "All operational",
      status: 100,
    },
    {
      title: language === "en" ? "Today's Visitors" : "Pelawat Hari Ini",
      value: "47",
      icon: Users,
      trend: "+12 from yesterday",
    },
    {
      title: language === "en" ? "Active Alerts" : "Amaran Aktif",
      value: "2",
      icon: AlertTriangle,
      trend: "Medium priority",
    },
  ];

  const recentIncidents = [
    {
      type: "Access Denied",
      description:
        language === "en"
          ? "Invalid card used at Main Gate"
          : "Kad tidak sah digunakan di Pintu Utama",
      time: "11:30 AM",
      status: "resolved",
    },
    {
      type: "Visitor Alert",
      description:
        language === "en"
          ? "Unregistered visitor detected"
          : "Pelawat tidak berdaftar dikesan",
      time: "10:15 AM",
      status: "investigating",
    },
    {
      type: "Equipment",
      description:
        language === "en"
          ? "Camera maintenance completed"
          : "Penyelenggaraan kamera selesai",
      time: "9:00 AM",
      status: "resolved",
    },
  ];

  const patrolSchedule = [
    { time: "3:00 PM", area: "Building A - Levels 1-5", status: "upcoming" },
    { time: "4:00 PM", area: "Parking & Common Areas", status: "upcoming" },
    { time: "5:00 PM", area: "Recreation Facilities", status: "upcoming" },
    { time: "6:00 PM", area: "Perimeter Check", status: "upcoming" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800";
      case "offline":
        return "bg-red-100 text-red-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "investigating":
        return "bg-yellow-100 text-yellow-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {language === "en"
            ? "Security Officer Dashboard"
            : "Papan Pemuka Pegawai Keselamatan"}
        </h1>
        <p className="text-muted-foreground">
          {language === "en"
            ? "Security monitoring and incident management"
            : "Pemantauan keselamatan dan pengurusan insiden"}
        </p>
      </div>

      <AnnouncementSlideshow />

      {/* Panic Alert Management - High Priority Section */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            {language === "en"
              ? "Emergency Panic Alerts"
              : "Amaran Panik Kecemasan"}
          </CardTitle>
          <CardDescription>
            {language === "en"
              ? "Monitor and respond to emergency panic alerts from residents"
              : "Pantau dan respon kepada amaran panik kecemasan daripada penduduk"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActivePanicAlerts />
        </CardContent>
      </Card>

      {/* Security Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {securityMetrics.map((metric, index) => (
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

      <div className="grid grid-cols-1 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {language === "en"
                  ? "Security Operations Status"
                  : "Status Operasi Keselamatan"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {loadingCameras
                  ? (language === "en" ? "Loading system status..." : "Memuatkan status sistem...")
                  : totalCameras === 0
                  ? (language === "en" 
                      ? "No CCTV cameras configured. Contact administrator to set up security monitoring."
                      : "Tiada kamera CCTV dikonfigurasikan. Hubungi pentadbir untuk menyediakan pemantauan keselamatan.")
                  : (language === "en"
                      ? `${totalCameras} CCTV cameras configured. ${onlineCameras} active, ${offlineCameras} offline. System uptime: ${cameraUptime}%.`
                      : `${totalCameras} kamera CCTV dikonfigurasikan. ${onlineCameras} aktif, ${offlineCameras} luar talian. Masa operasi sistem: ${cameraUptime}%.`)
                }
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CCTV Camera Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              {language === "en" ? "CCTV Camera Status" : "Status Kamera CCTV"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {loadingCameras ? (
                <div className="col-span-full text-center py-4 text-muted-foreground">
                  {language === "en" ? "Loading cameras..." : "Memuatkan kamera..."}
                </div>
              ) : cameras.length === 0 ? (
                <div className="col-span-full text-center py-4 text-muted-foreground">
                  {language === "en" ? "No cameras configured" : "Tiada kamera dikonfigurasikan"}
                </div>
              ) : (
                cameras.map((camera) => (
                  <div
                    key={camera.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg space-y-2 sm:space-y-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{camera.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {camera.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(camera.is_active ? "online" : "offline")}>
                        {camera.is_active 
                          ? (language === "en" ? "online" : "dalam talian")
                          : (language === "en" ? "offline" : "luar talian")
                        }
                      </Badge>
                      {camera.is_active && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCameraView(camera.id, camera.name)}
                          title={
                            language === "en"
                              ? "View Camera Feed"
                              : "Lihat Paparan Kamera"
                          }
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Incidents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {language === "en" ? "Recent Incidents" : "Insiden Terkini"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentIncidents.map((incident, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary">{incident.type}</Badge>
                    <Badge className={getStatusColor(incident.status)}>
                      {incident.status}
                    </Badge>
                  </div>
                  <p className="text-sm">{incident.description}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    {incident.time}
                  </div>
                </div>
                {incident.status === "resolved" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleIncidentReview(incident.type)}
                  >
                    {language === "en" ? "Review" : "Semak"}
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === "en" ? "Quick Actions" : "Tindakan Pantas"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              className="flex items-center gap-2 h-12"
              onClick={() => handleQuickAction("cameras")}
            >
              <Camera className="h-4 w-4" />
              {language === "en" ? "View All Cameras" : "Lihat Semua Kamera"}
            </Button>
            <Button
              className="flex items-center gap-2 h-12"
              variant="outline"
              onClick={() => handleQuickAction("visitors")}
            >
              <Users className="h-4 w-4" />
              {language === "en" ? "Visitor Log" : "Log Pelawat"}
            </Button>
            <Button
              className="flex items-center gap-2 h-12"
              variant="outline"
              onClick={() => handleQuickAction("complaints_center")}
            >
              <AlertTriangle className="h-4 w-4" />
              {language === "en" ? "Complaints Center" : "Pusat Aduan"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
