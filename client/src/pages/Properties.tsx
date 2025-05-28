import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Search, MapPin, Home, DollarSign } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function Properties() {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");

  // Parse URL parameters on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchTerm(params.get('search') || '');
    setPriceRange(params.get('priceRange') || '');
    setPropertyType(params.get('type') || '');
    setLocation(params.get('location') || '');
  }, []);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ["/api/properties", searchTerm, priceRange, propertyType, location],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (priceRange) params.append('priceRange', priceRange);
      if (propertyType) params.append('type', propertyType);
      if (location) params.append('location', location);
      
      const queryString = params.toString();
      const res = await fetch(`/api/properties${queryString ? '?' + queryString : ''}`);
      if (!res.ok) throw new Error('Failed to fetch properties');
      return res.json();
    },
  });

  const properties = response?.data || [];

  const handleSearch = () => {
    // Trigger a new search with current filters
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (priceRange) params.append('priceRange', priceRange);
    if (propertyType) params.append('type', propertyType);
    if (location) params.append('location', location);
    
    const queryString = params.toString();
    window.history.replaceState({}, '', `/properties${queryString ? '?' + queryString : ''}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">All Properties</h1>
            <p className="text-gray-600">Browse our complete collection of premium properties</p>
          </div>

          {/* Search Filters */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search Term */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                />
              </div>

              {/* Location */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent appearance-none"
                >
                  <option value="">All Locations</option>
                  <option value="Cairo">Cairo</option>
                  <option value="New Capital">New Capital</option>
                  <option value="North Coast">North Coast</option>
                  <option value="6th of October">6th of October</option>
                  <option value="Sheikh Zayed">Sheikh Zayed</option>
                  <option value="New Zayed">New Zayed</option>
                </select>
              </div>

              {/* Property Type */}
              <div className="relative">
                <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent appearance-none"
                >
                  <option value="">All Types</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Duplex">Duplex</option>
                  <option value="Studio">Studio</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent appearance-none"
                >
                  <option value="">Any Price</option>
                  <option value="0-5000000">Under 5M EGP</option>
                  <option value="5000000-10000000">5M - 10M EGP</option>
                  <option value="10000000-20000000">10M - 20M EGP</option>
                  <option value="20000000-50000000">20M - 50M EGP</option>
                  <option value="50000000-999999999">50M+ EGP</option>
                </select>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleSearch}
                className="inline-flex items-center px-8 py-3 bg-[#D4AF37] hover:bg-[#BF9B30] text-white font-semibold rounded-md transition-colors shadow-lg"
              >
                <Search className="h-5 w-5 mr-2" />
                Search Properties
              </button>
            </div>
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