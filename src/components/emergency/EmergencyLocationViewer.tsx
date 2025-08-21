import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin, Navigation } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EmergencyLocationViewerProps {
  latitude: number;
  longitude: number;
  address?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const EmergencyLocationViewer: React.FC<EmergencyLocationViewerProps> = ({
  latitude,
  longitude,
  address,
  isOpen,
  onClose
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  useEffect(() => {
    // Try to get Mapbox token from edge function
    const initializeMap = async () => {
      try {
        const response = await fetch('https://hjhalygcsdolryngmlry.supabase.co/functions/v1/get-mapbox-token');
        if (response.ok) {
          const { token } = await response.json();
          setMapboxToken(token);
        } else {
          setShowTokenInput(true);
        }
      } catch {
        setShowTokenInput(true);
      }
    };

    if (isOpen) {
      initializeMap();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || !isOpen) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [longitude, latitude],
      zoom: 15
    });

    // Add marker for the emergency location
    new mapboxgl.Marker({ color: '#ef4444' })
      .setLngLat([longitude, latitude])
      .addTo(map.current);

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
    };
  }, [latitude, longitude, mapboxToken, isOpen]);

  const openExternalMaps = (service: string) => {
    let url = '';
    
    switch (service) {
      case 'google':
        url = `https://maps.google.com/?q=${latitude},${longitude}`;
        break;
      case 'apple':
        url = `https://maps.apple.com/?ll=${latitude},${longitude}&z=16`;
        break;
      case 'osm':
        url = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=16&layers=M`;
        break;
      case 'waze':
        url = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
        break;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      setShowTokenInput(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-destructive" />
            Emergency Location
          </DialogTitle>
        </DialogHeader>
        
        {showTokenInput ? (
          <div className="space-y-4 p-4">
            <div className="text-sm text-muted-foreground">
              To display the interactive map, please provide your Mapbox public token.
              Get your token from{' '}
              <a 
                href="https://mapbox.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                mapbox.com
              </a>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
              <Input
                id="mapbox-token"
                type="text"
                placeholder="pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJ5b3VyLXRva2VuIn0..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
              />
              <Button onClick={handleTokenSubmit} className="w-full">
                Load Map
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full gap-4">
            {address && (
              <div className="bg-muted p-3 rounded-md">
                <div className="text-sm font-medium">Address:</div>
                <div className="text-sm text-muted-foreground">{address}</div>
              </div>
            )}
            
            <div className="flex-1 relative">
              <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openExternalMaps('google')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Google Maps
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openExternalMaps('apple')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Apple Maps
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openExternalMaps('osm')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                OpenStreetMap
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openExternalMaps('waze')}
                className="flex items-center gap-2"
              >
                <Navigation className="h-4 w-4" />
                Waze
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmergencyLocationViewer;