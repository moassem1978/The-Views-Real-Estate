import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Property, Announcement } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// Define a union type for our carousel items
type SlideItem = {
  id: number;
  type: 'property' | 'announcement';
  data: Property | Announcement;
};

export default function SimpleHeroCarousel() {
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // One-time data fetching for a lighter-weight implementation
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch properties and announcements in parallel
        const [propertiesResponse, announcementsResponse] = await Promise.all([
          fetch('/api/properties/highlighted'),
          fetch('/api/announcements/highlighted')
        ]);
        
        // Handle property response
        let properties: Property[] = [];
        if (propertiesResponse.ok) {
          properties = await propertiesResponse.json();
          console.log(`Found ${properties.length} highlighted properties`);
        }
        
        // Handle announcement response
        let announcements: Announcement[] = [];
        if (announcementsResponse.ok) {
          announcements = await announcementsResponse.json();
          console.log(`Found ${announcements.length} highlighted announcements`);
        }
        
        // Convert to slide items and combine
        const propertySlides = properties.map(property => ({
          id: property.id,
          type: 'property' as const,
          data: property
        }));
        
        const announcementSlides = announcements.map(announcement => ({
          id: announcement.id,
          type: 'announcement' as const,
          data: announcement
        }));
        
        // Merge both types of slides
        const combinedSlides = [...propertySlides, ...announcementSlides];
        console.log(`Combined slides: ${combinedSlides.length}`);
        
        setSlides(combinedSlides);
      } catch (error) {
        console.error("Error fetching carousel data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Simple autoplay
  useEffect(() => {
    if (slides.length === 0) return;
    
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [slides.length]);

  if (isLoading) {
    return (
      <section className="relative h-[80vh] bg-gray-900 overflow-hidden">
        <Skeleton className="absolute inset-0" />
      </section>
    );
  }
  
  if (slides.length === 0) {
    return (
      <section className="relative h-[80vh] bg-gray-900">
        {/* Default background */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-black/70" />
        
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
  
  // Manual carousel implementation
  const activeSlide = slides[activeIndex];
  
  return (
    <section className="relative h-[80vh] overflow-hidden">
      <div className="h-full">
        <div className="relative h-full w-full">
          {/* Background Image */}
          <div className="absolute inset-0">
            {activeSlide.type === 'property' ? (
              <img 
                src={(activeSlide.data as Property).images && (activeSlide.data as Property).images.length > 0 
                  ? (activeSlide.data as Property).images[0] 
                  : "/default-property.svg"} 
                alt={(activeSlide.data as Property).title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/default-property.svg";
                }}
              />
            ) : (
              <img 
                src={(activeSlide.data as Announcement).imageUrl || "/default-announcement.svg"} 
                alt={(activeSlide.data as Announcement).title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/default-announcement.svg";
                }}
              />
            )}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          </div>
          
          {/* Hero Content */}
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent pt-16 pb-8">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl text-white">
                {activeSlide.type === 'property' ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between mb-4">
                      <Badge variant="secondary" className="bg-[#B87333] text-white text-sm mb-2 md:mb-0">
                        {(activeSlide.data as Property).propertyType} | {formatPrice((activeSlide.data as Property).price)}
                      </Badge>
                      
                      <div className="flex flex-wrap gap-6">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#B87333] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          <span>{(activeSlide.data as Property).bedrooms} {(activeSlide.data as Property).bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
                        </div>
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#B87333] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{(activeSlide.data as Property).bathrooms} {(activeSlide.data as Property).bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}</span>
                        </div>
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#B87333] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                          <span>{((activeSlide.data as Property).builtUpArea || 0).toLocaleString()} m²</span>
                        </div>
                      </div>
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-2">
                      {(activeSlide.data as Property).title}
                    </h1>
                    
                    <p className="text-lg opacity-90 mb-4">
                      {(activeSlide.data as Property).city}, {(activeSlide.data as Property).state}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 mt-6">
                      <Link
                        href={`/properties/${(activeSlide.data as Property).id}`}
                        className="inline-flex items-center justify-center px-6 py-3 border-2 border-[#B87333] bg-[#B87333] text-white font-medium rounded hover:bg-transparent hover:text-[#B87333] transition-colors"
                      >
                        View Details
                      </Link>
                      <Link
                        href="/properties"
                        className="inline-flex items-center justify-center px-5 py-3 border-2 border-[#B87333] text-[#B87333] font-medium rounded hover:bg-[#B87333] hover:text-white transition-colors text-sm"
                      >
                        All Properties
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center justify-between mb-4">
                      <Badge variant="secondary" className="bg-[#B87333] text-white text-sm mb-2 md:mb-0">
                        Announcement
                      </Badge>
                      
                      <div className="text-sm opacity-80">
                        {formatDate((activeSlide.data as Announcement).startDate)}
                      </div>
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
                      {(activeSlide.data as Announcement).title}
                    </h1>
                    
                    <p className="text-lg opacity-90 mb-6 line-clamp-3">
                      {(activeSlide.data as Announcement).content}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 mt-6">
                      <Link
                        href={`/announcements/${(activeSlide.data as Announcement).id}`}
                        className="inline-flex items-center justify-center px-6 py-3 border-2 border-[#B87333] bg-[#B87333] text-white font-medium rounded hover:bg-transparent hover:text-[#B87333] transition-colors"
                      >
                        Read More
                      </Link>
                      <Link
                        href="/announcements"
                        className="inline-flex items-center justify-center px-6 py-3 border-2 border-[#B87333] text-[#B87333] font-medium rounded hover:bg-[#B87333] hover:text-white transition-colors"
                      >
                        View All
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Simple navigation controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex justify-center items-center space-x-2">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === activeIndex 
                ? 'bg-[#B87333] scale-125' 
                : 'bg-white/50 hover:bg-white/80'
            }`}
            onClick={() => setActiveIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
      
      {/* Navigation buttons */}
      <button 
        onClick={() => setActiveIndex((current) => (current - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-[#964B00]/80 hover:bg-[#964B00] border-none text-white h-10 w-10 rounded-full flex items-center justify-center"
        aria-label="Previous slide"
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
        </svg>
      </button>
      <button 
        onClick={() => setActiveIndex((current) => (current + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#964B00]/80 hover:bg-[#964B00] border-none text-white h-10 w-10 rounded-full flex items-center justify-center"
        aria-label="Next slide"
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.1584 3.13514C5.95694 3.32401 5.94673 3.64042 6.13559 3.84188L9.565 7.49991L6.13559 11.1579C5.94673 11.3594 5.95694 11.6758 6.1584 11.8647C6.35986 12.0535 6.67627 12.0433 6.86514 11.8419L10.6151 7.84188C10.7954 7.64955 10.7954 7.35027 10.6151 7.15794L6.86514 3.15794C6.67627 2.95648 6.35986 2.94628 6.1584 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
        </svg>
      </button>
    </section>
  );
}