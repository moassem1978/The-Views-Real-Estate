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

// Pattern for matching MD5 hash strings commonly found in Windows uploads
const hashPattern = /[a-f0-9]{32}/i;

// Known image extensions for validation
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

export default function PropertyImage({ 
  src, 
  alt, 
  priority = false, 
  className = "", 
  onClick 
}: PropertyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [formattedSrc, setFormattedSrc] = useState('');
  
  // Enhanced image path processing
  useEffect(() => {
    // For fast loading, start with hiding the image
    setIsLoaded(false);
    
    // Handle empty or invalid sources directly
    if (!src || src === 'undefined' || src === 'null' || src === '[object Object]') {
      console.log('PropertyImage: Invalid source -', src);
      setFormattedSrc('/placeholder-property.svg');
      setIsLoaded(true); // Assume placeholder is always available
      return;
    }
    
    // Special case: If the source is JSON or looks like a JSON array, try to extract a usable path
    if (typeof src === 'string' && (src.startsWith('[') || src.startsWith('"['))) {
      console.log('PropertyImage: Source appears to be JSON format -', src);
      try {
        // Remove any outer quotes that might surround JSON
        const cleanJson = src.replace(/^"/, '').replace(/"$/, '').replace(/\\"/g, '"');
        
        // Parse the JSON
        const parsed = JSON.parse(cleanJson);
        
        // If it's an array, use the first item
        if (Array.isArray(parsed) && parsed.length > 0) {
          const firstItem = parsed[0];
          console.log('PropertyImage: Extracted first item from JSON array -', firstItem);
          
          // Recursively process this item instead
          if (firstItem && typeof firstItem === 'string') {
            // Set source to the first item and continue processing
            const singleImage = String(firstItem).trim();
            console.log('PropertyImage: Using first image from array -', singleImage);
            
            // Now process this single image using the rest of the logic
            if (singleImage) {
              // Continue with the single image path instead
              processImagePath(singleImage);
              return;
            }
          }
        }
      } catch (e) {
        console.log('PropertyImage: Failed to parse JSON source -', e);
        // Continue with normal processing if JSON parsing fails
      }
    }
    
    // Process the image path
    processImagePath(src);
  }, [src]);
  
  // Extracted the image processing logic to a separate function for clarity and reuse
  const processImagePath = (imageSrc: string | any) => {
    // Ensure we're working with a string
    const srcString = typeof imageSrc === 'string' ? imageSrc : String(imageSrc);
    
    // Remove any extra quotes that might be from JSON serialization
    // and normalize path separators
    const cleanSrc = srcString.replace(/"/g, '').replace(/\\/g, '/').trim();
    
    console.log('PropertyImage: Processing source -', cleanSrc);
    
    // Check if this image is already known to fail
    if (knownFailedImages.has(cleanSrc)) {
      console.log('PropertyImage: Using placeholder for known failed image -', cleanSrc);
      setFormattedSrc('/placeholder-property.svg');
      setIsLoaded(true);
      return;
    }
    
    // Known placeholders - use directly without modifications
    if (cleanSrc === '/placeholder-property.svg' || 
        cleanSrc.includes('placeholder-property.svg') ||
        cleanSrc === '/uploads/default-property.svg') {
      console.log('PropertyImage: Using direct placeholder path -', cleanSrc);
      setFormattedSrc(cleanSrc);
      setIsLoaded(true);
      return;
    }
    
    // Special case: if it looks like a hash but doesn't have a proper path,
    // use the pattern the server recognizes for hash lookups
    if (hashPattern.test(cleanSrc) && !cleanSrc.includes('/')) {
      console.log('PropertyImage: Hash pattern detected, using properties path -', cleanSrc);
      const hashPath = `/properties/${cleanSrc}`;
      setFormattedSrc(hashPath);
      return;
    }
    
    // Add initial forward slash if missing for relative paths
    let normalizedSrc = cleanSrc;
    if (!normalizedSrc.startsWith('/') && !normalizedSrc.startsWith('http')) {
      normalizedSrc = `/${normalizedSrc}`;
      console.log('PropertyImage: Added leading slash -', normalizedSrc);
    }
    
    // Handle common path issues
    
    // Case 1: Path includes "uploads/properties" but needs a leading slash
    if (normalizedSrc.includes('uploads/properties') && !normalizedSrc.includes('/uploads/properties')) {
      normalizedSrc = normalizedSrc.replace('uploads/properties', '/uploads/properties');
      console.log('PropertyImage: Fixed uploads path format -', normalizedSrc);
    }
    
    // Case 2: Fix double slashes (but not in http://)
    if (normalizedSrc.includes('//') && !normalizedSrc.includes('http')) {
      normalizedSrc = normalizedSrc.replace(/\/\//g, '/');
      console.log('PropertyImage: Fixed double slashes -', normalizedSrc);
    }
    
    // Add cache busting parameter to ensure fresh images
    const timestamp = new Date().getTime();
    const finalPath = `${normalizedSrc}?t=${timestamp}`;
    console.log('PropertyImage: Final path -', finalPath);
    
    setFormattedSrc(finalPath);
  };
  
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
