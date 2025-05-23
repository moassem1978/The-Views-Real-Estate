import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchFilters } from "@/types";
import { Separator } from "@/components/ui/separator";

// Define the FormattedPriceRange interface locally
interface FormattedPriceRange {
  value: string;
  label: string;
  min?: number;
  max?: number;
}

// iOS-compatible styled select component
const StyledSelect = ({ value, onChange, options, className = "" }: {
  value: string,
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void,
  options: { value: string, label: string }[] | string[],
  className?: string
}) => {
  return (
    <div className="relative">
      <select 
        className={`w-full p-3 border border-[#E8DACB] rounded-md focus:outline-none focus:border-[#D4AF37] transition-colors appearance-none bg-white ${className}`}
        style={{ WebkitAppearance: "menulist-button" }}
        value={value}
        onChange={onChange}
      >
        {options.map((option) => {
          if (typeof option === 'string') {
            return <option key={option} value={option}>{option}</option>;
          } else {
            return <option key={option.value} value={option.value}>{option.label}</option>;
          }
        })}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
      </div>
    </div>
  );
};

interface PropertyFilterProps {
  currentFilters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  hideInternationalFilter?: boolean;
}

export default function PropertyFilter({ currentFilters, onFilterChange, hideInternationalFilter = false }: PropertyFilterProps) {
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
  
  // Fetch actual cities from your property database
  const { data: cities = [] } = useQuery<string[]>({
    queryKey: ["/api/properties/unique-cities"],
    staleTime: 300000, // 5 minutes
  });

  // Fetch projects from the API
  const { data: projects = [] } = useQuery<string[]>({
    queryKey: ["/api/properties/project-names"],
    staleTime: 300000, // 5 minutes
  });
  
  // List of available projects and developers
  const [availableProjects, setAvailableProjects] = useState<string[]>([]);
  const [availableDevelopers, setAvailableDevelopers] = useState<string[]>([]);
  
  // Fetch available projects and developers
  useEffect(() => {
    // This would be better coming from an API endpoint, but for now we'll simulate it
    // In a real app, you would fetch this data from the server
    const fetchProjectsAndDevelopers = async () => {
      try {
        const response = await fetch('/api/properties');
        const properties = await response.json();
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
    
    // If on international page, always set international filter
    if (hideInternationalFilter) {
      filters.international = true;
    }
    
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
    
    // If we're on the international page, we need to maintain the international filter
    if (hideInternationalFilter) {
      onFilterChange({ international: true });
    } else {
      onFilterChange({});
    }
  };
  
  const toggleAdvanced = () => {
    setShowAdvanced(!showAdvanced);
  };
  
  // Price range options matching your exact specifications
  const priceRanges: FormattedPriceRange[] = [
    { value: "", label: "Any Price" },
    { value: "1-20000000", label: "1 - 20,000,000", min: 1, max: 20000000 },
    { value: "20000001-40000000", label: "20,000,001 - 40,000,000", min: 20000001, max: 40000000 },
    { value: "40000001-75000000", label: "40,000,001 - 75,000,000", min: 40000001, max: 75000000 },
    { value: "75000000-", label: "75,000,000+", min: 75000000 }
  ];
  
  // Property types
  const propertyTypes = [
    { value: "", label: "All Property Types" },
    { value: "Penthouse", label: "Penthouse" },
    { value: "Apartment", label: "Apartment" },
    { value: "Chalet", label: "Chalet" },
    { value: "Twinhouse", label: "Twinhouse" },
    { value: "Villa", label: "Villa" },
    { value: "Office", label: "Office" },
    { value: "Townhouse", label: "Townhouse" }
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
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Location</label>
            <StyledSelect
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              options={[
                { value: "", label: "Any Location" },
                { value: "Cairo", label: "Cairo" },
                { value: "Zayed", label: "Zayed" },
                { value: "North coast", label: "North coast" },
                { value: "Red Sea", label: "Red Sea" },
                { value: "Dubai", label: "Dubai" },
                { value: "London", label: "London" },
                { value: "Other", label: "Other" }
              ]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Property Type</label>
            <StyledSelect
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              options={propertyTypes}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Price Range</label>
            <StyledSelect
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              options={priceRanges}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Bedrooms</label>
            <StyledSelect
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              options={[
                { value: "", label: "Any" },
                { value: "1", label: "1+" },
                { value: "2", label: "2+" },
                { value: "3", label: "3+" },
                { value: "4", label: "4+" },
                { value: "5", label: "5+" },
                { value: "6", label: "6+" }
              ]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Search</label>
            <div className="flex gap-2">
              <button 
                type="submit" 
                className="flex-grow p-3 bg-[#B87333] hover:bg-[#A66323] text-white font-medium rounded-md transition-colors shadow flex items-center justify-center"
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
              <StyledSelect
                value={listingType}
                onChange={(e) => setListingType(e.target.value)}
                options={listingTypes}
              />
            </div>
            
            {/* Project */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Project</label>
              <StyledSelect
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                options={[
                  { value: "", label: "Any Project" },
                  ...availableProjects.map(project => ({ value: project, label: project }))
                ]}
              />
            </div>
            
            {/* Developer */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Developer</label>
              <StyledSelect
                value={developerName}
                onChange={(e) => setDeveloperName(e.target.value)}
                options={[
                  { value: "", label: "Any Developer" },
                  ...availableDevelopers.map(developer => ({ value: developer, label: developer }))
                ]}
              />
            </div>
            
            {/* Bathrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Bathrooms</label>
              <StyledSelect
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                options={[
                  { value: "", label: "Any" },
                  { value: "1", label: "1+" },
                  { value: "2", label: "2+" },
                  { value: "3", label: "3+" },
                  { value: "4", label: "4+" },
                  { value: "5", label: "5+" }
                ]}
              />
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
      
      <div className="mt-4 flex justify-end">
        <button 
          onClick={toggleAdvanced}
          className="text-[#B87333] hover:text-[#A66323] text-sm font-medium flex items-center transition-colors"
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
