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
  
  // Reset state and format URL when src changes
  useEffect(() => {
    setIsLoaded(false);
    setIsError(false);
    
    // Format the source URL
    if (!src) {
      // Use a default placeholder image for missing sources
      setFormattedSrc('/uploads/default-property.svg');
      return;
    }
    
    // Generate a unique cache-busting key each time the component mounts
    // This ensures we're getting fresh images from the server and not stale cached ones
    const cacheBuster = `?t=${Date.now()}`;
    
    // Use our utility function to get the correct image URL and add cache buster
    const imageUrl = getImageUrl(src);
    
    // If it's already an uploaded image path (which should have a cache buster from getImageUrl),
    // use it directly, otherwise add our cache buster
    setFormattedSrc(imageUrl.includes('?') ? imageUrl : `${imageUrl}${cacheBuster}`);
  }, [src]);
  
  const handleLoad = () => {
    setIsLoaded(true);
  };
  
  const handleError = () => {
    console.log(`Image failed to load: ${formattedSrc}`);
    setIsError(true);
    
    // Fall back to placeholder on error
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
