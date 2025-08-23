import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, User, Home } from 'lucide-react';

interface ResidentLocation {
  id: string;
  full_name: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  unit_number?: string;
}

export function ResidentLocationMap() {
  const { language, user } = useAuth();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [residents, setResidents] = useState<ResidentLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResident, setSelectedResident] = useState<ResidentLocation | null>(null);

  useEffect(() => {
    initializeMap();
    fetchResidents();
    
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const initializeMap = async () => {
    if (!mapContainer.current) return;

    try {
      // Get Mapbox token from Supabase edge function
      const { data: tokenData } = await supabase.functions.invoke('get-mapbox-token');
      
      if (!tokenData?.token) {
        console.error('No Mapbox token available');
        return;
      }

      mapboxgl.accessToken = tokenData.token;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [103.3333, 3.8167], // Prima Pahang Kampung Hijrah approximate coordinates
        zoom: 16,
        pitch: 45,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        addResidentMarkers();
      });

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  const fetchResidents = async () => {
    try {
      // For demo purposes, create mock resident data with locations around Prima Pahang Kampung Hijrah
      const mockResidents: ResidentLocation[] = [
        {
          id: '1',
          full_name: 'Ahmad Bin Hassan',
          address: 'Block A, Unit A-1-01, Prima Pahang Kampung Hijrah',
          unit_number: 'A-1-01',
          latitude: 3.8170,
          longitude: 103.3330
        },
        {
          id: '2',
          full_name: 'Siti Aminah Binti Abdullah',
          address: 'Block A, Unit A-2-05, Prima Pahang Kampung Hijrah',
          unit_number: 'A-2-05',
          latitude: 3.8172,
          longitude: 103.3332
        },
        {
          id: '3',
          full_name: 'Lim Wei Ming',
          address: 'Block B, Unit B-1-03, Prima Pahang Kampung Hijrah',
          unit_number: 'B-1-03',
          latitude: 3.8168,
          longitude: 103.3335
        },
        {
          id: '4',
          full_name: 'Raj Kumar A/L Selvam',
          address: 'Block B, Unit B-3-07, Prima Pahang Kampung Hijrah',
          unit_number: 'B-3-07',
          latitude: 3.8174,
          longitude: 103.3337
        },
        {
          id: '5',
          full_name: 'Fatimah Binti Omar',
          address: 'Block C, Unit C-2-02, Prima Pahang Kampung Hijrah',
          unit_number: 'C-2-02',
          latitude: 3.8166,
          longitude: 103.3328
        },
        {
          id: '6',
          full_name: 'Wong Kar Wai',
          address: 'Block C, Unit C-4-08, Prima Pahang Kampung Hijrah',
          unit_number: 'C-4-08',
          latitude: 3.8176,
          longitude: 103.3340
        },
        {
          id: '7',
          full_name: 'Nur Hidayah Binti Ismail',
          address: 'Block D, Unit D-1-04, Prima Pahang Kampung Hijrah',
          unit_number: 'D-1-04',
          latitude: 3.8164,
          longitude: 103.3325
        },
        {
          id: '8',
          full_name: 'Chen Li Hua',
          address: 'Block D, Unit D-3-06, Prima Pahang Kampung Hijrah',
          unit_number: 'D-3-06',
          latitude: 3.8178,
          longitude: 103.3342
        }
      ];

      setResidents(mockResidents);
    } catch (error) {
      console.error('Error fetching residents:', error);
    } finally {
      setLoading(false);
    }
  };

  const addResidentMarkers = () => {
    if (!map.current) return;

    residents.forEach((resident) => {
      // Create custom marker
      const markerElement = document.createElement('div');
      markerElement.className = 'resident-marker';
      markerElement.innerHTML = `
        <div class="w-8 h-8 bg-primary border-2 border-white rounded-full shadow-lg cursor-pointer flex items-center justify-center hover:scale-110 transition-transform">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
        </div>
      `;

      // Create popup
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: false
      }).setHTML(`
        <div class="p-3 min-w-[200px]">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 class="font-semibold text-sm">${resident.full_name}</h4>
              <p class="text-xs text-gray-600">${language === 'en' ? 'House Owner' : 'Pemilik Rumah'}</p>
            </div>
          </div>
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-xs">
              <svg class="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
              <span class="text-gray-700">${resident.unit_number}</span>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <svg class="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span class="text-gray-700">${resident.address}</span>
            </div>
          </div>
        </div>
      `);

      // Add marker to map
      new mapboxgl.Marker(markerElement)
        .setLngLat([resident.longitude, resident.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      // Add click event to marker
      markerElement.addEventListener('click', () => {
        setSelectedResident(resident);
        map.current!.flyTo({
          center: [resident.longitude, resident.latitude],
          zoom: 18,
          essential: true
        });
      });
    });
  };

  useEffect(() => {
    if (!loading && map.current && residents.length > 0) {
      addResidentMarkers();
    }
  }, [residents, loading]);

  return (
    <Card className="h-96">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {language === 'en' ? 'Resident Locations' : 'Lokasi Penduduk'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-80 rounded-lg overflow-hidden">
          <div ref={mapContainer} className="absolute inset-0" />
          
          {loading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Loading map...' : 'Memuatkan peta...'}
                </p>
              </div>
            </div>
          )}
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-4 bg-primary border border-white rounded-full"></div>
              <span className="text-muted-foreground">
                {language === 'en' ? 'Resident' : 'Penduduk'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {language === 'en' ? 'Click markers for details' : 'Klik penanda untuk butiran'}
            </p>
          </div>
          
          {/* Resident count */}
          <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-primary" />
              <span className="font-medium">{residents.length}</span>
              <span className="text-muted-foreground">
                {language === 'en' ? 'residents' : 'penduduk'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}