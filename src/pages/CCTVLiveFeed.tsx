import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Video, VideoOff, Maximize, RotateCcw, Settings, Eye, EyeOff, Signal, SignalHigh, SignalLow, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Home, Play, Square, Wifi, WifiOff, Activity } from 'lucide-react';

interface CCTVCamera {
  id: string;
  name: string;
  location: string;
  building?: string;
  floor?: string;
  area?: string;
  accessLevel: 'public' | 'resident' | 'admin';
  status: 'online' | 'offline' | 'maintenance';
  signal: 'high' | 'medium' | 'low';
  isRecording: boolean;
  lastUpdate: string;
  rtspUrl?: string;
  hasPtz: boolean;
  presets?: string[];
}

export default function CCTVLiveFeed() {
  const { language, user, hasRole } = useAuth();
  const [selectedCamera, setSelectedCamera] = useState('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [motionDetectionEnabled, setMotionDetectionEnabled] = useState(false);
  const [motionSensitivity, setMotionSensitivity] = useState([30]);
  const [motionEvents] = useState<Array<{ id: string; timestamp: string; camera: string }>>([]);

  const text = {
    en: {
      title: 'CCTV Live Feed',
      subtitle: 'Monitor community security cameras',
      selectCamera: 'Select Camera',
      allCameras: 'All Cameras',
      status: 'Status',
      online: 'Online',
      offline: 'Offline',
      maintenance: 'Maintenance',
      recording: 'Recording',
      notRecording: 'Not Recording',
      signalStrength: 'Signal Strength',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      lastUpdate: 'Last Update',
      fullscreen: 'Fullscreen',
      refresh: 'Refresh',
      settings: 'Settings',
      liveFeed: 'Live Feed',
      noSignal: 'No Signal',
      connecting: 'Connecting...',
      cameraOffline: 'Camera is currently offline',
      ptzControls: 'PTZ Controls',
      pan: 'Pan',
      tilt: 'Tilt',
      zoom: 'Zoom',
      presets: 'Presets',
      home: 'Home',
      rtspConnection: 'RTSP Connection',
      connected: 'Connected',
      disconnected: 'Disconnected',
      connect: 'Connect',
      disconnect: 'Disconnect',
      motionDetection: 'Motion Detection',
      enableMotionDetection: 'Enable Motion Detection',
      sensitivity: 'Sensitivity',
      recentEvents: 'Recent Events',
      noMotionEvents: 'No motion events detected'
    },
    ms: {
      title: 'Suapan Langsung CCTV',
      subtitle: 'Pantau kamera keselamatan komuniti',
      selectCamera: 'Pilih Kamera',
      allCameras: 'Semua Kamera',
      status: 'Status',
      online: 'Dalam Talian',
      offline: 'Luar Talian',
      maintenance: 'Penyelenggaraan',
      recording: 'Merakam',
      notRecording: 'Tidak Merakam',
      signalStrength: 'Kekuatan Isyarat',
      high: 'Tinggi',
      medium: 'Sederhana',
      low: 'Rendah',
      lastUpdate: 'Kemaskini Terakhir',
      fullscreen: 'Skrin Penuh',
      refresh: 'Muat Semula',
      settings: 'Tetapan',
      liveFeed: 'Suapan Langsung',
      noSignal: 'Tiada Isyarat',
      connecting: 'Menyambung...',
      cameraOffline: 'Kamera sedang luar talian',
      ptzControls: 'Kawalan PTZ',
      pan: 'Pan',
      tilt: 'Tilt',
      zoom: 'Zum',
      presets: 'Pratetap',
      home: 'Rumah',
      rtspConnection: 'Sambungan RTSP',
      connected: 'Disambung',
      disconnected: 'Terputus',
      connect: 'Sambung',
      disconnect: 'Putus',
      motionDetection: 'Pengesanan Pergerakan',
      enableMotionDetection: 'Aktifkan Pengesanan Pergerakan',
      sensitivity: 'Kepekaan',
      recentEvents: 'Acara Terkini',
      noMotionEvents: 'Tiada acara pergerakan dikesan'
    }
  };

  const t = text[language];

  const [rtspConnected, setRtspConnected] = useState(false);
  const [ptzPosition, setPtzPosition] = useState({ pan: 0, tilt: 0, zoom: 1 });

  const mockCameras: CCTVCamera[] = [
    {
      id: '1',
      name: language === 'en' ? 'Main Entrance' : 'Pintu Masuk Utama',
      location: 'Ground Floor Lobby',
      building: 'Block A',
      floor: 'Ground Floor',
      area: 'Main Lobby',
      accessLevel: 'public',
      status: 'online',
      signal: 'high',
      isRecording: true,
      lastUpdate: '2 minutes ago',
      rtspUrl: 'rtsp://192.168.1.100:554/stream1',
      hasPtz: true,
      presets: ['Home', 'Entrance', 'Exit']
    },
    {
      id: '2',
      name: language === 'en' ? 'Parking Area A' : 'Kawasan Parkir A',
      location: 'Basement Level 1',
      building: 'Block A',
      floor: 'Basement Level 1',
      area: 'Parking',
      accessLevel: 'resident',
      status: 'online',
      signal: 'medium',
      isRecording: true,
      lastUpdate: '1 minute ago',
      rtspUrl: 'rtsp://192.168.1.101:554/stream1',
      hasPtz: true,
      presets: ['Overview', 'Lane 1', 'Lane 2']
    },
    {
      id: '3',
      name: language === 'en' ? 'Swimming Pool' : 'Kolam Renang',
      location: 'Recreation Area',
      building: 'Block A',
      floor: 'Ground Floor',
      area: 'Recreation',
      accessLevel: 'resident',
      status: 'online',
      signal: 'high',
      isRecording: false,
      lastUpdate: '3 minutes ago',
      rtspUrl: 'rtsp://192.168.1.102:554/stream1',
      hasPtz: false
    },
    {
      id: '4',
      name: language === 'en' ? 'Playground' : 'Taman Permainan',
      location: 'Central Garden',
      building: 'Common Area',
      floor: 'Ground Level',
      area: 'Garden',
      accessLevel: 'public',
      status: 'offline',
      signal: 'low',
      isRecording: false,
      lastUpdate: '15 minutes ago',
      rtspUrl: 'rtsp://192.168.1.103:554/stream1',
      hasPtz: true,
      presets: ['Swings', 'Slide', 'Sandbox']
    },
    {
      id: '5',
      name: language === 'en' ? 'Emergency Exit Level 5' : 'Pintu Kecemasan Tingkat 5',
      location: 'Block A, Level 5',
      building: 'Block A',
      floor: 'Level 5',
      area: 'Emergency Exit',
      accessLevel: 'resident',
      status: 'maintenance',
      signal: 'medium',
      isRecording: false,
      lastUpdate: '1 hour ago',
      rtspUrl: 'rtsp://192.168.1.104:554/stream1',
      hasPtz: false
    },
    {
      id: '6',
      name: language === 'en' ? 'Gym Area' : 'Kawasan Gim',
      location: 'Block A, Ground Floor',
      building: 'Block A',
      floor: 'Ground Floor',
      area: 'Gym',
      accessLevel: 'resident',
      status: 'online',
      signal: 'high',
      isRecording: true,
      lastUpdate: '30 seconds ago',
      rtspUrl: 'rtsp://192.168.1.105:554/stream1',
      hasPtz: true,
      presets: ['Entrance', 'Equipment Area', 'Cardio Zone']
    }
  ];

  // Remove the requiredRoles restriction for CCTV - now available to all residents
  const accessibleCameras = mockCameras.filter(camera => {
    // Admin roles see all cameras
    if (hasRole('security_officer') || hasRole('facility_manager') || hasRole('community_admin') || 
        hasRole('state_admin') || hasRole('district_coordinator')) {
      return true;
    }
    
    // Residents see public cameras and cameras in their building/area
    const userBuilding = user?.address?.includes('Block A') ? 'Block A' : 
                        user?.address?.includes('Block B') ? 'Block B' : 'Block A'; // Default to Block A
    
    return camera.accessLevel === 'public' || 
           (camera.accessLevel === 'resident' && camera.building === userBuilding);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return t.online;
      case 'offline': return t.offline;
      case 'maintenance': return t.maintenance;
      default: return status;
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'high': return <SignalHigh className="h-4 w-4 text-green-600" />;
      case 'medium': return <Signal className="h-4 w-4 text-yellow-600" />;
      case 'low': return <SignalLow className="h-4 w-4 text-red-600" />;
      default: return <Signal className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSignalText = (signal: string) => {
    switch (signal) {
      case 'high': return t.high;
      case 'medium': return t.medium;
      case 'low': return t.low;
      default: return signal;
    }
  };

  const filteredCameras = selectedCamera === 'all' 
    ? accessibleCameras 
    : accessibleCameras.filter(camera => camera.id === selectedCamera);

  const mainCamera = selectedCamera !== 'all' 
    ? accessibleCameras.find(camera => camera.id === selectedCamera)
    : accessibleCameras[0];

  const handlePtzControl = (direction: string) => {
    const speed = 5;
    setPtzPosition(prev => {
      switch (direction) {
        case 'up':
          return { ...prev, tilt: Math.min(prev.tilt + speed, 90) };
        case 'down':
          return { ...prev, tilt: Math.max(prev.tilt - speed, -90) };
        case 'left':
          return { ...prev, pan: Math.max(prev.pan - speed, -180) };
        case 'right':
          return { ...prev, pan: Math.min(prev.pan + speed, 180) };
        default:
          return prev;
      }
    });
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setPtzPosition(prev => ({
      ...prev,
      zoom: direction === 'in' 
        ? Math.min(prev.zoom + 0.1, 10) 
        : Math.max(prev.zoom - 0.1, 1)
    }));
  };

  const handlePreset = (preset: string) => {
    // In a real implementation, this would send commands to the camera
    console.log(`Moving to preset: ${preset}`);
  };

  const handleRtspConnection = () => {
    setRtspConnected(!rtspConnected);
    // In a real implementation, this would establish/close RTSP connection
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            {t.refresh}
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            {t.settings}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Feed */}
        <div className="flex-1">
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {mainCamera?.name || t.liveFeed}
                  </CardTitle>
                  <CardDescription>
                    {mainCamera?.location}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {mainCamera?.status === 'online' && (
                    <Badge variant="outline" className="text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                      {t.liveFeed}
                    </Badge>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className={`bg-black relative ${isFullscreen ? 'h-screen' : 'aspect-video'}`}>
                {/* Main Video Feed */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {mainCamera?.status === 'online' ? (
                    <div className="text-white text-center">
                      <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">{t.liveFeed}</p>
                      <p className="text-sm opacity-75">{mainCamera.name}</p>
                    </div>
                  ) : (
                    <div className="text-white text-center">
                      <VideoOff className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">{t.cameraOffline}</p>
                      <p className="text-sm opacity-75">{mainCamera?.name}</p>
                    </div>
                  )}
                </div>

                {/* PTZ Controls Overlay */}
                {mainCamera?.hasPtz && (
                  <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 text-white">
                    <div className="text-xs font-medium mb-2">{t.ptzControls}</div>
                    
                    {/* Pan/Tilt */}
                    <div className="mb-3">
                      <div className="text-xs mb-1">{t.pan} / {t.tilt}</div>
                      <div className="grid grid-cols-3 gap-1 w-20">
                        <div></div>
                        <Button size="sm" variant="outline" className="h-6 w-6 p-0 bg-white/20 border-white/30 text-white hover:bg-white/30" onClick={() => handlePtzControl('up')}>
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <div></div>
                        <Button size="sm" variant="outline" className="h-6 w-6 p-0 bg-white/20 border-white/30 text-white hover:bg-white/30" onClick={() => handlePtzControl('left')}>
                          <ChevronLeft className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 w-6 p-0 bg-white/20 border-white/30 text-white hover:bg-white/30" onClick={() => handlePtzControl('home')}>
                          <Home className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 w-6 p-0 bg-white/20 border-white/30 text-white hover:bg-white/30" onClick={() => handlePtzControl('right')}>
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                        <div></div>
                        <Button size="sm" variant="outline" className="h-6 w-6 p-0 bg-white/20 border-white/30 text-white hover:bg-white/30" onClick={() => handlePtzControl('down')}>
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                        <div></div>
                      </div>
                    </div>

                    {/* Zoom */}
                    <div className="mb-3">
                      <div className="text-xs mb-1">{t.zoom}</div>
                      <div className="flex gap-1 justify-center">
                        <Button size="sm" variant="outline" className="h-6 w-6 p-0 bg-white/20 border-white/30 text-white hover:bg-white/30" onClick={() => handleZoom('out')}>
                          <ZoomOut className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 w-6 p-0 bg-white/20 border-white/30 text-white hover:bg-white/30" onClick={() => handleZoom('in')}>
                          <ZoomIn className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-xs text-center mt-1">
                        {ptzPosition.zoom.toFixed(1)}x
                      </div>
                    </div>

                    {/* Position */}
                    <div className="text-xs space-y-1 mb-3">
                      <div>{t.pan}: {ptzPosition.pan}°</div>
                      <div>{t.tilt}: {ptzPosition.tilt}°</div>
                    </div>

                    {/* Presets */}
                    {mainCamera.presets && mainCamera.presets.length > 0 && (
                      <div>
                        <div className="text-xs mb-1">{t.presets}</div>
                        <div className="flex flex-wrap gap-1">
                          {mainCamera.presets.map((preset) => (
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
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Camera Controls */}
          <div className="mt-4 space-y-4">
            <Select value={selectedCamera} onValueChange={setSelectedCamera}>
              <SelectTrigger>
                <SelectValue placeholder={t.selectCamera} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allCameras}</SelectItem>
                {accessibleCameras.map((camera) => (
                  <SelectItem key={camera.id} value={camera.id}>
                    {camera.name} - {camera.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* RTSP Connection */}
            {mainCamera && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {rtspConnected ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
                    {t.rtspConnection}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs">
                    <span className="text-muted-foreground">URL: </span>
                    <span className="font-mono text-xs break-all">{mainCamera.rtspUrl}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant={rtspConnected ? 'default' : 'secondary'}>
                      {rtspConnected ? t.connected : t.disconnected}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={handleRtspConnection}>
                      {rtspConnected ? t.disconnect : t.connect}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}


            {/* Motion Detection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  {t.motionDetection}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t.enableMotionDetection}</span>
                  <Switch
                    checked={motionDetectionEnabled}
                    onCheckedChange={setMotionDetectionEnabled}
                  />
                </div>

                {motionDetectionEnabled && (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{t.sensitivity}: {motionSensitivity[0]}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Low</span>
                          <span>High</span>
                        </div>
                      </div>
                      <Slider
                        value={motionSensitivity}
                        onValueChange={setMotionSensitivity}
                        max={100}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">{t.recentEvents}</div>
                      <div className="p-3 border rounded-lg bg-muted/30">
                        {motionEvents.length > 0 ? (
                          <div className="space-y-2">
                            {motionEvents.map((event) => (
                              <div key={event.id} className="text-xs p-2 bg-background rounded border">
                                <div className="font-medium">{event.camera}</div>
                                <div className="text-muted-foreground">{event.timestamp}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground text-center py-2">
                            {t.noMotionEvents}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Camera List */}
        <div className="w-full lg:w-80">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t.allCameras}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {accessibleCameras.map((camera) => (
                <div 
                  key={camera.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                    selectedCamera === camera.id ? 'border-primary bg-muted' : ''
                  }`}
                  onClick={() => setSelectedCamera(camera.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{camera.name}</h4>
                      <p className="text-xs text-muted-foreground">{camera.location}</p>
                    </div>
                    <Badge className={getStatusColor(camera.status)} variant="secondary">
                      {getStatusText(camera.status)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {getSignalIcon(camera.signal)}
                      <span>{getSignalText(camera.signal)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {camera.isRecording ? (
                        <Eye className="h-3 w-3 text-red-500" />
                      ) : (
                        <EyeOff className="h-3 w-3 text-gray-400" />
                      )}
                      <span className={camera.isRecording ? 'text-red-500' : 'text-gray-400'}>
                        {camera.isRecording ? t.recording : t.notRecording}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-muted-foreground">
                    {t.lastUpdate}: {camera.lastUpdate}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}