import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@/types";
import { formatPrice, getResizedImageUrl } from "@/lib/utils";
import { 
  ArrowRight, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Search,
  Filter,
  Home,
  Building,
  TreePine
} from "lucide-react";

const propertyTypes = [
  { key: "apartment", label: "Apartments", icon: Building, color: "bg-blue-500" },
  { key: "villa", label: "Villas", icon: Home, color: "bg-green-500" },
  { key: "townhouse", label: "Townhouses", icon: TreePine, color: "bg-purple-500" },
];

export default function BrowsePropertiesSection() {
  const [, navigate] = useLocation();
  const [selectedType, setSelectedType] = useState<string>("");
  
  // Fetch featured properties
  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get featured properties (limit to 6)
  const featuredProperties = properties.slice(0, 6);

  const handleSearchWithFilters = () => {
    const searchParams = new URLSearchParams();
    if (selectedType) {
      searchParams.set('type', selectedType);
    }
    navigate(`/properties?${searchParams.toString()}`);
  };

  const handleBrowseAll = () => {
    navigate('/properties');
  };

  const handleTypeFilter = (type: string) => {
    navigate(`/properties?type=${type}`);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-800 mb-4">
            Browse All Properties
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Discover your perfect home from our curated collection of luxury properties 
            across Egypt's most prestigious locations.
          </p>
          
          {/* Quick Type Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {propertyTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.key}
                  onClick={() => handleTypeFilter(type.key)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium transition-all duration-300 hover:scale-105 shadow-lg ${type.color}`}
                >
                  <IconComponent className="w-5 h-5" />
                  {type.label}
                </button>
              );
            })}
          </div>

          {/* Main Browse Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleBrowseAll}
              size="lg"
              className="bg-[#B87333] hover:bg-[#964B00] text-white px-8 py-4 text-lg font-semibold shadow-lg transition-all duration-300"
            >
              <Search className="w-5 h-5 mr-2" />
              Browse All Properties
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              onClick={() => navigate('/properties?advanced=true')}
              size="lg"
              variant="outline"
              className="border-2 border-[#B87333] text-[#B87333] hover:bg-[#B87333] hover:text-white px-8 py-4 text-lg font-semibold transition-all duration-300"
            >
              <Filter className="w-5 h-5 mr-2" />
              Advanced Search
            </Button>
          </div>
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
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-[#B87333] text-white">
                          {property.listingType || "For Sale"}
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge variant="secondary" className="bg-white/90 text-gray-800">
                          {formatPrice(property.price)}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-serif font-semibold text-gray-800 mb-2 group-hover:text-[#B87333] transition-colors">
                        {property.title}
                      </h3>
                      <div className="flex items-center text-gray-600 mb-3">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{property.city}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          {property.bedrooms && (
                            <div className="flex items-center gap-1">
                              <Bed className="w-4 h-4" />
                              <span>{property.bedrooms}</span>
                            </div>
                          )}
                          {property.bathrooms && (
                            <div className="flex items-center gap-1">
                              <Bath className="w-4 h-4" />
                              <span>{property.bathrooms}</span>
                            </div>
                          )}
                          {property.area && (
                            <div className="flex items-center gap-1">
                              <Square className="w-4 h-4" />
                              <span>{property.area}m²</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* View All Properties Link */}
            <div className="text-center">
              <Button 
                onClick={handleBrowseAll}
                size="lg"
                variant="outline"
                className="border-2 border-[#B87333] text-[#B87333] hover:bg-[#B87333] hover:text-white px-8 py-3 font-semibold transition-all duration-300"
              >
                View All {properties.length} Properties
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Properties Available
            </h3>
            <p className="text-gray-500 mb-6">
              Properties are being added regularly. Check back soon or contact us for exclusive listings.
            </p>
            <Link href="/contact">
              <Button className="bg-[#B87333] hover:bg-[#964B00] text-white">
                Contact Us for Exclusive Listings
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}