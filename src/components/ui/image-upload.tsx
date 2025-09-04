import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ImageUploadProps {
  bucket: 'marketplace-images' | 'facility-images' | 'user-avatars' | 'community-assets' | 'floor-plan-images';
  onUploadComplete: (url: string, path: string) => void;
  maxFiles?: number;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  existingImages?: string[];
  onRemoveImage?: (url: string) => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  error?: string;
  url?: string;
}

export function ImageUpload({
  bucket,
  onUploadComplete,
  maxFiles = 5,
  accept = 'image/*',
  maxSizeMB = 10,
  className = '',
  existingImages = [],
  onRemoveImage
}: ImageUploadProps) {
  const { user } = useAuth();
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || !user) return;

    const fileArray = Array.from(files);
    const totalFiles = existingImages.length + uploadingFiles.length + fileArray.length;

    if (totalFiles > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }

    const validFiles = fileArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`${file.name} is too large (max ${maxSizeMB}MB)`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    const newUploadingFiles = validFiles.map(file => ({
      file,
      progress: 0
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Upload files
    validFiles.forEach((file, index) => {
      uploadFile(file, newUploadingFiles.length - validFiles.length + index);
    });
  };

  const uploadFile = async (file: File, fileIndex: number) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Update progress to 100% after successful upload
      setUploadingFiles(prev => prev.map((f, i) => 
        i === fileIndex ? { ...f, progress: 100 } : f
      ));

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      // Update the uploading file with success
      setUploadingFiles(prev => prev.map((f, i) => 
        i === fileIndex 
          ? { ...f, progress: 100, url: urlData.publicUrl }
          : f
      ));

      // Record in image_assets table
      await supabase
        .from('image_assets')
        .insert({
          name: file.name,
          file_path: data.path,
          bucket_id: bucket,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: user!.id,
          asset_type: bucket.split('-')[0] // 'marketplace', 'facility', etc.
        });

      onUploadComplete(urlData.publicUrl, data.path);
      toast.success(`${file.name} uploaded successfully`);

      // Remove from uploading list after 1 second
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter((_, i) => i !== fileIndex));
      }, 1000);

    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadingFiles(prev => prev.map((f, i) => 
        i === fileIndex ? { ...f, error: error.message } : f
      ));
      toast.error(`Failed to upload ${file.name}: ${error.message}`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeUploadingFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const canUploadMore = existingImages.length + uploadingFiles.length < maxFiles;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {existingImages.map((url, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-2">
                <img
                  src={url}
                  alt={`Image ${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
                {onRemoveImage && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                    onClick={() => onRemoveImage(url)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uploadingFiles.map((file, index) => (
            <Card key={index} className="relative">
              <CardContent className="p-2">
                <div className="flex flex-col items-center space-y-2">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <p className="text-xs truncate w-full text-center">{file.file.name}</p>
                  
                  {file.error ? (
                    <div className="text-xs text-destructive text-center">
                      {file.error}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-1 right-1 p-1 h-6 w-6"
                        onClick={() => removeUploadingFile(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : file.url ? (
                    <div className="text-xs text-green-600">Complete</div>
                  ) : (
                    <div className="w-full space-y-1">
                      <Progress value={file.progress} className="w-full h-1" />
                      <div className="text-xs text-center">{Math.round(file.progress)}%</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canUploadMore && (
        <Card 
          className={`border-2 border-dashed transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <p className="text-lg font-medium">Drop images here or click to browse</p>
                <p className="text-sm text-muted-foreground">
                  Upload up to {maxFiles - existingImages.length - uploadingFiles.length} more images 
                  (max {maxSizeMB}MB each)
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Images
              </Button>
            </div>
            
            <Input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple={maxFiles > 1}
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </CardContent>
        </Card>
      )}

      {!canUploadMore && (
        <p className="text-sm text-muted-foreground text-center">
          Maximum number of images reached ({maxFiles})
        </p>
      )}
    </div>
  );
}
