import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

export default function Properties() {
  const { data: propertiesData, isLoading } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: () => fetch("/api/properties").then(res => res.json()),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading properties...</div>
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
              <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {property.images?.[0] ? (
                    <img 
                      src={property.images[0]} 
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                  <p className="text-gray-600 mb-2">{property.city}, {property.country}</p>
                  <p className="text-sm text-gray-500 mb-4">{property.projectName}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">
                      {property.price ? `L.E ${Number(property.price).toLocaleString()}` : "Contact for Price"}
                    </span>
                    <Link href={`/properties/${property.id}`}>
                      <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md">
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
          </div>
        )}
      </div>
    </div>
  );
}