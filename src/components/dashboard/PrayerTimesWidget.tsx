import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Building, Clock, Bell, BellOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import mekahEveningImage from "@/assets/mekah-clock-tower-evening.jpg";
import mekahNightImage from "@/assets/mekah-clock-tower-night.jpg";

interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date: string;
  hijriDate: string;
}

interface PrayerNotificationSettings {
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
}

export function PrayerTimesWidget() {
  const { language } = useAuth();
  const { toast } = useToast();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPrayer, setCurrentPrayer] = useState<string>("");
  const [nextPrayer, setNextPrayer] = useState<{
    name: string;
    time: string;
    countdown: string;
  }>({ name: "", time: "", countdown: "" });
  const [notificationSettings, setNotificationSettings] =
    useState<PrayerNotificationSettings>({
      fajr: true,
      dhuhr: true,
      asr: true,
      maghrib: true,
      isha: true,
    });
  const [showSettings, setShowSettings] = useState(false);
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
          resolve({ lat: 3.2244, lon: 101.4497 });
        },
        { timeout: 10000, maximumAge: 300000 }
      );
    });
  };

  const getZoneFromCoordinates = (lat: number, lon: number) => {
    // Malaysia prayer zone mapping based on coordinates
    // This is a simplified mapping for major states
    if (lat >= 6.0 && lat <= 6.8 && lon >= 100.0 && lon <= 100.8)
      return "KDH01"; // Kedah
    if (lat >= 5.2 && lat <= 6.0 && lon >= 100.2 && lon <= 101.2)
      return "PNG01"; // Penang
    if (lat >= 4.0 && lat <= 5.5 && lon >= 100.0 && lon <= 101.5)
      return "PRK01"; // Perak
    if (lat >= 3.0 && lat <= 4.2 && lon >= 101.0 && lon <= 102.0)
      return "SGR01"; // Selangor
    if (lat >= 3.1 && lat <= 3.3 && lon >= 101.5 && lon <= 101.8)
      return "WLY01"; // KL
    if (lat >= 2.0 && lat <= 4.5 && lon >= 101.5 && lon <= 104.5)
      return "PHG01"; // Pahang
    if (lat >= 1.2 && lat <= 3.0 && lon >= 102.0 && lon <= 104.5)
      return "JHR01"; // Johor
    if (lat >= 2.0 && lat <= 3.5 && lon >= 101.8 && lon <= 103.0)
      return "NGS01"; // Negeri Sembilan
    if (lat >= 2.0 && lat <= 3.0 && lon >= 102.0 && lon <= 103.0)
      return "MLK01"; // Melaka
    if (lat >= 1.0 && lat <= 7.0 && lon >= 109.0 && lon <= 119.5)
      return "SWK01"; // Sarawak
    if (lat >= 4.0 && lat <= 7.5 && lon >= 115.0 && lon <= 119.5)
      return "SBH01"; // Sabah
    if (lat >= 4.5 && lat <= 6.0 && lon >= 102.0 && lon <= 103.5)
      return "TRG01"; // Terengganu
    if (lat >= 4.5 && lat <= 6.5 && lon >= 101.5 && lon <= 103.0)
      return "KTN01"; // Kelantan

    // Default fallback to Pahang if no match
    return "PHG01";
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
        (language === "en" ? "Unknown Location" : "Lokasi Tidak Diketahui");

      return locationName;
    } catch (error) {
      console.error("Error getting location name:", error);
      return language === "en" ? "Unknown Location" : "Lokasi Tidak Diketahui";
    }
  };

  useEffect(() => {
    fetchPrayerTimes();
    // Check prayer times every minute
    const interval = setInterval(() => {
      updateCurrentPrayer();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (prayerTimes) {
      updateCurrentPrayer();
    }
  }, [prayerTimes]);

  const fetchPrayerTimes = async () => {
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

      // Get appropriate zone code based on location
      const zoneCode = getZoneFromCoordinates(
        currentLocation.lat,
        currentLocation.lon
      );

      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");

      const response = await fetch(
        `https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=month&zone=${zoneCode}&year=${year}&month=${month}&_=${Date.now()}`
      );

      const data = await response.json();

      if (data && data.prayerTime && data.prayerTime.length > 0) {
        const todayData = data.prayerTime.find((day: any) => {
          const dayDate = new Date(day.date);
          return dayDate.toDateString() === today.toDateString();
        });

        if (todayData) {
          const times: PrayerTimes = {
            fajr: todayData.fajr,
            sunrise: todayData.syuruk,
            dhuhr: todayData.dhuhr,
            asr: todayData.asr,
            maghrib: todayData.maghrib,
            isha: todayData.isha,
            date: todayData.date,
            hijriDate: todayData.hijridate,
          };

          setPrayerTimes(times);
        }
      }
    } catch (error) {
      console.error("Error fetching prayer times:", error);
      // Fallback to mock data
      const mockTimes: PrayerTimes = {
        fajr: "05:45",
        sunrise: "07:05",
        dhuhr: "13:15",
        asr: "16:30",
        maghrib: "19:25",
        isha: "20:35",
        date: new Date().toISOString().split("T")[0],
        hijriDate: "15 Safar 1446",
      };
      setPrayerTimes(mockTimes);
    } finally {
      setLoading(false);
    }
  };

  const updateCurrentPrayer = () => {
    if (!prayerTimes) return;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const prayers = [
      { name: "fajr", time: prayerTimes.fajr, nameEn: "Fajr", nameMy: "Subuh" },
      {
        name: "sunrise",
        time: prayerTimes.sunrise,
        nameEn: "Sunrise",
        nameMy: "Syuruk",
      },
      {
        name: "dhuhr",
        time: prayerTimes.dhuhr,
        nameEn: "Dhuhr",
        nameMy: "Zohor",
      },
      { name: "asr", time: prayerTimes.asr, nameEn: "Asr", nameMy: "Asar" },
      {
        name: "maghrib",
        time: prayerTimes.maghrib,
        nameEn: "Maghrib",
        nameMy: "Maghrib",
      },
      { name: "isha", time: prayerTimes.isha, nameEn: "Isha", nameMy: "Isyak" },
    ];

    // Find current and next prayer
    let current = "";
    let next = prayers[0];

    for (let i = 0; i < prayers.length; i++) {
      if (currentTime >= prayers[i].time) {
        current = language === "en" ? prayers[i].nameEn : prayers[i].nameMy;
        next = prayers[i + 1] || prayers[0];
      } else {
        next = prayers[i];
        break;
      }
    }

    // Calculate countdown to next prayer
    const nextPrayerTime = new Date();
    const [hours, minutes] = next.time.split(":").map(Number);
    nextPrayerTime.setHours(hours, minutes, 0, 0);

    // If next prayer is tomorrow
    if (nextPrayerTime <= now) {
      nextPrayerTime.setDate(nextPrayerTime.getDate() + 1);
    }

    const timeDiff = nextPrayerTime.getTime() - now.getTime();
    const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    setCurrentPrayer(current);
    setNextPrayer({
      name: language === "en" ? next.nameEn : next.nameMy,
      time: next.time,
      countdown: `${hoursLeft}j ${minutesLeft}m`,
    });

    // Check if it's time for prayer and send notification
    const exactTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
    prayers.forEach((prayer) => {
      if (
        prayer.time === exactTime &&
        notificationSettings[prayer.name as keyof PrayerNotificationSettings]
      ) {
        const prayerName = language === "en" ? prayer.nameEn : prayer.nameMy;
        sendPrayerNotification(prayerName);
      }
    });
  };

  const sendPrayerNotification = (prayerName: string) => {
    // Browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(
        language === "en"
          ? `Prayer Time: ${prayerName}`
          : `Waktu Solat: ${prayerName}`,
        {
          body:
            language === "en"
              ? "It's time for prayer. May Allah accept your prayers."
              : "Sudah masuk waktu solat. Semoga Allah menerima solat anda.",
          icon: "/placeholder.svg",
        }
      );
    }

    // Toast notification
    toast({
      title:
        language === "en"
          ? `Prayer Time: ${prayerName}`
          : `Waktu Solat: ${prayerName}`,
      description:
        language === "en"
          ? "It's time for prayer."
          : "Sudah masuk waktu solat.",
    });
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        toast({
          title:
            language === "en"
              ? "Notifications Enabled"
              : "Notifikasi Diaktifkan",
          description:
            language === "en"
              ? "You will receive prayer time notifications."
              : "Anda akan menerima notifikasi waktu solat.",
        });
      }
    }
  };

  const toggleNotification = (prayerName: keyof PrayerNotificationSettings) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [prayerName]: !prev[prayerName],
    }));
  };

  const getTimeOfDayBackground = () => {
    // Evening image: if current or next prayer is Zohor/Asar
    // Night image: for all other prayers (Subuh, Maghrib, Isyak)
    const eveningPrayers = ["Dhuhr", "Zohor", "Asr", "Asar"];
    const isEveningTime = eveningPrayers.some(
      (prayer) =>
        currentPrayer.includes(prayer) || nextPrayer.name.includes(prayer)
    );

    return isEveningTime ? mekahEveningImage : mekahNightImage;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="w-5 h-5" />
            <span>{language === "en" ? "Prayer Times" : "Waktu Solat"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!prayerTimes) return null;

  const prayerList = [
    { name: "fajr", time: prayerTimes.fajr, nameEn: "Fajr", nameMy: "Subuh" },
    {
      name: "dhuhr",
      time: prayerTimes.dhuhr,
      nameEn: "Dhuhr",
      nameMy: "Zohor",
    },
    { name: "asr", time: prayerTimes.asr, nameEn: "Asr", nameMy: "Asar" },
    {
      name: "maghrib",
      time: prayerTimes.maghrib,
      nameEn: "Maghrib",
      nameMy: "Maghrib",
    },
    { name: "isha", time: prayerTimes.isha, nameEn: "Isha", nameMy: "Isyak" },
  ];

  return (
    <Card
      className="hover:shadow-elegant transition-spring relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${getTimeOfDayBackground()})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5" />
              <span>{language === "en" ? "Prayer Times" : "Waktu Solat"}</span>
            </div>
            {locationName && (
              <p className="text-sm text-white/80 font-normal">
                {locationName}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-white hover:bg-white/20"
          >
            {showSettings ? (
              <BellOff className="w-4 h-4" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Prayer Status */}
        {nextPrayer.name && (
          <div className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-lg border border-white/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">
                  {language === "en" ? "Next Prayer" : "Solat Seterusnya"}
                </p>
                <p className="font-semibold">{nextPrayer.name}</p>
                <p className="text-sm">{nextPrayer.time}</p>
              </div>
              <div className="text-right">
                <Clock className="w-5 h-5 mb-1 ml-auto" />
                <p className="text-sm font-medium">{nextPrayer.countdown}</p>
              </div>
            </div>
          </div>
        )}

        {/* Prayer Times List */}
        <div className="space-y-2 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
          {prayerList.map((prayer) => (
            <div
              key={prayer.name}
              className="flex justify-between items-center py-2 border-b border-white/20 last:border-0"
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-white">
                  {language === "en" ? prayer.nameEn : prayer.nameMy}
                </span>
                {showSettings && (
                  <Switch
                    checked={
                      notificationSettings[
                        prayer.name as keyof PrayerNotificationSettings
                      ]
                    }
                    onCheckedChange={() =>
                      toggleNotification(
                        prayer.name as keyof PrayerNotificationSettings
                      )
                    }
                    className="scale-75"
                  />
                )}
              </div>
              <Badge
                variant="outline"
                className="text-sm bg-white/20 text-white border-white/30"
              >
                {prayer.time}
              </Badge>
            </div>
          ))}
        </div>

        {/* Hijri Date */}
        <div className="text-center text-xs text-white/80 border-t border-white/20 pt-3">
          {prayerTimes.hijriDate}
        </div>

        {/* Enable Notifications Button */}
        {!showSettings &&
          "Notification" in window &&
          Notification.permission !== "granted" && (
            <Button
              variant="outline"
              size="sm"
              onClick={requestNotificationPermission}
              className="w-full bg-white/10 text-white border-white/30 hover:bg-white/20"
            >
              <Bell className="w-4 h-4 mr-2" />
              {language === "en"
                ? "Enable Notifications"
                : "Aktifkan Notifikasi"}
            </Button>
          )}
      </CardContent>
    </Card>
  );
}
