
import React from "react";
import { Link } from "wouter";
import { Property } from "../../types";
import { formatPrice } from "@/lib/utils";
import PropertyImage from "./PropertyImage";

interface ListingCardProps {
  listing: Property;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const truncateDescription = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
      <Link href={`/properties/${listing.id}`} className="block">
        <div className="relative h-48 overflow-hidden">
          <PropertyImage
            src={listing.images}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Price Badge */}
          <div className="absolute bottom-0 left-0 bg-[#B87333] text-white px-3 py-1.5 font-semibold rounded-tr-md">
            {formatPrice(listing.price)}
          </div>

          {/* Listing Type Badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-[#B87333] text-white text-xs font-medium rounded">
              {listing.listingType}
            </span>
          </div>

          {/* Featured Badge */}
          {listing.isFeatured && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 bg-[#D4AF37] text-white text-xs font-medium rounded">
                Featured
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          {/* Property Type */}
          {listing.propertyType && (
            <div className="mb-2">
              <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                {listing.propertyType}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="font-serif text-lg font-semibold text-gray-800 mb-2 line-clamp-2 leading-tight">
            {listing.title}
          </h3>

          {/* Location */}
          <p className="text-gray-600 text-sm mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {listing.city}, {listing.state}
          </p>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-3 leading-relaxed">
            {truncateDescription(listing.description || "")}
          </p>

          {/* Property Details */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              {listing.bedrooms} beds
            </span>
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              {listing.bathrooms} baths
            </span>
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              {listing.builtUpArea 
                ? `${listing.builtUpArea.toLocaleString()} m²` 
                : listing.plotSize
                  ? `${listing.plotSize.toLocaleString()} m²`
                  : "N/A"}
            </span>
          </div>

          {/* Payment Info for Primary listings */}
          {listing.listingType === 'Primary' && listing.installmentAmount && (
            <div className="text-xs text-gray-600 mb-3">
              <span className="font-medium">Installments:</span> {formatPrice(listing.installmentAmount)}/month
              {listing.installmentPeriod && (
                <span className="ml-1">({Math.floor(listing.installmentPeriod/12)} years)</span>
              )}
            </div>
          )}

          {listing.downPayment && (
            <div className="text-xs text-gray-600 mb-3">
              <span className="font-medium">Down Payment:</span> {formatPrice(listing.downPayment)}
            </div>
          )}

          {listing.isFullCash && (
            <div className="text-xs font-medium text-emerald-700 mb-3">Full Cash Payment</div>
          )}

          {/* Reference Number */}
          {(listing.references || listing.reference_number || listing.reference) && (
            <div className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded inline-block mb-3">
              Ref: {listing.references || listing.reference_number || listing.reference}
            </div>
          )}

          {/* View Details Button */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <span className="inline-block w-full text-center bg-[#B87333] hover:bg-[#A0632D] text-white font-medium py-2 px-4 rounded transition-colors duration-200">
              View Details
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ListingCard;
