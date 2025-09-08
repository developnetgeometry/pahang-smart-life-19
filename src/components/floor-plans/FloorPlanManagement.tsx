import React, { useState } from 'react';
import { useFloorPlans } from '@/hooks/use-floor-plans';
import { useImageManagement } from '@/hooks/use-image-management';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ImageUpload } from '@/components/ui/image-upload';
import { FloorPlanMigrationWizard } from './FloorPlanMigrationWizard';
import { SmartImage } from '@/components/ui/dynamic-image';
import { Plus, Edit, Eye, AlertTriangle, History } from 'lucide-react';
import { toast } from 'sonner';

interface FloorPlanFormData {
  name: string;
  image_url: string;
  version: number;
}

export const FloorPlanManagement: React.FC = () => {
  const { floorPlans, loading, createFloorPlan, updateFloorPlan, deleteFloorPlan } = useFloorPlans();
  const { images, uploadImage, deleteImage } = useImageManagement({
    assetType: 'floor_plan',
    bucket: 'floor-plan-images'
  });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFloorPlan, setEditingFloorPlan] = useState<any>(null);
  const [showMigrationWizard, setShowMigrationWizard] = useState<any>(null);
  const [formData, setFormData] = useState<FloorPlanFormData>({
    name: '',
    image_url: '',
    version: 1
  });

  const handleCreateFloorPlan = async () => {
    if (!formData.name || !formData.image_url) {
      toast.error('Please fill in all required fields');
      return;
    }

    const result = await createFloorPlan({
      name: formData.name,
      image_url: formData.image_url,
      version: formData.version,
      is_active: true
    });

    if (result) {
      setShowCreateForm(false);
      setFormData({ name: '', image_url: '', version: 1 });
      toast.success('Floor plan created successfully');
    }
  };

  const handleUpdateFloorPlan = async () => {
    if (!editingFloorPlan || !formData.name || !formData.image_url) {
      toast.error('Please fill in all required fields');
      return;
    }

    const result = await updateFloorPlan(editingFloorPlan.id, {
      name: formData.name,
      image_url: formData.image_url,
      version: formData.version
    });

    if (result) {
      // Broadcast the floor plan change to all users
      await broadcastFloorPlanUpdate(editingFloorPlan.id, formData.image_url);
      
      setEditingFloorPlan(null);
      setFormData({ name: '', image_url: '', version: 1 });
      toast.success('Floor plan updated and broadcast to all users');
    }
  };

  // Broadcast floor plan updates to all users
  const broadcastFloorPlanUpdate = async (floorPlanId: string, imageUrl: string) => {
    try {
      // Get current user's district to broadcast to the right channel
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('district_id')
        .eq('id', user.id)
        .single();

      if (!profile?.district_id) return;

      // Create channel and broadcast
      const channelName = `community_updates_${profile.district_id}`;
      const channel = supabase.channel(channelName);
      
      await channel.send({
        type: 'broadcast',
        event: 'floor_plan_changed',
        payload: {
          floorPlanId,
          imageUrl,
          changedBy: user.id,
          timestamp: new Date().toISOString()
        }
      });

      // Subscribe briefly to ensure the message is sent
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setTimeout(() => {
            supabase.removeChannel(channel);
          }, 1000);
        }
      });
    } catch (error) {
      console.error('Failed to broadcast floor plan update:', error);
    }
  };

  const handleImageUpload = async (url: string, path: string) => {
    setFormData(prev => ({ ...prev, image_url: url }));
    toast.success('Image uploaded successfully');
  };

  const handleEditFloorPlan = (floorPlan: any) => {
    setEditingFloorPlan(floorPlan);
    setFormData({
      name: floorPlan.name,
      image_url: floorPlan.image_url,
      version: floorPlan.version
    });
  };

  const handleStartMigration = (floorPlan: any) => {
    setShowMigrationWizard(floorPlan);
  };

  const FloorPlanForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Floor Plan Name</Label>
        <Input
          id="name"
          placeholder="Enter floor plan name (e.g., Building A - Level 1)"
          value={formData.name}
          onChange={(e) => {
            console.log('Input change:', e.target.value);
            setFormData(prev => ({ ...prev, name: e.target.value }));
          }}
          disabled={loading}
          autoFocus={!isEdit}
        />
        {/* Debug info */}
        <p className="text-xs text-gray-500 mt-1">
          Current value: "{formData.name}" | Loading: {loading.toString()} | Edit mode: {isEdit.toString()}
        </p>
      </div>

      <div>
        <Label htmlFor="version">Version</Label>
        <Input
          id="version"
          type="number"
          min="1"
          value={formData.version}
          onChange={(e) => setFormData(prev => ({ ...prev, version: parseInt(e.target.value) || 1 }))}
        />
      </div>

      <div>
        <Label>Floor Plan Image</Label>
        <ImageUpload
          bucket="floor-plan-images"
          existingImages={formData.image_url ? [formData.image_url] : []}
          onUploadComplete={handleImageUpload}
          onRemoveImage={() => setFormData(prev => ({ ...prev, image_url: '' }))}
          maxFiles={1}
          accept="image/jpeg,image/png,image/webp"
          maxSizeMB={10}
        />
      </div>

      {formData.image_url && (
        <div className="mt-4">
          <Label>Preview</Label>
          <div className="relative w-full h-64 mt-2">
            <SmartImage
              src={formData.image_url}
              alt="Floor plan preview"
              className="w-full h-full object-contain rounded-lg border"
            />
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          onClick={() => {
            setShowCreateForm(false);
            setEditingFloorPlan(null);
            setFormData({ name: '', image_url: '', version: 1 });
          }}
        >
          Cancel
        </Button>
        <Button onClick={isEdit ? handleUpdateFloorPlan : handleCreateFloorPlan}>
          {isEdit ? 'Update' : 'Create'} Floor Plan
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading floor plans...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Floor Plan Management</h2>
          <p className="text-muted-foreground">
            Manage floor plan images and handle layout migrations
          </p>
        </div>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Floor Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Floor Plan</DialogTitle>
            </DialogHeader>
            <FloorPlanForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Floor Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {floorPlans.map((floorPlan) => (
          <Card key={floorPlan.id} className="overflow-hidden">
            <div className="relative h-48">
              <SmartImage
                src={floorPlan.image_url}
                alt={floorPlan.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge variant="secondary">
                  v{floorPlan.version}
                </Badge>
              </div>
            </div>
            
            <CardHeader>
              <CardTitle className="text-lg">{floorPlan.name}</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={floorPlan.is_active ? 'default' : 'secondary'}>
                  {floorPlan.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Created: {new Date(floorPlan.created_at || '').toLocaleDateString()}
                </span>
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditFloorPlan(floorPlan)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStartMigration(floorPlan)}
                  className="text-orange-600 hover:text-orange-700"
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Migrate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {floorPlans.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Floor Plans</h3>
              <p>Get started by creating your first floor plan.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingFloorPlan} onOpenChange={(open) => !open && setEditingFloorPlan(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Floor Plan</DialogTitle>
          </DialogHeader>
          <FloorPlanForm isEdit />
        </DialogContent>
      </Dialog>

      {/* Migration Wizard */}
      {showMigrationWizard && (
        <FloorPlanMigrationWizard
          floorPlan={showMigrationWizard}
          onClose={() => setShowMigrationWizard(null)}
        />
      )}
    </div>
  );
};