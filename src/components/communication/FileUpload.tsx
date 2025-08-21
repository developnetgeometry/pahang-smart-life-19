import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  File, 
  Image, 
  Video, 
  Music, 
  X, 
  Download,
  Eye,
  Paperclip
} from 'lucide-react';

interface FileUploadProps {
  onFileUploaded: (file: UploadedFile) => void;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  className?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnail?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB default
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'audio/mp3',
  'audio/wav',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export default function FileUpload({ 
  onFileUploaded, 
  maxFileSize = 10,
  allowedTypes = ALLOWED_TYPES,
  className = '' 
}: FileUploadProps) {
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (fileType.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (fileType.startsWith('audio/')) return <Music className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const createThumbnail = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(undefined);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Create thumbnail (max 200px width/height)
          const maxSize = 200;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const uploadFile = async (file: File) => {
    const fileId = `${Date.now()}-${file.name}`;
    
    try {
      // Validate file
      if (file.size > maxFileSize * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `File must be smaller than ${maxFileSize}MB`,
          variant: 'destructive',
        });
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'File type not allowed',
          description: 'Please select a valid file type',
          variant: 'destructive',
        });
        return;
      }

      setUploading(true);
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

      // Generate unique file path
      const timestamp = new Date().toISOString();
      const filePath = `chat-files/${timestamp}-${file.name}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      // Create thumbnail if it's an image
      const thumbnail = await createThumbnail(file);

      const uploadedFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        url: urlData.publicUrl,
        thumbnail,
      };

      setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
      onFileUploaded(uploadedFile);

      toast({
        title: 'File uploaded successfully',
        description: file.name,
      });

      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress(prev => {
          const updated = { ...prev };
          delete updated[fileId];
          return updated;
        });
      }, 2000);

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: 'destructive',
      });
      
      setUploadProgress(prev => {
        const updated = { ...prev };
        delete updated[fileId];
        return updated;
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(uploadFile);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    files.forEach(uploadFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className={className}>
      {/* Upload Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2"
      >
        <Paperclip className="w-4 h-4" />
        Attach File
      </Button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        accept={allowedTypes.join(',')}
        className="hidden"
      />

      {/* Drag & Drop Area (shown when dragging) */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center pointer-events-none opacity-0 transition-opacity duration-200 data-[dragging=true]:opacity-100 data-[dragging=true]:pointer-events-auto"
      >
        <Card className="p-8 border-2 border-dashed border-primary">
          <CardContent className="text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">Drop files here to upload</p>
            <p className="text-sm text-muted-foreground">
              Maximum {maxFileSize}MB per file
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="fixed bottom-4 right-4 z-40 space-y-2">
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <Card key={fileId} className="w-80">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium truncate">
                    Uploading...
                  </p>
                  <span className="text-sm text-muted-foreground">
                    {progress}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// File Preview Component
interface FilePreviewProps {
  file: UploadedFile;
  onRemove?: () => void;
  showActions?: boolean;
}

export function FilePreview({ file, onRemove, showActions = true }: FilePreviewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (fileType.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (fileType.startsWith('audio/')) return <Music className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
  };

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  return (
    <>
      <Card className="w-full max-w-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* File Icon/Thumbnail */}
            <div className="flex-shrink-0">
              {file.thumbnail ? (
                <img
                  src={file.thumbnail}
                  alt={file.name}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                  {getFileIcon(file.type)}
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </p>

              {/* Actions */}
              {showActions && (
                <div className="flex items-center gap-2 mt-2">
                  {(isImage || isVideo) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsPreviewOpen(true)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>

                  {onRemove && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onRemove}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-2 right-2 z-10 bg-black/50 text-white hover:bg-black/70"
            >
              <X className="w-4 h-4" />
            </Button>

            {isImage && (
              <img
                src={file.url}
                alt={file.name}
                className="w-full h-full object-contain rounded"
              />
            )}

            {isVideo && (
              <video
                src={file.url}
                controls
                className="w-full h-full object-contain rounded"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}