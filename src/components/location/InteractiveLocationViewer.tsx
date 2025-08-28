import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ZoomIn, ZoomOut, RotateCcw, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useUnits, Unit } from '@/hooks/use-units';

interface InteractiveLocationViewerProps {
  imageUrl: string;
  title?: string;
  showSearch?: boolean;
}

const InteractiveLocationViewer: React.FC<InteractiveLocationViewerProps> = ({
  imageUrl,
  title = "Community Map",
  showSearch = true
}) => {
  const { units, loading } = useUnits();
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);

  // Filter units based on search term
  const filteredUnits = units.filter(unit =>
    unit.unit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === imageRef.current) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (isDragging) {
      e.stopPropagation();
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.5, Math.min(5, scale * delta));
    setScale(newScale);
  }, [scale]);

  const zoomIn = () => {
    setScale(prev => Math.min(5, prev * 1.2));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(0.5, prev / 1.2));
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleUnitClick = (e: React.MouseEvent, unit: Unit) => {
    e.stopPropagation();
    setSelectedUnit(unit);
  };

  const getUnitTypeColor = (type: Unit['unit_type']) => {
    switch (type) {
      case 'residential': return 'bg-blue-500/20 border-blue-500 hover:bg-blue-500/30';
      case 'commercial': return 'bg-green-500/20 border-green-500 hover:bg-green-500/30';
      case 'facility': return 'bg-purple-500/20 border-purple-500 hover:bg-purple-500/30';
      default: return 'bg-gray-500/20 border-gray-500 hover:bg-gray-500/30';
    }
  };

  const getUnitTypeBadge = (type: Unit['unit_type']) => {
    switch (type) {
      case 'residential': return 'bg-blue-500';
      case 'commercial': return 'bg-green-500';
      case 'facility': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full h-[600px] overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            <Badge variant="secondary" className="mt-1">
              {loading ? 'Loading...' : `${filteredUnits.length} Units`}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search units..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 pl-8"
                />
              </div>
            )}
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={zoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={zoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={resetView}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-full">
        <div 
          ref={containerRef}
          className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ touchAction: 'none' }}
        >
          <div 
            className="relative"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Community Map"
              className="w-full h-auto select-none"
              draggable={false}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                console.error('Failed to load image:', imageUrl);
                setImageLoaded(false);
              }}
            />
            
            {/* Unit markers */}
            {imageLoaded && !loading && filteredUnits.map((unit) => (
              <div
                key={unit.id}
                className={`absolute border-2 cursor-pointer transition-all duration-200 ${getUnitTypeColor(unit.unit_type)}`}
                style={{
                  left: `${unit.coordinates_x}%`,
                  top: `${unit.coordinates_y}%`,
                  width: `${unit.width || 6}%`,
                  height: `${unit.height || 4}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={(e) => handleUnitClick(e, unit)}
                title={`${unit.unit_number} - ${unit.owner_name}`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-white bg-black/70 px-1 py-0.5 rounded">
                    {unit.unit_number}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Loading indicator */}
          {(!imageLoaded || loading) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">
                {loading ? 'Loading units...' : 'Loading community map...'}
              </p>
            </div>
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <h4 className="font-semibold text-sm mb-2">Legend</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${getUnitTypeBadge('residential')}`}></div>
                <span className="text-xs">Residential</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${getUnitTypeBadge('commercial')}`}></div>
                <span className="text-xs">Commercial</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${getUnitTypeBadge('facility')}`}></div>
                <span className="text-xs">Facility</span>
              </div>
            </div>
          </div>

          {/* Zoom indicator */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
            <span className="text-xs font-mono">{Math.round(scale * 100)}%</span>
          </div>
        </div>
      </CardContent>

      {/* Unit Information Dialog */}
      <Dialog open={!!selectedUnit} onOpenChange={() => setSelectedUnit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedUnit?.unit_number}
              <Badge className={getUnitTypeBadge(selectedUnit?.unit_type || 'residential')}>
                {selectedUnit?.unit_type}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-gray-600 mb-1">Owner</h4>
              <p className="text-lg">{selectedUnit?.owner_name}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-600 mb-1">Unit Number</h4>
              <p>{selectedUnit?.unit_number}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-600 mb-1">Type</h4>
              <p className="capitalize">{selectedUnit?.unit_type}</p>
            </div>
            {selectedUnit?.address && (
              <div>
                <h4 className="font-semibold text-sm text-gray-600 mb-1">Address</h4>
                <p>{selectedUnit.address}</p>
              </div>
            )}
            {selectedUnit?.phone_number && (
              <div>
                <h4 className="font-semibold text-sm text-gray-600 mb-1">Phone</h4>
                <p>{selectedUnit.phone_number}</p>
              </div>
            )}
            {selectedUnit?.email && (
              <div>
                <h4 className="font-semibold text-sm text-gray-600 mb-1">Email</h4>
                <p>{selectedUnit.email}</p>
              </div>
            )}
            {selectedUnit?.occupancy_status && (
              <div>
                <h4 className="font-semibold text-sm text-gray-600 mb-1">Status</h4>
                <Badge variant={selectedUnit.occupancy_status === 'occupied' ? 'default' : 'secondary'}>
                  {selectedUnit.occupancy_status}
                </Badge>
              </div>
            )}
            {selectedUnit?.notes && (
              <div>
                <h4 className="font-semibold text-sm text-gray-600 mb-1">Notes</h4>
                <p className="text-sm">{selectedUnit.notes}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default InteractiveLocationViewer;