import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Video, VideoOff, Maximize, RotateCcw, Settings, Eye, EyeOff, Signal, SignalHigh, SignalLow } from 'lucide-react';

interface CCTVCamera {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance';
  signal: 'high' | 'medium' | 'low';
  isRecording: boolean;
  lastUpdate: string;
}

export default function CCTVLiveFeed() {
  const { language } = useAuth();
  const [selectedCamera, setSelectedCamera] = useState('all');
  const [isFullscreen, setIsFullscreen] = useState(false);

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
      cameraOffline: 'Camera is currently offline'
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
      cameraOffline: 'Kamera sedang luar talian'
    }
  };

  const t = text[language];

  const mockCameras: CCTVCamera[] = [
    {
      id: '1',
      name: language === 'en' ? 'Main Entrance' : 'Pintu Masuk Utama',
      location: 'Ground Floor Lobby',
      status: 'online',
      signal: 'high',
      isRecording: true,
      lastUpdate: '2 minutes ago'
    },
    {
      id: '2',
      name: language === 'en' ? 'Parking Area A' : 'Kawasan Parkir A',
      location: 'Basement Level 1',
      status: 'online',
      signal: 'medium',
      isRecording: true,
      lastUpdate: '1 minute ago'
    },
    {
      id: '3',
      name: language === 'en' ? 'Swimming Pool' : 'Kolam Renang',
      location: 'Recreation Area',
      status: 'online',
      signal: 'high',
      isRecording: false,
      lastUpdate: '3 minutes ago'
    },
    {
      id: '4',
      name: language === 'en' ? 'Playground' : 'Taman Permainan',
      location: 'Central Garden',
      status: 'offline',
      signal: 'low',
      isRecording: false,
      lastUpdate: '15 minutes ago'
    },
    {
      id: '5',
      name: language === 'en' ? 'Emergency Exit' : 'Pintu Kecemasan',
      location: 'Block B, Level 1',
      status: 'maintenance',
      signal: 'medium',
      isRecording: false,
      lastUpdate: '1 hour ago'
    },
    {
      id: '6',
      name: language === 'en' ? 'Gym Area' : 'Kawasan Gim',
      location: 'Block A, Ground Floor',
      status: 'online',
      signal: 'high',
      isRecording: true,
      lastUpdate: '30 seconds ago'
    }
  ];

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
    ? mockCameras 
    : mockCameras.filter(camera => camera.id === selectedCamera);

  const mainCamera = selectedCamera !== 'all' 
    ? mockCameras.find(camera => camera.id === selectedCamera)
    : mockCameras[0];

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
              <div className={`bg-black flex items-center justify-center ${isFullscreen ? 'h-screen' : 'aspect-video'}`}>
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
            </CardContent>
          </Card>

          {/* Camera Controls */}
          <div className="mt-4">
            <Select value={selectedCamera} onValueChange={setSelectedCamera}>
              <SelectTrigger>
                <SelectValue placeholder={t.selectCamera} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allCameras}</SelectItem>
                {mockCameras.map((camera) => (
                  <SelectItem key={camera.id} value={camera.id}>
                    {camera.name} - {camera.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Camera List */}
        <div className="w-full lg:w-80">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t.allCameras}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockCameras.map((camera) => (
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