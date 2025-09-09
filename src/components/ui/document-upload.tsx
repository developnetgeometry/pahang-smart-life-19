import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface DocumentUploadProps {
  bucket: 'service-provider-documents' | 'application-documents';
  onUploadComplete: (url: string, path: string, fileName: string) => void;
  documentType: string;
  maxFiles?: number;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  existingDocuments?: Array<{ url: string; name: string }>;
  onRemoveDocument?: (url: string) => void;
  required?: boolean;
}

interface UploadingFile {
  file: File;
  progress: number;
  error?: string;
  url?: string;
}

export function DocumentUpload({
  bucket,
  onUploadComplete,
  documentType,
  maxFiles = 3,
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
  maxSizeMB = 10,
  className = '',
  existingDocuments = [],
  onRemoveDocument,
  required = false
}: DocumentUploadProps) {
  const { user } = useAuth();
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || !user) return;

    const fileArray = Array.from(files);
    const totalFiles = existingDocuments.length + uploadingFiles.length + fileArray.length;

    if (totalFiles > maxFiles) {
      toast.error(`Maximum ${maxFiles} documents allowed for ${documentType}`);
      return;
    }

    const validFiles = fileArray.filter(file => {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/jpg',
        'image/png'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported file type`);
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
      const fileName = `${user!.id}/${documentType}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

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

      onUploadComplete(urlData.publicUrl, data.path, file.name);
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

  const canUploadMore = existingDocuments.length + uploadingFiles.length < maxFiles;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Existing Documents */}
      {existingDocuments.length > 0 && (
        <div className="space-y-2">
          {existingDocuments.map((doc, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm truncate">{doc.name}</span>
                  </div>
                  {onRemoveDocument && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                      onClick={() => onRemoveDocument(doc.url)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((file, index) => (
            <Card key={index} className="relative">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm truncate">{file.file.name}</span>
                  </div>
                  
                  {file.error ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-destructive">Error</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-1 h-6 w-6"
                        onClick={() => removeUploadingFile(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : file.url ? (
                    <span className="text-xs text-green-600">Complete</span>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="w-20">
                        <Progress value={file.progress} className="h-1" />
                      </div>
                      <span className="text-xs">{Math.round(file.progress)}%</span>
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
          <CardContent className="p-4 text-center">
            <div className="space-y-3">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
              <div>
                <p className="text-sm font-medium">
                  Drop {documentType} documents here or click to browse
                  {required && <span className="text-destructive ml-1">*</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  Upload up to {maxFiles - existingDocuments.length - uploadingFiles.length} more documents 
                  (PDF, DOC, DOCX, JPG, PNG - max {maxSizeMB}MB each)
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-3 w-3 mr-2" />
                Choose Documents
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
        <p className="text-xs text-muted-foreground text-center">
          Maximum number of documents reached ({maxFiles})
        </p>
      )}
    </div>
  );
}
