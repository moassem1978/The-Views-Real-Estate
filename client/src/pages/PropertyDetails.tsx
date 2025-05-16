import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Property } from "@/types";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import PropertyGallery from "@/components/properties/PropertyGallery";
import ContactCTA from "@/components/home/ContactCTA";
import { formatPrice, parseJsonArray } from "@/lib/utils";

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);
  
  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: [`/api/properties/${id}`],
  });
  
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-4">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-[500px] w-full rounded-lg mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-10 w-48 mb-4" />
                <Skeleton className="h-6 w-full mb-3" />
                <Skeleton className="h-6 w-full mb-3" />
                <Skeleton className="h-6 w-2/3 mb-6" />
                
                <Skeleton className="h-8 w-40 mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-md" />
                  ))}
                </div>
                
                <Skeleton className="h-8 w-40 mb-4" />
                <Skeleton className="h-48 w-full rounded-md" />
              </div>
              <div>
                <Skeleton className="h-64 w-full rounded-lg mb-4" />
                <Skeleton className="h-10 w-full mb-3" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error || !property) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-3xl font-serif font-semibold text-gray-800 mb-4">
              Property Not Found
            </h1>
            <p className="text-gray-600 mb-8">
              We couldn't find the property you're looking for. It may have been removed or the ID is incorrect.
            </p>
            <Link 
              href="/properties" 
              className="px-6 py-3 bg-[#B87333] hover:bg-[#964B00] text-white font-medium rounded-md transition-colors shadow-md inline-flex items-center"
            >
              Browse All Properties
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Parse JSON strings if necessary
  const amenities = parseJsonArray(property.amenities);
  const images = parseJsonArray(property.images);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Breadcrumbs */}
        <div className="bg-[#F5F0E6] py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center text-sm text-gray-600">
              <Link href="/" className="hover:text-[#D4AF37] transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/properties" className="hover:text-[#D4AF37] transition-colors">Properties</Link>
              <span className="mx-2">/</span>
              <span className="text-[#D4AF37]">{property.title}</span>
            </div>
          </div>
        </div>
        
        {/* Property Gallery */}
        <PropertyGallery images={images} title={property.title} />
        
        {/* Property Details */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main content */}
              <div className="lg:col-span-2">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-serif font-semibold text-gray-800">
                      {property.title}
                    </h1>
                    
                    {/* Reference Number - consistent display */}
                    {(property.references || property.reference_number || property.reference) && (
                      <div className="mt-2 text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded inline-block">
                        Reference: {property.references || property.reference_number || property.reference}
                      </div>
                    )}
                    
                    <p className="mt-2 text-gray-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {property.address}, {property.city}, {property.state} {property.zipCode}
                    </p>
                  </div>
                  <button 
                    onClick={toggleFavorite}
                    className="h-12 w-12 flex items-center justify-center bg-white text-gray-800 hover:text-[#D4AF37] rounded-full border border-gray-200 transition-colors shadow-sm"
                  >
                    {isFavorite ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#D4AF37]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                
                <div className="flex items-center justify-between mb-8 border-y border-[#E8DACB] py-4">
                  <div className="text-3xl font-serif font-semibold text-[#D4AF37]">
                    {property.price.toLocaleString()} L.E
                  </div>
                  <div className="flex space-x-4 text-gray-600">
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                      </svg>
                      {property.bedrooms} beds
                    </span>
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                      </svg>
                      {property.bathrooms} baths
                    </span>
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      {property.builtUpArea 
                        ? `${property.builtUpArea.toLocaleString()} BUA` 
                        : property.squareFeet 
                          ? `${property.squareFeet.toLocaleString()} sq ft` 
                          : "N/A"}
                    </span>
                  </div>
                </div>
                
                {/* Reference Number Display - removed as per client request */}
                
                <div className="mb-10">
                  <h2 className="text-2xl font-serif font-semibold text-gray-800 mb-4">Property Description</h2>
                  <div className="text-gray-600 leading-relaxed space-y-4">
                    {property.description.split('\n\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </div>
                
                <div className="mb-10">
                  <h2 className="text-2xl font-serif font-semibold text-gray-800 mb-4">Features & Amenities</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Add Garden Size as a feature for ground units */}
                    {property.isGroundUnit && property.gardenSize && property.gardenSize > 0 && (
                      <div className="flex items-center bg-[#F5F0E6] p-3 rounded-md">
                        <div className="h-8 w-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#D4AF37]" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                          </svg>
                        </div>
                        <span className="text-gray-700">Garden Size: {property.gardenSize.toLocaleString()} m²</span>
                      </div>
                    )}
                    
                    {/* Add Floor Number as a feature for vertical units */}
                    {['Apartment', 'Studio', 'Penthouse', 'Chalet'].includes(property.propertyType) && 
                     property.floor !== undefined && property.floor > 0 && (
                      <div className="flex items-center bg-[#F5F0E6] p-3 rounded-md">
                        <div className="h-8 w-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#D4AF37]" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-700">Floor: {property.floor}</span>
                      </div>
                    )}
                    
                    {/* Show all regular amenities */}
                    {amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center bg-[#F5F0E6] p-3 rounded-md">
                        <div className="h-8 w-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#D4AF37]" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {property.yearBuilt && (
                  <div className="mb-10">
                    <h2 className="text-2xl font-serif font-semibold text-gray-800 mb-4">Property Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 border-b border-[#E8DACB]">
                        <span className="text-gray-600">Property Type</span>
                        <span className="font-medium text-gray-800">{property.propertyType}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 border-b border-[#E8DACB]">
                        <span className="text-gray-600">Year Built</span>
                        <span className="font-medium text-gray-800">{property.yearBuilt}</span>
                      </div>
                      {property.views && (
                        <div className="flex items-center justify-between p-4 border-b border-[#E8DACB]">
                          <span className="text-gray-600">View</span>
                          <span className="font-medium text-gray-800">{property.views}</span>
                        </div>
                      )}
                      {property.builtUpArea && (
                        <div className="flex items-center justify-between p-4 border-b border-[#E8DACB]">
                          <span className="text-gray-600">Built-Up Area</span>
                          <span className="font-medium text-gray-800">{property.builtUpArea.toLocaleString()} m²</span>
                        </div>
                      )}

                      {/* Only show floor for vertical building units */}
                      {['Apartment', 'Studio', 'Penthouse', 'Chalet'].includes(property.propertyType) && 
                       property.floor !== undefined && property.floor > 0 && (
                        <div className="flex items-center justify-between p-4 border-b border-[#E8DACB]">
                          <span className="text-gray-600">Floor</span>
                          <span className="font-medium text-gray-800">{property.floor}</span>
                        </div>
                      )}

                      {/* Show Garden Size for ground units */}
                      {property.isGroundUnit && property.gardenSize && (
                        <div className="flex items-center justify-between p-4 border-b border-[#E8DACB]">
                          <span className="text-gray-600">Garden Size</span>
                          <span className="font-medium text-gray-800">{property.gardenSize.toLocaleString()} m²</span>
                        </div>
                      )}
                      
                      {/* Show Plot Size for non-ground units */}
                      {!property.isGroundUnit && property.plotSize && (
                        <div className="flex items-center justify-between p-4 border-b border-[#E8DACB]">
                          <span className="text-gray-600">Plot Size</span>
                          <span className="font-medium text-gray-800">{property.plotSize.toLocaleString()} m²</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between p-4 border-b border-[#E8DACB]">
                        <span className="text-gray-600">Price per Sq Ft</span>
                        <span className="font-medium text-gray-800">
                          {property.builtUpArea 
                            ? `${Math.round(property.price / property.builtUpArea).toLocaleString()} L.E`
                            : property.squareFeet
                              ? `${Math.round(property.price / property.squareFeet).toLocaleString()} L.E`
                              : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {property.latitude && property.longitude && (
                  <div className="mb-10">
                    <h2 className="text-2xl font-serif font-semibold text-gray-800 mb-4">Location</h2>
                    <div className="bg-[#F5F0E6] h-64 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#D4AF37] mx-auto mb-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-gray-600">Interactive map loading...</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {property.address}, {property.city}, {property.state} {property.zipCode}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Sidebar */}
              <div>
                <div className="bg-white rounded-lg shadow-lg overflow-hidden sticky top-24">
                  <div className="p-6 border-b border-[#E8DACB]">
                    <h3 className="font-serif text-xl font-semibold text-gray-800 mb-2">Interested in this property?</h3>
                    {property.listingType === "Resale" ? (
                      <p className="text-gray-600 mb-4">Contact us directly to arrange a viewing or learn more.</p>
                    ) : (
                      <p className="text-gray-600 mb-4">Fill out the form below to contact us about this property.</p>
                    )}
                    
                    {/* Contact Options */}
                    {property.listingType === "Resale" ? (
                      // For Resale properties - show direct contact methods only
                      <div className="mb-6 space-y-3">
                        <a 
                          href="tel:+201234567890" 
                          className="flex items-center justify-center w-full p-3 bg-[#B87333] hover:bg-[#A66323] text-white font-medium rounded-md transition-colors shadow-md"
                        >
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                          </svg>
                          Call Agent
                        </a>
                        
                        <a 
                          href={`https://wa.me/201234567890?text=I'm%20interested%20in%20the%20property:%20${encodeURIComponent(property.title)}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-full p-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-medium rounded-md transition-colors shadow-md"
                        >
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          Chat on WhatsApp
                        </a>
                      </div>
                    ) : (
                      // For Primary properties - show contact form only
                      <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                        <input 
                          type="text" 
                          className="w-full p-3 border border-[#E8DACB] rounded-md focus:outline-none focus:border-[#D4AF37] transition-colors" 
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input 
                          type="email" 
                          className="w-full p-3 border border-[#E8DACB] rounded-md focus:outline-none focus:border-[#D4AF37] transition-colors" 
                          placeholder="email@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input 
                          type="tel" 
                          className="w-full p-3 border border-[#E8DACB] rounded-md focus:outline-none focus:border-[#D4AF37] transition-colors" 
                          placeholder="(123) 456-7890"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <textarea 
                          className="w-full p-3 border border-[#E8DACB] rounded-md focus:outline-none focus:border-[#D4AF37] transition-colors" 
                          placeholder="I'm interested in this property and would like more information."
                          rows={4}
                        ></textarea>
                      </div>
                      
                      <button 
                        type="submit" 
                        className="w-full p-3 bg-[#D4AF37] hover:bg-[#BF9B30] text-white font-medium rounded-md transition-colors shadow-md"
                      >
                        Request Information
                      </button>
                    </form>
                    )}
                  </div>
                  
                  {/* Schedule Viewing Section - Only For Resale Properties */}
                  {property.listingType === "Resale" && (
                    <div className="p-6">
                      <h3 className="font-serif text-lg font-semibold text-gray-800 mb-3">Schedule a Viewing</h3>
                      <p className="text-gray-600 mb-4">Select a date and time to view this property in person.</p>
                      <a 
                        href={`https://wa.me/201234567890?text=I'd%20like%20to%20schedule%20a%20viewing%20for%20the%20property:%20${encodeURIComponent(property.title)}%20(ID:${property.id})%20at%20${encodeURIComponent(property.address)}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full p-3 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white font-medium rounded-md transition-colors inline-flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Schedule Viewing
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Similar Properties Section would go here */}
        
        <ContactCTA />
      </main>
      <Footer />
    </div>
  );
}
