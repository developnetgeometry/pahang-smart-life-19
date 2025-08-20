import { useState, useEffect } from 'react';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Thermometer, Eye } from 'lucide-react';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  icon: string;
}

export function WeatherWidget() {
  const { user } = useEnhancedAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock weather data for Kuantan, Pahang
    const mockWeather: WeatherData = {
      location: 'Kuantan, Pahang',
      temperature: 29,
      condition: 'Separuh Mendung',
      humidity: 78,
      windSpeed: 12,
      visibility: 10,
      icon: 'partly-cloudy'
    };

    // Simulate API call delay
    setTimeout(() => {
      setWeather(mockWeather);
      setLoading(false);
    }, 1000);
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return Sun;
      case 'partly-cloudy':
      case 'cloudy':
        return Cloud;
      case 'rainy':
      case 'rain':
        return CloudRain;
      case 'snow':
        return CloudSnow;
      default:
        return Sun;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cloud className="w-5 h-5" />
            <span>Cuaca</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="w-12 h-12 rounded-full" />
          </div>
          <Skeleton className="h-4 w-32" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  const WeatherIcon = getWeatherIcon(weather.icon);

  return (
    <Card className="hover:shadow-elegant transition-spring">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Cloud className="w-5 h-5" />
          <span>Cuaca</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main weather display */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-foreground">
              {weather.temperature}°C
            </div>
            <p className="text-sm text-muted-foreground">
              {weather.condition}
            </p>
            <p className="text-xs text-muted-foreground">
              {weather.location}
            </p>
          </div>
          <div className="p-3 bg-gradient-primary rounded-full">
            <WeatherIcon className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Weather details */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center space-y-1">
            <Droplets className="w-4 h-4 mx-auto text-blue-500" />
            <p className="text-xs text-muted-foreground">
              Kelembapan
            </p>
            <p className="text-sm font-medium">{weather.humidity}%</p>
          </div>
          <div className="text-center space-y-1">
            <Wind className="w-4 h-4 mx-auto text-green-500" />
            <p className="text-xs text-muted-foreground">
              Angin
            </p>
            <p className="text-sm font-medium">{weather.windSpeed} km/h</p>
          </div>
          <div className="text-center space-y-1">
            <Eye className="w-4 h-4 mx-auto text-purple-500" />
            <p className="text-xs text-muted-foreground">
              Jarak Pandang
            </p>
            <p className="text-sm font-medium">{weather.visibility} km</p>
          </div>
        </div>

        {/* Air quality indicator */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Kualiti Udara
            </span>
            <span className="text-sm font-medium text-green-600">
              Baik
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div className="bg-green-500 h-2 rounded-full w-3/4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}