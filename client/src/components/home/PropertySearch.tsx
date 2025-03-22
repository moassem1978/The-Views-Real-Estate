import { useState, FormEvent } from "react";
import { useLocation } from "wouter";
import { SearchFilters } from "@/types";

export default function PropertySearch() {
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [, navigate] = useLocation();

  const handleFilterChange = (filters: SearchFilters) => {
    // Update form state based on filters
    setLocation(filters.location || "");
    setPropertyType(filters.propertyType || "");
    
    if (filters.minBedrooms) {
      setBedrooms(filters.minBedrooms.toString());
    } else {
      setBedrooms("");
    }
    
    // Set price range based on min/max values
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const min = filters.minPrice;
      const max = filters.maxPrice;
      
      // Find the matching price range option or leave empty
      const ranges = [
        { min: 500000, max: 1000000 },
        { min: 1000000, max: 2000000 },
        { min: 2000000, max: 5000000 },
        { min: 5000000, max: 10000000 },
        { min: 10000000, max: null }
      ];
      
      let matchingRange = "";
      for (const range of ranges) {
        if (min === range.min && (max === range.max || (range.max === null && max === undefined))) {
          matchingRange = `${range.min}-${range.max || 100000000}`;
          break;
        }
      }
      
      setPriceRange(matchingRange);
    } else {
      setPriceRange("");
    }
    
    // Directly navigate to properties page with these filters
    const queryString = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        queryString.append(key, value.toString());
      }
    });
    
    navigate(`/properties?${queryString.toString()}`);
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const filters: SearchFilters = {};
    
    if (location) filters.location = location;
    if (propertyType) filters.propertyType = propertyType;
    
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(val => parseInt(val.replace(/\D/g, '')));
      if (min) filters.minPrice = min;
      if (max) filters.maxPrice = max;
    }
    
    if (bedrooms) {
      filters.minBedrooms = parseInt(bedrooms);
    }
    
    handleFilterChange(filters);
  };

  return (
    <section className="bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg -mt-16 relative z-10 p-6 md:p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-serif font-semibold text-gray-800">Find Your Perfect Property</h2>
            <p className="text-gray-600">Refined search for exceptional homes</p>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-600 mb-1">Location</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="City, State, or ZIP" 
                  className="w-full p-3 border border-[#E8DACB] rounded-md focus:outline-none focus:border-[#D4AF37] transition-colors"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-3 top-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Property Type</label>
              <select 
                className="w-full p-3 border border-[#E8DACB] rounded-md focus:outline-none focus:border-[#D4AF37] transition-colors appearance-none bg-white"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
              >
                <option value="">All Property Types</option>
                <option value="house">House</option>
                <option value="condo">Condominium</option>
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="estate">Estate</option>
                <option value="penthouse">Penthouse</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Price Range</label>
              <select 
                className="w-full p-3 border border-[#E8DACB] rounded-md focus:outline-none focus:border-[#D4AF37] transition-colors appearance-none bg-white"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
              >
                <option value="">Any Price</option>
                <option value="500000-1000000">$500,000 - $1,000,000</option>
                <option value="1000000-2000000">$1,000,000 - $2,000,000</option>
                <option value="2000000-5000000">$2,000,000 - $5,000,000</option>
                <option value="5000000-10000000">$5,000,000 - $10,000,000</option>
                <option value="10000000-100000000">$10,000,000+</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Bedrooms</label>
              <select 
                className="w-full p-3 border border-[#E8DACB] rounded-md focus:outline-none focus:border-[#D4AF37] transition-colors appearance-none bg-white"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Search</label>
              <button 
                type="submit" 
                className="w-full p-3 bg-[#D4AF37] hover:bg-[#BF9B30] text-white font-medium rounded-md transition-colors shadow flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find Properties
              </button>
            </div>
          </form>
          
          <div className="mt-6 flex justify-end">
            <button className="text-[#D4AF37] hover:text-[#BF9B30] text-sm font-medium flex items-center transition-colors">
              Advanced Search Options
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
