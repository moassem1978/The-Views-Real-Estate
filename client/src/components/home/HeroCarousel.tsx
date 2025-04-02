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

export default function HeroCarousel() {
  // Simplified state management - only maintain a single array of slides
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  
  // Single data fetching function that gets both types of data and combines them
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        console.log("Fetching carousel data...");
        
        // Fetch properties and announcements in parallel
        const [propertiesResponse, announcementsResponse] = await Promise.all([
          fetch('/api/properties/highlighted', { headers: { 'Cache-Control': 'no-cache' } }),
          fetch('/api/announcements/highlighted', { headers: { 'Cache-Control': 'no-cache' } })
        ]);
        
        // Handle property response
        let properties: Property[] = [];
        if (propertiesResponse.ok) {
          properties = await propertiesResponse.json();
          console.log(`Found ${properties.length} highlighted properties`);
        } else {
          console.error("Failed to fetch properties:", propertiesResponse.status);
        }
        
        // Handle announcement response
        let announcements: Announcement[] = [];
        if (announcementsResponse.ok) {
          announcements = await announcementsResponse.json();
          console.log(`Found ${announcements.length} highlighted announcements`);
        } else {
          console.error("Failed to fetch announcements:", announcementsResponse.status);
        }
        
        // Convert to slide items and combine
        const propertySlides: SlideItem[] = properties.map(property => ({
          id: property.id,
          type: 'property',
          data: property
        }));
        
        const announcementSlides: SlideItem[] = announcements.map(announcement => ({
          id: announcement.id,
          type: 'announcement',
          data: announcement
        }));
        
        // Merge both types of slides
        const combinedSlides = [...propertySlides, ...announcementSlides];
        console.log(`Combined slides: ${combinedSlides.length}`);
        
        // Set the slides in state
        setSlides(combinedSlides);
      } catch (error) {
        console.error("Error fetching carousel data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    // Initial fetch
    fetchData();
    
    // Refresh data every 30 seconds (reduced from 5s to save resources)
    const intervalId = setInterval(fetchData, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Autoplay functionality with reduced timer frequency
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (autoplay && slides.length > 0) {
      interval = setInterval(() => {
        setActiveIndex((current) => (current + 1) % slides.length);
      }, 8000); // Increased to 8 seconds to reduce resource usage
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoplay, slides.length]);
  
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
  
  if (slides.length === 0) {
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
  
  // Render the carousel with all slides
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
          {slides.map((item, index) => (
            <CarouselItem key={`${item.type}-${item.id}`} className="h-full">
              <div className="relative h-full w-full">
                {/* Background Image - different rendering based on item type */}
                <div className="absolute inset-0">
                  {item.type === 'property' ? (
                    <img 
                      src={(item.data as Property).images && (item.data as Property).images.length > 0 
                        ? (item.data as Property).images[0] 
                        : "/default-property.svg"} 
                      alt={(item.data as Property).title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.error("Image failed to load:", target.src);
                        target.src = "/default-property.svg";
                      }}
                    />
                  ) : (
                    <img 
                      src={(item.data as Announcement).imageUrl || "/default-announcement.svg"} 
                      alt={(item.data as Announcement).title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.error("Image failed to load:", target.src);
                        target.src = "/default-announcement.svg";
                      }}
                    />
                  )}
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
                </div>
                
                {/* Only title at bottom left */}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent pt-8 pb-6">
                  <div className="container mx-auto px-6">
                    <div className="text-white">
                      {/* Just the title - no description, no price */}
                      {item.type === 'property' ? (
                        <h1 className="text-2xl md:text-3xl font-serif font-bold">
                          {(item.data as Property).title}
                        </h1>
                      ) : (
                        <h1 className="text-2xl md:text-3xl font-serif font-bold">
                          {(item.data as Announcement).title}
                        </h1>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Type of listing at top left only - small font */}
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-black/60 text-white text-xs px-2 py-1">
                    {item.type === 'property' 
                      ? (item.data as Property).propertyType
                      : 'Announcement'
                    }
                  </Badge>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Navigation Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex justify-center items-center space-x-2">
          {slides.map((_, index) => (
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
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-[#964B00]/80 hover:bg-[#964B00] border-none text-white h-10 w-10"
        />
        <CarouselNext 
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#964B00]/80 hover:bg-[#964B00] border-none text-white h-10 w-10"
        />
      </Carousel>
    </section>
  );
}