import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

export default function Properties() {
  const { data: propertiesData, isLoading, error } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: () => fetch("/api/properties").then(res => res.json()),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">All Properties</h1>
          <div className="text-center py-12">
            <div className="text-lg">Loading properties...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">All Properties</h1>
          <div className="text-center py-12">
            <div className="text-lg text-red-600">Error loading properties. Please try again.</div>
          </div>
        </div>
      </div>
    );
  }

  const properties = propertiesData?.data || [];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">All Properties</h1>
        
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property: any) => (
              <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden border">
                <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                  {property.images && property.images.length > 0 ? (
                    <img 
                      src={Array.isArray(property.images) ? property.images[0] : 
                           typeof property.images === 'string' && property.images.startsWith('[') ?
                           JSON.parse(property.images)[0] : property.images}
                      alt={property.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-property.svg';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-400">
                      <img src="/placeholder-property.svg" alt="No image" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{property.title}</h3>
                  <p className="text-gray-600 mb-2">{property.city}, {property.country}</p>
                  {property.projectName && (
                    <p className="text-sm text-gray-500 mb-4">{property.projectName}</p>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-[#B87333]">
                      {property.price && property.price !== "0" 
                        ? `L.E ${Number(property.price).toLocaleString()}` 
                        : "Contact for Price"
                      }
                    </span>
                    <Link href={`/properties/${property.id}`}>
                      <button className="bg-[#B87333] hover:bg-[#A66323] text-white px-4 py-2 rounded-md transition-colors">
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No properties available at the moment.</p>
            <p className="text-gray-500 text-sm mt-2">Please check back later or contact us for assistance.</p>
          </div>
        )}
      </div>
    </div>
  );
}