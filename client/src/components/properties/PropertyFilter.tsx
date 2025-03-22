import { useState, useEffect } from "react";
import { SearchFilters, FormattedPriceRange } from "@/types";
import VoiceSearch from "./VoiceSearch";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";

interface PropertyFilterProps {
  currentFilters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
}

export default function PropertyFilter({ currentFilters, onFilterChange }: PropertyFilterProps) {
  const [location, setLocation] = useState(currentFilters.location || "");
  const [propertyType, setPropertyType] = useState(currentFilters.propertyType || "");
  const [listingType, setListingType] = useState(currentFilters.listingType || "");
  const [projectName, setProjectName] = useState(currentFilters.projectName || "");
  const [developerName, setDeveloperName] = useState(currentFilters.developerName || "");
  const [priceRange, setPriceRange] = useState("");
  const [bedrooms, setBedrooms] = useState(currentFilters.minBedrooms?.toString() || "");
  const [bathrooms, setBathrooms] = useState(currentFilters.minBathrooms?.toString() || "");
  const [isFullCash, setIsFullCash] = useState<boolean | undefined>(currentFilters.isFullCash);
  const [hasInstallments, setHasInstallments] = useState<boolean | undefined>(currentFilters.hasInstallments);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // List of available projects and developers
  const [availableProjects, setAvailableProjects] = useState<string[]>([]);
  const [availableDevelopers, setAvailableDevelopers] = useState<string[]>([]);
  
  // Fetch available projects and developers
  useEffect(() => {
    // This would be better coming from an API endpoint, but for now we'll simulate it
    // In a real app, you would fetch this data from the server
    const fetchProjectsAndDevelopers = async () => {
      try {
        const properties = await apiRequest('/api/properties');
        if (Array.isArray(properties)) {
          // Extract unique project names
          const projects = Array.from(new Set(
            properties
              .filter(p => p.projectName)
              .map(p => p.projectName)
          ));
          
          // Extract unique developer names
          const developers = Array.from(new Set(
            properties
              .filter(p => p.developerName)
              .map(p => p.developerName)
          ));
          
          setAvailableProjects(projects);
          setAvailableDevelopers(developers);
        }
      } catch (error) {
        console.error('Failed to fetch projects and developers:', error);
      }
    };
    
    fetchProjectsAndDevelopers();
  }, []);
  
  // Update form state when filters prop changes
  useEffect(() => {
    setLocation(currentFilters.location || "");
    setPropertyType(currentFilters.propertyType || "");
    setListingType(currentFilters.listingType || "");
    setProjectName(currentFilters.projectName || "");
    setDeveloperName(currentFilters.developerName || "");
    setBedrooms(currentFilters.minBedrooms?.toString() || "");
    setBathrooms(currentFilters.minBathrooms?.toString() || "");
    setIsFullCash(currentFilters.isFullCash);
    setHasInstallments(currentFilters.hasInstallments);
    
    // Set price range based on min/max values
    if (currentFilters.minPrice !== undefined || currentFilters.maxPrice !== undefined) {
      const min = currentFilters.minPrice;
      const max = currentFilters.maxPrice;
      
      if (min !== undefined && max !== undefined) {
        setPriceRange(`${min}-${max}`);
      } else if (min !== undefined) {
        setPriceRange(`${min}-any`);
      } else if (max !== undefined) {
        setPriceRange(`any-${max}`);
      }
    } else {
      setPriceRange("");
    }
  }, [currentFilters]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filters: SearchFilters = {};
    
    if (location) filters.location = location;
    if (propertyType) filters.propertyType = propertyType;
    if (listingType) filters.listingType = listingType;
    if (projectName) filters.projectName = projectName;
    if (developerName) filters.developerName = developerName;
    
    if (priceRange) {
      const [min, max] = priceRange.split('-');
      if (min !== 'any') filters.minPrice = parseInt(min);
      if (max !== 'any') filters.maxPrice = parseInt(max);
    }
    
    if (bedrooms) {
      filters.minBedrooms = parseInt(bedrooms);
    }
    
    if (bathrooms) {
      filters.minBathrooms = parseFloat(bathrooms);
    }
    
    if (isFullCash !== undefined) {
      filters.isFullCash = isFullCash;
    }
    
    if (hasInstallments !== undefined) {
      filters.hasInstallments = hasInstallments;
    }
    
    onFilterChange(filters);
  };
  
  const handleReset = () => {
    setLocation("");
    setPropertyType("");
    setListingType("");
    setProjectName("");
    setDeveloperName("");
    setPriceRange("");
    setBedrooms("");
    setBathrooms("");
    setIsFullCash(undefined);
    setHasInstallments(undefined);
    onFilterChange({});
  };
  
  const toggleAdvanced = () => {
    setShowAdvanced(!showAdvanced);
  };
  
  // Price range options (in Egyptian Pounds, L.E.)
  const priceRanges: FormattedPriceRange[] = [
    { value: "", label: "Any Price" },
    { value: "500000-1000000", label: "L.E. 500k - 1M", min: 500000, max: 1000000 },
    { value: "1000000-2000000", label: "L.E. 1M - 2M", min: 1000000, max: 2000000 },
    { value: "2000000-5000000", label: "L.E. 2M - 5M", min: 2000000, max: 5000000 },
    { value: "5000000-10000000", label: "L.E. 5M - 10M", min: 5000000, max: 10000000 },
    { value: "10000000-any", label: "L.E. 10M+", min: 10000000 }
  ];
  
  // Property types
  const propertyTypes = [
    { value: "", label: "All Property Types" },
    { value: "House", label: "House" },
    { value: "Condominium", label: "Condominium" },
    { value: "Apartment", label: "Apartment" },
    { value: "Villa", label: "Villa" },
    { value: "Estate", label: "Estate" },
    { value: "Penthouse", label: "Penthouse" }
  ];
  
  // Listing types
  const listingTypes = [
    { value: "", label: "All Listings" },
    { value: "Primary", label: "Primary" },
    { value: "Resale", label: "Resale" }
  ];
  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              {propertyTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Price Range</label>
            <select 
              className="w-full p-3 border border-[#E8DACB] rounded-md focus:outline-none focus:border-[#D4AF37] transition-colors appearance-none bg-white"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
            >
              {priceRanges.map((range) => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
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
              <option value="6">6+</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Search</label>
            <div className="flex gap-2">
              <button 
                type="submit" 
                className="flex-grow p-3 bg-[#D4AF37] hover:bg-[#BF9B30] text-white font-medium rounded-md transition-colors shadow flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find
              </button>
              <button 
                type="button" 
                onClick={handleReset}
                className="p-3 border border-[#E8DACB] text-gray-600 hover:bg-[#F5F0E6] font-medium rounded-md transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {showAdvanced && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#E8DACB]">
            {/* Listing Type */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Listing Type</label>
              <select 
                className="w-full p-3 border border-[#E8DACB] rounded-md focus:outline-none focus:border-[#D4AF37] transition-colors appearance-none bg-white"
                value={listingType}
                onChange={(e) => setListingType(e.target.value)}
              >
                {listingTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            {/* Project */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Project</label>
              <select 
                className="w-full p-3 border border-[#E8DACB] rounded-md focus:outline-none focus:border-[#D4AF37] transition-colors appearance-none bg-white"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              >
                <option value="">Any Project</option>
                {availableProjects.map((project) => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
            </div>
            
            {/* Developer */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Developer</label>
              <select 
                className="w-full p-3 border border-[#E8DACB] rounded-md focus:outline-none focus:border-[#D4AF37] transition-colors appearance-none bg-white"
                value={developerName}
                onChange={(e) => setDeveloperName(e.target.value)}
              >
                <option value="">Any Developer</option>
                {availableDevelopers.map((developer) => (
                  <option key={developer} value={developer}>{developer}</option>
                ))}
              </select>
            </div>
            
            {/* Bathrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Bathrooms</label>
              <select 
                className="w-full p-3 border border-[#E8DACB] rounded-md focus:outline-none focus:border-[#D4AF37] transition-colors appearance-none bg-white"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>
            
            {/* Payment Options */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Payment Options</label>
              <div className="flex flex-col gap-2 mt-2">
                <label className="inline-flex items-center">
                  <input 
                    type="checkbox" 
                    className="form-checkbox h-5 w-5 text-[#D4AF37] rounded border-[#E8DACB]"
                    checked={isFullCash === true}
                    onChange={() => setIsFullCash(prev => prev === true ? undefined : true)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Full Cash</span>
                </label>
                
                <label className="inline-flex items-center">
                  <input 
                    type="checkbox" 
                    className="form-checkbox h-5 w-5 text-[#D4AF37] rounded border-[#E8DACB]"
                    checked={hasInstallments === true}
                    onChange={() => setHasInstallments(prev => prev === true ? undefined : true)}
                  />
                  <span className="ml-2 text-sm text-gray-700">With Installments</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </form>
      
      <div className="mt-4 flex justify-between items-center">
        <VoiceSearch onFilterChange={onFilterChange} />
        
        <button 
          onClick={toggleAdvanced}
          className="text-[#D4AF37] hover:text-[#BF9B30] text-sm font-medium flex items-center transition-colors"
        >
          {showAdvanced ? 'Hide Advanced Options' : 'Advanced Search Options'}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-4 w-4 ml-1 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
