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

// Default placeholder image for announcements without images
const DEFAULT_ANNOUNCEMENT_IMAGE = "/uploads/default-announcement.svg";

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
                          <div className="w-full md:w-1/2">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="inline-block px-3 py-1 bg-[#B87333] text-white text-sm rounded-full">
                                Featured
                              </span>
                              <span className="text-black font-medium">
                                {formatPrice(property.price)}
                              </span>
                            </div>
                            
                            <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-2">
                              {property.title}
                            </h3>
                            
                            <p className="text-[#B87333] font-medium mb-2">
                              {property.city}, {property.state}
                            </p>
                            
                            <p className="text-gray-700 mb-4 line-clamp-3">
                              {property.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-6 mb-4">
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
                                <span>{(property.builtUpArea || property.squareFeet || 0).toLocaleString()} sq ft</span>
                              </div>
                            </div>
                            
                            <Link 
                              href={`/properties/${property.id}`}
                              className="inline-block px-5 py-2.5 bg-[#B87333] text-white font-medium rounded hover:bg-[#955A28] transition-colors"
                            >
                              View Property
                            </Link>
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
                              src={announcement.imageUrl || DEFAULT_ANNOUNCEMENT_IMAGE} 
                              alt={announcement.title}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                          </div>
                          
                          {/* Right - Content */}
                          <div className="w-full md:w-1/2 flex flex-col">
                            <div className="flex items-center mb-3">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#B87333] text-white">
                                Announcement
                              </span>
                              <span className="ml-3 text-sm text-gray-500">
                                {formatDate(announcement.startDate)}
                              </span>
                            </div>
                            
                            <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-3">
                              {announcement.title}
                            </h3>
                            
                            <p className="text-gray-700 mb-5 line-clamp-4">
                              {announcement.content}
                            </p>
                            
                            <div className="mt-auto">
                              <span className="inline-flex items-center text-sm font-medium text-[#B87333]">
                                Read More
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className="ml-1 h-4 w-4" 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M14 5l7 7m0 0l-7 7m7-7H3" 
                                  />
                                </svg>
                              </span>
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