import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Link } from "wouter";
import { getResizedImageUrl } from "@/lib/utils";

// Define types for property data
interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  listingType: string;
  propertyType: string;
}

export default function BrowsePropertiesSection() {
  const [, navigate] = useLocation();
  
  // Fetch featured properties
  const { data: propertiesResponse, isLoading } = useQuery<{data: Property[]}>({
    queryKey: ['/api/properties'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Extract properties array from API response
  const properties = propertiesResponse?.data || [];
  
  // Get featured properties (limit to 6)
  const featuredProperties = Array.isArray(properties) ? properties.slice(0, 6) : [];

  const handleBrowseAll = () => {
    navigate('/properties');
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Browse our exclusive collection of extraordinary homes and estates, each carefully selected to meet the highest standards of luxury living.
          </p>
          
          {/* Main Browse Button - Bigger and Centered */}
          <div className="flex justify-center mb-8">
            <Button 
              onClick={handleBrowseAll}
              size="lg"
              className="bg-[#B87333] hover:bg-[#964B00] text-white px-12 py-6 text-xl font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <Search className="w-6 h-6 mr-3" />
              Browse All Properties
            </Button>
          </div>

          {/* Search filters description */}
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Use advanced search filters and browse by location, price range, property type, and more
          </p>
        </div>

        {/* No property cards - just the section as intended */}
      </div>
    </section>
  );
}