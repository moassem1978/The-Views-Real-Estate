import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Property } from "@/types";
import { formatPrice } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [mainImage, setMainImage] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  
  useEffect(() => {
    // Set the main image when the property data loads
    const images = getImages();
    const firstImage = images.length > 0 ? images[0] : '';
    setMainImage(getFullImageUrl(firstImage));
  }, [property]);
  
  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };
  
  // Parse images from JSON string if necessary
  const getImages = () => {
    // If it's an array, use it directly
    if (Array.isArray(property.images)) {
      return property.images;
    }
    
    // Try to parse as JSON if it's a string
    try {
      return JSON.parse(property.images as unknown as string);
    } catch {
      // Return empty array if parsing fails
      return [];
    }
  };
  
  // Add a proper URL prefix to image paths if needed
  const getFullImageUrl = (imagePath: string) => {
    // Check if the path already starts with http, https, or a forward slash
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('/')) {
      return imagePath;
    }
    // Otherwise, add a forward slash
    return '/' + imagePath;
  };
  
  // Handle image load error
  const handleImageError = () => {
    console.log('Image failed to load:', mainImage);
    setImageError(true);
  };

  return (
    <div className="property-card bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group">
      <Link href={`/properties/${property.id}`} className="block relative overflow-hidden">
        <div className="aspect-w-16 aspect-h-10 relative overflow-hidden">
          {imageError ? (
            <div className="w-full h-60 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No image available</span>
            </div>
          ) : (
            <img 
              src={mainImage} 
              alt={property.title} 
              className="w-full h-60 object-cover transform transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              onError={handleImageError}
            />
          )}
        </div>
        {property.isFeatured && (
          <span className="absolute top-4 left-4 px-3 py-1 bg-[#D4AF37] text-white text-sm font-medium rounded">Featured</span>
        )}
        {property.isNewListing && (
          <span className="absolute top-4 left-4 px-3 py-1 bg-[#6E2639] text-white text-sm font-medium rounded">New Listing</span>
        )}
        <button 
          className="absolute top-4 right-4 h-9 w-9 flex items-center justify-center bg-white/80 backdrop-blur-sm hover:bg-white text-gray-800 hover:text-[#D4AF37] rounded-full transition-colors shadow-sm"
          onClick={toggleFavorite}
        >
          {isFavorite ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#D4AF37]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>
      </Link>
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[#D4AF37] font-medium">{formatPrice(property.price)}</span>
            <h3 className="mt-1 font-serif text-xl font-semibold text-gray-800 leading-tight">{property.title}</h3>
            <p className="mt-1 text-gray-600 flex items-center text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {property.city}, {property.state}
            </p>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between border-t border-[#E8DACB] pt-4">
          <div className="flex space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              {property.bedrooms} beds
            </span>
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              {property.bathrooms} baths
            </span>
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              {property.builtUpArea 
                ? `${property.builtUpArea.toLocaleString()} BUA` 
                : property.squareFeet 
                  ? `${property.squareFeet.toLocaleString()} sq ft`
                  : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
