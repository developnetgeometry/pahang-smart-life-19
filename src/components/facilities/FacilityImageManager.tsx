import React from 'react';
import { ImageUpload } from '@/components/ui/image-upload';
import { useImageManagement } from '@/hooks/use-image-management';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { SmartImage } from '@/components/ui/dynamic-image';

interface FacilityImageManagerProps {
  facilityId: string;
  onImagesUpdate?: (imageUrls: string[]) => void;
}

export function FacilityImageManager({ facilityId, onImagesUpdate }: FacilityImageManagerProps) {
  const { images, loading, deleteImage, fetchImages } = useImageManagement({
    assetType: 'facility',
    referenceId: facilityId,
    bucket: 'facility-images'
  });

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

  const existingImageUrls = images.map(img => img.url!);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Facility Images</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            bucket="facility-images"
            onUploadComplete={handleUploadComplete}
            maxFiles={10}
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
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
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