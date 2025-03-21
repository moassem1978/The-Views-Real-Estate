import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Property } from "@/types";
import PropertyCard from "@/components/properties/PropertyCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedProperties() {
  const { data: properties, isLoading, error } = useQuery<Property[]>({
    queryKey: ['/api/properties/featured'],
  });

  const renderSkeletons = () => {
    return Array(3).fill(0).map((_, index) => (
      <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md">
        <Skeleton className="h-60 w-full" />
        <div className="p-6">
          <Skeleton className="h-6 w-24 mb-2" />
          <Skeleton className="h-7 w-full mb-2" />
          <Skeleton className="h-5 w-36 mb-4" />
          <Skeleton className="h-px w-full mb-4" />
          <div className="flex justify-between">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </div>
    ));
  };

  if (error) {
    return (
      <div className="py-16 bg-[#F9F6F2]">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-500">
            Error loading properties: {(error as Error).message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-[#F9F6F2]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-[#D4AF37] font-medium">Exclusive Collection</span>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-gray-800 mt-2">Featured Properties</h2>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/properties" className="inline-flex items-center text-[#D4AF37] hover:text-[#BF9B30] font-medium transition-colors">
              View All Properties
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            renderSkeletons()
          ) : properties && properties.length > 0 ? (
            properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-500 py-12">
              No featured properties found.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
