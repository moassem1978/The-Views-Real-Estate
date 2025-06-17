import React, { useState, useEffect } from 'react';

interface RobustImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  retryCount?: number;
  retryDelay?: number;
}

/**
 * A robust image component that handles common image loading failures
 * with retries, fallbacks, and error states for reliable image display
 * across different devices and network conditions.
 */
export function RobustImage({
  src,
  fallbackSrc = '/placeholder-property.jpg',
  alt = 'Image',
  className = '',
  retryCount = 2,
  retryDelay = 1000,
  ...props
}: RobustImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);
  const [hasError, setHasError] = useState(false);
  const [retries, setRetries] = useState(0);
  const [loading, setLoading] = useState(true);

  // Reset the component when the source changes
  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setRetries(0);
    setLoading(true);
  }, [src]);

  const handleError = () => {
    if (retries < retryCount && src) {
      // Attempt to reload with cache-busting
      const cacheBuster = `?cb=${Date.now()}`;
      const urlWithoutQuery = src.split('?')[0];
      const newSrc = `${urlWithoutQuery}${cacheBuster}`;
      
      console.log(`Image failed to load, retrying (${retries + 1}/${retryCount}): ${src}`);
      
      setTimeout(() => {
        setCurrentSrc(newSrc);
        setRetries(prev => prev + 1);
      }, retryDelay);
    } else {
      console.log(`Image failed after ${retries} retries, using fallback: ${src}`);
      setCurrentSrc(fallbackSrc);
      setHasError(true);
      setLoading(false);
    }
  };

  const handleLoad = () => {
    setLoading(false);
  };

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <svg 
            className="w-10 h-10 text-gray-300" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <path 
              stroke="currentColor" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-8.5 2v16M19 11h-7M19 15h-7"
            />
          </svg>
        </div>
      )}
      <img loading="lazy"
        src={currentSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        className={`${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ${props.className || ''}`}
        {...props}
      />
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 bg-opacity-80">
          <svg 
            className="w-12 h-12 text-gray-400 mb-2" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <path 
              stroke="currentColor" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" 
            />
          </svg>
          <p className="text-sm text-gray-500">Image unavailable</p>
        </div>
      )}
    </div>
  );
}