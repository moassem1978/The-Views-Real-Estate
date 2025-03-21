import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Property } from "@/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";

export default function HeroCarousel() {
  const { data: properties, isLoading, error } = useQuery<Property[]>({
    queryKey: ['/api/properties/featured'],
  });
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  
  // Autoplay functionality
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (autoplay && properties && properties.length > 0) {
      interval = setInterval(() => {
        setActiveIndex((current) => (current + 1) % properties.length);
      }, 5000); // Change slide every 5 seconds
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
      <section className="relative bg-gray-800 h-[70vh] overflow-hidden">
        <Skeleton className="absolute inset-0" />
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
          <div className="max-w-2xl">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-12 w-1/2 mb-6" />
            <Skeleton className="h-6 w-full max-w-xl mb-8" />
            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-12 w-40" />
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  if (error || !properties || properties.length === 0) {
    return (
      <section className="relative bg-gray-800 h-[70vh] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80" 
            alt="Luxury waterfront property" 
            className="w-full h-full object-cover opacity-80"
            loading="eager"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-800 via-gray-800/50 to-transparent"></div>
        
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
          <div className="max-w-2xl animate-in fade-in duration-700">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-white leading-tight">
              Discover Exceptional <span className="text-[#B87333]">Luxury Properties</span>
            </h1>
            <p className="mt-4 text-lg text-white/90 max-w-xl">
              Curated selection of the world's most extraordinary homes and estates, 
              tailored to the discerning tastes of our clientele.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/properties" className="px-6 py-3 bg-[#B87333] hover:bg-[#955A28] text-white font-medium rounded-md transition-colors shadow-lg transform hover:scale-[1.02] inline-flex items-center justify-center">
                Browse Properties
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="/services" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-md transition-colors backdrop-blur-sm inline-flex items-center justify-center">
                Our Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="relative bg-gray-800 h-[70vh] overflow-hidden"
      onMouseEnter={pauseAutoplay}
      onMouseLeave={resumeAutoplay}
    >
      <Carousel className="h-full" setApi={(api) => {
        // When the carousel is mounted, we can add event listeners
        api?.on('select', () => {
          setActiveIndex(api.selectedScrollSnap());
        });
      }}>
        <CarouselContent className="h-full">
          {properties.map((property, index) => (
            <CarouselItem key={property.id} className="h-full">
              <div className="relative h-full w-full">
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img 
                    src={property.images[0]} 
                    alt={property.title} 
                    className="w-full h-full object-cover opacity-80"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
                
                {/* Content */}
                <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
                  <div className="max-w-2xl animate-in fade-in duration-700">
                    <span className="inline-block px-3 py-1 bg-[#B87333] text-white text-sm rounded-full mb-4">
                      Featured Property
                    </span>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-white leading-tight">
                      {property.title}
                    </h1>
                    <p className="mt-2 text-xl text-white/90">
                      <span className="font-semibold">{formatPrice(property.price)}</span> • {property.city}, {property.state}
                    </p>
                    <p className="mt-4 text-white/80 max-w-xl line-clamp-2">
                      {property.description}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-4">
                      <div className="flex items-center text-white/90">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
                      </div>
                      <div className="flex items-center text-white/90">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}</span>
                      </div>
                      <div className="flex items-center text-white/90">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        <span>{property.squareFeet.toLocaleString()} sq ft</span>
                      </div>
                    </div>
                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                      <Link href={`/properties/${property.id}`} className="px-6 py-3 bg-[#B87333] hover:bg-[#955A28] text-white font-medium rounded-md transition-colors shadow-lg transform hover:scale-[1.02] inline-flex items-center justify-center">
                        View Details
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </Link>
                      <Link href="/properties" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-md transition-colors backdrop-blur-sm inline-flex items-center justify-center">
                        All Properties
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Navigation Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex items-center space-x-2">
          {properties.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === activeIndex 
                  ? 'bg-[#B87333] w-10' 
                  : 'bg-white/40 hover:bg-white/60'
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
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 border-none text-white h-10 w-10" 
        />
        <CarouselNext 
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 border-none text-white h-10 w-10" 
        />
      </Carousel>
    </section>
  );
}