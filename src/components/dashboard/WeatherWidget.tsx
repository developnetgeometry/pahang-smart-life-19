import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  Sunset,
  Sunrise,
  CloudDrizzle,
} from "lucide-react";

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

const WEATHER_API_KEY = ""; // You'll need to add your OpenWeatherMap API key

export function WeatherWidget() {
  const { language } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [locationName, setLocationName] = useState<string>("");

  const getCurrentLocation = () => {
    return new Promise<{ lat: number; lon: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Fallback to Kuantan coordinates
          resolve({ lat: 3.8077, lon: 103.326 });
        },
        { timeout: 10000, maximumAge: 300000 }
      );
    });
  };

  const getLocationName = async (lat: number, lon: number) => {
    try {
      // Using OpenStreetMap Nominatim service - free and no API key required
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=${
          language === "en" ? "en" : "ms"
        }&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Extract city/town/village name from the address
      const address = data.address || {};
      const locationName =
        address.city ||
        address.town ||
        address.village ||
        address.county ||
        address.state ||
        data.display_name?.split(",")[0] ||
        "Unknown Location";

      return locationName;
    } catch (error) {
      console.error("Error getting location name:", error);
      return "Unknown Location";
    }
  };

  const fetchWeatherData = async () => {
    try {
      // Get user's current location
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);

      // Get location name
      const name = await getLocationName(
        currentLocation.lat,
        currentLocation.lon
      );
      setLocationName(name);

      // For demo purposes, using mock data but now with real location
      const mockWeatherData: WeatherData = {
        location: name,
        temperature: Math.round(26 + Math.random() * 8), // 26-34°C range
        condition: ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain"][
          Math.floor(Math.random() * 4)
        ],
        humidity: Math.round(65 + Math.random() * 25), // 65-90%
        windSpeed: Math.round(5 + Math.random() * 15), // 5-20 km/h
        visibility: Math.round(8 + Math.random() * 7), // 8-15 km
        icon: "sunny",
        feels_like: Math.round(28 + Math.random() * 10),
        uv_index: Math.round(3 + Math.random() * 8),
        sunrise: "07:02",
        sunset: "19:16",
      };

      const mockForecast: ForecastData[] = [
        { day: "Today", high: 32, low: 24, condition: "Sunny", icon: "sunny" },
        {
          day: "Tomorrow",
          high: 31,
          low: 23,
          condition: "Partly Cloudy",
          icon: "partly-cloudy",
        },
        { day: "Sun", high: 29, low: 22, condition: "Rainy", icon: "rainy" },
        { day: "Mon", high: 30, low: 23, condition: "Cloudy", icon: "cloudy" },
        { day: "Tue", high: 33, low: 25, condition: "Sunny", icon: "sunny" },
      ];

      setWeather(mockWeatherData);
      setForecast(mockForecast);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching weather:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "sunny":
      case "clear":
        return Sun;
      case "partly-cloudy":
      case "partly cloudy":
        return Cloud;
      case "cloudy":
        return Cloud;
      case "rainy":
      case "rain":
      case "light rain":
        return CloudRain;
      case "drizzle":
        return CloudDrizzle;
      case "snow":
        return CloudSnow;
      default:
        return Sun;
    }
  };

  const getBackgroundClass = () => {
    const hour = new Date().getHours();
    const condition = weather?.condition.toLowerCase() || "";

    // Night time (10 PM - 6 AM) - Dark with stars
    if (hour >= 22 || hour < 6) {
      if (condition.includes("clear") || condition.includes("sunny")) {
        return "bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden";
      } else if (condition.includes("rain")) {
        return "bg-gradient-to-br from-gray-800 via-slate-700 to-gray-900 relative overflow-hidden";
      }
      return "bg-gradient-to-br from-slate-800 via-gray-800 to-slate-900 relative overflow-hidden";
    }
    // Morning (6 AM - 12 PM)
    else if (hour >= 6 && hour < 12) {
      if (condition.includes("sunny") || condition.includes("clear")) {
        return "bg-gradient-to-br from-amber-300 via-orange-300 to-yellow-400 relative overflow-hidden";
      } else if (condition.includes("rain")) {
        return "bg-gradient-to-br from-gray-400 via-slate-400 to-blue-400 relative overflow-hidden";
      }
      return "bg-gradient-to-br from-blue-300 via-sky-300 to-cyan-400 relative overflow-hidden";
    }
    // Afternoon (12 PM - 6 PM)
    else if (hour >= 12 && hour < 18) {
      if (condition.includes("sunny") || condition.includes("clear")) {
        return "bg-gradient-to-br from-sky-400 via-blue-400 to-cyan-500 relative overflow-hidden";
      } else if (condition.includes("rain")) {
        return "bg-gradient-to-br from-gray-500 via-slate-500 to-blue-500 relative overflow-hidden";
      }
      return "bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-500 relative overflow-hidden";
    }
    // Evening (6 PM - 10 PM)
    else {
      if (condition.includes("clear") || condition.includes("sunny")) {
        return "bg-gradient-to-br from-orange-500 via-red-400 to-pink-500 relative overflow-hidden";
      } else if (condition.includes("rain")) {
        return "bg-gradient-to-br from-gray-600 via-slate-600 to-purple-600 relative overflow-hidden";
      }
      return "bg-gradient-to-br from-orange-400 via-pink-400 to-purple-500 relative overflow-hidden";
    }
  };

  const getTextColorClass = () => {
    return "text-white";
  };

  const getWeatherAnimation = () => {
    const hour = new Date().getHours();
    const condition = weather?.condition.toLowerCase() || "";

    // Night animations
    if (hour >= 22 || hour < 6) {
      return (
        <div className="absolute inset-0 pointer-events-none">
          {/* Stars */}
          <div className="absolute top-4 left-8 w-1 h-1 bg-white rounded-full animate-pulse"></div>
          <div
            className="absolute top-8 right-12 w-1 h-1 bg-white rounded-full animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div
            className="absolute top-12 left-20 w-0.5 h-0.5 bg-white rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-6 right-20 w-0.5 h-0.5 bg-white rounded-full animate-pulse"
            style={{ animationDelay: "1.5s" }}
          ></div>
          <div
            className="absolute top-16 left-12 w-1 h-1 bg-white rounded-full animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>

          {/* Moon */}
          <div className="absolute top-6 right-8 w-8 h-8 bg-yellow-100 rounded-full shadow-lg"></div>
        </div>
      );
    }
    // Sunny day animations
    else if (condition.includes("sunny") || condition.includes("clear")) {
      return (
        <div className="absolute inset-0 pointer-events-none">
          {/* Sun rays */}
          <div className="absolute top-4 right-4 w-12 h-12">
            <div
              className="absolute inset-0 animate-spin"
              style={{ animationDuration: "20s" }}
            >
              <div className="absolute top-0 left-1/2 w-0.5 h-3 bg-yellow-200 transform -translate-x-1/2"></div>
              <div className="absolute top-1 right-1 w-0.5 h-2 bg-yellow-200 transform rotate-45"></div>
              <div className="absolute top-1/2 right-0 w-3 h-0.5 bg-yellow-200 transform -translate-y-1/2"></div>
              <div className="absolute bottom-1 right-1 w-0.5 h-2 bg-yellow-200 transform -rotate-45"></div>
              <div className="absolute bottom-0 left-1/2 w-0.5 h-3 bg-yellow-200 transform -translate-x-1/2"></div>
              <div className="absolute bottom-1 left-1 w-0.5 h-2 bg-yellow-200 transform rotate-45"></div>
              <div className="absolute top-1/2 left-0 w-3 h-0.5 bg-yellow-200 transform -translate-y-1/2"></div>
              <div className="absolute top-1 left-1 w-0.5 h-2 bg-yellow-200 transform -rotate-45"></div>
            </div>
          </div>
        </div>
      );
    }
    // Rainy animations
    else if (condition.includes("rain")) {
      return (
        <div className="absolute inset-0 pointer-events-none">
          {/* Rain drops */}
          <div
            className="absolute top-0 left-4 w-0.5 h-4 bg-blue-200 opacity-70 animate-bounce"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="absolute top-0 left-12 w-0.5 h-3 bg-blue-200 opacity-70 animate-bounce"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div
            className="absolute top-0 right-8 w-0.5 h-4 bg-blue-200 opacity-70 animate-bounce"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-0 right-16 w-0.5 h-3 bg-blue-200 opacity-70 animate-bounce"
            style={{ animationDelay: "1.5s" }}
          ></div>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cloud className="w-5 h-5" />
            <span>{language === "en" ? "Weather" : "Cuaca"}</span>
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
    <Card
      className={`hover:shadow-elegant transition-spring overflow-hidden ${getBackgroundClass()}`}
    >
      {/* Weather animations */}
      {getWeatherAnimation()}

      <CardHeader>
        <CardTitle
          className={`flex items-center space-x-2 ${textColorClass} relative z-10`}
        >
          <Cloud className="w-5 h-5" />
          <span>{language === "en" ? "Weather" : "Cuaca"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 relative z-10">
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
              {language === "en" ? "Feels like" : "Terasa seperti"}{" "}
              {weather.feels_like}°C
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
                {language === "en" ? "Sunrise" : "Matahari Terbit"}
              </p>
              <p className={`text-sm font-medium ${textColorClass}`}>
                {weather.sunrise}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Sunset className={`w-4 h-4 ${textColorClass} opacity-75`} />
            <div>
              <p className={`text-xs ${textColorClass} opacity-75`}>
                {language === "en" ? "Sunset" : "Matahari Terbenam"}
              </p>
              <p className={`text-sm font-medium ${textColorClass}`}>
                {weather.sunset}
              </p>
            </div>
          </div>
        </div>

        {/* Weather details grid */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center">
            <Droplets
              className={`w-4 h-4 mx-auto ${textColorClass} opacity-75`}
            />
            <p className={`text-xs ${textColorClass} opacity-75 mt-1`}>
              {language === "en" ? "Humidity" : "Kelembapan"}
            </p>
            <p className={`text-sm font-medium ${textColorClass}`}>
              {weather.humidity}%
            </p>
          </div>
          <div className="text-center">
            <Wind className={`w-4 h-4 mx-auto ${textColorClass} opacity-75`} />
            <p className={`text-xs ${textColorClass} opacity-75 mt-1`}>
              {language === "en" ? "Wind" : "Angin"}
            </p>
            <p className={`text-sm font-medium ${textColorClass}`}>
              {weather.windSpeed} km/h
            </p>
          </div>
          <div className="text-center">
            <Eye className={`w-4 h-4 mx-auto ${textColorClass} opacity-75`} />
            <p className={`text-xs ${textColorClass} opacity-75 mt-1`}>
              {language === "en" ? "Visibility" : "Jarak Pandang"}
            </p>
            <p className={`text-sm font-medium ${textColorClass}`}>
              {weather.visibility} km
            </p>
          </div>
          <div className="text-center">
            <Sun className={`w-4 h-4 mx-auto ${textColorClass} opacity-75`} />
            <p className={`text-xs ${textColorClass} opacity-75 mt-1`}>
              {language === "en" ? "UV Index" : "Indeks UV"}
            </p>
            <p className={`text-sm font-medium ${textColorClass}`}>
              {weather.uv_index}
            </p>
          </div>
        </div>

        {/* 5-day forecast */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <h4 className={`text-sm font-semibold ${textColorClass} mb-3`}>
            {language === "en" ? "5-Day Forecast" : "Ramalan 5 Hari"}
          </h4>
          <div className="space-y-2">
            {forecast.map((day, index) => {
              const ForecastIcon = getWeatherIcon(day.icon);
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ForecastIcon
                      className={`w-5 h-5 ${textColorClass} opacity-75`}
                    />
                    <span
                      className={`text-sm ${textColorClass} font-medium min-w-[60px]`}
                    >
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
