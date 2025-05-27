
import { Link } from "wouter";
import { useState } from "react";
import { Search, MapPin, Home, DollarSign } from "lucide-react";

export default function PropertySearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (priceRange) params.append('priceRange', priceRange);
    if (propertyType) params.append('type', propertyType);
    if (location) params.append('location', location);
    
    const queryString = params.toString();
    window.location.href = `/properties${queryString ? '?' + queryString : ''}`;
  };

  return (
    <section className="bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg -mt-16 relative z-10 p-6 md:p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-semibold text-gray-800 mb-4">Find Your Perfect Property</h2>
            <p className="text-gray-600 mb-6">Browse our exclusive collection of extraordinary homes and estates, each carefully selected to meet the highest standards of luxury living.</p>
            
            {/* Advanced Search Form */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Search Term */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search properties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#B87333] focus:border-transparent"
                  />
                </div>

                {/* Location */}
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#B87333] focus:border-transparent appearance-none"
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#B87333] focus:border-transparent appearance-none"
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#B87333] focus:border-transparent appearance-none"
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

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleSearch}
                  className="inline-flex items-center px-8 py-3 bg-[#B87333] hover:bg-[#A66323] text-white font-semibold rounded-md transition-colors shadow-lg"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search Properties
                </button>
                
                <Link 
                  href="/properties"
                  className="inline-flex items-center px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-md transition-colors shadow-lg"
                >
                  Browse All Properties
                </Link>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Use advanced search filters and browse by location, price range, property type, and more
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
