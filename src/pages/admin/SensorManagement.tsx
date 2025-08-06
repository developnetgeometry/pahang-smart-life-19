import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Zap, 
  Gauge, 
  Activity, 
  Plus, 
  Search, 
  Settings, 
  Trash2,
  Edit,
  Wifi,
  WifiOff,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Sensor {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'air_quality' | 'energy' | 'water_level' | 'noise' | 'motion' | 'light';
  location: string;
  description: string;
  status: 'online' | 'offline' | 'error' | 'maintenance';
  value: number;
  unit: string;
  minThreshold: number;
  maxThreshold: number;
  warningThreshold: number;
  criticalThreshold: number;
  alertsEnabled: boolean;
  autoCalibration: boolean;
  batteryLevel?: number;
  lastCalibration: string;
  installationDate: string;
  communityId: string;
  macAddress: string;
  firmware: string;
}

export default function SensorManagement() {
  const { language } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isAddSensorOpen, setIsAddSensorOpen] = useState(false);
  const [isEditSensorOpen, setIsEditSensorOpen] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);

  const text = {
    en: {
      title: 'Sensor Management',
      subtitle: 'Configure and manage IoT sensors',
      addSensor: 'Add Sensor',
      search: 'Search sensors...',
      type: 'Sensor Type',
      status: 'Status',
      allTypes: 'All Types',
      allStatuses: 'All Statuses',
      temperature: 'Temperature',
      humidity: 'Humidity',
      airQuality: 'Air Quality',
      energy: 'Energy',
      waterLevel: 'Water Level',
      noise: 'Noise',
      motion: 'Motion',
      light: 'Light',
      online: 'Online',
      offline: 'Offline',
      error: 'Error',
      maintenance: 'Maintenance',
      edit: 'Edit',
      delete: 'Delete',
      settings: 'Settings',
      location: 'Location',
      currentValue: 'Current Value',
      thresholds: 'Thresholds',
      batteryLevel: 'Battery Level',
      lastCalibration: 'Last Calibration',
      firmware: 'Firmware',
      macAddress: 'MAC Address',
      addSensorTitle: 'Add New Sensor',
      addSensorSubtitle: 'Configure a new IoT sensor',
      editSensorTitle: 'Edit Sensor',
      editSensorSubtitle: 'Update sensor configuration',
      sensorName: 'Sensor Name',
      sensorType: 'Sensor Type',
      sensorLocation: 'Location',
      description: 'Description',
      macAddressLabel: 'MAC Address',
      minThreshold: 'Minimum Threshold',
      maxThreshold: 'Maximum Threshold',
      warningThreshold: 'Warning Threshold',
      criticalThreshold: 'Critical Threshold',
      alertsEnabled: 'Enable Alerts',
      autoCalibration: 'Auto Calibration',
      cancel: 'Cancel',
      save: 'Save',
      sensorAdded: 'Sensor added successfully!',
      sensorUpdated: 'Sensor updated successfully!',
      sensorDeleted: 'Sensor deleted successfully!',
      confirmDelete: 'Are you sure you want to delete this sensor?',
      deleteWarning: 'This action cannot be undone.',
      totalSensors: 'Total Sensors',
      activeSensors: 'Active Sensors',
      offlineSensors: 'Offline Sensors',
      lowBattery: 'Low Battery'
    },
    ms: {
      title: 'Pengurusan Sensor',
      subtitle: 'Konfigurasi dan urus sensor IoT',
      addSensor: 'Tambah Sensor',
      search: 'Cari sensor...',
      type: 'Jenis Sensor',
      status: 'Status',
      allTypes: 'Semua Jenis',
      allStatuses: 'Semua Status',
      temperature: 'Suhu',
      humidity: 'Kelembapan',
      airQuality: 'Kualiti Udara',
      energy: 'Tenaga',
      waterLevel: 'Paras Air',
      noise: 'Bunyi',
      motion: 'Pergerakan',
      light: 'Cahaya',
      online: 'Dalam Talian',
      offline: 'Luar Talian',
      error: 'Ralat',
      maintenance: 'Penyelenggaraan',
      edit: 'Edit',
      delete: 'Padam',
      settings: 'Tetapan',
      location: 'Lokasi',
      currentValue: 'Nilai Semasa',
      thresholds: 'Ambang',
      batteryLevel: 'Paras Bateri',
      lastCalibration: 'Kalibrasi Terakhir',
      firmware: 'Perisian',
      macAddress: 'Alamat MAC',
      addSensorTitle: 'Tambah Sensor Baru',
      addSensorSubtitle: 'Konfigurasi sensor IoT baru',
      editSensorTitle: 'Edit Sensor',
      editSensorSubtitle: 'Kemas kini konfigurasi sensor',
      sensorName: 'Nama Sensor',
      sensorType: 'Jenis Sensor',
      sensorLocation: 'Lokasi',
      description: 'Penerangan',
      macAddressLabel: 'Alamat MAC',
      minThreshold: 'Ambang Minimum',
      maxThreshold: 'Ambang Maksimum',
      warningThreshold: 'Ambang Amaran',
      criticalThreshold: 'Ambang Kritikal',
      alertsEnabled: 'Aktifkan Amaran',
      autoCalibration: 'Kalibrasi Auto',
      cancel: 'Batal',
      save: 'Simpan',
      sensorAdded: 'Sensor berjaya ditambah!',
      sensorUpdated: 'Sensor berjaya dikemas kini!',
      sensorDeleted: 'Sensor berjaya dipadam!',
      confirmDelete: 'Adakah anda pasti untuk memadam sensor ini?',
      deleteWarning: 'Tindakan ini tidak boleh dibuat asal.',
      totalSensors: 'Jumlah Sensor',
      activeSensors: 'Sensor Aktif',
      offlineSensors: 'Sensor Luar Talian',
      lowBattery: 'Bateri Lemah'
    }
  };

  const t = text[language];

  const mockSensors: Sensor[] = [
    {
      id: '1',
      name: 'Main Lobby Temperature',
      type: 'temperature',
      location: 'Block A Lobby',
      description: 'Monitors lobby temperature for climate control',
      status: 'online',
      value: 24.5,
      unit: '°C',
      minThreshold: 18,
      maxThreshold: 30,
      warningThreshold: 28,
      criticalThreshold: 32,
      alertsEnabled: true,
      autoCalibration: true,
      batteryLevel: 85,
      lastCalibration: '2024-01-10',
      installationDate: '2023-12-01',
      communityId: '1',
      macAddress: '00:1B:44:11:3A:B7',
      firmware: 'v2.1.3'
    },
    {
      id: '2',
      name: 'Garden Humidity Monitor',
      type: 'humidity',
      location: 'Central Garden',
      description: 'Tracks humidity levels for irrigation system',
      status: 'online',
      value: 75,
      unit: '%',
      minThreshold: 40,
      maxThreshold: 85,
      warningThreshold: 80,
      criticalThreshold: 90,
      alertsEnabled: true,
      autoCalibration: false,
      batteryLevel: 92,
      lastCalibration: '2024-01-08',
      installationDate: '2023-11-15',
      communityId: '1',
      macAddress: '00:1B:44:11:3A:B8',
      firmware: 'v2.0.1'
    },
    {
      id: '3',
      name: 'Air Quality Monitor',
      type: 'air_quality',
      location: 'Main Entrance',
      description: 'Monitors air quality index for health alerts',
      status: 'error',
      value: 0,
      unit: 'AQI',
      minThreshold: 0,
      maxThreshold: 100,
      warningThreshold: 60,
      criticalThreshold: 80,
      alertsEnabled: true,
      autoCalibration: true,
      batteryLevel: 15,
      lastCalibration: '2024-01-05',
      installationDate: '2023-10-20',
      communityId: '1',
      macAddress: '00:1B:44:11:3A:B9',
      firmware: 'v1.9.2'
    },
    {
      id: '4',
      name: 'Energy Meter Block A',
      type: 'energy',
      location: 'Electrical Room A',
      description: 'Monitors electricity consumption',
      status: 'online',
      value: 125.8,
      unit: 'kWh',
      minThreshold: 0,
      maxThreshold: 200,
      warningThreshold: 150,
      criticalThreshold: 180,
      alertsEnabled: true,
      autoCalibration: false,
      lastCalibration: '2024-01-12',
      installationDate: '2023-09-10',
      communityId: '1',
      macAddress: '00:1B:44:11:3A:C0',
      firmware: 'v3.2.1'
    }
  ];

  const sensorTypes = [
    { value: 'all', label: t.allTypes },
    { value: 'temperature', label: t.temperature },
    { value: 'humidity', label: t.humidity },
    { value: 'air_quality', label: t.airQuality },
    { value: 'energy', label: t.energy },
    { value: 'water_level', label: t.waterLevel },
    { value: 'noise', label: t.noise },
    { value: 'motion', label: t.motion },
    { value: 'light', label: t.light }
  ];

  const statusOptions = [
    { value: 'all', label: t.allStatuses },
    { value: 'online', label: t.online },
    { value: 'offline', label: t.offline },
    { value: 'error', label: t.error },
    { value: 'maintenance', label: t.maintenance }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'offline': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'temperature': return <Thermometer className="h-5 w-5" />;
      case 'humidity': return <Droplets className="h-5 w-5" />;
      case 'air_quality': return <Wind className="h-5 w-5" />;
      case 'energy': return <Zap className="h-5 w-5" />;
      case 'water_level': return <Gauge className="h-5 w-5" />;
      case 'noise': return <Activity className="h-5 w-5" />;
      case 'motion': return <Activity className="h-5 w-5" />;
      case 'light': return <Activity className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getBatteryColor = (level?: number) => {
    if (!level) return '';
    if (level <= 20) return 'text-red-600';
    if (level <= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const filteredSensors = mockSensors.filter(sensor => {
    const matchesSearch = sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sensor.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || sensor.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || sensor.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAddSensor = () => {
    toast({ title: t.sensorAdded });
    setIsAddSensorOpen(false);
  };

  const handleEditSensor = (sensor: Sensor) => {
    setSelectedSensor(sensor);
    setIsEditSensorOpen(true);
  };

  const handleUpdateSensor = () => {
    toast({ title: t.sensorUpdated });
    setIsEditSensorOpen(false);
    setSelectedSensor(null);
  };

  const handleDeleteSensor = () => {
    toast({ title: t.sensorDeleted });
  };

  const onlineSensors = mockSensors.filter(s => s.status === 'online').length;
  const offlineSensors = mockSensors.filter(s => s.status === 'offline').length;
  const lowBatterySensors = mockSensors.filter(s => s.batteryLevel && s.batteryLevel <= 20).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Dialog open={isAddSensorOpen} onOpenChange={setIsAddSensorOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t.addSensor}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{t.addSensorTitle}</DialogTitle>
              <DialogDescription>{t.addSensorSubtitle}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t.sensorName}</Label>
                  <Input id="name" placeholder={t.sensorName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">{t.sensorType}</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={t.sensorType} />
                    </SelectTrigger>
                    <SelectContent>
                      {sensorTypes.slice(1).map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">{t.sensorLocation}</Label>
                  <Input id="location" placeholder={t.sensorLocation} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="macAddress">{t.macAddressLabel}</Label>
                  <Input id="macAddress" placeholder="00:1B:44:11:3A:B7" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t.description}</Label>
                <Textarea id="description" placeholder={t.description} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minThreshold">{t.minThreshold}</Label>
                  <Input id="minThreshold" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxThreshold">{t.maxThreshold}</Label>
                  <Input id="maxThreshold" type="number" placeholder="100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="warningThreshold">{t.warningThreshold}</Label>
                  <Input id="warningThreshold" type="number" placeholder="80" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="criticalThreshold">{t.criticalThreshold}</Label>
                  <Input id="criticalThreshold" type="number" placeholder="95" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch id="alerts" />
                  <Label htmlFor="alerts">{t.alertsEnabled}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="autoCalibration" />
                  <Label htmlFor="autoCalibration">{t.autoCalibration}</Label>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddSensorOpen(false)}>
                  {t.cancel}
                </Button>
                <Button onClick={handleAddSensor}>
                  {t.save}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalSensors}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSensors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.activeSensors}</CardTitle>
            <Wifi className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{onlineSensors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.offlineSensors}</CardTitle>
            <WifiOff className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{offlineSensors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.lowBattery}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowBatterySensors}</div>
          </CardContent>
        </Card>
      </div>

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
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sensorTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sensors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSensors.map((sensor) => (
          <Card key={sensor.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getSensorIcon(sensor.type)}
                  <div>
                    <CardTitle className="text-lg">{sensor.name}</CardTitle>
                    <CardDescription>{sensor.location}</CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(sensor.status)}>
                  {t[sensor.status as keyof typeof t] || sensor.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t.currentValue}:</span>
                  <span className="text-lg font-semibold">
                    {sensor.value}{sensor.unit}
                  </span>
                </div>
                {sensor.batteryLevel && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t.batteryLevel}:</span>
                    <span className={`text-sm font-medium ${getBatteryColor(sensor.batteryLevel)}`}>
                      {sensor.batteryLevel}%
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{t.firmware}: {sensor.firmware}</span>
                  <span>{sensor.macAddress}</span>
                </div>
              </div>
              
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Warning: {sensor.warningThreshold}{sensor.unit}</span>
                  <span>Critical: {sensor.criticalThreshold}{sensor.unit}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Min: {sensor.minThreshold}</span>
                  <span>Max: {sensor.maxThreshold}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleEditSensor(sensor)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  {t.edit}
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4 mr-1" />
                  {t.settings}
                </Button>
                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Sensor Dialog */}
      <Dialog open={isEditSensorOpen} onOpenChange={setIsEditSensorOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t.editSensorTitle}</DialogTitle>
            <DialogDescription>{t.editSensorSubtitle}</DialogDescription>
          </DialogHeader>
          {selectedSensor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editName">{t.sensorName}</Label>
                  <Input id="editName" defaultValue={selectedSensor.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editLocation">{t.sensorLocation}</Label>
                  <Input id="editLocation" defaultValue={selectedSensor.location} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDescription">{t.description}</Label>
                <Textarea id="editDescription" defaultValue={selectedSensor.description} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editWarning">{t.warningThreshold}</Label>
                  <Input id="editWarning" type="number" defaultValue={selectedSensor.warningThreshold} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editCritical">{t.criticalThreshold}</Label>
                  <Input id="editCritical" type="number" defaultValue={selectedSensor.criticalThreshold} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch id="editAlerts" defaultChecked={selectedSensor.alertsEnabled} />
                  <Label htmlFor="editAlerts">{t.alertsEnabled}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="editAutoCalib" defaultChecked={selectedSensor.autoCalibration} />
                  <Label htmlFor="editAutoCalib">{t.autoCalibration}</Label>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditSensorOpen(false)}>
                  {t.cancel}
                </Button>
                <Button onClick={handleUpdateSensor}>
                  {t.save}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}