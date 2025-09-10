import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertTriangle,
  MapPin,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Eye,
  Navigation,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PanicAlert {
  id: string;
  user_id: string;
  location_latitude?: number;
  location_longitude?: number;
  location_address?: string;
  alert_status: "active" | "responded" | "resolved" | "false_alarm";
  response_time?: string;
  responded_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  district_id?: string;
  profiles?: {
    full_name: string;
    email: string;
    phone?: string;
  };
}

export default function ActivePanicAlerts() {
  const { language, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<PanicAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<PanicAlert | null>(null);
  const [responseNotes, setResponseNotes] = useState("");

  useEffect(() => {
    fetchActiveAlerts();

    // Set up real-time subscription for new panic alerts
    const channel = supabase
      .channel("panic-alerts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "panic_alerts",
        },
        (payload) => {
          console.log("New panic alert received:", payload);
          fetchActiveAlerts(); // Refresh the list

          // Show urgent notification
          toast({
            title: "🚨 NEW PANIC ALERT",
            description:
              language === "en"
                ? "A resident has triggered a panic alert. Immediate attention required!"
                : "Seorang penduduk telah mencetuskan amaran panik. Perhatian segera diperlukan!",
            variant: "destructive",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [language, toast]);

  const fetchActiveAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from("panic_alerts")
        .select(`*`)
        .eq("alert_status", "active")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching active panic alerts:", error);
        return;
      }

      // Fetch profiles separately for each user_id
      const userIds = [...new Set(data?.map((alert) => alert.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone")
        .in("user_id", userIds);

      // Create a map of user profiles
      const profileMap = new Map(
        profiles?.map((profile) => [profile.id, profile]) || []
      );

      const alertsWithProfiles: PanicAlert[] = (data || []).map((alert) => ({
        ...alert,
        alert_status: alert.alert_status as
          | "active"
          | "responded"
          | "resolved"
          | "false_alarm",
        profiles: profileMap.get(alert.user_id),
      }));

      setAlerts(alertsWithProfiles);
    } catch (error) {
      console.error("Error fetching active panic alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateAlertStatus = async (
    alertId: string,
    status: PanicAlert["alert_status"],
    notes?: string
  ) => {
    try {
      const { error } = await supabase
        .from("panic_alerts")
        .update({
          alert_status: status,
          response_time: new Date().toISOString(),
          responded_by: user?.id,
          notes: notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", alertId);

      if (error) {
        console.error("Error updating alert:", error);
        toast({
          title: "Error",
          description: "Failed to update alert status",
          variant: "destructive",
        });
        return;
      }

      // Refresh alerts
      fetchActiveAlerts();
      setSelectedAlert(null);
      setResponseNotes("");

      toast({
        title: "Success",
        description:
          language === "en"
            ? `Alert marked as ${status}`
            : `Amaran ditandakan sebagai ${status}`,
      });
    } catch (error) {
      console.error("Error updating alert status:", error);
    }
  };

  const openMaps = (alert: PanicAlert) => {
    if (alert.location_latitude && alert.location_longitude) {
      const url = `https://www.google.com/maps?q=${alert.location_latitude},${alert.location_longitude}`;
      window.open(url, "_blank");
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1)
      return language === "en" ? "Just now" : "Baru sahaja";
    if (diffInMinutes < 60)
      return `${diffInMinutes}${language === "en" ? "m ago" : "m lalu"}`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return `${diffInHours}${language === "en" ? "h ago" : "j lalu"}`;

    return date.toLocaleDateString(language === "en" ? "en-US" : "ms-MY");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">Loading...</div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">
          {language === "en"
            ? "No active panic alerts"
            : "Tiada amaran panik aktif"}
        </p>
        <Button
          variant="outline"
          onClick={() => navigate("/panic-alerts")}
          className="mt-2"
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          {language === "en" ? "View All Alerts" : "Lihat Semua Amaran"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="text-lg px-3 py-1">
            {alerts.length} {language === "en" ? "Active" : "Aktif"}
          </Badge>
        </div>
        <Button variant="outline" onClick={() => navigate("/panic-alerts")}>
          <ArrowRight className="w-4 h-4 mr-2" />
          {language === "en" ? "Manage All" : "Urus Semua"}
        </Button>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm break-words">
                    {language === "en" ? "Alert from: " : "Amaran daripada: "}
                    {alert.profiles?.full_name ||
                      alert.profiles?.email ||
                      `User ID: ${alert.user_id}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(alert.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {alert.location_latitude && alert.location_longitude && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openMaps(alert)}
                    className="w-full sm:w-auto h-9"
                  >
                    <Navigation className="w-3 h-3 mr-2" />
                    {language === "en" ? "Location" : "Lokasi"}
                  </Button>
                )}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 w-full sm:w-auto h-9 font-medium"
                      onClick={() => {
                        setSelectedAlert(alert);
                        setResponseNotes("");
                      }}
                    >
                      {language === "en" ? "RESPOND" : "RESPON"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-lg mx-auto">
                    <DialogHeader className="pb-4">
                      <DialogTitle className="flex items-center gap-2 text-red-600 text-lg">
                        <AlertTriangle className="w-5 h-5" />
                        {language === "en"
                          ? "Emergency Response"
                          : "Respon Kecemasan"}
                      </DialogTitle>
                      <DialogDescription className="text-base">
                        {language === "en"
                          ? "Respond to panic alert"
                          : "Respon kepada amaran panik"}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                      <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                        <div className="flex items-start gap-3">
                          <User className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          <span className="font-semibold text-base">
                            {alert.profiles?.full_name || alert.profiles?.email}
                          </span>
                        </div>

                        {alert.profiles?.phone && (
                          <div className="flex items-start gap-3">
                            <div className="w-5 h-5 mt-0.5 flex-shrink-0 flex justify-center">
                              📞
                            </div>
                            <span className="text-sm font-medium">
                              {alert.profiles.phone}
                            </span>
                          </div>
                        )}

                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">
                            {new Date(alert.created_at).toLocaleString(
                              language === "en" ? "en-US" : "ms-MY"
                            )}
                          </span>
                        </div>

                        {alert.location_address && (
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <span className="text-sm break-words">
                              {alert.location_address}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-medium block">
                          {language === "en" ? "Response Notes" : "Nota Respon"}
                        </label>
                        <Textarea
                          value={responseNotes}
                          onChange={(e) => setResponseNotes(e.target.value)}
                          placeholder={
                            language === "en"
                              ? "Add notes about your response..."
                              : "Tambah nota tentang respon anda..."
                          }
                          className="min-h-[100px] resize-none"
                          rows={4}
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                className="w-full h-12 text-sm font-medium"
                                variant="default"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                {language === "en"
                                  ? "Mark as Responded"
                                  : "Tandakan sebagai Direspon"}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  {language === "en"
                                    ? "Confirm Response"
                                    : "Sahkan Respons"}
                                </DialogTitle>
                                <DialogDescription>
                                  {language === "en"
                                    ? "Please provide details about your response to this panic alert."
                                    : "Sila berikan butiran mengenai respons anda kepada amaran panik ini."}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium block mb-2">
                                    {language === "en"
                                      ? "Response Details (Required)"
                                      : "Butiran Respons (Diperlukan)"}
                                  </label>
                                  <Textarea
                                    value={responseNotes}
                                    onChange={(e) =>
                                      setResponseNotes(e.target.value)
                                    }
                                    placeholder={
                                      language === "en"
                                        ? "Describe the actions taken in response to this alert..."
                                        : "Huraikan tindakan yang diambil sebagai respons kepada amaran ini..."
                                    }
                                    className="min-h-[100px]"
                                    required
                                  />
                                </div>
                                <Button
                                  onClick={() => {
                                    if (responseNotes.trim()) {
                                      updateAlertStatus(
                                        alert.id,
                                        "responded",
                                        responseNotes
                                      );
                                    } else {
                                      toast({
                                        title:
                                          language === "en"
                                            ? "Required Field"
                                            : "Medan Diperlukan",
                                        description:
                                          language === "en"
                                            ? "Please provide response details before proceeding."
                                            : "Sila berikan butiran respons sebelum meneruskan.",
                                        variant: "destructive",
                                      });
                                    }
                                  }}
                                  className="w-full"
                                  disabled={!responseNotes.trim()}
                                >
                                  {language === "en"
                                    ? "Confirm Response"
                                    : "Sahkan Respons"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                className="w-full h-12 text-sm font-medium"
                                variant="default"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {language === "en"
                                  ? "Mark as Resolved"
                                  : "Tandakan sebagai Selesai"}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  {language === "en"
                                    ? "Confirm Resolution"
                                    : "Sahkan Penyelesaian"}
                                </DialogTitle>
                                <DialogDescription>
                                  {language === "en"
                                    ? "Please provide details about how this panic alert was resolved."
                                    : "Sila berikan butiran mengenai bagaimana amaran panik ini diselesaikan."}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium block mb-2">
                                    {language === "en"
                                      ? "Resolution Details (Required)"
                                      : "Butiran Penyelesaian (Diperlukan)"}
                                  </label>
                                  <Textarea
                                    value={responseNotes}
                                    onChange={(e) =>
                                      setResponseNotes(e.target.value)
                                    }
                                    placeholder={
                                      language === "en"
                                        ? "Describe how the situation was resolved and any follow-up actions..."
                                        : "Huraikan bagaimana situasi diselesaikan dan sebarang tindakan susulan..."
                                    }
                                    className="min-h-[100px]"
                                    required
                                  />
                                </div>
                                <Button
                                  onClick={() => {
                                    if (responseNotes.trim()) {
                                      updateAlertStatus(
                                        alert.id,
                                        "resolved",
                                        responseNotes
                                      );
                                    } else {
                                      toast({
                                        title:
                                          language === "en"
                                            ? "Required Field"
                                            : "Medan Diperlukan",
                                        description:
                                          language === "en"
                                            ? "Please provide resolution details before proceeding."
                                            : "Sila berikan butiran penyelesaian sebelum meneruskan.",
                                        variant: "destructive",
                                      });
                                    }
                                  }}
                                  className="w-full"
                                  disabled={!responseNotes.trim()}
                                >
                                  {language === "en"
                                    ? "Confirm Resolution"
                                    : "Sahkan Penyelesaian"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>

                        <Button
                          onClick={() =>
                            updateAlertStatus(
                              alert.id,
                              "false_alarm",
                              responseNotes
                            )
                          }
                          variant="outline"
                          className="w-full h-12 text-sm font-medium"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          {language === "en"
                            ? "Mark as False Alarm"
                            : "Tandakan sebagai Amaran Palsu"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
