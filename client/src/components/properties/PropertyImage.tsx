import { useState, useEffect } from "react";
import { getImageUrl } from "@/lib/utils";

interface PropertyImageProps {
  src?: string;
  alt: string;
  priority?: boolean;
  className?: string;
  onClick?: () => void;
}

// Keep a record of image URLs that are known to fail
// This avoids unnecessary network requests for images we know don't exist after retry
// Only populated after the server-side image matcher has already tried
const knownFailedImages = new Set<string>();

// We keep this but don't use it for skipping image loading now
// Our server-side image matcher can handle these patterns
const hashPattern = /[a-f0-9]{32}/i;

export default function PropertyImage({ 
  src, 
  alt, 
  priority = false, 
  className = "", 
  onClick 
}: PropertyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [formattedSrc, setFormattedSrc] = useState('');
  
  // Simplified approach - process the src once and don't retry with multiple strategies
  useEffect(() => {
    // For fast loading, start with hiding the image
    setIsLoaded(false);
    
    // Handle empty or invalid sources directly
    if (!src || src === 'undefined' || src === 'null') {
      setFormattedSrc('/placeholder-property.svg');
      setIsLoaded(true); // Assume placeholder is always available
      return;
    }
    
    // Remove any extra quotes that might be from JSON serialization
    const cleanSrc = src.replace(/"/g, '').replace(/\\/g, '/');
    
    // Check if this image is already known to fail
    if (knownFailedImages.has(cleanSrc)) {
      setFormattedSrc('/placeholder-property.svg');
      setIsLoaded(true);
      return;
    }
    
    // Known placeholders - use directly without modifications
    if (cleanSrc === '/placeholder-property.svg' || 
        cleanSrc.includes('placeholder-property.svg') ||
        cleanSrc === '/uploads/default-property.svg') {
      setFormattedSrc(cleanSrc);
      setIsLoaded(true);
      return;
    }
    
    // We previously had special handling for hash-pattern files here,
    // but now that we have a robust server-side image matcher, we'll
    // allow all paths to be processed normally
    
    // For any other image, use a simple URL with timestamp to avoid caching
    // but without multiple retry strategies
    
    // Add initial forward slash if missing
    let normalizedSrc = cleanSrc;
    if (!normalizedSrc.startsWith('/') && !normalizedSrc.startsWith('http')) {
      normalizedSrc = `/${normalizedSrc}`;
    }
    
    // Simple timestamp to prevent caching
    const timestamp = new Date().getTime();
    setFormattedSrc(`${normalizedSrc}?t=${timestamp}`);
  }, [src]);
  
  const handleLoad = () => {
    setIsLoaded(true);
  };
  
  const handleError = () => {
    // If we're already using the placeholder, do nothing
    if (formattedSrc.includes('placeholder-property.svg')) {
      setIsLoaded(true);
      return;
    }
    
    // Add to known failed images for future reference
    if (src) {
      const cleanSrc = src.replace(/"/g, '').replace(/\\/g, '/');
      knownFailedImages.add(cleanSrc);
    }
    
    // Use placeholder without any retry attempts
    setFormattedSrc('/placeholder-property.svg');
    setIsLoaded(true);
  };
  
  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      onClick={onClick}
    >
      {/* Simplified loading - show placeholder immediately while real image loads */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100">
          <img
            src="/placeholder-property.svg"
            alt={alt}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      {/* Actual image */}
      {formattedSrc && (
        <img
          src={formattedSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
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
