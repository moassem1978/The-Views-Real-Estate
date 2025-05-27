export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  isAgent: boolean;
  role: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Property {
  id: number;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  zip_code?: string; // Snake case variant
  price: number;
  downPayment?: number;
  down_payment?: number; // Snake case variant
  installmentAmount?: number;
  installment_amount?: number; // Snake case variant
  installmentPeriod?: number;
  installment_period?: number; // Snake case variant
  isFullCash?: boolean;
  is_full_cash?: boolean; // Snake case variant
  listingType?: string; // "Primary" or "Resale"
  listing_type?: string; // Snake case variant
  projectName?: string;
  project_name?: string; // Snake case variant
  developerName?: string;
  developer_name?: string; // Snake case variant
  bedrooms: number;
  bathrooms: number;
  builtUpArea?: number;
  built_up_area?: number; // Snake case variant
  plotSize?: number;
  plot_size?: number; // Snake case variant
  gardenSize?: number;
  garden_size?: number; // Snake case variant
  floor?: number;
  isGroundUnit?: boolean;
  is_ground_unit?: boolean; // Snake case variant
  propertyType?: string;
  property_type?: string; // Snake case variant
  isFeatured?: boolean;
  is_featured?: boolean; // Snake case variant
  isNewListing?: boolean;
  is_new_listing?: boolean; // Snake case variant
  isHighlighted?: boolean;
  is_highlighted?: boolean; // Snake case variant
  yearBuilt?: number;
  year_built?: number; // Snake case variant
  views?: string;
  amenities?: string[] | string; // Allow both array and JSON string
  images?: string[] | string; // Allow both array and JSON string
  latitude?: number;
  longitude?: number;
  createdAt?: string;
  created_at?: string; // Snake case variant
  updatedAt?: string;
  updated_at?: string; // Snake case variant
  agentId?: number;
  agent_id?: number; // Snake case variant
  country?: string; // Used to identify international properties (any property not in Egypt)
  references?: string; // Property reference number (camelCase)
  reference_number?: string; // Property reference number (snake_case)
  
  // Allow any other string indexing for flexibility with database columns
  [key: string]: any;
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

export interface Announcement {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  isFeatured: boolean;
  isHighlighted: boolean;
  createdAt: string;
}

export interface SiteSettings {
  companyLogo?: string;
  companyName: string;
  primaryColor?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface SearchFilters {
  location?: string;
  propertyType?: string;
  listingType?: string; // Primary or Resale
  projectName?: string;
  developerName?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  isFullCash?: boolean;
  hasInstallments?: boolean;
  international?: boolean; // For properties outside Egypt
}