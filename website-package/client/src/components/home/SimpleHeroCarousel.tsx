import { useState, useEffect, memo, useCallback } from "react";
import { Link } from "wouter";
import { Property, Announcement } from "@/types";
import { formatPrice, formatDate, getResizedImageUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

// Define a union type for our carousel items
type SlideItem = {
  id: number;
  type: 'property' | 'announcement';
  data: Property | Announcement;
};

// Memoized carousel item components to prevent unnecessary re-renders
const PropertySlide = memo(({ property, onClick }: { property: Property, onClick: () => void }) => (
  <Link href={`/properties/${property.id}`}>
    <div className="block h-full cursor-pointer" onClick={onClick}>
      <img 
        src={property.images && property.images.length > 0 
          ? getResizedImageUrl(property.images[0], 'large') 
          : "/default-property.svg"} 
        alt={property.title}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "/default-property.svg";
        }}
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
    </div>
  </Link>
));

const AnnouncementSlide = memo(({ announcement, onClick }: { announcement: Announcement, onClick: () => void }) => (
  <Link href={`/announcements/${announcement.id}`}>
    <div className="block h-full cursor-pointer" onClick={onClick}>
      <img 
        src={getResizedImageUrl(announcement.imageUrl, 'large') || "/default-announcement.svg"} 
        alt={announcement.title}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "/default-announcement.svg";
        }}
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
    </div>
  </Link>
));

// Memoized navigation button component
const NavButton = memo(({ direction, onClick }: { direction: 'prev' | 'next', onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`absolute ${direction === 'prev' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 bg-[#964B00]/80 hover:bg-[#964B00] border-none text-white h-10 w-10 rounded-full flex items-center justify-center z-20`}
    aria-label={direction === 'prev' ? "Previous slide" : "Next slide"}
  >
    {direction === 'prev' ? (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
      </svg>
    ) : (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.1584 3.13514C5.95694 3.32401 5.94673 3.64042 6.13559 3.84188L9.565 7.49991L6.13559 11.1579C5.94673 11.3594 5.95694 11.6758 6.1584 11.8647C6.35986 12.0535 6.67627 12.0433 6.86514 11.8419L10.6151 7.84188C10.7954 7.64955 10.7954 7.35027 10.6151 7.15794L6.86514 3.15794C6.67627 2.95648 6.35986 2.94628 6.1584 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
      </svg>
    )}
  </button>
));

// Main carousel component
export default function SimpleHeroCarousel() {
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Use React Query for data fetching with better caching
  const { data: propertiesData = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties/highlighted'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const { data: announcementsData = [], isLoading: announcementsLoading } = useQuery<Announcement[]>({
    queryKey: ['/api/announcements/highlighted'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Define loading state from both data sources
  const isLoading = propertiesLoading || announcementsLoading;
  
  // Convert fetched data to slide items - optimized to prevent infinite loop
  useEffect(() => {
    // Wait until we have data from at least one source and are not loading
    if ((propertiesData.length === 0 && announcementsData.length === 0) || propertiesLoading || announcementsLoading) {
      return;
    }
    
    // Process properties and create a stable slides array
    const combinedSlides = [
      // Process properties
      ...propertiesData.map(property => ({
        id: property.id,
        type: 'property' as const,
        data: property
      })),
      
      // Process announcements
      ...announcementsData.map(announcement => ({
        id: announcement.id,
        type: 'announcement' as const,
        data: announcement
      }))
    ];
    
    // Compare with current slides to prevent unnecessary updates
    if (combinedSlides.length > 0 && 
        (slides.length !== combinedSlides.length || 
         JSON.stringify(slides.map(s => s.id)) !== JSON.stringify(combinedSlides.map(s => s.id)))) {
      setSlides(combinedSlides);
      // Reset active index when slides change
      setActiveIndex(0);
    }
  }, [propertiesData, announcementsData, propertiesLoading, announcementsLoading, slides.length]);
  
  // Memoized navigation functions to prevent recreating on every render
  const goToPrevSlide = useCallback(() => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  }, [slides.length]);
  
  const goToNextSlide = useCallback(() => {
    setActiveIndex((current) => (current + 1) % slides.length);
  }, [slides.length]);
  
  // Simple autoplay with debounce
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
              <PropertySlide 
                property={activeSlide.data as Property} 
                onClick={() => {}} 
              />
            ) : (
              <AnnouncementSlide 
                announcement={activeSlide.data as Announcement} 
                onClick={() => {}} 
              />
            )}
          </div>
          
          {/* Content and Type Tag */}
          {activeSlide.type === 'property' ? (
            <>
              {/* Type tag at top right - bronze color */}
              <div className="absolute top-4 right-4">
                <span className="bg-[#B87333] text-white text-xs px-2 py-1 rounded">
                  {(activeSlide.data as Property).listingType || "Property"}
                </span>
              </div>
              
              {/* Content with Title, Location, and View Button */}
              <div className="absolute bottom-12 left-4 z-10 max-w-md">
                <Link href={`/properties/${(activeSlide.data as Property).id}`}>
                  <h3 className="text-white text-2xl md:text-3xl font-serif mb-1 cursor-pointer hover:text-[#B87333] transition-colors">
                    {(activeSlide.data as Property).title}
                  </h3>
                </Link>
                <p className="text-white/80 text-sm mb-4">
                  {(activeSlide.data as Property).city}
                </p>
                <Link
                  href={`/properties/${(activeSlide.data as Property).id}`}
                >
                  <Button 
                    className="bg-[#B87333] hover:bg-[#964B00] text-white"
                  >
                    View Property <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Type tag at top right - bronze color */}
              <div className="absolute top-4 right-4">
                <span className="bg-[#B87333] text-white text-xs px-2 py-1 rounded">
                  Announcement
                </span>
              </div>
              
              {/* Content with Title, Date, and Read More Button */}
              <div className="absolute bottom-12 left-4 z-10 max-w-md">
                <Link href={`/announcements/${(activeSlide.data as Announcement).id}`}>
                  <h3 className="text-white text-2xl md:text-3xl font-serif mb-1 cursor-pointer hover:text-[#B87333] transition-colors">
                    {(activeSlide.data as Announcement).title}
                  </h3>
                </Link>
                <p className="text-white/80 text-sm mb-4">
                  {formatDate((activeSlide.data as Announcement).startDate)}
                </p>
                <Link
                  href={`/announcements/${(activeSlide.data as Announcement).id}`}
                >
                  <Button 
                    className="bg-[#B87333] hover:bg-[#964B00] text-white"
                  >
                    Read More <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Simple navigation controls - moved lower to avoid overlapping with titles */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex justify-center items-center space-x-2">
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
      
      {/* Navigation buttons using memoized functions */}
      <NavButton direction="prev" onClick={goToPrevSlide} />
      <NavButton direction="next" onClick={goToNextSlide} />
    </section>
  );
}