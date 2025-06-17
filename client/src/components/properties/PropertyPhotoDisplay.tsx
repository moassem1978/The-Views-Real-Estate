import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface PhotoData {
  filename: string;
  altText: string;
  url?: string;
}

interface PropertyPhotoDisplayProps {
  photos: PhotoData[];
  propertyTitle: string;
  className?: string;
  showCounter?: boolean;
}

export default function PropertyPhotoDisplay({
  photos,
  propertyTitle,
  className = "",
  showCounter = true
}: PropertyPhotoDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-0">
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <ImageIcon className="h-12 w-12 mx-auto mb-2" />
              <p>No photos available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPhoto = photos[currentIndex];
  const photoUrl = currentPhoto.url || `/uploads/properties/${currentPhoto.filename}`;

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <Card className={className}>
      <CardContent className="p-0 relative">
        <div className="aspect-video relative overflow-hidden rounded-lg">
          <img loading="lazy"
            src={photoUrl}
            alt={currentPhoto.altText || `${propertyTitle} - Image ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-image.svg';
            }}
          />
          
          {/* Photo Counter */}
          {showCounter && photos.length > 1 && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-black/50 text-white">
                {currentIndex + 1} / {photos.length}
              </Badge>
            </div>
          )}
          
          {/* Navigation Arrows */}
          {photos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                onClick={prevPhoto}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                onClick={nextPhoto}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        
        {/* Thumbnail Strip */}
        {photos.length > 1 && (
          <div className="p-3">
            <div className="flex gap-2 overflow-x-auto">
              {photos.map((photo, index) => (
                <button
                  key={photo.filename}
                  onClick={() => setCurrentIndex(index)}
                  className={`
                    flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-colors
                    ${index === currentIndex ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'}
                  `}
                >
                  <img loading="lazy"
                    src={photo.url || `/uploads/properties/${photo.filename}`}
                    alt={photo.altText || `Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-image.svg';
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}