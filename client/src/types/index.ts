export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  isAgent: boolean;
  createdAt: string;
}

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
  installmentPeriod?: number;
  isFullCash: boolean;
  listingType: string; // "Primary" or "Resale"
  projectName?: string;
  developerName?: string;
  bedrooms: number;
  bathrooms: number;
  builtUpArea: number;
  plotSize?: number;
  gardenSize?: number;
  floor?: number;
  isGroundUnit: boolean;
  propertyType: string;
  isFeatured: boolean;
  isNewListing: boolean;
  isHighlighted: boolean;
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