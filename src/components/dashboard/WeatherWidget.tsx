import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Thermometer, Eye, Sunset, Sunrise, CloudDrizzle } from 'lucide-react';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  icon: string;
  feels_like: number;
  uv_index: number;
  sunrise: string;
  sunset: string;
}

interface ForecastData {
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
}

const WEATHER_API_KEY = ''; // You'll need to add your OpenWeatherMap API key

export function WeatherWidget() {
  const { language } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWeatherData = async () => {
    try {
      // Kuantan, Pahang coordinates
      const lat = 3.8077;
      const lon = 103.326;
      
      // For demo purposes, using mock data that simulates real weather API
      const mockWeatherData: WeatherData = {
        location: 'Kuantan, Pahang',
        temperature: Math.round(26 + Math.random() * 8), // 26-34°C range
        condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
        humidity: Math.round(65 + Math.random() * 25), // 65-90%
        windSpeed: Math.round(5 + Math.random() * 15), // 5-20 km/h
        visibility: Math.round(8 + Math.random() * 7), // 8-15 km
        icon: 'sunny',
        feels_like: Math.round(28 + Math.random() * 10),
        uv_index: Math.round(3 + Math.random() * 8),
        sunrise: '07:02',
        sunset: '19:16'
      };

      const mockForecast: ForecastData[] = [
        { day: 'Today', high: 32, low: 24, condition: 'Sunny', icon: 'sunny' },
        { day: 'Tomorrow', high: 31, low: 23, condition: 'Partly Cloudy', icon: 'partly-cloudy' },
        { day: 'Sun', high: 29, low: 22, condition: 'Rainy', icon: 'rainy' },
        { day: 'Mon', high: 30, low: 23, condition: 'Cloudy', icon: 'cloudy' },
        { day: 'Tue', high: 33, low: 25, condition: 'Sunny', icon: 'sunny' }
      ];

      setWeather(mockWeatherData);
      setForecast(mockForecast);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching weather:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return Sun;
      case 'partly-cloudy':
      case 'partly cloudy':
        return Cloud;
      case 'cloudy':
        return Cloud;
      case 'rainy':
      case 'rain':
      case 'light rain':
        return CloudRain;
      case 'drizzle':
        return CloudDrizzle;
      case 'snow':
        return CloudSnow;
      default:
        return Sun;
    }
  };

  const getBackgroundClass = () => {
    const hour = new Date().getHours();
    const condition = weather?.condition.toLowerCase() || '';
    
    // Time-based backgrounds
    if (hour >= 6 && hour < 12) {
      // Morning
      if (condition.includes('sunny') || condition.includes('clear')) {
        return 'bg-gradient-to-br from-orange-200 via-yellow-200 to-orange-300';
      } else if (condition.includes('rain')) {
        return 'bg-gradient-to-br from-gray-300 via-blue-200 to-gray-400';
      }
      return 'bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-300';
    } else if (hour >= 12 && hour < 18) {
      // Afternoon
      if (condition.includes('sunny') || condition.includes('clear')) {
        return 'bg-gradient-to-br from-blue-300 via-cyan-200 to-blue-400';
      } else if (condition.includes('rain')) {
        return 'bg-gradient-to-br from-gray-400 via-slate-300 to-gray-500';
      }
      return 'bg-gradient-to-br from-blue-300 via-sky-200 to-indigo-300';
    } else if (hour >= 18 && hour < 22) {
      // Evening
      return 'bg-gradient-to-br from-orange-400 via-red-300 to-pink-400';
    } else {
      // Night
      return 'bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900';
    }
  };

  const getTextColorClass = () => {
    const hour = new Date().getHours();
    return hour >= 22 || hour < 6 ? 'text-white' : 'text-gray-800';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cloud className="w-5 h-5" />
            <span>{language === 'en' ? 'Weather' : 'Cuaca'}</span>
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

  const WeatherIcon = getWeatherIcon(weather.condition);
  const textColorClass = getTextColorClass();

  return (
    <Card className={`hover:shadow-elegant transition-spring overflow-hidden ${getBackgroundClass()}`}>
      <CardHeader>
        <CardTitle className={`flex items-center space-x-2 ${textColorClass}`}>
          <Cloud className="w-5 h-5" />
          <span>{language === 'en' ? 'Weather' : 'Cuaca'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main weather display */}
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-4xl font-bold ${textColorClass}`}>
              {weather.temperature}°C
            </div>
            <p className={`text-sm ${textColorClass} opacity-90`}>
              {weather.condition}
            </p>
            <p className={`text-xs ${textColorClass} opacity-75`}>
              {weather.location}
            </p>
            <p className={`text-xs ${textColorClass} opacity-75 mt-1`}>
              {language === 'en' ? 'Feels like' : 'Terasa seperti'} {weather.feels_like}°C
            </p>
          </div>
          <div className="text-center">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-full mb-2">
              <WeatherIcon className={`w-12 h-12 ${textColorClass}`} />
            </div>
          </div>
        </div>

        {/* Additional weather info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Sunrise className={`w-4 h-4 ${textColorClass} opacity-75`} />
            <div>
              <p className={`text-xs ${textColorClass} opacity-75`}>
                {language === 'en' ? 'Sunrise' : 'Matahari Terbit'}
              </p>
              <p className={`text-sm font-medium ${textColorClass}`}>{weather.sunrise}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Sunset className={`w-4 h-4 ${textColorClass} opacity-75`} />
            <div>
              <p className={`text-xs ${textColorClass} opacity-75`}>
                {language === 'en' ? 'Sunset' : 'Matahari Terbenam'}
              </p>
              <p className={`text-sm font-medium ${textColorClass}`}>{weather.sunset}</p>
            </div>
          </div>
        </div>

        {/* Weather details grid */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center">
            <Droplets className={`w-4 h-4 mx-auto ${textColorClass} opacity-75`} />
            <p className={`text-xs ${textColorClass} opacity-75 mt-1`}>
              {language === 'en' ? 'Humidity' : 'Kelembapan'}
            </p>
            <p className={`text-sm font-medium ${textColorClass}`}>{weather.humidity}%</p>
          </div>
          <div className="text-center">
            <Wind className={`w-4 h-4 mx-auto ${textColorClass} opacity-75`} />
            <p className={`text-xs ${textColorClass} opacity-75 mt-1`}>
              {language === 'en' ? 'Wind' : 'Angin'}
            </p>
            <p className={`text-sm font-medium ${textColorClass}`}>{weather.windSpeed} km/h</p>
          </div>
          <div className="text-center">
            <Eye className={`w-4 h-4 mx-auto ${textColorClass} opacity-75`} />
            <p className={`text-xs ${textColorClass} opacity-75 mt-1`}>
              {language === 'en' ? 'Visibility' : 'Jarak Pandang'}
            </p>
            <p className={`text-sm font-medium ${textColorClass}`}>{weather.visibility} km</p>
          </div>
          <div className="text-center">
            <Sun className={`w-4 h-4 mx-auto ${textColorClass} opacity-75`} />
            <p className={`text-xs ${textColorClass} opacity-75 mt-1`}>
              {language === 'en' ? 'UV Index' : 'Indeks UV'}
            </p>
            <p className={`text-sm font-medium ${textColorClass}`}>{weather.uv_index}</p>
          </div>
        </div>

        {/* 5-day forecast */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <h4 className={`text-sm font-semibold ${textColorClass} mb-3`}>
            {language === 'en' ? '5-Day Forecast' : 'Ramalan 5 Hari'}
          </h4>
          <div className="space-y-2">
            {forecast.map((day, index) => {
              const ForecastIcon = getWeatherIcon(day.icon);
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ForecastIcon className={`w-5 h-5 ${textColorClass} opacity-75`} />
                    <span className={`text-sm ${textColorClass} font-medium min-w-[60px]`}>
                      {day.day}
                    </span>
                    <span className={`text-xs ${textColorClass} opacity-75`}>
                      {day.condition}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-semibold ${textColorClass}`}>
                      {day.high}°
                    </span>
                    <span className={`text-sm ${textColorClass} opacity-75`}>
                      {day.low}°
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}