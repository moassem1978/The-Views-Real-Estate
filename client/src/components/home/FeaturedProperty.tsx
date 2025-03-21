import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Property } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedProperty() {
  const { data: featuredProperties, isLoading, error } = useQuery<Property[]>({
    queryKey: ['/api/properties/featured', 1],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(`${queryKey[0]}?limit=1`);
      if (!res.ok) throw new Error("Failed to fetch featured property");
      return res.json();
    },
  });
  
  const featuredProperty = featuredProperties?.[0];
  
  // Function to parse the JSON string to array if needed
  const parseJsonArray = (jsonString: string | string[]): string[] => {
    if (Array.isArray(jsonString)) return jsonString;
    try {
      return JSON.parse(jsonString);
    } catch {
      return [];
    }
  };
  
  // Extract amenities
  const amenities = featuredProperty
    ? parseJsonArray(featuredProperty.amenities as unknown as string)
    : [];
  
  if (error) {
    return (
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center text-red-500">
          Error loading featured property.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-1/2">
              <Skeleton className="h-[400px] w-full rounded-lg" />
            </div>
            <div className="md:w-1/2">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-24 w-full mb-6" />
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, index) => (
                  <Skeleton key={index} className="h-24 w-full rounded-lg" />
                ))}
              </div>
              
              <div className="mt-8 flex gap-4">
                <Skeleton className="h-12 w-36" />
                <Skeleton className="h-12 w-36" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!featuredProperty) {
    return (
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center text-gray-500">
          No featured property available.
        </div>
      </div>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="md:w-1/2 relative">
            <div className="relative overflow-hidden rounded-lg shadow-xl">
              <img 
                src={parseJsonArray(featuredProperty.images as unknown as string)[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"} 
                alt={featuredProperty.title} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="hidden md:block absolute -bottom-8 -right-8 bg-white rounded-lg shadow-lg p-4 max-w-xs">
              <div className="flex space-x-3">
                <div className="bg-[#F5F0E6] p-2 rounded-md flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div>
                  <p className="font-serif font-semibold text-gray-800">Property of the Month</p>
                  <p className="text-sm text-gray-600">Featured for exceptional luxury and location</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2 flex flex-col justify-center">
            <span className="text-[#D4AF37] font-medium">Exclusive Offering</span>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-gray-800 mt-2">
              {featuredProperty.title}
            </h2>
            <p className="mt-4 text-gray-600 leading-relaxed">
              {featuredProperty.description.length > 250 
                ? `${featuredProperty.description.substring(0, 250)}...` 
                : featuredProperty.description}
            </p>
            
            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-[#F5F0E6] rounded-lg p-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Property Size</p>
                    <p className="font-semibold text-gray-800">{featuredProperty.squareFeet.toLocaleString()} sq ft</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#F5F0E6] rounded-lg p-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Bedrooms</p>
                    <p className="font-semibold text-gray-800">{featuredProperty.bedrooms} Bedrooms</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#F5F0E6] rounded-lg p-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Bathrooms</p>
                    <p className="font-semibold text-gray-800">{featuredProperty.bathrooms} Baths</p>
                  </div>
                </div>
              </div>
              
              {amenities.length > 0 && (
                <div className="bg-[#F5F0E6] rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">Amenities</p>
                      <p className="font-semibold text-gray-800">{amenities[0]}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {featuredProperty.views && (
                <div className="bg-[#F5F0E6] rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">View</p>
                      <p className="font-semibold text-gray-800">{featuredProperty.views}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-[#F5F0E6] rounded-lg p-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-semibold text-gray-800">{featuredProperty.city}, {featuredProperty.state}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link 
                href={`/properties/${featuredProperty.id}`} 
                className="px-6 py-3 bg-[#D4AF37] hover:bg-[#BF9B30] text-white font-medium rounded-md transition-colors shadow-md inline-flex items-center justify-center"
              >
                View Property Details
              </Link>
              <Link 
                href="/contact" 
                className="px-6 py-3 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white font-medium rounded-md transition-colors inline-flex items-center justify-center"
              >
                Schedule Viewing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
