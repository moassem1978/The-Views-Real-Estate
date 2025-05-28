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
    const searchParams = location.split('?')[1];
    if (!searchParams) return;
    
    const params = new URLSearchParams(searchParams);
    const newFilters: SearchFilters = {};
    
    if (params.has('location')) newFilters.location = params.get('location') || undefined;
    if (params.has('propertyType')) newFilters.propertyType = params.get('propertyType') || undefined;
    if (params.has('minPrice')) newFilters.minPrice = parseInt(params.get('minPrice') || '0');
    if (params.has('maxPrice')) newFilters.maxPrice = parseInt(params.get('maxPrice') || '0');
    if (params.has('minBedrooms')) newFilters.minBedrooms = parseInt(params.get('minBedrooms') || '0');
    if (params.has('minBathrooms')) newFilters.minBathrooms = parseInt(params.get('minBathrooms') || '0');
    if (params.has('listingType')) newFilters.listingType = params.get('listingType') || undefined;
    if (params.has('type')) newFilters.listingType = params.get('type') || undefined;
    if (params.has('international')) newFilters.international = params.get('international') === 'true';

    setFilters(newFilters);
  }, [location]);

  // Fetch properties - simple approach
  const { data: propertiesData, isLoading, error } = useQuery<{ data: Property[]; totalCount: number }>({
    queryKey: ['/api/properties'],
  });

  const properties = propertiesData?.data || [];
  const totalCount = propertiesData?.totalCount || 0;

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    
    // Update URL with new filters
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    
    const queryStr = params.toString();
    const newPath = queryStr ? `/properties?${queryStr}` : '/properties';
    window.history.pushState({}, '', newPath);
  };

  // SEO for properties page
  useEffect(() => {
    let title = "Luxury Properties Egypt, Dubai & Red Sea for Sale | استثمار عقاري";
    let description = "Browse premium luxury properties in Egypt, Dubai & Red Sea. Find villas, apartments, penthouses with The Views Real Estate. عقارات للبيع في مصر - EMAAR Dubai, Red Sea Global projects. Investment properties with guaranteed returns.";
    
    if (filters.propertyType) {
      title = `${filters.propertyType}s for Sale in Egypt`;
      description = `Find luxury ${filters.propertyType.toLowerCase()}s for sale in Egypt. Premium properties with The Views Real Estate.`;
    }
    
    if (filters.location) {
      title = `Properties for Sale in ${filters.location}, Egypt`;
      description = `Discover luxury properties in ${filters.location}, Egypt. Premium real estate with expert guidance from The Views Real Estate.`;
    }
    
    if (filters.propertyType && filters.location) {
      title = `${filters.propertyType}s for Sale in ${filters.location}, Egypt`;
      description = `Find luxury ${filters.propertyType.toLowerCase()}s in ${filters.location}, Egypt. Premium properties with The Views Real Estate consultancy.`;
    }
    
    if (totalCount > 0) {
      title += ` | ${totalCount} Properties Available`;
    }
    
    title += " | The Views Real Estate";
    
    document.title = title;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);
  }, [filters, totalCount]);

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              Failed to load properties. Please try refreshing the page.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#D4AF37] hover:bg-[#BF9B30] text-white font-medium rounded-md transition-colors shadow-md"
            >
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
              src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
              alt="Luxury properties in Egypt" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#333333]/70 to-[#333333]/90"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Premium Properties
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Discover luxury real estate in Egypt's most prestigious developments
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#D4AF37] rounded-full"></div>
                {totalCount} Properties Available
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#D4AF37] rounded-full"></div>
                Premium Locations
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#D4AF37] rounded-full"></div>
                Expert Guidance
              </span>
            </div>
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
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {isLoading ? 'Loading Properties...' : `${totalCount} Properties Found`}
              </h2>
              {totalCount > 0 && !isLoading && (
                <p className="text-gray-600">
                  Showing premium luxury properties
                </p>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
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
            ) : properties.length > 0 ? (
              <PropertyList properties={properties} filters={filters} />
            ) : (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No Properties Found</h3>
                  <p className="text-gray-600 mb-6">
                    We couldn't find any properties matching your criteria. Try adjusting your filters or browse all properties.
                  </p>
                  <button
                    onClick={() => {
                      setFilters({});
                      window.history.pushState({}, '', '/properties');
                    }}
                    className="px-6 py-3 bg-[#D4AF37] hover:bg-[#BF9B30] text-white font-medium rounded-md transition-colors"
                  >
                    Browse All Properties
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <ContactCTA />
      </main>
      <Footer />
    </div>
  );
}