import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Property } from "@/types";
import { formatPrice, getImageUrl } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";

export default function HeroCarousel() {
  const { data: properties, isLoading, error } = useQuery<Property[]>({
    queryKey: ['/api/properties/featured'],
  });
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  
  // Debug log to check properties
  useEffect(() => {
    if (properties) {
      console.log("Featured properties:", properties);
    }
  }, [properties]);
  
  // Autoplay functionality
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (autoplay && properties && properties.length > 0) {
      interval = setInterval(() => {
        setActiveIndex((current) => (current + 1) % properties.length);
      }, 6000); // Change slide every 6 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoplay, properties]);
  
  // Pause autoplay on hover
  const pauseAutoplay = () => setAutoplay(false);
  const resumeAutoplay = () => setAutoplay(true);
  
  if (isLoading) {
    return (
      <section className="relative h-[80vh] bg-gray-900 overflow-hidden">
        <Skeleton className="absolute inset-0" />
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent pt-16 pb-8">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center justify-between mb-4">
                <Skeleton className="h-8 w-32 mb-2" />
                <div className="flex flex-wrap gap-6">
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-6 w-28" />
                </div>
              </div>
              <Skeleton className="h-12 w-3/4 mb-4" />
              <Skeleton className="h-8 w-1/3 mb-6" />
              <div className="flex gap-4">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 w-32" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  if (error || !properties || properties.length === 0) {
    return (
      <section className="relative h-[80vh] bg-gray-900">
        {/* Default background image */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-black/70" />
        
        {/* Bottom positioned content */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent pt-16 pb-8">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl text-white">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
                Discover Your <span className="text-[#B87333]">Luxury</span> Home
              </h1>
              <p className="text-xl opacity-90 mb-8">
                Experience exceptional properties with The Views Real Estate
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/properties"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-[#B87333] bg-[#B87333] text-white font-medium rounded hover:bg-transparent hover:text-[#B87333] transition-colors"
                >
                  Browse Properties
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white font-medium rounded hover:bg-white hover:text-black transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section 
      className="relative h-[80vh] overflow-hidden"
      onMouseEnter={pauseAutoplay}
      onMouseLeave={resumeAutoplay}
    >
      <Carousel 
        className="h-full" 
        opts={{ loop: true }}
        setApi={(api) => {
          api?.on('select', () => {
            setActiveIndex(api.selectedScrollSnap());
          });
          
          // Initial position
          if (activeIndex > 0) {
            api?.scrollTo(activeIndex);
          }
        }}
      >
        <CarouselContent className="h-full">
          {properties.map((property) => (
            <CarouselItem key={property.id} className="h-full">
              <div className="relative h-full w-full">
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img 
                    src={property.images && property.images.length > 0 ? property.images[0] : "https://placehold.co/1200x800/222222/FFFFFF?text=The+Views+Real+Estate"} 
                    alt={property.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      console.error("Image failed to load:", target.src);
                      // Fallback to a placeholder if image fails to load
                      target.src = "https://placehold.co/1200x800/222222/FFFFFF?text=The+Views+Real+Estate";
                    }}
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
                </div>
                
                {/* Hero Content - Positioned at the bottom */}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent pt-16 pb-8">
                  <div className="container mx-auto px-4">
                    <div className="max-w-3xl text-white">
                      <div className="flex flex-wrap items-center justify-between mb-4">
                        <span className="inline-block px-3 py-1 mb-2 md:mb-0 bg-[#B87333] text-white text-sm rounded-full">
                          {property.propertyType} | {formatPrice(property.price)}
                        </span>
                        
                        <div className="flex flex-wrap gap-6">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#B87333] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
                          </div>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#B87333] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}</span>
                          </div>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#B87333] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                            <span>{(property.builtUpArea || property.squareFeet || 0).toLocaleString()} m²</span>
                          </div>
                        </div>
                      </div>
                      
                      <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-2">
                        {property.title}
                      </h1>
                      
                      <p className="text-lg opacity-90 mb-2">
                        {property.city}, {property.state}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        <Link
                          href={`/properties/${property.id}`}
                          className="inline-flex items-center justify-center px-6 py-3 border-2 border-[#B87333] bg-[#B87333] text-white font-medium rounded hover:bg-transparent hover:text-[#B87333] transition-colors"
                        >
                          View Details
                        </Link>
                        <Link
                          href="/properties"
                          className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white font-medium rounded hover:bg-white hover:text-black transition-colors"
                        >
                          Browse All
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Navigation Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex justify-center items-center space-x-2">
          {properties.map((_, index) => (
            <button
              key={index}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === activeIndex 
                  ? 'bg-[#B87333] scale-125' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              onClick={() => {
                setActiveIndex(index);
                setAutoplay(false);
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        <CarouselPrevious 
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 border-none text-white h-12 w-12" 
        />
        <CarouselNext 
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 border-none text-white h-12 w-12" 
        />
      </Carousel>
    </section>
  );
}