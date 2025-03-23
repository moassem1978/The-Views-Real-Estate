export interface Property {
  id: number;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  downPayment?: number;
  installmentAmount?: number;
  installmentPeriod?: number; // In months
  isFullCash?: boolean;
  listingType: string; // "Primary" or "Resale"
  projectName?: string;
  developerName?: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  builtUpArea?: number;
  plotSize?: number;
  gardenSize?: number;
  floor?: number;
  isGroundUnit?: boolean;
  propertyType: string;
  isFeatured: boolean;
  isNewListing: boolean;
  yearBuilt?: number;
  views?: string;
  amenities: string[];
  images: string[];
  latitude?: number;
  longitude?: number;
  createdAt: string;
  agentId: number;
}

export interface Testimonial {
  id: number;
  clientName: string;
  clientLocation: string;
  rating: number;
  testimonial: string;
  initials: string;
  createdAt: string;
}

export interface SearchFilters {
  location?: string;
  propertyType?: string;
  listingType?: string; // "Primary" or "Resale" 
  projectName?: string;
  developerName?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  isFullCash?: boolean;
  hasInstallments?: boolean;
}

export interface FormattedPriceRange {
  value: string;
  label: string;
  min?: number;
  max?: number;
}

export interface Agent {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
}

export interface Service {
  icon: string;
  title: string;
  description: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
}
