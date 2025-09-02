import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ImageAsset {
  id: string;
  name: string;
  description?: string;
  file_path: string;
  bucket_id: string;
  file_size?: number;
  mime_type?: string;
  uploaded_by: string;
  asset_type: string;
  reference_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  url?: string; // Computed URL
}

interface UseImageManagementProps {
  assetType?: string;
  referenceId?: string;
  bucket?: string;
}

export function useImageManagement({ 
  assetType, 
  referenceId, 
  bucket 
}: UseImageManagementProps = {}) {
  const { user } = useAuth();
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchImages = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('image_assets')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (assetType) {
        query = query.eq('asset_type', assetType);
      }

      if (referenceId) {
        query = query.eq('reference_id', referenceId);
      }

      if (bucket) {
        query = query.eq('bucket_id', bucket);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Add public URLs to images
      const imagesWithUrls = data?.map(image => ({
        ...image,
        url: getImageUrl(image.bucket_id, image.file_path)
      })) || [];

      setImages(imagesWithUrls);
    } catch (error: any) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (
    file: File,
    bucket: string,
    assetType: string,
    referenceId?: string,
    description?: string
  ): Promise<ImageAsset | null> => {
    if (!user) {
      toast.error('You must be logged in to upload images');
      return null;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(uploadData.path);

      // Record in image_assets table
      const { data: assetData, error: assetError } = await supabase
        .from('image_assets')
        .insert({
          name: file.name,
          description,
          file_path: uploadData.path,
          bucket_id: bucket,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: user.id,
          asset_type: assetType,
          reference_id: referenceId
        })
        .select()
        .single();

      if (assetError) throw assetError;

      const newImage: ImageAsset = {
        ...assetData,
        url: urlData.publicUrl
      };

      setImages(prev => [newImage, ...prev]);
      toast.success('Image uploaded successfully');
      return newImage;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload image: ${error.message}`);
      return null;
    }
  };

  const deleteImage = async (imageId: string) => {
    try {
      const image = images.find(img => img.id === imageId);
      if (!image) return;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(image.bucket_id)
        .remove([image.file_path]);

      if (storageError) throw storageError;

      // Mark as inactive in database
      const { error: dbError } = await supabase
        .from('image_assets')
        .update({ is_active: false })
        .eq('id', imageId);

      if (dbError) throw dbError;

      setImages(prev => prev.filter(img => img.id !== imageId));
      toast.success('Image deleted successfully');
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(`Failed to delete image: ${error.message}`);
    }
  };

  const updateImageDetails = async (
    imageId: string, 
    updates: { name?: string; description?: string; reference_id?: string }
  ) => {
    try {
      const { error } = await supabase
        .from('image_assets')
        .update(updates)
        .eq('id', imageId);

      if (error) throw error;

      setImages(prev => prev.map(img => 
        img.id === imageId ? { ...img, ...updates } : img
      ));

      toast.success('Image updated successfully');
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(`Failed to update image: ${error.message}`);
    }
  };

  const getImageUrl = (bucket: string, filePath: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const getImagesByReference = (referenceId: string) => {
    return images.filter(img => img.reference_id === referenceId);
  };

  useEffect(() => {
    fetchImages();
  }, [assetType, referenceId, bucket]);

  return {
    images,
    loading,
    fetchImages,
    uploadImage,
    deleteImage,
    updateImageDetails,
    getImageUrl,
    getImagesByReference
  };
}