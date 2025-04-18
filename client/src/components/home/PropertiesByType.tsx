import React, { useState, useMemo, memo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Property } from "../../types";
import { ArrowRight, BedDouble, Bath, Grid2X2, ChevronRight } from "lucide-react";
import { formatPrice, getImageUrl } from "@/lib/utils";
import PropertyImage from "@/components/properties/PropertyImage";

// Simple loading skeleton component separate from main component
const LoadingSkeleton = () => (
  <section className="py-16 bg-white">
    <div className="container mx-auto px-4">
      <div className="flex justify-center mb-8">
        <div className="h-10 w-56 bg-gray-200 animate-pulse rounded"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#F9F6F2] rounded-lg shadow-md overflow-hidden">
            <div className="h-56 bg-gray-300 animate-pulse"></div>
            <div className="p-6">
              <div className="flex justify-between mb-3">
                <div className="h-6 w-24 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
              </div>
              <div className="h-7 w-full bg-gray-200 animate-pulse rounded mb-3"></div>
              <div className="h-5 w-32 bg-gray-200 animate-pulse rounded mb-4"></div>
              <div className="h-10 w-full bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Memoized property card to prevent unnecessary re-renders
const PropertyCard = memo(({ property }: { property: Property }) => {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <div className="h-56 overflow-hidden relative">
        <PropertyImage
          src={property.images && property.images.length > 0 ? 
            (typeof property.images[0] === 'string' ? property.images[0] : '') : 
            '/placeholder-property.svg'}
          alt={property.title}
          className="h-full"
          priority={property.isFeatured}
        />
        {property.isNewListing && (
          <Badge className="absolute top-3 left-3 bg-green-600 text-white">
            New
          </Badge>
        )}
        <Badge className="absolute top-3 right-3 bg-[#B87333] text-white">
          {property.listingType}
        </Badge>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="bg-[#F9F6F2] text-gray-700">
            {property.propertyType}
          </Badge>
          <span className="text-lg font-semibold text-[#B87333]">
            {property.price.toLocaleString()} L.E
          </span>
        </div>
        <h3 className="font-semibold text-xl mt-2 font-serif">
          {property.title}
        </h3>
        <p className="text-gray-500 text-sm">
          {property.address}, {property.city}
        </p>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex justify-between text-gray-700">
          <div className="flex items-center gap-1">
            <BedDouble size={18} />
            <span>{property.bedrooms} {property.bedrooms > 1 ? 'Beds' : 'Bed'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath size={18} />
            <span>{property.bathrooms} {property.bathrooms > 1 ? 'Baths' : 'Bath'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Grid2X2 size={18} />
            <span>
              {property.builtUpArea || property.plotSize || 0} m²
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button
          asChild
          className="w-full bg-[#B87333] hover:bg-[#B87333]/90 text-white"
        >
          <Link href={`/properties/${property.id}`}>
            View Details <ArrowRight size={16} className="ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
});

// Tab content component to split rendering logic
const PropertyTabContent = memo(({ 
  properties, 
  displayCount, 
  loadMore 
}: { 
  properties: Property[], 
  displayCount: number, 
  loadMore: () => void 
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.slice(0, displayCount).map((property: Property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
      
      {properties.length > displayCount && (
        <div className="mt-10 text-center">
          <Button 
            onClick={loadMore}
            variant="outline"
            className="border-[#B87333] text-[#B87333] hover:bg-[#B87333] hover:text-white"
          >
            Load More Properties
          </Button>
        </div>
      )}
    </>
  );
});

export default function PropertiesByType() {
  const [displayCount, setDisplayCount] = useState(3); // Reduced initial load
  
  // Define the paginated response type
  interface PaginatedResponse {
    data: Property[];
    totalCount: number;
    pageCount: number;
    page: number;
    pageSize: number;
  }
  
  // Optimized query with increased stale time
  const { data: propertiesResponse, isLoading } = useQuery<PaginatedResponse>({
    queryKey: ['/api/properties'],
    staleTime: 300000, // Increased to 5 minutes
  });

  // Filter and organize properties by listing type
  const { primaryProperties, resaleProperties } = useMemo(() => {
    // Extract the actual properties array from the response
    const properties = propertiesResponse?.data;
    
    if (!properties || !Array.isArray(properties)) {
      return { primaryProperties: [], resaleProperties: [] };
    }

    const primary = properties
      .filter((property: Property) => 
        property.listingType === "Primary" && property.isFeatured
      )
      .sort((a: Property, b: Property) => 
        // Sort by newest first
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    
    const resale = properties
      .filter((property: Property) => 
        property.listingType === "Resale" && property.isFeatured
      )
      .sort((a: Property, b: Property) => 
        // Sort by newest first
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    
    return { primaryProperties: primary, resaleProperties: resale };
  }, [propertiesResponse]);

  const loadMore = () => {
    setDisplayCount(prev => prev + 3);
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const allFeaturedCount = primaryProperties.length + resaleProperties.length;
  
  if (allFeaturedCount === 0) {
    return null;
  }

  const defaultTab = primaryProperties.length > 0 ? "primary" : "resale";

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <h2 className="text-sm uppercase tracking-wider text-[#B87333] font-semibold mb-2 text-center md:text-left">
              Our Featured Collection
            </h2>
            <h3 className="text-3xl font-serif font-semibold text-gray-900 text-center md:text-left">
              Exclusive Properties
            </h3>
          </div>
          
          <Button
            asChild
            variant="outline"
            className="mt-4 md:mt-0 border-[#B87333] text-[#B87333] hover:bg-[#B87333] hover:text-white self-center md:self-auto"
          >
            <Link href="/properties">
              Browse All Properties <ChevronRight size={16} />
            </Link>
          </Button>
        </div>
        
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 mb-8">
            <TabsTrigger 
              value="primary"
              disabled={primaryProperties.length === 0}
              className="data-[state=active]:bg-[#B87333] data-[state=active]:text-white"
            >
              Primary Projects
            </TabsTrigger>
            <TabsTrigger 
              value="resale"
              disabled={resaleProperties.length === 0}
              className="data-[state=active]:bg-[#B87333] data-[state=active]:text-white"
            >
              Resale Units
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="primary" className="mt-0">
            <PropertyTabContent 
              properties={primaryProperties} 
              displayCount={displayCount} 
              loadMore={loadMore} 
            />
          </TabsContent>
          
          <TabsContent value="resale" className="mt-0">
            <PropertyTabContent 
              properties={resaleProperties} 
              displayCount={displayCount} 
              loadMore={loadMore} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}