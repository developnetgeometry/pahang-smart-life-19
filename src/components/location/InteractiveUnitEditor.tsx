import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ZoomIn, ZoomOut, RotateCcw, Search, Square, Edit, Trash2, Save } from 'lucide-react';
import { useUnits, Unit } from '@/hooks/use-units';
import { toast } from 'sonner';

interface InteractiveUnitEditorProps {
  imageUrl: string;
  title?: string;
  showSearch?: boolean;
  isAdminMode?: boolean;
}

interface DrawingBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isDrawing: boolean;
}

interface UnitFormData {
  unit_number: string;
  owner_name: string;
  unit_type: 'residential' | 'commercial' | 'facility';
  address: string;
  phone_number: string;
  email: string;
  occupancy_status: string;
  notes: string;
}

const InteractiveUnitEditor: React.FC<InteractiveUnitEditorProps> = ({
  imageUrl,
  title = "Community Map",
  showSearch = true,
  isAdminMode = false
}) => {
  const { units, loading, createUnit, updateUnit, deleteUnit } = useUnits();
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Drawing state
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingBox, setDrawingBox] = useState<DrawingBox | null>(null);
  const [isDrawingActive, setIsDrawingActive] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [newBoxCoordinates, setNewBoxCoordinates] = useState<{x: number, y: number, width: number, height: number} | null>(null);
  
  const [formData, setFormData] = useState<UnitFormData>({
    unit_number: '',
    owner_name: '',
    unit_type: 'residential',
    address: '',
    phone_number: '',
    email: '',
    occupancy_status: 'occupied',
    notes: ''
  });

  // Legend state
  const [isLegendExpanded, setIsLegendExpanded] = useState(false);

  // Filter units based on search term
  const filteredUnits = units.filter(unit =>
    unit.unit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      unit_number: '',
      owner_name: '',
      unit_type: 'residential',
      address: '',
      phone_number: '',
      email: '',
      occupancy_status: 'occupied',
      notes: ''
    });
    setEditingUnit(null);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (isDrawingMode && isAdminMode) {
      // Start drawing a new box
      setIsDrawingActive(true);
      setDrawingBox({
        startX: x,
        startY: y,
        endX: x,
        endY: y,
        isDrawing: true
      });
      e.preventDefault();
      e.stopPropagation();
    } else if (!isDrawingMode) {
      // Start panning
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  }, [position, isDrawingMode, isAdminMode]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!imageRef.current) return;

    if (isDrawingActive && drawingBox && isDrawingMode) {
      const rect = imageRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      setDrawingBox(prev => prev ? {
        ...prev,
        endX: x,
        endY: y
      } : null);
      e.preventDefault();
    } else if (isDragging && !isDrawingMode) {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart, isDrawingActive, drawingBox, isDrawingMode]);

  const handleMouseUp = useCallback(() => {
    if (isDrawingActive && drawingBox && isDrawingMode) {
      // Finish drawing - open form for new unit
      const width = Math.abs(drawingBox.endX - drawingBox.startX);
      const height = Math.abs(drawingBox.endY - drawingBox.startY);
      
      if (width > 1 && height > 1) { // Only create if box is meaningful size
        const x = Math.min(drawingBox.startX, drawingBox.endX) + width / 2;
        const y = Math.min(drawingBox.startY, drawingBox.endY) + height / 2;
        
        setNewBoxCoordinates({ x, y, width, height });
        setShowUnitForm(true);
        resetForm();
      }
      
      setDrawingBox(null);
      setIsDrawingActive(false);
    } else {
      setIsDragging(false);
    }
  }, [isDrawingActive, drawingBox, isDrawingMode]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.5, Math.min(5, scale * delta));
    setScale(newScale);
  }, [scale]);

  const zoomIn = () => setScale(prev => Math.min(5, prev * 1.2));
  const zoomOut = () => setScale(prev => Math.max(0.5, prev / 1.2));
  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleUnitClick = (e: React.MouseEvent, unit: Unit) => {
    e.stopPropagation();
    if (isAdminMode && !isDrawingMode) {
      // Edit mode
      setEditingUnit(unit);
      setFormData({
        unit_number: unit.unit_number,
        owner_name: unit.owner_name,
        unit_type: unit.unit_type,
        address: unit.address || '',
        phone_number: unit.phone_number || '',
        email: unit.email || '',
        occupancy_status: unit.occupancy_status || 'occupied',
        notes: unit.notes || ''
      });
      setShowUnitForm(true);
    } else {
      // View mode
      setSelectedUnit(unit);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.unit_number || !formData.owner_name) {
      toast.error('Please fill in required fields');
      return;
    }

    let success;
    
    if (editingUnit) {
      // Update existing unit
      success = await updateUnit(editingUnit.id, formData);
    } else if (newBoxCoordinates) {
      // Create new unit with drawn coordinates
      success = await createUnit({
        ...formData,
        coordinates_x: newBoxCoordinates.x,
        coordinates_y: newBoxCoordinates.y,
        width: newBoxCoordinates.width,
        height: newBoxCoordinates.height
      });
    }

    if (success) {
      setShowUnitForm(false);
      resetForm();
      setNewBoxCoordinates(null);
    }
  };

  const handleDeleteUnit = async (unit: Unit) => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      const success = await deleteUnit(unit.id);
      if (success) {
        setShowUnitForm(false);
        resetForm();
      }
    }
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
            {isAdminMode && (
              <Button
                variant={isDrawingMode ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setIsDrawingMode(!isDrawingMode);
                  setDrawingBox(null);
                }}
              >
                <Square className="h-4 w-4 mr-2" />
                {isDrawingMode ? 'Exit Drawing' : 'Draw Box'}
              </Button>
            )}
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
        
        {isDrawingMode && isAdminMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
            <p className="text-sm text-blue-700">
              <Square className="h-4 w-4 inline mr-1" />
              Drawing mode active. Click and drag on the map to create a new unit box.
            </p>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0 h-full">
        <div 
          ref={containerRef}
          className={`relative w-full h-full overflow-hidden select-none ${
            isDrawingMode ? 'cursor-crosshair' : isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
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
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
            
            {/* Drawing overlay for current box being drawn */}
            {drawingBox && isDrawingActive && (
              <div
                className="absolute border-2 border-dashed border-blue-500 bg-blue-500/10"
                style={{
                  left: `${Math.min(drawingBox.startX, drawingBox.endX)}%`,
                  top: `${Math.min(drawingBox.startY, drawingBox.endY)}%`,
                  width: `${Math.abs(drawingBox.endX - drawingBox.startX)}%`,
                  height: `${Math.abs(drawingBox.endY - drawingBox.startY)}%`,
                  pointerEvents: 'none'
                }}
              />
            )}
            
            {/* Unit markers */}
            {imageLoaded && !loading && filteredUnits.map((unit) => (
              <div
                key={unit.id}
                className={`absolute border-2 cursor-pointer transition-all duration-200 ${getUnitTypeColor(unit.unit_type)} ${
                  isAdminMode ? 'hover:border-4' : ''
                }`}
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
                {isAdminMode && (
                  <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-6 h-6 p-0 bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteUnit(unit);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
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
          <div 
            className={`absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-2xl ${
              isLegendExpanded ? 'p-3' : 'p-2'
            }`}
            onClick={() => setIsLegendExpanded(!isLegendExpanded)}
          >
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-gray-800">Legend</h4>
              <div className={`transition-transform duration-300 text-gray-600 ${isLegendExpanded ? 'rotate-180' : ''}`}>
                ↑
              </div>
            </div>
            
            <div className={`transition-all duration-300 overflow-hidden ${
              isLegendExpanded ? 'max-h-32 opacity-100 mt-2' : 'max-h-0 opacity-0'
            }`}>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${getUnitTypeBadge('residential')}`}></div>
                  <span className="text-sm text-gray-700">Residential</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${getUnitTypeBadge('commercial')}`}></div>
                  <span className="text-sm text-gray-700">Commercial</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${getUnitTypeBadge('facility')}`}></div>
                  <span className="text-sm text-gray-700">Facility</span>
                </div>
              </div>
            </div>
          </div>

          {/* Zoom indicator */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
            <span className="text-xs font-mono">{Math.round(scale * 100)}%</span>
          </div>
        </div>
      </CardContent>

      {/* Unit Form Dialog */}
      <Dialog open={showUnitForm} onOpenChange={(open) => {
        if (!open) {
          setShowUnitForm(false);
          resetForm();
          setNewBoxCoordinates(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingUnit ? 'Edit Unit' : 'Add New Unit'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unit_number">Unit Number *</Label>
                <Input
                  id="unit_number"
                  value={formData.unit_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit_number: e.target.value }))}
                  placeholder="e.g., A-101"
                  required
                />
              </div>
              <div>
                <Label htmlFor="owner_name">Owner Name *</Label>
                <Input
                  id="owner_name"
                  value={formData.owner_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, owner_name: e.target.value }))}
                  placeholder="e.g., Ahmad Rahman"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unit_type">Unit Type</Label>
                <Select value={formData.unit_type} onValueChange={(value) => setFormData(prev => ({ ...prev, unit_type: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="facility">Facility</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="occupancy_status">Occupancy Status</Label>
                <Select value={formData.occupancy_status} onValueChange={(value) => setFormData(prev => ({ ...prev, occupancy_status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="vacant">Vacant</SelectItem>
                    <SelectItem value="maintenance">Under Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Full address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                  placeholder="+60123456789"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="owner@example.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about the unit"
                rows={3}
              />
            </div>

            <div className="flex justify-between">
              <div>
                {editingUnit && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={() => handleDeleteUnit(editingUnit)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Unit
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowUnitForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingUnit ? 'Update Unit' : 'Create Unit'}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Unit Information Dialog (View Mode) */}
      <Dialog open={!!selectedUnit && !isAdminMode} onOpenChange={() => setSelectedUnit(null)}>
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

export default InteractiveUnitEditor;