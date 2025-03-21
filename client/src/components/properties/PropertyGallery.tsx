import { useState } from "react";
import PropertyImage from "./PropertyImage";

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export default function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const handleThumbnailClick = (index: number) => {
    setActiveImage(index);
  };
  
  const handlePrevious = () => {
    setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500">No images available for this property</p>
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
          src={images[activeImage]} 
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
          {activeImage + 1} / {images.length}
        </div>
      </div>
      
      {/* Thumbnails - Only show in non-fullscreen mode */}
      {!isFullscreen && (
        <div className="container mx-auto px-4 -mt-12 relative z-10">
          <div className="bg-white shadow-md rounded-md p-3">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
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
