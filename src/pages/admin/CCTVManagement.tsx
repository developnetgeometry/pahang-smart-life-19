import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/use-user-roles";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Camera,
  Plus,
  Search,
  Monitor,
  AlertTriangle,
  Eye,
  Settings,
  Play,
  Pause,
  Download,
  Video,
  VideoOff,
  Maximize,
  RotateCcw,
  Signal,
  SignalHigh,
  SignalLow,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Home,
  Square,
  Wifi,
  WifiOff,
  Activity,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import StreamPlayer from "@/components/cctv/StreamPlayer";
import type { Database } from "@/integrations/supabase/types";
import { Trash2 } from "lucide-react";
import Hls from "hls.js";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CCTVCamera {
  id: string;
  name: string;
  location: string;
  type: "indoor" | "outdoor" | "entrance" | "parking";
  status: "online" | "offline" | "maintenance" | "error";
  signal: "high" | "medium" | "low";
  resolution: string;
  recording: boolean;
  lastSeen: string;
  communityId: string;
  streamUrl: string;
  hasPtz: boolean;
  presets?: string[];
}

interface Recording {
  id: string;
  cameraId: string;
  cameraName: string;
  startTime: string;
  duration: string;
  fileSize: string;
  type: "motion" | "scheduled" | "manual" | "incident";
}

type CctvRow = Database["public"]["Tables"]["cctv_cameras"]["Row"];

export default function CCTVManagement() {
  const { language, hasRole } = useAuth();
  const { hasRole: hasUserRole } = useUserRoles();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [newCam, setNewCam] = useState<{
    name: string;
    location: string;
    type: CCTVCamera["type"] | "";
    streamUrl: string;
    districtId: string;
    communityId: string;
  }>({
    name: "",
    location: "",
    type: "",
    streamUrl: "",
    districtId: "",
    communityId: "",
  });
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedCommunity, setSelectedCommunity] = useState("all");
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>(
    []
  );
  const [communities, setCommunities] = useState<
    { id: string; name: string; district_id: string }[]
  >([]);
  const [isAddCameraOpen, setIsAddCameraOpen] = useState(false);
  const [isEditCameraOpen, setIsEditCameraOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [motionDetectionEnabled, setMotionDetectionEnabled] = useState(false);
  const [motionSensitivity, setMotionSensitivity] = useState([30]);
  const [motionEvents] = useState<
    Array<{ id: string; timestamp: string; camera: string }>
  >([]);
  const [rtspConnected, setRtspConnected] = useState(false);
  const [ptzPosition, setPtzPosition] = useState({ pan: 0, tilt: 0, zoom: 1 });
  const [activeTab, setActiveTab] = useState("cameras");
  const [isLiveViewOpen, setIsLiveViewOpen] = useState(false);
  const [liveViewCamera, setLiveViewCamera] = useState<CCTVCamera | null>(null);
  const [editStreamUrl, setEditStreamUrl] = useState("");
  const [editCam, setEditCam] = useState<{
    id: string;
    name: string;
    location: string;
    type: CCTVCamera["type"];
    streamUrl: string;
    isActive: boolean;
    districtId: string;
    communityId: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CCTVCamera | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [selectedCameras, setSelectedCameras] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  const text = {
    en: {
      title: "CCTV Management",
      subtitle: "Monitor and manage security cameras",
      addCamera: "Add Camera",
      search: "Search cameras...",
      status: "Status",
      location: "Location",
      allStatuses: "All Statuses",
      allLocations: "All Locations",
      online: "Online",
      offline: "Offline",
      maintenance: "Maintenance",
      error: "Error",
      indoor: "Indoor",
      outdoor: "Outdoor",
      entrance: "Entrance",
      parking: "Parking",
      liveView: "Live View",
      settings: "Settings",
      recording: "Recording",
      notRecording: "Not Recording",
      lastSeen: "Last Seen",
      resolution: "Resolution",
      startRecording: "Start Recording",
      stopRecording: "Stop Recording",
      viewRecordings: "View Recordings",
      addCameraTitle: "Add New Camera",
      addCameraSubtitle: "Configure a new security camera",
      cameraName: "Camera Name",
      cameraLocation: "Location",
      cameraType: "Camera Type",
      streamUrl: "Stream URL",
      cancel: "Cancel",
      addCameraBtn: "Add Camera",
      cameraAddedSuccess: "Camera added successfully!",
      recordingStarted: "Recording started",
      recordingStopped: "Recording stopped",
      recordings: "Recordings",
      cameras: "Cameras",
      overview: "Overview",
      totalCameras: "Total Cameras",
      onlineCameras: "Online Cameras",
      recordingCameras: "Recording",
      storageUsed: "Storage Used",
      downloadRecording: "Download",
      playRecording: "Play",
      motion: "Motion",
      scheduled: "Scheduled",
      manual: "Manual",
      incident: "Incident",
      liveFeed: "Live Feed",
      allCameras: "All Cameras",
      signalStrength: "Signal Strength",
      high: "High",
      medium: "Medium",
      low: "Low",
      lastUpdate: "Last Update",
      fullscreen: "Fullscreen",
      refresh: "Refresh",
      liveFeedView: "Live Feed View",
      noSignal: "No Signal",
      connecting: "Connecting...",
      cameraOffline: "Camera is currently offline",
      ptzControls: "PTZ Controls",
      pan: "Pan",
      tilt: "Tilt",
      zoom: "Zoom",
      presets: "Presets",
      home: "Home",
      rtspConnection: "RTSP Connection",
      connected: "Connected",
      disconnected: "Disconnected",
      connect: "Connect",
      disconnect: "Disconnect",
      motionDetection: "Motion Detection",
      enableMotionDetection: "Enable Motion Detection",
      sensitivity: "Sensitivity",
      recentEvents: "Recent Events",
      noMotionEvents: "No motion events detected",
      selectCamera: "Select Camera",
      district: "District",
      community: "Community",
      allDistricts: "All Districts",
      allCommunities: "All Communities",
    },
    ms: {
      title: "Pengurusan CCTV",
      subtitle: "Monitor dan urus kamera keselamatan",
      addCamera: "Tambah Kamera",
      search: "Cari kamera...",
      status: "Status",
      location: "Lokasi",
      allStatuses: "Semua Status",
      allLocations: "Semua Lokasi",
      online: "Dalam Talian",
      offline: "Luar Talian",
      maintenance: "Penyelenggaraan",
      error: "Ralat",
      indoor: "Dalam Bangunan",
      outdoor: "Luar Bangunan",
      entrance: "Pintu Masuk",
      parking: "Tempat Letak Kereta",
      liveView: "Paparan Langsung",
      settings: "Tetapan",
      recording: "Merakam",
      notRecording: "Tidak Merakam",
      lastSeen: "Terakhir Dilihat",
      resolution: "Resolusi",
      startRecording: "Mula Rakam",
      stopRecording: "Henti Rakam",
      viewRecordings: "Lihat Rakaman",
      addCameraTitle: "Tambah Kamera Baru",
      addCameraSubtitle: "Konfigurasi kamera keselamatan baru",
      cameraName: "Nama Kamera",
      cameraLocation: "Lokasi",
      cameraType: "Jenis Kamera",
      streamUrl: "URL Stream",
      cancel: "Batal",
      addCameraBtn: "Tambah Kamera",
      cameraAddedSuccess: "Kamera berjaya ditambah!",
      recordingStarted: "Rakaman dimulakan",
      recordingStopped: "Rakaman dihentikan",
      recordings: "Rakaman",
      cameras: "Kamera",
      overview: "Gambaran Keseluruhan",
      totalCameras: "Jumlah Kamera",
      onlineCameras: "Kamera Dalam Talian",
      recordingCameras: "Sedang Merakam",
      storageUsed: "Storan Digunakan",
      downloadRecording: "Muat Turun",
      playRecording: "Main",
      motion: "Pergerakan",
      scheduled: "Terjadual",
      manual: "Manual",
      incident: "Insiden",
      liveFeed: "Suapan Langsung",
      allCameras: "Semua Kamera",
      signalStrength: "Kekuatan Isyarat",
      high: "Tinggi",
      medium: "Sederhana",
      low: "Rendah",
      lastUpdate: "Kemaskini Terakhir",
      fullscreen: "Skrin Penuh",
      refresh: "Muat Semula",
      liveFeedView: "Paparan Suapan Langsung",
      noSignal: "Tiada Isyarat",
      connecting: "Menyambung...",
      cameraOffline: "Kamera sedang luar talian",
      ptzControls: "Kawalan PTZ",
      pan: "Pan",
      tilt: "Tilt",
      zoom: "Zum",
      presets: "Pratetap",
      home: "Rumah",
      rtspConnection: "Sambungan RTSP",
      connected: "Disambung",
      disconnected: "Terputus",
      connect: "Sambung",
      disconnect: "Putus",
      motionDetection: "Pengesanan Pergerakan",
      enableMotionDetection: "Aktifkan Pengesanan Pergerakan",
      sensitivity: "Kepekaan",
      recentEvents: "Acara Terkini",
      noMotionEvents: "Tiada acara pergerakan dikesan",
      selectCamera: "Pilih Kamera",
      district: "Daerah",
      community: "Komuniti",
      allDistricts: "Semua Daerah",
      allCommunities: "Semua Komuniti",
    },
  };

  const t = text[language];
  // Quick demo camera insertion with a public HLS sample stream
  const addDemoCamera = async () => {
    const demoUrl = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
    try {
      setIsTesting(true);
      await validateStream(demoUrl);
    } catch (e: any) {
      setIsTesting(false);
      toast({
        title: "Demo stream error",
        description: e?.message || "Failed to validate demo stream",
      });
      return;
    } finally {
      setIsTesting(false);
    }
    const { data, error } = await supabase
      .from("cctv_cameras")
      .insert({
        name: "Sample HLS Camera",
        location: "Demo Area",
        camera_type: "indoor",
        resolution: "1080p",
        stream_url: demoUrl,
        is_active: true,
        pan_tilt_zoom: false,
      })
      .select(
        "id, name, location, camera_type, resolution, stream_url, is_active, pan_tilt_zoom, created_at"
      )
      .single();
    if (error) {
      toast({ title: "Error", description: "Failed to add demo camera" });
      return;
    }
    const row = data as CctvRow;
    const nowCam: CCTVCamera = {
      id: row.id,
      name: row.name,
      location: row.location,
      type: (row.camera_type as CCTVCamera["type"]) || "indoor",
      status: row.is_active ? "online" : "offline",
      signal: "high",
      resolution: row.resolution || "1080p",
      recording: false,
      lastSeen: new Date(row.created_at || Date.now())
        .toISOString()
        .replace("T", " ")
        .slice(0, 19),
      communityId: "0",
      streamUrl: row.stream_url || "",
      hasPtz: !!row.pan_tilt_zoom,
    };
    setCameras((prev) => [nowCam, ...prev]);
    toast({
      title: "Demo camera added",
      description: "A working sample feed was added",
    });
  };

  // Load cameras from Supabase with real-time updates
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("cctv_cameras")
        .select(
          "id, name, location, camera_type, resolution, stream_url, is_active, pan_tilt_zoom, created_at, district_id, community_id"
        )
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Failed to load cameras", error);
        toast({ title: "Error", description: "Failed to load cameras" });
        return;
      }
      const mapped: CCTVCamera[] = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        location: row.location,
        type: (row.camera_type as CCTVCamera["type"]) || "indoor",
        status: row.is_active ? "online" : "offline",
        signal: "high",
        resolution: row.resolution || "1080p",
        recording: false,
        lastSeen: new Date(row.created_at || Date.now())
          .toISOString()
          .replace("T", " ")
          .slice(0, 19),
        communityId: row.community_id || "0",
        streamUrl: row.stream_url || "",
        hasPtz: !!row.pan_tilt_zoom,
      }));
      setCameras(mapped);
    };

    load();

    // Set up real-time subscription
    const channel = supabase
      .channel("cctv-cameras-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cctv_cameras",
        },
        () => {
          // Reload cameras when any change occurs
          load();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const [cameras, setCameras] = useState<CCTVCamera[]>([]);

  const mockRecordings: Recording[] = [
    {
      id: "1",
      cameraId: "1",
      cameraName: "Main Entrance",
      startTime: "2024-01-15 09:00:00",
      duration: "1h 30m",
      fileSize: "2.5 GB",
      type: "motion",
    },
    {
      id: "2",
      cameraId: "1",
      cameraName: "Main Entrance",
      startTime: "2024-01-15 07:30:00",
      duration: "45m",
      fileSize: "1.2 GB",
      type: "scheduled",
    },
    {
      id: "3",
      cameraId: "3",
      cameraName: "Lobby Camera",
      startTime: "2024-01-14 14:15:00",
      duration: "2h 10m",
      fileSize: "3.8 GB",
      type: "incident",
    },
  ];

  // Helpers to detect type
  const isHls = (url: string) => /\.m3u8(\?.*)?$/i.test(url);
  const isMp4 = (url: string) => /\.(mp4|webm)(\?.*)?$/i.test(url);
  const isMjpeg = (url: string) => {
    const u = url.toLowerCase();
    return (
      u.includes("mjpeg") ||
      u.includes("mjpg") ||
      u.includes("nphmotionjpeg") ||
      u.includes("action=stream")
    );
  };
  const isRtsp = (url: string) => url.toLowerCase().startsWith("rtsp://");

  // Validate streams for multiple types; for RTSP we require a gateway to HLS
  const validateStream = async (url: string, timeoutMs = 6000) => {
    const mjpegProxy = import.meta.env.VITE_MJPEG_PROXY_URL as
      | string
      | undefined;
    const gateway = import.meta.env.VITE_STREAM_GATEWAY_URL as
      | string
      | undefined;

    const validateHls = async (hlsUrl: string) => {
      if (!/^https?:\/\/.+\.m3u8(\?.*)?$/i.test(hlsUrl)) {
        throw new Error("URL must be an HLS .m3u8 over http(s)");
      }

      // For cross-origin URLs (like ngrok), skip fetch validation and rely on player handling
      try {
        const url = new URL(hlsUrl);
        const isLocalhost =
          url.hostname === "localhost" || url.hostname === "127.0.0.1";
        const isSameOrigin = url.origin === window.location.origin;

        if (!isLocalhost && !isSameOrigin) {
          console.log(
            "Skipping validation for cross-origin HLS URL, will rely on player CORS handling"
          );
          return; // Skip validation for cross-origin URLs
        }

        // Only validate same-origin or localhost URLs
        const response = await fetch(hlsUrl, {
          method: "HEAD",
          cache: "no-cache",
        });
        if (!response.ok && response.status !== 405) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error: any) {
        // If validation fails, log warning but don't block - let player handle it
        console.warn(
          "HLS URL validation failed, proceeding anyway:",
          error.message
        );
      }

      const video = document.createElement("video");
      const supportsNative =
        video.canPlayType("application/vnd.apple.mpegurl") !== "";
      let resolved = false;
      let hls: Hls | null = null;
      const cleanup = () => {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      };
      try {
        await new Promise<void>((resolve, reject) => {
          const timer = window.setTimeout(() => {
            if (!resolved) {
              cleanup();
              reject(new Error("Stream validation timed out"));
            }
          }, timeoutMs);

          const onSuccess = () => {
            resolved = true;
            window.clearTimeout(timer);
            cleanup();
            resolve();
          };
          const onError = (err?: any) => {
            window.clearTimeout(timer);
            cleanup();
            // For CORS-related errors during validation, be more permissive
            if (
              err &&
              (err.message?.includes("CORS") ||
                err.message?.includes("network"))
            ) {
              console.warn(
                "HLS validation failed with network/CORS error, assuming stream will work:",
                err.message
              );
              resolve(); // Allow it through - let the actual player handle CORS
            } else {
              reject(err || new Error("Failed to load HLS manifest"));
            }
          };

          if (supportsNative) {
            video.src = hlsUrl;
            video.onloadedmetadata = onSuccess;
            video.onerror = onError;
            video.load();
          } else if (Hls.isSupported()) {
            hls = new Hls({ enableWorker: true });
            hls.on(Hls.Events.MANIFEST_PARSED, onSuccess);
            hls.on(Hls.Events.ERROR, (_evt, data) => {
              if (data?.fatal) {
                const errorMsg = `${data.type}:${data.details}`;
                onError(new Error(errorMsg));
              }
            });
            hls.loadSource(hlsUrl);
            hls.attachMedia(video);
          } else {
            onError(new Error("HLS not supported in this browser"));
          }
        });
      } finally {
        cleanup();
      }
    };

    const validateVideoUrl = async (videoUrl: string) => {
      const v = document.createElement("video");
      await new Promise<void>((resolve, reject) => {
        const timer = window.setTimeout(
          () => reject(new Error("Video validation timed out")),
          timeoutMs
        );
        v.onloadedmetadata = () => {
          window.clearTimeout(timer);
          resolve();
        };
        v.onerror = () => {
          window.clearTimeout(timer);
          reject(new Error("Failed to load video"));
        };
        v.src = videoUrl;
        v.load();
      });
    };

    const validateMjpeg = async (mjpegUrl: string) => {
      const testImg = new Image();
      const target = mjpegProxy
        ? `${mjpegProxy}?url=${encodeURIComponent(mjpegUrl)}`
        : mjpegUrl;
      await new Promise<void>((resolve, reject) => {
        const timer = window.setTimeout(
          () => reject(new Error("MJPEG validation timed out")),
          timeoutMs
        );
        testImg.onload = () => {
          window.clearTimeout(timer);
          resolve();
        };
        testImg.onerror = () => {
          window.clearTimeout(timer);
          reject(new Error("Failed to load MJPEG frame"));
        };
        testImg.src = target;
      });
    };

    if (isHls(url)) return validateHls(url);
    if (isMp4(url)) return validateVideoUrl(url);
    if (isMjpeg(url)) return validateMjpeg(url);
    if (isRtsp(url)) {
      if (!gateway)
        throw new Error(
          "RTSP requires VITE_STREAM_GATEWAY_URL to be configured"
        );
      const hlsFromGateway = `${gateway}?src=${encodeURIComponent(url)}`;
      return validateHls(hlsFromGateway);
    }
    // Fallback: try video then mjpeg
    try {
      await validateVideoUrl(url);
    } catch {
      await validateMjpeg(url);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800";
      case "offline":
        return "bg-red-100 text-red-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return t.online;
      case "offline":
        return t.offline;
      case "maintenance":
        return t.maintenance;
      case "error":
        return t.error;
      default:
        return status;
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case "high":
        return <SignalHigh className="h-4 w-4 text-green-600" />;
      case "medium":
        return <Signal className="h-4 w-4 text-yellow-600" />;
      case "low":
        return <SignalLow className="h-4 w-4 text-red-600" />;
      default:
        return <Signal className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSignalText = (signal: string) => {
    switch (signal) {
      case "high":
        return t.high;
      case "medium":
        return t.medium;
      case "low":
        return t.low;
      default:
        return signal;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "motion":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "scheduled":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "manual":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "incident":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  // Role-based permissions configuration
  const getRolePermissions = () => {
    const permissions = {
      canViewAllCameras: false,
      canManageCameras: false,
      canViewFilters: false,
      canViewRecordings: false,
      canViewTabs: false,
      canAssignCommunities: false,
      scope: "none" as "state" | "district" | "community" | "none",
    };

    if (hasUserRole("state_admin")) {
      return {
        ...permissions,
        canViewAllCameras: true,
        canManageCameras: true,
        canViewFilters: true,
        canViewRecordings: true,
        canViewTabs: true,
        canAssignCommunities: true,
        scope: "state" as const,
      };
    }
    if (hasUserRole("district_coordinator")) {
      return {
        ...permissions,
        canViewAllCameras: true,
        canManageCameras: true,
        canViewFilters: true,
        canViewRecordings: true,
        canViewTabs: true,
        canAssignCommunities: true,
        scope: "district" as const,
      };
    }
    if (hasUserRole("community_admin")) {
      return {
        ...permissions,
        canViewAllCameras: true,
        canManageCameras: true,
        canViewFilters: true,
        canViewRecordings: true,
        canViewTabs: true,
        canAssignCommunities: false,
        scope: "community" as const,
      };
    }
    if (hasUserRole("security_officer")) {
      return {
        ...permissions,
        canViewAllCameras: true,
        canManageCameras: true,
        canViewFilters: true,
        canViewRecordings: true,
        canViewTabs: true,
        canAssignCommunities: false,
        scope: "district" as const,
      };
    }
    if (hasUserRole("community_leader")) {
      return {
        ...permissions,
        canViewAllCameras: true,
        canManageCameras: false,
        canViewFilters: false,
        canViewRecordings: false,
        canViewTabs: false,
        canAssignCommunities: false,
        scope: "community" as const,
      };
    }
    if (
      hasUserRole("resident") ||
      hasUserRole("spouse") ||
      hasUserRole("guest")
    ) {
      return {
        ...permissions,
        canViewAllCameras: false,
        canManageCameras: false,
        canViewFilters: false,
        canViewRecordings: false,
        canViewTabs: false,
        canAssignCommunities: false,
        scope: "community" as const,
      };
    }

    return permissions;
  };

  const rolePermissions = getRolePermissions();

  // Load districts and communities for filters
  useEffect(() => {
    const loadFiltersData = async () => {
      // Load districts
      const { data: districtsData } = await supabase
        .from("districts")
        .select("id, name")
        .order("name");

      if (districtsData) {
        setDistricts(districtsData);
      }

      // Load communities
      const { data: communitiesData } = await supabase
        .from("communities")
        .select("id, name, district_id")
        .order("name");

      if (communitiesData) {
        setCommunities(communitiesData);
      }
    };

    if (rolePermissions.canViewFilters) {
      loadFiltersData();
    }
  }, [rolePermissions.canViewFilters]);

  // Role-based camera filtering with search and status filters
  const searchFilteredCameras = cameras.filter((camera) => {
    // Role-based visibility control
    const { user } = useAuth();
    const userCommunityId = user?.active_community_id;

    // For residents, spouses, and guests - only show cameras assigned to their community
    if (
      hasUserRole("resident") ||
      hasUserRole("spouse") ||
      hasUserRole("guest")
    ) {
      const cameraInUserCommunity =
        (camera as any).community_id === userCommunityId;
      if (!cameraInUserCommunity) return false;
    }

    // For community leaders and community admins - only show cameras in their community
    if (hasUserRole("community_leader") || hasUserRole("community_admin")) {
      const cameraInUserCommunity =
        (camera as any).community_id === userCommunityId;
      if (!cameraInUserCommunity) return false;
    }

    // Security officers, district coordinators, and state admins can see all cameras
    // (but still respect the filter controls if they choose to use them)

    // Basic search and filter matching
    const matchesSearch =
      !rolePermissions.canViewFilters ||
      camera.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camera.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      !rolePermissions.canViewFilters ||
      selectedStatus === "all" ||
      camera.status === selectedStatus;

    const matchesLocation =
      !rolePermissions.canViewFilters ||
      selectedLocation === "all" ||
      camera.type === selectedLocation;

    // District and community filtering based on camera data
    const matchesDistrict =
      !rolePermissions.canViewFilters ||
      selectedDistrict === "all" ||
      selectedDistrict === (camera as any).district_id;

    const matchesCommunity =
      !rolePermissions.canViewFilters ||
      selectedCommunity === "all" ||
      selectedCommunity === (camera as any).community_id;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesLocation &&
      matchesDistrict &&
      matchesCommunity
    );
  });

  const handleAddCamera = async () => {
    if (!newCam.name || !newCam.location || !newCam.type || !newCam.streamUrl) {
      toast({ title: t.addCameraTitle, description: "Please fill all fields" });
      return;
    }

    // For state admin and district coordinator, require community assignment
    if (
      rolePermissions.canAssignCommunities &&
      (!newCam.districtId || !newCam.communityId)
    ) {
      toast({
        title: t.addCameraTitle,
        description:
          language === "en"
            ? "Please select district and community"
            : "Sila pilih daerah dan komuniti",
      });
      return;
    }

    try {
      setIsTesting(true);
      await validateStream(newCam.streamUrl);
    } catch (e: any) {
      setIsTesting(false);
      toast({
        title: "Invalid stream",
        description: e?.message || "Failed to validate HLS URL",
      });
      return;
    } finally {
      setIsTesting(false);
    }

    const { data, error } = await supabase
      .from("cctv_cameras")
      .insert({
        name: newCam.name,
        location: newCam.location,
        camera_type: newCam.type,
        resolution: "1080p",
        stream_url: newCam.streamUrl,
        is_active: true,
        pan_tilt_zoom: false,
        district_id: newCam.districtId || null,
        community_id: newCam.communityId || null,
      })
      .select(
        "id, name, location, camera_type, resolution, stream_url, is_active, pan_tilt_zoom, created_at, district_id, community_id"
      )
      .single();
    if (error) {
      console.error("Failed to add camera", error);
      toast({ title: "Error", description: "Failed to add camera" });
      return;
    }
    const row = data as CctvRow;
    const nowCam: CCTVCamera = {
      id: row.id,
      name: row.name,
      location: row.location,
      type: (row.camera_type as CCTVCamera["type"]) || "indoor",
      status: row.is_active ? "online" : "offline",
      signal: "high",
      resolution: row.resolution || "1080p",
      recording: false,
      lastSeen: new Date(row.created_at || Date.now())
        .toISOString()
        .replace("T", " ")
        .slice(0, 19),
      communityId: "0",
      streamUrl: row.stream_url || "",
      hasPtz: !!row.pan_tilt_zoom,
    };
    setCameras((prev) => [nowCam, ...prev]);
    setIsAddCameraOpen(false);
    setNewCam({
      name: "",
      location: "",
      type: "",
      streamUrl: "",
      districtId: "",
      communityId: "",
    });
    toast({ title: t.cameraAddedSuccess });
  };

  const handleToggleRecording = (camera: CCTVCamera) => {
    const message = camera.recording ? t.recordingStopped : t.recordingStarted;
    setCameras((prev) =>
      prev.map((c) =>
        c.id === camera.id ? { ...c, recording: !c.recording } : c
      )
    );
    toast({ title: message });
  };

  const handlePtzControl = (direction: string) => {
    const speed = 5;
    setPtzPosition((prev) => {
      switch (direction) {
        case "up":
          return { ...prev, tilt: Math.min(prev.tilt + speed, 90) };
        case "down":
          return { ...prev, tilt: Math.max(prev.tilt - speed, -90) };
        case "left":
          return { ...prev, pan: Math.max(prev.pan - speed, -180) };
        case "right":
          return { ...prev, pan: Math.min(prev.pan + speed, 180) };
        default:
          return prev;
      }
    });
  };

  const handleZoom = (direction: "in" | "out") => {
    setPtzPosition((prev) => ({
      ...prev,
      zoom:
        direction === "in"
          ? Math.min(prev.zoom + 0.1, 10)
          : Math.max(prev.zoom - 0.1, 1),
    }));
  };

  const handlePreset = (preset: string) => {
    console.log(`Moving to preset: ${preset}`);
  };

  const handleRtspConnection = () => {
    if (liveViewCamera?.streamUrl) {
      setRtspConnected(!rtspConnected);
    } else {
      toast({
        title: "No stream URL",
        description: "Please set a valid HLS URL (m3u8) to connect.",
      });
    }
  };

  const handleViewLiveCamera = (camera: CCTVCamera) => {
    setLiveViewCamera(camera);
    setEditStreamUrl(camera.streamUrl || "");
    setIsLiveViewOpen(true);
  };

  const saveStreamUrl = async () => {
    if (!liveViewCamera) return;
    try {
      setIsTesting(true);
      await validateStream(editStreamUrl);
    } catch (e: any) {
      setIsTesting(false);
      toast({
        title: "Invalid stream",
        description: e?.message || "Failed to validate HLS URL",
      });
      return;
    } finally {
      setIsTesting(false);
    }
    const { error } = await supabase
      .from("cctv_cameras")
      .update({ stream_url: editStreamUrl })
      .eq("id", liveViewCamera.id);
    if (error) {
      console.error("Failed to save stream URL", error);
      toast({ title: "Error", description: "Failed to save stream URL" });
      return;
    }
    setCameras((prev) =>
      prev.map((c) =>
        c.id === liveViewCamera.id ? { ...c, streamUrl: editStreamUrl } : c
      )
    );
    setLiveViewCamera({ ...liveViewCamera, streamUrl: editStreamUrl });
    toast({ title: "Saved", description: "Stream URL updated" });
  };

  // moved above to set editStreamUrl

  const mainCamera = cameras[0];

  const onlineCameras = cameras.filter((c) => c.status === "online").length;
  const recordingCameras = cameras.filter((c) => c.recording).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        {(hasRole("security_officer") ||
          hasRole("community_admin") ||
          hasRole("district_coordinator") ||
          hasRole("state_admin") ||
          hasRole("facility_manager")) && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={addDemoCamera}
              disabled={isTesting}
            >
              {isTesting ? "Adding..." : "Add Demo Camera"}
            </Button>
            <Dialog
              open={isAddCameraOpen}
              onOpenChange={(open) => {
                setIsAddCameraOpen(open);
                if (!open)
                  setNewCam({
                    name: "",
                    location: "",
                    type: "",
                    streamUrl: "",
                    districtId: "",
                    communityId: "",
                  });
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t.addCamera}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>{t.addCameraTitle}</DialogTitle>
                  <DialogDescription>{t.addCameraSubtitle}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t.cameraName}</Label>
                    <Input
                      id="name"
                      placeholder={t.cameraName}
                      value={newCam.name}
                      onChange={(e) =>
                        setNewCam((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">{t.cameraLocation}</Label>
                      <Input
                        id="location"
                        placeholder={t.cameraLocation}
                        value={newCam.location}
                        onChange={(e) =>
                          setNewCam((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">{t.cameraType}</Label>
                      <Select
                        value={newCam.type}
                        onValueChange={(v) =>
                          setNewCam((prev) => ({
                            ...prev,
                            type: v as CCTVCamera["type"],
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t.cameraType} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="indoor">{t.indoor}</SelectItem>
                          <SelectItem value="outdoor">{t.outdoor}</SelectItem>
                          <SelectItem value="entrance">{t.entrance}</SelectItem>
                          <SelectItem value="parking">{t.parking}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Community Assignment Fields - Only for state admin and district coordinator */}
                  {rolePermissions.canAssignCommunities && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="district">
                          {language === "en" ? "District" : "Daerah"} *
                        </Label>
                        <Select
                          value={newCam.districtId}
                          onValueChange={(v) => {
                            setNewCam((prev) => ({
                              ...prev,
                              districtId: v,
                              communityId: "", // Reset community when district changes
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                language === "en"
                                  ? "Select District"
                                  : "Pilih Daerah"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {districts.map((district) => (
                              <SelectItem key={district.id} value={district.id}>
                                {district.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="community">
                          {language === "en" ? "Community" : "Komuniti"} *
                        </Label>
                        <Select
                          value={newCam.communityId}
                          onValueChange={(v) =>
                            setNewCam((prev) => ({
                              ...prev,
                              communityId: v,
                            }))
                          }
                          disabled={!newCam.districtId}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                language === "en"
                                  ? "Select Community"
                                  : "Pilih Komuniti"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {communities
                              .filter(
                                (community) =>
                                  !newCam.districtId ||
                                  (community as any).district_id ===
                                    newCam.districtId
                              )
                              .map((community) => (
                                <SelectItem
                                  key={community.id}
                                  value={community.id}
                                >
                                  {community.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="streamUrl">
                      {t.streamUrl} (HLS .m3u8, MJPEG, MP4/WebM or RTSP via
                      gateway)
                    </Label>
                    <Input
                      id="streamUrl"
                      placeholder="https://.../stream.m3u8 | http://.../nphMotionJpeg | rtsp://..."
                      value={newCam.streamUrl}
                      onChange={(e) =>
                        setNewCam((prev) => ({
                          ...prev,
                          streamUrl: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddCameraOpen(false)}
                    >
                      {t.cancel}
                    </Button>
                    <Button onClick={handleAddCamera} disabled={isTesting}>
                      {isTesting ? "Testing..." : t.addCameraBtn}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* User Role Information */}
      {(hasUserRole("resident") ||
        hasUserRole("spouse") ||
        hasUserRole("guest") ||
        hasUserRole("community_leader") ||
        hasUserRole("community_admin")) && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                {language === "en"
                  ? "You can only view CCTV cameras assigned to your community. Contact your administrator for access to other cameras."
                  : "Anda hanya boleh melihat kamera CCTV yang ditetapkan kepada komuniti anda. Hubungi pentadbir untuk akses kepada kamera lain."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Inline Live Feed for Selected or First Camera */}
      <div className="w-full">
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {t.liveFeed} {mainCamera ? `- ${mainCamera.name}` : ""}
            </CardTitle>
            {mainCamera && (
              <CardDescription>
                {mainCamera.location} • {mainCamera.resolution}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="bg-black aspect-video flex items-center justify-center">
              {mainCamera &&
              mainCamera.status === "online" &&
              mainCamera.streamUrl ? (
                <StreamPlayer
                  src={mainCamera.streamUrl}
                  className="w-full h-full object-contain"
                  autoPlay
                  controls
                  muted
                />
              ) : (
                <div className="text-white text-center p-8">
                  <VideoOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{t.cameraOffline}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        {rolePermissions.canViewTabs && (
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cameras">{t.cameras}</TabsTrigger>
            <TabsTrigger value="recordings">{t.recordings}</TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="cameras" className="space-y-6">
          {/* Filters */}
          {rolePermissions.canViewFilters && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t.status} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allStatuses}</SelectItem>
                  <SelectItem value="online">{t.online}</SelectItem>
                  <SelectItem value="offline">{t.offline}</SelectItem>
                  <SelectItem value="maintenance">{t.maintenance}</SelectItem>
                  <SelectItem value="error">{t.error}</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={selectedLocation}
                onValueChange={setSelectedLocation}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t.location} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allLocations}</SelectItem>
                  <SelectItem value="indoor">{t.indoor}</SelectItem>
                  <SelectItem value="outdoor">{t.outdoor}</SelectItem>
                  <SelectItem value="entrance">{t.entrance}</SelectItem>
                  <SelectItem value="parking">{t.parking}</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={selectedDistrict}
                onValueChange={setSelectedDistrict}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t.district} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allDistricts}</SelectItem>
                  {districts.map((district) => (
                    <SelectItem key={district.id} value={district.id}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedCommunity}
                onValueChange={setSelectedCommunity}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t.community} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allCommunities}</SelectItem>
                  {communities.map((community) => (
                    <SelectItem key={community.id} value={community.id}>
                      {community.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Bulk Operations */}
          {rolePermissions.canManageCameras && (
            <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsSelectMode(!isSelectMode);
                    setSelectedCameras([]);
                  }}
                >
                  {isSelectMode ? "Exit Select" : "Select Multiple"}
                </Button>
                {isSelectMode && (
                  <>
                    <span className="text-sm text-muted-foreground">
                      {selectedCameras.length} selected
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const visibleCameraIds = searchFilteredCameras.map(
                          (c) => c.id
                        );
                        if (
                          selectedCameras.length === visibleCameraIds.length
                        ) {
                          setSelectedCameras([]);
                        } else {
                          setSelectedCameras(visibleCameraIds);
                        }
                      }}
                    >
                      {selectedCameras.length === searchFilteredCameras.length
                        ? "Deselect All"
                        : "Select All"}
                    </Button>
                  </>
                )}
              </div>
              {isSelectMode && selectedCameras.length > 0 && (
                <div className="flex items-center gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected ({selectedCameras.length})
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete Multiple Cameras
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete{" "}
                          {selectedCameras.length} selected cameras? This action
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={async () => {
                            const { error } = await supabase
                              .from("cctv_cameras")
                              .delete()
                              .in("id", selectedCameras);

                            if (error) {
                              toast({
                                title: "Error",
                                description: "Failed to delete some cameras",
                              });
                              return;
                            }

                            setCameras((prev) =>
                              prev.filter(
                                (c) => !selectedCameras.includes(c.id)
                              )
                            );
                            setSelectedCameras([]);
                            setIsSelectMode(false);
                            toast({
                              title: "Success",
                              description: `${selectedCameras.length} cameras deleted successfully`,
                            });
                          }}
                        >
                          Delete All
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          )}

          {/* Camera Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchFilteredCameras.map((camera) => (
              <Card key={camera.id} className="overflow-hidden relative">
                {/* Selection Checkbox */}
                {isSelectMode && rolePermissions.canManageCameras && (
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedCameras.includes(camera.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCameras((prev) => [...prev, camera.id]);
                        } else {
                          setSelectedCameras((prev) =>
                            prev.filter((id) => id !== camera.id)
                          );
                        }
                      }}
                      className="w-4 h-4 bg-white border-2 border-primary rounded"
                    />
                  </div>
                )}
                <div className="aspect-video bg-black flex items-center justify-center">
                  {camera.status === "online" && camera.streamUrl ? (
                    <StreamPlayer
                      src={camera.streamUrl}
                      className="w-full h-full object-contain"
                      autoPlay
                      controls={false}
                      muted
                    />
                  ) : (
                    <Camera className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{camera.name}</CardTitle>
                      <CardDescription>{camera.location}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(camera.status)}>
                        {t[camera.status as keyof typeof t] || camera.status}
                      </Badge>
                      {rolePermissions.canManageCameras && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditCam({
                              id: camera.id,
                              name: camera.name,
                              location: camera.location,
                              type: camera.type,
                              streamUrl: camera.streamUrl,
                              isActive: camera.status === "online",
                              districtId: (camera as any).district_id || "",
                              communityId: (camera as any).community_id || "",
                            });
                            setIsEditCameraOpen(true);
                          }}
                          aria-label="Edit camera"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      )}
                      {rolePermissions.canManageCameras && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Delete camera"
                              onClick={() => setDeleteTarget(camera)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete camera?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the camera "
                                {deleteTarget?.name}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                onClick={() => setDeleteTarget(null)}
                              >
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={async () => {
                                  if (!deleteTarget) return;
                                  const id = deleteTarget.id;
                                  const { error } = await supabase
                                    .from("cctv_cameras")
                                    .delete()
                                    .eq("id", id);
                                  if (error) {
                                    toast({
                                      title: "Error",
                                      description: "Failed to delete camera",
                                    });
                                    return;
                                  }
                                  setCameras((prev) =>
                                    prev.filter((c) => c.id !== id)
                                  );
                                  setDeleteTarget(null);
                                  toast({
                                    title: "Deleted",
                                    description: "Camera removed",
                                  });
                                }}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t.resolution}:
                      </span>
                      <span>{camera.resolution}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t.lastSeen}:
                      </span>
                      <span>{camera.lastSeen}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge
                        variant={camera.recording ? "destructive" : "secondary"}
                      >
                        {camera.recording ? t.recording : t.notRecording}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleViewLiveCamera(camera)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {t.liveView}
                    </Button>
                    {(hasRole("security_officer") ||
                      hasRole("community_admin") ||
                      hasRole("district_coordinator") ||
                      hasRole("state_admin") ||
                      hasRole("facility_manager")) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditCam({
                            id: camera.id,
                            name: camera.name,
                            location: camera.location,
                            type: camera.type,
                            streamUrl: camera.streamUrl,
                            isActive: camera.status === "online",
                            districtId: (camera as any).district_id || "",
                            communityId: (camera as any).community_id || "",
                          });
                          setIsEditCameraOpen(true);
                        }}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        {t.settings}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recordings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.recordings}</CardTitle>
              <CardDescription>Recent camera recordings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecordings.map((recording) => (
                  <div
                    key={recording.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Play className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{recording.cameraName}</p>
                        <p className="text-sm text-muted-foreground">
                          {recording.startTime} • {recording.duration} •{" "}
                          {recording.fileSize}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getTypeColor(recording.type)}>
                        {t[recording.type as keyof typeof t] || recording.type}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4 mr-1" />
                        {t.playRecording}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        {t.downloadRecording}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Live View Modal */}
      <Dialog open={isLiveViewOpen} onOpenChange={setIsLiveViewOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              {t.liveView} - {liveViewCamera?.name}
            </DialogTitle>
            <DialogDescription>
              {liveViewCamera?.location} • {liveViewCamera?.resolution}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col lg:flex-row gap-6 p-6">
            {/* Main Feed */}
            <div className="flex-1">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div
                    className={`bg-black relative ${
                      isFullscreen ? "h-screen" : "aspect-video"
                    }`}
                  >
                    {/* Main Video Feed */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {liveViewCamera?.status === "online" &&
                      liveViewCamera?.streamUrl ? (
                        <StreamPlayer
                          src={liveViewCamera.streamUrl}
                          className="w-full h-full object-contain"
                          autoPlay={true}
                        />
                      ) : (
                        <div className="text-white text-center">
                          <VideoOff className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg mb-2">{t.cameraOffline}</p>
                          <p className="text-sm opacity-75">
                            {liveViewCamera?.name}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* PTZ Controls Overlay */}
                    {/* {liveViewCamera?.hasPtz && ( */}
                    {/* <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 text-white"> */}
                    {/* <div className="text-xs font-medium mb-2">
                          {t.ptzControls}
                        </div> */}

                    {/* Pan/Tilt */}
                    {/* <div className="mb-3">
                          <div className="text-xs mb-1">
                            {t.pan} / {t.tilt}
                          </div>
                          <div className="grid grid-cols-3 gap-1 w-20">
                            <div></div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0 bg-white/20 border-white/30 text-white hover:bg-white/30"
                              onClick={() => handlePtzControl("up")}
                            >
                              <ChevronUp className="h-3 w-3" />
                            </Button>
                            <div></div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0 bg-white/20 border-white/30 text-white hover:bg-white/30"
                              onClick={() => handlePtzControl("left")}
                            >
                              <ChevronLeft className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0 bg-white/20 border-white/30 text-white hover:bg-white/30"
                              onClick={() => handlePtzControl("home")}
                            >
                              <Home className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0 bg-white/20 border-white/30 text-white hover:bg-white/30"
                              onClick={() => handlePtzControl("right")}
                            >
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                            <div></div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0 bg-white/20 border-white/30 text-white hover:bg-white/30"
                              onClick={() => handlePtzControl("down")}
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                            <div></div>
                          </div>
                        </div> */}

                    {/* Zoom */}
                    {/* <div className="mb-3">
                          <div className="text-xs mb-1">{t.zoom}</div>
                          <div className="flex gap-1 justify-center">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0 bg-white/20 border-white/30 text-white hover:bg-white/30"
                              onClick={() => handleZoom("out")}
                            >
                              <ZoomOut className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0 bg-white/20 border-white/30 text-white hover:bg-white/30"
                              onClick={() => handleZoom("in")}
                            >
                              <ZoomIn className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-xs text-center mt-1">
                            {ptzPosition.zoom.toFixed(1)}x
                          </div>
                        </div> */}

                    {/* Position */}
                    {/* <div className="text-xs space-y-1 mb-3">
                          <div>
                            {t.pan}: {ptzPosition.pan}°
                          </div>
                          <div>
                            {t.tilt}: {ptzPosition.tilt}°
                          </div>
                        </div> */}

                    {/* Presets */}
                    {/* {liveViewCamera.presets &&
                          liveViewCamera.presets.length > 0 && (
                            <div>
                              <div className="text-xs mb-1">{t.presets}</div>
                              <div className="flex flex-wrap gap-1">
                                {liveViewCamera.presets.map((preset) => (
                                  <Button
                                    key={preset}
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-5 px-2 bg-white/20 border-white/30 text-white hover:bg-white/30"
                                    onClick={() => handlePreset(preset)}
                                  >
                                    {preset}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )} */}
                    {/* </div> */}
                    {/* )} */}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Camera Controls - Admin Only */}
            {(hasRole("security_officer") ||
              hasRole("community_admin") ||
              hasRole("district_coordinator") ||
              hasRole("state_admin") ||
              hasRole("facility_manager")) && (
              <div className="lg:w-80 space-y-4">
                {/* RTSP Connection */}
                {liveViewCamera && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {rtspConnected ? (
                          <WifiOff className="h-4 w-4 text-red-500" />
                        ) : (
                          <Wifi className="h-4 w-4 text-green-500" />
                        )}
                        {t.rtspConnection}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">
                          Stream URL (HLS .m3u8, MJPEG, MP4/WebM or RTSP via
                          gateway)
                        </div>
                        <Input
                          value={editStreamUrl}
                          onChange={(e) => setEditStreamUrl(e.target.value)}
                          placeholder="https://.../stream.m3u8 | http://.../nphMotionJpeg | rtsp://..."
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={rtspConnected ? "secondary" : "default"}
                        >
                          {rtspConnected ? t.disconnected : t.connected}
                        </Badge>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={saveStreamUrl}
                            disabled={isTesting}
                          >
                            {isTesting ? "Testing..." : "Save"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleRtspConnection}
                            disabled={!editStreamUrl}
                          >
                            {rtspConnected ? t.connect : t.disconnect}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Motion Detection Settings */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      {t.motionDetection}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="motion-detection-modal"
                        className="text-sm font-medium"
                      >
                        {t.enableMotionDetection}
                      </label>
                      <Switch
                        id="motion-detection-modal"
                        checked={motionDetectionEnabled}
                        onCheckedChange={setMotionDetectionEnabled}
                      />
                    </div>

                    {motionDetectionEnabled && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">
                            {t.sensitivity}
                          </label>
                          <div className="flex items-center space-x-3 mt-2">
                            <span className="text-xs text-muted-foreground">
                              1
                            </span>
                            <Slider
                              value={motionSensitivity}
                              onValueChange={setMotionSensitivity}
                              max={100}
                              min={1}
                              step={1}
                              className="flex-1"
                            />
                            <span className="text-xs text-muted-foreground">
                              100
                            </span>
                          </div>
                          <div className="text-center mt-1">
                            <span className="text-sm font-medium">
                              {motionSensitivity[0]}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recording Controls */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{t.recording}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status:</span>
                      <Badge
                        variant={
                          liveViewCamera?.recording
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {liveViewCamera?.recording
                          ? t.recording
                          : t.notRecording}
                      </Badge>
                    </div>
                    <Button
                      className="w-full"
                      variant={
                        liveViewCamera?.recording ? "destructive" : "default"
                      }
                      onClick={() =>
                        liveViewCamera && handleToggleRecording(liveViewCamera)
                      }
                    >
                      {liveViewCamera?.recording ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          {t.stopRecording}
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          {t.startRecording}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Camera Modal */}
      <Dialog open={isEditCameraOpen} onOpenChange={setIsEditCameraOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{t.settings}</DialogTitle>
            <DialogDescription>Edit camera settings</DialogDescription>
          </DialogHeader>
          {editCam && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">{t.cameraName}</Label>
                <Input
                  id="edit-name"
                  value={editCam.name}
                  onChange={(e) =>
                    setEditCam({ ...editCam, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-location">{t.cameraLocation}</Label>
                  <Input
                    id="edit-location"
                    value={editCam.location}
                    onChange={(e) =>
                      setEditCam({ ...editCam, location: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-type">{t.cameraType}</Label>
                  <Select
                    value={editCam.type}
                    onValueChange={(v) =>
                      setEditCam({ ...editCam, type: v as CCTVCamera["type"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.cameraType} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="indoor">{t.indoor}</SelectItem>
                      <SelectItem value="outdoor">{t.outdoor}</SelectItem>
                      <SelectItem value="entrance">{t.entrance}</SelectItem>
                      <SelectItem value="parking">{t.parking}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Community Assignment Fields - Only for state admin and district coordinator */}
              {rolePermissions.canAssignCommunities && editCam && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-district">
                      {language === "en" ? "District" : "Daerah"}
                    </Label>
                    <Select
                      value={editCam.districtId}
                      onValueChange={(v) => {
                        setEditCam({
                          ...editCam,
                          districtId: v,
                          communityId: "", // Reset community when district changes
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            language === "en"
                              ? "Select District"
                              : "Pilih Daerah"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">
                          {language === "en" ? "No District" : "Tiada Daerah"}
                        </SelectItem>
                        {districts.map((district) => (
                          <SelectItem key={district.id} value={district.id}>
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-community">
                      {language === "en" ? "Community" : "Komuniti"}
                    </Label>
                    <Select
                      value={editCam.communityId}
                      onValueChange={(v) =>
                        setEditCam({
                          ...editCam,
                          communityId: v,
                        })
                      }
                      disabled={!editCam.districtId}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            language === "en"
                              ? "Select Community"
                              : "Pilih Komuniti"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">
                          {language === "en"
                            ? "No Community"
                            : "Tiada Komuniti"}
                        </SelectItem>
                        {communities
                          .filter(
                            (community) =>
                              !editCam.districtId ||
                              community.district_id === editCam.districtId
                          )
                          .map((community) => (
                            <SelectItem key={community.id} value={community.id}>
                              {community.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit-stream">
                  {t.streamUrl} (HLS .m3u8, MJPEG, MP4/WebM or RTSP via gateway)
                </Label>
                <Input
                  id="edit-stream"
                  value={editCam.streamUrl}
                  onChange={(e) =>
                    setEditCam({ ...editCam, streamUrl: e.target.value })
                  }
                  placeholder="https://.../stream.m3u8 | http://.../nphMotionJpeg | rtsp://..."
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t.status}</span>
                <Switch
                  checked={editCam.isActive}
                  onCheckedChange={(v) =>
                    setEditCam({ ...editCam, isActive: v })
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditCameraOpen(false)}
                >
                  {t.cancel}
                </Button>
                <Button
                  onClick={async () => {
                    if (!editCam) return;
                    try {
                      setIsTesting(true);
                      await validateStream(editCam.streamUrl);
                    } catch (e: any) {
                      setIsTesting(false);
                      toast({
                        title: "Invalid stream",
                        description: e?.message || "Failed to validate HLS URL",
                      });
                      return;
                    } finally {
                      setIsTesting(false);
                    }
                    const { error } = await supabase
                      .from("cctv_cameras")
                      .update({
                        name: editCam.name,
                        location: editCam.location,
                        camera_type: editCam.type,
                        stream_url: editCam.streamUrl,
                        is_active: editCam.isActive,
                        district_id: editCam.districtId || null,
                        community_id: editCam.communityId || null,
                      })
                      .eq("id", editCam.id);
                    if (error) {
                      toast({
                        title: "Error",
                        description: "Failed to update camera",
                      });
                      return;
                    }
                    setCameras((prev) =>
                      prev.map((c) =>
                        c.id === editCam.id
                          ? {
                              ...c,
                              name: editCam.name,
                              location: editCam.location,
                              type: editCam.type,
                              status: editCam.isActive ? "online" : "offline",
                              streamUrl: editCam.streamUrl,
                            }
                          : c
                      )
                    );
                    setIsEditCameraOpen(false);
                    setEditCam(null);
                    toast({ title: "Saved", description: "Camera updated" });
                  }}
                  disabled={isTesting}
                >
                  {isTesting ? "Testing..." : "Save"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
