import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Property } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, TrendingUp, Building, DollarSign, Filter, BarChart3, Eye, Zap } from "lucide-react";

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

type ViewMode = 'density' | 'price' | 'growth';
type PriceFilter = 'all' | 'under20M' | '20M-40M' | '40M-75M' | 'over75M';

export default function CompoundHeatMap({ selectedCompound, onCompoundSelect }: HeatMapProps) {
  const [hoveredCompound, setHoveredCompound] = useState<string | null>(null);
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('density');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [showOnlyFeatured, setShowOnlyFeatured] = useState(false);
  const [animationEnabled, setAnimationEnabled] = useState(true);

  // Fetch properties data
  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  // Process properties data into compound heat map data
  const compoundData: CompoundData[] = processPropertiesForHeatMap(properties);

  // Enhanced filtering logic
  const filteredCompounds = compoundData.filter(compound => {
    // Location filter
    if (filterLocation !== 'all' && !compound.location.toLowerCase().includes(filterLocation.toLowerCase())) {
      return false;
    }
    
    // Price filter
    if (priceFilter !== 'all') {
      const avgPrice = compound.averagePrice / 1000000; // Convert to millions
      switch (priceFilter) {
        case 'under20M': return avgPrice > 0 && avgPrice < 20;
        case '20M-40M': return avgPrice >= 20 && avgPrice < 40;
        case '40M-75M': return avgPrice >= 40 && avgPrice < 75;
        case 'over75M': return avgPrice >= 75;
        default: return true;
      }
    }
    
    // Featured filter (compounds with high density or premium locations)
    if (showOnlyFeatured) {
      const premiumLocations = ['North Coast', 'New Capital', 'Cairo'];
      return compound.density === 'high' || premiumLocations.some(loc => 
        compound.location.toLowerCase().includes(loc.toLowerCase())
      );
    }
    
    return true;
  });

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
      {/* Enhanced Header and Controls */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Enhanced Compound Heat Map</h2>
            <p className="text-gray-600">Advanced visualization of property density, pricing, and market trends</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={animationEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setAnimationEnabled(!animationEnabled)}
              className="bg-[#D4AF37] hover:bg-[#BF9B30]"
            >
              <Zap className="w-4 h-4 mr-1" />
              {animationEnabled ? 'Live' : 'Static'}
            </Button>
          </div>
        </div>

        {/* Advanced Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          {/* View Mode Toggle */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">View Mode</label>
            <div className="flex rounded-md overflow-hidden border border-gray-300">
              <button
                onClick={() => setViewMode('density')}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  viewMode === 'density' 
                    ? 'bg-[#D4AF37] text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Building className="w-3 h-3 mx-auto mb-1" />
                Density
              </button>
              <button
                onClick={() => setViewMode('price')}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  viewMode === 'price' 
                    ? 'bg-[#D4AF37] text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <DollarSign className="w-3 h-3 mx-auto mb-1" />
                Price
              </button>
              <button
                onClick={() => setViewMode('growth')}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  viewMode === 'growth' 
                    ? 'bg-[#D4AF37] text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <TrendingUp className="w-3 h-3 mx-auto mb-1" />
                Trends
              </button>
            </div>
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Location</label>
            <select 
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
            >
              {locations.map(location => (
                <option key={location} value={location}>
                  {location === 'all' ? 'All Locations' : location}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Price Range</label>
            <select 
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as PriceFilter)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
            >
              <option value="all">All Prices</option>
              <option value="under20M">Under 20M L.E</option>
              <option value="20M-40M">20M - 40M L.E</option>
              <option value="40M-75M">40M - 75M L.E</option>
              <option value="over75M">Over 75M L.E</option>
            </select>
          </div>

          {/* Featured Toggle */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Display</label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowOnlyFeatured(!showOnlyFeatured)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  showOnlyFeatured 
                    ? 'bg-[#D4AF37] text-white' 
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Eye className="w-3 h-3 mr-1" />
                Premium Only
              </button>
            </div>
          </div>
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
              const size = getMarkerSize(compound, viewMode);
              const color = getMarkerColor(compound, viewMode);
              const position = getCompoundPosition(compound.location, index, filteredCompounds.length);
              const pulse = animationEnabled && compound.density === 'high';
              
              return (
                <div
                  key={compound.name}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-500 ${
                    hoveredCompound === compound.name ? 'scale-125 z-20' : 'z-10'
                  } ${selectedCompound === compound.name ? 'ring-4 ring-[#D4AF37] ring-opacity-50' : ''}
                  ${pulse ? 'animate-pulse' : ''}`}
                  style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                    transform: animationEnabled 
                      ? `translate(-50%, -50%) scale(${hoveredCompound === compound.name ? 1.25 : 1})` 
                      : 'translate(-50%, -50%)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseEnter={() => setHoveredCompound(compound.name)}
                  onMouseLeave={() => setHoveredCompound(null)}
                  onClick={() => onCompoundSelect?.(compound.name)}
                >
                  {/* Enhanced Heat Point with Glow Effect */}
                  <div 
                    className={`${size} ${color} rounded-full shadow-xl border-3 border-white flex items-center justify-center relative overflow-hidden group`}
                    style={{
                      boxShadow: animationEnabled && compound.density === 'high' 
                        ? '0 0 20px rgba(212, 175, 55, 0.6), 0 0 40px rgba(212, 175, 55, 0.3)' 
                        : '0 10px 25px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    {/* Gradient Overlay for Premium Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                    
                    {/* Icon based on view mode */}
                    {viewMode === 'density' && <Building className="w-4 h-4 text-white relative z-10" />}
                    {viewMode === 'price' && <DollarSign className="w-4 h-4 text-white relative z-10" />}
                    {viewMode === 'growth' && <TrendingUp className="w-4 h-4 text-white relative z-10" />}
                    
                    {/* Ripple Effect for High Activity */}
                    {animationEnabled && compound.propertyCount >= 8 && (
                      <div className="absolute inset-0 rounded-full border-2 border-white/50 animate-ping"></div>
                    )}
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

          {/* Enhanced Dynamic Legend */}
          <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-xl border border-gray-200">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#D4AF37]" />
              {viewMode === 'density' && 'Property Density'}
              {viewMode === 'price' && 'Price Ranges'}
              {viewMode === 'growth' && 'Growth Potential'}
            </h4>
            <div className="space-y-2">
              {viewMode === 'density' && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-red-700 rounded-full shadow-sm"></div>
                    <span className="text-xs">High (10+ properties)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full shadow-sm"></div>
                    <span className="text-xs">Medium (5-9 properties)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-br from-green-500 to-green-700 rounded-full shadow-sm"></div>
                    <span className="text-xs">Low (1-4 properties)</span>
                  </div>
                </>
              )}
              {viewMode === 'price' && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full shadow-sm"></div>
                    <span className="text-xs">75M+ L.E</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full shadow-sm"></div>
                    <span className="text-xs">40M - 75M L.E</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full shadow-sm"></div>
                    <span className="text-xs">20M - 40M L.E</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full shadow-sm"></div>
                    <span className="text-xs">Under 20M L.E</span>
                  </div>
                </>
              )}
              {viewMode === 'growth' && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-full shadow-sm"></div>
                    <span className="text-xs">High Growth</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full shadow-sm"></div>
                    <span className="text-xs">Medium Growth</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full shadow-sm"></div>
                    <span className="text-xs">Emerging</span>
                  </div>
                </>
              )}
            </div>
            {animationEnabled && (
              <div className="mt-3 pt-2 border-t border-gray-200">
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Zap className="w-3 h-3 text-[#D4AF37]" />
                  Live animations enabled
                </div>
              </div>
            )}
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

// Enhanced marker sizing based on view mode
function getMarkerSize(compound: CompoundData, viewMode: ViewMode): string {
  switch (viewMode) {
    case 'density':
      switch (compound.density) {
        case 'high': return 'w-10 h-10';
        case 'medium': return 'w-7 h-7';
        case 'low': return 'w-5 h-5';
      }
      break;
    case 'price':
      const avgPrice = compound.averagePrice / 1000000;
      if (avgPrice >= 75) return 'w-12 h-12';
      if (avgPrice >= 40) return 'w-9 h-9';
      if (avgPrice >= 20) return 'w-7 h-7';
      return 'w-5 h-5';
    case 'growth':
      // Growth based on property count and location premium
      const isPremiumLocation = ['North Coast', 'New Capital', 'Cairo'].some(loc => 
        compound.location.toLowerCase().includes(loc.toLowerCase())
      );
      if (compound.propertyCount >= 10 && isPremiumLocation) return 'w-11 h-11';
      if (compound.propertyCount >= 5 || isPremiumLocation) return 'w-8 h-8';
      return 'w-6 h-6';
  }
  return 'w-6 h-6';
}

// Enhanced marker coloring based on view mode
function getMarkerColor(compound: CompoundData, viewMode: ViewMode): string {
  switch (viewMode) {
    case 'density':
      switch (compound.density) {
        case 'high': return 'bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800';
        case 'medium': return 'bg-gradient-to-br from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800';
        case 'low': return 'bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800';
      }
      break;
    case 'price':
      const avgPrice = compound.averagePrice / 1000000;
      if (avgPrice >= 75) return 'bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900';
      if (avgPrice >= 40) return 'bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900';
      if (avgPrice >= 20) return 'bg-gradient-to-br from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800';
      if (avgPrice > 0) return 'bg-gradient-to-br from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800';
      return 'bg-gradient-to-br from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800';
    case 'growth':
      const isPremiumLocation = ['North Coast', 'New Capital', 'Cairo'].some(loc => 
        compound.location.toLowerCase().includes(loc.toLowerCase())
      );
      if (compound.propertyCount >= 10 && isPremiumLocation) return 'bg-gradient-to-br from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800';
      if (compound.propertyCount >= 5 || isPremiumLocation) return 'bg-gradient-to-br from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800';
      return 'bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800';
  }
  return 'bg-gradient-to-br from-gray-500 to-gray-700';
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