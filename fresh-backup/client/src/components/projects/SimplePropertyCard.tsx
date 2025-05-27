import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, BedDouble, Bath } from "lucide-react"; 
import { parseJsonArray } from "@/lib/utils";

interface Property {
  id: number;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  price: number;
  downPayment: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  builtUpArea: number;
  listingType: string;
  images: string[];
}

interface SimplePropertyCardProps {
  property: Property;
}

const SimplePropertyCard: React.FC<SimplePropertyCardProps> = ({ property }) => {
  const [mainImage, setMainImage] = useState<string>('');

  useEffect(() => {
    // Set the main image when the property data loads
    const images = getImages() || [];
    const firstImage = images.length > 0 ? images[0] : '/placeholder-property.svg';
    setMainImage(firstImage);
  }, [property]);

  // Parse images from JSON string if necessary
  const getImages = () => {
    return parseJsonArray(property.images);
  };

  // Format price with commas
  const formatPrice = (price: number) => {
    if (price === 0) return ""; // Return empty string for zero values
    return price.toLocaleString();
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <img
          src={mainImage}
          alt={property.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder-property.svg";
          }}
        />
        <div className="absolute top-0 right-0 p-2">
          <Badge className={property.listingType === 'Primary' ? 'bg-blue-600' : 'bg-amber-600'}>
            {property.listingType}
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <h3 className="text-white font-medium truncate">{property.title}</h3>
        </div>
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <div className="mb-2">
          <Badge variant="outline" className="bg-gray-100 text-gray-700">
            {property.propertyType}
          </Badge>
        </div>
        
        <div className="mt-1 mb-2">
          <p className="text-xl font-semibold text-primary">{property.price === 0 ? "L.E" : `${formatPrice(property.price)} L.E`}</p>
          {property.downPayment && property.listingType === 'Primary' && (
            <p className="text-sm text-gray-500">
              Down Payment: {formatPrice(property.downPayment)} L.E
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <BedDouble className="h-4 w-4 mr-1" />
            <span>{property.bedrooms} beds</span>
          </div>
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-1" />
            <span>{property.bathrooms} baths</span>
          </div>
          <div className="flex items-center">
            <Building className="h-4 w-4 mr-1" />
            <span>{property.builtUpArea} m²</span>
          </div>
        </div>
        
        <div className="mt-auto">
          <Link href={`/properties/${property.id}`}>
            <Button 
              className="w-full bg-[#964B00] hover:bg-[#B87333] text-white"
            >
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default SimplePropertyCard;