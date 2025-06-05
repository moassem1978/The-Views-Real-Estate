import React from "react";
import PropertyImage from "./PropertyImage";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  photos: string[];
  listingType?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: string;
}

interface ListingCardProps {
  listing: Listing;
  priority?: boolean;
}

const ListingCard = ({ listing, priority = false }: ListingCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const truncateDescription = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden">
        <PropertyImage
          src={listing.photos}
          alt={listing.title}
          className="w-full h-full"
          index={0}
        />
        {listing.listingType && (
          <Badge 
            variant={listing.listingType === 'Primary' ? 'default' : 'secondary'}
            className="absolute top-3 left-3"
          >
            {listing.listingType}
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {listing.title}
        </h3>

        <p className="text-2xl font-bold text-blue-600 mb-2">
          {formatPrice(listing.price)}
        </p>

        {(listing.bedrooms || listing.bathrooms || listing.area) && (
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            {listing.bedrooms && (
              <span className="flex items-center gap-1">
                🛏️ {listing.bedrooms} bed{listing.bedrooms !== 1 ? 's' : ''}
              </span>
            )}
            {listing.bathrooms && (
              <span className="flex items-center gap-1">
                🚿 {listing.bathrooms} bath{listing.bathrooms !== 1 ? 's' : ''}
              </span>
            )}
            {listing.area && (
              <span className="flex items-center gap-1">
                📐 {listing.area}
              </span>
            )}
          </div>
        )}

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {truncateDescription(listing.description)}
        </p>

        <a 
          href={`/listing/${listing.id}`}
          className="inline-block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-200"
        >
          View Details
        </a>
      </CardContent>
    </Card>
  );
};

export default ListingCard;