import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Shield, AlertTriangle, MapPin, Clock } from 'lucide-react';

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
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

  const HOLD_DURATION = 3000; // 3 seconds

  useEffect(() => {
    // Get user's current location on component mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          
          // Reverse geocoding to get address
          reverseGeocode(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: language === 'en' ? 'Location Error' : 'Ralat Lokasi',
            description: language === 'en' 
              ? 'Unable to get your location. Panic button will still work.' 
              : 'Tidak dapat mendapatkan lokasi anda. Butang panik masih akan berfungsi.',
            variant: 'destructive',
          });
        }
      );
    }
  }, [language, toast]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Using a free geocoding service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();
      
      if (data.display_name || data.locality) {
        setLocation(prev => prev ? {
          ...prev,
          address: data.display_name || `${data.locality}, ${data.countryName}`
        } : null);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
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

  const triggerPanicAlert = async () => {
    setIsTriggering(true);
    setIsPressed(false);
    setProgress(0);

    try {
      // Get current location if not already available
      let currentLocation = location;
      if (!currentLocation && navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          
          currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
        } catch (error) {
          console.error('Error getting current location:', error);
        }
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
        // Don't throw error here - the alert was still created in database
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
      <div className="fixed bottom-6 right-6 z-50">
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
            {language === 'en' ? 'Hold for 3 seconds' : 'Tahan selama 3 saat'}
          </div>
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