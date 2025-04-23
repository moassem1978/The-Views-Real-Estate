import { useState, useEffect } from "react";
import { getImageUrl } from "@/lib/utils";

interface PropertyImageProps {
  src?: string;
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
  const [fallbackStrategy, setFallbackStrategy] = useState(0);
  
  // Reset state and format URL when src changes
  useEffect(() => {
    setIsLoaded(false);
    setIsError(false);
    
    // Reset fallback strategy when src changes, but not on retry attempts
    if (retryCount === 0) {
      setUseFallbackPath(false);
      setFallbackStrategy(0);
    }
    
    // Format the source URL
    if (!src || src === 'undefined' || src === 'null') {
      // Use a default placeholder image for missing sources
      setFormattedSrc('/placeholder-property.svg');
      setIsLoaded(true); // Assume placeholder is always available
      return;
    }
    
    // First - check for placeholder SVG which never needs cache-busting or special processing
    if (src === '/placeholder-property.svg' || 
        src.includes('placeholder-property.svg') ||
        src === '/uploads/default-property.svg') {
      setFormattedSrc(src);
      return;
    }
    
    // Fix Windows-style paths with backslashes
    let normalizedSrc = src.replace(/\\/g, '/');
    
    // Remove any double quotes from JSON string serialization
    normalizedSrc = normalizedSrc.replace(/"/g, '');
    
    // Generate a unique cache buster for each retry attempt
    const cacheBuster = `?t=${Date.now()}-${retryCount}-${Math.floor(Math.random() * 10)}`;
    
    // Add initial forward slash if missing
    if (!normalizedSrc.startsWith('/') && !normalizedSrc.startsWith('http')) {
      normalizedSrc = `/${normalizedSrc}`;
    }
    
    // Handle different fallback strategies
    if (fallbackStrategy > 0) {
      // Try different path combinations based on fallback strategy number
      switch (fallbackStrategy) {
        case 1:
          // Strategy 1: Try direct filename without path
          {
            const filename = normalizedSrc.split('/').pop();
            setFormattedSrc(`/uploads/properties/${filename}${cacheBuster}`);
          }
          break;
        case 2:
          // Strategy 2: Try with just uploads folder
          {
            const filename = normalizedSrc.split('/').pop();
            setFormattedSrc(`/uploads/${filename}${cacheBuster}`);
          }
          break;
        case 3:
          // Strategy 3: Try without upload prefix
          {
            const filename = normalizedSrc.split('/').pop();
            setFormattedSrc(`/${filename}${cacheBuster}`);
          }
          break;
        case 4:
          // Strategy 4: Last resort - use placeholder image
          setFormattedSrc('/placeholder-property.svg');
          break;
        default:
          // Default to placeholder if all strategies fail
          setFormattedSrc('/placeholder-property.svg');
      }
      return;
    }
    
    // Handle already formatted URLs (from previous cache busting)
    if (normalizedSrc.includes('?')) {
      // Strip the old cache buster and add a new one
      const baseSrc = normalizedSrc.split('?')[0];
      setFormattedSrc(`${baseSrc}${cacheBuster}`);
      return;
    }
    
    // Use our enhanced utility function for proper URL formatting
    // This handles Windows paths, missing slashes, and adds cache busters
    const imageUrl = getImageUrl(normalizedSrc);
    setFormattedSrc(imageUrl);
  }, [src, retryCount, useFallbackPath, fallbackStrategy]); // Add dependencies
  
  const handleLoad = () => {
    setIsLoaded(true);
    setIsError(false);
  };
  
  const handleError = () => {
    // If we're already using the placeholder, stop retrying
    if (formattedSrc.includes('placeholder-property.svg')) {
      setIsLoaded(true); // Assume placeholder always loads
      setIsError(false);
      return;
    }
    
    console.log(`Image failed to load: ${formattedSrc}`);
    
    // Try a different fallback strategy
    if (fallbackStrategy < 4) {
      setFallbackStrategy(prev => prev + 1);
      return;
    }
    
    // Then try retrying the original source with different cache busting
    if (retryCount < 2 && fallbackStrategy === 0) {
      setRetryCount(prev => prev + 1);
      return;
    }
    
    // Finally, give up and use placeholder
    console.log(`Using placeholder after all fallback strategies failed for: ${src}`);
    setFormattedSrc('/placeholder-property.svg');
    setIsLoaded(true); // Assume placeholder always loads
    setIsError(false); // We're showing a placeholder so it's not an error state
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
