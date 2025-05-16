import { useState, useEffect } from "react";
import { getImageUrl, normalizeImagePath, getFirstImageSafely } from "@/lib/utils";

interface PropertyImageProps {
  src?: string | string[] | any; // Support different image source formats
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

  // Enhanced image path processing with our utility functions
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

    // Use our utility function to extract the first image path
    const firstImagePath = getFirstImageSafely(src);
    console.log('PropertyImage: First image path -', firstImagePath);

    // Skip processing if it's already the placeholder
    if (firstImagePath === '/placeholder-property.svg') {
      setFormattedSrc('/placeholder-property.svg');
      setIsLoaded(true);
      return;
    }

    // Check if this image is already known to fail
    if (knownFailedImages.has(firstImagePath)) {
      console.log('PropertyImage: Using placeholder for known failed image -', firstImagePath);
      setFormattedSrc('/placeholder-property.svg');
      setIsLoaded(true);
      return;
    }

    // Clean and normalize the image path
    const normalizedPath = normalizeImagePath(firstImagePath);
    console.log('PropertyImage: Normalized path -', normalizedPath);

    // Add cache busting parameter
    const timestamp = Date.now();
    const finalPath = `${normalizedPath}?t=${timestamp}`;
    console.log('PropertyImage: Final path -', finalPath);

    setFormattedSrc(finalPath);
  }, [src]);

  // We're now using the utility functions from @/lib/utils
  // No need for a separate processImagePath function

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