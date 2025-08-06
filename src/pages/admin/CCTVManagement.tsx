import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Plus, Search, Monitor, AlertTriangle, Eye, Settings, Play, Pause, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CCTVCamera {
  id: string;
  name: string;
  location: string;
  type: 'indoor' | 'outdoor' | 'entrance' | 'parking';
  status: 'online' | 'offline' | 'maintenance' | 'error';
  resolution: string;
  recording: boolean;
  lastSeen: string;
  communityId: string;
  streamUrl: string;
}

interface Recording {
  id: string;
  cameraId: string;
  cameraName: string;
  startTime: string;
  duration: string;
  fileSize: string;
  type: 'motion' | 'scheduled' | 'manual' | 'incident';
}

export default function CCTVManagement() {
  const { language } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [isAddCameraOpen, setIsAddCameraOpen] = useState(false);

  const text = {
    en: {
      title: 'CCTV Management',
      subtitle: 'Monitor and manage security cameras',
      addCamera: 'Add Camera',
      search: 'Search cameras...',
      status: 'Status',
      location: 'Location',
      allStatuses: 'All Statuses',
      allLocations: 'All Locations',
      online: 'Online',
      offline: 'Offline',
      maintenance: 'Maintenance',
      error: 'Error',
      indoor: 'Indoor',
      outdoor: 'Outdoor',
      entrance: 'Entrance',
      parking: 'Parking',
      liveView: 'Live View',
      settings: 'Settings',
      recording: 'Recording',
      notRecording: 'Not Recording',
      lastSeen: 'Last Seen',
      resolution: 'Resolution',
      startRecording: 'Start Recording',
      stopRecording: 'Stop Recording',
      viewRecordings: 'View Recordings',
      addCameraTitle: 'Add New Camera',
      addCameraSubtitle: 'Configure a new security camera',
      cameraName: 'Camera Name',
      cameraLocation: 'Location',
      cameraType: 'Camera Type',
      streamUrl: 'Stream URL',
      cancel: 'Cancel',
      addCameraBtn: 'Add Camera',
      cameraAddedSuccess: 'Camera added successfully!',
      recordingStarted: 'Recording started',
      recordingStopped: 'Recording stopped',
      recordings: 'Recordings',
      cameras: 'Cameras',
      overview: 'Overview',
      totalCameras: 'Total Cameras',
      onlineCameras: 'Online Cameras',
      recordingCameras: 'Recording',
      storageUsed: 'Storage Used',
      downloadRecording: 'Download',
      playRecording: 'Play',
      motion: 'Motion',
      scheduled: 'Scheduled',
      manual: 'Manual',
      incident: 'Incident'
    },
    ms: {
      title: 'Pengurusan CCTV',
      subtitle: 'Monitor dan urus kamera keselamatan',
      addCamera: 'Tambah Kamera',
      search: 'Cari kamera...',
      status: 'Status',
      location: 'Lokasi',
      allStatuses: 'Semua Status',
      allLocations: 'Semua Lokasi',
      online: 'Dalam Talian',
      offline: 'Luar Talian',
      maintenance: 'Penyelenggaraan',
      error: 'Ralat',
      indoor: 'Dalam Bangunan',
      outdoor: 'Luar Bangunan',
      entrance: 'Pintu Masuk',
      parking: 'Tempat Letak Kereta',
      liveView: 'Paparan Langsung',
      settings: 'Tetapan',
      recording: 'Merakam',
      notRecording: 'Tidak Merakam',
      lastSeen: 'Terakhir Dilihat',
      resolution: 'Resolusi',
      startRecording: 'Mula Rakam',
      stopRecording: 'Henti Rakam',
      viewRecordings: 'Lihat Rakaman',
      addCameraTitle: 'Tambah Kamera Baru',
      addCameraSubtitle: 'Konfigurasi kamera keselamatan baru',
      cameraName: 'Nama Kamera',
      cameraLocation: 'Lokasi',
      cameraType: 'Jenis Kamera',
      streamUrl: 'URL Stream',
      cancel: 'Batal',
      addCameraBtn: 'Tambah Kamera',
      cameraAddedSuccess: 'Kamera berjaya ditambah!',
      recordingStarted: 'Rakaman dimulakan',
      recordingStopped: 'Rakaman dihentikan',
      recordings: 'Rakaman',
      cameras: 'Kamera',
      overview: 'Gambaran Keseluruhan',
      totalCameras: 'Jumlah Kamera',
      onlineCameras: 'Kamera Dalam Talian',
      recordingCameras: 'Sedang Merakam',
      storageUsed: 'Storan Digunakan',
      downloadRecording: 'Muat Turun',
      playRecording: 'Main',
      motion: 'Pergerakan',
      scheduled: 'Terjadual',
      manual: 'Manual',
      incident: 'Insiden'
    }
  };

  const t = text[language];

  const mockCameras: CCTVCamera[] = [
    {
      id: '1',
      name: 'Main Entrance',
      location: 'Block A Entrance',
      type: 'entrance',
      status: 'online',
      resolution: '1080p',
      recording: true,
      lastSeen: '2024-01-15 10:30:00',
      communityId: '1',
      streamUrl: 'rtsp://192.168.1.100/stream1'
    },
    {
      id: '2',
      name: 'Parking Lot A',
      location: 'Ground Floor Parking',
      type: 'parking',
      status: 'online',
      resolution: '720p',
      recording: false,
      lastSeen: '2024-01-15 10:29:45',
      communityId: '1',
      streamUrl: 'rtsp://192.168.1.101/stream1'
    },
    {
      id: '3',
      name: 'Lobby Camera',
      location: 'Main Lobby',
      type: 'indoor',
      status: 'maintenance',
      resolution: '1080p',
      recording: false,
      lastSeen: '2024-01-14 15:22:10',
      communityId: '1',
      streamUrl: 'rtsp://192.168.1.102/stream1'
    },
    {
      id: '4',
      name: 'Garden Area',
      location: 'Central Garden',
      type: 'outdoor',
      status: 'error',
      resolution: '4K',
      recording: false,
      lastSeen: '2024-01-13 08:15:30',
      communityId: '1',
      streamUrl: 'rtsp://192.168.1.103/stream1'
    }
  ];

  const mockRecordings: Recording[] = [
    {
      id: '1',
      cameraId: '1',
      cameraName: 'Main Entrance',
      startTime: '2024-01-15 09:00:00',
      duration: '1h 30m',
      fileSize: '2.5 GB',
      type: 'motion'
    },
    {
      id: '2',
      cameraId: '1',
      cameraName: 'Main Entrance',
      startTime: '2024-01-15 07:30:00',
      duration: '45m',
      fileSize: '1.2 GB',
      type: 'scheduled'
    },
    {
      id: '3',
      cameraId: '3',
      cameraName: 'Lobby Camera',
      startTime: '2024-01-14 14:15:00',
      duration: '2h 10m',
      fileSize: '3.8 GB',
      type: 'incident'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'offline': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'motion': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'scheduled': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'manual': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'incident': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const filteredCameras = mockCameras.filter(camera => {
    const matchesSearch = camera.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         camera.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || camera.status === selectedStatus;
    const matchesLocation = selectedLocation === 'all' || camera.type === selectedLocation;
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const handleAddCamera = () => {
    toast({ title: t.cameraAddedSuccess });
    setIsAddCameraOpen(false);
  };

  const handleToggleRecording = (camera: CCTVCamera) => {
    const message = camera.recording ? t.recordingStopped : t.recordingStarted;
    toast({ title: message });
  };

  const onlineCameras = mockCameras.filter(c => c.status === 'online').length;
  const recordingCameras = mockCameras.filter(c => c.recording).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Dialog open={isAddCameraOpen} onOpenChange={setIsAddCameraOpen}>
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
                <Input id="name" placeholder={t.cameraName} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">{t.cameraLocation}</Label>
                  <Input id="location" placeholder={t.cameraLocation} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">{t.cameraType}</Label>
                  <Select>
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
              <div className="space-y-2">
                <Label htmlFor="streamUrl">{t.streamUrl}</Label>
                <Input id="streamUrl" placeholder="rtsp://..." />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddCameraOpen(false)}>
                  {t.cancel}
                </Button>
                <Button onClick={handleAddCamera}>
                  {t.addCameraBtn}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
          <TabsTrigger value="cameras">{t.cameras}</TabsTrigger>
          <TabsTrigger value="recordings">{t.recordings}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.totalCameras}</CardTitle>
                <Camera className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockCameras.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.onlineCameras}</CardTitle>
                <Monitor className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{onlineCameras}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.recordingCameras}</CardTitle>
                <Play className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{recordingCameras}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.storageUsed}</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.4 TB</div>
              </CardContent>
            </Card>
          </div>

          {/* Camera Status List */}
          <Card>
            <CardHeader>
              <CardTitle>Camera Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCameras.map((camera) => (
                  <div key={camera.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Camera className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{camera.name}</p>
                        <p className="text-sm text-muted-foreground">{camera.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(camera.status)}>
                        {t[camera.status as keyof typeof t] || camera.status}
                      </Badge>
                      {camera.recording && (
                        <Badge variant="destructive">
                          <Play className="h-3 w-3 mr-1" />
                          {t.recording}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cameras" className="space-y-6">
          {/* Filters */}
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
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
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
          </div>

          {/* Camera Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCameras.map((camera) => (
              <Card key={camera.id} className="overflow-hidden">
                <div className="aspect-video bg-gray-900 flex items-center justify-center">
                  <Camera className="h-12 w-12 text-gray-400" />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{camera.name}</CardTitle>
                      <CardDescription>{camera.location}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(camera.status)}>
                      {t[camera.status as keyof typeof t] || camera.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.resolution}:</span>
                      <span>{camera.resolution}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.lastSeen}:</span>
                      <span>{camera.lastSeen}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={camera.recording ? 'destructive' : 'secondary'}>
                        {camera.recording ? t.recording : t.notRecording}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      {t.liveView}
                    </Button>
                    <Button 
                      size="sm" 
                      variant={camera.recording ? "destructive" : "default"}
                      onClick={() => handleToggleRecording(camera)}
                    >
                      {camera.recording ? (
                        <>
                          <Pause className="h-4 w-4 mr-1" />
                          {t.stopRecording}
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          {t.startRecording}
                        </>
                      )}
                    </Button>
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
                  <div key={recording.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Play className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{recording.cameraName}</p>
                        <p className="text-sm text-muted-foreground">
                          {recording.startTime} • {recording.duration} • {recording.fileSize}
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
    </div>
  );
}