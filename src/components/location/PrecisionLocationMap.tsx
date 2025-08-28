import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Home, 
  Building2, 
  Users, 
  ExternalLink,
  Target,
  Crosshair
} from 'lucide-react';

interface PreciseLocation {
  id: string;
  name: string;
  type: 'residential' | 'commercial' | 'emergency' | 'facility';
  address: string;
  unit?: string;
  block?: string;
  phase?: string;
  latitude: number;
  longitude: number;
  occupants?: number;
  status?: 'occupied' | 'vacant' | 'maintenance';
  roofColor?: 'orange' | 'red' | 'grey' | 'blue';
}

interface PrecisionLocationMapProps {
  centerCoordinate?: [number, number];
  locations?: PreciseLocation[];
  showSearch?: boolean;
  showLegend?: boolean;
  onLocationSelect?: (location: PreciseLocation) => void;
  height?: string;
}

export const PrecisionLocationMap: React.FC<PrecisionLocationMapProps> = ({
  centerCoordinate = [103.3333, 3.8167],
  locations = [],
  showSearch = true,
  showLegend = true,
  onLocationSelect,
  height = 'h-96'
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<PreciseLocation | null>(null);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  // Demo locations based on the residential community aerial view
  const [communityLocations] = useState<PreciseLocation[]>([
    // Block A - Orange roof houses (top row)
    {
      id: 'a-01', name: 'Ahmad Family', type: 'residential', 
      address: 'Jalan Harmoni 1', unit: 'A-01', block: 'A', phase: '1',
      latitude: 3.8170, longitude: 103.3330, occupants: 4, status: 'occupied', roofColor: 'orange'
    },
    {
      id: 'a-02', name: 'Siti Residence', type: 'residential',
      address: 'Jalan Harmoni 1', unit: 'A-02', block: 'A', phase: '1', 
      latitude: 3.8172, longitude: 103.3332, occupants: 3, status: 'occupied', roofColor: 'orange'
    },
    {
      id: 'a-03', name: 'Lim Family', type: 'residential',
      address: 'Jalan Harmoni 1', unit: 'A-03', block: 'A', phase: '1',
      latitude: 3.8174, longitude: 103.3334, occupants: 5, status: 'occupied', roofColor: 'orange'
    },
    // Block B - Red roof houses (middle section)
    {
      id: 'b-01', name: 'Kumar Residence', type: 'residential',
      address: 'Jalan Sejahtera 2', unit: 'B-01', block: 'B', phase: '2',
      latitude: 3.8168, longitude: 103.3335, occupants: 2, status: 'occupied', roofColor: 'red'
    },
    {
      id: 'b-02', name: 'Fatimah House', type: 'residential',
      address: 'Jalan Sejahtera 2', unit: 'B-02', block: 'B', phase: '2',
      latitude: 3.8166, longitude: 103.3337, occupants: 6, status: 'occupied', roofColor: 'red'
    },
    // Block C - Grey roof houses (lower section)
    {
      id: 'c-01', name: 'Wong Residence', type: 'residential',
      address: 'Jalan Damai 3', unit: 'C-01', block: 'C', phase: '3',
      latitude: 3.8164, longitude: 103.3328, occupants: 4, status: 'occupied', roofColor: 'grey'
    },
    {
      id: 'c-02', name: 'Available Unit', type: 'residential',
      address: 'Jalan Damai 3', unit: 'C-02', block: 'C', phase: '3',
      latitude: 3.8162, longitude: 103.3330, occupants: 0, status: 'vacant', roofColor: 'grey'
    },
    // Facilities
    {
      id: 'f-01', name: 'Community Hall', type: 'facility',
      address: 'Central Area', unit: 'CH-01', 
      latitude: 3.8167, longitude: 103.3333, status: 'occupied'
    },
    {
      id: 'f-02', name: 'Security Guard House', type: 'facility',
      address: 'Main Entrance',
      latitude: 3.8165, longitude: 103.3325, status: 'occupied'
    }
  ]);

  const allLocations = [...locations, ...communityLocations];

  useEffect(() => {
    initializeMap();
    
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const initializeMap = async () => {
    if (!mapContainer.current) {
      console.log('PrecisionMap: Map container not found');
      return;
    }
    console.log('PrecisionMap: Starting map initialization');

    try {
      console.log('PrecisionMap: Fetching Mapbox token...');
      const { data: tokenData } = await supabase.functions.invoke('get-mapbox-token');
      
      if (!tokenData?.token) {
        console.log('PrecisionMap: No token received, showing token input');
        setShowTokenInput(true);
        return;
      }

      console.log('PrecisionMap: Token received, initializing map');
      setMapboxToken(tokenData.token);
      mapboxgl.accessToken = tokenData.token;
      
      console.log('PrecisionMap: Creating map instance...');
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12', // Satellite view for better precision
        center: centerCoordinate,
        zoom: 18, // High zoom for precision
        pitch: 45,
        bearing: -17.6
      });

      console.log('PrecisionMap: Map instance created, adding controls');
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        console.log('PrecisionMap: Map loaded successfully');
        setIsMapReady(true);
        addLocationMarkers();
      });

      map.current.on('error', (e) => {
        console.error('PrecisionMap: Map error:', e);
      });

    } catch (error) {
      console.error('PrecisionMap: Error initializing map:', error);
      setShowTokenInput(true);
    }
  };

  const addLocationMarkers = () => {
    if (!map.current || !isMapReady) {
      console.log('PrecisionMap: Cannot add markers - map not ready or missing');
      return;
    }

    console.log('PrecisionMap: Adding location markers, total locations:', allLocations.length);

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    const filteredLocations = allLocations.filter(location =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.unit?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    console.log('PrecisionMap: Filtered locations to display:', filteredLocations.length);

    filteredLocations.forEach((location) => {
      const markerElement = document.createElement('div');
      markerElement.className = 'precision-marker';
      
      // Custom marker styling based on type and roof color
      const getMarkerColor = () => {
        if (location.type === 'emergency') return '#ef4444';
        if (location.type === 'facility') return '#3b82f6';
        if (location.roofColor === 'orange') return '#f97316';
        if (location.roofColor === 'red') return '#dc2626';
        if (location.roofColor === 'grey') return '#6b7280';
        return '#10b981';
      };

      const getMarkerIcon = () => {
        if (location.type === 'facility') return '🏢';
        if (location.status === 'vacant') return '🏠';
        return '🏡';
      };

      markerElement.innerHTML = `
        <div class="relative">
          <div class="w-8 h-8 rounded-full border-2 border-white shadow-lg cursor-pointer flex items-center justify-center hover:scale-110 transition-transform"
               style="background-color: ${getMarkerColor()}">
            <span class="text-white text-xs font-bold">${location.unit?.split('-')[1] || location.name.charAt(0)}</span>
          </div>
          <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 border border-white"
               style="background-color: ${getMarkerColor()}"></div>
        </div>
      `;

      // Create detailed popup
      const popup = new mapboxgl.Popup({ 
        offset: 35,
        closeButton: false,
        className: 'precision-popup'
      }).setHTML(`
        <div class="p-4 min-w-[280px] max-w-[320px]">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                   style="background-color: ${getMarkerColor()}20; color: ${getMarkerColor()}">
                ${location.type === 'facility' ? '🏢' : 
                  location.status === 'vacant' ? '🏠' : '🏡'}
              </div>
              <div>
                <h4 class="font-semibold text-sm">${location.name}</h4>
                <p class="text-xs text-gray-600 capitalize">${location.type}</p>
              </div>
            </div>
            <div class="text-right">
              ${location.unit ? `<span class="bg-gray-100 px-2 py-1 rounded text-xs font-mono">${location.unit}</span>` : ''}
            </div>
          </div>
          
          <div class="space-y-2 text-xs">
            <div class="flex items-center gap-2">
              <svg class="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
              <span class="text-gray-700">${location.address}</span>
            </div>
            
            ${location.block ? `
              <div class="flex items-center gap-2">
                <svg class="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                </svg>
                <span class="text-gray-700">Block ${location.block}, Phase ${location.phase || 'N/A'}</span>
              </div>
            ` : ''}
            
            ${location.occupants !== undefined ? `
              <div class="flex items-center gap-2">
                <svg class="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
                <span class="text-gray-700">${location.occupants} occupants</span>
              </div>
            ` : ''}
            
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full" style="background-color: ${
                location.status === 'occupied' ? '#10b981' : 
                location.status === 'vacant' ? '#f59e0b' : '#ef4444'
              }"></div>
              <span class="text-gray-700 capitalize">${location.status || 'active'}</span>
            </div>
            
            <div class="flex items-center gap-2 pt-2 border-t">
              <svg class="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd" />
              </svg>
              <span class="text-gray-700">Lat: ${location.latitude.toFixed(6)}, Lng: ${location.longitude.toFixed(6)}</span>
            </div>
          </div>
          
          <div class="mt-3 pt-3 border-t flex gap-2">
            <button class="flex-1 px-3 py-2 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors flex items-center justify-center gap-1">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd" />
              </svg>
              Navigate
            </button>
            <button class="px-3 py-2 border border-gray-300 rounded text-xs hover:bg-gray-50 transition-colors">
              Details
            </button>
          </div>
        </div>
      `);

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([location.longitude, location.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      markers.current.push(marker);

      // Add click event
      markerElement.addEventListener('click', () => {
        setSelectedLocation(location);
        onLocationSelect?.(location);
        
        // Precision fly-to with exact coordinates
        map.current!.flyTo({
          center: [location.longitude, location.latitude],
          zoom: 20,
          pitch: 60,
          bearing: 0,
          essential: true,
          duration: 2000
        });
      });
    });
  };

  useEffect(() => {
    if (isMapReady) {
      addLocationMarkers();
    }
  }, [searchTerm, isMapReady]);

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      setShowTokenInput(false);
      initializeMap();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'residential': return <Home className="h-4 w-4" />;
      case 'facility': return <Building2 className="h-4 w-4" />;
      case 'emergency': return <Target className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'bg-green-100 text-green-800';
      case 'vacant': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (showTokenInput) {
    return (
      <Card className={height}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="text-sm text-muted-foreground">
              Mapbox token required for precision mapping.{' '}
              <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                Get your token from mapbox.com
              </a>
            </div>
            <div className="max-w-md mx-auto space-y-3">
              <Input
                type="text"
                placeholder="pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJ5b3VyLXRva2VuIn0..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
              />
              <Button onClick={handleTokenSubmit} className="w-full">
                Load Precision Map
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={height}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Crosshair className="h-5 w-5" />
            Precision Location Map
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {allLocations.length} locations
          </Badge>
        </div>
        
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, address, or unit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="relative rounded-lg overflow-hidden" style={{ height: 'calc(100% - 120px)' }}>
          <div ref={mapContainer} className="absolute inset-0" />
          
          {!isMapReady && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading precision map...</p>
              </div>
            </div>
          )}
          
          {showLegend && (
            <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs">
              <h4 className="font-semibold text-xs mb-2">Legend</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Phase 1 (Orange Roof)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Phase 2 (Red Roof)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span>Phase 3 (Grey Roof)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Facilities</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-primary" />
              <span className="font-medium">Precision Mode</span>
            </div>
          </div>
        </div>
      </CardContent>

      {selectedLocation && (
        <Dialog open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getTypeIcon(selectedLocation.type)}
                {selectedLocation.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">Address</div>
                  <div className="text-sm text-muted-foreground">{selectedLocation.address}</div>
                </div>
                {selectedLocation.unit && (
                  <div>
                    <div className="text-sm font-medium">Unit</div>
                    <div className="text-sm text-muted-foreground">{selectedLocation.unit}</div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(selectedLocation.status || 'active')}>
                  {selectedLocation.status || 'active'}
                </Badge>
                <Badge variant="outline">{selectedLocation.type}</Badge>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => window.open(`https://maps.google.com/?q=${selectedLocation.latitude},${selectedLocation.longitude}`, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Navigate
                </Button>
                <Button variant="outline" size="sm">
                  Contact
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};