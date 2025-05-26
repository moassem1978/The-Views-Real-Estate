import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Property } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, Building, DollarSign } from "lucide-react";

interface CompoundData {
  name: string;
  location: string;
  propertyCount: number;
  averagePrice: number;
  priceRange: { min: number; max: number };
  coordinates: { lat: number; lng: number };
  propertyTypes: string[];
  density: 'low' | 'medium' | 'high';
}

interface HeatMapProps {
  selectedCompound?: string;
  onCompoundSelect?: (compound: string) => void;
}

export default function CompoundHeatMap({ selectedCompound, onCompoundSelect }: HeatMapProps) {
  const [hoveredCompound, setHoveredCompound] = useState<string | null>(null);
  const [filterLocation, setFilterLocation] = useState<string>('all');

  // Fetch properties data
  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  // Process properties data into compound heat map data
  const compoundData: CompoundData[] = processPropertiesForHeatMap(properties);

  // Filter compounds by location
  const filteredCompounds = filterLocation === 'all' 
    ? compoundData 
    : compoundData.filter(compound => 
        compound.location.toLowerCase().includes(filterLocation.toLowerCase())
      );

  // Get unique locations for filter
  const locations = ['all', ...Array.from(new Set(compoundData.map(c => c.location)))];

  if (isLoading) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading heat map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Compound Location Heat Map</h2>
          <p className="text-gray-600">Property density and pricing across Egyptian luxury compounds</p>
        </div>
        
        <div className="flex gap-2">
          <select 
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          >
            {locations.map(location => (
              <option key={location} value={location}>
                {location === 'all' ? 'All Locations' : location}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Heat Map Visualization */}
      <div className="relative">
        {/* Map Container */}
        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-6 min-h-[500px] relative overflow-hidden">
          {/* Map Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#D4AF37" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Compound Markers */}
          <div className="relative h-full">
            {filteredCompounds.map((compound, index) => {
              const size = getDensitySize(compound.density);
              const color = getDensityColor(compound.density);
              const position = getCompoundPosition(compound.location, index, filteredCompounds.length);
              
              return (
                <div
                  key={compound.name}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
                    hoveredCompound === compound.name ? 'scale-125 z-20' : 'z-10'
                  } ${selectedCompound === compound.name ? 'ring-4 ring-[#D4AF37] ring-opacity-50' : ''}`}
                  style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                  }}
                  onMouseEnter={() => setHoveredCompound(compound.name)}
                  onMouseLeave={() => setHoveredCompound(null)}
                  onClick={() => onCompoundSelect?.(compound.name)}
                >
                  {/* Heat Point */}
                  <div 
                    className={`${size} ${color} rounded-full shadow-lg border-2 border-white flex items-center justify-center`}
                  >
                    <Building className="w-4 h-4 text-white" />
                  </div>
                  
                  {/* Compound Label */}
                  <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <div className="bg-white px-2 py-1 rounded shadow-md border text-xs font-medium">
                      {compound.name}
                    </div>
                  </div>

                  {/* Hover Tooltip */}
                  {hoveredCompound === compound.name && (
                    <div className="absolute bottom-full mb-4 left-1/2 transform -translate-x-1/2 z-30">
                      <div className="bg-gray-900 text-white p-3 rounded-lg shadow-xl min-w-48">
                        <div className="text-sm font-semibold">{compound.name}</div>
                        <div className="text-xs text-gray-300 mb-2">{compound.location}</div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Properties:</span>
                            <span className="font-semibold">{compound.propertyCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Avg Price:</span>
                            <span className="font-semibold">
                              {compound.averagePrice > 0 ? `${(compound.averagePrice / 1000000).toFixed(1)}M L.E` : 'Contact'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Density:</span>
                            <Badge variant="secondary" className="text-xs">{compound.density}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
            <h4 className="font-semibold text-sm mb-3">Property Density</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-xs">High (10+ properties)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-xs">Medium (5-9 properties)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs">Low (1-4 properties)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#D4AF37]" />
              Total Compounds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredCompounds.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building className="w-4 h-4 text-[#D4AF37]" />
              Total Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredCompounds.reduce((sum, c) => sum + c.propertyCount, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#D4AF37]" />
              Avg Price Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getAveragePriceRange(filteredCompounds)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
              Hottest Area
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getHottestArea(filteredCompounds)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper Functions
function processPropertiesForHeatMap(properties: Property[]): CompoundData[] {
  const compoundMap = new Map<string, {
    properties: Property[];
    location: string;
  }>();

  // Group properties by project name (compound)
  properties.forEach(property => {
    const compoundName = property.projectName || 'Independent Properties';
    const location = property.city || property.country || 'Unknown';
    
    if (!compoundMap.has(compoundName)) {
      compoundMap.set(compoundName, {
        properties: [],
        location: location
      });
    }
    compoundMap.get(compoundName)!.properties.push(property);
  });

  // Convert to CompoundData array
  return Array.from(compoundMap.entries()).map(([name, data]) => {
    const prices = data.properties
      .map(p => p.price)
      .filter(price => price && price > 0);
    
    const averagePrice = prices.length > 0 
      ? prices.reduce((sum, price) => sum + price, 0) / prices.length 
      : 0;
    
    const priceRange = prices.length > 0 
      ? { min: Math.min(...prices), max: Math.max(...prices) }
      : { min: 0, max: 0 };

    const propertyCount = data.properties.length;
    const density = propertyCount >= 10 ? 'high' : propertyCount >= 5 ? 'medium' : 'low';

    return {
      name,
      location: data.location,
      propertyCount,
      averagePrice,
      priceRange,
      coordinates: { lat: 0, lng: 0 }, // Could be enhanced with actual coordinates
      propertyTypes: data.properties.map(p => p.propertyType).filter((type): type is string => Boolean(type)),
      density: density as 'low' | 'medium' | 'high'
    };
  }).sort((a, b) => b.propertyCount - a.propertyCount);
}

function getDensitySize(density: 'low' | 'medium' | 'high'): string {
  switch (density) {
    case 'high': return 'w-8 h-8';
    case 'medium': return 'w-6 h-6';
    case 'low': return 'w-4 h-4';
  }
}

function getDensityColor(density: 'low' | 'medium' | 'high'): string {
  switch (density) {
    case 'high': return 'bg-red-500 hover:bg-red-600';
    case 'medium': return 'bg-orange-500 hover:bg-orange-600';
    case 'low': return 'bg-green-500 hover:bg-green-600';
  }
}

function getCompoundPosition(location: string, index: number, total: number): { x: number; y: number } {
  // Distribute compounds across the map based on location and index
  const locationMap: { [key: string]: { x: number; y: number } } = {
    'Cairo': { x: 45, y: 60 },
    'North Coast': { x: 25, y: 20 },
    'New Capital': { x: 65, y: 55 },
    'Giza': { x: 40, y: 65 },
    'Alexandria': { x: 20, y: 30 },
    'Red Sea': { x: 85, y: 75 },
    'October': { x: 35, y: 70 },
  };

  const basePosition = locationMap[location] || { x: 50, y: 50 };
  
  // Add some randomness and spacing to avoid overlap
  const offsetX = (index % 3 - 1) * 8 + (Math.random() - 0.5) * 10;
  const offsetY = (Math.floor(index / 3) % 3 - 1) * 8 + (Math.random() - 0.5) * 10;
  
  return {
    x: Math.max(10, Math.min(90, basePosition.x + offsetX)),
    y: Math.max(15, Math.min(85, basePosition.y + offsetY))
  };
}

function getAveragePriceRange(compounds: CompoundData[]): string {
  const prices = compounds
    .map(c => c.averagePrice)
    .filter(price => price > 0);
  
  if (prices.length === 0) return 'Contact';
  
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  
  return `${(min / 1000000).toFixed(1)}M - ${(max / 1000000).toFixed(1)}M L.E`;
}

function getHottestArea(compounds: CompoundData[]): string {
  const locationCounts = compounds.reduce((acc, compound) => {
    acc[compound.location] = (acc[compound.location] || 0) + compound.propertyCount;
    return acc;
  }, {} as { [key: string]: number });

  const hottestLocation = Object.entries(locationCounts)
    .sort(([,a], [,b]) => b - a)[0];

  return hottestLocation ? hottestLocation[0] : 'N/A';
}