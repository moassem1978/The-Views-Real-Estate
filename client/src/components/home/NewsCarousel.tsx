import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { formatDate, formatPrice } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// Define news/announcement item structure
interface NewsItem {
  id: number;
  title: string;
  date: string;
  description: string;
  image: string;
  link?: string;
  tag: 'news' | 'announcement' | 'event';
}

// Sample news data - In a real application, this would come from an API
const sampleNews: NewsItem[] = [
  {
    id: 1,
    title: "The Views Real Estate Launches Exclusive Beachfront Collection",
    date: "2025-03-15",
    description: "Discover our newest collection of luxury beachfront properties with exclusive access to private beaches and panoramic ocean views.",
    image: "https://images.unsplash.com/photo-1545566239-0d773a881c74?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    link: "/properties?tag=beachfront",
    tag: 'announcement'
  },
  {
    id: 2,
    title: "Luxury Property Market Report for Q1 2025 Now Available",
    date: "2025-03-10",
    description: "Our comprehensive analysis of the luxury property market trends, investment opportunities, and forecasts for the upcoming year.",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    link: "/market-report",
    tag: 'news'
  },
  {
    id: 3,
    title: "Spring Showcase: Luxury Villa Open House Weekend",
    date: "2025-04-05",
    description: "Join us for a special open house weekend showcasing our most luxurious villa properties with complimentary champagne and gourmet catering.",
    image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    link: "/events/spring-showcase",
    tag: 'event'
  }
];

export default function NewsCarousel() {
  const { data: properties, isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties/featured'],
  });
  
  const [news] = useState<NewsItem[]>(sampleNews);
  const [activeNewsIndex, setActiveNewsIndex] = useState(0);
  const [activePropertyIndex, setActivePropertyIndex] = useState(0);
  const [autoplayNews, setAutoplayNews] = useState(true);
  const [autoplayProperties, setAutoplayProperties] = useState(true);
  
  // Autoplay functionality for news
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (autoplayNews && news.length > 0) {
      interval = setInterval(() => {
        setActiveNewsIndex((current) => (current + 1) % news.length);
      }, 8000); // Change news item every 8 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoplayNews, news.length]);
  
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
  const pauseNewsAutoplay = () => setAutoplayNews(false);
  const resumeNewsAutoplay = () => setAutoplayNews(true);
  const pausePropertiesAutoplay = () => setAutoplayProperties(false);
  const resumePropertiesAutoplay = () => setAutoplayProperties(true);

  if (!news || news.length === 0) {
    return null;
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
            <div
              className="relative"
              onMouseEnter={pauseNewsAutoplay}
              onMouseLeave={resumeNewsAutoplay}
            >
              <Carousel 
                opts={{ loop: true }} 
                className="w-full"
                setApi={(api) => {
                  api?.on('select', () => {
                    setActiveNewsIndex(api.selectedScrollSnap());
                  });
                  
                  // Initial position
                  if (activeNewsIndex > 0) {
                    api?.scrollTo(activeNewsIndex);
                  }
                }}
              >
                <CarouselContent>
                  {news.map((item, index) => (
                    <CarouselItem key={item.id}>
                      <Link 
                        href={item.link || "#"} 
                        className="block w-full hover:opacity-95 transition-opacity"
                      >
                        <div className="flex flex-col md:flex-row items-center justify-between py-4 gap-6">
                          {/* Left - Image */}
                          <div className="w-full md:w-1/2 aspect-video rounded-lg overflow-hidden shadow-lg">
                            <img 
                              src={item.image} 
                              alt={item.title}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                          </div>
                          
                          {/* Right - Content */}
                          <div className="w-full md:w-1/2 flex flex-col">
                            <div className="flex items-center mb-3">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                item.tag === 'news' 
                                  ? 'bg-black text-[#F9F6F2]' 
                                  : item.tag === 'announcement' 
                                    ? 'bg-[#B87333] text-white' 
                                    : 'bg-[#F1E5CC] text-black'
                              }`}>
                                {item.tag === 'news' 
                                  ? 'News' 
                                  : item.tag === 'announcement' 
                                    ? 'Announcement' 
                                    : 'Event'}
                              </span>
                              <span className="ml-3 text-sm text-gray-500">
                                {formatDate(item.date)}
                              </span>
                            </div>
                            
                            <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-3">
                              {item.title}
                            </h3>
                            
                            <p className="text-gray-700 mb-5">
                              {item.description}
                            </p>
                            
                            <div className="mt-auto">
                              <span className="inline-flex items-center text-sm font-medium text-[#B87333]">
                                Learn More
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
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                
                {/* News Indicators */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center space-x-1">
                  {news.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === activeNewsIndex 
                          ? 'bg-[#B87333] w-4' 
                          : 'bg-gray-300'
                      }`}
                      onClick={() => {
                        setActiveNewsIndex(index);
                        setAutoplayNews(false);
                      }}
                      aria-label={`Go to announcement ${index + 1}`}
                    />
                  ))}
                </div>
                
                <CarouselPrevious 
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-none text-[#B87333] h-10 w-10 md:h-12 md:w-12" 
                />
                <CarouselNext 
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-none text-[#B87333] h-10 w-10 md:h-12 md:w-12" 
                />
              </Carousel>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}