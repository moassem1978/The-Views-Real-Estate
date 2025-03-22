import { useState, useEffect } from "react";

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
      setFormattedSrc('');
      return;
    }
    
    // Check if the path already starts with http, https, or a forward slash
    if (src.startsWith('http://') || src.startsWith('https://')) {
      // External URLs remain unchanged
      setFormattedSrc(src);
    } else if (src.startsWith('/uploads/')) {
      // Uploads directory paths are kept as is
      setFormattedSrc(src);
    } else if (src.startsWith('/')) {
      // Other paths starting with / are kept as is
      setFormattedSrc(src);
    } else {
      // For any other format, add a forward slash
      setFormattedSrc('/' + src);
    }
    
    // Log the formatted source for debugging
    console.log(`Original src: ${src}, Formatted src: ${src.startsWith('/uploads/') ? src : (src.startsWith('/') ? src : '/' + src)}`);
  }, [src]);
  
  const handleLoad = () => {
    setIsLoaded(true);
  };
  
  const handleError = () => {
    console.log('Image failed to load:', formattedSrc);
    setIsError(true);
  };
  
  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      onClick={onClick}
    >
      {!isLoaded && !isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <svg className="h-12 w-12 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      
      {isError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
          <svg className="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">Failed to load image</p>
        </div>
      )}
      
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
    </div>
  );
}
