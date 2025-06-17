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
          
          {/* Main Browse Button */}
          <div className="flex justify-center mb-8">
            <Button 
              onClick={handleBrowseAll}
              size="lg"
              className="bg-[#B87333] hover:bg-[#964B00] text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg transition-all duration-300"
            >
              <Search className="w-5 h-5 mr-2" />
              Browse All Properties
            </Button>
          </div>

          {/* Search filters description */}
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Use advanced search filters and browse by location, price range, property type, and more
          </p>
        </div>

        {/* Featured Properties Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 h-64 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : featuredProperties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredProperties.map((property) => (
                <Link key={property.id} href={`/properties/${property.id}`}>
                  <Card className="group cursor-pointer overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="relative overflow-hidden">
                      <img loading="lazy"
                        src={property.images && property.images.length > 0 
                          ? getResizedImageUrl(property.images[0], 'medium') 
                          : "/placeholder-property.svg"}
                        alt={property.title}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-property.svg";
                        }}
                      />
                      <div className="absolute top-4 right-4">
                        <span className="bg-[#B87333] text-white px-3 py-1 rounded-full text-sm font-medium">
                          {property.listingType}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-serif font-bold text-gray-800 mb-2 group-hover:text-[#B87333] transition-colors duration-300">
                        {property.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {property.description}
                      </p>
                      
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-2xl font-bold text-[#B87333]">
                          {property.price?.toLocaleString('en-EG', {
                            style: 'currency',
                            currency: 'EGP',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </span>
                        
                        <div className="flex gap-2 text-sm text-gray-500">
                          <span>{property.bedrooms} bed</span>
                          <span>•</span>
                          <span>{property.bathrooms} bath</span>
                          <span>•</span>
                          <span>{property.area} m²</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-500 text-sm">
                        📍 {property.location}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
            
            <div className="text-center">
              <Button 
                onClick={handleBrowseAll}
                variant="outline"
                size="lg"
                className="border-2 border-[#B87333] text-[#B87333] hover:bg-[#B87333] hover:text-white px-8 py-3 text-lg font-semibold transition-all duration-300"
              >
                View All Properties
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-8">
              No properties available at the moment. Please check back later.
            </p>
            <Button 
              onClick={handleBrowseAll}
              variant="outline"
              size="lg"
              className="border-2 border-[#B87333] text-[#B87333] hover:bg-[#B87333] hover:text-white px-8 py-3 text-lg font-semibold transition-all duration-300"
            >
              Browse Properties
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}