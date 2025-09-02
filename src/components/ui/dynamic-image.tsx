import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';

interface DynamicImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  showPlaceholder?: boolean;
}

export function DynamicImage({ 
  src, 
  alt, 
  fallbackSrc = '/placeholder.svg',
  className,
  showPlaceholder = true,
  ...props 
}: DynamicImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  // If there's an error and no fallback, show placeholder
  if (imageError && !fallbackSrc && showPlaceholder) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}
        {...props}
      >
        <ImageIcon className="h-8 w-8" />
      </div>
    );
  }

  return (
    <>
      {isLoading && showPlaceholder && (
        <div 
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground animate-pulse",
            className
          )}
        >
          <ImageIcon className="h-8 w-8" />
        </div>
      )}
      <img
        src={imageError ? fallbackSrc : src}
        alt={alt}
        className={cn(
          "transition-opacity duration-200",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={handleImageLoad}
        onError={handleImageError}
        {...props}
      />
    </>
  );
}

// Wrapper for images that might come from static assets or dynamic storage
interface SmartImageProps extends DynamicImageProps {
  staticFallback?: string; // Path to static asset as fallback
}

export function SmartImage({ 
  src, 
  staticFallback, 
  fallbackSrc = '/placeholder.svg',
  ...props 
}: SmartImageProps) {
  // If src is a static import (starts with /src/), use it directly
  if (src.startsWith('/src/')) {
    return <DynamicImage src={src} fallbackSrc={fallbackSrc} {...props} />;
  }

  // If src is a Supabase Storage URL or external URL, use it with fallback
  return (
    <DynamicImage 
      src={src} 
      fallbackSrc={staticFallback || fallbackSrc} 
      {...props} 
    />
  );
}