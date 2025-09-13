import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Shield, AlertTriangle, MapPin, Clock } from 'lucide-react';
import { useModuleAccess } from '@/hooks/use-module-access';

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp?: number; // Track when location was obtained
}

export default function PanicButton() {
  const { user, language } = useAuth();
  const { toast } = useToast();
  const [isPressed, setIsPressed] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const { communityId } = useModuleAccess();
  const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN as string;
  const TG_API = TELEGRAM_BOT_TOKEN ? `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}` : "";

  const HOLD_DURATION = 3000; // 3 seconds
  const LOCATION_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes - use cached location if fresher than this

  useEffect(() => {
    // Get user's current location on component mount
    getCurrentLocation();
  }, [language, toast]);

  const getCurrentLocation = (forceRefresh = false) => {
    return new Promise<Location | null>((resolve) => {
      if (!navigator.geolocation) {
        console.error('Geolocation not supported');
        resolve(null);
        return;
      }

      // Check if we have a recent cached location and don't need to force refresh
      if (!forceRefresh && location && location.timestamp) {
        const locationAge = Date.now() - location.timestamp;
        if (locationAge < LOCATION_CACHE_DURATION) {
          console.log('Using cached location');
          resolve(location);
          return;
        }
      }

      console.log('Getting fresh location...');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now()
          };
          
          setLocation(newLocation);
          
          // Reverse geocoding to get address (don't wait for this)
          reverseGeocode(position.coords.latitude, position.coords.longitude);
          
          resolve(newLocation);
        },
        (error) => {
          console.error('Error getting location:', error);
          
          // Show user-friendly error message
          const errorMessages = {
            1: language === 'en' ? 'Location access denied' : 'Akses lokasi ditolak',
            2: language === 'en' ? 'Location unavailable' : 'Lokasi tidak tersedia', 
            3: language === 'en' ? 'Location request timed out' : 'Permintaan lokasi tamat tempoh'
          };
          
          toast({
            title: language === 'en' ? 'Location Error' : 'Ralat Lokasi',
            description: errorMessages[error.code as keyof typeof errorMessages] || 
              (language === 'en' 
                ? 'Unable to get location. Using last known location if available.' 
                : 'Tidak dapat mendapatkan lokasi. Menggunakan lokasi terakhir jika tersedia.'),
            variant: 'destructive',
          });

          // Return the cached location if available, otherwise null
          resolve(location);
        },
        {
          timeout: 15000, // Increased timeout to 15 seconds
          enableHighAccuracy: false, // Use less accurate but faster location
          maximumAge: 300000 // Accept locations up to 5 minutes old
        }
      );
    });
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        {
          headers: {
            "User-Agent": "PrimaPahang-PanicButton/1.0 (https://primapahang.com)"
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Nominatim error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data?.display_name) {
        setLocation(prev => {
          const base = prev ?? { latitude: lat, longitude: lng, timestamp: Date.now() };
          return { ...base, address: data.display_name };
        });
      }
    } catch (error) {
      console.error("Error reverse geocoding with Nominatim:", error);
    }
  };

  const startHold = () => {
    if (isTriggering) return;

    setIsPressed(true);
    setProgress(0);

    // Start progress animation
    progressRef.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (HOLD_DURATION / 100));
        if (newProgress >= 100) {
          if (progressRef.current) {
            clearInterval(progressRef.current);
          }
          return 100;
        }
        return newProgress;
      });
    }, 100);

    // Start hold timer
    timerRef.current = setTimeout(() => {
      triggerPanicAlert();
    }, HOLD_DURATION);
  };

  const endHold = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
    setIsPressed(false);
    setProgress(0);
  };

  const tgSendMessage = async (chatId: string | number, text: string) => {
    if (!TELEGRAM_BOT_TOKEN) throw new Error("Missing TELEGRAM_BOT_TOKEN");
    const res = await fetch(`${TG_API}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => "");
      throw new Error(`sendMessage failed (${res.status}): ${err}`);
    }
    return await res.json();
  }

  const tgSendLocation = async (chatId: string | number, lat: number, lng: number) => {
    if (!TELEGRAM_BOT_TOKEN) throw new Error("Missing TELEGRAM_BOT_TOKEN");
    const res = await fetch(`${TG_API}/sendLocation`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, latitude: lat, longitude: lng }),
    });
    
    if (!res.ok) {
      const err = await res.text().catch(() => "");
      throw new Error(`sendLocation failed (${res.status}): ${err}`);
    }
    return await res.json();
  }

  const triggerPanicAlert = async () => {
    setIsTriggering(true);
    setIsPressed(false);
    setProgress(0);

    try {
      // Try to get current location, but with fallback strategy
      let currentLocation = location;
      
      try {
        // Try to get fresh location but don't wait too long
        const freshLocation = await Promise.race([
          getCurrentLocation(false), // Don't force refresh, use cache if recent
          new Promise<null>(resolve => setTimeout(() => resolve(null), 8000)) // 8 second timeout
        ]);
        
        if (freshLocation) {
          currentLocation = freshLocation;
        }
      } catch (error) {
        console.warn('Failed to get fresh location, using cached location:', error);
        // currentLocation already set to the cached location
      }

      // If we still don't have any location, show warning but continue
      if (!currentLocation) {
        toast({
          title: language === 'en' ? 'Warning' : 'Amaran',
          description: language === 'en' 
            ? 'Unable to determine location. Alert sent without location data.' 
            : 'Tidak dapat menentukan lokasi. Amaran dihantar tanpa data lokasi.',
          variant: 'destructive',
        });
      }

      // Create panic alert in database
      const { data: panicAlert, error } = await supabase
        .from('panic_alerts')
        .insert({
          user_id: user?.id,
          location_latitude: currentLocation?.latitude,
          location_longitude: currentLocation?.longitude,
          location_address: currentLocation?.address,
          alert_status: 'active',
          district_id: null // Allow null since user might not have district assigned yet
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const { data: securityUsers, error: securityError } = await supabase
        .from('profiles')
        .select('*')
        .eq('community_id', communityId);

      if (securityError) {
        console.error('Error fetching security users:', securityError);
        throw securityError;
      }

      if (!securityUsers || securityUsers.length === 0) {
        console.warn('No security users found to notify');
        return; // Exit early if no users to notify
      }
      
      console.log('Current Location JSON:', JSON.stringify(currentLocation, null, 2));

      // Send emergency alerts to all security users
      for (const su of securityUsers) {
        if (su.telegram_chat_id) {
          try {
            const locationText = currentLocation?.latitude && currentLocation?.longitude 
              ? `${currentLocation.latitude}, ${currentLocation.longitude}`
              : 'Location unavailable';

            const message = `🚨 <b>EMERGENCY ALERT</b> 🚨

<b>Alert Details:</b>
👤 <b>Name:</b> ${user?.display_name || 'Unknown'}
📱 <b>Phone:</b> ${user?.phone || 'Not provided'}
🏠 <b>Address:</b> ${user?.address || 'Unknown'}

<b>GPS Coordinates:</b>
📍 ${locationText}

⏰ <b>Time:</b> ${new Date().toLocaleString()}`;

            await tgSendMessage(su.telegram_chat_id, message);

            // Send location if available
            if (currentLocation?.latitude && currentLocation?.longitude) {
              await tgSendLocation(su.telegram_chat_id, currentLocation.latitude, currentLocation.longitude);
            }

          } catch (telegramError) {
            console.error(`Failed to send Telegram notification to ${su.telegram_chat_id}:`, telegramError);
            // Don't throw here unless you want one failed message to stop all others
          }
        }
      }

      // Call edge function to notify security
      const { data: notifyData, error: notifyError } = await supabase.functions.invoke('notify-panic-alert', {
        body: {
          panicAlertId: panicAlert.id,
          userLocation: currentLocation,
          userName: user?.email || 'Unknown User' // Better fallback
        }
      });

      if (notifyError) {
        console.error('Error notifying security:', notifyError);
        console.warn('Alert created but notification may have failed');
      }

      const successMessage = notifyError 
        ? 'Emergency alert created! Security notification may be delayed - please also contact security directly if urgent.'
        : 'Emergency alert sent! Security has been notified and help is on the way.';

      toast({
        title: language === 'en' ? 'Emergency Alert Sent!' : 'Amaran Kecemasan Dihantar!',
        description: language === 'en' 
          ? successMessage
          : (notifyError 
              ? 'Amaran kecemasan dicipta! Pemberitahuan keselamatan mungkin tertangguh - sila hubungi keselamatan secara langsung jika mendesak.'
              : 'Amaran kecemasan dihantar! Keselamatan telah dimaklumkan dan bantuan sedang dalam perjalanan.'
          ),
      });

      setShowConfirm(true);

    } catch (error) {
      console.error('Error triggering panic alert:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' 
          ? 'Failed to send emergency alert. Please try again or contact security directly.' 
          : 'Gagal menghantar amaran kecemasan. Sila cuba lagi atau hubungi keselamatan secara langsung.',
        variant: 'destructive',
      });
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[9999]">
        <div className="relative">
          {/* Progress Circle */}
          {isPressed && (
            <div className="absolute inset-0 -m-3">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 96 96">
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-red-200"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 44}`}
                  strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
                  className="text-red-500 transition-all duration-100 ease-linear"
                />
              </svg>
            </div>
          )}

          {/* Panic Button */}
          <Button
            size="lg"
            className={`
              w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg
              ${isPressed ? 'scale-95 bg-red-700' : ''}
              ${isTriggering ? 'animate-pulse' : ''}
              transition-all duration-150
            `}
            onMouseDown={startHold}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            onTouchStart={startHold}
            onTouchEnd={endHold}
            disabled={isTriggering}
          >
            <Shield className="w-7 h-7" />
          </Button>

          {/* Instructions */}
          <div className="absolute bottom-full right-0 mb-2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {language === 'en' ? 'Panic Button : Hold 3 Seconds' : 'Butang Panik : Tahan 3 Saat'}
          </div>

          {/* Location status indicator */}
          {location && (
            <div className="absolute top-0 left-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              {language === 'en' ? 'Emergency Alert Activated' : 'Amaran Kecemasan Diaktifkan'}
            </DialogTitle>
            <DialogDescription>
              {language === 'en' 
                ? 'Your emergency alert has been sent to security personnel.' 
                : 'Amaran kecemasan anda telah dihantar kepada petugas keselamatan.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <strong>{language === 'en' ? 'Time:' : 'Masa:'}</strong>{' '}
                {new Date().toLocaleString(language === 'en' ? 'en-US' : 'ms-MY')}
              </AlertDescription>
            </Alert>

            {location && (
              <Alert>
                <MapPin className="h-4 w-4" />
                <AlertDescription>
                  <strong>{language === 'en' ? 'Location:' : 'Lokasi:'}</strong>{' '}
                  {location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
                  {location.timestamp && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {language === 'en' ? 'Location age:' : 'Umur lokasi:'} {Math.round((Date.now() - location.timestamp) / 60000)} min
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">
                {language === 'en' 
                  ? '✓ Security has been notified\n✓ Your location has been shared\n✓ Help is on the way'
                  : '✓ Keselamatan telah dimaklumkan\n✓ Lokasi anda telah dikongsi\n✓ Bantuan sedang dalam perjalanan'}
              </p>
            </div>

            <Button 
              onClick={() => setShowConfirm(false)}
              className="w-full"
            >
              {language === 'en' ? 'Close' : 'Tutup'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}