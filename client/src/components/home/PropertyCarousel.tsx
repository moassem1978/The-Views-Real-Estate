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

export default function PropertyCarousel() {
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
      <section className="py-16 bg-[#F9F6F2]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto" />
          </div>
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-[400px] w-full rounded-lg mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-7 w-3/4 mx-auto" />
              <Skeleton className="h-5 w-1/2 mx-auto" />
              <Skeleton className="h-24 w-full mx-auto" />
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  if (error || !properties || properties.length === 0) {
    return (
      <section className="py-16 bg-[#F9F6F2]">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-serif font-semibold text-gray-800">Featured Properties</h2>
            <p className="mt-4 text-gray-500">
              Sorry, we couldn't load the featured properties at this time. Please check back later.
            </p>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section 
      className="py-16 bg-[#F9F6F2]"
      onMouseEnter={pauseAutoplay}
      onMouseLeave={resumeAutoplay}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-gray-900">
            Featured <span className="text-[#B87333]">Properties</span>
          </h2>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <Carousel 
            className="w-full" 
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
            <CarouselContent>
              {properties.map((property) => (
                <CarouselItem key={property.id}>
                  <div className="flex flex-col">
                    {/* Property Image */}
                    <div className="relative aspect-[16/9] overflow-hidden rounded-lg shadow-lg">
                      <img 
                        src={property.images[0]} 
                        alt={property.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="inline-block px-3 py-1 bg-[#B87333] text-white text-sm rounded-full">
                          {property.propertyType}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="inline-block px-3 py-1 bg-black/70 text-white text-sm rounded-full">
                          {property.price.toLocaleString()} L.E
                        </span>
                      </div>
                    </div>
                    
                    {/* Property Details */}
                    <div className="mt-6 text-center">
                      <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-2">
                        {property.title}
                      </h3>
                      <p className="text-[#B87333] font-medium mb-3">
                        {property.city}, {property.state}
                      </p>
                      <p className="text-gray-700 mb-5 line-clamp-3">
                        {property.description}
                      </p>
                      
                      <div className="flex justify-center items-center gap-6 mb-6">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#B87333] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
                        </div>
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#B87333] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
                        </div>
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#B87333] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                          <span>{property.squareFeet ? property.squareFeet.toLocaleString() : '0'} m²</span>
                        </div>
                      </div>
                      
                      <Link 
                        href={`/properties/${property.id}`}
                        className="inline-block px-6 py-3 bg-[#B87333] text-white font-medium rounded hover:bg-[#955A28] transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Navigation Controls */}
            <div className="absolute bottom-0 left-0 right-0 py-4 bg-gradient-to-t from-[#F9F6F2] to-transparent">
              <div className="flex justify-center items-center space-x-2">
                {properties.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      index === activeIndex 
                        ? 'bg-[#B87333] scale-125' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    onClick={() => {
                      setActiveIndex(index);
                      setAutoplay(false);
                    }}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
            
            <CarouselPrevious 
              className="absolute left-4 top-[calc(50%-4rem)] -translate-y-1/2 bg-black/30 hover:bg-black/50 border-none text-white h-10 w-10" 
            />
            <CarouselNext 
              className="absolute right-4 top-[calc(50%-4rem)] -translate-y-1/2 bg-black/30 hover:bg-black/50 border-none text-white h-10 w-10" 
            />
          </Carousel>
        </div>
      </div>
    </section>
  );
}