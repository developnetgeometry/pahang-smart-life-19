import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from '@/components/ui/image-upload';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Facility {
  id: string;
  name: string;
  description?: string;
  location?: string;
  capacity: number;
  hourly_rate: number;
  amenities: string[];
  rules: string[];
  images: string[];
  operating_hours: any;
}

interface FacilityConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facility?: Facility | null;
  onSave: () => void;
}

export function FacilityConfigModal({ 
  open, 
  onOpenChange, 
  facility, 
  onSave 
}: FacilityConfigModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    capacity: 1,
    hourly_rate: 0,
    amenities: [] as string[],
    rules: [] as string[],
    images: [] as string[],
    operating_hours: {
      monday: { start: '08:00', end: '22:00', closed: false },
      tuesday: { start: '08:00', end: '22:00', closed: false },
      wednesday: { start: '08:00', end: '22:00', closed: false },
      thursday: { start: '08:00', end: '22:00', closed: false },
      friday: { start: '08:00', end: '22:00', closed: false },
      saturday: { start: '08:00', end: '22:00', closed: false },
      sunday: { start: '08:00', end: '22:00', closed: false },
    }
  });
  const [newAmenity, setNewAmenity] = useState('');
  const [newRule, setNewRule] = useState('');

  useEffect(() => {
    if (facility) {
      setFormData({
        name: facility.name || '',
        description: facility.description || '',
        location: facility.location || '',
        capacity: facility.capacity || 1,
        hourly_rate: facility.hourly_rate || 0,
        amenities: facility.amenities || [],
        rules: facility.rules || [],
        images: facility.images || [],
        operating_hours: facility.operating_hours || formData.operating_hours
      });
    } else {
      // Reset form for new facility
      setFormData({
        name: '',
        description: '',
        location: '',
        capacity: 1,
        hourly_rate: 0,
        amenities: [],
        rules: [],
        images: [],
        operating_hours: {
          monday: { start: '08:00', end: '22:00', closed: false },
          tuesday: { start: '08:00', end: '22:00', closed: false },
          wednesday: { start: '08:00', end: '22:00', closed: false },
          thursday: { start: '08:00', end: '22:00', closed: false },
          friday: { start: '08:00', end: '22:00', closed: false },
          saturday: { start: '08:00', end: '22:00', closed: false },
          sunday: { start: '08:00', end: '22:00', closed: false },
        }
      });
    }
  }, [facility, open]);

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  const addRule = () => {
    if (newRule.trim() && !formData.rules.includes(newRule.trim())) {
      setFormData(prev => ({
        ...prev,
        rules: [...prev.rules, newRule.trim()]
      }));
      setNewRule('');
    }
  };

  const removeRule = (rule: string) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter(r => r !== rule)
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Facility name is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const facilityData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        capacity: formData.capacity,
        hourly_rate: formData.hourly_rate,
        amenities: formData.amenities,
        rules: formData.rules,
        images: formData.images,
        operating_hours: formData.operating_hours,
      };

      if (facility) {
        // Update existing facility
        const { error } = await supabase
          .from('facilities')
          .update(facilityData)
          .eq('id', facility.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Facility updated successfully",
        });
      } else {
        // Create new facility
        const { error } = await supabase
          .from('facilities')
          .insert([facilityData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Facility created successfully",
        });
      }

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving facility:', error);
      toast({
        title: "Error",
        description: "Failed to save facility",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {facility ? 'Edit Facility' : 'Add New Facility'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Facility Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Community Hall, Swimming Pool"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Ground Floor, Block A"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the facility"
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 1 }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hourly_rate">Hourly Rate (RM)</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Amenities</h3>
            
            <div className="flex gap-2">
              <Input
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="Add amenity (e.g., Wi-Fi, Air Conditioning)"
                onKeyPress={(e) => e.key === 'Enter' && addAmenity()}
              />
              <Button type="button" onClick={addAmenity}>
                Add
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((amenity, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {amenity}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeAmenity(amenity)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Rules & Regulations</h3>
            
            <div className="flex gap-2">
              <Input
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                placeholder="Add rule (e.g., No smoking, Clean up after use)"
                onKeyPress={(e) => e.key === 'Enter' && addRule()}
              />
              <Button type="button" onClick={addRule}>
                Add
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.rules.map((rule, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {rule}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeRule(rule)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Facility Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Facility Images</h3>
            <ImageUpload
              bucket="facility-images"
              maxFiles={5}
              existingImages={formData.images}
              onUploadComplete={(url) => {
                setFormData(prev => ({
                  ...prev,
                  images: [...prev.images, url]
                }));
              }}
              onRemoveImage={(url) => {
                setFormData(prev => ({
                  ...prev,
                  images: prev.images.filter(img => img !== url)
                }));
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : (facility ? 'Update' : 'Create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}