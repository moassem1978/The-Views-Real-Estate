import { useState } from 'react';

interface PropertyImageProps {
  src: string;
  alt: string;
  className?: string;
}

// Function to normalize image URLs
const normalizeImageUrl = (url: string): string => {
  if (!url) return '/default-property.svg';

  // If it's already a full URL (starts with http), use as is
  if (url.startsWith('http')) return url;

  // If it starts with /public/, remove /public/ prefix
  if (url.startsWith('/public/')) {
    return url.replace('/public/', '/');
  }

  // If it's in uploads folder but missing leading slash
  if (url.startsWith('uploads/')) {
    return `/${url}`;
  }

  // If it doesn't start with slash, add it
  if (!url.startsWith('/')) {
    return `/${url}`;
  }

  return url;
};

export default function PropertyImage({ src, alt, className }: PropertyImageProps) {
  const [imgSrc, setImgSrc] = useState(normalizeImageUrl(src));
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);

    // Try alternative image paths before showing fallback
    if (!hasError) {
      setHasError(true);

      // Try with /public/ prefix if it doesn't already have it
      if (!imgSrc.includes('/public/') && imgSrc.includes('uploads/')) {
        setImgSrc(`/public/${imgSrc.startsWith('/') ? imgSrc.slice(1) : imgSrc}`);
        setIsLoading(true);
        return;
      }

      // Try without /public/ prefix
      if (imgSrc.includes('/public/')) {
        setImgSrc(imgSrc.replace('/public/', '/'));
        setIsLoading(true);
        return;
      }
    }

    // Final fallback
    setImgSrc('/default-property.svg');
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded"></div>
      )}

      <img
        src={imgSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />

      {hasError && imgSrc === '/default-property.svg' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm">No Image</p>
          </div>
        </div>
      )}
    </div>
  );
}