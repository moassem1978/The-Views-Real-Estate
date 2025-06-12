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
    queryKey: ['/api/properties/highlighted'],
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
                    {/* Property Image with ONLY type tag and title/location */}
                    <div className="relative aspect-[16/9] overflow-hidden rounded-lg shadow-lg">
                      <img 
                        src={(() => {
                          try {
                            const images = typeof property.images === 'string' 
                              ? JSON.parse(property.images) 
                              : property.images;
                            return Array.isArray(images) && images.length > 0 
                              ? images[0] 
                              : '/placeholder-property.svg';
                          } catch {
                            return '/placeholder-property.svg';
                          }
                        })()} 
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Type at top left - ONLY THIS TAG */}
                      <div className="absolute top-4 left-4">
                        <span className="bg-black/60 text-white text-xs px-2 py-1 rounded">
                          {property.propertyType}
                        </span>
                      </div>
                      
                      {/* ONLY title and location at bottom left */}
                      <div className="absolute bottom-4 left-4">
                        <h3 className="text-white text-xl font-serif">
                          {property.title}
                        </h3>
                        <p className="text-white/80 text-xs">
                          {property.city}
                        </p>
                      </div>
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