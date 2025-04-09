import { useState, useEffect } from "react";
import { getImageUrl } from "@/lib/utils";

interface PropertyImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function PropertyImage({ 
  src, 
  alt, 
  priority = false, 
  className = "", 
  onClick 
}: PropertyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [formattedSrc, setFormattedSrc] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [useFallbackPath, setUseFallbackPath] = useState(false);
  
  // Reset state and format URL when src changes
  useEffect(() => {
    setIsLoaded(false);
    setIsError(false);
    
    // Reset useFallbackPath when src changes, but not on retry attempts
    if (retryCount === 0) {
      setUseFallbackPath(false);
    }
    
    // Format the source URL
    if (!src) {
      // Use a default placeholder image for missing sources
      setFormattedSrc('/uploads/default-property.svg');
      return;
    }
    
    // Generate a unique cache buster for each retry attempt
    const cacheBuster = `?t=${Date.now()}-${retryCount}`;
    
    // Handle path issues where images might be in /uploads directly instead of /uploads/properties
    if (src.startsWith('/uploads/properties/') && useFallbackPath) {
      // Try an alternative path if the original failed
      const filename = src.split('/').pop();
      const fallbackPath = `/uploads/${filename}`;
      setFormattedSrc(`${fallbackPath}${cacheBuster}`);
      return;
    }
    
    // Handle already formatted URLs (from previous cache busting)
    if (src.includes('?')) {
      // Strip the old cache buster and add a new one
      const baseSrc = src.split('?')[0];
      setFormattedSrc(`${baseSrc}${cacheBuster}`);
      return;
    }
    
    // Use direct path to server for uploads directory (without getImageUrl processing)
    if (src.startsWith('/uploads/')) {
      setFormattedSrc(`${src}${cacheBuster}`);
      return;
    }
    
    // Use our utility function for other types of URLs
    const imageUrl = getImageUrl(src);
    setFormattedSrc(`${imageUrl}${cacheBuster}`);
  }, [src, retryCount, useFallbackPath]); // Add dependencies
  
  const handleLoad = () => {
    setIsLoaded(true);
    setIsError(false);
  };
  
  const handleError = () => {
    console.log(`Image failed to load: ${formattedSrc}`);
    
    // First try the fallback path if we're using a /uploads/properties/ path
    if (src.startsWith('/uploads/properties/') && !useFallbackPath) {
      console.log(`Trying fallback path for: ${src}`);
      setUseFallbackPath(true);
      return;
    }
    
    // Then try retrying the image a couple times
    if (retryCount < 3) {
      console.log(`Retrying image load (attempt ${retryCount + 1})`);
      setRetryCount(prev => prev + 1);
      return;
    }
    
    // Finally, give up and show the error state
    console.error(`Failed to load image after multiple attempts: ${src}`);
    setIsError(true);
    
    // Fall back to placeholder on error after retries
    if (!formattedSrc.includes('/uploads/default-property.svg')) {
      setFormattedSrc('/uploads/default-property.svg');
    }
  };
  
  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      onClick={onClick}
    >
      {/* Loading skeleton */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <div className="h-full w-full flex items-center justify-center">
            <svg className="h-16 w-16 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      )}
      
      {/* Error state */}
      {isError && !formattedSrc.includes('/uploads/default-property.svg') && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
          <svg className="h-16 w-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">Failed to load image</p>
        </div>
      )}
      
      {/* Actual image */}
      {formattedSrc && (
        <img
          src={formattedSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-all duration-300 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
          loading={priority ? "eager" : "lazy"}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      
      {/* Overlay gradient for better text visibility */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
    </div>
  );
}
