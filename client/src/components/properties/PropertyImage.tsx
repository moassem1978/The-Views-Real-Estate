` tags. I will pay close attention to indentation, structure, and completeness, and avoid any forbidden words or placeholders.

```typescript
<replit_final_file>
import { useState, useEffect } from "react";

interface PropertyImageProps {
  src?: string | string[] | any;
  alt: string;
  className?: string;
}

export default function PropertyImage({ src, alt, className = "" }: PropertyImageProps) {
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Handle different source formats
    let imageUrl = '';
    if (Array.isArray(src) && src.length > 0) {
      imageUrl = src[0];
    } else if (typeof src === 'string') {
      imageUrl = src;
    }

    // Clean up the URL and ensure it starts with /
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    }

    // Add cache busting
    if (imageUrl) {
      const timestamp = Date.now();
      imageUrl = `${imageUrl}?t=${timestamp}`;
    }

    setImageSrc(imageUrl);
    setError(false);
    setIsLoaded(false);
  }, [src]);

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
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}