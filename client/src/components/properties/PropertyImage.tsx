
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
    try {
      // Handle different source formats
      let rawSrc: string | null = null;
      
      // Case 1: Array of image paths
      if (Array.isArray(src) && src.length > index) {
        rawSrc = src[index];
        console.log(`PropertyImage: Using image at index ${index} from array of ${src.length} images`);
      } 
      // Case 2: JSON string of array
      else if (typeof src === 'string' && (src.startsWith('[') || src.startsWith('"['))) {
        try {
          const parsed = JSON.parse(src.replace(/^"/, '').replace(/"$/, '').replace(/\\"/g, '"'));
          if (Array.isArray(parsed) && parsed.length > index) {
            rawSrc = parsed[index];
            console.log(`PropertyImage: Parsed JSON string to array, using image at index ${index}`);
          }
        } catch (e) {
          // Not valid JSON, treat as direct path
          rawSrc = src;
        }
      } 
      // Case 3: Direct string path
      else if (typeof src === 'string') {
        rawSrc = src;
      }
      // Case 4: Object with path or URL property (handle potential API responses)
      else if (src && typeof src === 'object' && (src.path || src.url)) {
        rawSrc = src.path || src.url;
      }

      // Process and normalize the image path
      const imageUrl = rawSrc ? normalizeImagePath(rawSrc) : '';
      
      // Add cache busting to prevent browser caching issues
      const finalUrl = imageUrl ? `${imageUrl}?t=${Date.now()}` : '';
      
      console.log(`PropertyImage: Final processed URL: ${finalUrl}`);
      
      setImageSrc(finalUrl);
      setError(false);
      setIsLoaded(false);
    } catch (error) {
      console.error('Error processing image source:', error);
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
