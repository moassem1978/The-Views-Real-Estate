import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Property, Announcement } from "@/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { formatDate, formatPrice, getImageUrl } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";



export default function NewsCarousel() {
  const { data: properties, isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties/featured'],
  });
  
  const { data: announcements, isLoading: announcementsLoading } = useQuery<Announcement[]>({
    queryKey: ['/api/announcements'],
  });
  
  const [activeAnnouncementIndex, setActiveAnnouncementIndex] = useState(0);
  const [activePropertyIndex, setActivePropertyIndex] = useState(0);
  const [autoplayAnnouncements, setAutoplayAnnouncements] = useState(true);
  const [autoplayProperties, setAutoplayProperties] = useState(true);
  
  // Autoplay functionality for announcements
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (autoplayAnnouncements && announcements && announcements.length > 0) {
      interval = setInterval(() => {
        setActiveAnnouncementIndex((current) => (current + 1) % announcements.length);
      }, 8000); // Change announcement every 8 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoplayAnnouncements, announcements?.length]);
  
  // Autoplay functionality for properties
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (autoplayProperties && properties && properties.length > 0) {
      interval = setInterval(() => {
        setActivePropertyIndex((current) => (current + 1) % properties.length);
      }, 6000); // Change property every 6 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoplayProperties, properties]);
  
  // Pause autoplay on hover
  const pauseAnnouncementsAutoplay = () => setAutoplayAnnouncements(false);
  const resumeAnnouncementsAutoplay = () => setAutoplayAnnouncements(true);
  const pausePropertiesAutoplay = () => setAutoplayProperties(false);
  const resumePropertiesAutoplay = () => setAutoplayProperties(true);

  // Skip rendering if there's nothing to show
  if (propertiesLoading && announcementsLoading) {
    return (
      <section className="py-8 bg-[#F9F6F2] border-b border-[#E8DACB]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-serif font-semibold">
              <span className="text-[#B87333]">The Views</span> Updates
            </h2>
          </div>
          <div className="py-10">
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-8 bg-[#F9F6F2] border-b border-[#E8DACB]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-serif font-semibold">
            <span className="text-[#B87333]">The Views</span> Updates
          </h2>
        </div>
        
        <Tabs defaultValue="featured" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto mb-8 grid-cols-2">
            <TabsTrigger value="featured" className="text-sm md:text-base">Featured Properties</TabsTrigger>
            <TabsTrigger value="announcements" className="text-sm md:text-base">Announcements</TabsTrigger>
          </TabsList>
          
          {/* Featured Properties Tab */}
          <TabsContent value="featured">
            {propertiesLoading ? (
              <div className="flex flex-col md:flex-row items-center gap-8 py-2">
                <Skeleton className="w-full md:w-1/2 aspect-video rounded-lg" />
                <div className="w-full md:w-1/2 space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-12 w-40" />
                </div>
              </div>
            ) : properties && properties.length > 0 ? (
              <div
                className="relative"
                onMouseEnter={pausePropertiesAutoplay}
                onMouseLeave={resumePropertiesAutoplay}
              >
                <Carousel 
                  opts={{ loop: true }} 
                  className="w-full"
                  setApi={(api) => {
                    api?.on('select', () => {
                      setActivePropertyIndex(api.selectedScrollSnap());
                    });
                    
                    // Initial position
                    if (activePropertyIndex > 0) {
                      api?.scrollTo(activePropertyIndex);
                    }
                  }}
                >
                  <CarouselContent>
                    {properties.map((property, index) => (
                      <CarouselItem key={property.id}>
                        <div className="flex flex-col md:flex-row items-center gap-8 py-4">
                          {/* Left - Property Image */}
                          <div className="w-full md:w-1/2 aspect-video rounded-lg overflow-hidden shadow-lg">
                            <img 
                              src={property.images[0]} 
                              alt={property.title}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                          </div>
                          
                          {/* Right - Property Details */}
                          <div className="w-full md:w-1/2 relative">
                            {/* Type at top left */}
                            <div className="absolute top-0 left-0">
                              <span className="inline-block px-2 py-1 bg-black/60 text-white text-xs rounded-full">
                                {property.propertyType}
                              </span>
                            </div>
                            
                            {/* Content positioned at bottom */}
                            <div className="absolute bottom-0 left-0">
                              <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-1">
                                {property.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-4">
                                {property.city}
                              </p>
                            </div>
                            
                            {/* Button at the right bottom */}
                            <div className="absolute bottom-0 right-0">
                              <Link 
                                href={`/properties/${property.id}`}
                                className="inline-block px-4 py-2 bg-[#B87333] text-white font-medium rounded hover:bg-[#955A28] transition-colors"
                              >
                                View
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  
                  {/* Property Indicators */}
                  {properties && properties.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center space-x-1">
                      {properties.map((_, index) => (
                        <button
                          key={index}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === activePropertyIndex 
                              ? 'bg-[#B87333] w-4' 
                              : 'bg-gray-300'
                          }`}
                          onClick={() => {
                            setActivePropertyIndex(index);
                            setAutoplayProperties(false);
                          }}
                          aria-label={`Go to property ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                  
                  <CarouselPrevious 
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-none text-[#B87333] h-10 w-10 md:h-12 md:w-12" 
                  />
                  <CarouselNext 
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-none text-[#B87333] h-10 w-10 md:h-12 md:w-12" 
                  />
                </Carousel>
              </div>
            ) : (
              <div className="text-center py-8">
                <p>No featured properties available at this time.</p>
              </div>
            )}
          </TabsContent>
          
          {/* Announcements Tab */}
          <TabsContent value="announcements">
            {announcementsLoading ? (
              <div className="flex flex-col md:flex-row items-center gap-8 py-2">
                <Skeleton className="w-full md:w-1/2 aspect-video rounded-lg" />
                <div className="w-full md:w-1/2 space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-12 w-40" />
                </div>
              </div>
            ) : announcements && announcements.length > 0 ? (
              <div
                className="relative"
                onMouseEnter={pauseAnnouncementsAutoplay}
                onMouseLeave={resumeAnnouncementsAutoplay}
              >
                <Carousel 
                  opts={{ loop: true }} 
                  className="w-full"
                  setApi={(api) => {
                    api?.on('select', () => {
                      setActiveAnnouncementIndex(api.selectedScrollSnap());
                    });
                    
                    // Initial position
                    if (activeAnnouncementIndex > 0) {
                      api?.scrollTo(activeAnnouncementIndex);
                    }
                  }}
                >
                  <CarouselContent>
                    {announcements.map((announcement, index) => (
                      <CarouselItem key={announcement.id}>
                        <div className="flex flex-col md:flex-row items-center justify-between py-4 gap-6">
                          {/* Left - Image */}
                          <div className="w-full md:w-1/2 aspect-video rounded-lg overflow-hidden shadow-lg">
                            <img 
                              src={getImageUrl(announcement.imageUrl)} 
                              alt={announcement.title}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                          </div>
                          
                          {/* Right - Content */}
                          <div className="w-full md:w-1/2 relative">
                            {/* Type at top left */}
                            <div className="absolute top-0 left-0">
                              <span className="inline-block px-2 py-1 bg-black/60 text-white text-xs rounded-full">
                                Announcement
                              </span>
                            </div>
                            
                            {/* Content positioned at bottom */}
                            <div className="absolute bottom-0 left-0">
                              <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-1">
                                {announcement.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-4">
                                {formatDate(announcement.startDate)}
                              </p>
                            </div>
                            
                            {/* Button at the right bottom */}
                            <div className="absolute bottom-0 right-0">
                              <Link 
                                href={`/announcements/${announcement.id}`}
                                className="inline-block px-4 py-2 bg-[#B87333] text-white font-medium rounded hover:bg-[#955A28] transition-colors"
                              >
                                Read
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  
                  {/* Announcement Indicators */}
                  {announcements.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center space-x-1">
                      {announcements.map((_, index) => (
                        <button
                          key={index}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === activeAnnouncementIndex 
                              ? 'bg-[#B87333] w-4' 
                              : 'bg-gray-300'
                          }`}
                          onClick={() => {
                            setActiveAnnouncementIndex(index);
                            setAutoplayAnnouncements(false);
                          }}
                          aria-label={`Go to announcement ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                  
                  <CarouselPrevious 
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-none text-[#B87333] h-10 w-10 md:h-12 md:w-12" 
                  />
                  <CarouselNext 
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-none text-[#B87333] h-10 w-10 md:h-12 md:w-12" 
                  />
                </Carousel>
              </div>
            ) : (
              <div className="text-center py-8">
                <p>No announcements available at this time.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}