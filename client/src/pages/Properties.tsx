import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Property, SearchFilters } from "../types";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PropertyList from "@/components/properties/PropertyList";
import PropertyFilter from "@/components/properties/PropertyFilter";
import ContactCTA from "@/components/home/ContactCTA";
import { Skeleton } from "@/components/ui/skeleton";

export default function Properties() {
  const [location] = useLocation();
  const [filters, setFilters] = useState<SearchFilters>({});
  
  // Extract query parameters from URL
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    
    const newFilters: SearchFilters = {};
    if (params.has('location')) newFilters.location = params.get('location') || undefined;
    if (params.has('propertyType')) newFilters.propertyType = params.get('propertyType') || undefined;
    if (params.has('minPrice')) newFilters.minPrice = parseInt(params.get('minPrice') || '0');
    if (params.has('maxPrice')) newFilters.maxPrice = parseInt(params.get('maxPrice') || '0');
    if (params.has('minBedrooms')) newFilters.minBedrooms = parseInt(params.get('minBedrooms') || '0');
    if (params.has('minBathrooms')) newFilters.minBathrooms = parseInt(params.get('minBathrooms') || '0');
    if (params.has('type')) newFilters.listingType = params.get('type') || undefined;
    if (params.has('international')) newFilters.international = params.get('international') === 'true';
    
    // Special case for type param (Primary/Resale)
    if (params.has('type')) {
      const typeValue = params.get('type');
      if (typeValue === 'Primary' || typeValue === 'Resale') {
        newFilters.listingType = typeValue;
      }
    }
    
    setFilters(newFilters);
  }, [location]);
  
  // Prepare query parameters for API call
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });
  
  const queryString = queryParams.toString();
  const apiUrl = queryString ? `/api/properties/search?${queryString}` : '/api/properties';
  
  // Define the paginated response type
  interface PaginatedResponse {
    data: Property[];
    totalCount: number;
    pageCount: number;
    page: number;
    pageSize: number;
  }
  
  const { data: propertiesResponse, isLoading, error } = useQuery<PaginatedResponse>({
    queryKey: [apiUrl],
  });
  
  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    
    // Update URL with new filters
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    
    const newQueryString = params.toString();
    const newPath = newQueryString ? `/properties?${newQueryString}` : '/properties';
    window.history.pushState(null, '', newPath);
  };
  
  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-3xl font-serif font-semibold text-gray-800 mb-4">
              Error Loading Properties
            </h1>
            <p className="text-gray-600 mb-8">
              We encountered an issue while loading the properties. Please try again later.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#D4AF37] hover:bg-[#BF9B30] text-white font-medium rounded-md transition-colors shadow-md inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Refresh Page
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-[#333333] py-16 relative">
          <div className="absolute inset-0 opacity-20">
            <img 
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
              alt="Luxury properties background" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#333333]/70 to-[#333333]/90"></div>
          
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-white leading-tight mb-4">
              Discover Our Luxury Properties
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Browse our exclusive collection of extraordinary homes and estates, each carefully selected to meet the highest standards of luxury living.
            </p>
          </div>
        </section>
        
        {/* Filters Section */}
        <section className="bg-white border-b border-[#E8DACB]">
          <div className="container mx-auto px-4 py-6">
            <PropertyFilter 
              currentFilters={filters} 
              onFilterChange={handleFilterChange} 
            />
          </div>
        </section>
        
        {/* Properties Grid */}
        <section className="py-12 bg-[#F9F6F2]">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-8 w-32" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md">
                      <Skeleton className="h-60 w-full" />
                      <div className="p-6">
                        <Skeleton className="h-6 w-28 mb-2" />
                        <Skeleton className="h-8 w-full mb-2" />
                        <Skeleton className="h-5 w-40 mb-4" />
                        <Skeleton className="h-px w-full mb-4" />
                        <div className="flex space-x-4">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <PropertyList properties={propertiesResponse?.data || []} filters={filters} />
            )}
          </div>
        </section>
        
        <ContactCTA />
      </main>
      <Footer />
    </div>
  );
}
