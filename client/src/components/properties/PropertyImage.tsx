
import { useState, useEffect } from "react";
import { normalizeImagePath } from "@/lib/utils";

interface PropertyImageProps {
  src?: string | string[] | any;
  alt: string;
  className?: string;
  index?: number; // Allow selecting a specific image from an array
}

export default function PropertyImage({ src, alt, className = "", index = 0 }: PropertyImageProps) {
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!src) {
      setError(true);
      return;
    }

    try {
      let imagePath = '';
      
      // Handle array input
      if (Array.isArray(src)) {
        imagePath = src[index] || src[0] || '';
      }
      // Handle JSON string
      else if (typeof src === 'string' && src.startsWith('[')) {
        try {
          const parsed = JSON.parse(src);
          imagePath = Array.isArray(parsed) ? (parsed[index] || parsed[0] || '') : src;
        } catch {
          imagePath = src;
        }
      }
      // Handle direct string
      else if (typeof src === 'string') {
        imagePath = src;
      }
      
      // Clean and format path
      if (imagePath) {
        imagePath = imagePath.toString().trim().replace(/"/g, '');
        
        // Ensure proper path format
        if (!imagePath.startsWith('/') && !imagePath.startsWith('http')) {
          imagePath = `/${imagePath}`;
        }
        
        setImageSrc(imagePath);
        setError(false);
        setIsLoaded(false);
      } else {
        setError(true);
      }
    } catch (error) {
      setError(true);
    }
  }, [src, index]);

  const handleError = () => {
    console.error(`Failed to load image: ${imageSrc}`);
    setError(true);
    setIsLoaded(false);
  };

  const handleLoad = () => {
    setIsLoaded(true);
    setError(false);
  };

  if (error || !imageSrc) {
    return (
      <img 
        src="/placeholder-property.svg"
        alt={alt || "Property"} 
        className={className}
      />
    );
  }

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}
