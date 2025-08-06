import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Zap, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Gauge,
  Wifi,
  WifiOff
} from 'lucide-react';

interface SmartSensor {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'air_quality' | 'energy' | 'water_level' | 'noise';
  location: string;
  value: number;
  unit: string;
  status: 'online' | 'offline' | 'warning' | 'critical';
  lastUpdate: string;
  threshold: {
    min: number;
    max: number;
    warning: number;
    critical: number;
  };
  trend: 'up' | 'down' | 'stable';
}

interface EnvironmentalData {
  timestamp: string;
  temperature: number;
  humidity: number;
  airQuality: number;
  energyUsage: number;
  waterLevel: number;
  noiseLevel: number;
}

export default function SmartMonitoring() {
  const { language } = useAuth();

  const text = {
    en: {
      title: 'Smart City Monitoring',
      subtitle: 'Real-time environmental and infrastructure monitoring',
      overview: 'Overview',
      sensors: 'Sensors',
      analytics: 'Analytics',
      alerts: 'Alerts',
      temperature: 'Temperature',
      humidity: 'Humidity',
      airQuality: 'Air Quality',
      energy: 'Energy Usage',
      waterLevel: 'Water Level',
      noise: 'Noise Level',
      online: 'Online',
      offline: 'Offline',
      warning: 'Warning',
      critical: 'Critical',
      lastUpdate: 'Last Update',
      trend: 'Trend',
      up: 'Rising',
      down: 'Falling',
      stable: 'Stable',
      celsius: '°C',
      percent: '%',
      aqi: 'AQI',
      kwh: 'kWh',
      meters: 'm',
      decibels: 'dB',
      environmentalHealth: 'Environmental Health',
      infrastructureStatus: 'Infrastructure Status',
      recentAlerts: 'Recent Alerts',
      energyEfficiency: 'Energy Efficiency',
      waterManagement: 'Water Management',
      airQualityStatus: 'Air Quality Status',
      excellent: 'Excellent',
      good: 'Good',
      moderate: 'Moderate',
      poor: 'Poor',
      sensorMetrics: 'Sensor Metrics',
      totalSensors: 'Total Sensors',
      onlineSensors: 'Online Sensors',
      activeSensors: 'Active Sensors',
      alertsToday: 'Alerts Today'
    },
    ms: {
      title: 'Pemantauan Bandar Pintar',
      subtitle: 'Pemantauan persekitaran dan infrastruktur masa nyata',
      overview: 'Gambaran Keseluruhan',
      sensors: 'Sensor',
      analytics: 'Analitik',
      alerts: 'Amaran',
      temperature: 'Suhu',
      humidity: 'Kelembapan',
      airQuality: 'Kualiti Udara',
      energy: 'Penggunaan Tenaga',
      waterLevel: 'Paras Air',
      noise: 'Paras Bunyi',
      online: 'Dalam Talian',
      offline: 'Luar Talian',
      warning: 'Amaran',
      critical: 'Kritikal',
      lastUpdate: 'Kemas Kini Terakhir',
      trend: 'Trend',
      up: 'Meningkat',
      down: 'Menurun',
      stable: 'Stabil',
      celsius: '°C',
      percent: '%',
      aqi: 'IKU',
      kwh: 'kWj',
      meters: 'm',
      decibels: 'dB',
      environmentalHealth: 'Kesihatan Persekitaran',
      infrastructureStatus: 'Status Infrastruktur',
      recentAlerts: 'Amaran Terkini',
      energyEfficiency: 'Kecekapan Tenaga',
      waterManagement: 'Pengurusan Air',
      airQualityStatus: 'Status Kualiti Udara',
      excellent: 'Cemerlang',
      good: 'Baik',
      moderate: 'Sederhana',
      poor: 'Lemah',
      sensorMetrics: 'Metrik Sensor',
      totalSensors: 'Jumlah Sensor',
      onlineSensors: 'Sensor Dalam Talian',
      activeSensors: 'Sensor Aktif',
      alertsToday: 'Amaran Hari Ini'
    }
  };

  const t = text[language];

  const mockSensors: SmartSensor[] = [
    {
      id: '1',
      name: 'Main Lobby Temperature',
      type: 'temperature',
      location: 'Block A Lobby',
      value: 24.5,
      unit: '°C',
      status: 'online',
      lastUpdate: '2024-01-15 10:30:00',
      threshold: { min: 20, max: 28, warning: 26, critical: 30 },
      trend: 'stable'
    },
    {
      id: '2',
      name: 'Outdoor Humidity Sensor',
      type: 'humidity',
      location: 'Garden Area',
      value: 78,
      unit: '%',
      status: 'online',
      lastUpdate: '2024-01-15 10:29:45',
      threshold: { min: 40, max: 80, warning: 75, critical: 85 },
      trend: 'up'
    },
    {
      id: '3',
      name: 'Air Quality Monitor',
      type: 'air_quality',
      location: 'Central Area',
      value: 65,
      unit: 'AQI',
      status: 'warning',
      lastUpdate: '2024-01-15 10:28:20',
      threshold: { min: 0, max: 100, warning: 60, critical: 80 },
      trend: 'up'
    },
    {
      id: '4',
      name: 'Energy Meter Block A',
      type: 'energy',
      location: 'Block A Electrical Room',
      value: 125.8,
      unit: 'kWh',
      status: 'online',
      lastUpdate: '2024-01-15 10:30:15',
      threshold: { min: 0, max: 200, warning: 150, critical: 180 },
      trend: 'down'
    },
    {
      id: '5',
      name: 'Water Tank Level',
      type: 'water_level',
      location: 'Rooftop Tank',
      value: 2.8,
      unit: 'm',
      status: 'critical',
      lastUpdate: '2024-01-15 10:25:00',
      threshold: { min: 1, max: 4, warning: 1.5, critical: 1.2 },
      trend: 'down'
    },
    {
      id: '6',
      name: 'Noise Level Monitor',
      type: 'noise',
      location: 'Playground Area',
      value: 45,
      unit: 'dB',
      status: 'online',
      lastUpdate: '2024-01-15 10:29:30',
      threshold: { min: 0, max: 70, warning: 60, critical: 75 },
      trend: 'stable'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'offline': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
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
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-blue-500" />;
      case 'stable': return <Activity className="h-4 w-4 text-gray-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealthStatus = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return { status: t.excellent, color: 'text-green-600' };
    if (percentage >= 60) return { status: t.good, color: 'text-blue-600' };
    if (percentage >= 40) return { status: t.moderate, color: 'text-yellow-600' };
    return { status: t.poor, color: 'text-red-600' };
  };

  const onlineSensors = mockSensors.filter(s => s.status === 'online').length;
  const criticalSensors = mockSensors.filter(s => s.status === 'critical').length;
  const warningSensors = mockSensors.filter(s => s.status === 'warning').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
          <TabsTrigger value="sensors">{t.sensors}</TabsTrigger>
          <TabsTrigger value="analytics">{t.analytics}</TabsTrigger>
          <TabsTrigger value="alerts">{t.alerts}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Metrics Overview */}
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
                <CardTitle className="text-sm font-medium">{t.onlineSensors}</CardTitle>
                <Wifi className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{onlineSensors}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.warning}</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{warningSensors}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.critical}</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{criticalSensors}</div>
              </CardContent>
            </Card>
          </div>

          {/* Environmental Health Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Thermometer className="h-5 w-5" />
                  <span>{t.temperature}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">24.5°C</div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {t.good}
                    </Badge>
                    {getTrendIcon('stable')}
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wind className="h-5 w-5" />
                  <span>{t.airQuality}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">65 AQI</div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {t.moderate}
                    </Badge>
                    {getTrendIcon('up')}
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Droplets className="h-5 w-5" />
                  <span>{t.humidity}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">78%</div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {t.good}
                    </Badge>
                    {getTrendIcon('up')}
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>{t.recentAlerts}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center space-x-4">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                    <div>
                      <p className="font-medium text-red-900">Critical Water Level</p>
                      <p className="text-sm text-red-700">Water tank level below critical threshold</p>
                    </div>
                  </div>
                  <Badge variant="destructive">{t.critical}</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                  <div className="flex items-center space-x-4">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-900">Air Quality Warning</p>
                      <p className="text-sm text-yellow-700">AQI levels above recommended threshold</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">{t.warning}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sensors" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockSensors.map((sensor) => (
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
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {sensor.value}{sensor.unit}
                    </div>
                    <div className="flex items-center justify-center space-x-2 mt-2">
                      {getTrendIcon(sensor.trend)}
                      <span className="text-sm text-muted-foreground">
                        {t[sensor.trend as keyof typeof t] || sensor.trend}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Range: {sensor.threshold.min} - {sensor.threshold.max}{sensor.unit}</span>
                      <span className="text-muted-foreground">{t.lastUpdate}</span>
                    </div>
                    <Progress 
                      value={(sensor.value / sensor.threshold.max) * 100} 
                      className="h-2" 
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.energyEfficiency}</CardTitle>
                <CardDescription>Daily energy consumption trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">125.8 kWh</div>
                    <p className="text-sm text-muted-foreground">Today's consumption</p>
                  </div>
                  <Progress value={72} className="h-3" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>72% of daily target</span>
                    <span>-12% from yesterday</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.waterManagement}</CardTitle>
                <CardDescription>Water level and usage monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">2.8m</div>
                    <p className="text-sm text-muted-foreground">Current water level</p>
                  </div>
                  <Progress value={70} className="h-3" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Below safe level</span>
                    <span>Refill recommended</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>24-Hour Sensor Data Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockSensors.slice(0, 3).map((sensor) => (
                  <div key={sensor.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getSensorIcon(sensor.type)}
                        <span className="font-medium">{sensor.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {sensor.value}{sensor.unit}
                      </span>
                    </div>
                    <Progress value={(sensor.value / sensor.threshold.max) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.recentAlerts}</CardTitle>
              <CardDescription>System alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Critical Alerts */}
                <div className="space-y-3">
                  <h4 className="font-medium text-red-600">{t.critical} {t.alerts}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-center space-x-4">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                        <div>
                          <p className="font-medium text-red-900">Water Tank Critical Level</p>
                          <p className="text-sm text-red-700">
                            Rooftop Tank: 2.8m (Critical threshold: 1.2m)
                          </p>
                          <p className="text-xs text-red-600">2024-01-15 10:25:00</p>
                        </div>
                      </div>
                      <Badge variant="destructive">{t.critical}</Badge>
                    </div>
                  </div>
                </div>

                {/* Warning Alerts */}
                <div className="space-y-3">
                  <h4 className="font-medium text-yellow-600">{t.warning} {t.alerts}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                      <div className="flex items-center space-x-4">
                        <AlertTriangle className="h-6 w-6 text-yellow-600" />
                        <div>
                          <p className="font-medium text-yellow-900">Air Quality Warning</p>
                          <p className="text-sm text-yellow-700">
                            Central Area: 65 AQI (Warning threshold: 60 AQI)
                          </p>
                          <p className="text-xs text-yellow-600">2024-01-15 10:28:20</p>
                        </div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">{t.warning}</Badge>
                    </div>
                  </div>
                </div>

                {/* Offline Sensors */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-600">Sensor Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <WifiOff className="h-6 w-6 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Sensor Connection Lost</p>
                          <p className="text-sm text-gray-700">
                            Block B Temperature Sensor offline for 2 hours
                          </p>
                          <p className="text-xs text-gray-600">2024-01-15 08:30:00</p>
                        </div>
                      </div>
                      <Badge className="bg-gray-100 text-gray-800">{t.offline}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}