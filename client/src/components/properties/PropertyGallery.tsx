import { useState, useEffect } from "react";
import PropertyImage from "./PropertyImage";

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export default function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [processedImages, setProcessedImages] = useState<string[]>([]);
  
  // Process and normalize all images when the component first renders
  // This ensures we're using the same path format for all images
  useEffect(() => {
    if (!images || images.length === 0) return;
    
    // Process all image paths to ensure uniform format
    const normalizedImages = images.map(img => {
      // Remove quotes and normalize slashes
      return img.replace(/"/g, '').replace(/\\/g, '/');
    });
    
    setProcessedImages(normalizedImages);
  }, [images]);
  
  const handleThumbnailClick = (index: number) => {
    setActiveImage(index);
  };
  
  const handlePrevious = () => {
    const imageCount = processedImages.length > 0 ? processedImages.length : images.length;
    setActiveImage((prev) => (prev === 0 ? imageCount - 1 : prev - 1));
  };
  
  const handleNext = () => {
    const imageCount = processedImages.length > 0 ? processedImages.length : images.length;
    setActiveImage((prev) => (prev === imageCount - 1 ? 0 : prev + 1));
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // If no images are provided, show a placeholder
  if (!images || images.length === 0) {
    return (
      <div className="image-gallery-wrapper bg-[#F5F0E6] property-image-gallery">
        <div className="container mx-auto px-4 py-8 flex items-center justify-center h-full">
          <div className="text-center">
            <div className="h-16 w-16 bg-[#B87333] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h3 className="text-[#B87333] font-serif text-xl mb-2">The Views Real Estate</h3>
            <p className="text-gray-600">Images for this property are coming soon</p>
            <p className="text-gray-500 text-sm mt-1">Please check back later or contact us for more information</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`image-gallery-wrapper ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      {/* Main Image */}
      <div className={`relative ${isFullscreen ? 'h-full' : 'property-image-gallery'}`}>
        <PropertyImage 
          src={processedImages[activeImage] || images[activeImage]} 
          alt={`${title} - Image ${activeImage + 1}`} 
          priority={activeImage === 0}
          className={`w-full ${isFullscreen ? 'h-full' : 'h-[500px]'} object-cover`}
        />
        
        {/* Image Controls */}
        <div className="image-gallery-controls">
          <button 
            onClick={handlePrevious}
            className="image-gallery-control"
            aria-label="Previous image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            onClick={handleNext}
            className="image-gallery-control"
            aria-label="Next image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <button 
            onClick={toggleFullscreen}
            className="image-gallery-control"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Image counter */}
        <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 text-white text-sm rounded-md">
          {activeImage + 1} / {processedImages.length || images.length}
        </div>
      </div>
      
      {/* Thumbnails - Only show in non-fullscreen mode */}
      {!isFullscreen && (
        <div className="container mx-auto px-4 -mt-12 relative z-10">
          <div className="bg-white shadow-md rounded-md p-3">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {(processedImages.length > 0 ? processedImages : images).map((image, index) => (
                <div 
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  className={`image-thumbnail h-20 w-20 md:h-24 md:w-24 shrink-0 rounded-md border-2 overflow-hidden ${index === activeImage ? 'border-[#D4AF37] active' : 'border-transparent'}`}
                >
                  <PropertyImage 
                    src={image} 
                    alt={`${title} - Thumbnail ${index + 1}`} 
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
