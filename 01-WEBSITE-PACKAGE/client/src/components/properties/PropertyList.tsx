import { Property, SearchFilters } from "../../types";
import PropertyCard from "./PropertyCard";
import { useEffect, useState } from "react";

interface PropertyListProps {
  properties: Property[];
  filters: SearchFilters;
}

export default function PropertyList({ properties, filters }: PropertyListProps) {
  const [sortOption, setSortOption] = useState("default");
  const [sortedProperties, setSortedProperties] = useState<Property[]>([]);

  useEffect(() => {
    // Ensure properties is an array before spreading
    if (!properties || !Array.isArray(properties)) {
      setSortedProperties([]);
      return;
    }

    let sorted = properties.slice(); // Use slice() instead of spread for safety

    // Apply sorting
    switch (sortOption) {
      case "price-asc":
        sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-desc":
        sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "newest":
        sorted.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case "bedrooms":
        sorted.sort((a, b) => (b.bedrooms || 0) - (a.bedrooms || 0));
        break;
      case "sqft":
        sorted.sort((a, b) => b.builtUpArea - a.builtUpArea);
        break;
      // Default shows featured properties first
      default:
        sorted.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          if (a.isNewListing && !b.isNewListing) return -1;
          if (!a.isNewListing && b.isNewListing) return 1;
          return 0;
        });
    }

    setSortedProperties(sorted);
  }, [properties, sortOption]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  // Get active filters count for display
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.location) count++;
    if (filters.propertyType) count++;
    if (filters.listingType) count++;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count++; // Count price range as one filter
    if (filters.minBedrooms !== undefined) count++;
    if (filters.minBathrooms !== undefined) count++;
    if (filters.projectName) count++;
    if (filters.developerName) count++;
    return count;
  };

  // Format for display
  const formatFilterSummary = () => {
    const parts = [];

    if (filters.location) {
      parts.push(`Location: ${filters.location}`);
    }

    if (filters.propertyType) {
      parts.push(`Type: ${filters.propertyType}`);
    }

    if (filters.minBedrooms !== undefined) {
      parts.push(`${filters.minBedrooms}+ Beds`);
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      let priceText = "Price: ";
      if (filters.minPrice !== undefined) {
        priceText += `${filters.minPrice.toLocaleString()} L.E`;
      }

      if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
        priceText += " - ";
      }

      if (filters.maxPrice !== undefined) {
        priceText += `${filters.maxPrice.toLocaleString()} L.E`;
      }

      parts.push(priceText);
    }

    return parts.join(" • ");
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-semibold text-gray-800 mb-2">
            {properties.length} Properties
            {activeFilterCount > 0 && ` (${activeFilterCount} Filters Applied)`}
          </h1>
          {activeFilterCount > 0 && (
            <p className="text-gray-600 text-sm">
              {formatFilterSummary()}
            </p>
          )}
        </div>

        <div className="mt-4 md:mt-0 flex items-center">
          <label htmlFor="sort" className="text-sm text-gray-600 mr-2">Sort By:</label>
          <select 
            id="sort"
            value={sortOption}
            onChange={handleSortChange}
            className="p-2 border border-[#E8DACB] rounded-md focus:outline-none focus:border-[#D4AF37] transition-colors"
          >
            <option value="default">Featured</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="newest">Newest</option>
            <option value="bedrooms">Most Bedrooms</option>
            <option value="sqft">Largest Size</option>
          </select>
        </div>
      </div>

      {sortedProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-serif font-semibold text-gray-800 mb-2">No Properties Found</h3>
          <p className="text-gray-600">
            We couldn't find any properties matching your criteria. Try adjusting your filters.
          </p>
        </div>
      )}
    </div>
  );
}