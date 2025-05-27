import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function Properties() {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      const res = await fetch("/api/properties");
      if (!res.ok) throw new Error('Failed to fetch properties');
      return res.json();
    },
  });

  const properties = response?.data || [];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">All Properties</h1>
            <p className="text-gray-600">Browse our complete collection of premium properties</p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600">Loading properties...</div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-lg text-red-600">Error loading properties. Please try again.</div>
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property: any) => (
                <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden border hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {property.images && property.images.length > 0 ? (
                      <img 
                        src={Array.isArray(property.images) 
                          ? property.images[0] 
                          : typeof property.images === 'string' && property.images.startsWith('[')
                            ? JSON.parse(property.images)[0] 
                            : property.images
                        }
                        alt={property.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-property.svg';
                        }}
                      />
                    ) : (
                      <img src="/placeholder-property.svg" alt="No image" className="w-full h-full object-cover opacity-50" />
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">{property.title}</h3>
                    <p className="text-gray-600 mb-2">{property.city}, {property.country}</p>
                    
                    {property.projectName && (
                      <p className="text-sm text-blue-600 mb-2">Project: {property.projectName}</p>
                    )}
                    
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-[#D4AF37]">
                        {property.price?.toLocaleString() || 'Price on request'} L.E
                      </span>
                      {property.bedrooms && (
                        <span className="text-sm text-gray-500">{property.bedrooms} bed</span>
                      )}
                    </div>
                    
                    <Link 
                      href={`/property/${property.id}`}
                      className="block w-full bg-[#D4AF37] hover:bg-[#BF9B30] text-white text-center py-2 px-4 rounded-md transition-colors font-medium"
                    >
                      View Details
                    </Link>
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
      </main>
      <Footer />
    </div>
  );
}