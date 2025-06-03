
import { useState, useRef, useEffect } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export default function OptimizedImage({ 
  src, 
  alt, 
  className = "", 
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src) {
      setImageSrc('/placeholder-property.svg');
      return;
    }

    // Try to use WebP version if available
    let optimizedSrc = src;
    if (src.includes('uploads/properties') && !src.endsWith('.webp') && !src.includes('optimized-')) {
      const filename = src.split('/').pop()?.split('.')[0] || '';
      optimizedSrc = src.replace(/\/([^/]+)\.(jpg|jpeg|png)$/i, '/optimized-$1.webp');
    }

    setImageSrc(optimizedSrc);
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    console.warn(`Failed to load optimized image: ${imageSrc}, falling back to placeholder`);
    
    // Try fallback to original if this was an optimized version
    if (imageSrc.includes('optimized-') && imageSrc.endsWith('.webp')) {
      const fallbackSrc = imageSrc.replace('optimized-', '').replace('.webp', '.jpg');
      setImageSrc(fallbackSrc);
      return;
    }
    
    setHasError(true);
    setImageSrc('/placeholder-property.svg');
    onError?.();
  };

  if (hasError) {
    return (
      <img 
        src="/placeholder-property.svg"
        alt={alt} 
        className={className}
      />
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchpriority={priority ? "high" : "auto"}
        sizes={sizes}
        className={`w-full h-full object-cover transition-all duration-300 ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}
