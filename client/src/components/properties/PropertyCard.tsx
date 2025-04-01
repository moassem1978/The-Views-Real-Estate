import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Property } from "@/types";
import { formatPrice, parseJsonArray } from "@/lib/utils";
import PropertyImage from "@/components/properties/PropertyImage";

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
    console.log("Property images array:", images);
    const firstImage = images.length > 0 ? images[0] : '';
    setMainImage(firstImage);
  }, [property]);
  
  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };
  
  // Parse images from JSON string if necessary
  const getImages = () => {
    // Use our utility function to safely parse the images array
    return parseJsonArray(property.images);
  };
  
  // We no longer need these functions as we now use utilities from lib/utils.ts
  // Keeping imageError state for backward compatibility

  return (
    <div className="property-card bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group">
      <Link href={`/properties/${property.id}`} className="block relative overflow-hidden">
        <div className="group-hover:after:opacity-100 after:opacity-0 after:absolute after:inset-0 after:bg-black/20 after:transition-opacity after:duration-300 relative h-64 overflow-hidden rounded-t-lg">
          <PropertyImage 
            src={mainImage} 
            alt={property.title} 
            priority={property.isFeatured}
            className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Price Tag */}
          <div className="absolute bottom-0 left-0 z-10 px-3 py-1.5 bg-[#B87333] text-white font-medium rounded-tr-md">
            {property.price.toLocaleString()} L.E
          </div>
        </div>
        
        {/* Status badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {/* Listing Type Badge - Always shown at the top */}
          <span className={`px-3 py-1 text-white text-sm font-medium rounded ${property.listingType === 'Primary' ? 'bg-blue-600' : 'bg-amber-600'}`}>
            {property.listingType}
          </span>
          
          {property.isFeatured && (
            <span className="px-3 py-1 bg-[#D4AF37] text-white text-sm font-medium rounded">Featured</span>
          )}
          {property.isNewListing && (
            <span className="px-3 py-1 bg-[#6E2639] text-white text-sm font-medium rounded">New Listing</span>
          )}
        </div>
        
        {/* Contact buttons */}
        <div className="absolute bottom-20 right-4 z-10 flex flex-col gap-2">
          <button className="h-9 w-9 flex items-center justify-center bg-white/90 backdrop-blur-sm hover:bg-white text-green-600 hover:text-green-700 rounded-full transition-colors shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          <button className="h-9 w-9 flex items-center justify-center bg-white/90 backdrop-blur-sm hover:bg-white text-green-600 hover:text-green-700 rounded-full transition-colors shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="h-5 w-5 fill-current">
              <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
            </svg>
          </button>
        </div>
        
        {/* Favorite button */}
        <button 
          className="absolute top-4 right-4 h-9 w-9 flex items-center justify-center bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 hover:text-[#D4AF37] rounded-full transition-colors shadow-md z-10"
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
            {/* Property Type Badge - only show Property Type in details section */}
            <div className="flex gap-2 mb-1">
              {property.propertyType && (
                <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                  {property.propertyType}
                </span>
              )}
            </div>
            
            {/* Price Info */}
            <span className="text-[#D4AF37] font-medium">{formatPrice(property.price)}</span>
            
            {/* Payment Details */}
            {property.listingType === 'Primary' && property.installmentAmount && (
              <div className="text-xs text-gray-600 mt-1">
                <span className="font-medium">Installments:</span> {formatPrice(property.installmentAmount)}/month
                {property.installmentPeriod && (
                  <span className="ml-1">({Math.floor(property.installmentPeriod/12)} years)</span>
                )}
              </div>
            )}
            {property.downPayment && (
              <div className="text-xs text-gray-600">
                <span className="font-medium">Down Payment:</span> {formatPrice(property.downPayment)}
              </div>
            )}
            {property.isFullCash && (
              <div className="text-xs font-medium text-emerald-700">Full Cash Payment</div>
            )}
            
            <h3 className="mt-1 font-serif text-xl font-semibold text-gray-800 leading-tight">{property.title}</h3>
            
            {/* Project & Developer Info */}
            {(property.projectName || property.developerName) && (
              <div className="mt-1 text-xs text-gray-700">
                {property.projectName && <span className="font-medium">Project: {property.projectName}</span>}
                {property.projectName && property.developerName && <span className="mx-1">•</span>}
                {property.developerName && <span>By {property.developerName}</span>}
              </div>
            )}
            
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
                ? `${property.builtUpArea.toLocaleString()} m²` 
                : property.plotSize
                  ? `${property.plotSize.toLocaleString()} m²`
                  : property.squareFeet 
                    ? `${property.squareFeet.toLocaleString()} m²`
                    : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
