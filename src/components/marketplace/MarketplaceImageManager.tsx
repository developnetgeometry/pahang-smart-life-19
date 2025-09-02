import React from 'react';
import { ImageUpload } from '@/components/ui/image-upload';
import { useImageManagement } from '@/hooks/use-image-management';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import { SmartImage } from '@/components/ui/dynamic-image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

interface MarketplaceImageManagerProps {
  itemId: string;
  onImagesUpdate?: (imageUrls: string[]) => void;
  maxImages?: number;
}

export function MarketplaceImageManager({ 
  itemId, 
  onImagesUpdate, 
  maxImages = 8 
}: MarketplaceImageManagerProps) {
  const { images, loading, deleteImage, fetchImages, updateImageDetails } = useImageManagement({
    assetType: 'marketplace',
    referenceId: itemId,
    bucket: 'marketplace-images'
  });

  const [editingImage, setEditingImage] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  const handleUploadComplete = (url: string, path: string) => {
    fetchImages(); // Refresh the image list
    if (onImagesUpdate) {
      const allImageUrls = [...images.map(img => img.url!), url];
      onImagesUpdate(allImageUrls);
    }
  };

  const handleRemoveImage = async (imageToRemove: string) => {
    const image = images.find(img => img.url === imageToRemove);
    if (image) {
      await deleteImage(image.id);
      if (onImagesUpdate) {
        const remainingUrls = images
          .filter(img => img.url !== imageToRemove)
          .map(img => img.url!);
        onImagesUpdate(remainingUrls);
      }
    }
  };

  const handleEditImage = (image: any) => {
    setEditingImage(image);
    setEditForm({ name: image.name, description: image.description || '' });
  };

  const handleSaveEdit = async () => {
    if (editingImage) {
      await updateImageDetails(editingImage.id, editForm);
      setEditingImage(null);
      fetchImages();
    }
  };

  const existingImageUrls = images.map(img => img.url!);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Product Images</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            bucket="marketplace-images"
            onUploadComplete={handleUploadComplete}
            maxFiles={maxImages}
            existingImages={existingImageUrls}
            onRemoveImage={handleRemoveImage}
          />
        </CardContent>
      </Card>

      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <SmartImage
                    src={image.url!}
                    alt={image.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleEditImage(image)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Image Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <SmartImage
                            src={image.url!}
                            alt={image.name}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <div>
                            <Label htmlFor="name">Image Name</Label>
                            <Input
                              id="name"
                              value={editForm.name}
                              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={editForm.description}
                              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleSaveEdit}>Save Changes</Button>
                            <Button variant="outline" onClick={() => setEditingImage(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteImage(image.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-xs text-white bg-black/50 rounded px-2 py-1 truncate">
                      {image.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}