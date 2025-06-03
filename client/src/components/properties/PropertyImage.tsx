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
          const cleaned = src.replace(/^"/, '').replace(/"$/, '').replace(/\\"/g, '"');
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed) && parsed.length > index) {
            rawSrc = parsed[index];
            console.log(`PropertyImage: Parsed JSON string to array, using image at index ${index}`);
          }
        } catch (e) {
          // Not valid JSON, treat as direct path
          rawSrc = src;
          console.log(`PropertyImage: Failed to parse JSON, using as direct path: ${src}`);
        }
      } 
      // Case 3: Direct string path
      else if (typeof src === 'string') {
        rawSrc = src;
        console.log(`PropertyImage: Using direct string path: ${src}`);
      }
      // Case 4: Object with path or URL property (handle potential API responses)
      else if (src && typeof src === 'object' && (src.path || src.url)) {
        rawSrc = src.path || src.url;
        console.log(`PropertyImage: Extracted path from object: ${rawSrc}`);
      }

      // Special handling for image paths without leading slash
      if (rawSrc && typeof rawSrc === 'string') {
        // Check if path needs to be adjusted
        if (rawSrc.includes('uploads/properties') && !rawSrc.startsWith('/') && !rawSrc.startsWith('http')) {
          rawSrc = `/${rawSrc}`;
          console.log(`PropertyImage: Added leading slash to path: ${rawSrc}`);
        }
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
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={imageSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        fetchpriority={index === 0 ? "high" : "auto"}
        className={`w-full h-full object-cover transition-all duration-300 ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}